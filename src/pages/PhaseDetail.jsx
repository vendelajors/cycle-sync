import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PHASE_DATA, getPhaseFromDay } from './CycleData'
import { Icons, PhaseIcon } from './icons'
import { getUserProfile, getProfileContext } from './userProfile'
import { getResearchContext } from './researchDatabase'
import { getCorrelationContext } from './correlationEngine'
import { buildSystemMessage, buildUserMessage, callProxy, truncateAtBoundary } from './promptBuilder'

const SHEET_ID = '1MSV0LNsnhWh8tjI_3w-Wzn9iEPz5Jtzz8kqq8wrj8As'
const CHECKIN_TAB = 'DailyCheckIn'

function fetchSheet(tab) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${tab}`
  return fetch(url)
    .then((r) => r.text())
    .then((text) => {
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/)
      if (!match) throw new Error('Could not parse')
      const json = JSON.parse(match[1])
      const headers = json.table.cols.map((c) => c.label || '')
      return json.table.rows.map((row) => {
        const obj = {}
        row.c.forEach((cell, i) => {
          obj[headers[i]] = cell ? (cell.v ?? cell.f ?? '') : ''
        })
        return obj
      })
    })
}

function PhasePill({ phase, isActive, onClick }) {
  const p = PHASE_DATA[phase]
  return (
    <button
      onClick={onClick}
      className="cursor-pointer"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 12, fontWeight: isActive ? 600 : 400,
        color: isActive ? '#FFFEF9' : p.color,
        background: isActive ? p.color : p.colorLight,
        border: 'none', borderRadius: 20,
        padding: '7px 16px',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {p.name}
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#A09A90',
        textTransform: 'uppercase', letterSpacing: '0.8px',
        marginBottom: 8,
      }}>{title}</div>
      {children}
    </div>
  )
}

function ListCard({ items, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          fontSize: 13, color: '#2C2825', lineHeight: 1.5,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: color, marginTop: 6, flexShrink: 0,
          }} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}

function PersonalizedRecs({ phase, phaseKey, checkins, allCheckins, avgMood, avgEnergy, avgStress, phaseTopSymptoms }) {
  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateRecs = async () => {
    setLoading(true)
    try {
      const profile = getUserProfile()
      const userConditions = profile?.conditions || []
      const symptomList = phaseTopSymptoms.map(([s]) => s)
      const userContext = {
        symptoms: symptomList,
        bloodworkFlags: [],
        latestCheckin: { mood: avgMood, energy: avgEnergy, stress: avgStress },
        wearableToday: null,
      }
      const researchCtx = truncateAtBoundary(getResearchContext(phaseKey, userConditions, userContext), 2500)
      const correlationCtx = truncateAtBoundary(getCorrelationContext(allCheckins, null), 800)

      const system = buildSystemMessage('women\'s health coach specializing in cycle syncing', `- Be SPECIFIC: name actual foods (not "eat protein"), actual workouts (not "do cardio"), actual activities.
- Reference her symptoms, energy levels, conditions, and personal data patterns.
- Cite mechanisms from the research evidence when available.
- If her energy is low, suggest gentler options. If stress is high, emphasize stress reduction.

OUTPUT FORMAT:
{"foods":["food -- why","food -- why","food -- why"],"workouts":["workout -- intensity note","workout -- intensity note","workout -- intensity note"],"activities":["activity -- benefit","activity -- benefit","activity -- benefit"],"avoid":["thing -- reason","thing -- reason"],"summary":"One personalized sentence referencing her data"}`)

      const userMessage = buildUserMessage([
        { heading: 'User Profile', content: getProfileContext() },
        { heading: `Phase: ${phase.name} (Days ${phase.days})`, content: `Hormonal state: ${phase.hormones || ''}\nTypical body changes: ${phase.body || ''}` },
        { heading: 'Her Personal Pattern During This Phase (1-10 scale)', content: `Average mood: ${avgMood ?? 'no data'}\nAverage energy: ${avgEnergy ?? 'no data'}\nAverage stress: ${avgStress ?? 'no data'}\nCommon symptoms: ${symptomList.join(', ') || 'none recorded'}\nCheck-ins in this phase: ${checkins.length}` },
        { heading: 'Personal Data Correlations', content: correlationCtx },
        { heading: 'Evidence-Based Research', content: researchCtx },
      ])

      const data = await callProxy({ system, userMessage, maxTokens: 600 })
      setRecs(data)
    } catch (err) {
      console.error('Recs error:', err)
    } finally {
      setLoading(false)
    }
  }

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
            <div style={{ fontSize: 11, color: '#A09A90' }}>
              Personalized to your patterns
            </div>
          </div>
        </div>
        {!recs && !loading && (
          <button onClick={generateRecs} className="cursor-pointer" style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            color: 'white', background: phase.color, border: 'none',
            borderRadius: 8, padding: '8px 16px',
          }}>Generate</button>
        )}
        {recs && (
          <button onClick={generateRecs} className="cursor-pointer" style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#A09A90',
            background: 'none', border: '1px solid #E8E4DD', borderRadius: 6, padding: '5px 10px',
          }}>Refresh</button>
        )}
      </div>

      {loading && (
        <div style={{ padding: '24px 18px', textAlign: 'center', fontSize: 13, color: '#A09A90' }}>
          Building your personalized plan...
        </div>
      )}

      {recs && (
        <div style={{ padding: '14px 18px' }}>
          {/* Summary */}
          <div style={{
            fontSize: 13, color: '#2C2825', lineHeight: 1.6,
            marginBottom: 16, fontStyle: 'italic',
            borderLeft: `3px solid ${phase.color}40`, paddingLeft: 12,
          }}>
            {recs.summary}
          </div>

          {/* Foods */}
          <RecSection icon={Icons.droplet} title="Eat This" color="#9BAF93" items={recs.foods} />

          {/* Workouts */}
          <RecSection icon={Icons.activity} title="Move Like This" color="#C9A96E" items={recs.workouts} />

          {/* Activities */}
          <RecSection icon={Icons.heart} title="Self-Care" color="#6B7DB3" items={recs.activities} />

          {/* Avoid */}
          {recs.avoid && recs.avoid.length > 0 && (
            <RecSection icon={Icons.x} title="Ease Up On" color="#C4948A" items={recs.avoid} />
          )}
        </div>
      )}
    </div>
  )
}

function RecSection({ icon: IconComp, title, color, items }) {
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

function PersonalMiniBar({ value, max = 10, color }) {
  const pct = Math.min(((value || 0) / max) * 100, 100)
  return (
    <div style={{ height: 6, background: '#E8E4DD', borderRadius: 3, flex: 1 }}>
      <div style={{
        height: '100%', borderRadius: 3, width: `${pct}%`,
        background: color, transition: 'width 0.5s ease',
      }} />
    </div>
  )
}

function PersonalMetric({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      <div style={{ width: 60, fontSize: 12, color: '#8A8279' }}>{label}</div>
      <PersonalMiniBar value={value} color={color} />
      <div style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: 18, color: '#2C2825', minWidth: 30, textAlign: 'right',
      }}>{value}</div>
    </div>
  )
}

export default function PhaseDetail() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activePhase = searchParams.get('phase') || 'follicular'
  const p = PHASE_DATA[activePhase]

  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSheet(CHECKIN_TAB)
      .then(setCheckins)
      .catch(() => setCheckins([]))
      .finally(() => setLoading(false))
  }, [])

  const setPhase = (phase) => {
    setSearchParams({ phase })
  }

  // Group check-ins by phase
  const phaseCheckins = checkins.filter((c) => {
    const pk = getPhaseFromDay(c.cycle_day)
    return pk === activePhase
  })

  const avg = (field) => {
    const vals = phaseCheckins.map((c) => parseFloat(c[field])).filter((v) => !isNaN(v))
    if (vals.length === 0) return null
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  }

  const avgMood = avg('mood')
  const avgEnergy = avg('energy')
  const avgSleep = avg('sleep_quality')
  const avgStress = avg('stress')
  const hasPersonalData = phaseCheckins.length > 0

  // Top symptoms for this phase
  const phaseSymptomCounts = {}
  phaseCheckins.forEach((c) => {
    if (c.symptoms) {
      c.symptoms.split(',').forEach((s) => {
        const trimmed = s.trim()
        if (trimmed && trimmed !== 'None') {
          phaseSymptomCounts[trimmed] = (phaseSymptomCounts[trimmed] || 0) + 1
        }
      })
    }
  })
  const phaseTopSymptoms = Object.entries(phaseSymptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  // Activity patterns for this phase
  const phaseActivities = {}
  phaseCheckins.forEach((c) => {
    if (c.workout_types) {
      c.workout_types.split(',').forEach((a) => {
        const trimmed = a.trim()
        if (trimmed) {
          phaseActivities[trimmed] = (phaseActivities[trimmed] || 0) + 1
        }
      })
    }
    if (c.activity === 'rest') {
      phaseActivities['Rest day'] = (phaseActivities['Rest day'] || 0) + 1
    }
  })

  // Total check-ins across all phases
  const totalWithPhase = checkins.filter((c) => getPhaseFromDay(c.cycle_day)).length

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F6F4F0', fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="flex-1 px-6 py-6">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigate('/dashboard')}
              className="cursor-pointer"
              style={{
                fontSize: 13, color: '#A09A90',
                background: 'none', border: 'none',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icons.arrowLeft size={14} color="#A09A90" /> Dashboard
              </span>
            </button>
            <Icons.logo size={32} />
            <div style={{ width: 50 }} />
          </div>

          {/* Phase Selector */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: 20,
            overflowX: 'auto', paddingBottom: 4,
          }}>
            {Object.keys(PHASE_DATA).map((phase) => (
              <PhasePill
                key={phase}
                phase={phase}
                isActive={activePhase === phase}
                onClick={() => setPhase(phase)}
              />
            ))}
          </div>

          {/* Phase Hero */}
          <div style={{
            background: p.color,
            borderRadius: 16, padding: '24px 22px',
            color: 'white', marginBottom: 18,
          }}>
            <PhaseIcon color={p.color} size={48} />
            <div style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 30, fontWeight: 400, marginBottom: 4,
            }}>{p.name} Phase</div>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>
              Days {p.days} of your cycle
            </div>
            <div style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 18, fontStyle: 'italic', opacity: 0.9,
            }}>"{p.tagline}"</div>
          </div>

          {/* ── YOUR PATTERN ── */}
          <div style={{
            background: '#FFFEF9',
            border: `2px solid ${p.color}30`,
            borderRadius: 14, padding: '18px',
            marginBottom: 14,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 4,
            }}>
              <div style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 20, color: '#2C2825',
              }}>Your {p.name} Pattern</div>
              <div style={{
                fontSize: 10, fontWeight: 600, color: p.color,
                background: p.colorLight,
                borderRadius: 10, padding: '3px 10px',
              }}>
                {hasPersonalData ? `${phaseCheckins.length} check-in${phaseCheckins.length === 1 ? '' : 's'}` : 'No data yet'}
              </div>
            </div>

            {loading ? (
              <div style={{ fontSize: 13, color: '#A09A90', padding: '20px 0', textAlign: 'center' }}>
                Loading your data...
              </div>
            ) : hasPersonalData ? (
              <>
                {/* Averages */}
                <div style={{ marginTop: 8 }}>
                  {avgMood !== null && <PersonalMetric label="Mood" value={avgMood} color="#9BAF93" />}
                  {avgEnergy !== null && <PersonalMetric label="Energy" value={avgEnergy} color="#C9A96E" />}
                  {avgSleep !== null && <PersonalMetric label="Sleep" value={avgSleep} color="#A1928C" />}
                  {avgStress !== null && <PersonalMetric label="Stress" value={avgStress} color="#C4948A" />}
                </div>

                {/* Phase symptoms */}
                {phaseTopSymptoms.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: '#A09A90',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      marginBottom: 8,
                    }}>Your common symptoms</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {phaseTopSymptoms.map(([symptom, count]) => (
                        <span key={symptom} style={{
                          fontSize: 11, color: '#8A8279',
                          background: '#F6F4F0', borderRadius: 16,
                          padding: '5px 12px',
                        }}>
                          {symptom} <span style={{ color: '#C4948A', fontWeight: 600 }}>{count}×</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phase activities */}
                {Object.keys(phaseActivities).length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: '#A09A90',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      marginBottom: 8,
                    }}>Your activity pattern</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {Object.entries(phaseActivities).map(([activity, count]) => (
                        <span key={activity} style={{
                          fontSize: 11, color: '#8A8279',
                          background: '#F6F4F0', borderRadius: 16,
                          padding: '5px 12px',
                        }}>
                          {activity} <span style={{ color: '#9BAF93', fontWeight: 600 }}>{count}×</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {phaseCheckins.length < 5 && (
                  <div style={{
                    fontSize: 11, color: '#A09A90', marginTop: 14,
                    fontStyle: 'italic', lineHeight: 1.5,
                  }}>
                    Keep logging — patterns get more accurate with more data. After 2-3 full cycles, you'll see reliable trends.
                  </div>
                )}
              </>
            ) : (
              <div style={{
                padding: '20px 0', textAlign: 'center',
              }}>
                <PhaseIcon color={p.color} size={36} />
                <div style={{ fontSize: 13, color: '#8A8279', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
                  {totalWithPhase === 0
                    ? 'Log your cycle day in daily check-ins to start building your personal pattern for each phase.'
                    : `No check-ins during your ${p.name.toLowerCase()} phase yet. Your personal data will appear here as you track.`
                  }
                </div>
              </div>
            )}
          </div>

          {/* ── PERSONALIZED RECOMMENDATIONS ── */}
          <PersonalizedRecs
            phase={p}
            phaseKey={activePhase}
            checkins={phaseCheckins}
            allCheckins={checkins}
            avgMood={avgMood}
            avgEnergy={avgEnergy}
            avgStress={avgStress}
            phaseTopSymptoms={phaseTopSymptoms}
          />

          {/* ── GENERAL GUIDANCE ── */}
          <div style={{
            fontSize: 11, fontWeight: 600, color: '#A09A90',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            marginBottom: 10, marginTop: 6, paddingLeft: 2,
          }}>General Guidance</div>

          {/* Hormones */}
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 12,
          }}>
            <Section title="What's happening hormonally">
              <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>
                {p.hormones}
              </p>
            </Section>
          </div>

          {/* Body & Mood */}
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 12,
          }}>
            <Section title="Your body">
              <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>
                {p.body}
              </p>
            </Section>
            <Section title="Mood & mind">
              <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>
                {p.mood}
              </p>
            </Section>
            <Section title="Skin">
              <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>
                {p.skin}
              </p>
            </Section>
            <Section title="Sleep">
              <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>
                {p.sleep}
              </p>
            </Section>
          </div>

          {/* Workout + Nutrition */}
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 12,
          }}>
            <Section title="Workout recommendations">
              <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>
                {p.workout}
              </p>
            </Section>
            <Section title="Nutrition focus">
              <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>
                {p.nutrition}
              </p>
            </Section>
            <Section title="Supplement focus">
              <p style={{ fontSize: 13, color: '#2C2825', lineHeight: 1.7, margin: 0 }}>
                {p.supplements}
              </p>
            </Section>
          </div>

          {/* Do this / Avoid this */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{
              flex: 1,
              background: '#FFFEF9', border: '1px solid #E8E4DD',
              borderRadius: 14, padding: '16px',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: '#9BAF93',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                marginBottom: 10,
              }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icons.check size={12} color={p.color} /> Do this</span></div>
              <ListCard items={p.doThis} color="#9BAF93" />
            </div>
            <div style={{
              flex: 1,
              background: '#FFFEF9', border: '1px solid #E8E4DD',
              borderRadius: 14, padding: '16px',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: '#C4948A',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                marginBottom: 10,
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icons.x size={12} color="#C4948A" /> Avoid
                </span>
              </div>
              <ListCard items={p.avoidThis} color="#C4948A" />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center', fontSize: 11, color: '#C8C3BA',
            paddingBottom: 20,
          }}>
            Recommendations are general guidance — always consult your healthcare provider for personalized advice.
          </div>
        </div>
      </div>
    </div>
  )
}
