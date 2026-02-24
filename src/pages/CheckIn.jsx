import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const getUHToken = () => localStorage.getItem('uh_api_token') || ''
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdmW-l26XpOPJx4SYQmbLKh8I2Vht76TT4dZvsFrrbtyjTt2lKIHZfWhmoFTseG1TyoQ/exec'

const SYMPTOMS = [
  'Cramps', 'Bloating', 'Headache', 'Fatigue', 'Breast tenderness',
  'Acne', 'Skin breakout', 'Back pain', 'Joint pain', 'Nausea',
  'Cravings', 'Insomnia', 'Anxiety', 'Low mood', 'Irritability',
  'Brain fog', 'Low libido', 'High libido', 'Hot flashes', 'None',
]

const WORKOUT_TYPES = [
  'Pilates', 'Weight training', 'Running', 'Walking', 'HIIT',
  'Yoga', 'Cycling', 'Swimming', 'Dance', 'Sports',
]

const DIET_TAGS = [
  'Balanced', 'High protein', 'High sugar', 'Low appetite', 'Overate',
  'Lots of caffeine', 'Ate out', 'Hydrated well', 'Low water intake',
  'Alcohol', 'Comfort food', 'Mostly whole foods',
]

const CERVICAL_MUCUS_OPTIONS = [
  { value: 'dry', label: 'Dry / none', desc: 'No noticeable mucus' },
  { value: 'sticky', label: 'Sticky', desc: 'Thick, tacky texture' },
  { value: 'creamy', label: 'Creamy', desc: 'Lotion-like, white' },
  { value: 'watery', label: 'Watery', desc: 'Wet, clear, thin' },
  { value: 'egg_white', label: 'Egg white', desc: 'Stretchy, clear — peak fertility' },
  { value: 'skip', label: 'Skip', desc: '' },
]

import { getSupplements } from './userProfile'

const SLIDER_LABELS = {
  mood: { low: 'Low', high: 'Great', label: 'Mood' },
  energy: { low: 'Drained', high: 'Energized', label: 'Energy' },
  sleep_quality: { low: 'Poor', high: 'Excellent', label: 'Sleep Quality' },
  stress: { low: 'Calm', high: 'Stressed', label: 'Stress Level' },
}

function SectionHeader({ number, title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 14, marginTop: 8,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: 'linear-gradient(135deg, #C4948A, #9BAF93)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0,
      }}>{number}</div>
      <span style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: 20, color: '#2C2825',
      }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: '#E8E4DD' }} />
    </div>
  )
}

function SliderInput({ id, value, onChange, config }) {
  const displayValue = value ?? 5
  const position = ((displayValue - 1) / 9) * 100

  const getTrackColor = () => {
    if (id === 'stress') {
      return `linear-gradient(90deg, #9BAF93, #C9A96E, #C4948A)`
    }
    return `linear-gradient(90deg, #C4948A, #C9A96E, #9BAF93)`
  }

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 10,
      }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#2C2825' }}>
          {config.label}
        </label>
        <span style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 22, color: '#2C2825',
        }}>{displayValue}<span style={{ fontSize: 13, color: '#A09A90' }}>/10</span></span>
      </div>
      <div style={{ position: 'relative', padding: '8px 0' }}>
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: 4, borderRadius: 2, transform: 'translateY(-50%)',
          background: '#E8E4DD',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: 0,
          width: `${position}%`,
          height: 4, borderRadius: 2, transform: 'translateY(-50%)',
          background: getTrackColor(),
        }} />
        <input
          type="range" min="1" max="10" step="1"
          value={displayValue}
          onChange={(e) => onChange(id, parseInt(e.target.value))}
          style={{
            width: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
            background: 'transparent',
            position: 'relative',
            zIndex: 2,
            height: 20,
            cursor: 'pointer',
          }}
        />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: '#C8C3BA', marginTop: -2,
      }}>
        <span>{config.low}</span>
        <span>{config.high}</span>
      </div>
    </div>
  )
}

function PillSelect({ items, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map((item) => {
        const isSelected = selected.includes(item)
        return (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className="cursor-pointer"
            style={{
              fontFamily: 'inherit',
              fontSize: 13,
              padding: '8px 16px',
              borderRadius: 30,
              border: isSelected ? '1.5px solid #2C2825' : '1px solid #E8E4DD',
              background: isSelected ? '#2C2825' : '#FFFEF9',
              color: isSelected ? '#FFFEF9' : '#8A8279',
              fontWeight: isSelected ? 600 : 400,
              transition: 'all 0.15s ease',
            }}
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}

export default function CheckIn() {
  const navigate = useNavigate()
  const [cycleDay, setCycleDay] = useState('')
  const [onPeriod, setOnPeriod] = useState(null)
  const [flowLevel, setFlowLevel] = useState(null)
  const [bbt, setBbt] = useState('')
  const [cervicalMucus, setCervicalMucus] = useState(null)
  const [sliders, setSliders] = useState({ mood: 5, energy: 5, sleep_quality: 5, stress: 5 })
  const [symptoms, setSymptoms] = useState([])
  const [supplementsTaken, setSupplementsTaken] = useState('no')
  const [specificSupplements, setSpecificSupplements] = useState([])
  const [activity, setActivity] = useState(null)
  const [workoutTypes, setWorkoutTypes] = useState([])
  const [otherWorkout, setOtherWorkout] = useState('')
  const [dietTags, setDietTags] = useState([])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hasRingSleep, setHasRingSleep] = useState(false)
  const [hasRingActivity, setHasRingActivity] = useState(false)

  const USER_SUPPLEMENTS = (() => {
    const supps = getSupplements()
    return supps.length > 0 ? supps : ['Multivitamin', 'Vitamin D', 'Magnesium', 'Omega-3', 'Iron', 'Probiotic']
  })()

  // Detect wearable data availability
  useEffect(() => {
    if (!getUHToken()) return
    const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()
    fetch(`https://api.ultrahuman.com/api/v1/metrics/sleep?date=${today}`, {
      headers: { Authorization: `Bearer ${getUHToken()}`, 'Content-Type': 'application/json' },
    })
      .then(r => r.json())
      .then(data => {
        if (data?.data?.sleep_score && data.data.sleep_score > 0) setHasRingSleep(true)
      })
      .catch(() => {})
    fetch(`https://api.ultrahuman.com/api/v1/metrics/steps?date=${today}`, {
      headers: { Authorization: `Bearer ${getUHToken()}`, 'Content-Type': 'application/json' },
    })
      .then(r => r.json())
      .then(data => {
        if (data?.data?.steps && data.data.steps > 0) setHasRingActivity(true)
      })
      .catch(() => {})
  }, [])

  // Auto-calculate cycle day from previous check-ins or onboarding
  useEffect(() => {
    try {
      const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()
      const todayDate = new Date(today + 'T12:00:00')

      const sheetData = JSON.parse(localStorage.getItem('sheetData') || '[]')
      const sorted = [...sheetData].sort((a, b) => b.date?.localeCompare(a.date))

      // Try from last check-in first
      const lastCheckin = sorted[0]
      if (lastCheckin && lastCheckin.cycle_day && !isNaN(parseInt(lastCheckin.cycle_day))) {
        const lastDate = new Date(lastCheckin.date + 'T12:00:00')
        const daysDiff = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24))
        const computed = parseInt(lastCheckin.cycle_day) + daysDiff
        if (computed > 0 && computed <= 60) {
          setCycleDay(String(computed))
          return
        }
      }

      // Fallback: use onboarding last_period_date
      const onboarding = JSON.parse(localStorage.getItem('onboardingAnswers') || '{}')
      if (onboarding.last_period_date) {
        const lpDate = new Date(onboarding.last_period_date + 'T12:00:00')
        const daysSince = Math.round((todayDate - lpDate) / (1000 * 60 * 60 * 24))
        const computed = daysSince + 1
        if (computed > 0 && computed <= 60) {
          setCycleDay(String(computed))
        }
      }
    } catch {}
  }, [])

  const handleSliderChange = (id, value) => {
    setSliders((prev) => ({ ...prev, [id]: value }))
  }

  const toggleItem = (list, setList, item, noneValue) => {
    if (item === noneValue) {
      setList(list.includes(noneValue) ? [] : [noneValue])
      return
    }
    const filtered = list.filter((s) => s !== noneValue)
    if (filtered.includes(item)) {
      setList(filtered.filter((s) => s !== item))
    } else {
      setList([...filtered, item])
    }
  }

  const toggleWorkoutType = (type) => {
    if (workoutTypes.includes(type)) {
      setWorkoutTypes(workoutTypes.filter((t) => t !== type))
    } else {
      setWorkoutTypes([...workoutTypes, type])
    }
  }

  const toggleDietTag = (tag) => {
    if (dietTags.includes(tag)) {
      setDietTags(dietTags.filter((t) => t !== tag))
    } else {
      setDietTags([...dietTags, tag])
    }
  }

  const toggleSpecificSupplement = (supp) => {
    if (specificSupplements.includes(supp)) {
      setSpecificSupplements(specificSupplements.filter((s) => s !== supp))
    } else {
      setSpecificSupplements([...specificSupplements, supp])
    }
  }

  const getCyclePhase = (day) => {
    const d = parseInt(day)
    if (!d) return null
    if (d <= 5) return { name: 'Menstrual', color: '#C4948A' }
    if (d <= 13) return { name: 'Follicular', color: '#9BAF93' }
    if (d <= 16) return { name: 'Ovulation', color: '#C9A96E' }
    return { name: 'Luteal', color: '#A1928C' }
  }

  const phase = getCyclePhase(cycleDay)

  const canSubmit = () => {
    const hasActivity = hasRingActivity || (activity !== null && (activity === 'rest' || workoutTypes.length > 0 || otherWorkout.trim() !== ''))
    return (
      onPeriod !== null &&
      Object.keys(sliders).length >= (hasRingSleep ? 3 : 4) &&
      symptoms.length > 0 &&
      supplementsTaken !== null &&
      hasActivity &&
      dietTags.length > 0
    )
  }

  const handleSubmit = async () => {
    if (!canSubmit()) return
    setIsSubmitting(true)

    const allWorkouts = [...workoutTypes]
    if (otherWorkout.trim()) allWorkouts.push(otherWorkout.trim())

    // Cycle day: always use the auto-calculated cycleDay state as the base.
    // Only reset to 1 if period=yes AND no previous period check-in exists within 18 days
    // (meaning this is genuinely a new period, not a continuation).
    const finalCycleDay = (() => {
      const base = cycleDay ? parseInt(cycleDay) : null

      if (onPeriod === 'yes') {
        // Check if we already have a recent period check-in (mid-period continuation)
        try {
          const now = new Date()
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
          const todayDate = new Date(todayStr + 'T12:00:00')
          const sheetData = JSON.parse(localStorage.getItem('sheetData') || '[]')
          const lastPeriodCheckin = [...sheetData]
            .sort((a, b) => b.date?.localeCompare(a.date))
            .find(c => c.period === 'yes')

          if (lastPeriodCheckin?.cycle_day && !isNaN(parseInt(lastPeriodCheckin.cycle_day))) {
            const lastDate = new Date(lastPeriodCheckin.date + 'T12:00:00')
            const daysSince = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24))
            if (daysSince <= 18) {
              // Mid-period — continue counting from last period check-in
              return parseInt(lastPeriodCheckin.cycle_day) + daysSince
            }
          }
        } catch {}

        // No recent period check-in found — use cycleDay if it's in menstrual range,
        // otherwise this is genuinely a new period starting at Day 1
        if (base && base <= 7) return base  // Already in menstrual range, keep it
        return 1  // True new period
      }

      // period=no: always use the auto-calculated cycleDay — never reset
      return base || 1
    })()

    // Determine phase — period=yes forces Menstrual, period=no on a menstrual day advances to Follicular
    const finalPhase = (() => {
      if (onPeriod === 'yes') return 'Menstrual'
      const basePhase = getCyclePhase(finalCycleDay)?.name || 'Unknown'
      if (onPeriod === 'no' && basePhase === 'Menstrual') return 'Follicular'
      return basePhase
    })()

    const data = {
      date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })(),
      cycle_day: finalCycleDay,
      cycle_phase: finalPhase,
      period: onPeriod,
      flow_level: onPeriod === 'yes' ? (flowLevel || '') : '',
      bbt: bbt || '',
      cervical_mucus: cervicalMucus === 'skip' ? '' : (cervicalMucus || ''),
      mood: sliders.mood,
      energy: sliders.energy,
      sleep_quality: sliders.sleep_quality,
      stress: sliders.stress,
      symptoms: symptoms.join(', '),
      supplements_taken: supplementsTaken,
      specific_supplements: specificSupplements.join(', '),
      activity: activity,
      workout_types: activity === 'workout' ? allWorkouts.join(', ') : '',
      diet_tags: dietTags.join(', '),
      notes: notes,
    }

    console.log('Check-in data:', data)

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
      })
      const text = await res.text()
      console.log('Sheet write result:', text)
    } catch (err) {
      console.error('Failed to submit to sheet:', err)
      try {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(data),
        })
        console.log('Sheet write sent (no-cors fallback)')
      } catch (err2) {
        console.error('Fallback also failed:', err2)
      }
    }

    try {
      const todayKey = `checkin_${(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()}`
      localStorage.setItem(todayKey, JSON.stringify(data))
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 800)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F6F4F0' }}>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #C4948A, #9BAF93)', color: 'white' }}
        >
          ✓
        </div>

        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 28, fontWeight: 400, color: '#2C2825',
          marginBottom: 6, textAlign: 'center',
        }}>
          Check-in complete
        </h1>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: '#A09A90', textAlign: 'center',
          maxWidth: 300, lineHeight: 1.6, marginBottom: 4,
        }}>
          {phase ? (
            <span>
              Day {cycleDay} · <span style={{ color: phase.color, fontWeight: 500 }}>{phase.name}</span>
            </span>
          ) : (
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          )}
        </p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, color: '#C8C3BA', textAlign: 'center',
          maxWidth: 300, lineHeight: 1.6, marginBottom: 28,
        }}>
          Your data has been logged. Insights will update as patterns emerge over time.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: 600, color: '#FFFEF9',
              background: '#2C2825', border: 'none',
              borderRadius: 10, padding: '12px 28px',
            }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => {
              setSubmitted(false)
              setCycleDay('')
              setBbt('')
              setCervicalMucus(null)
              setSliders({ mood: 5, energy: 5, sleep_quality: 5, stress: 5 })
              setSymptoms([])
              setSupplementsTaken(null)
              setSpecificSupplements([])
              setActivity(null)
              setWorkoutTypes([])
              setOtherWorkout('')
              setDietTags([])
              setNotes('')
            }}
            className="cursor-pointer"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: 500, color: '#8A8279',
              background: 'none', border: '1.5px solid #E8E4DD',
              borderRadius: 10, padding: '12px 28px',
            }}
          >
            Edit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F6F4F0', fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2C2825;
          border: 3px solid #FFFEF9;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2C2825;
          border: 3px solid #FFFEF9;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          cursor: pointer;
        }
      `}</style>

      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="cursor-pointer"
              style={{
                fontSize: 13, color: '#A09A90',
                background: 'none', border: 'none',
                fontFamily: 'inherit',
              }}
            >
              ← Back
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #C4948A, #9BAF93)', color: 'white' }}
            >
              ◐
            </div>
            <div style={{ width: 50 }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-lg mx-auto">
          {/* Title */}
          <div className="mb-6 mt-2">
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 28, fontWeight: 400, color: '#2C2825', marginBottom: 4,
            }}>
              Daily Check-in
            </h1>
            <p style={{ fontSize: 13, color: '#A09A90' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* ===== SECTION 1: BODY ===== */}
          <SectionHeader number="1" title="Body" />

          {/* Period Tracking */}
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 14,
          }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#2C2825', display: 'block', marginBottom: 10 }}>
              Are you on your period?
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ].map(option => {
                const isSelected = onPeriod === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setOnPeriod(option.value)
                      if (option.value === 'no') setFlowLevel(null)
                    }}
                    className="cursor-pointer"
                    style={{
                      flex: 1, fontFamily: 'inherit', fontSize: 13,
                      padding: '12px 8px', borderRadius: 10,
                      border: isSelected ? '1.5px solid #2C2825' : '1px solid #E8E4DD',
                      background: isSelected ? '#2C28250A' : '#FFFEF9',
                      color: isSelected ? '#2C2825' : '#8A8279',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            {onPeriod === 'yes' && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 12, color: '#A09A90', display: 'block', marginBottom: 8 }}>
                  Flow level
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { value: 'spotting', label: 'Spotting', color: '#C4948A40' },
                    { value: 'light', label: 'Light', color: '#C4948A70' },
                    { value: 'medium', label: 'Medium', color: '#C4948A' },
                    { value: 'heavy', label: 'Heavy', color: '#A0534B' },
                  ].map(f => {
                    const isSelected = flowLevel === f.value
                    return (
                      <button
                        key={f.value}
                        onClick={() => setFlowLevel(f.value)}
                        className="cursor-pointer"
                        style={{
                          flex: 1, fontFamily: 'inherit', fontSize: 12,
                          padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                          border: isSelected ? `1.5px solid ${f.color}` : '1px solid #E8E4DD',
                          background: isSelected ? `${f.color}15` : '#FFFEF9',
                          color: isSelected ? '#2C2825' : '#A09A90',
                          fontWeight: isSelected ? 600 : 400,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Auto cycle day display */}
            {(cycleDay || onPeriod !== null) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
                padding: '8px 12px', background: '#F6F4F0', borderRadius: 8,
              }}>
                <span style={{ fontSize: 11, color: '#A09A90' }}>Estimated cycle day</span>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2C2825' }}>
                  {cycleDay || '—'}
                </span>
                {(() => {
                  // Phase is driven by cycleDay, but period=yes forces Menstrual
                  // and period=no on a menstrual-phase day advances to Follicular
                  const day = parseInt(cycleDay)
                  let ph = getCyclePhase(day)
                  if (onPeriod === 'yes') {
                    ph = { name: 'Menstrual', color: '#C4948A' }
                  } else if (onPeriod === 'no' && ph?.name === 'Menstrual') {
                    ph = { name: 'Follicular', color: '#9BAF93' }
                  }
                  return ph ? (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: ph.color,
                      background: ph.color + '15', borderRadius: 8, padding: '2px 8px',
                    }}>
                      {ph.name}
                    </span>
                  ) : null
                })()}
              </div>
            )}
          </div>

          {/* BBT */}
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 14,
          }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#2C2825', display: 'block', marginBottom: 4 }}>
              Basal Body Temperature <span style={{ fontWeight: 400, color: '#A09A90' }}>(optional)</span>
            </label>
            <div style={{ fontSize: 11, color: '#C8C3BA', marginBottom: 10 }}>
              Taken first thing in the morning before getting out of bed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                step="0.1"
                min="95" max="100"
                value={bbt}
                onChange={(e) => setBbt(e.target.value)}
                placeholder="97.8"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 24, color: '#2C2825',
                  width: 100, padding: '8px 12px',
                  borderRadius: 10, border: '1px solid #E8E4DD',
                  background: '#F6F4F0', outline: 'none',
                  textAlign: 'center',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2C2825')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DD')}
              />
              <span style={{ fontSize: 16, color: '#A09A90' }}>°F</span>
            </div>
          </div>

          {/* Cervical Mucus — skip during period */}
          {onPeriod !== 'yes' && (
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 14,
          }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#2C2825', display: 'block', marginBottom: 4 }}>
              Cervical Mucus <span style={{ fontWeight: 400, color: '#A09A90' }}>(optional)</span>
            </label>
            <div style={{ fontSize: 11, color: '#C8C3BA', marginBottom: 10 }}>
              Helps confirm cycle phase and ovulation timing
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CERVICAL_MUCUS_OPTIONS.map((option) => {
                const isSelected = cervicalMucus === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setCervicalMucus(option.value)}
                    className="w-full text-left cursor-pointer"
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 13,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #2C2825' : '1px solid #E8E4DD',
                      background: isSelected ? '#2C28250A' : '#FFFEF9',
                      color: isSelected ? '#2C2825' : '#8A8279',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s ease',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <span>{option.label}</span>
                    {option.desc && (
                      <span style={{ fontSize: 11, color: '#C8C3BA', fontWeight: 400 }}>{option.desc}</span>
                    )}
                  </button>
                )
              })}
            </div>
            {hasRingSleep && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 11, color: '#9BAF93' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9BAF93" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                Sleep tracked by your ring
              </div>
            )}
          </div>
          )}

          {/* Symptoms */}
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 14,
          }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#2C2825', display: 'block', marginBottom: 10 }}>
              Any symptoms today?
            </label>
            <PillSelect
              items={SYMPTOMS}
              selected={symptoms}
              onToggle={(item) => toggleItem(symptoms, setSymptoms, item, 'None')}
            />
          </div>

          {/* ===== SECTION 2: MIND & ENERGY ===== */}
          <SectionHeader number="2" title="Mind & Energy" />

          {/* Sliders */}
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {Object.entries(SLIDER_LABELS)
                .filter(([id]) => !(id === 'sleep_quality' && hasRingSleep))
                .map(([id, config]) => (
                <SliderInput
                  key={id}
                  id={id}
                  value={sliders[id]}
                  onChange={handleSliderChange}
                  config={config}
                />
              ))}
            </div>
          </div>

          {/* ===== SECTION 3: HABITS ===== */}
          <SectionHeader number="3" title="Habits" />

          {/* Activity */}
          {hasRingActivity ? (
            <div style={{
              background: '#FFFEF9', border: '1px solid #E8E4DD',
              borderRadius: 14, padding: '14px 18px', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9BAF93" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
              <span style={{ fontSize: 12, color: '#9BAF93', fontWeight: 500 }}>Activity tracked by your ring</span>
            </div>
          ) : (
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 14,
          }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#2C2825', display: 'block', marginBottom: 10 }}>
              Activity today
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: activity === 'workout' ? 14 : 0 }}>
              {[
                { value: 'workout', label: 'I worked out' },
                { value: 'rest', label: 'Rest day' },
              ].map((option) => {
                const isSelected = activity === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setActivity(option.value)
                      if (option.value === 'rest') {
                        setWorkoutTypes([])
                        setOtherWorkout('')
                      }
                    }}
                    className="cursor-pointer"
                    style={{
                      flex: 1, fontFamily: 'inherit', fontSize: 13,
                      padding: '12px 8px', borderRadius: 10,
                      border: isSelected ? '1.5px solid #2C2825' : '1px solid #E8E4DD',
                      background: isSelected ? '#2C28250A' : '#FFFEF9',
                      color: isSelected ? '#2C2825' : '#8A8279',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            {activity === 'workout' && (
              <div>
                <label style={{ fontSize: 12, color: '#A09A90', display: 'block', marginBottom: 8 }}>
                  What did you do?
                </label>
                <PillSelect
                  items={WORKOUT_TYPES}
                  selected={workoutTypes}
                  onToggle={toggleWorkoutType}
                />
                <input
                  type="text"
                  value={otherWorkout}
                  onChange={(e) => setOtherWorkout(e.target.value)}
                  placeholder="Other workout..."
                  className="mt-2"
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 13, color: '#2C2825',
                    width: '100%', padding: '10px 14px',
                    borderRadius: 10, border: '1px solid #E8E4DD',
                    background: '#F6F4F0', outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#2C2825')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E4DD')}
                />
              </div>
            )}
          </div>
          )}

          {/* Diet */}
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 14,
          }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#2C2825', display: 'block', marginBottom: 10 }}>
              How was your diet today?
            </label>
            <PillSelect
              items={DIET_TAGS}
              selected={dietTags}
              onToggle={toggleDietTag}
            />
          </div>

          {/* Supplements */}
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#2C2825' }}>
                Supplements taken today
              </label>
              <button
                onClick={() => {
                  if (specificSupplements.length === USER_SUPPLEMENTS.length) {
                    setSpecificSupplements([])
                    setSupplementsTaken('no')
                  } else {
                    setSpecificSupplements([...USER_SUPPLEMENTS])
                    setSupplementsTaken('yes')
                  }
                }}
                className="cursor-pointer"
                style={{
                  fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
                  padding: '4px 12px', borderRadius: 8,
                  border: specificSupplements.length === USER_SUPPLEMENTS.length ? '1.5px solid #9BAF93' : '1px solid #E8E4DD',
                  background: specificSupplements.length === USER_SUPPLEMENTS.length ? '#9BAF9312' : '#FFFEF9',
                  color: specificSupplements.length === USER_SUPPLEMENTS.length ? '#9BAF93' : '#A09A90',
                }}
              >
                {specificSupplements.length === USER_SUPPLEMENTS.length ? '✓ All selected' : 'Select all'}
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {USER_SUPPLEMENTS.map(supp => {
                const isSelected = specificSupplements.includes(supp)
                return (
                  <button
                    key={supp}
                    onClick={() => {
                      let next
                      if (isSelected) {
                        next = specificSupplements.filter(s => s !== supp)
                      } else {
                        next = [...specificSupplements, supp]
                      }
                      setSpecificSupplements(next)
                      setSupplementsTaken(next.length === 0 ? 'no' : next.length === USER_SUPPLEMENTS.length ? 'yes' : 'some')
                    }}
                    className="cursor-pointer"
                    style={{
                      fontFamily: 'inherit', fontSize: 12,
                      padding: '8px 14px', borderRadius: 10,
                      border: isSelected ? '1.5px solid #9BAF93' : '1px solid #E8E4DD',
                      background: isSelected ? '#9BAF9310' : '#FFFEF9',
                      color: isSelected ? '#2C2825' : '#A09A90',
                      fontWeight: isSelected ? 500 : 400,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected ? '✓ ' : ''}{supp}
                  </button>
                )
              })}
            </div>
            {USER_SUPPLEMENTS.length === 0 && (
              <div style={{ fontSize: 12, color: '#A09A90', textAlign: 'center', padding: '8px 0' }}>
                No supplements in your protocol yet
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{
            background: '#FFFEF9', border: '1px solid #E8E4DD',
            borderRadius: 14, padding: '18px', marginBottom: 20,
          }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#2C2825', display: 'block', marginBottom: 10 }}>
              Anything else to note? <span style={{ fontWeight: 400, color: '#A09A90' }}>(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tried a new workout, ate differently, felt off today..."
              rows={3}
              style={{
                fontFamily: 'inherit',
                fontSize: 14, color: '#2C2825',
                width: '100%', padding: '12px 14px',
                borderRadius: 10, border: '1px solid #E8E4DD',
                background: '#F6F4F0', outline: 'none',
                resize: 'vertical', lineHeight: 1.5,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2C2825')}
              onBlur={(e) => (e.target.style.borderColor = '#E8E4DD')}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div
        className="sticky bottom-0 px-6 py-5"
        style={{ background: 'linear-gradient(to top, #F6F4F0 80%, transparent)' }}
      >
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting}
            className="w-full cursor-pointer"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, fontWeight: 600,
              color: '#FFFEF9',
              background: canSubmit() && !isSubmitting ? '#2C2825' : '#D5D0C8',
              border: 'none', borderRadius: 12,
              padding: '16px',
              transition: 'all 0.3s ease',
              boxShadow: canSubmit() ? '0 4px 20px rgba(44, 40, 37, 0.15)' : 'none',
              opacity: canSubmit() && !isSubmitting ? 1 : 0.7,
            }}
          >
            {isSubmitting ? 'Logging...' : 'Log Check-in'}
          </button>
        </div>
      </div>
    </div>
  )
}
