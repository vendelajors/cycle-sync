/**
 * Ultrahuman API Data Parser
 * Extracts key health metrics from the daily_metrics endpoint response
 */

const UH_API_URL = 'https://partner.ultrahuman.com/api/v1/partner/daily_metrics'

/**
 * Fetch daily metrics from Ultrahuman API
 * @param {string} token - Personal API token
 * @param {string} date - YYYY-MM-DD format
 * @returns {Promise<object>} Parsed metrics
 */
export async function fetchUltrahumanData(token, date) {
  const url = `${UH_API_URL}?date=${date}`
  const res = await fetch(url, {
    headers: { 'Authorization': token },
  })
  const json = await res.json()
  if (json.error || json.status !== 200) {
    throw new Error(json.error || 'Failed to fetch Ultrahuman data')
  }
  return parseMetrics(json.data, date)
}

/**
 * Fetch range of metrics using epoch range (single API call)
 * Ultrahuman API may limit to ~7 days per call
 * @param {string} token - Personal API token
 * @param {number} days - Number of days to fetch
 * @returns {Promise<object[]>} Array of parsed daily metrics
 */
export async function fetchUltrahumanRange(token, days = 7) {
  const CHUNK_SIZE = 7
  const allResults = []
  const seen = new Set()

  // Fetch in 7-day chunks
  for (let offset = 0; offset < days; offset += CHUNK_SIZE) {
    try {
      const now = new Date()
      const endEpoch = Math.floor(now.getTime() / 1000) - (offset * 86400)
      const chunkDays = Math.min(CHUNK_SIZE, days - offset)
      const startEpoch = endEpoch - (chunkDays * 86400)

      const url = `${UH_API_URL}?start_epoch=${startEpoch}&end_epoch=${endEpoch}`
      const res = await fetch(url, {
        headers: { 'Authorization': token },
      })
      const json = await res.json()
      if (json.error || json.status !== 200) continue
      if (!json.data?.metrics) continue

      const dates = Object.keys(json.data.metrics).sort()
      for (const dateKey of dates) {
        if (seen.has(dateKey)) continue
        seen.add(dateKey)
        const parsed = parseMetrics(json.data, dateKey)
        if (parsed) allResults.push(parsed)
      }
    } catch (e) {
      console.warn('Ring fetch chunk error:', e.message)
    }
  }

  return allResults.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Analyze temperature data for cycle phase detection
 * Combines ring skin temp with manual BBT entries
 * @param {object[]} ringDays - Array of parsed daily metrics from ring
 * @param {object[]} checkins - Array of check-in data with BBT
 * @returns {object} Temperature analysis
 */
export function analyzeTemperature(ringDays, checkins) {
  // Build unified temp timeline
  const tempTimeline = []

  // Add ring skin temps (nighttime averages, converted to approximate BBT)
  // Skin temp runs ~1-2°C below core BBT, so we track relative changes, not absolute
  ringDays.forEach((day) => {
    if (day.avgSleepTemp && day.avgSleepTemp > 30) {
      tempTimeline.push({
        date: day.date,
        ringTemp: day.avgSleepTemp,
        tempDeviation: day.tempDeviation,
        source: 'ring',
      })
    }
  })

  // Add manual BBT entries
  checkins.forEach((c) => {
    const bbtVal = parseFloat(c.bbt)
    if (bbtVal && bbtVal > 90) { // BBT in Fahrenheit
      const existing = tempTimeline.find((t) => t.date === c.date)
      if (existing) {
        existing.bbt = bbtVal
        existing.source = 'both'
      } else {
        tempTimeline.push({
          date: c.date,
          bbt: bbtVal,
          source: 'manual',
        })
      }
    }
  })

  // Sort by date
  tempTimeline.sort((a, b) => a.date.localeCompare(b.date))

  // Analyze ring temp for thermal shift
  const ringTemps = tempTimeline.filter((t) => t.ringTemp).map((t) => t.ringTemp)
  const ringAnalysis = detectThermalShift(ringTemps)

  // Analyze BBT for thermal shift
  const bbtTemps = tempTimeline.filter((t) => t.bbt).map((t) => t.bbt)
  const bbtAnalysis = bbtTemps.length >= 3 ? detectThermalShift(bbtTemps) : null

  // Calculate baseline and current
  const baseline = ringTemps.length >= 3
    ? ringTemps.slice(0, Math.ceil(ringTemps.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(ringTemps.length / 2)
    : null
  const current = ringTemps.length > 0 ? ringTemps[ringTemps.length - 1] : null
  const trendDirection = baseline && current
    ? current > baseline + 0.2 ? 'rising' : current < baseline - 0.2 ? 'falling' : 'stable'
    : null

  // Estimate ovulation date (day before thermal shift)
  const estimatedOvulationDate = (() => {
    const ringTempsWithDates = tempTimeline.filter(t => t.ringTemp)
    if (ringAnalysis.shiftDetected && ringAnalysis.shiftIndex != null && ringTempsWithDates[ringAnalysis.shiftIndex - 1]) {
      return ringTempsWithDates[ringAnalysis.shiftIndex - 1].date
    }
    if (bbtAnalysis?.shiftDetected && bbtAnalysis.shiftIndex != null) {
      const bbtWithDates = tempTimeline.filter(t => t.bbt)
      if (bbtWithDates[bbtAnalysis.shiftIndex - 1]) return bbtWithDates[bbtAnalysis.shiftIndex - 1].date
    }
    return null
  })()

  return {
    timeline: tempTimeline,
    ringAnalysis,
    bbtAnalysis,
    baseline: baseline ? Math.round(baseline * 100) / 100 : null,
    current: current ? Math.round(current * 100) / 100 : null,
    trendDirection,
    daysOfData: tempTimeline.length,
    hasEnoughData: tempTimeline.length >= 5,
    ovulationDetected: ringAnalysis.shiftDetected || (bbtAnalysis?.shiftDetected ?? false),
    estimatedOvulationDate,
    ovulationConfidence: ringAnalysis.shiftDetected && bbtAnalysis?.shiftDetected
      ? 'high'
      : ringAnalysis.shiftDetected || bbtAnalysis?.shiftDetected
        ? 'moderate'
        : 'none',
  }
}

/**
 * Detect post-ovulation thermal shift in temperature array
 * Looks for a sustained rise of 0.2°C+ (ring) or 0.3°F+ (BBT) over baseline
 */
function detectThermalShift(temps) {
  if (temps.length < 4) return { shiftDetected: false, shiftIndex: null, message: 'Need more data' }

  // Calculate rolling baseline from first half
  const halfLen = Math.ceil(temps.length / 2)
  const firstHalf = temps.slice(0, halfLen)
  const baseline = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length

  // Check if latter temps are consistently above baseline
  const secondHalf = temps.slice(halfLen)
  const threshold = baseline > 90 ? 0.3 : 0.15 // °F vs °C
  const aboveBaseline = secondHalf.filter((t) => t > baseline + threshold)

  if (aboveBaseline.length >= Math.ceil(secondHalf.length * 0.6)) {
    // Find where the shift started
    let shiftIndex = halfLen
    for (let i = halfLen; i < temps.length; i++) {
      if (temps[i] > baseline + threshold) {
        shiftIndex = i
        break
      }
    }
    return {
      shiftDetected: true,
      shiftIndex,
      baseline: Math.round(baseline * 100) / 100,
      shiftAmount: Math.round((aboveBaseline.reduce((a, b) => a + b, 0) / aboveBaseline.length - baseline) * 100) / 100,
      message: 'Thermal shift detected — likely post-ovulation',
    }
  }

  return {
    shiftDetected: false,
    shiftIndex: null,
    baseline: Math.round(baseline * 100) / 100,
    message: 'No clear thermal shift yet',
  }
}

/**
 * Build 7-day trend data for dashboard charts
 */
export function buildTrends(ringDays) {
  return {
    dates: ringDays.map((d) => d.date),
    sleep: ringDays.map((d) => ({ date: d.date, score: d.sleepScore, total: d.totalSleepMinutes, deep: d.deepSleepMinutes, rem: d.remSleepMinutes })),
    hrv: ringDays.map((d) => ({ date: d.date, sleep: d.avgSleepHrv, avg24h: d.hrvAvg24h })),
    rhr: ringDays.map((d) => ({ date: d.date, value: d.nightRhr })),
    temp: ringDays.map((d) => ({ date: d.date, ring: d.avgSleepTemp, deviation: d.tempDeviation })),
    recovery: ringDays.map((d) => ({ date: d.date, value: d.recoveryIndex })),
    steps: ringDays.map((d) => ({ date: d.date, value: d.steps })),
    spo2: ringDays.map((d) => ({ date: d.date, value: d.spo2Avg })),
  }
}

/**
 * Parse raw API response into clean dashboard-friendly metrics
 */
export function parseMetrics(data, date) {
  if (!data?.metrics) return null
  
  // The API may return data under the requested date or a nearby date
  // Grab the first available date key
  const availableDates = Object.keys(data.metrics)
  if (availableDates.length === 0) return null
  
  const dateKey = availableDates.includes(date) ? date : availableDates[0]
  const dateMetrics = data.metrics[dateKey]
  if (!dateMetrics || dateMetrics.length === 0) return null

  const byType = {}
  dateMetrics.forEach((m) => { byType[m.type] = m.object })

  const sleep = byType.sleep || {}
  const sleepStages = sleep.sleep_stages || []
  const deepSleep = sleepStages.find((s) => s.type === 'deep_sleep')
  const remSleep = sleepStages.find((s) => s.type === 'rem_sleep')
  const lightSleep = sleepStages.find((s) => s.type === 'light_sleep')
  const awakeSleep = sleepStages.find((s) => s.type === 'awake')

  // Skin temperature during sleep (filter to sleep hours only, > 30°C)
  const tempValues = (byType.temp?.values || [])
    .filter((v) => v.value > 30)
    .map((v) => v.value)
  const avgSleepTemp = tempValues.length > 0
    ? tempValues.reduce((a, b) => a + b, 0) / tempValues.length
    : null

  // Temperature deviation from API
  const tempDeviation = sleep.temperature_deviation?.celsius ?? null

  // Steps total
  const stepsTotal = byType.steps?.total ?? 0

  // Night resting heart rate
  const nightRhr = byType.night_rhr?.avg ?? byType.sleep_rhr?.value ?? null

  // Sleep HRV average
  const avgSleepHrv = byType.avg_sleep_hrv?.value ?? null

  // HRV trend
  const hrvObj = byType.hrv || {}
  const hrvAvg = hrvObj.avg ?? null
  const hrvTrend = hrvObj.trend_title ?? null
  const hrvDirection = hrvObj.trend_direction ?? null

  // Recovery & Movement indices
  const recoveryIndex = byType.recovery_index?.value ?? null
  const movementIndex = byType.movement_index?.value ?? null

  // VO2 Max
  const vo2Max = byType.vo2_max?.value ?? null

  // Active minutes
  const activeMinutes = byType.active_minutes?.value ?? null

  // SpO2
  const spo2Avg = byType.spo2?.avg ?? null

  // Sleep score
  const sleepScore = sleep.sleep_score?.score ?? null

  // Sleep summary items
  const sleepSummary = (sleep.summary || []).map((s) => ({
    title: s.title,
    state: s.state,
    stateTitle: s.state_title,
    score: s.score,
  }))

  // Sleep timing
  const bedtimeStart = sleep.bedtime_start
    ? new Date(sleep.bedtime_start * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : null
  const bedtimeEnd = sleep.bedtime_end
    ? new Date(sleep.bedtime_end * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : null

  return {
    date: dateKey,
    timezone: data.latest_time_zone,

    // Sleep
    sleepScore,
    totalSleep: sleep.total_sleep?.display_text ?? formatMinutes(sleep.total_sleep?.minutes),
    totalSleepMinutes: sleep.total_sleep?.minutes ?? null,
    sleepEfficiency: sleep.sleep_efficiency?.percentage ?? null,
    timeInBed: sleep.time_in_bed?.display_text ?? formatMinutes(sleep.time_in_bed?.minutes),
    bedtimeStart,
    bedtimeEnd,
    deepSleepMinutes: deepSleep?.stage_time ? Math.round(deepSleep.stage_time / 60) : null,
    deepSleepPct: deepSleep?.percentage ?? null,
    remSleepMinutes: remSleep?.stage_time ? Math.round(remSleep.stage_time / 60) : null,
    remSleepPct: remSleep?.percentage ?? null,
    lightSleepMinutes: lightSleep?.stage_time ? Math.round(lightSleep.stage_time / 60) : null,
    lightSleepPct: lightSleep?.percentage ?? null,
    awakePct: awakeSleep?.percentage ?? null,
    restorativeSleepPct: sleep.restorative_sleep?.percentage ?? null,
    sleepCycles: sleep.full_sleep_cycles?.cycles ?? null,
    tossesAndTurns: sleep.tosses_and_turns?.count ?? null,
    sleepSummary,

    // Heart
    nightRhr,
    avgSleepHrv,
    hrvAvg24h: hrvAvg,
    hrvTrend,
    hrvDirection,
    spo2Avg,

    // Temperature
    avgSleepTemp: avgSleepTemp ? Math.round(avgSleepTemp * 100) / 100 : null,
    tempDeviation,
    avgBodyTemp: sleep.average_body_temperature?.celsius ?? null,

    // Activity
    steps: stepsTotal,
    activeMinutes,
    movementIndex,

    // Recovery
    recoveryIndex,
    vo2Max,
  }
}

function formatMinutes(mins) {
  if (!mins) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

/**
 * Color helpers for metric display
 */
export function getScoreColor(score) {
  if (score >= 80) return '#9BAF93' // green — optimal
  if (score >= 60) return '#C9A96E' // amber — good
  return '#C4948A' // rose — needs attention
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Optimal'
  if (score >= 60) return 'Good'
  return 'Needs attention'
}

export function getSleepStageColor(type) {
  const colors = {
    deep_sleep: '#6B7DB3',  // indigo
    rem_sleep: '#A88BC4',   // lavender
    light_sleep: '#9BAF93', // sage
    awake: '#C4948A',       // rose
  }
  return colors[type] || '#A09A90'
}