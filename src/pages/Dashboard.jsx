import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PHASE_DATA, getPhaseFromDay, makeAssignPhase, getTopBloodworkInsights } from './cycleData'
import { fetchUltrahumanData, fetchUltrahumanRange, analyzeTemperature, buildTrends, getScoreColor, getScoreLabel, getSleepStageColor } from './ultrahumanParser'
import { getUserProfile, getProfileContext, getSupplements, saveSupplements, getEstimatedCycleLength } from './userProfile'
import { getResearchContext } from './researchDatabase'
import { getCorrelationContext, analyzeCorrelations, analyzeRiskFlags, getRiskFlagContext } from './correlationEngine'
import { WeeklyReport } from './WeeklyReport'
import { buildSystemMessage, buildUserMessage, callProxy, truncateAtBoundary } from './promptBuilder'

const SHEET_ID = '1MSV0LNsnhWh8tjI_3w-Wzn9iEPz5Jtzz8kqq8wrj8As'
const UH_TOKEN_KEY = 'uh_api_token'
const getUHToken = () => localStorage.getItem(UH_TOKEN_KEY) || ''
const CHECKIN_TAB = 'DailyCheckIn'
const BLOODWORK_TAB = 'Bloodwork'

function fetchSheet(tab) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${tab}`
  return fetch(url)
    .then((r) => r.text())
    .then((text) => {
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/)
      if (!match) throw new Error('Could not parse sheet data')
      const json = JSON.parse(match[1])
      const headers = json.table.cols.map((c) => c.label || '')
      const rows = json.table.rows.map((row) => {
        const obj = {}
        row.c.forEach((cell, i) => {
          if (!cell) { obj[headers[i]] = ''; return }
          let val = cell.v ?? cell.f ?? ''
          // Google Sheets returns dates as "Date(YYYY,M,D)" — convert to YYYY-MM-DD
          if (typeof val === 'string' && val.startsWith('Date(')) {
            const parts = val.match(/Date\((\d+),(\d+),(\d+)/)
            if (parts) {
              val = `${parts[1]}-${String(parseInt(parts[2]) + 1).padStart(2, '0')}-${parts[3].padStart(2, '0')}`
            }
          }
          // Also try formatted value if it looks like a date
          if (headers[i] === 'date' && cell.f && !String(val).match(/^\d{4}-\d{2}-\d{2}$/)) {
            val = cell.f
          }
          obj[headers[i]] = val
        })
        return obj
      })
      return rows
    })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Convert Celsius to Fahrenheit
const cToF = (c) => c != null ? Math.round((c * 9/5 + 32) * 10) / 10 : null

/* ─── SVG Icons ─── */
const Icon = ({ d, size = 16, color = '#A09A90', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={d} />
  </svg>
)

const Icons = {
  sun: (p) => <Icon {...p} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.73-12.73l1.41-1.41M12 6a6 6 0 100 12 6 6 0 000-12z" />,
  moon: (p) => <Icon {...p} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
  heart: (p) => <Icon {...p} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />,
  thermometer: (p) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'#A09A90'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" /></svg>,
  activity: (p) => <Icon {...p} d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  trending: (p) => <Icon {...p} d="M23 6l-9.5 9.5-5-5L1 18" />,
  zap: (p) => <Icon {...p} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  check: (p) => <Icon {...p} d="M20 6L9 17l-5-5" />,
  plus: (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  sparkle: (p) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill={p.color||'#C4948A'} stroke="none"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" /></svg>,
  droplet: (p) => <Icon {...p} d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />,
  shield: (p) => <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  ring: (p) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'#A09A90'} strokeWidth="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></svg>,
  chart: (p) => <Icon {...p} d="M18 20V10M12 20V4M6 20v-6" />,
  flask: (p) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'#A09A90'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M10 3v7.4a2 2 0 01-.5 1.3L4 19a2 2 0 001.5 3h13a2 2 0 001.5-3l-5.5-7.3a2 2 0 01-.5-1.3V3" /></svg>,
  footprints: (p) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'#A09A90'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5 10 7.39 9 9 8 10H4" /><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6-1.87 0-2.5 1.8-2.5 3.5 0 1.89 1 3.5 2 4.5h4" /></svg>,
  refresh: ({ size = 16, color = '#A09A90', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.5" strokeDasharray="4 2.5" />
      <circle cx="12" cy="3.5" r="2" fill="#C4948A" />
      <circle cx="20.5" cy="12" r="2" fill="#9BAF93" />
      <circle cx="12" cy="20.5" r="2" fill="#C9A96E" />
      <circle cx="3.5" cy="12" r="2" fill="#9C8FBF" />
    </svg>
  ),
  xMark: (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />,
  pill: (p) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'#A09A90'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 1.5l-8 8a4.95 4.95 0 007 7l8-8a4.95 4.95 0 00-7-7z" /><line x1="8.5" y1="8.5" x2="15.5" y2="15.5" /></svg>,
  logo: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#C4948A" /><stop offset="100%" stopColor="#9BAF93" /></linearGradient></defs>
      <circle cx="20" cy="20" r="18" fill="url(#lg)" />
      <path d="M20 8 A12 12 0 0 1 20 32" fill="rgba(255,255,255,0.35)" />
    </svg>
  ),
}

const insightTypeIcons = {
  sleep: Icons.moon,
  recovery: Icons.shield,
  cycle: Icons.refresh,
  nutrition: Icons.droplet,
  activity: Icons.activity,
  temperature: Icons.thermometer,
}

const insightTypeColors = {
  sleep: '#6B7DB3', recovery: '#9BAF93', cycle: '#C4948A',
  nutrition: '#C9A96E', activity: '#7AA38F', temperature: '#B07A6E',
}

/* ─── AI Insights Component ─── */
function AIInsights({ checkins, bloodwork, wearable, phase, phaseKey, tempAnalysis, ringDays, insights, setInsights, riskFlags, todayCycleDay }) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Auto-load from cache on mount, auto-generate if no cache exists and we have data
  useEffect(() => {
    if (insights) return  // Already have insights
    const today = new Date().toISOString().split('T')[0]
    const latestCheckinDate = checkins[checkins.length - 1]?.date || ''
    const cacheKey = `insights_${today}_${latestCheckinDate}_${phaseKey || ''}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed?.length > 0) { setInsights(parsed); return }
      } catch {}
    }
    // No cache — auto-generate if we have enough data
    if (checkins.length >= 1 || wearable) {
      generateInsights()
    }
  }, [checkins.length, phaseKey])

  const generateInsights = async () => {
    // Cache check — skip API if data hasn't changed since last generation
    const today = new Date().toISOString().split('T')[0]
    const latestCheckinDate = checkins[checkins.length - 1]?.date || ''
    const cacheKey = `insights_${today}_${latestCheckinDate}_${phaseKey || ''}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed?.length > 0) { setInsights(parsed); return }
      } catch {}
    }

    setLoading(true)

    try {
      const recentCheckins = checkins.slice(-5)  // Reduced from 7 to 5 to shrink prompt
      const flaggedBW = bloodwork.filter((b) => b.status === 'low' || b.status === 'high').slice(0, 3)

      // Pull past weekly summaries for context
      const pastMemory = (() => {
        try {
          const memory = JSON.parse(localStorage.getItem('weeklyMemory') || '[]')
          if (memory.length === 0) return ''
          const latest = memory[0]
          return `\nRecent history: Week of ${latest.week} scored ${latest.overallScore}/10 — ${latest.scoreSummary}\n`
        } catch { return '' }
      })()

      const system = buildSystemMessage('women\'s health analyst', `- Exactly 3 insights. Each body: 1-2 concise sentences — state the observation with a number, then briefly note the hormonal connection.
- When yesterday's activities are provided, consider how they may have affected today's metrics (exercise recovery, diet effects, and supplement impacts often manifest the following day).

OUTPUT FORMAT:
{"insights":[{"title":"4-6 words","body":"1-2 concise sentences with data and hormonal why","type":"sleep|recovery|cycle|nutrition|activity|temperature"}]}`)

      const wearableSection = wearable
        ? `HRV: ${wearable.avgSleepHrv}ms | RHR: ${wearable.nightRhr}bpm | Sleep: ${wearable.sleepScore} | Recovery: ${wearable.recoveryIndex}${wearable.avgSleepTemp ? `\nSkin temp deviation: ${wearable.avgSleepTemp > 0 ? '+' : ''}${wearable.avgSleepTemp?.toFixed(2)}°C from baseline (deviations only — not comparable to BBT)` : ''}`
        : 'No wearable data'

      // Day-within-phase: e.g. "Day 8 of 12" in luteal
      const phasePosition = (() => {
        if (!phase || !todayCycleDay) return ''
        const rangeMatch = phase.days.match(/(\d+)[–-](\d+)/)
        if (!rangeMatch) return ''
        const phaseStart = parseInt(rangeMatch[1])
        const phaseEnd = parseInt(rangeMatch[2])
        const dayInPhase = todayCycleDay - phaseStart + 1
        const totalDays = phaseEnd - phaseStart + 1
        return ` — Day ${dayInPhase} of ${totalDays}`
      })()

      // Yesterday→Today lag context for causal AI reasoning
      const yesterdayToday = (() => {
        const now = new Date()
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const yest = new Date(now)
        yest.setDate(yest.getDate() - 1)
        const yesterdayStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`

        const yesterdayCheckin = checkins.find(c => c.date === yesterdayStr)
        const todayCheckin = checkins.find(c => c.date === todayStr)
        if (!yesterdayCheckin || !todayCheckin) return ''

        const diff = (field) => {
          const t = parseFloat(todayCheckin[field])
          const y = parseFloat(yesterdayCheckin[field])
          if (isNaN(t) || isNaN(y)) return ''
          const d = Math.round((t - y) * 10) / 10
          return d > 0 ? ` (+${d})` : d < 0 ? ` (${d})` : ' (=)'
        }

        let text = `Yesterday (Day ${yesterdayCheckin.cycle_day || '?'}): `
        const parts = []
        if (yesterdayCheckin.workout_types?.trim()) parts.push(`Did ${yesterdayCheckin.workout_types}`)
        else if (yesterdayCheckin.activity === 'rest') parts.push('Rest day')
        if (yesterdayCheckin.diet_tags?.trim()) parts.push(`Diet: ${yesterdayCheckin.diet_tags}`)
        if (yesterdayCheckin.supplements_taken) parts.push(`Supplements: ${yesterdayCheckin.supplements_taken}`)
        text += parts.length > 0 ? parts.join(' | ') : 'No activity/diet data'
        text += ` | Mood: ${yesterdayCheckin.mood || '?'}, Energy: ${yesterdayCheckin.energy || '?'}`

        text += `\nToday (Day ${todayCheckin.cycle_day || '?'}): `
        text += `Mood: ${todayCheckin.mood || '?'}${diff('mood')}, Energy: ${todayCheckin.energy || '?'}${diff('energy')}, Stress: ${todayCheckin.stress || '?'}${diff('stress')}, Sleep: ${todayCheckin.sleep_quality || '?'}`

        // Highlight notable swings (>= 2 points)
        const moodSwing = parseFloat(todayCheckin.mood) - parseFloat(yesterdayCheckin.mood)
        const energySwing = parseFloat(todayCheckin.energy) - parseFloat(yesterdayCheckin.energy)
        const notables = []
        if (!isNaN(moodSwing) && Math.abs(moodSwing) >= 2) notables.push(`mood ${moodSwing > 0 ? 'rose' : 'dropped'} ${Math.abs(moodSwing)} points`)
        if (!isNaN(energySwing) && Math.abs(energySwing) >= 2) notables.push(`energy ${energySwing > 0 ? 'rose' : 'dropped'} ${Math.abs(energySwing)} points`)
        if (notables.length > 0 && yesterdayCheckin.workout_types?.trim()) {
          text += `\nNotable: ${notables.join(' and ')} after ${yesterdayCheckin.workout_types} in ${phaseKey || 'unknown'} phase`
        } else if (notables.length > 0) {
          text += `\nNotable: ${notables.join(' and ')}`
        }
        return text
      })()

      const userMessage = buildUserMessage([
        { heading: 'User Profile', content: getProfileContext() },
        { heading: 'Recent History', content: pastMemory },
        { heading: 'Current Phase', content: phase ? `${phase.name} (Days ${phase.days})${phasePosition} — ${phaseKey && PHASE_DATA[phaseKey] ? PHASE_DATA[phaseKey].hormones || '' : ''}` : 'Unknown' },
        { heading: 'Recent Check-ins (1-10 scale)', content: recentCheckins.map(c => `Day ${c.cycle_day}: mood=${c.mood} energy=${c.energy} stress=${c.stress} sleep=${c.sleep_quality || '?'} sx=[${c.symptoms || 'none'}] BBT=${c.bbt || '?'}°F CM=${c.cervical_mucus || '-'}`).join('\n') },
        { heading: 'Yesterday → Today', content: yesterdayToday },
        { heading: 'Wearable Data', content: wearableSection },
        { heading: 'Bloodwork Flags', content: flaggedBW.length > 0 ? flaggedBW.map(b => `${b.test_name} ${b.status}`).join(', ') : 'none' },
        { heading: 'BBT Ovulation', content: tempAnalysis ? (tempAnalysis.ovulationDetected ? 'Detected' : 'Not detected') : 'Unknown' },
        { heading: 'Risk Flags', content: getRiskFlagContext(riskFlags) },
      ])

      const parsed = await callProxy({ system, userMessage, maxTokens: 400 })
      setInsights(parsed.insights)
      // Cache for the day
      localStorage.setItem(cacheKey, JSON.stringify(parsed.insights))
      // Clean up old cache keys
      Object.keys(localStorage).filter(k => k.startsWith('insights_') && k !== cacheKey).forEach(k => localStorage.removeItem(k))
    } catch (err) {
      console.error('AI insights error:', err)
      setInsights([{ title: 'Could not load insights', body: 'Check your connection and try again.', type: 'cycle' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
      borderRadius: 16, overflow: 'hidden', marginBottom: 14,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #C4948A18, #9BAF9318)',
        padding: '16px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icons.sparkle size={18} color="#C4948A" />
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825' }}>
              Personal Insights
            </div>
            <div style={{ fontSize: 11, color: '#A09A90' }}>
              AI analysis of your check-in, ring & bloodwork data
            </div>
          </div>
        </div>

        {insights && (
          <button onClick={generateInsights} className="cursor-pointer" style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#A09A90',
            background: 'none', border: '1px solid #E8E4DD', borderRadius: 6, padding: '5px 10px',
          }}>Refresh</button>
        )}
      </div>

      {loading && (
        <div style={{ padding: '30px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#A09A90' }}>Analyzing your data...</div>
          <div style={{ marginTop: 8, height: 3, background: '#E8E4DD', borderRadius: 2, overflow: 'hidden', maxWidth: 200, margin: '8px auto 0' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #C4948A, #9BAF93)', borderRadius: 2, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      {insights && (
        <div style={{ padding: '14px 18px' }}>
          {insights.slice(0, expanded ? undefined : 3).map((insight, i) => {
            const TypeIcon = insightTypeIcons[insight.type] || Icons.sparkle
            const typeColor = insightTypeColors[insight.type] || '#A09A90'
            return (
              <div key={i} style={{
                padding: '12px 0',
                borderBottom: i < (expanded ? insights.length : Math.min(insights.length, 3)) - 1 ? '1px solid #F0EDE8' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <TypeIcon size={14} color={typeColor} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2C2825' }}>{insight.title}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 600, color: typeColor,
                    background: typeColor + '15', borderRadius: 4, padding: '2px 6px',
                  }}>{(insight.type || 'insight').charAt(0).toUpperCase() + (insight.type || 'insight').slice(1)}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6B635A', lineHeight: 1.7, paddingLeft: 22 }}>
                  {insight.body}
                </div>
              </div>
            )
          })}
          {insights.length > 3 && (
            <button onClick={() => setExpanded(!expanded)} className="cursor-pointer" style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09A90',
              background: 'none', border: 'none', padding: '8px 0 0', width: '100%', textAlign: 'center',
            }}>{expanded ? 'Show less' : `Show ${insights.length - 3} more`}</button>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Phase Tab Components ─── */

function PhasePill({ phaseKey: pk, isActive, onClick }) {
  const p = PHASE_DATA[pk]
  if (!p) return null
  return (
    <button onClick={onClick} className="cursor-pointer" style={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 12, fontWeight: isActive ? 600 : 400,
      color: isActive ? '#FFFEF9' : p.color,
      background: isActive ? p.color : `${p.color}15`,
      border: 'none', borderRadius: 20,
      padding: '7px 16px', transition: 'all 0.2s', whiteSpace: 'nowrap',
    }}>
      {p.name}
    </button>
  )
}

function PhaseSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: 16, color: '#2C2825', marginBottom: 8,
      }}>{title}</div>
      {children}
    </div>
  )
}

function PersonalizedRecs({ phase, selectedPhase, allRecs, setAllRecs, checkins: allCheckins, bloodwork = [], wearable = null, tempAnalysis = null }) {
  const [loading, setLoading] = useState(false)
  const recs = allRecs[selectedPhase] || null

  const generateAllRecs = async () => {
    setLoading(true)
    try {
      const phases = Object.entries(PHASE_DATA)
      // Use consistent phase assignment — anchored to detected ovulation if available
      const ovulDateStr = tempAnalysis?.estimatedOvulationDate
      const ovulCheckin = ovulDateStr ? allCheckins.find(c => c.date === ovulDateStr) : null
      const detectedOvulDay = ovulCheckin?.cycle_day ? parseInt(ovulCheckin.cycle_day) : null
      const assignPhase = makeAssignPhase(detectedOvulDay)

      const phaseDataSummaries = phases.map(([key, ph]) => {
        const phCheckins = allCheckins.filter((c) => assignPhase(c) === key)
        const avg = (field) => {
          const vals = phCheckins.map((c) => parseFloat(c[field])).filter((v) => !isNaN(v))
          return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null
        }
        const symptoms = {}
        const workouts = {}
        let suppYes = 0, suppTotal = 0
        phCheckins.forEach((c) => {
          if (c.symptoms) c.symptoms.split(',').forEach((s) => {
            const t = s.trim()
            if (t && t !== 'None') symptoms[t] = (symptoms[t] || 0) + 1
          })
          if (c.workout_types) c.workout_types.split(',').forEach((w) => {
            const t = w.trim()
            if (t) workouts[t] = (workouts[t] || 0) + 1
          })
          suppTotal++
          if (c.supplements_taken === 'yes') suppYes++
        })
        const topSx = Object.entries(symptoms).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s]) => s)
        const topWorkouts = Object.entries(workouts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w, c]) => `${w} (${c}x)`)
        const suppRate = suppTotal > 0 ? Math.round((suppYes / suppTotal) * 100) : null
        return { key, name: ph.name, days: ph.days, hormones: ph.hormones || '', body: ph.body || '',
          mood: avg('mood'), energy: avg('energy'), stress: avg('stress'), sleep: avg('sleep_quality'),
          symptoms: topSx, workouts: topWorkouts, suppRate, checkins: phCheckins.length }
      })

      const profileCtx = getProfileContext()
      const profile = getUserProfile()
      const userConditions = profile?.conditions || []
      const results = {}

      // Run all 4 phase requests in PARALLEL — ~4x faster than sequential
      const recsSystem = buildSystemMessage('evidence-based women\'s health coach', `- Every recommendation must cite the mechanism (e.g. "supports progesterone via...").
- Prioritize recommendations backed by the research evidence provided. Label anything not from the evidence section as "general guidance."
- Tailor to this user's conditions, symptoms, and personal data patterns.

OUTPUT FORMAT (3 items per category, 2 for avoid, use " -- " separator):
{"foods":["food -- mechanism","food -- mechanism","food -- mechanism"],"workouts":["workout -- reason","workout -- reason","workout -- reason"],"activities":["activity -- benefit","activity -- benefit","activity -- benefit"],"avoid":["thing -- reason","thing -- reason"],"summary":"One personalized sentence for this phase"}`)

      const fetchPhase = async (ph) => {
        const flaggedBW = bloodwork.filter((b) => b.status === 'low' || b.status === 'high')
        const userContext = {
          symptoms: ph.symptoms,
          bloodworkFlags: flaggedBW,
          latestCheckin: { mood: ph.mood, energy: ph.energy, stress: ph.stress, sleep_quality: ph.sleep },
          wearableToday: wearable,
        }
        const researchCtx = truncateAtBoundary(getResearchContext(ph.key, userConditions, userContext), 3000)
        const correlationCtx = truncateAtBoundary(getCorrelationContext(allCheckins, detectedOvulDay), 800)

        const userMessage = buildUserMessage([
          { heading: 'User Profile', content: profileCtx },
          { heading: `${ph.name} Phase Data (Days ${ph.days}, ${ph.checkins} check-ins)`, content: `Mood: ${ph.mood ?? '?'} | Energy: ${ph.energy ?? '?'} | Stress: ${ph.stress ?? '?'} | Sleep: ${ph.sleep ?? '?'}\nSymptoms: ${ph.symptoms.join(', ') || 'none'}\nWorkouts: ${ph.workouts.join(', ') || 'none'}\nSupplement adherence: ${ph.suppRate != null ? ph.suppRate + '%' : 'unknown'}` },
          { heading: 'Evidence-Based Research', content: researchCtx },
          { heading: 'Personal Data Correlations', content: correlationCtx },
        ])

        try {
          const data = await callProxy({ system: recsSystem, userMessage, maxTokens: 500 })
          return { key: ph.key, data }
        } catch {
          return { key: ph.key, data: { foods: [], workouts: [], activities: [], avoid: [], summary: 'Try regenerating.' } }
        }
      }

      // Fire all 4 phase requests simultaneously, update UI as each resolves
      const promises = phaseDataSummaries.map(ph =>
        fetchPhase(ph)
          .then(({ key, data }) => {
            results[key] = data
            setAllRecs({ ...results })  // Progressive update — each phase appears as it finishes
          })
          .catch(err => {
            console.error(`Recs error for ${ph.name}:`, err)
            results[ph.key] = { foods: [], workouts: [], activities: [], avoid: [], summary: 'Try regenerating.' }
            setAllRecs({ ...results })
          })
      )
      await Promise.all(promises)
    } catch (err) {
      console.error('Recs error:', err)
    } finally {
      setLoading(false)
    }
  }

  const hasAnyRecs = Object.keys(allRecs).length > 0

  return (
    <div style={{
      background: '#FFFEF9', border: `1.5px solid ${phase.color}25`,
      borderRadius: 16, overflow: 'hidden', marginBottom: 14,
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${phase.color}15, ${phase.color}05)`,
        padding: '14px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.sparkle size={16} color={phase.color} />
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, color: '#2C2825' }}>
              Your {phase.name} Plan
            </div>
            <div style={{ fontSize: 11, color: '#A09A90' }}>Personalized to your patterns</div>
          </div>
        </div>
        {!hasAnyRecs && !loading && (
          <button onClick={generateAllRecs} className="cursor-pointer" style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            color: 'white', background: phase.color, border: 'none',
            borderRadius: 8, padding: '8px 16px',
          }}>Generate</button>
        )}
        {hasAnyRecs && (
          <button onClick={generateAllRecs} className="cursor-pointer" style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#A09A90',
            background: 'none', border: '1px solid #E8E4DD', borderRadius: 6, padding: '5px 10px',
          }}>Refresh</button>
        )}
      </div>

      {loading && (
        <div style={{ padding: '24px 18px', textAlign: 'center', fontSize: 13, color: '#A09A90' }}>
          Building plans for all phases...
        </div>
      )}

      {recs && (
        <div style={{ padding: '14px 18px' }}>
          <div style={{
            fontSize: 13, color: '#2C2825', lineHeight: 1.6,
            marginBottom: 16, fontStyle: 'italic',
            borderLeft: `3px solid ${phase.color}40`, paddingLeft: 12,
          }}>{recs.summary}</div>
          <RecSection icon={Icons.droplet} title="Eat This" color="#9BAF93" items={recs.foods} />
          <RecSection icon={Icons.activity} title="Move Like This" color="#C9A96E" items={recs.workouts} />
          <RecSection icon={Icons.heart} title="Self-Care" color="#6B7DB3" items={recs.activities} />
          {recs.avoid && recs.avoid.length > 0 && (
            <RecSection icon={Icons.xMark} title="Ease Up On" color="#C4948A" items={recs.avoid} />
          )}
        </div>
      )}
    </div>
  )
}

function RecSection({ icon: IconComp, title, color, items }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <IconComp size={13} color={color} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#2C2825' }}>{title}</span>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', gap: 8, alignItems: 'flex-start',
          fontSize: 12, color: '#6B635A', lineHeight: 1.6,
          marginBottom: 4, paddingLeft: 19,
        }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: color, marginTop: 7, flexShrink: 0 }} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}

function PhaseTab({ checkins, bloodwork = [], wearable = null, phaseKey: currentPhaseKey, phase: currentPhase, latest, todayCycleDay, tempAnalysis = null }) {
  const [selectedPhase, setSelectedPhase] = useState(currentPhaseKey || 'menstrual')
  const [allRecs, setAllRecs] = useState({})
  const p = PHASE_DATA[selectedPhase]
  
  if (!p) return (
    <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: '#A09A90' }}>
      No phase data available. Log your cycle day in check-ins to see phase insights.
    </div>
  )

  const ovulDateStr = tempAnalysis?.estimatedOvulationDate
  const ovulCheckin = ovulDateStr ? checkins.find(c => c.date === ovulDateStr) : null
  const detectedOvulDay = ovulCheckin?.cycle_day ? parseInt(ovulCheckin.cycle_day) : null
  const assignPhase = makeAssignPhase(detectedOvulDay)

  const phaseCheckins = checkins.filter((c) => assignPhase(c) === selectedPhase)

  const avg = (field) => {
    const vals = phaseCheckins.map((c) => parseFloat(c[field])).filter((v) => !isNaN(v))
    if (vals.length === 0) return null
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  }

  const phaseSymptomCounts = {}
  phaseCheckins.forEach((c) => {
    if (c.symptoms) {
      c.symptoms.split(',').forEach((s) => {
        const trimmed = s.trim()
        if (trimmed && trimmed !== 'None') phaseSymptomCounts[trimmed] = (phaseSymptomCounts[trimmed] || 0) + 1
      })
    }
  })

  return (
    <>
      {/* Phase Selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {Object.keys(PHASE_DATA).map((pk) => (
          <PhasePill key={pk} phaseKey={pk} isActive={selectedPhase === pk} onClick={() => setSelectedPhase(pk)} />
        ))}
      </div>

      {/* Phase Summary Bar */}
      <div style={{
        background: p.color, borderRadius: 12, padding: '14px 18px',
        color: 'white', marginBottom: 14,
        boxShadow: `0 4px 20px ${p.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, marginBottom: 2 }}>
            {p.name} Phase
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            {selectedPhase === currentPhaseKey && todayCycleDay
              ? `Day ${todayCycleDay} · Days ${p.days}`
              : `Days ${p.days}`
            }
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {selectedPhase === currentPhaseKey && (
            <div style={{
              fontSize: 10, fontWeight: 600,
              background: 'rgba(255,255,255,0.25)', display: 'inline-block',
              borderRadius: 10, padding: '2px 8px',
            }}>You're here · Day {todayCycleDay || '?'}</div>
          )}
          {p.tagline && !currentPhaseKey && selectedPhase !== currentPhaseKey && (
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 13, fontStyle: 'italic', opacity: 0.85 }}>
              "{p.tagline}"
            </div>
          )}
        </div>
      </div>

      {/* Unknown phase hint */}
      {!currentPhaseKey && (
        <div style={{
          background: '#F6F4F0', borderRadius: 10, padding: '10px 14px', marginBottom: 14,
          fontSize: 12, color: '#8A8279', lineHeight: 1.5, textAlign: 'center',
        }}>
          Your cycle day isn't set yet — enter it in your next check-in to see which phase you're in
        </div>
      )}

      {/* Personalized Recs — FIRST, hero position */}
      <PersonalizedRecs
        phase={p} selectedPhase={selectedPhase}
        allRecs={allRecs} setAllRecs={setAllRecs}
        checkins={checkins}
        bloodwork={bloodwork}
        wearable={wearable}
        tempAnalysis={tempAnalysis}
      />

      {/* General Guidance */}
      <div style={{
        fontSize: 10, fontWeight: 600, color: '#A09A90',
        marginBottom: 8, marginTop: 4, paddingLeft: 2,
      }}>General Guidance</div>

      <div style={{
        background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
        borderRadius: 16, padding: '16px 18px', marginBottom: 14,
      }}>
        {p.hormones && <PhaseSection title="What's happening hormonally">
          <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>{p.hormones}</p>
        </PhaseSection>}
        {p.body && <PhaseSection title="Your body">
          <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>{p.body}</p>
        </PhaseSection>}
        {p.mood && <PhaseSection title="Mood & mind">
          <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>{p.mood}</p>
        </PhaseSection>}
      </div>

      <div style={{
        background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
        borderRadius: 16, padding: '16px 18px', marginBottom: 14,
      }}>
        {p.workout && <PhaseSection title="Workout recommendations">
          <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>{p.workout}</p>
        </PhaseSection>}
        {p.nutrition && <PhaseSection title="Nutrition focus">
          <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>{p.nutrition}</p>
        </PhaseSection>}
        {p.supplements && <PhaseSection title="Supplement focus">
          <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>{p.supplements}</p>
        </PhaseSection>}
      </div>

      {/* Do / Avoid */}
      {(p.doThis || p.avoidThis) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {p.doThis && (
            <div style={{ flex: 1, background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)', borderRadius: 14, padding: '14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9BAF93', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icons.check size={11} color="#9BAF93" /> Do this
              </div>
              {p.doThis.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 12, color: '#2C2825', lineHeight: 1.5, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#9BAF93', marginTop: 6, flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
          {p.avoidThis && (
            <div style={{ flex: 1, background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)', borderRadius: 14, padding: '14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#C4948A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icons.xMark size={11} color="#C4948A" /> Avoid
              </div>
              {p.avoidThis.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 12, color: '#2C2825', lineHeight: 1.5, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C4948A', marginTop: 6, flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: 11, color: '#C8C3BA', paddingBottom: 10 }}>
        Recommendations are general guidance — consult your healthcare provider for personalized advice.
      </div>
    </>
  )
}

/* ─── Connected Devices ─── */
function ConnectedDevices({ uhConnected, onConnectUH, onDisconnectUH }) {
  const [showUHInput, setShowUHInput] = useState(false)
  const [tokenInput, setTokenInput] = useState('')

  const devices = [
    {
      id: 'ultrahuman',
      name: 'Ultrahuman Ring Air',
      icon: Icons.ring,
      connected: uhConnected,
      color: '#C9A96E',
      onConnect: () => setShowUHInput(true),
      onDisconnect: onDisconnectUH,
      helpText: 'Find your token at partner.ultrahuman.com → Personal API Token',
    },
    {
      id: 'oura',
      name: 'Oura Ring',
      icon: Icons.ring,
      connected: false,
      color: '#6B7DB3',
      comingSoon: true,
    },
    {
      id: 'apple',
      name: 'Apple Watch',
      icon: Icons.heart,
      connected: false,
      color: '#8A8279',
      comingSoon: true,
    },
  ]

  return (
    <div style={{
      background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
      borderRadius: 16, padding: '16px 18px', marginBottom: 14,
    }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, color: '#2C2825', marginBottom: 14 }}>
        Connected Devices
      </div>

      {devices.map((device) => (
        <div key={device.id} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
          borderBottom: '1px solid #F0EDE8',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: device.connected ? `${device.color}15` : '#F6F4F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <device.icon size={16} color={device.connected ? device.color : '#C8C3BA'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#2C2825' }}>{device.name}</div>
            <div style={{ fontSize: 11, color: device.connected ? '#7A9470' : '#A09A90' }}>
              {device.connected ? '✓ Connected' : device.comingSoon ? 'Coming soon' : 'Not connected'}
            </div>
          </div>
          {device.connected ? (
            <button onClick={device.onDisconnect} className="cursor-pointer" style={{
              fontSize: 11, color: '#C4948A', background: 'none', border: '1px solid #C4948A30',
              borderRadius: 8, padding: '4px 10px', fontFamily: "'DM Sans', sans-serif",
            }}>Disconnect</button>
          ) : !device.comingSoon ? (
            <button onClick={device.onConnect} className="cursor-pointer" style={{
              fontSize: 11, color: 'white', background: device.color, border: 'none',
              borderRadius: 8, padding: '5px 12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            }}>Connect</button>
          ) : (
            <span style={{ fontSize: 10, color: '#C8C3BA', fontStyle: 'italic' }}>Soon</span>
          )}
        </div>
      ))}

      {/* Ultrahuman Token Input */}
      {showUHInput && (
        <div style={{ marginTop: 12, padding: '12px', background: '#F6F4F0', borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: '#8A8279', marginBottom: 8 }}>
            Paste your Ultrahuman Personal API Token
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. uh_abc123..."
              style={{
                flex: 1, padding: '8px 12px', fontSize: 12, borderRadius: 8,
                border: '1px solid #E8E4DD', background: 'white', fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
              }}
            />
            <button
              onClick={() => { if (tokenInput.trim()) { onConnectUH(tokenInput.trim()); setShowUHInput(false) } }}
              className="cursor-pointer"
              style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600, color: 'white',
                background: '#C9A96E', border: 'none', borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >Save</button>
          </div>
          <div style={{ fontSize: 10, color: '#A09A90', marginTop: 6 }}>
            Find your token at partner.ultrahuman.com → Settings → Personal API Token
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('today')
  const [checkins, setCheckins] = useState([])
  const [bloodwork, setBloodwork] = useState([])
  const [wearable, setWearable] = useState(null)
  const [ringDays, setRingDays] = useState([])
  const [tempAnalysis, setTempAnalysis] = useState(null)
  const [trends, setTrends] = useState(null)
  const [wearableError, setWearableError] = useState(null)
  const [insights, setInsights] = useState(null)
  const [riskFlags, setRiskFlags] = useState([])
  const [loading, setLoading] = useState(true)
  const [bloodworkExpanded, setBloodworkExpanded] = useState(false)
  const [suppExpanded, setSuppExpanded] = useState(false)
  const [expandedSymptom, setExpandedSymptom] = useState(null)
  const [selectedCycleDay, setSelectedCycleDay] = useState(null)
  const [showOvTooltip, setShowOvTooltip] = useState(false)
  const [suppProtocol, setSuppProtocol] = useState(() => getSupplements())
  const [profileName, setProfileName] = useState(() => {
    try { return JSON.parse(localStorage.getItem('onboardingAnswers') || '{}').name || '' } catch { return '' }
  })
  const [profileBirthday, setProfileBirthday] = useState(() => {
    try { return JSON.parse(localStorage.getItem('onboardingAnswers') || '{}').birthday || '' } catch { return '' }
  })
  const [suppInput, setSuppInput] = useState('')
  const [suppAiTips, setSuppAiTips] = useState(null)
  const [suppAiLoading, setSuppAiLoading] = useState(false)

  const fetchWearable = (date) => {
    if (!getUHToken()) return Promise.resolve(null)
    return fetchUltrahumanData(getUHToken(), date).catch((e) => { setWearableError(e.message); return null })
  }

  useEffect(() => {
    const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    Promise.all([
      fetchSheet(CHECKIN_TAB).catch(() => []),
      fetchSheet(BLOODWORK_TAB).catch(() => []),
      fetchWearable(today).then((data) => {
        // Fall back to yesterday if today has no sleep data yet
        if (data && data.sleepScore) return data
        return fetchWearable(yesterday)
      }),
      getUHToken() ? fetchUltrahumanRange(getUHToken(), 30).catch(() => []) : Promise.resolve([]),
    ]).then(([ci, bw, uh, days]) => {
      // ─── Phase Backfill: retroactively assign cycle_day to checkins missing it ───
      const sorted = [...ci].sort((a, b) => a.date?.localeCompare(b.date))
      const profile = getUserProfile()
      const estimatedCycleLen = getEstimatedCycleLength()

      // Find all period start dates (Day 1s)
      const periodStarts = []

      // First: use onboarding last_period_date as an anchor if no Day 1 exists before it
      if (profile?.lastPeriodDate) {
        const onboardingDate = profile.lastPeriodDate
        const existingDay1OnDate = sorted.find(c => c.date === onboardingDate && parseInt(c.cycle_day) === 1)
        if (!existingDay1OnDate) {
          const anchorIdx = sorted.findIndex(c => c.date >= onboardingDate)
          periodStarts.push({ idx: anchorIdx >= 0 ? anchorIdx : 0, date: onboardingDate, virtual: true })
        }
      }

      sorted.forEach((c, i) => {
        if (parseInt(c.cycle_day) === 1) {
          if (!periodStarts.some(ps => ps.date === c.date)) {
            periodStarts.push({ idx: i, date: c.date })
          }
        } else if (c.period === 'yes') {
          // Only create new cycle anchor if 18+ days since last period start.
          // Prevents mid-period check-ins (Day 3/4/5) from being treated as Day 1.
          const lastKnownStart = periodStarts.length > 0 ? periodStarts[periodStarts.length - 1].date : null
          const daysSinceLast = lastKnownStart
            ? Math.round((new Date(c.date + 'T12:00:00') - new Date(lastKnownStart + 'T12:00:00')) / (1000 * 60 * 60 * 24))
            : 999
          if (daysSinceLast >= 18) {
            // Walk back through consecutive period=yes days to find the actual first day
            let startIdx = i
            while (startIdx > 0 && sorted[startIdx - 1].period === 'yes') startIdx--
            const trueStartDate = sorted[startIdx].date
            if (!periodStarts.some(ps => ps.date === trueStartDate)) {
              periodStarts.push({ idx: startIdx, date: trueStartDate })
            }
          }
        }
      })

      // Sort period starts chronologically
      periodStarts.sort((a, b) => a.date.localeCompare(b.date))

      if (periodStarts.length > 0) {
        periodStarts.forEach((ps, psIdx) => {
          const nextStart = periodStarts[psIdx + 1]
          const cycleLen = nextStart
            ? Math.round((new Date(nextStart.date + 'T12:00:00') - new Date(ps.date + 'T12:00:00')) / (1000 * 60 * 60 * 24))
            : estimatedCycleLen

          for (let i = (ps.virtual ? 0 : ps.idx - 1); i >= 0; i--) {
            if (sorted[i].cycle_day && !isNaN(parseInt(sorted[i].cycle_day))) break
            const daysBefore = Math.round((new Date(ps.date + 'T12:00:00') - new Date(sorted[i].date + 'T12:00:00')) / (1000 * 60 * 60 * 24))
            const prevLen = psIdx > 0
              ? Math.round((new Date(ps.date + 'T12:00:00') - new Date(periodStarts[psIdx - 1].date + 'T12:00:00')) / (1000 * 60 * 60 * 24))
              : estimatedCycleLen
            const assignedDay = prevLen - daysBefore + 1
            if (assignedDay > 0 && assignedDay <= 60) {
              sorted[i].cycle_day = String(assignedDay)
              sorted[i].cycle_phase = getPhaseFromDay(assignedDay) || sorted[i].cycle_phase
            }
          }

          for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].date < ps.date) continue
            if (periodStarts.some(p => p !== ps && p.date === sorted[i].date && periodStarts.indexOf(p) > psIdx)) break
            const daysAfter = Math.round((new Date(sorted[i].date + 'T12:00:00') - new Date(ps.date + 'T12:00:00')) / (1000 * 60 * 60 * 24))
            const day = daysAfter + 1
            const existingDay = parseInt(sorted[i].cycle_day)
            const isStale = sorted[i].period === 'yes' && existingDay > 15
            if (!sorted[i].cycle_day || isNaN(existingDay) || isStale) {
              sorted[i].cycle_day = String(day)
              sorted[i].cycle_phase = getPhaseFromDay(day) || sorted[i].cycle_phase
            }
          }
        })
      }

      setCheckins(sorted)
      setBloodwork(bw)
      console.log('Wearable loaded:', uh ? { date: uh.date, sleep: uh.sleepScore, steps: uh.steps, temp: uh.avgSleepTemp } : 'null')
      console.log('Ring days loaded:', days.length)
      if (uh) setWearable(uh)
      if (days.length > 0) {
        setRingDays(days)
        setTrends(buildTrends(days))
        setTempAnalysis(analyzeTemperature(days, sorted))
      }
    }).finally(() => setLoading(false))

    const interval = setInterval(() => {
      const now = new Date().toISOString().split('T')[0]
      fetchWearable(now).then((uh) => { if (uh) setWearable(uh) })
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const latest = checkins.length > 0 ? checkins[checkins.length - 1] : null

  // Compute today's actual cycle day by incrementing from last check-in
  const todayCycleDay = (() => {
    if (!latest || !latest.cycle_day || isNaN(parseInt(latest.cycle_day))) return null
    const lastDate = new Date(latest.date + 'T12:00:00')
    const now = new Date()
    const nowDate = new Date(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T12:00:00`)
    const daysDiff = Math.round((nowDate - lastDate) / (1000 * 60 * 60 * 24))
    const computed = parseInt(latest.cycle_day) + daysDiff
    return computed > 0 && computed <= 60 ? computed : parseInt(latest.cycle_day)
  })()

  const phaseKey = todayCycleDay ? getPhaseFromDay(todayCycleDay) : null
  const phase = phaseKey ? PHASE_DATA[phaseKey] : null

  const moodData = checkins.map((c) => parseInt(c.mood) || 0).filter(Boolean)
  const energyData = checkins.map((c) => parseInt(c.energy) || 0).filter(Boolean)
  const stressData = checkins.map((c) => parseInt(c.stress) || 0).filter(Boolean)

  const flaggedBloodwork = bloodwork.filter((b) => b.status === 'low' || b.status === 'high')
  const bloodworkInsights = getTopBloodworkInsights(flaggedBloodwork, 5)

  const symptomCounts = {}
  const symptomByPhase = {}
  // Build a phase assigner consistent with tempAnalysis (set after data loads, so use state value)
  const _symptomOvulDateStr = tempAnalysis?.estimatedOvulationDate
  const _symptomOvulCheckin = _symptomOvulDateStr ? checkins.find(c => c.date === _symptomOvulDateStr) : null
  const _symptomOvulDay = _symptomOvulCheckin?.cycle_day ? parseInt(_symptomOvulCheckin.cycle_day) : null
  const _symptomAssignPhase = makeAssignPhase(_symptomOvulDay)

  // Compute risk flags (needs checkins + ring data + ovulation anchor)
  // Wrapped in useMemo-style guard: only recompute when checkins change
  useEffect(() => {
    if (checkins.length >= 10) {
      try {
        const flags = analyzeRiskFlags(checkins, ringDays, _symptomOvulDay)
        setRiskFlags(flags)
      } catch (e) {
        console.error('Risk flag analysis error:', e)
      }
    }
  }, [checkins.length, ringDays.length])

  checkins.forEach((c) => {
    if (c.symptoms) {
      const ph = _symptomAssignPhase(c)
      c.symptoms.split(',').forEach((s) => {
        const trimmed = s.trim()
        if (trimmed && trimmed !== 'None') {
          symptomCounts[trimmed] = (symptomCounts[trimmed] || 0) + 1
          if (ph) {
            if (!symptomByPhase[trimmed]) symptomByPhase[trimmed] = {}
            symptomByPhase[trimmed][ph] = (symptomByPhase[trimmed][ph] || 0) + 1
          }
        }
      })
    }
  })
  const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const suppYes = checkins.filter((c) => c.supplements_taken === 'yes').length
  const suppSome = checkins.filter((c) => c.supplements_taken === 'some').length
  const suppTotal = checkins.length
  const suppRate = suppTotal > 0 ? Math.round(((suppYes + suppSome * 0.5) / suppTotal) * 100) : 0

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()

  // Clean up stale localStorage check-in markers (keep only today)
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('checkin_') && key !== `checkin_${today}`) {
        localStorage.removeItem(key)
      }
    })
  } catch {}

  const hasCheckedInToday = checkins.some((c) => c.date === today) || localStorage.getItem(`checkin_${today}`) !== null

  const tabs = [
    { key: 'today', label: 'Today', icon: Icons.sun },
    { key: 'trends', label: 'Trends', icon: Icons.chart },
    { key: 'health', label: 'Health', icon: Icons.heart },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F6F4F0', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="flex-1 px-5 pt-6 pb-24">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icons.logo size={30} />
              <div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: '#2C2825', lineHeight: 1.1 }}>
                  Cycle Sync
                </div>
                <div style={{ fontSize: 11, color: '#A09A90' }}>{getGreeting()}{(() => { try { const n = JSON.parse(localStorage.getItem('onboardingAnswers')||'{}')
                  .name; return n ? `, ${n}` : '' } catch { return '' } })()}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {wearable && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: '#9BAF9315', borderRadius: 20, padding: '5px 10px',
                }}>
                  <Icons.ring size={12} color="#9BAF93" />
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#7A9470' }}>Connected</span>
                </div>
              )}
              {phase && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: `${phase.color}12`, borderRadius: 20, padding: '5px 10px',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: phase.color }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: phase.color }}>Day {todayCycleDay || '—'}</span>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div style={{ padding: '16px 0' }}>
              <style>{`
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .skeleton { background: linear-gradient(90deg, #E8E4DD 25%, #F0EDE8 50%, #E8E4DD 75%); background-size: 200% 100%; animation: shimmer 1.5s ease infinite; border-radius: 8px; }
              `}</style>
              <div style={{ background: '#FFFEF9', borderRadius: 14, padding: '18px 20px', marginBottom: 14, border: '1px solid #E8E4DD' }}>
                <div className="skeleton" style={{ width: 100, height: 10, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 180, height: 16 }} />
              </div>
              <div style={{ background: '#FFFEF9', borderRadius: 16, padding: '20px', marginBottom: 14, border: '1px solid #E8E4DD' }}>
                <div className="skeleton" style={{ width: 80, height: 10, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 200, height: 22, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 260, height: 12 }} />
              </div>
              <div style={{ background: '#FFFEF9', borderRadius: 16, padding: '16px 18px', marginBottom: 14, border: '1px solid #E8E4DD' }}>
                <div className="skeleton" style={{ width: 140, height: 14, marginBottom: 14 }} />
                <div className="skeleton" style={{ width: '100%', height: 40, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: '100%', height: 40, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: '80%', height: 40 }} />
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* ═══════════ TAB: TODAY ═══════════ */}
              {activeTab === 'today' && (
                <>
                  {/* Check-in CTA */}
                  {!hasCheckedInToday ? (
                    <button onClick={() => navigate('/checkin')} className="w-full text-left cursor-pointer" style={{
                      fontFamily: "'DM Sans', sans-serif", background: '#2C2825', borderRadius: 14,
                      padding: '18px 20px', border: 'none', color: 'white',
                      boxShadow: '0 4px 16px rgba(44,40,37,0.12)', marginBottom: 12,
                    }}>
                      <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 3 }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </div>
                      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20 }}>
                        Start Daily Check-in
                      </div>
                    </button>
                  ) : (
                    <div style={{
                      background: '#9BAF9312', border: '1px solid #9BAF9325',
                      borderRadius: 12, padding: '12px 16px', marginBottom: 12,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Icons.check size={14} color="#7A9470" />
                      <span style={{ fontSize: 12, color: '#7A9470', fontWeight: 500 }}>
                        Today's check-in complete
                      </span>
                    </div>
                  )}

                  {/* AI Insights */}
                  {(checkins.length > 0 || wearable) && (
                    <AIInsights
                      checkins={checkins} bloodwork={bloodwork} wearable={wearable}
                      phase={phase} phaseKey={phaseKey} tempAnalysis={tempAnalysis} ringDays={ringDays}
                      insights={insights} setInsights={setInsights} riskFlags={riskFlags}
                      todayCycleDay={todayCycleDay}
                    />
                  )}

                  {/* Period Prediction */}
                  {(() => {
                    const sorted = [...checkins].sort((a, b) => a.date?.localeCompare(b.date))
                    const periodStarts = []
                    sorted.forEach((c, i) => {
                      const isDay1 = parseInt(c.cycle_day) === 1
                      const isPeriod = c.period === 'yes'
                      const lastStart = periodStarts.length > 0 ? periodStarts[periodStarts.length - 1] : null
                      const daysSinceLast = lastStart
                        ? Math.round((new Date(c.date + 'T12:00:00') - new Date(lastStart + 'T12:00:00')) / (1000 * 60 * 60 * 24))
                        : 999
                      if (c.date && isDay1) {
                        if (!periodStarts.includes(c.date)) periodStarts.push(c.date)
                      } else if (c.date && isPeriod && daysSinceLast >= 18) {
                        let si = i
                        while (si > 0 && sorted[si - 1].period === 'yes') si--
                        const trueStart = sorted[si].date
                        if (!periodStarts.includes(trueStart)) periodStarts.push(trueStart)
                      }
                    })

                    if (periodStarts.length < 1) return null

                    // Collect measured cycle lengths (expanded max to 60 to support longer cycles)
                    const cycleLengths = []
                    for (let i = 1; i < periodStarts.length; i++) {
                      const d1 = new Date(periodStarts[i-1] + 'T12:00:00')
                      const d2 = new Date(periodStarts[i] + 'T12:00:00')
                      const len = Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
                      if (len >= 18 && len <= 60) cycleLengths.push(len)
                    }

                    // Smart average: recency-weighted when 3+ cycles, simple avg for 1-2,
                    // falls back to onboarding profile estimate (never a hardcoded 28)
                    let avgLength
                    let predictionSource
                    if (cycleLengths.length >= 3) {
                      // Recency-weighted: most recent cycle gets highest weight
                      const weights = cycleLengths.map((_, i) => i + 1)
                      const weightSum = weights.reduce((a, b) => a + b, 0)
                      avgLength = Math.round(
                        cycleLengths.reduce((sum, len, i) => sum + len * weights[i], 0) / weightSum
                      )
                      predictionSource = `${cycleLengths.length} cycles · recency-weighted`
                    } else if (cycleLengths.length > 0) {
                      avgLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
                      predictionSource = `${cycleLengths.length} cycle${cycleLengths.length > 1 ? 's' : ''} recorded · avg ${avgLength}d`
                    } else {
                      // No measured cycles yet — use profile estimate, not a generic 28
                      avgLength = getEstimatedCycleLength()
                      predictionSource = `profile estimate · ${avgLength}d`
                    }

                    const lastStart = periodStarts[periodStarts.length - 1]
                    const nextPeriod = new Date(new Date(lastStart + 'T12:00:00').getTime() + avgLength * 24 * 60 * 60 * 1000)
                    const nowDate = new Date()
                    nowDate.setHours(12, 0, 0, 0)
                    const daysUntil = Math.round((nextPeriod - nowDate) / (1000 * 60 * 60 * 24))

                    const ovulationDay = avgLength - 14
                    const fertileStart = new Date(new Date(lastStart + 'T12:00:00').getTime() + (ovulationDay - 5) * 24 * 60 * 60 * 1000)
                    const fertileEnd = new Date(new Date(lastStart + 'T12:00:00').getTime() + (ovulationDay + 1) * 24 * 60 * 60 * 1000)
                    const daysUntilFertile = Math.round((fertileStart - nowDate) / (1000 * 60 * 60 * 24))

                    const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    const isCurrentlyFertile = daysUntilFertile <= 0 && Math.round((fertileEnd - nowDate) / (1000 * 60 * 60 * 24)) >= 0

                    return (
                      <div style={{
                        background: '#FFFEF9', border: '1px solid #E8E4DD',
                        borderRadius: 14, padding: '16px 18px', marginBottom: 14,
                        boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                          <Icons.refresh size={14} color="#C4948A" />
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#C4948A', letterSpacing: 0.5 }}>
                            Cycle Prediction
                          </span>
                          <span style={{ fontSize: 9, color: '#A09A90', marginLeft: 'auto' }}>
                            {predictionSource}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <div style={{
                            flex: 1, background: daysUntil <= 3 ? '#C4948A12' : '#F6F4F0',
                            borderRadius: 10, padding: '12px', textAlign: 'center',
                            border: daysUntil <= 3 ? '1px solid #C4948A25' : 'none',
                          }}>
                            <div style={{ fontSize: 9, color: '#A09A90', marginBottom: 4 }}>Next period</div>
                            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: '#C4948A' }}>
                              {daysUntil <= 0 ? (daysUntil === 0 ? 'Today' : `${Math.abs(daysUntil)}d late`) : `${daysUntil}d`}
                            </div>
                            <div style={{ fontSize: 10, color: '#8A8279', marginTop: 2 }}>
                              {formatDate(nextPeriod)}
                            </div>
                          </div>

                          <div style={{
                            flex: 1, background: isCurrentlyFertile ? '#C9A96E12' : '#F6F4F0',
                            borderRadius: 10, padding: '12px', textAlign: 'center',
                            border: isCurrentlyFertile ? '1px solid #C9A96E25' : 'none',
                          }}>
                            <div style={{ fontSize: 9, color: '#A09A90', marginBottom: 4 }}>Fertile window</div>
                            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: '#C9A96E' }}>
                              {isCurrentlyFertile ? 'Now' : daysUntilFertile > 0 ? `${daysUntilFertile}d` : 'Passed'}
                            </div>
                            <div style={{ fontSize: 10, color: '#8A8279', marginTop: 2 }}>
                              {formatDate(fertileStart)} – {formatDate(fertileEnd)}
                            </div>
                          </div>

                          <div style={{
                            flex: 1, background: '#F6F4F0',
                            borderRadius: 10, padding: '12px', textAlign: 'center',
                          }}>
                            <div style={{ fontSize: 9, color: '#A09A90', marginBottom: 4 }}>Cycle day</div>
                            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: '#2C2825' }}>
                              {todayCycleDay || '—'}
                            </div>
                            <div style={{ fontSize: 10, color: phase ? phase.color : '#8A8279', fontWeight: 500, marginTop: 2 }}>
                              {phase ? phase.name : 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Phase-Synced Recommendations */}
                  <PhaseTab
                    checkins={checkins}
                    bloodwork={bloodwork}
                    wearable={wearable}
                    phaseKey={phaseKey}
                    phase={phase}
                    latest={latest}
                    todayCycleDay={todayCycleDay}
                    tempAnalysis={tempAnalysis}
                  />
                </>
              )}

              {/* ═══════════ TAB: TRENDS ═══════════ */}
              {activeTab === 'trends' && (
                <>
                  {/* ─── Your Patterns (Correlations) ─── */}
                  {(() => {
                    const _corrOvulDateStr = tempAnalysis?.estimatedOvulationDate
                    const _corrOvulCheckin = _corrOvulDateStr ? checkins.find(c => c.date === _corrOvulDateStr) : null
                    const _corrOvulDay = _corrOvulCheckin?.cycle_day ? parseInt(_corrOvulCheckin.cycle_day) : null
                    const analysis = analyzeCorrelations(checkins, _corrOvulDay)
                    if (!analysis) return null
                    const hasCorrelations = analysis.correlations.length > 0 || analysis.personalPatterns.length > 0
                    const PHASE_COLORS = { menstrual: '#C4948A', follicular: '#9BAF93', ovulation: '#C9A96E', luteal: '#9C8FBF' }
                    const TYPE_ICONS = { exercise: Icons.activity, workout_type: Icons.activity, supplements: Icons.droplet, diet: Icons.droplet }
                    return (
                      <div style={{
                        background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                        borderRadius: 16, padding: '16px 18px', marginBottom: 14,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <Icons.sparkle size={15} color="#C9A96E" />
                          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825' }}>
                            Your Patterns
                          </span>
                          <span style={{ fontSize: 9, color: '#A09A90', marginLeft: 'auto' }}>
                            From {checkins.length} check-ins
                          </span>
                        </div>

                        {analysis.personalPatterns.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            {analysis.personalPatterns.slice(0, 3).map((p, i) => (
                              <div key={i} style={{
                                fontSize: 12, color: '#2C2825', lineHeight: 1.6,
                                padding: '8px 12px', background: '#F6F4F0', borderRadius: 10,
                                marginBottom: 6,
                              }}>
                                {p.message}
                              </div>
                            ))}
                          </div>
                        )}

                        {analysis.correlations.slice(0, 6).map((c, i) => {
                          const Icon = TYPE_ICONS[c.type] || Icons.sparkle
                          return (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 10,
                              padding: '10px 0',
                              borderBottom: i < Math.min(analysis.correlations.length, 6) - 1 ? '1px solid #F0EDE8' : 'none',
                            }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: c.direction === 'positive' ? '#9BAF9315' : '#C4948A15',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                marginTop: 1,
                              }}>
                                <Icon size={13} color={c.direction === 'positive' ? '#9BAF93' : '#C4948A'} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: '#2C2825', lineHeight: 1.5 }}>
                                  {c.message}
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                  <span style={{
                                    fontSize: 9, color: PHASE_COLORS[c.phase] || '#A09A90',
                                    background: (PHASE_COLORS[c.phase] || '#A09A90') + '12',
                                    borderRadius: 6, padding: '1px 6px',
                                  }}>{c.phase}</span>
                                  <span style={{
                                    fontSize: 9, color: c.direction === 'positive' ? '#9BAF93' : '#C4948A',
                                    fontWeight: 600,
                                  }}>{c.direction === 'positive' ? '+' : ''}{c.strength} {c.metric}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {analysis.correlations.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '8px 0' }}>
                            <div style={{ fontSize: 12, color: '#8A8279', marginBottom: 8 }}>
                              Building your pattern profile
                            </div>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                              {Object.entries(analysis.phaseProfiles).map(([pk, data]) => {
                                if (data.days === 0) return null
                                return (
                                  <div key={pk} style={{
                                    fontSize: 10, color: PHASE_COLORS[pk],
                                    background: PHASE_COLORS[pk] + '12',
                                    borderRadius: 8, padding: '4px 10px',
                                  }}>
                                    {pk}: {data.days} days logged
                                  </div>
                                )
                              })}
                            </div>
                            <div style={{ fontSize: 10, color: '#A09A90', marginTop: 8 }}>
                              Correlations emerge with more data across different phases, workouts, and diet choices
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Cycle Map — Interactive */}
                  {checkins.length >= 1 && (() => {
                    const recent = checkins.slice(-28)
                    const ringByDate = {}
                    ringDays.forEach(d => { ringByDate[d.date] = d })

                    // Compute detected ovulation anchor first so phase assignment is consistent everywhere
                    const ovulDateStr = tempAnalysis?.estimatedOvulationDate
                    const ovulCheckin = ovulDateStr ? recent.find(c => c.date === ovulDateStr) : null
                    const detectedOvulDay = ovulCheckin?.cycle_day ? parseInt(ovulCheckin.cycle_day) : null

                    // Cervical mucus fertile signal values
                    const ewcmValues = ['egg white', 'egg_white', 'ewcm', 'stretchy', 'watery']

                    // Ovulation-aware phase assignment — single source of truth via makeAssignPhase
                    const assignPhase = makeAssignPhase(detectedOvulDay, ewcmValues)

                    const phaseAvgs = {}
                    Object.keys(PHASE_DATA).forEach(pk => {
                      const pcs = recent.filter(c => assignPhase(c) === pk)
                      if (pcs.length === 0) return
                      const avg = (key) => {
                        const vals = pcs.map(c => parseFloat(c[key])).filter(v => !isNaN(v))
                        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
                      }
                      phaseAvgs[pk] = { mood: avg('mood'), energy: avg('energy'), stress: avg('stress'), sleep: avg('sleep_quality'), count: pcs.length }
                    })

                    const sel = selectedCycleDay != null ? recent[selectedCycleDay] : null
                    const selRing = sel ? ringByDate[sel.date] : null
                    const selPhase = sel ? assignPhase(sel) : null
                    const selPh = selPhase ? PHASE_DATA[selPhase] : null

                    // ─── Confidence Gating ──────────────────────────────────────
                    // Phases only shown with full color when data actually supports them.
                    // Levels: 'confirmed' | 'likely' | 'estimated' | 'unknown'
                    //
                    // confirmed  — multiple corroborating signals (logged period + BBT shift + pattern)
                    // likely     — one strong signal (confirmed period log, or high-confidence BBT shift)
                    // estimated  — statistical guess only, no confirming signal for this specific day
                    // unknown    — no basis at all to label this day

                    const recentMeasuredCycleLengths = (() => {
                      const ps = recent.filter(c => c.period === 'yes' && parseInt(c.cycle_day) <= 3).map(c => c.date).sort()
                      const lens = []
                      for (let i = 1; i < ps.length; i++) {
                        const len = Math.round((new Date(ps[i] + 'T12:00:00') - new Date(ps[i-1] + 'T12:00:00')) / (1000*60*60*24))
                        if (len >= 18 && len <= 60) lens.push(len)
                      }
                      return lens
                    })()

                    const bbtDaysLogged = recent.filter(c => c.bbt && parseFloat(c.bbt) > 0).length
                    const ringDaysAvail = tempAnalysis?.daysOfData || 0
                    const confirmedPeriodDays = recent.filter(c => c.period === 'yes').length
                    const hasCyclePattern = recentMeasuredCycleLengths.length >= 2

                    // Cervical mucus signal counts (ewcmValues defined above)
                    const cmDaysLogged = recent.filter(c => c.cervical_mucus && c.cervical_mucus.trim() && c.cervical_mucus.toLowerCase() !== 'none').length
                    const hasCMOvulSignal = recent.some(c => {
                      if (!c.cervical_mucus) return false
                      const cm = c.cervical_mucus.toLowerCase().trim()
                      return ewcmValues.some(v => cm.includes(v))
                    })

                    const hasConfirmedOvul = tempAnalysis?.ovulationDetected && tempAnalysis?.ovulationConfidence === 'high' && bbtDaysLogged >= 6
                    // Likely ovulation: medium-confidence temp shift, OR CM signal corroborating temp data,
                    // OR strong CM signal alone with period anchor (CM can stand alone as a signal)
                    const hasLikelyOvul = (tempAnalysis?.ovulationDetected && (tempAnalysis?.ovulationConfidence === 'medium' || ringDaysAvail >= 10))
                      || (tempAnalysis?.ovulationDetected && hasCMOvulSignal)
                      || (hasCMOvulSignal && confirmedPeriodDays > 0)

                    const getPhaseConfidence = (phaseKey, date) => {
                      const c = recent.find(r => r.date === date)
                      const isPeriodLogged = c?.period === 'yes'
                      const isWithin5DaysOfPeriod = recent.some(r => {
                        if (r.period !== 'yes') return false
                        const diff = Math.abs(Math.round((new Date(date + 'T12:00:00') - new Date(r.date + 'T12:00:00')) / (1000*60*60*24)))
                        return diff <= 5
                      })
                      const isDetectedOvulWindow = tempAnalysis?.estimatedOvulationDate && (
                        date === tempAnalysis.estimatedOvulationDate ||
                        Math.abs(Math.round((new Date(date + 'T12:00:00') - new Date(tempAnalysis.estimatedOvulationDate + 'T12:00:00')) / (1000*60*60*24))) <= 1
                      )

                      switch (phaseKey) {
                        case 'menstrual':
                          if (isPeriodLogged) return 'confirmed'
                          if (isWithin5DaysOfPeriod && confirmedPeriodDays > 0) return 'likely'
                          return confirmedPeriodDays > 0 ? 'estimated' : 'unknown'

                        case 'follicular':
                          // Can only label follicular if we know when menstrual ended
                          if (confirmedPeriodDays > 0 && hasCyclePattern) return 'likely'
                          if (confirmedPeriodDays > 0) return 'estimated'
                          return 'unknown'

                        case 'ovulation': {
                          // Check if this specific day had EWCM logged
                          const c = recent.find(r => r.date === date)
                          const dayHasCM = c?.cervical_mucus && ewcmValues.some(v => c.cervical_mucus.toLowerCase().includes(v))

                          // Confirmed: high-confidence temp shift AND this is the detected window
                          if (hasConfirmedOvul && isDetectedOvulWindow) return 'confirmed'
                          // Likely: temp data + CM corroboration, or medium temp shift on detected window
                          if ((hasConfirmedOvul || hasLikelyOvul) && (isDetectedOvulWindow || dayHasCM)) return 'likely'
                          // Likely from CM alone (no temp data yet): day itself had EWCM logged
                          if (dayHasCM && confirmedPeriodDays > 0) return 'likely'
                          // Pure statistics → don't claim ovulation
                          return 'unknown'
                        }

                        case 'luteal':
                          // Luteal is only meaningful if we know ovulation actually happened
                          if (hasConfirmedOvul) return 'confirmed'
                          if (hasLikelyOvul) return 'likely'
                          if (hasCyclePattern && confirmedPeriodDays > 0) return 'estimated'
                          return 'unknown'

                        default:
                          return 'unknown'
                      }
                    }

                    const confidenceStyle = {
                      confirmed: { opacity: 0.9,  filter: 'none' },
                      likely:    { opacity: 0.65, filter: 'none' },
                      estimated: { opacity: 0.3,  filter: 'saturate(0.4)' },
                      unknown:   { opacity: 0.12, filter: 'saturate(0) brightness(1.1)' },
                    }
                    // ────────────────────────────────────────────────────────────

                    return (
                      <div style={{
                        background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                        borderRadius: 16, padding: '16px 18px', marginBottom: 14,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icons.refresh size={15} color="#C4948A" />
                            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825' }}>
                              Cycle Map
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: '#A09A90' }}>Last {recent.length} days · tap a day</span>
                        </div>

                        <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                          {(() => {
                            return recent.map((c, i) => {
                              // Use the same assignPhase() defined at the top of this IIFE
                              const pk = assignPhase(c)
                            const ph = pk ? PHASE_DATA[pk] : null
                            const isToday = c.date === today
                            const isSelected = selectedCycleDay === i
                            const mood = parseInt(c.mood) || 0
                            const energy = parseInt(c.energy) || 0
                            const hasSx = c.symptoms && c.symptoms !== 'None' && c.symptoms.trim()
                            const isOvulation = tempAnalysis?.estimatedOvulationDate === c.date
                            const isPeriod = c.period === 'yes'
                            return (
                              <button
                                key={i}
                                onClick={() => setSelectedCycleDay(isSelected ? null : i)}
                                className="cursor-pointer"
                                style={{
                                  flex: 1, border: 'none', padding: 0, background: 'none',
                                  fontFamily: "'DM Sans', sans-serif",
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                                }}
                              >
                                <div style={{ fontSize: 8, color: isSelected ? '#2C2825' : '#C8C3BA', fontWeight: isToday ? 700 : 400 }}>
                                  {c.cycle_day || '?'}
                                </div>
                                {(() => {
                                  const confidence = getPhaseConfidence(pk, c.date)
                                  const cs = confidenceStyle[confidence]
                                  // For unknown/estimated phases, show a neutral grey bar instead of the phase color
                                  // so we don't falsely imply we know what phase this is
                                  const barBg = (confidence === 'unknown')
                                    ? '#E8E4DD'
                                    : (confidence === 'estimated' && !isPeriod)
                                      ? ph ? ph.color : '#E8E4DD'
                                      : ph ? ph.color : '#E8E4DD'
                                  return (
                                    <div style={{
                                      width: '100%', height: 22, borderRadius: 3,
                                      background: barBg,
                                      opacity: isSelected ? 1 : isToday ? Math.min(cs.opacity + 0.1, 1) : cs.opacity,
                                      filter: isSelected ? 'none' : cs.filter,
                                      border: isOvulation && confidence !== 'unknown' ? '2px solid #C9A96E' : isSelected ? '2px solid #2C2825' : isToday ? '1.5px solid #2C282580' : 'none',
                                      boxSizing: 'border-box',
                                      transition: 'all 0.15s',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      position: 'relative',
                                    }}>
                                      {isToday && !isSelected && (
                                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'white' }} />
                                      )}
                                      {/* Only show ovulation "O" marker if we actually have temperature data confirming it */}
                                      {isOvulation && (confidence === 'confirmed' || confidence === 'likely') && (
                                        <div style={{ fontSize: 7, fontWeight: 800, color: 'white', lineHeight: 1 }}>O</div>
                                      )}
                                      {isPeriod && !isOvulation && (
                                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C4948A', opacity: 0.8 }} />
                                      )}
                                    </div>
                                  )
                                })()}
                                <div style={{ display: 'flex', gap: 1, marginTop: 1 }}>
                                  {mood > 0 && <div style={{ width: 3, height: 3, borderRadius: '50%', background: mood >= 7 ? '#9BAF93' : mood >= 4 ? '#C9A96E' : '#C4948A' }} />}
                                  {energy > 0 && <div style={{ width: 3, height: 3, borderRadius: '50%', background: energy >= 7 ? '#9BAF93' : energy >= 4 ? '#C9A96E' : '#C4948A' }} />}
                                  {hasSx && <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#8A8279' }} />}
                                </div>
                                <div style={{ fontSize: 7, color: '#D5D0C8' }}>
                                  {new Date(c.date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric' })}
                                </div>
                              </button>
                            )
                            })
                          })()}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6, marginBottom: 6 }}>
                          {Object.entries(PHASE_DATA).map(([key, ph]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <div style={{ width: 6, height: 6, borderRadius: 2, background: ph.color }} />
                              <span style={{ fontSize: 9, color: '#A09A90' }}>{ph.name}</span>
                            </div>
                          ))}
                          {tempAnalysis?.estimatedOvulationDate && (hasConfirmedOvul || hasLikelyOvul) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, border: '1.5px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 6, fontWeight: 800, color: '#C9A96E' }}>O</span>
                              </div>
                              <span style={{ fontSize: 9, color: '#A09A90' }}>Ovulation detected</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 2 }}>
                            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <div style={{ width: 10, height: 5, borderRadius: 1, background: '#9BAF93', opacity: 0.9 }} />
                              <div style={{ width: 10, height: 5, borderRadius: 1, background: '#9BAF93', opacity: 0.3, filter: 'saturate(0.4)' }} />
                            </div>
                            <span style={{ fontSize: 9, color: '#A09A90' }}>confirmed · estimated</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 4 }}>
                            <div style={{ display: 'flex', gap: 1 }}>
                              <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#9BAF93' }} />
                              <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#C9A96E' }} />
                              <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#8A8279' }} />
                            </div>
                            <span style={{ fontSize: 9, color: '#A09A90' }}>mood · energy · symptoms</span>
                          </div>
                        </div>
                        {/* Data quality hints — what's needed to improve accuracy */}
                        {(() => {
                          const hints = []
                          if (confirmedPeriodDays === 0) hints.push('Log period days to anchor your cycle')
                          else if (!hasCyclePattern) hints.push('Log a 2nd full cycle to detect your pattern')
                          if (!hasConfirmedOvul && !hasLikelyOvul) {
                            const missingSignals = []
                            if (bbtDaysLogged < 6) missingSignals.push(`BBT (${bbtDaysLogged} days)`)
                            if (ringDaysAvail < 10) missingSignals.push(`ring nights (${ringDaysAvail})`)
                            if (cmDaysLogged === 0) missingSignals.push('cervical mucus')
                            if (missingSignals.length > 0) hints.push(`Log ${missingSignals.join(', ')} to detect ovulation`)
                          }
                          if (hints.length === 0) return null
                          return (
                            <div style={{ marginTop: 2, marginBottom: sel ? 14 : 0, padding: '7px 10px', background: '#F6F4F0', borderRadius: 8 }}>
                              {hints.map((hint, idx) => (
                                <div key={idx} style={{ fontSize: 10, color: '#8A8279', lineHeight: 1.6 }}>· {hint}</div>
                              ))}
                            </div>
                          )
                        })()}

                        {/* Expanded Day Detail */}
                        {sel && (
                          <div style={{
                            background: '#F6F4F0', borderRadius: 12, padding: '14px 16px',
                            border: selPh ? `1px solid ${selPh.color}30` : '1px solid #E8E4DD',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <div>
                                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2C2825' }}>
                                  Day {sel.cycle_day || '?'}
                                </span>
                                {selPh && (
                                  <span style={{ fontSize: 11, color: selPh.color, fontWeight: 600, marginLeft: 8 }}>
                                    {selPh.name}
                                  </span>
                                )}
                                {tempAnalysis?.estimatedOvulationDate === sel.date && (
                                  <span style={{ fontSize: 9, fontWeight: 700, color: '#C9A96E', background: '#C9A96E18', borderRadius: 4, padding: '2px 6px', marginLeft: 6 }}>
                                    Ovulation detected
                                  </span>
                                )}
                                {sel.period === 'yes' && (
                                  <span style={{ fontSize: 9, fontWeight: 600, color: '#C4948A', background: '#C4948A15', borderRadius: 4, padding: '2px 6px', marginLeft: 6 }}>
                                    Period{sel.flow_level ? ` · ${sel.flow_level}` : ''}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 11, color: '#A09A90' }}>
                                  {new Date(sel.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <button
                                  onClick={() => setSelectedCycleDay(null)}
                                  className="cursor-pointer"
                                  style={{
                                    background: 'none', border: '1px solid #E8E4DD', borderRadius: 6,
                                    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#A09A90', lineHeight: 1,
                                  }}
                                >×</button>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                              {[
                                { label: 'Mood', val: sel.mood, color: '#9BAF93' },
                                { label: 'Energy', val: sel.energy, color: '#C9A96E' },
                                { label: 'Stress', val: sel.stress, color: '#C4948A' },
                                { label: 'Sleep', val: sel.sleep_quality, color: '#6B7DB3' },
                              ].map(m => (
                                <div key={m.label} style={{ textAlign: 'center', background: '#FFFEF9', borderRadius: 8, padding: '6px 4px' }}>
                                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: m.val ? m.color : '#D5D0C8' }}>
                                    {m.val || '—'}
                                  </div>
                                  <div style={{ fontSize: 9, color: '#A09A90' }}>{m.label}</div>
                                </div>
                              ))}
                            </div>

                            {selRing && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                                {[
                                  { label: 'HRV', val: selRing.avgSleepHrv ? `${selRing.avgSleepHrv}ms` : null },
                                  { label: 'RHR', val: selRing.nightRhr ? `${selRing.nightRhr}bpm` : null },
                                  { label: 'Recovery', val: selRing.recoveryIndex },
                                ].filter(m => m.val).map(m => (
                                  <div key={m.label} style={{ textAlign: 'center', background: '#FFFEF9', borderRadius: 8, padding: '6px 4px' }}>
                                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 14, color: '#2C2825' }}>{m.val}</div>
                                    <div style={{ fontSize: 9, color: '#A09A90' }}>{m.label}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {sel.symptoms && sel.symptoms !== 'None' && sel.symptoms.trim() && (
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 10, color: '#A09A90', marginBottom: 4 }}>Symptoms</div>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  {sel.symptoms.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                    <span key={s} style={{
                                      fontSize: 10, color: '#8A8279', background: '#E8E4DD80',
                                      borderRadius: 6, padding: '2px 8px',
                                    }}>{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                              {sel.activity && sel.activity !== 'none' && (
                                <div style={{ fontSize: 10, color: '#8A8279' }}>
                                  <span style={{ color: '#A09A90' }}>Activity: </span>
                                  {sel.activity}{sel.workout_types ? ` (${sel.workout_types})` : ''}
                                </div>
                              )}
                              {sel.supplements_taken && (
                                <div style={{ fontSize: 10, color: '#8A8279' }}>
                                  <span style={{ color: '#A09A90' }}>Supps: </span>
                                  {sel.supplements_taken === 'yes' ? '✓ All' : sel.supplements_taken === 'some' ? 'Some' : '✗ No'}
                                </div>
                              )}
                              {sel.cervical_mucus && sel.cervical_mucus.trim() && sel.cervical_mucus.toLowerCase() !== 'none' && (
                                <div style={{ fontSize: 10, color: '#8A8279' }}>
                                  <span style={{ color: '#A09A90' }}>CM: </span>
                                  <span style={{
                                    color: ewcmValues.some(v => sel.cervical_mucus.toLowerCase().includes(v)) ? '#C9A96E' : '#8A8279',
                                    fontWeight: ewcmValues.some(v => sel.cervical_mucus.toLowerCase().includes(v)) ? 600 : 400,
                                  }}>
                                    {sel.cervical_mucus}
                                    {ewcmValues.some(v => sel.cervical_mucus.toLowerCase().includes(v)) && ' · fertile sign'}
                                  </span>
                                </div>
                              )}
                              {sel.bbt && parseFloat(sel.bbt) > 0 && (
                                <div style={{ fontSize: 10, color: '#8A8279' }}>
                                  <span style={{ color: '#A09A90' }}>BBT: </span>
                                  {sel.bbt}°F
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Phase Averages */}
                        {Object.keys(phaseAvgs).length > 0 && (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 10, color: '#A09A90', marginBottom: 8 }}>Phase averages</div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {Object.entries(PHASE_DATA).map(([pk, ph]) => {
                                const avg = phaseAvgs[pk]
                                if (!avg) return (
                                  <div key={pk} style={{
                                    flex: 1, textAlign: 'center', background: '#F6F4F0', borderRadius: 8, padding: '8px 4px',
                                  }}>
                                    <div style={{ fontSize: 9, color: ph.color, fontWeight: 600, marginBottom: 4 }}>{ph.name}</div>
                                    <div style={{ fontSize: 9, color: '#C8C3BA' }}>No data</div>
                                  </div>
                                )
                                return (
                                  <div key={pk} style={{
                                    flex: 1, textAlign: 'center', background: `${ph.color}08`, borderRadius: 8, padding: '8px 4px',
                                    border: `1px solid ${ph.color}15`,
                                  }}>
                                    <div style={{ fontSize: 9, color: ph.color, fontWeight: 600, marginBottom: 4 }}>{ph.name}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      {[
                                        { label: 'Mood', val: avg.mood, color: '#9BAF93' },
                                        { label: 'Energy', val: avg.energy, color: '#C9A96E' },
                                        { label: 'Stress', val: avg.stress, color: '#C4948A' },
                                      ].map(m => m.val && (
                                        <div key={m.label} style={{ fontSize: 10, color: '#2C2825', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
                                          <span style={{ fontSize: 8, color: m.color, fontWeight: 600 }}>{m.label}</span>
                                          <span>{m.val}</span>
                                        </div>
                                      ))}
                                      <div style={{ fontSize: 8, color: '#A09A90', marginTop: 2 }}>{avg.count} days</div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Top Symptoms */}
                  {topSymptoms.length > 0 && (
                    <div style={{
                      background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                      borderRadius: 16, padding: '16px 18px', marginBottom: 14,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Icons.zap size={15} color="#C9A96E" />
                        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825' }}>
                          Top Symptoms
                        </span>
                      </div>
                      {topSymptoms.map(([name, count]) => {
                        const isExpanded = expandedSymptom === name
                        const phases = symptomByPhase[name] || {}
                        const peakPhase = Object.entries(phases).sort((a, b) => b[1] - a[1])[0]
                        return (
                          <div key={name}>
                            <button
                              onClick={() => setExpandedSymptom(isExpanded ? null : name)}
                              className="cursor-pointer w-full text-left"
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                                background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif",
                                borderBottom: isExpanded ? 'none' : '1px solid #F0EDE8',
                              }}
                            >
                              <span style={{ fontSize: 12, color: '#2C2825', flex: 1 }}>{name}</span>
                              <div style={{ width: 80, height: 4, background: '#E8E4DD', borderRadius: 2 }}>
                                <div style={{ height: '100%', borderRadius: 2, width: `${(count / checkins.length) * 100}%`, background: '#C9A96E' }} />
                              </div>
                              <span style={{ fontSize: 11, color: '#A09A90', minWidth: 20, textAlign: 'right' }}>{count}x</span>
                              <span style={{ fontSize: 10, color: '#C8C3BA', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
                            </button>
                            {isExpanded && (
                              <div style={{ padding: '8px 0 12px', borderBottom: '1px solid #F0EDE8' }}>
                                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                                  {Object.entries(PHASE_DATA).map(([pk, ph]) => {
                                    const phCount = phases[pk] || 0
                                    return (
                                      <div key={pk} style={{
                                        flex: 1, textAlign: 'center', padding: '6px 4px',
                                        background: phCount > 0 ? `${ph.color}12` : '#F6F4F0',
                                        border: `1px solid ${phCount > 0 ? ph.color + '25' : '#E8E4DD'}`,
                                        borderRadius: 8,
                                      }}>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: phCount > 0 ? ph.color : '#C8C3BA' }}>{phCount}x</div>
                                        <div style={{ fontSize: 9, color: '#A09A90' }}>{ph.name}</div>
                                      </div>
                                    )
                                  })}
                                </div>
                                {peakPhase && (
                                  <div style={{ fontSize: 11, color: '#8A8279', lineHeight: 1.5, padding: '4px 0' }}>
                                    {name} appears most in your <span style={{ color: PHASE_DATA[peakPhase[0]]?.color, fontWeight: 600 }}>{PHASE_DATA[peakPhase[0]]?.name}</span> phase ({peakPhase[1]} of {count} times).
                                    {peakPhase[0] === 'luteal' && ` This is common — rising progesterone and shifting estrogen in the luteal phase can trigger ${name.toLowerCase()}.`}
                                    {peakPhase[0] === 'menstrual' && ` Hormone levels are at their lowest during menstruation, which can contribute to ${name.toLowerCase()}.`}
                                    {peakPhase[0] === 'ovulation' && ` The estrogen peak around ovulation can sometimes trigger ${name.toLowerCase()}.`}
                                    {peakPhase[0] === 'follicular' && ` Rising estrogen in the follicular phase may be connected to ${name.toLowerCase()}.`}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Temperature Intelligence */}
                  {tempAnalysis && tempAnalysis.timeline.length > 0 && (
                    <div style={{
                      background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                      borderRadius: 16, overflow: 'hidden', marginBottom: 14,
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #B07A6E15, #C9A96E15)',
                        padding: '14px 18px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Icons.thermometer size={16} color="#B07A6E" />
                          <div>
                            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825' }}>
                              Temperature Intelligence
                            </div>
                            <div style={{ fontSize: 11, color: '#A09A90' }}>
                              {tempAnalysis.daysOfData} days · {tempAnalysis.timeline.some(t => t.bbt) ? 'BBT + Ring' : 'Ring skin temp'}
                            </div>
                          </div>
                        </div>
                        {tempAnalysis.ovulationDetected && (
                          <button
                            onClick={() => setShowOvTooltip(!showOvTooltip)}
                            className="cursor-pointer"
                            style={{ fontSize: 10, fontWeight: 700, color: '#C9A96E', background: '#C9A96E18', borderRadius: 6, padding: '4px 10px', border: 'none', fontFamily: 'inherit' }}
                          >
                            SHIFT DETECTED
                          </button>
                        )}
                      </div>

                      {showOvTooltip && tempAnalysis.ovulationDetected && (
                        <div style={{
                          margin: '0 18px', padding: '12px 14px', background: '#C9A96E0A', border: '1px solid #C9A96E25',
                          borderRadius: 10, marginBottom: 4,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#C9A96E' }}>Thermal Shift Detected</span>
                            <button onClick={() => setShowOvTooltip(false)} className="cursor-pointer" style={{ background: 'none', border: 'none', fontSize: 14, color: '#A09A90', fontFamily: 'inherit', padding: 0 }}>x</button>
                          </div>
                          <div style={{ fontSize: 11, color: '#2C2825', lineHeight: 1.6 }}>
                            Your temperature rose and stayed elevated, indicating ovulation likely occurred
                            {tempAnalysis.estimatedOvulationDate && (
                              <span style={{ fontWeight: 600 }}> around {new Date(tempAnalysis.estimatedOvulationDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                            )}.
                          </div>
                          <div style={{ fontSize: 10, color: '#8A8279', lineHeight: 1.5, marginTop: 6 }}>
                            After ovulation, progesterone from the corpus luteum raises basal body temperature by 0.3-0.5°F. This sustained shift confirms the egg was released. The gold "O" on the chart and cycle map marks this date.
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <div style={{ fontSize: 9, color: '#A09A90' }}>
                              Confidence: <span style={{ fontWeight: 600, color: tempAnalysis.ovulationConfidence === 'high' ? '#9BAF93' : '#C9A96E' }}>{tempAnalysis.ovulationConfidence}</span>
                            </div>
                            {tempAnalysis.ringAnalysis?.shiftAmount && (
                              <div style={{ fontSize: 9, color: '#A09A90' }}>
                                Shift: +{cToF(tempAnalysis.ringAnalysis.shiftAmount).toFixed(1)}°F
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={{ padding: '16px 18px', overflow: 'hidden' }}>
                        {(() => {
                          const tl = tempAnalysis.timeline
                          const ringTemps = tl.map(d => d.ringTemp).filter(Boolean).map(t => cToF(t))
                          const bbtTemps = tl.map(d => d.bbt).filter(Boolean).map(t => parseFloat(t))
                          const allTemps = [...ringTemps, ...bbtTemps]
                          if (allTemps.length === 0) return null
                          const minT = Math.min(...allTemps) - 0.3
                          const maxT = Math.max(...allTemps) + 0.3
                          const rangeT = maxT - minT || 1

                          const W = 300, H = 120, padX = 32, padY = 14
                          const cW = W - padX - 8, cH = H - padY * 2
                          const xStep = tl.length > 1 ? cW / (tl.length - 1) : cW

                          const toY = (temp) => padY + cH - ((temp - minT) / rangeT) * cH
                          const toX = (i) => padX + i * xStep

                          const bbtPoints = tl.map((d, i) => d.bbt ? { x: toX(i), y: toY(parseFloat(d.bbt)), val: parseFloat(d.bbt) } : null)
                          const ringPoints = tl.map((d, i) => d.ringTemp ? { x: toX(i), y: toY(cToF(d.ringTemp)), val: cToF(d.ringTemp) } : null)

                          const makeLine = (pts) => {
                            const valid = pts.filter(Boolean)
                            if (valid.length < 2) return ''
                            return valid.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
                          }

                          const bbtPath = makeLine(bbtPoints)
                          const ringPath = makeLine(ringPoints)

                          const yLabels = []
                          const step = rangeT > 2 ? 1 : 0.5
                          for (let t = Math.ceil(minT / step) * step; t <= maxT; t += step) {
                            yLabels.push(t)
                          }

                          const baselineY = tempAnalysis.baseline ? toY(cToF(tempAnalysis.baseline)) : null
                          const shiftIdx = tempAnalysis.ringAnalysis?.shiftIndex

                          return (
                            <div>
                              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} preserveAspectRatio="xMidYMid meet">
                                {yLabels.map(t => (
                                  <g key={t}>
                                    <line x1={padX} x2={W - 8} y1={toY(t)} y2={toY(t)} stroke="#F0EDE8" strokeWidth="0.5" />
                                    <text x={padX - 4} y={toY(t) + 3} textAnchor="end" fill="#C8C3BA" fontSize="7" fontFamily="DM Sans">{t.toFixed(1)}°</text>
                                  </g>
                                ))}
                                {baselineY && (
                                  <line x1={padX} x2={W - 8} y1={baselineY} y2={baselineY} stroke="#A09A90" strokeWidth="0.5" strokeDasharray="4,3" />
                                )}
                                {shiftIdx != null && shiftIdx < tl.length && (
                                  <rect x={toX(shiftIdx)} y={padY} width={W - 8 - toX(shiftIdx)} height={cH} fill="#C9A96E" opacity="0.06" rx="3" />
                                )}
                                {tempAnalysis.estimatedOvulationDate && (() => {
                                  const ovIdx = tl.findIndex(d => d.date === tempAnalysis.estimatedOvulationDate)
                                  if (ovIdx < 0) return null
                                  const ox = toX(ovIdx)
                                  return (
                                    <g style={{ cursor: 'pointer' }} onClick={() => setShowOvTooltip(!showOvTooltip)}>
                                      <circle cx={ox} cy={padY - 2} r="8" fill="transparent" />
                                      <line x1={ox} x2={ox} y1={padY} y2={padY + cH} stroke="#C9A96E" strokeWidth="1" strokeDasharray="3,2" />
                                      <circle cx={ox} cy={padY - 2} r="5" fill="#C9A96E" />
                                      <text x={ox} y={padY + 2} textAnchor="middle" fill="white" fontSize="6" fontWeight="700" fontFamily="DM Sans">O</text>
                                    </g>
                                  )
                                })()}
                                {ringPath && (
                                  <path d={ringPath} fill="none" stroke="#9BAF93" strokeWidth="1.5" strokeDasharray="4,2" strokeLinecap="round" />
                                )}
                                {bbtPath && (
                                  <path d={bbtPath} fill="none" stroke="#C4948A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                )}
                                {bbtPoints.map((p, i) => p && (
                                  <g key={`bbt-${i}`}>
                                    <circle cx={p.x} cy={p.y} r={tl.length > 14 ? 2.5 : 4} fill="#C4948A" stroke="white" strokeWidth={tl.length > 14 ? 0.8 : 1.5} />
                                    {(tl.length <= 14 || i === 0 || i === tl.length - 1 || i % 5 === 0) && (
                                      <text x={p.x} y={p.y - 6} textAnchor="middle" fill="#C4948A" fontSize={tl.length > 14 ? '5' : '7'} fontWeight="600" fontFamily="DM Sans">
                                        {p.val.toFixed(1)}°
                                      </text>
                                    )}
                                  </g>
                                ))}
                                {ringPoints.map((p, i) => p && (
                                  <g key={`ring-${i}`}>
                                    <circle cx={p.x} cy={p.y} r="2" fill="#9BAF93" stroke="white" strokeWidth="0.8" />
                                    {(i === tl.length - 1 || i === 0 || i % 7 === 0) && (
                                      <text x={p.x} y={p.y + 11} textAnchor="middle" fill="#9BAF93" fontSize="6" fontFamily="DM Sans">
                                        {p.val.toFixed(1)}°
                                      </text>
                                    )}
                                  </g>
                                ))}
                              </svg>

                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0 0', marginLeft: padX, marginRight: 8, overflow: 'hidden' }}>
                                {(() => {
                                  const labelCount = Math.min(5, tl.length)
                                  const step = Math.max(1, Math.floor((tl.length - 1) / (labelCount - 1)))
                                  const indices = []
                                  for (let i = 0; i < tl.length; i += step) indices.push(i)
                                  if (indices[indices.length - 1] !== tl.length - 1) indices.push(tl.length - 1)
                                  return indices.map(i => (
                                    <span key={i} style={{ fontSize: 7, color: '#C8C3BA' }}>
                                      {new Date(tl[i].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  ))
                                })()}
                              </div>
                            </div>
                          )
                        })()}

                        <div style={{ display: 'flex', gap: 14, marginTop: 10, marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 14, height: 3, borderRadius: 2, background: '#C4948A' }} />
                            <span style={{ fontSize: 10, color: '#8A8279' }}>Manual BBT</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 14, height: 0, borderTop: '2px dashed #9BAF93' }} />
                            <span style={{ fontSize: 10, color: '#8A8279' }}>Ring skin temp</span>
                          </div>
                          {tempAnalysis.baseline && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div style={{ width: 14, height: 0, borderTop: '1px dashed #A09A90' }} />
                              <span style={{ fontSize: 10, color: '#8A8279' }}>Baseline ({cToF(tempAnalysis.baseline)}°)</span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <div style={{ flex: 1, background: '#F6F4F0', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: 9, color: '#A09A90', marginBottom: 2 }}>Baseline</div>
                            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825' }}>
                              {tempAnalysis.baseline ? `${cToF(tempAnalysis.baseline)}°F` : '—'}
                            </span>
                          </div>
                          <div style={{ flex: 1, background: '#F6F4F0', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: 9, color: '#A09A90', marginBottom: 2 }}>Current</div>
                            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825' }}>
                              {tempAnalysis.current ? `${cToF(tempAnalysis.current)}°F` : '—'}
                            </span>
                          </div>
                          <div style={{ flex: 1, background: '#F6F4F0', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: 9, color: '#A09A90', marginBottom: 2 }}>Trend</div>
                            <span style={{
                              fontFamily: "'Instrument Serif', serif", fontSize: 16,
                              color: tempAnalysis.trendDirection === 'rising' ? '#C9A96E' : tempAnalysis.trendDirection === 'falling' ? '#6B7DB3' : '#A09A90',
                            }}>
                              {tempAnalysis.trendDirection === 'rising' ? '↑ Rising' : tempAnalysis.trendDirection === 'falling' ? '↓ Falling' : '→ Stable'}
                            </span>
                          </div>
                        </div>

                        <div style={{
                          marginTop: 12, fontSize: 12, color: '#6B635A', lineHeight: 1.6,
                          background: tempAnalysis.ovulationDetected ? '#C9A96E10' : '#F6F4F0',
                          borderRadius: 8, padding: '10px 14px',
                          borderLeft: `3px solid ${tempAnalysis.ovulationDetected ? '#C9A96E' : '#E8E4DD'}`,
                        }}>
                          {tempAnalysis.ovulationDetected
                            ? `Thermal shift detected with ${tempAnalysis.ovulationConfidence} confidence — your temperature rose above baseline, suggesting you've ovulated. You're likely in the luteal phase.`
                            : tempAnalysis.hasEnoughData
                              ? `${tempAnalysis.ringAnalysis.message}. Your ring skin temperature is ${tempAnalysis.trendDirection}. Ovulation typically causes a sustained 0.3–0.5°F rise.`
                              : `Building your temperature baseline — ${tempAnalysis.daysOfData} of 5+ days collected. Keep wearing your ring overnight for accurate pattern detection.`
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Well-being Trends */}
                  {moodData.length >= 2 && (
                    <div style={{
                      background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                      borderRadius: 16, padding: '16px 18px', marginBottom: 14,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Icons.activity size={15} color="#C4948A" />
                        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825' }}>
                          Well-being Trends
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#A09A90', marginBottom: 14 }}>
                        Last {checkins.slice(-14).length} check-ins
                      </div>
                      {(() => {
                        const recent = checkins.slice(-14)
                        const W = 300, H = 100, padX = 0, padY = 8
                        const cW = W - padX * 2, cH = H - padY * 2
                        const metrics = [
                          { key: 'mood', color: '#9BAF93', label: 'Mood' },
                          { key: 'energy', color: '#C9A96E', label: 'Energy' },
                          { key: 'stress', color: '#C4948A', label: 'Stress' },
                        ]
                        const makePath = (data) => {
                          const vals = data.map((c, i) => {
                            const v = parseFloat(c)
                            if (isNaN(v)) return null
                            return { x: padX + (i / (recent.length - 1)) * cW, y: padY + cH - (v / 10) * cH }
                          }).filter(Boolean)
                          if (vals.length < 2) return ''
                          return vals.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
                        }
                        return (
                          <div>
                            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} preserveAspectRatio="none">
                              {[2, 4, 6, 8].map(v => (
                                <line key={v} x1={padX} x2={W - padX} y1={padY + cH - (v / 10) * cH} y2={padY + cH - (v / 10) * cH}
                                  stroke="#F0EDE8" strokeWidth="0.5" />
                              ))}
                              {metrics.map(m => {
                                const path = makePath(recent.map(c => c[m.key]))
                                if (!path) return null
                                return <path key={m.key} d={path} fill="none" stroke={m.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              })}
                              {metrics.map(m => {
                                const lastVal = parseFloat(recent[recent.length - 1]?.[m.key])
                                if (isNaN(lastVal)) return null
                                const x = W - padX
                                const y = padY + cH - (lastVal / 10) * cH
                                return <circle key={m.key + 'd'} cx={x} cy={y} r="3" fill={m.color} />
                              })}
                            </svg>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                              <span style={{ fontSize: 9, color: '#C8C3BA' }}>
                                {new Date(recent[0]?.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span style={{ fontSize: 9, color: '#C8C3BA' }}>
                                {new Date(recent[recent.length - 1]?.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                              {metrics.map(m => {
                                const vals = recent.map(c => parseFloat(c[m.key])).filter(v => !isNaN(v))
                                const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—'
                                return (
                                  <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 8, height: 3, borderRadius: 2, background: m.color }} />
                                    <span style={{ fontSize: 11, color: '#8A8279' }}>{m.label}</span>
                                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 13, color: '#2C2825' }}>{avg}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  {/* ─── Weekly Insight Report ─── */}
                  {checkins.length >= 3 && (
                    <WeeklyReport
                      checkins={checkins}
                      bloodwork={bloodwork}
                      wearable={wearable}
                      ringDays={ringDays}
                      tempAnalysis={tempAnalysis}
                      riskFlags={riskFlags}
                      phaseKey={phaseKey}
                      phase={phase}
                    />
                  )}
                </>
              )}

              {/* ═══════════ TAB: HEALTH ═══════════ */}
              {activeTab === 'health' && (
                <>
                  {/* Bloodwork Insights — Expandable */}
                  {bloodwork.length > 0 && (
                    <div style={{
                      background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                      borderRadius: 16, overflow: 'hidden', marginBottom: 14,
                    }}>
                      <button onClick={() => setBloodworkExpanded(!bloodworkExpanded)} className="w-full text-left cursor-pointer" style={{
                        fontFamily: "'DM Sans', sans-serif",
                        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none',
                      }}>
                        <Icons.flask size={15} color="#C4948A" />
                        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825', flex: 1 }}>
                          Bloodwork Insights
                        </span>
                        {flaggedBloodwork.length > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#C4948A', background: '#C4948A15', borderRadius: 10, padding: '2px 8px' }}>
                            {flaggedBloodwork.length} flagged
                          </span>
                        )}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A09A90" strokeWidth="2" strokeLinecap="round" style={{
                          transform: bloodworkExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s',
                        }}><polyline points="6 9 12 15 18 9" /></svg>
                      </button>

                      {!bloodworkExpanded && bloodworkInsights.length > 0 && (
                        <div style={{ padding: '0 18px 14px' }}>
                          {bloodworkInsights.slice(0, 2).map((insight, i) => (
                            <div key={i} style={{
                              padding: '8px 0',
                              borderBottom: i === 0 ? '1px solid #F0EDE8' : 'none',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#2C2825' }}>{insight.test_name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {insight.value && (
                                    <span style={{ fontSize: 11, color: '#8A8279' }}>{insight.value} {insight.unit}</span>
                                  )}
                                  <span style={{
                                    fontSize: 9, fontWeight: 700,
                                    color: insight.status === 'low' ? '#C4948A' : '#C9A96E',
                                    background: insight.status === 'low' ? '#C4948A15' : '#C9A96E15',
                                    borderRadius: 4, padding: '2px 8px',
                                  }}>{insight.status?.toUpperCase()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {bloodworkInsights.length > 2 && (
                            <div style={{ fontSize: 11, color: '#A09A90', marginTop: 6 }}>+{bloodworkInsights.length - 2} more — tap to see all</div>
                          )}
                        </div>
                      )}

                      {bloodworkExpanded && (
                        <div style={{ padding: '0 18px 16px' }}>
                          {bloodworkInsights.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: '#C4948A', marginBottom: 10 }}>Flagged markers</div>
                              {bloodworkInsights.map((insight, i) => (
                                <div key={i} style={{
                                  padding: '12px',
                                  marginBottom: 8,
                                  background: insight.status === 'low' ? '#C4948A06' : '#C9A96E06',
                                  borderRadius: 10,
                                  borderLeft: `3px solid ${insight.status === 'low' ? '#C4948A' : '#C9A96E'}`,
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2C2825' }}>
                                      {insight.test_name}
                                    </span>
                                    <span style={{
                                      fontSize: 9, fontWeight: 700,
                                      color: insight.status === 'low' ? '#C4948A' : '#C9A96E',
                                      background: insight.status === 'low' ? '#C4948A15' : '#C9A96E15',
                                      borderRadius: 4, padding: '2px 8px',
                                    }}>{insight.status?.toUpperCase()}</span>
                                  </div>
                                  {insight.value && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                      <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: '#2C2825' }}>
                                        {insight.value}
                                      </span>
                                      <span style={{ fontSize: 11, color: '#A09A90' }}>{insight.unit}</span>
                                      {insight.reference && (
                                        <span style={{ fontSize: 10, color: '#C8C3BA', marginLeft: 'auto' }}>
                                          Ref: {insight.reference}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <div style={{ fontSize: 12, color: '#6B635A', lineHeight: 1.6 }}>
                                    {insight.context}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {(() => {
                            const normalCount = bloodwork.filter(b => b.status === 'normal').length
                            if (normalCount === 0) return null
                            return (
                              <div style={{ fontSize: 11, color: '#9BAF93', marginTop: 4 }}>
                                ✓ {normalCount} other markers in normal range
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile — Name & Birthday */}
                  <div style={{
                    background: '#FFFEF9', border: '1px solid #E8E4DD',
                    borderRadius: 16, padding: '16px 18px', marginBottom: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <Icons.heart size={15} color="#C4948A" />
                      <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825' }}>Your Profile</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#A09A90', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</div>
                        <input
                          type="text"
                          value={profileName}
                          placeholder="Your first name..."
                          onChange={e => setProfileName(e.target.value)}
                          onBlur={() => {
                            try {
                              const answers = JSON.parse(localStorage.getItem('onboardingAnswers') || '{}')
                              answers.name = profileName
                              localStorage.setItem('onboardingAnswers', JSON.stringify(answers))
                            } catch {}
                          }}
                          style={{
                            width: '100%', fontFamily: 'inherit', fontSize: 13, padding: '8px 12px',
                            borderRadius: 8, border: '1px solid #E8E4DD', background: '#F6F4F0',
                            color: '#2C2825', outline: 'none',
                          }}
                          onFocus={e => e.target.style.borderColor = '#C4948A'}
                          onBlurCapture={e => e.target.style.borderColor = '#E8E4DD'}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#A09A90', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Birthday</div>
                        <input
                          type="date"
                          value={profileBirthday}
                          onChange={e => setProfileBirthday(e.target.value)}
                          onBlur={() => {
                            try {
                              const answers = JSON.parse(localStorage.getItem('onboardingAnswers') || '{}')
                              answers.birthday = profileBirthday
                              localStorage.setItem('onboardingAnswers', JSON.stringify(answers))
                            } catch {}
                          }}
                          style={{
                            width: '100%', fontFamily: 'inherit', fontSize: 13, padding: '8px 12px',
                            borderRadius: 8, border: '1px solid #E8E4DD', background: '#F6F4F0',
                            color: '#2C2825', outline: 'none',
                          }}
                          onFocus={e => e.target.style.borderColor = '#C4948A'}
                          onBlurCapture={e => e.target.style.borderColor = '#E8E4DD'}
                        />
                        {profileBirthday && (() => {
                          const today = new Date()
                          const birth = new Date(profileBirthday)
                          let age = today.getFullYear() - birth.getFullYear()
                          if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
                          return <div style={{ fontSize: 11, color: '#A09A90', marginTop: 4 }}>{age} years old</div>
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Supplement Protocol — Expandable + Editable */}
                  <div style={{
                    background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                    borderRadius: 16, overflow: 'hidden', marginBottom: 14,
                  }}>
                    <button onClick={() => setSuppExpanded(!suppExpanded)} className="w-full text-left cursor-pointer" style={{
                      fontFamily: "'DM Sans', sans-serif",
                      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8,
                      background: 'none', border: 'none',
                    }}>
                      <Icons.pill size={15} color="#9BAF93" />
                      <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825', flex: 1 }}>
                        Supplement Protocol
                      </span>
                      {suppTotal > 0 && (
                        <span style={{
                          fontSize: 12, fontWeight: 600,
                          color: suppRate >= 80 ? '#9BAF93' : suppRate >= 50 ? '#C9A96E' : '#C4948A',
                        }}>{suppRate}%</span>
                      )}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A09A90" strokeWidth="2" strokeLinecap="round" style={{
                        transform: suppExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s',
                      }}><polyline points="6 9 12 15 18 9" /></svg>
                    </button>

                    {!suppExpanded && (
                      <div style={{ padding: '0 18px 14px' }}>
                        {suppTotal > 0 && (
                          <>
                            <div style={{ height: 6, background: '#E8E4DD', borderRadius: 3, marginBottom: 6 }}>
                              <div style={{
                                height: '100%', borderRadius: 3, width: `${suppRate}%`,
                                background: suppRate >= 80 ? '#9BAF93' : suppRate >= 50 ? '#C9A96E' : '#C4948A',
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A09A90' }}>
                              <span>{suppYes} of {suppTotal} days fully taken</span>
                              <span>Tap to see details →</span>
                            </div>
                          </>
                        )}
                        {suppProtocol.length === 0 && suppTotal === 0 && (
                          <div style={{ fontSize: 12, color: '#A09A90' }}>Tap to set up your supplement stack</div>
                        )}
                      </div>
                    )}

                    {suppExpanded && (
                      <div style={{ padding: '0 18px 16px' }}>
                        {suppTotal > 0 && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: '#A09A90', marginBottom: 6 }}>Adherence</div>
                            <div style={{ height: 6, background: '#E8E4DD', borderRadius: 3, marginBottom: 4 }}>
                              <div style={{
                                height: '100%', borderRadius: 3, width: `${suppRate}%`,
                                background: suppRate >= 80 ? '#9BAF93' : suppRate >= 50 ? '#C9A96E' : '#C4948A',
                              }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A09A90', marginBottom: 12 }}>
                              <span>{suppYes} fully · {suppSome} partially · {suppTotal - suppYes - suppSome} missed</span>
                              <span>{suppRate}%</span>
                            </div>

                            {suppProtocol.length > 0 && (() => {
                              const suppStats = suppProtocol.map(supp => {
                                let taken = 0, missed = 0, total = 0
                                const suppNorm = supp.toLowerCase().trim()
                                checkins.forEach(c => {
                                  if (!c.supplements_taken) return
                                  total++
                                  const specifics = (c.specific_supplements || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
                                  if (specifics.length > 0) {
                                    const wasTaken = specifics.some(s => s.includes(suppNorm) || suppNorm.includes(s))
                                    wasTaken ? taken++ : missed++
                                  } else if (c.supplements_taken === 'yes') {
                                    taken++
                                  } else {
                                    missed++
                                  }
                                })
                                const rate = total > 0 ? Math.round((taken / total) * 100) : 0
                                return { name: supp, taken, missed, total, rate }
                              })
                              const sorted = [...suppStats].sort((a, b) => a.rate - b.rate)
                              return (
                                <div>
                                  <div style={{ fontSize: 10, fontWeight: 600, color: '#8A8279', marginBottom: 8 }}>Per Supplement</div>
                                  {sorted.map((s, i) => (
                                    <div key={i} style={{
                                      display: 'flex', alignItems: 'center', gap: 8,
                                      padding: '7px 0',
                                      borderBottom: i < sorted.length - 1 ? '1px solid #F0EDE8' : 'none',
                                    }}>
                                      <span style={{ fontSize: 12, color: '#2C2825', flex: 1 }}>{s.name}</span>
                                      <div style={{ width: 60, height: 4, background: '#E8E4DD', borderRadius: 2 }}>
                                        <div style={{
                                          height: '100%', borderRadius: 2,
                                          width: `${s.rate}%`,
                                          background: s.rate >= 80 ? '#9BAF93' : s.rate >= 50 ? '#C9A96E' : '#C4948A',
                                        }} />
                                      </div>
                                      <span style={{
                                        fontSize: 11, fontWeight: 600, minWidth: 32, textAlign: 'right',
                                        color: s.rate >= 80 ? '#9BAF93' : s.rate >= 50 ? '#C9A96E' : '#C4948A',
                                      }}>{s.rate}%</span>
                                      <span style={{ fontSize: 10, color: '#A09A90', minWidth: 36, textAlign: 'right' }}>
                                        {s.taken}/{s.total}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )
                            })()}
                          </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#9BAF93', marginBottom: 8 }}>My Supplements</div>
                          {suppProtocol.length === 0 && (
                            <div style={{ fontSize: 12, color: '#A09A90', marginBottom: 8 }}>No supplements added yet. Add below or get AI suggestions.</div>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                            {suppProtocol.map((supp, i) => (
                              <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                fontSize: 12, color: '#2C2825', background: '#9BAF9312',
                                borderRadius: 20, padding: '5px 8px 5px 12px', border: '1px solid #9BAF9330',
                              }}>
                                <span>{supp}</span>
                                <button onClick={() => {
                                  const updated = suppProtocol.filter((_, j) => j !== i)
                                  setSuppProtocol(updated)
                                  saveSupplements(updated)
                                }} className="cursor-pointer" style={{
                                  background: 'none', border: 'none', fontFamily: 'inherit',
                                  fontSize: 14, color: '#C4948A', padding: '0 2px', lineHeight: 1,
                                }}>×</button>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input
                              type="text" placeholder="Add supplement..."
                              value={suppInput}
                              onChange={(e) => setSuppInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && suppInput.trim()) {
                                  const updated = [...suppProtocol, suppInput.trim()]
                                  setSuppProtocol(updated)
                                  saveSupplements(updated)
                                  setSuppInput('')
                                }
                              }}
                              style={{
                                flex: 1, fontFamily: 'inherit', fontSize: 13, padding: '8px 12px',
                                borderRadius: 8, border: '1px solid #E8E4DD', background: '#F6F4F0',
                                color: '#2C2825', outline: 'none',
                              }}
                              onFocus={(e) => (e.target.style.borderColor = '#9BAF93')}
                              onBlur={(e) => (e.target.style.borderColor = '#E8E4DD')}
                            />
                            <button onClick={() => {
                              if (suppInput.trim()) {
                                const updated = [...suppProtocol, suppInput.trim()]
                                setSuppProtocol(updated)
                                saveSupplements(updated)
                                setSuppInput('')
                              }
                            }} className="cursor-pointer" style={{
                              fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: 'white',
                              background: '#9BAF93', border: 'none', borderRadius: 8, padding: '8px 14px',
                            }}>Add</button>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Icons.sparkle size={13} color="#C9A96E" />
                              <span style={{ fontSize: 10, fontWeight: 600, color: '#C9A96E' }}>AI Phase Timing</span>
                            </div>
                            <button onClick={async () => {
                              setSuppAiLoading(true)
                              try {
                                const prompt = `You are a supplement specialist. Give phase-specific supplement recs for this user. Be CONCISE.

${getProfileContext()}
Bloodwork: ${flaggedBloodwork.map(b => `${b.test_name}: ${b.value} (${b.status})`).join(', ') || 'None'}
Symptoms: ${Object.entries(PHASE_DATA).map(([key, ph]) => {
  const _saOvulDateStr = tempAnalysis?.estimatedOvulationDate
  const _saOvulCheckin = _saOvulDateStr ? checkins.find(c => c.date === _saOvulDateStr) : null
  const _saOvulDay = _saOvulCheckin?.cycle_day ? parseInt(_saOvulCheckin.cycle_day) : null
  const _saAssignPhase = makeAssignPhase(_saOvulDay)
  const phCheckins = checkins.filter(c => _saAssignPhase(c) === key)
  const sx = {}
  phCheckins.forEach(c => { if (c.symptoms) c.symptoms.split(',').forEach(s => { const t = s.trim(); if (t && t !== 'None') sx[t] = (sx[t]||0)+1 }) })
  return `${ph.name}: ${Object.keys(sx).join(', ') || 'none'}`
}).join(' | ')}

Respond in JSON. Keep each phase value SHORT (under 15 words). Include exactly 4 supplements:
[{"supplement":"name","phases":{"menstrual":"short rec","follicular":"short rec","ovulation":"short rec","luteal":"short rec"},"priority":"high|medium|low","insight":"short insight"}]`
                                const response = await fetch('http://localhost:3001/api/insights', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
                                })
                                const data = await response.json()
                                const text = data.content?.map(c => c.text || '').join('') || ''
                                let clean = text.replace(/```json|```/g, '').trim()
                                try {
                                  setSuppAiTips(JSON.parse(clean))
                                } catch {
                                  const lastComplete = clean.lastIndexOf('}')
                                  if (lastComplete > 0) {
                                    const trimmed = clean.substring(0, lastComplete + 1) + ']'
                                    setSuppAiTips(JSON.parse(trimmed))
                                  }
                                }
                              } catch (err) { console.error('Supp AI error:', err) }
                              finally { setSuppAiLoading(false) }
                            }} className="cursor-pointer" style={{
                              fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
                              color: '#C9A96E', background: '#C9A96E15', border: 'none',
                              borderRadius: 6, padding: '4px 10px',
                            }}>
                              {suppAiLoading ? 'Analyzing...' : suppAiTips ? 'Refresh' : 'Generate'}
                            </button>
                          </div>

                          {suppAiLoading && (
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                              <div style={{ fontSize: 12, color: '#A09A90' }}>Analyzing your data for supplement timing...</div>
                            </div>
                          )}

                          {suppAiTips && !suppAiLoading && (
                            <div>
                              {suppAiTips.map((tip, i) => {
                                const isInProtocol = suppProtocol.some(s => s.toLowerCase() === tip.supplement.toLowerCase())
                                return (
                                  <div key={i} style={{
                                    padding: '10px 0',
                                    borderBottom: i < suppAiTips.length - 1 ? '1px solid #F0EDE8' : 'none',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                      <span style={{ fontSize: 13, fontWeight: 600, color: '#2C2825' }}>{tip.supplement}</span>
                                      <span style={{
                                        fontSize: 9, fontWeight: 700,
                                        color: tip.priority === 'high' ? '#C4948A' : tip.priority === 'medium' ? '#C9A96E' : '#9BAF93',
                                        background: tip.priority === 'high' ? '#C4948A15' : tip.priority === 'medium' ? '#C9A96E15' : '#9BAF9315',
                                        borderRadius: 4, padding: '1px 6px',
                                      }}>{tip.priority}</span>
                                      {isInProtocol ? (
                                        <span style={{ fontSize: 9, color: '#9BAF93', fontWeight: 600 }}>✓ Taking</span>
                                      ) : (
                                        <button onClick={() => {
                                          const updated = [...suppProtocol, tip.supplement]
                                          setSuppProtocol(updated)
                                          saveSupplements(updated)
                                        }} className="cursor-pointer" style={{
                                          fontFamily: 'inherit', fontSize: 9, fontWeight: 600,
                                          color: '#9BAF93', background: '#9BAF9315', border: '1px solid #9BAF9330',
                                          borderRadius: 4, padding: '1px 6px',
                                        }}>+ Add</button>
                                      )}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#6B635A', lineHeight: 1.5, marginBottom: 6 }}>
                                      {tip.insight}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                      {Object.entries(tip.phases || {}).map(([phKey, note]) => {
                                        const ph = PHASE_DATA[phKey]
                                        if (!ph || !note) return null
                                        return (
                                          <div key={phKey} style={{
                                            fontSize: 10, color: '#8A8279', background: `${ph.color}08`,
                                            borderRadius: 6, padding: '5px 8px', borderLeft: `2px solid ${ph.color}`,
                                          }}>
                                            <span style={{ fontWeight: 600, color: ph.color }}>{ph.name}: </span>{note}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {!suppAiTips && !suppAiLoading && (
                            <div style={{ fontSize: 12, color: '#A09A90', textAlign: 'center', padding: '8px 0' }}>
                              Get AI-powered phase-specific supplement timing
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Section */}
                  <button onClick={() => navigate('/bloodwork')} className="w-full cursor-pointer" style={{
                    fontFamily: "'DM Sans', sans-serif", background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                    borderRadius: 16, padding: '16px 18px', marginBottom: 14,
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                  }}>
                    <Icons.plus size={16} color="#A09A90" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#2C2825' }}>Upload Bloodwork</div>
                      <div style={{ fontSize: 11, color: '#A09A90' }}>Add new lab results for AI analysis</div>
                    </div>
                  </button>

                  {/* My Profile */}
                  {(() => {
                    const profile = getUserProfile()
                    return (
                      <div style={{
                        background: '#FFFEF9', border: '1px solid #E8E4DD', boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                        borderRadius: 16, padding: '16px 18px', marginBottom: 14,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, color: '#2C2825' }}>My Profile</div>
                          <button onClick={() => { localStorage.removeItem('onboardingAnswers'); localStorage.removeItem('suppProtocol'); navigate('/onboarding') }} className="cursor-pointer" style={{
                            fontSize: 11, color: '#A09A90', background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif", textDecoration: 'underline',
                          }}>Retake intake</button>
                        </div>
                        {!profile.hasProfile ? (
                          <button onClick={() => navigate('/onboarding')} className="w-full cursor-pointer" style={{
                            fontFamily: "'DM Sans', sans-serif", background: '#F6F4F0', border: '1px dashed #D5D0C8',
                            borderRadius: 10, padding: '14px', textAlign: 'center', color: '#8A8279', fontSize: 12,
                          }}>
                            Complete your intake quiz to personalize AI insights →
                          </button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                              { label: 'Cycle', value: profile.cycleLengthLabel },
                              { label: 'Period', value: profile.periodLengthLabel },
                              { label: 'Birth control', value: profile.birthControlLabel },
                              ...(profile.isPostHBC ? [{ label: 'BC history', value: profile.bcHistoryLabel }] : []),
                              ...(profile.conditionLabels.length > 0 ? [{ label: 'Conditions', value: profile.conditionLabels.join(', ') }] : []),
                              { label: 'Goals', value: profile.goalLabels.join(', ') || 'None set' },
                              { label: 'Wearables', value: profile.wearables.length > 0 ? profile.wearables.map(w => w.replace('_', ' ')).join(', ') : 'None' },
                            ].map((row, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0EDE8', paddingBottom: 6 }}>
                                <span style={{ fontSize: 12, color: '#A09A90', fontWeight: 500 }}>{row.label}</span>
                                <span style={{ fontSize: 12, color: '#2C2825', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                              </div>
                            ))}
                            {profile.isRecentPostHBC && (
                              <div style={{
                                background: '#C4948A10', border: '1px solid #C4948A20', borderRadius: 8,
                                padding: '8px 12px', fontSize: 11, color: '#8A8279', lineHeight: 1.5, marginTop: 4,
                              }}>
                                Post-hormonal BC recovery detected — AI insights will prioritize cycle regulation and hormone rebalancing guidance.
                              </div>
                            )}
                            {profile.hasPCOS && (
                              <div style={{
                                background: '#C9A96E10', border: '1px solid #C9A96E20', borderRadius: 8,
                                padding: '8px 12px', fontSize: 11, color: '#8A8279', lineHeight: 1.5, marginTop: 4,
                              }}>
                                PCOS profile active — AI insights will factor in insulin sensitivity, androgen management, and anti-inflammatory strategies.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Connected Devices */}
                  <ConnectedDevices
                    uhConnected={!!getUHToken()}
                    onConnectUH={(token) => {
                      localStorage.setItem(UH_TOKEN_KEY, token)
                      window.location.reload()
                    }}
                    onDisconnectUH={() => {
                      localStorage.removeItem(UH_TOKEN_KEY)
                      window.location.reload()
                    }}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,254,249,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #E8E4DD',
        padding: '6px 0 env(safe-area-inset-bottom, 8px)',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, maxWidth: 400, margin: '0 auto' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key
            const TabIcon = tab.icon
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="cursor-pointer" style={{
                flex: 1, fontFamily: "'DM Sans', sans-serif",
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '8px 0', background: 'none', border: 'none',
              }}>
                <TabIcon size={18} color={isActive ? '#2C2825' : '#C8C3BA'} />
                <span style={{
                  fontSize: 10, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#2C2825' : '#C8C3BA',
                }}>{tab.label}</span>
                {isActive && (
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#2C2825', marginTop: -1,
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
