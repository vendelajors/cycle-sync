/**
 * Cycle Sync Correlation Engine
 * 
 * Analyzes bidirectional relationships:
 * 1. How do inputs (exercise, diet, supplements) affect how you feel per phase?
 * 2. How does each phase affect your capacity for exercise, social energy, etc.?
 * 
 * Produces personalized correlations from check-in data.
 */

import { makeAssignPhase } from './CycleData'

/**
 * Get the next calendar day as a YYYY-MM-DD string.
 * Uses noon to avoid DST midnight-rollover issues.
 */
function getNextDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Core analysis: group check-ins by phase, then compare outcomes
 * based on different input variables.
 *
 * @param {object[]} checkins - All check-in rows
 * @param {number|null} detectedOvulDay - Cycle day of BBT/CM detected ovulation, if known.
 *   Pass this from tempAnalysis.estimatedOvulationDate (resolved to a cycle_day) so that
 *   all phase bucketing here is consistent with the cycle map.
 */
export function analyzeCorrelations(checkins, detectedOvulDay = null) {
  if (!checkins || checkins.length < 5) return null

  // Use the same assignment logic as the cycle map
  const assignPhase = makeAssignPhase(detectedOvulDay)

  const phases = ['menstrual', 'follicular', 'ovulation', 'luteal']
  const results = {
    phaseProfiles: {},
    exerciseImpact: {},
    dietImpact: {},
    supplementImpact: {},
    correlations: [],
    personalPatterns: [],
  }

  // Group check-ins by phase using consistent assignment
  const byPhase = {}
  phases.forEach(p => { byPhase[p] = [] })
  checkins.forEach(c => {
    const phase = assignPhase(c)
    if (phase && byPhase[phase]) byPhase[phase].push(c)
  })

  // Date-indexed lookup for next-day outcome pairing
  const checkinByDate = {}
  checkins.forEach(c => { if (c.date) checkinByDate[c.date] = c })

  // Next-day outcome helpers
  const getNextDayOutcomes = (c) => {
    const next = checkinByDate[getNextDay(c.date)]
    if (!next) return null
    return {
      mood: parseFloat(next.mood),
      energy: parseFloat(next.energy),
      stress: parseFloat(next.stress),
      sleep: parseFloat(next.sleep_quality),
    }
  }

  const avgNextDay = (arr, field) => {
    const vals = arr.map(c => getNextDayOutcomes(c)).filter(o => o !== null && !isNaN(o[field])).map(o => o[field])
    return vals.length >= 2 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null
  }

  const nextDayCount = (arr) => arr.filter(c => getNextDayOutcomes(c) !== null).length

  // ─── 1. PHASE PROFILES ───
  phases.forEach(phase => {
    const pc = byPhase[phase]
    if (pc.length === 0) return

    const avg = (field) => {
      const vals = pc.map(c => parseFloat(c[field])).filter(v => !isNaN(v))
      return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null
    }

    const symptoms = {}
    pc.forEach(c => {
      if (c.symptoms) c.symptoms.split(',').forEach(s => {
        const t = s.trim()
        if (t && t !== 'None') symptoms[t] = (symptoms[t] || 0) + 1
      })
    })

    results.phaseProfiles[phase] = {
      days: pc.length,
      mood: avg('mood'),
      energy: avg('energy'),
      stress: avg('stress'),
      sleep: avg('sleep_quality'),
      topSymptoms: Object.entries(symptoms)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([s, count]) => ({ symptom: s, frequency: Math.round((count / pc.length) * 100) })),
    }
  })

  // ─── 2. EXERCISE IMPACT (next-day outcomes, fallback to same-day) ───
  phases.forEach(phase => {
    const pc = byPhase[phase]
    if (pc.length < 2) return

    const workoutDays = pc.filter(c => c.workout_types && c.workout_types.trim())
    const restDays = pc.filter(c => c.activity === 'rest' || (!c.workout_types || !c.workout_types.trim()))

    const avgOf = (arr, field) => {
      const vals = arr.map(c => parseFloat(c[field])).filter(v => !isNaN(v))
      return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null
    }

    // Prefer next-day outcomes; fall back to same-day if insufficient pairs
    const useNextDay = nextDayCount(workoutDays) >= 2 && nextDayCount(restDays) >= 2

    const byType = {}
    workoutDays.forEach(c => {
      c.workout_types.split(',').forEach(w => {
        const type = w.trim().toLowerCase()
        if (!type) return
        if (!byType[type]) byType[type] = []
        byType[type].push(c)
      })
    })

    const typeImpact = {}
    Object.entries(byType).forEach(([type, days]) => {
      if (days.length < 2) return
      const typeUseNextDay = useNextDay && nextDayCount(days) >= 2
      typeImpact[type] = {
        count: typeUseNextDay ? nextDayCount(days) : days.length,
        mood: typeUseNextDay ? avgNextDay(days, 'mood') : avgOf(days, 'mood'),
        energy: typeUseNextDay ? avgNextDay(days, 'energy') : avgOf(days, 'energy'),
        stress: typeUseNextDay ? avgNextDay(days, 'stress') : avgOf(days, 'stress'),
        sleep: typeUseNextDay ? avgNextDay(days, 'sleep') : avgOf(days, 'sleep_quality'),
        isNextDay: typeUseNextDay,
      }
    })

    results.exerciseImpact[phase] = {
      workoutDays: {
        count: useNextDay ? nextDayCount(workoutDays) : workoutDays.length,
        mood: useNextDay ? avgNextDay(workoutDays, 'mood') : avgOf(workoutDays, 'mood'),
        energy: useNextDay ? avgNextDay(workoutDays, 'energy') : avgOf(workoutDays, 'energy'),
        stress: useNextDay ? avgNextDay(workoutDays, 'stress') : avgOf(workoutDays, 'stress'),
        sleep: useNextDay ? avgNextDay(workoutDays, 'sleep') : avgOf(workoutDays, 'sleep_quality'),
        isNextDay: useNextDay,
      },
      restDays: {
        count: useNextDay ? nextDayCount(restDays) : restDays.length,
        mood: useNextDay ? avgNextDay(restDays, 'mood') : avgOf(restDays, 'mood'),
        energy: useNextDay ? avgNextDay(restDays, 'energy') : avgOf(restDays, 'energy'),
        stress: useNextDay ? avgNextDay(restDays, 'stress') : avgOf(restDays, 'stress'),
        sleep: useNextDay ? avgNextDay(restDays, 'sleep') : avgOf(restDays, 'sleep_quality'),
        isNextDay: useNextDay,
      },
      byType: typeImpact,
    }
  })

  // ─── 3. DIET IMPACT (next-day outcomes, fallback to same-day) ───
  phases.forEach(phase => {
    const pc = byPhase[phase]
    if (pc.length < 2) return

    const avgOf = (arr, field) => {
      const vals = arr.map(c => parseFloat(c[field])).filter(v => !isNaN(v))
      return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null
    }

    const byTag = {}
    pc.forEach(c => {
      if (c.diet_tags) c.diet_tags.split(',').forEach(t => {
        const tag = t.trim().toLowerCase()
        if (!tag) return
        if (!byTag[tag]) byTag[tag] = []
        byTag[tag].push(c)
      })
    })

    const tagImpact = {}
    Object.entries(byTag).forEach(([tag, days]) => {
      if (days.length < 2) return
      const without = pc.filter(c => !(c.diet_tags || '').toLowerCase().includes(tag))
      const tagUseNextDay = nextDayCount(days) >= 2 && nextDayCount(without) >= 2

      const moodWith = tagUseNextDay ? avgNextDay(days, 'mood') : avgOf(days, 'mood')
      const moodWithout = tagUseNextDay ? avgNextDay(without, 'mood') : avgOf(without, 'mood')
      const energyWith = tagUseNextDay ? avgNextDay(days, 'energy') : avgOf(days, 'energy')
      const energyWithout = tagUseNextDay ? avgNextDay(without, 'energy') : avgOf(without, 'energy')

      tagImpact[tag] = {
        count: tagUseNextDay ? nextDayCount(days) : days.length,
        mood: moodWith,
        energy: energyWith,
        stress: tagUseNextDay ? avgNextDay(days, 'stress') : avgOf(days, 'stress'),
        moodDiff: moodWith != null && moodWithout != null ? round(moodWith - moodWithout) : null,
        energyDiff: energyWith != null && energyWithout != null ? round(energyWith - energyWithout) : null,
        isNextDay: tagUseNextDay,
      }
    })

    results.dietImpact[phase] = tagImpact
  })

  // ─── 4. SUPPLEMENT IMPACT (hybrid: prefer next-day, fall back to same-day per checkin) ───
  phases.forEach(phase => {
    const pc = byPhase[phase]
    if (pc.length < 2) return

    // Hybrid: use next-day outcome if available, otherwise same-day
    const getOutcome = (c) => {
      const nextDay = getNextDayOutcomes(c)
      if (nextDay) return nextDay
      return {
        mood: parseFloat(c.mood),
        energy: parseFloat(c.energy),
        stress: parseFloat(c.stress),
        sleep: parseFloat(c.sleep_quality),
      }
    }

    const avgHybrid = (arr, field) => {
      const vals = arr.map(c => getOutcome(c)[field]).filter(v => !isNaN(v))
      return vals.length >= 2 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null
    }

    const tookAll = pc.filter(c => c.supplements_taken === 'yes')
    const tookNone = pc.filter(c => c.supplements_taken === 'no')

    results.supplementImpact[phase] = {
      tookAll: tookAll.length >= 2 ? {
        count: tookAll.length,
        mood: avgHybrid(tookAll, 'mood'),
        energy: avgHybrid(tookAll, 'energy'),
        stress: avgHybrid(tookAll, 'stress'),
        sleep: avgHybrid(tookAll, 'sleep'),
      } : null,
      tookNone: tookNone.length >= 2 ? {
        count: tookNone.length,
        mood: avgHybrid(tookNone, 'mood'),
        energy: avgHybrid(tookNone, 'energy'),
        stress: avgHybrid(tookNone, 'stress'),
        sleep: avgHybrid(tookNone, 'sleep'),
      } : null,
    }
  })

  // ─── 5. FIND TOP CORRELATIONS ───
  results.correlations = findTopCorrelations(results, byPhase)

  // ─── 6. PERSONAL PATTERNS ───
  results.personalPatterns = findPersonalPatterns(results)

  return results
}

function findTopCorrelations(results, byPhase) {
  const correlations = []

  Object.entries(results.exerciseImpact).forEach(([phase, data]) => {
    if (data.workoutDays.count >= 2 && data.restDays.count >= 2) {
      const moodDiff = round(data.workoutDays.mood - data.restDays.mood)
      const energyDiff = round(data.workoutDays.energy - data.restDays.energy)
      const lag = data.workoutDays.isNextDay ? 'next-day ' : ''

      if (Math.abs(moodDiff) >= 1) {
        correlations.push({
          phase,
          type: 'exercise',
          direction: moodDiff > 0 ? 'positive' : 'negative',
          strength: Math.abs(moodDiff),
          metric: 'mood',
          message: moodDiff > 0
            ? `In your ${phase} phase, workout days boost your ${lag}mood by ${moodDiff} points vs rest days`
            : `In your ${phase} phase, workout days actually lower your ${lag}mood by ${Math.abs(moodDiff)} points — your body may need more rest here`,
          data: { workoutAvg: data.workoutDays.mood, restAvg: data.restDays.mood },
        })
      }

      if (Math.abs(energyDiff) >= 1) {
        correlations.push({
          phase,
          type: 'exercise',
          direction: energyDiff > 0 ? 'positive' : 'negative',
          strength: Math.abs(energyDiff),
          metric: 'energy',
          message: energyDiff > 0
            ? `Exercise in your ${phase} phase gives you +${energyDiff} ${lag}energy`
            : `Exercise in your ${phase} phase drains your ${lag}energy by ${Math.abs(energyDiff)} points — consider lighter movement`,
          data: { workoutAvg: data.workoutDays.energy, restAvg: data.restDays.energy },
        })
      }

      Object.entries(data.byType).forEach(([type, typeData]) => {
        const overall = results.phaseProfiles[phase]
        if (!overall || typeData.count < 2) return
        const typeLag = typeData.isNextDay ? 'next-day ' : ''

        const moodVsAvg = round(typeData.mood - overall.mood)
        if (Math.abs(moodVsAvg) >= 1.5) {
          correlations.push({
            phase,
            type: 'workout_type',
            direction: moodVsAvg > 0 ? 'positive' : 'negative',
            strength: Math.abs(moodVsAvg),
            metric: 'mood',
            workout: type,
            message: moodVsAvg > 0
              ? `${capitalize(type)} during ${phase} boosts your ${typeLag}mood to ${typeData.mood} (avg is ${overall.mood})`
              : `${capitalize(type)} during ${phase} drops your ${typeLag}mood to ${typeData.mood} (avg is ${overall.mood}) — try swapping for something gentler`,
            data: { typeAvg: typeData.mood, phaseAvg: overall.mood },
          })
        }
      })
    }
  })

  Object.entries(results.supplementImpact).forEach(([phase, data]) => {
    if (data.tookAll && data.tookNone) {
      const moodDiff = round(data.tookAll.mood - data.tookNone.mood)
      const energyDiff = round(data.tookAll.energy - data.tookNone.energy)

      if (Math.abs(moodDiff) >= 1) {
        correlations.push({
          phase,
          type: 'supplements',
          direction: moodDiff > 0 ? 'positive' : 'negative',
          strength: Math.abs(moodDiff),
          metric: 'mood',
          message: moodDiff > 0
            ? `Taking all supplements in ${phase} correlates with +${moodDiff} mood (${data.tookAll.mood} vs ${data.tookNone.mood})`
            : `Supplements don't seem to help mood in your ${phase} phase — worth reviewing your stack`,
          data: { withSupps: data.tookAll.mood, withoutSupps: data.tookNone.mood },
        })
      }

      if (Math.abs(energyDiff) >= 1) {
        correlations.push({
          phase,
          type: 'supplements',
          direction: energyDiff > 0 ? 'positive' : 'negative',
          strength: Math.abs(energyDiff),
          metric: 'energy',
          message: energyDiff > 0
            ? `Supplements in ${phase} give you +${energyDiff} energy — keep it up`
            : `Energy is actually lower with supplements in ${phase} — timing or types may need adjusting`,
          data: { withSupps: data.tookAll.energy, withoutSupps: data.tookNone.energy },
        })
      }
    }
  })

  Object.entries(results.dietImpact).forEach(([phase, tags]) => {
    Object.entries(tags).forEach(([tag, data]) => {
      const dietLag = data.isNextDay ? 'next-day ' : ''
      if (data.moodDiff !== null && Math.abs(data.moodDiff) >= 1) {
        correlations.push({
          phase,
          type: 'diet',
          direction: data.moodDiff > 0 ? 'positive' : 'negative',
          strength: Math.abs(data.moodDiff),
          metric: 'mood',
          tag,
          message: data.moodDiff > 0
            ? `"${capitalize(tag)}" days in ${phase} boost your ${dietLag}mood by ${data.moodDiff}`
            : `"${capitalize(tag)}" days in ${phase} correlate with ${Math.abs(data.moodDiff)} lower ${dietLag}mood`,
          data: { withTag: data.mood, diff: data.moodDiff },
        })
      }
      if (data.energyDiff !== null && Math.abs(data.energyDiff) >= 1) {
        correlations.push({
          phase,
          type: 'diet',
          direction: data.energyDiff > 0 ? 'positive' : 'negative',
          strength: Math.abs(data.energyDiff),
          metric: 'energy',
          tag,
          message: data.energyDiff > 0
            ? `"${capitalize(tag)}" eating in ${phase} gives you +${data.energyDiff} ${dietLag}energy`
            : `"${capitalize(tag)}" days in ${phase} lower your ${dietLag}energy by ${Math.abs(data.energyDiff)}`,
          data: { withTag: data.energy, diff: data.energyDiff },
        })
      }
    })
  })

  return correlations.sort((a, b) => b.strength - a.strength)
}

function findPersonalPatterns(results) {
  const patterns = []
  const profiles = results.phaseProfiles

  const phaseOrder = ['menstrual', 'follicular', 'ovulation', 'luteal']
  const metrics = ['mood', 'energy', 'stress', 'sleep']

  metrics.forEach(metric => {
    let best = null, worst = null, bestVal = -Infinity, worstVal = Infinity
    phaseOrder.forEach(phase => {
      const val = profiles[phase]?.[metric]
      if (val === null || val === undefined) return
      if (val > bestVal) { bestVal = val; best = phase }
      if (val < worstVal) { worstVal = val; worst = phase }
    })
    if (best && worst && best !== worst && bestVal - worstVal >= 1.5) {
      patterns.push({
        metric,
        best: { phase: best, value: bestVal },
        worst: { phase: worst, value: worstVal },
        spread: round(bestVal - worstVal),
        message: `Your ${metric} varies by ${round(bestVal - worstVal)} points across your cycle — highest in ${best} (${bestVal}) and lowest in ${worst} (${worstVal})`,
      })
    }
  })

  if (profiles.luteal?.energy && profiles.follicular?.energy) {
    if (profiles.luteal.energy > profiles.follicular.energy) {
      patterns.push({
        type: 'unexpected',
        message: `Interesting: your energy is actually higher in luteal (${profiles.luteal.energy}) than follicular (${profiles.follicular.energy}) — this is atypical and worth monitoring`,
      })
    }
  }

  if (profiles.menstrual?.mood && profiles.luteal?.mood) {
    if (profiles.menstrual.mood > profiles.luteal.mood + 1) {
      patterns.push({
        type: 'unexpected',
        message: `Your mood is better during menstruation (${profiles.menstrual.mood}) than luteal (${profiles.luteal.mood}) — the progesterone drop at period start may actually bring relief for you`,
      })
    }
  }

  return patterns
}

/**
 * Generate a correlation context string for AI prompts.
 *
 * @param {object[]} checkins - All check-in rows
 * @param {number|null} detectedOvulDay - Cycle day of detected ovulation (pass from tempAnalysis)
 */
export function getCorrelationContext(checkins, detectedOvulDay = null) {
  const analysis = analyzeCorrelations(checkins, detectedOvulDay)
  if (!analysis) return '\n## Personal Data Correlations\nNot enough data yet (need 5+ check-ins).\n'

  let ctx = '\n## YOUR PERSONAL DATA CORRELATIONS\n'
  ctx += 'These patterns are from the user\'s actual logged data — reference them in recommendations.\n\n'

  ctx += '### How each phase affects this user:\n'
  Object.entries(analysis.phaseProfiles).forEach(([phase, data]) => {
    if (data.days === 0) return
    ctx += `- ${capitalize(phase)} (${data.days} days logged): mood ${data.mood}, energy ${data.energy}, stress ${data.stress}, sleep ${data.sleep}`
    if (data.topSymptoms.length > 0) {
      ctx += ` | Symptoms: ${data.topSymptoms.map(s => `${s.symptom} (${s.frequency}%)`).join(', ')}`
    }
    ctx += '\n'
  })

  if (analysis.correlations.length > 0) {
    ctx += '\n### Strongest correlations found in their data:\n'
    analysis.correlations.slice(0, 8).forEach(c => {
      ctx += `- ${c.message}\n`
    })
  }

  if (analysis.personalPatterns.length > 0) {
    ctx += '\n### Personal patterns:\n'
    analysis.personalPatterns.forEach(p => {
      ctx += `- ${p.message}\n`
    })
  }

  ctx += '\nUSE these correlations to make recommendations SPECIFIC to this user. '
  ctx += 'Reference their actual numbers. Tell them what works FOR THEM, not generic advice.\n'

  return ctx
}

// ─────────────────────────────────────────────────────────────────────────────
// RISK FLAG ENGINE
// Scans across multiple cycles to detect persistent patterns that warrant
// attention. Unlike correlations (which find what works), risk flags find
// what keeps going wrong.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Split checkins into individual cycles using period/cycle_day anchors.
 * Returns an array of cycles, each an array of checkin objects, sorted by date.
 * Requires at least 2 period starts to identify complete cycles.
 */
function splitIntoCycles(checkins) {
  const sorted = [...checkins].sort((a, b) => a.date.localeCompare(b.date))

  // Find cycle start dates (cycle_day === 1 or first day of period run)
  const cycleStarts = []
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i]
    const isDay1 = parseInt(c.cycle_day) === 1
    const isPeriodStart = c.period === 'yes' && (i === 0 || sorted[i - 1].period !== 'yes')
    if (isDay1 || isPeriodStart) {
      // Avoid duplicates within 3 days
      const last = cycleStarts[cycleStarts.length - 1]
      if (!last || Math.abs(new Date(c.date) - new Date(last)) / 86400000 > 3) {
        cycleStarts.push(c.date)
      }
    }
  }

  if (cycleStarts.length < 2) return [] // Need at least 2 starts to form 1 complete cycle

  const cycles = []
  for (let i = 0; i < cycleStarts.length - 1; i++) {
    const start = cycleStarts[i]
    const end = cycleStarts[i + 1]
    const cycleDays = sorted.filter(c => c.date >= start && c.date < end)
    if (cycleDays.length >= 5) cycles.push(cycleDays) // Skip cycles with too little data
  }
  return cycles
}

/**
 * Analyze risk flags across multiple cycles.
 *
 * @param {object[]} checkins - All check-in rows (needs multiple cycles worth)
 * @param {object[]} ringDays - Ring biometric data array (from ultrahumanParser)
 * @param {number|null} detectedOvulDay - Current cycle's detected ovulation day
 * @returns {object[]} Array of risk flag objects
 */
export function analyzeRiskFlags(checkins, ringDays = [], detectedOvulDay = null) {
  if (!checkins || checkins.length < 10) return []

  const assignPhase = makeAssignPhase(detectedOvulDay)
  const cycles = splitIntoCycles(checkins)

  // Build a ring lookup by date for quick HRV/recovery access
  const ringByDate = {}
  ringDays.forEach(d => { if (d.date) ringByDate[d.date] = d })

  const flags = []

  // ── Helpers ──────────────────────────────────────────────────────────────

  const avgOf = (arr, field) => {
    const vals = arr.map(c => parseFloat(c[field])).filter(v => !isNaN(v) && v > 0)
    return vals.length >= 2 ? round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  }

  const avgRing = (arr, field) => {
    const vals = arr
      .map(c => ringByDate[c.date]?.[field])
      .filter(v => v != null && !isNaN(v) && v > 0)
    return vals.length >= 2 ? round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  }

  // Per-cycle phase averages — returns { phase: { mood, energy, stress, sleep, hrv, recovery, count } }
  const getCyclePhaseData = (cycle) => {
    const phaseData = {}
    const phases = ['menstrual', 'follicular', 'ovulation', 'luteal']
    phases.forEach(ph => {
      const days = cycle.filter(c => assignPhase(c) === ph)
      phaseData[ph] = {
        count: days.length,
        mood: avgOf(days, 'mood'),
        energy: avgOf(days, 'energy'),
        stress: avgOf(days, 'stress'),
        sleep: avgOf(days, 'sleep_quality'),
        hrv: avgRing(days, 'avgSleepHrv'),
        recovery: avgRing(days, 'recoveryIndex'),
      }
    })
    return phaseData
  }

  // Late luteal specifically (last 5 days of luteal before period)
  const getLateLuteal = (cycle) => {
    const lutealDays = cycle
      .filter(c => assignPhase(c) === 'luteal')
      .sort((a, b) => b.date.localeCompare(a.date)) // reverse: most recent first
    return lutealDays.slice(0, 5)
  }

  // ── Analyze each cycle ────────────────────────────────────────────────────
  const cyclePhaseData = cycles.map(getCyclePhaseData)
  const nCycles = cyclePhaseData.length
  if (nCycles < 2) return [] // Need 2+ complete cycles for cross-cycle patterns

  // ── FLAG 1: Chronic low HRV in luteal ────────────────────────────────────
  {
    const lutealHrvValues = cyclePhaseData
      .map(cd => cd.luteal?.hrv)
      .filter(v => v != null)
    const follicularHrvValues = cyclePhaseData
      .map(cd => cd.follicular?.hrv)
      .filter(v => v != null)

    const cyclesWithLowHrv = lutealHrvValues.filter(v => v < 35).length
    const cyclesWithHrvDrop = lutealHrvValues.filter((lutHrv, i) => {
      const folHrv = follicularHrvValues[i]
      return folHrv != null && (folHrv - lutHrv) >= 15
    }).length

    const avgLutealHrv = lutealHrvValues.length >= 2
      ? round(lutealHrvValues.reduce((a, b) => a + b, 0) / lutealHrvValues.length)
      : null
    const avgFollicularHrv = follicularHrvValues.length >= 2
      ? round(follicularHrvValues.reduce((a, b) => a + b, 0) / follicularHrvValues.length)
      : null

    if (lutealHrvValues.length >= 2 && cyclesWithLowHrv >= 2) {
      flags.push({
        id: 'chronic_low_hrv_luteal',
        severity: avgLutealHrv < 25 ? 'high' : 'medium',
        phase: 'luteal',
        metric: 'hrv',
        title: 'Chronic low HRV in luteal phase',
        message: `Your HRV averages ${avgLutealHrv}ms during the luteal phase across ${lutealHrvValues.length} cycles — consistently below the 35ms threshold that indicates nervous system strain. This pattern suggests progesterone-driven sympathetic dominance that may be compounding PMS symptoms.`,
        action: 'Prioritize magnesium (400mg), limit caffeine after noon, add 4-7-8 breathing before bed, and reduce training intensity in late luteal.',
        dataPoints: lutealHrvValues.length,
        cyclesAffected: cyclesWithLowHrv,
      })
    } else if (lutealHrvValues.length >= 2 && follicularHrvValues.length >= 2 && cyclesWithHrvDrop >= 2) {
      const avgDrop = round(avgFollicularHrv - avgLutealHrv)
      flags.push({
        id: 'hrv_drop_luteal',
        severity: avgDrop > 20 ? 'high' : 'medium',
        phase: 'luteal',
        metric: 'hrv',
        title: 'Consistent HRV drop entering luteal phase',
        message: `Your HRV drops an average of ${avgDrop}ms when you enter the luteal phase (${avgFollicularHrv}ms follicular → ${avgLutealHrv}ms luteal), a pattern that has repeated across ${cyclesWithHrvDrop} cycles. This is larger than typical hormonal variation and suggests your nervous system is struggling with the progesterone transition.`,
        action: 'Focus on recovery in the 3 days before your period. Reduce training volume, increase sleep duration, and consider ashwagandha or L-theanine for cortisol buffering.',
        dataPoints: lutealHrvValues.length,
        cyclesAffected: cyclesWithHrvDrop,
      })
    }
  }

  // ── FLAG 2: Persistent late-luteal sleep degradation ─────────────────────
  {
    const degradationCycles = cycles.filter((cycle, i) => {
      const phaseData = cyclePhaseData[i]
      const lateLuteal = getLateLuteal(cycle)
      const lateLutealSleep = avgOf(lateLuteal, 'sleep_quality')
      const lutealAvg = phaseData.luteal?.sleep
      return lateLutealSleep != null && lutealAvg != null && (lutealAvg - lateLutealSleep) >= 1.5
    })

    if (degradationCycles.length >= 2) {
      // Calculate typical drop magnitude
      const drops = degradationCycles.map((cycle, idx) => {
        const cycleIdx = cycles.indexOf(cycle)
        const phaseData = cyclePhaseData[cycleIdx]
        const lateLuteal = getLateLuteal(cycle)
        const lateLutealSleep = avgOf(lateLuteal, 'sleep_quality')
        return round(phaseData.luteal?.sleep - lateLutealSleep)
      }).filter(Boolean)
      const avgDrop = drops.length ? round(drops.reduce((a, b) => a + b, 0) / drops.length) : null

      flags.push({
        id: 'late_luteal_sleep_crash',
        severity: avgDrop > 2.5 ? 'high' : 'medium',
        phase: 'luteal',
        metric: 'sleep',
        title: 'Recurring sleep crash in late luteal phase',
        message: `In ${degradationCycles.length} of ${nCycles} cycles, your sleep quality drops an average of ${avgDrop} points in the 5 days before your period compared to the rest of your luteal phase. This is a consistent hormonal sleep disruption pattern tied to the estrogen and progesterone withdrawal that triggers menstruation.`,
        action: 'Start sleep protection 5 days before your expected period: room at 65-67°F, magnesium glycinate 300mg before bed, no screens 60 min before sleep, tart cherry juice or 0.5mg melatonin if needed.',
        dataPoints: degradationCycles.length,
        cyclesAffected: degradationCycles.length,
      })
    }
  }

  // ── FLAG 3: Mood crash pattern ovulation → late luteal ───────────────────
  {
    const crashCycles = cyclePhaseData.filter(cd => {
      const ovulMood = cd.ovulation?.mood
      const lutealMood = cd.luteal?.mood
      return ovulMood != null && lutealMood != null && (ovulMood - lutealMood) >= 2
    })

    if (crashCycles.length >= 2) {
      const avgOvulMood = round(
        crashCycles.map(cd => cd.ovulation.mood).reduce((a, b) => a + b, 0) / crashCycles.length
      )
      const avgLutealMood = round(
        crashCycles.map(cd => cd.luteal.mood).reduce((a, b) => a + b, 0) / crashCycles.length
      )
      const avgCrash = round(avgOvulMood - avgLutealMood)

      flags.push({
        id: 'mood_crash_pattern',
        severity: avgCrash >= 3 ? 'high' : 'medium',
        phase: 'luteal',
        metric: 'mood',
        title: 'Recurring mood crash: ovulation → luteal',
        message: `Your mood averages ${avgOvulMood}/10 at ovulation but drops to ${avgLutealMood}/10 in your luteal phase — a ${avgCrash}-point crash that has repeated across ${crashCycles.length} cycles. This pattern is consistent with progesterone-driven serotonin decline and may benefit from targeted intervention.`,
        action: 'Increase tryptophan-rich foods (turkey, eggs, oats) in early luteal to support serotonin. Consider B6 50mg, magnesium glycinate, and vitex if the pattern persists. Reduce alcohol entirely in the second half of your luteal phase.',
        dataPoints: crashCycles.length,
        cyclesAffected: crashCycles.length,
      })
    }
  }

  // ── FLAG 4: Chronically elevated stress in a phase ───────────────────────
  {
    const phases = ['menstrual', 'follicular', 'ovulation', 'luteal']
    phases.forEach(phase => {
      const stressValues = cyclePhaseData
        .map(cd => cd[phase]?.stress)
        .filter(v => v != null)

      const highStressCycles = stressValues.filter(v => v >= 7).length
      const avgStress = stressValues.length >= 2
        ? round(stressValues.reduce((a, b) => a + b, 0) / stressValues.length)
        : null

      if (stressValues.length >= 2 && highStressCycles >= 2 && avgStress >= 7) {
        const phaseMessages = {
          luteal: 'Elevated stress in luteal phase amplifies PMS severity — cortisol and progesterone compete for the same receptor pathway.',
          follicular: 'Elevated stress in follicular phase can suppress the estrogen rise needed for energy, focus, and ovulation.',
          ovulation: 'Chronic stress around ovulation can blunt the LH surge, delaying or suppressing egg release.',
          menstrual: 'High stress during menstruation elevates cortisol, which worsens inflammation, cramping, and fatigue.',
        }

        flags.push({
          id: `chronic_stress_${phase}`,
          severity: avgStress >= 8 ? 'high' : 'medium',
          phase,
          metric: 'stress',
          title: `Chronically elevated stress in ${phase} phase`,
          message: `Your stress averages ${avgStress}/10 during the ${phase} phase across ${stressValues.length} cycles. ${phaseMessages[phase]}`,
          action: `Identify what's driving ${phase}-phase stress — is it workload, social demands, or under-recovery? Protective practices: adaptogenic support (ashwagandha 300mg), limiting new commitments in this phase, and adding 10 minutes of breathwork to your daily routine.`,
          dataPoints: stressValues.length,
          cyclesAffected: highStressCycles,
        })
      }
    })
  }

  // ── FLAG 5: Low recovery going into menstruation ─────────────────────────
  {
    const lowRecoveryCycles = cycles.filter((cycle, i) => {
      const lateLuteal = getLateLuteal(cycle)
      const lateLutealRecovery = avgRing(lateLuteal, 'recoveryIndex')
      return lateLutealRecovery != null && lateLutealRecovery < 50
    })

    if (lowRecoveryCycles.length >= 2) {
      const avgRecoveries = lowRecoveryCycles.map(cycle => {
        const lateLuteal = getLateLuteal(cycle)
        return avgRing(lateLuteal, 'recoveryIndex')
      }).filter(Boolean)
      const avgRecovery = avgRecoveries.length
        ? round(avgRecoveries.reduce((a, b) => a + b, 0) / avgRecoveries.length)
        : null

      flags.push({
        id: 'low_recovery_premenstrual',
        severity: avgRecovery < 35 ? 'high' : 'medium',
        phase: 'luteal',
        metric: 'recovery',
        title: 'Consistently low recovery score entering your period',
        message: `Your ring recovery score averages ${avgRecovery} in the 5 days before your period across ${lowRecoveryCycles.length} cycles — well below the 50-point threshold. You're arriving at menstruation already depleted, which amplifies fatigue and cramping in the first days.`,
        action: 'Treat the 5 days before your period as a deload window: reduce training to maintenance, prioritize 8+ hours sleep, add an extra rest day, and front-load iron-rich foods to prepare for blood loss.',
        dataPoints: lowRecoveryCycles.length,
        cyclesAffected: lowRecoveryCycles.length,
      })
    }
  }

  // ── FLAG 6: Supplement non-adherence in a phase where they measurably help ─
  {
    const phases = ['menstrual', 'follicular', 'ovulation', 'luteal']
    phases.forEach(phase => {
      // Pool all checkins in this phase across all cycles
      const allPhaseCheckins = checkins.filter(c => assignPhase(c) === phase)
      if (allPhaseCheckins.length < 4) return

      const tookSupps = allPhaseCheckins.filter(c => c.supplements_taken === 'yes')
      const skippedSupps = allPhaseCheckins.filter(c => c.supplements_taken === 'no')
      const adherenceRate = round(tookSupps.length / allPhaseCheckins.length * 100)

      if (adherenceRate == null || adherenceRate > 60 || skippedSupps.length < 3 || tookSupps.length < 3) return

      const moodWith = avgOf(tookSupps, 'mood')
      const moodWithout = avgOf(skippedSupps, 'mood')
      const energyWith = avgOf(tookSupps, 'energy')
      const energyWithout = avgOf(skippedSupps, 'energy')

      const moodDiff = moodWith != null && moodWithout != null ? round(moodWith - moodWithout) : null
      const energyDiff = energyWith != null && energyWithout != null ? round(energyWith - energyWithout) : null

      // Only flag if there's a measurable benefit being missed
      if ((moodDiff != null && moodDiff >= 1.5) || (energyDiff != null && energyDiff >= 1.5)) {
        const bestDiff = moodDiff >= (energyDiff || 0) ? { metric: 'mood', diff: moodDiff } : { metric: 'energy', diff: energyDiff }
        flags.push({
          id: `supp_gap_${phase}`,
          severity: bestDiff.diff >= 2.5 ? 'high' : 'low',
          phase,
          metric: 'supplements',
          title: `Missing supplement benefit in ${phase} phase`,
          message: `You're only taking your supplements ${adherenceRate}% of ${phase} days, but your data shows a ${bestDiff.diff}-point ${bestDiff.metric} difference on supplement days vs not (${bestDiff.metric === 'mood' ? moodWith : energyWith} vs ${bestDiff.metric === 'mood' ? moodWithout : energyWithout}). You're leaving a measurable benefit on the table.`,
          action: `Set a daily phone reminder at the same time each ${phase} day — this is the phase where your data most clearly shows a supplement impact.`,
          dataPoints: allPhaseCheckins.length,
          cyclesAffected: null,
        })
      }
    })
  }

  // Sort: high severity first, then by cycles affected (most persistent first)
  return flags.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return (b.cyclesAffected || 0) - (a.cyclesAffected || 0)
  })
}

/**
 * Format risk flags as an AI prompt context string.
 * Inject into AI calls so the model can reference longitudinal patterns.
 */
export function getRiskFlagContext(flags) {
  if (!flags || flags.length === 0) return ''

  let ctx = '\n## LONGITUDINAL RISK FLAGS\n'
  ctx += 'These are persistent patterns detected across multiple cycles — not single-day anomalies.\n'
  ctx += 'Reference them when relevant to explain why certain recommendations are prioritized.\n\n'

  flags.forEach(f => {
    ctx += `### ${f.title} [${f.severity.toUpperCase()}]\n`
    ctx += `${f.message}\n`
    ctx += `Recommended action: ${f.action}\n\n`
  })

  return ctx
}

function round(n) {
  return n !== null && n !== undefined ? Math.round(n * 10) / 10 : null
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}