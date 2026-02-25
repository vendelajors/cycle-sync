import { useState, useRef, useEffect } from 'react'
import { getProfileContext, getUserProfile } from './userProfile'
import { getRiskFlagContext } from './correlationEngine'
import { PHASE_DATA } from './CycleData'
import { buildSystemMessage, buildUserMessage, callProxy } from './promptBuilder'

const cToF = (c) => c != null ? Math.round((c * 9 / 5 + 32) * 10) / 10 : null

/* --- Inline SVG Icons (matching app Icons pattern) --- */
const WIcon = {
  chart:       ({ size = 16, color = '#A09A90' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>,
  check:       ({ size = 16, color = '#A09A90' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>,
  alertCircle: ({ size = 16, color = '#A09A90' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  trending:    ({ size = 16, color = '#A09A90' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18" /></svg>,
  ring:        ({ size = 16, color = '#A09A90' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>,
  sparkle:     ({ size = 16, color = '#C4948A' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>,
  download:    ({ size = 16, color = '#A09A90' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>,
  refresh:     ({ size = 16, color = '#A09A90' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.5" strokeDasharray="4 2.5"/><circle cx="12" cy="3.5" r="2" fill="#C4948A"/><circle cx="20.5" cy="12" r="2" fill="#9BAF93"/><circle cx="12" cy="20.5" r="2" fill="#C9A96E"/><circle cx="3.5" cy="12" r="2" fill="#9C8FBF"/></svg>,
  xMark:       ({ size = 16, color = '#A09A90' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>,
}

// Returns YYYY-MM-DD of the most recent Monday
function getThisMondayKey() {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d.toISOString().split('T')[0]
}

function isTodayMonday() {
  return new Date().getDay() === 1
}

// --- Weekly Report Component ---
export function WeeklyReport({
  checkins = [],
  bloodwork = [],
  wearable = null,
  ringDays = [],
  tempAnalysis = null,
  riskFlags = [],
  phaseKey = null,
  phase = null,
}) {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const reportRef = useRef(null)

  const thisMonday = getThisMondayKey()
  const cacheKey = `weeklyReport_${thisMonday}`

  // On mount: restore cached report or auto-generate if today is Monday
  useEffect(() => {
    if (checkins.length < 3) return
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try { setReport(JSON.parse(cached)); return } catch {}
    }
    if (isTodayMonday()) generateReport()
  }, [checkins.length])

  const generateReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const sorted = [...checkins].sort((a, b) => a.date?.localeCompare(b.date))
      const last7 = sorted.filter(c => c.date <= yesterday).slice(-7)
      const prev7 = sorted.slice(-14, -7)

      const flaggedBW = bloodwork.filter(b => b.status === 'low' || b.status === 'high')
      const riskCtx = getRiskFlagContext(riskFlags)

      const avg = (arr, key) => {
        const vals = arr.map(c => parseFloat(c[key])).filter(v => !isNaN(v) && v > 0)
        return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
      }
      const weekAvgs = {
        mood: avg(last7, 'mood'), energy: avg(last7, 'energy'),
        stress: avg(last7, 'stress'), sleep: avg(last7, 'sleep_quality'),
      }
      const prevAvgs = { mood: avg(prev7, 'mood'), energy: avg(prev7, 'energy') }

      const symptomCounts = {}
      last7.forEach(c => {
        if (c.symptoms) c.symptoms.split(',').forEach(s => {
          const t = s.trim()
          if (t && t !== 'None') symptomCounts[t] = (symptomCounts[t] || 0) + 1
        })
      })
      const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

      const recentRing = ringDays.filter(d => d.date <= yesterday).slice(-7)
      const ringAvg = (key) => {
        const vals = recentRing.map(d => parseFloat(d[key])).filter(v => !isNaN(v) && v > 0)
        return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
      }
      const ringAvgs = recentRing.length > 0 ? {
        sleep: ringAvg('sleepScore'), hrv: ringAvg('avgSleepHrv'),
        rhr: ringAvg('nightRhr'), recovery: ringAvg('recoveryIndex'), steps: ringAvg('steps'),
      } : null

      const workoutCounts = {}
      last7.forEach(c => {
        if (c.workout_type && c.workout_type !== 'None' && c.workout_type !== 'Rest')
          workoutCounts[c.workout_type] = (workoutCounts[c.workout_type] || 0) + 1
      })
      const workoutSummary = Object.entries(workoutCounts).map(([t, n]) => `${t} x${n}`).join(', ') || 'No workouts logged'
      const suppYes = last7.filter(c => c.supplements_taken === 'yes').length
      const suppRate = last7.length > 0 ? Math.round((suppYes / last7.length) * 100) : null

      // Load past weekly summaries for longitudinal context
      const pastMemory = (() => {
        try {
          const memory = JSON.parse(localStorage.getItem('weeklyMemory') || '[]')
          const past = memory.filter(m => m.week !== thisMonday).slice(0, 3)
          if (past.length === 0) return ''
          return '\n## Past Weekly Summaries (longitudinal context)\n' +
            past.map(m => `Week of ${m.week}: "${m.weekTitle}" — Score ${m.overallScore}/10. ${m.scoreSummary} Highlights: ${(m.highlights||[]).join(' | ')} Watch: ${(m.watchPoints||[]).join(' | ')}`).join('\n') + '\n'
        } catch { return '' }
      })()

      const system = buildSystemMessage('women\'s health analyst generating a weekly wellness report', `- All check-in values are on a 1-10 scale.
- Be warm but data-driven. Reference specific numbers.
- Use Fahrenheit for temperatures.
- If no wearable data is available, set wearableSummary to null.

OUTPUT FORMAT:
{
  "weekTitle": "short evocative title (3-6 words)",
  "overallScore": 7,
  "scoreSummary": "one sentence with specific data reference",
  "highlights": ["2-3 specific positives with data"],
  "watchPoints": ["1-2 actionable watch points"],
  "phaseInsight": "2-3 sentences on cycle phase connection -- hormones, what was expected vs surprising",
  "patternInsight": "1-2 sentences on a notable pattern across the week",
  "nextWeekFocus": ["3 specific actionable recs tied to upcoming phase"],
  "wearableSummary": "1-2 sentences on biometric story, or null if no ring data",
  "motivationalClose": "1 warm closing sentence referencing her actual data"
}`)

      const userMessage = buildUserMessage([
        { heading: 'User Profile', content: getProfileContext() },
        { heading: 'Past Weekly Summaries', content: pastMemory },
        { heading: `This Week (${last7[0]?.date || '?'} to ${last7[last7.length-1]?.date || '?'})`, content: `Check-ins: ${last7.length}/7

Check-in averages (1-10 scale):
Mood: ${weekAvgs.mood || '?'} ${prevAvgs.mood ? `(prev: ${prevAvgs.mood}, ${parseFloat(weekAvgs.mood) >= parseFloat(prevAvgs.mood) ? 'up' : 'down'})` : ''}
Energy: ${weekAvgs.energy || '?'} ${prevAvgs.energy ? `(prev: ${prevAvgs.energy}, ${parseFloat(weekAvgs.energy) >= parseFloat(prevAvgs.energy) ? 'up' : 'down'})` : ''}
Stress: ${weekAvgs.stress || '?'}
Sleep quality: ${weekAvgs.sleep || '?'}

Symptoms: ${topSymptoms.length > 0 ? topSymptoms.map(([s,n]) => `${s} (${n}d)`).join(', ') : 'none'}
Exercise: ${workoutSummary}
Supplements: ${suppRate !== null ? `${suppRate}% adherence` : 'not tracked'}` },
        { heading: 'Daily Detail', content: last7.map(c => `${c.date} Day${c.cycle_day||'?'}: mood=${c.mood} energy=${c.energy} stress=${c.stress} BBT=${c.bbt ? cToF(parseFloat(c.bbt))+'F' : '?'} CM=${c.cervical_mucus||'-'} sx=[${c.symptoms||'none'}]`).join('\n') },
        { heading: 'Cycle Phase', content: `${phase ? phase.name : 'Unknown'}${phaseKey && PHASE_DATA[phaseKey] ? ' -- ' + (PHASE_DATA[phaseKey].hormones||'') : ''}` },
        { heading: 'Wearable 7-Day Averages', content: ringAvgs ? `HRV: ${ringAvgs.hrv}ms | Sleep: ${ringAvgs.sleep} | Recovery: ${ringAvgs.recovery} | RHR: ${ringAvgs.rhr}bpm` : 'No wearable data' },
        { heading: 'BBT Analysis', content: tempAnalysis ? `Baseline: ${cToF(tempAnalysis.baseline)}F | Ovulation: ${tempAnalysis.ovulationDetected ? 'confirmed' : 'not detected'}` : 'No BBT data' },
        { heading: 'Bloodwork Flags', content: flaggedBW.length > 0 ? flaggedBW.map(b => `${b.test_name} ${b.status}`).join(', ') : 'none' },
        { heading: 'Risk Flags', content: riskCtx },
      ])

      const parsed = await callProxy({ system, userMessage, maxTokens: 1200 })

      const full = { ...parsed, weekAvgs, ringAvgs, generatedAt: new Date().toISOString() }
      localStorage.setItem(cacheKey, JSON.stringify(full))
      setReport(full)

      // Save slim summary to rolling memory (max 4 weeks)
      try {
        const memory = JSON.parse(localStorage.getItem('weeklyMemory') || '[]')
        const summary = {
          week: thisMonday,
          weekTitle: parsed.weekTitle,
          overallScore: parsed.overallScore,
          scoreSummary: parsed.scoreSummary,
          highlights: parsed.highlights,
          watchPoints: parsed.watchPoints,
          weekAvgs,
        }
        const updated = [summary, ...memory.filter(m => m.week !== thisMonday)].slice(0, 4)
        localStorage.setItem('weeklyMemory', JSON.stringify(updated))
      } catch {}
    } catch (err) {
      console.error('Weekly report error:', err)
      setError('Could not generate report. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    const blob = new Blob([generateHTML(report, thisMonday)], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `cycle-sync-weekly-${thisMonday}.html`
    a.click(); URL.revokeObjectURL(url)
  }

  const scoreColor = (s) => s >= 8 ? '#7A9470' : s >= 6 ? '#C9A96E' : '#C4948A'

  // --- Pre-generation / loading ---
  if (!report) {
    return (
      <div style={{
        background: '#FFFEF9', border: '1px solid #E8E4DD',
        borderRadius: 14, padding: '16px 18px', marginBottom: 14,
        boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <WIcon.chart size={15} color="#C4948A" />
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2C2825' }}>
            Weekly Report
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#A09A90', marginBottom: 14 }}>
          {loading ? 'Analyzing your week…' : isTodayMonday() ? 'Generating your Monday morning report…' : 'AI summary of your last 7 days · auto-generates every Monday'}
        </div>

        {checkins.length < 3 ? (
          <div style={{ fontSize: 12, color: '#A09A90', background: '#F6F4F0', borderRadius: 8, padding: '10px 12px' }}>
            Log at least 3 check-ins to generate a weekly report.
          </div>
        ) : loading ? (
          <div style={{ padding: '16px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#C8C3BA' }}>This takes about 10 seconds</div>
          </div>
        ) : (
          <>
            {error && <div style={{ fontSize: 11, color: '#C4948A', marginBottom: 10 }}>{error}</div>}
            <button
              onClick={generateReport}
              className="w-full cursor-pointer"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: '#2C2825', color: 'white',
                border: 'none', borderRadius: 10,
                padding: '12px', fontSize: 13, fontWeight: 600,
              }}
            >
              Generate Weekly Report
            </button>
          </>
        )}
      </div>
    )
  }

  // --- Report display ---
  return (
    <div ref={reportRef} style={{
      background: '#FFFEF9', border: '1px solid #E8E4DD',
      borderRadius: 14, overflow: 'hidden', marginBottom: 14,
      boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
    }}>
      <div style={{ background: 'linear-gradient(135deg, #2C2825 0%, #3D3530 100%)', padding: '18px 20px' }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 5 }}>
          WEEKLY REPORT · WEEK OF {thisMonday.toUpperCase()}
        </div>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 21, color: 'white', marginBottom: 10, lineHeight: 1.2 }}>
          {report.weekTitle}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: scoreColor(report.overallScore), lineHeight: 1 }}>
            {report.overallScore}<span style={{ fontSize: 13, opacity: 0.5 }}>/10</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', flex: 1, lineHeight: 1.4 }}>
            {report.scoreSummary}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 18px' }}>

        {report.phaseInsight && (
          <div style={{ background: '#C4948A08', border: '1px solid #C4948A20', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <WIcon.refresh size={13} color="#C4948A" />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#C4948A', letterSpacing: 0.5 }}>CYCLE PHASE</span>
            </div>
            <div style={{ fontSize: 12, color: '#4A3F38', lineHeight: 1.6 }}>{report.phaseInsight}</div>
          </div>
        )}

        {report.highlights?.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <WIcon.check size={13} color="#7A9470" />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#7A9470', letterSpacing: 0.5 }}>HIGHLIGHTS</span>
            </div>
            {report.highlights.map((h, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, padding: '6px 0', alignItems: 'flex-start',
                borderBottom: i < report.highlights.length - 1 ? '1px solid #F0EDE8' : 'none',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#7A9470', marginTop: 6, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: '#2C2825', lineHeight: 1.5 }}>{h}</div>
              </div>
            ))}
          </div>
        )}

        {report.watchPoints?.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <WIcon.alertCircle size={13} color="#C4948A" />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#C4948A', letterSpacing: 0.5 }}>WATCH POINTS</span>
            </div>
            {report.watchPoints.map((w, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, padding: '6px 0', alignItems: 'flex-start',
                borderBottom: i < report.watchPoints.length - 1 ? '1px solid #F0EDE8' : 'none',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C4948A', marginTop: 6, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: '#2C2825', lineHeight: 1.5 }}>{w}</div>
              </div>
            ))}
          </div>
        )}

        {report.patternInsight && (
          <div style={{ background: '#C9A96E08', border: '1px solid #C9A96E20', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <WIcon.sparkle size={13} color="#C9A96E" />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#C9A96E', letterSpacing: 0.5 }}>PATTERN DETECTED</span>
            </div>
            <div style={{ fontSize: 12, color: '#4A3F38', lineHeight: 1.6 }}>{report.patternInsight}</div>
          </div>
        )}

        {report.wearableSummary && (
          <div style={{ background: '#6B7DB308', border: '1px solid #6B7DB320', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <WIcon.ring size={13} color="#6B7DB3" />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7DB3', letterSpacing: 0.5 }}>WEARABLE STORY</span>
            </div>
            <div style={{ fontSize: 12, color: '#4A3F38', lineHeight: 1.6 }}>{report.wearableSummary}</div>
          </div>
        )}

        {report.nextWeekFocus?.length > 0 && (
          <div style={{ background: '#2C282506', border: '1px solid #2C282518', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <WIcon.trending size={13} color="#2C2825" />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#2C2825', letterSpacing: 0.5 }}>NEXT WEEK FOCUS</span>
            </div>
            {report.nextWeekFocus.map((f, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0',
                borderBottom: i < report.nextWeekFocus.length - 1 ? '1px solid #F0EDE8' : 'none',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4, background: '#2C2825',
                  color: 'white', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 12, color: '#2C2825', lineHeight: 1.5 }}>{f}</div>
              </div>
            ))}
          </div>
        )}

        {report.motivationalClose && (
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 14, color: '#8A8279', fontStyle: 'italic',
            textAlign: 'center', padding: '10px 0 4px',
            borderTop: '1px solid #F0EDE8', lineHeight: 1.5,
          }}>
            {report.motivationalClose}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button
            onClick={downloadReport}
            style={{
              flex: 1, fontFamily: "'DM Sans', sans-serif",
              background: '#F6F4F0', border: '1px solid #E8E4DD',
              borderRadius: 8, padding: '10px 0', fontSize: 12, fontWeight: 600,
              color: '#2C2825', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <WIcon.download size={13} color="#2C2825" />
            Download
          </button>
          <button
            onClick={() => { localStorage.removeItem(cacheKey); setReport(null) }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: 'none', border: '1px solid #E8E4DD',
              borderRadius: 8, padding: '10px 14px', fontSize: 12,
              color: '#A09A90', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <WIcon.xMark size={12} color="#A09A90" />
            Regenerate
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Standalone HTML download ---
function generateHTML(report, weekOf) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const sc = (s) => s >= 8 ? '#7A9470' : s >= 6 ? '#C9A96E' : '#C4948A'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cycle Sync Weekly Report</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:#F6F4F0;color:#2C2825;padding:40px 20px}
.container{max-width:540px;margin:0 auto}
.card{background:#FFFEF9;border:1px solid #E8E4DD;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(44,40,37,.04)}
.header{background:linear-gradient(135deg,#2C2825 0%,#3D3530 100%);padding:18px 20px}
.label{font-size:9px;color:rgba(255,255,255,.35);letter-spacing:1px;margin-bottom:5px}
.title{font-family:'Instrument Serif',serif;font-size:21px;color:white;margin-bottom:10px;line-height:1.2}
.score-row{display:flex;align-items:center;gap:12px}
.score{font-size:26px;font-weight:700;line-height:1}
.body{padding:16px 18px}
.insight{border-radius:10px;padding:12px 14px;margin-bottom:12px}
.il{font-size:10px;font-weight:600;letter-spacing:.5px;margin-bottom:6px}
.ib{font-size:12px;line-height:1.6;color:#4A3F38}
.sh{font-size:10px;font-weight:600;letter-spacing:.5px;margin-bottom:8px}
ul.b{list-style:none}
ul.b li{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-bottom:1px solid #F0EDE8;font-size:12px;line-height:1.5;color:#2C2825}
ul.b li:last-child{border-bottom:none}
.dot{width:5px;height:5px;border-radius:50%;margin-top:6px;flex-shrink:0}
ul.n{list-style:none}
ul.n li{display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px solid #F0EDE8;font-size:12px;line-height:1.5;color:#2C2825}
ul.n li:last-child{border-bottom:none}
.badge{width:18px;height:18px;border-radius:4px;background:#2C2825;color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.closing{font-family:'Instrument Serif',serif;font-size:14px;color:#8A8279;font-style:italic;text-align:center;padding:10px 0 4px;border-top:1px solid #F0EDE8;line-height:1.5;margin-top:4px}
.footer{text-align:center;margin-top:20px;font-size:11px;color:#A09A90}
</style>
</head>
<body>
<div class="container"><div class="card">
<div class="header">
  <div class="label">CYCLE SYNC WEEKLY REPORT &middot; WEEK OF ${(weekOf||'').toUpperCase()}</div>
  <div class="title">${report.weekTitle||'Weekly Report'}</div>
  <div class="score-row">
    <div class="score" style="color:${sc(report.overallScore)}">${report.overallScore}<span style="font-size:13px;opacity:.5">/10</span></div>
    <div style="font-size:12px;color:rgba(255,255,255,.6);flex:1;line-height:1.4">${report.scoreSummary||''}</div>
  </div>
</div>
<div class="body">
  ${report.phaseInsight?`<div class="insight" style="background:#C4948A08;border:1px solid #C4948A20"><div class="il" style="color:#C4948A">CYCLE PHASE</div><div class="ib">${report.phaseInsight}</div></div>`:''}
  ${report.highlights?.length?`<div style="margin-bottom:12px"><div class="sh" style="color:#7A9470">HIGHLIGHTS</div><ul class="b">${report.highlights.map(h=>`<li><div class="dot" style="background:#7A9470"></div><span>${h}</span></li>`).join('')}</ul></div>`:''}
  ${report.watchPoints?.length?`<div style="margin-bottom:12px"><div class="sh" style="color:#C4948A">WATCH POINTS</div><ul class="b">${report.watchPoints.map(w=>`<li><div class="dot" style="background:#C4948A"></div><span>${w}</span></li>`).join('')}</ul></div>`:''}
  ${report.patternInsight?`<div class="insight" style="background:#C9A96E08;border:1px solid #C9A96E20"><div class="il" style="color:#C9A96E">PATTERN DETECTED</div><div class="ib">${report.patternInsight}</div></div>`:''}
  ${report.wearableSummary?`<div class="insight" style="background:#6B7DB308;border:1px solid #6B7DB320"><div class="il" style="color:#6B7DB3">WEARABLE STORY</div><div class="ib">${report.wearableSummary}</div></div>`:''}
  ${report.nextWeekFocus?.length?`<div class="insight" style="background:#2C282506;border:1px solid #2C282518"><div class="il" style="color:#2C2825">NEXT WEEK FOCUS</div><ul class="n">${report.nextWeekFocus.map((f,i)=>`<li><div class="badge">${i+1}</div><span>${f}</span></li>`).join('')}</ul></div>`:''}
  ${report.motivationalClose?`<div class="closing">${report.motivationalClose}</div>`:''}
</div>
</div>
<div class="footer">Generated by Cycle Sync &middot; ${today}</div>
</div>
</body>
</html>`
}

export default WeeklyReport
