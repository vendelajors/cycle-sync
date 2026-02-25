import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from './icons'

const STEPS = [
  {
    id: 'cycle',
    title: 'Your Cycle',
    subtitle: 'Help us understand your baseline',
    icon: Icons.refresh,
    color: '#C4948A',
    questions: [
      {
        id: 'name',
        label: 'What should we call you?',
        type: 'text',
        placeholder: 'Your first name...',
      },
      {
        id: 'birthday',
        label: 'When is your birthday?',
        type: 'date',
        placeholder: 'YYYY-MM-DD',
      },
      {
        id: 'cycle_length',
        label: 'How long is your typical cycle?',
        type: 'select',
        options: [
          { value: 'less_than_24', label: 'Less than 24 days' },
          { value: '24_26', label: '24–26 days' },
          { value: '27_29', label: '27–29 days' },
          { value: '30_32', label: '30–32 days' },
          { value: '33_35', label: '33–35 days' },
          { value: 'more_than_35', label: 'More than 35 days' },
          { value: 'irregular', label: 'Irregular / not sure' },
        ],
      },
      {
        id: 'last_period_date',
        label: 'When did your last period start?',
        type: 'date',
        helperText: 'Your best estimate is fine — this helps us calculate your current cycle day',
      },
      {
        id: 'period_length',
        label: 'How long does your period typically last?',
        type: 'select',
        options: [
          { value: '2_3', label: '2–3 days' },
          { value: '4_5', label: '4–5 days' },
          { value: '6_7', label: '6–7 days' },
          { value: 'more_than_7', label: 'More than 7 days' },
          { value: 'varies', label: 'Varies a lot' },
        ],
      },
      {
        id: 'tracking_method',
        label: 'How do you currently track your cycle?',
        type: 'multi',
        options: [
          { value: 'app', label: 'Period tracking app' },
          { value: 'calendar', label: 'Calendar / manual' },
          { value: 'bbt', label: 'BBT tracking' },
          { value: 'opk', label: 'OPK strips' },
          { value: 'none', label: "I don't currently track" },
        ],
      },
      {
        id: 'birth_control',
        label: 'Are you currently using hormonal birth control?',
        type: 'select',
        options: [
          { value: 'none', label: 'No, not currently' },
          { value: 'yes_hormonal', label: 'Yes — hormonal birth control' },
          { value: 'iud_copper', label: 'Copper IUD (non-hormonal)' },
        ],
      },
      {
        id: 'bc_history',
        label: 'Have you previously used hormonal birth control?',
        type: 'select',
        options: [
          { value: 'never', label: 'Never used it' },
          { value: 'less_6mo', label: 'Yes — stopped less than 6 months ago' },
          { value: '6mo_1yr', label: 'Yes — stopped 6–12 months ago' },
          { value: '1yr_2yr', label: 'Yes — stopped 1–2 years ago' },
          { value: 'more_2yr', label: 'Yes — stopped 2+ years ago' },
        ],
      },
    ],
  },
  {
    id: 'health',
    title: 'Health Goals',
    subtitle: "What you're focusing on",
    icon: Icons.heart,
    color: '#9BAF93',
    questions: [
      {
        id: 'goals',
        label: 'What are your top health goals?',
        type: 'multi',
        options: [
          { value: 'energy', label: 'More consistent energy' },
          { value: 'sleep', label: 'Better sleep' },
          { value: 'mood', label: 'Mood stability' },
          { value: 'hormones', label: 'Hormone balance' },
          { value: 'fitness', label: 'Fitness performance' },
          { value: 'skin', label: 'Skin health' },
          { value: 'digestion', label: 'Better digestion' },
          { value: 'stress', label: 'Stress management' },
          { value: 'fertility', label: 'Fertility awareness' },
          { value: 'weight', label: 'Body composition' },
        ],
      },
      {
        id: 'conditions',
        label: 'Any known conditions? (optional)',
        type: 'multi',
        options: [
          { value: 'pcos', label: 'PCOS' },
          { value: 'endo', label: 'Endometriosis' },
          { value: 'pmdd', label: 'PMDD' },
          { value: 'fibroids', label: 'Fibroids / adenomyosis' },
          { value: 'thyroid', label: 'Thyroid disorder' },
          { value: 'insulin_resistance', label: 'Insulin resistance' },
          { value: 'anemia', label: 'Anemia / low ferritin' },
          { value: 'ibs', label: 'IBS / gut issues' },
          { value: 'migraines', label: 'Menstrual migraines' },
          { value: 'anxiety', label: 'Anxiety' },
          { value: 'depression', label: 'Depression' },
          { value: 'autoimmune', label: 'Autoimmune condition' },
          { value: 'perimenopause', label: 'Perimenopause' },
          { value: 'none', label: 'None of these' },
        ],
      },
      {
        id: 'conditions_detail',
        label: 'Anything else we should know? (optional)',
        type: 'text',
        placeholder: "e.g. Hashimoto's, ADHD, chronic fatigue...",
      },
    ],
  },
  {
    id: 'data',
    title: 'Your Data Sources',
    subtitle: 'What data can we work with?',
    icon: Icons.ring,
    color: '#C9A96E',
    questions: [
      {
        id: 'wearables',
        label: 'Which wearables or devices do you use?',
        type: 'multi',
        options: [
          { value: 'oura', label: 'Oura Ring' },
          { value: 'ultrahuman', label: 'Ultrahuman Ring' },
          { value: 'apple_watch', label: 'Apple Watch' },
          { value: 'whoop', label: 'WHOOP' },
          { value: 'garmin', label: 'Garmin' },
          { value: 'fitbit', label: 'Fitbit' },
          { value: 'cgm', label: 'CGM (Levels, Dexcom)' },
          { value: 'none', label: "I don't use any" },
        ],
      },
      {
        id: 'bloodwork',
        label: 'Have you done bloodwork in the past 6 months?',
        type: 'select',
        options: [
          { value: 'yes_recent', label: 'Yes, within the last 3 months' },
          { value: 'yes_older', label: 'Yes, 3–6 months ago' },
          { value: 'no', label: 'No' },
          { value: 'planning', label: 'No, but planning to' },
        ],
      },
    ],
  },
  {
    id: 'supplements',
    title: 'Supplement Stack',
    subtitle: 'What are you currently taking?',
    icon: Icons.zap,
    color: '#6B7DB3',
    questions: [
      {
        id: 'current_supplements',
        label: 'Select any supplements you currently take',
        type: 'multi',
        options: [
          { value: 'multivitamin', label: 'Multivitamin' },
          { value: 'vitamin_d', label: 'Vitamin D' },
          { value: 'vitamin_c', label: 'Vitamin C' },
          { value: 'magnesium', label: 'Magnesium' },
          { value: 'iron', label: 'Iron' },
          { value: 'omega3', label: 'Omega-3' },
          { value: 'probiotic', label: 'Probiotic' },
          { value: 'b_complex', label: 'B-Complex' },
          { value: 'zinc', label: 'Zinc' },
          { value: 'ashwagandha', label: 'Ashwagandha' },
          { value: 'maca', label: 'Maca' },
          { value: 'vitex', label: 'Vitex' },
          { value: 'dim', label: 'DIM' },
          { value: 'inositol', label: 'Inositol' },
          { value: 'nac', label: 'NAC' },
          { value: 'collagen', label: 'Collagen' },
          { value: 'creatine', label: 'Creatine' },
          { value: 'coq10', label: 'CoQ10' },
          { value: 'none', label: "I don't take supplements" },
        ],
      },
      {
        id: 'other_supplements',
        label: 'Taking anything else? (optional)',
        type: 'text',
        placeholder: 'e.g. Selenium, Lions Mane, Spearmint tea...',
      },
    ],
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [animating, setAnimating] = useState(false)
  const [complete, setComplete] = useState(false)

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleMultiSelect = (questionId, value) => {
    setAnswers((prev) => {
      const current = prev[questionId] || []
      const noneValues = ['none']
      if (noneValues.includes(value)) {
        return { ...prev, [questionId]: current.includes(value) ? [] : [value] }
      }
      const filtered = current.filter((v) => !noneValues.includes(v))
      if (filtered.includes(value)) {
        return { ...prev, [questionId]: filtered.filter((v) => v !== value) }
      }
      return { ...prev, [questionId]: [...filtered, value] }
    })
  }

  const canProceed = () => {
    return step.questions.every((q) => {
      if (q.type === 'text') return true
      if (q.type === 'date') return true // optional
      const answer = answers[q.id]
      if (q.type === 'multi') return answer && answer.length > 0
      return answer !== undefined && answer !== ''
    })
  }

  const goNext = () => {
    if (!canProceed()) return
    setAnimating(true)
    setTimeout(() => {
      if (isLastStep) {
        console.log('Onboarding complete:', answers)
        localStorage.setItem('onboardingAnswers', JSON.stringify(answers))
        setComplete(true)
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setCurrentStep((s) => s + 1)
      }
      setAnimating(false)
    }, 200)
  }

  const goBack = () => {
    if (currentStep > 0) {
      setAnimating(true)
      setTimeout(() => {
        setCurrentStep((s) => s - 1)
        setAnimating(false)
      }, 200)
    }
  }

  // Completion screen
  if (complete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#F6F4F0', fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes scaleInBounce { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
          @keyframes fadeUpDelay { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          .bounce-in { animation: scaleInBounce 0.5s ease forwards; }
          .fade-up-d { animation: fadeUpDelay 0.5s ease 0.3s forwards; opacity: 0; }
        `}</style>
        <div className="bounce-in" style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #C4948A, #9BAF93)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
        }}>
          <Icons.check size={36} color="white" />
        </div>
        <div className="fade-up-d" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#2C2825', marginBottom: 8 }}>
            You're all set
          </h1>
          <p style={{ fontSize: 14, color: '#A09A90' }}>Building your personalized dashboard...</p>
        </div>
      </div>
    )
  }

  const StepIcon = step.icon

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F6F4F0', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={goBack} className="cursor-pointer" style={{
              fontSize: 13, color: currentStep > 0 ? '#A09A90' : 'transparent',
              background: 'none', border: 'none', padding: '4px 0',
              fontFamily: 'inherit', pointerEvents: currentStep > 0 ? 'auto' : 'none',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Icons.arrowLeft size={14} color="#A09A90" /> Back
            </button>
            <Icons.logo size={32} />
            <div style={{ width: 50 }} />
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i <= currentStep
                  ? `linear-gradient(135deg, ${STEPS[i].color}, ${STEPS[Math.min(i + 1, STEPS.length - 1)].color})`
                  : '#E8E4DD',
                transition: 'all 0.4s ease',
              }} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span style={{ fontSize: 11, color: '#C8C3BA' }}>
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span style={{ fontSize: 11, color: step.color, fontWeight: 600 }}>
              {step.title}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8" style={{
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateX(20px)' : 'translateX(0)',
        transition: 'all 0.2s ease',
      }}>
        <div className="max-w-lg mx-auto">
          <div className="mb-8 mt-4">
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${step.color}15`, display: 'flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: 14,
            }}>
              <StepIcon size={20} color={step.color} />
            </div>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 28, fontWeight: 400, color: '#2C2825', marginBottom: 4,
            }}>{step.title}</h1>
            <p style={{ fontSize: 13, color: '#A09A90' }}>{step.subtitle}</p>
          </div>

          <div className="flex flex-col gap-8">
            {step.questions.map((question) => (
              <div key={question.id}>
                <label className="block mb-3" style={{ fontSize: 13, fontWeight: 600, color: '#2C2825' }}>
                  {question.label}
                </label>

                {question.type === 'select' && (
                  <div className="flex flex-col gap-2">
                    {question.options.map((option) => {
                      const isSelected = answers[question.id] === option.value
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSelect(question.id, option.value)}
                          className="w-full text-left cursor-pointer"
                          style={{
                            fontFamily: 'inherit', fontSize: 14,
                            padding: '12px 16px', borderRadius: 10,
                            border: isSelected ? `1.5px solid ${step.color}` : '1px solid #E8E4DD',
                            background: isSelected ? `${step.color}08` : '#FFFEF9',
                            color: isSelected ? '#2C2825' : '#8A8279',
                            fontWeight: isSelected ? 600 : 400,
                            transition: 'all 0.15s ease',
                            display: 'flex', alignItems: 'center', gap: 10,
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            border: isSelected ? `2px solid ${step.color}` : '1.5px solid #D5D0C8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'all 0.15s ease',
                          }}>
                            {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: step.color }} />}
                          </div>
                          {option.label}
                        </button>
                      )
                    })}

                    {question.id === 'birth_control' &&
                      answers['birth_control'] === 'yes_hormonal' && (
                        <div className="mt-2" style={{
                          background: '#C9A96E12',
                          borderLeft: `3px solid #C9A96E`,
                          borderRadius: 10, padding: '14px 16px',
                          fontSize: 13, color: '#8A8279', lineHeight: 1.6,
                        }}>
                          <span style={{ fontWeight: 600, color: '#2C2825' }}>Heads up — </span>
                          Cycle Sync is currently optimized for natural menstrual cycles. We're building hormonal BC-specific insights soon. You're welcome to explore, but phase-based analysis won't apply to you yet.
                        </div>
                      )}
                  </div>
                )}

                {question.type === 'multi' && (
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {question.options.map((option) => {
                        const selected = answers[question.id] || []
                        const isSelected = selected.includes(option.value)
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleMultiSelect(question.id, option.value)}
                            className="cursor-pointer"
                            style={{
                              fontFamily: 'inherit', fontSize: 13,
                              padding: '8px 16px', borderRadius: 30,
                              border: isSelected ? `1.5px solid ${step.color}` : '1px solid #E8E4DD',
                              background: isSelected ? step.color : '#FFFEF9',
                              color: isSelected ? '#FFFEF9' : '#8A8279',
                              fontWeight: isSelected ? 600 : 400,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isSelected && <span style={{ marginRight: 4 }}>✓</span>}
                            {option.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* Condition-specific context notes */}
                    {question.id === 'conditions' && (() => {
                      const selected = answers['conditions'] || []
                      const notes = {
                        pmdd: { color: '#9C8FBF', text: 'AI insights will prioritize luteal phase mood support, GABA-boosting nutrients, and progesterone-sensitive strategies.' },
                        thyroid: { color: '#6B7DB3', text: 'BBT patterns may differ from standard ranges — AI will interpret your temperature data with thyroid context.' },
                        insulin_resistance: { color: '#C4948A', text: 'AI insights will emphasize low-GI nutrition, carb timing by phase, and blood sugar-stabilizing strategies.' },
                        pcos: { color: '#C9A96E', text: 'AI insights will account for androgen patterns, insulin sensitivity, and irregular cycle considerations.' },
                        endo: { color: '#C4948A', text: 'AI insights will prioritize anti-inflammatory strategies and pain management correlated to your cycle phases.' },
                        migraines: { color: '#9BAF93', text: 'Menstrual migraine patterns will be tracked and correlated with hormone shifts across your cycle.' },
                        perimenopause: { color: '#A09A90', text: 'AI insights will adapt to irregular cycles and fluctuating hormone patterns typical of perimenopause.' },
                        autoimmune: { color: '#7AA38F', text: 'AI insights will factor in immune-hormone interactions and inflammation patterns across your cycle.' },
                      }
                      const activeNotes = Object.entries(notes).filter(([key]) => selected.includes(key))
                      if (activeNotes.length === 0) return null
                      return (
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {activeNotes.map(([key, note]) => (
                            <div key={key} style={{
                              background: `${note.color}12`,
                              borderLeft: `3px solid ${note.color}`,
                              borderRadius: 8, padding: '10px 14px',
                              fontSize: 12, color: '#6B6560', lineHeight: 1.5,
                            }}>
                              {note.text}
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {question.type === 'text' && (
                  <input type="text" placeholder={question.placeholder || ''}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleSelect(question.id, e.target.value)}
                    style={{
                      fontFamily: 'inherit', fontSize: 14, padding: '12px 16px',
                      borderRadius: 10, border: '1px solid #E8E4DD',
                      background: '#FFFEF9', color: '#2C2825', width: '100%', outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = step.color)}
                    onBlur={(e) => (e.target.style.borderColor = '#E8E4DD')}
                  />
                )}

                {question.type === 'date' && (
                  <div>
                    {question.helperText && (
                      <div style={{ fontSize: 11, color: '#A09A90', marginBottom: 8 }}>{question.helperText}</div>
                    )}
                    <input type="date"
                      value={answers[question.id] || ''}
                      max={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()}
                      onChange={(e) => handleSelect(question.id, e.target.value)}
                      style={{
                        fontFamily: 'inherit', fontSize: 14, padding: '12px 16px',
                        borderRadius: 10, border: '1px solid #E8E4DD',
                        background: '#FFFEF9', color: '#2C2825', width: '100%', outline: 'none',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = step.color)}
                      onBlur={(e) => (e.target.style.borderColor = '#E8E4DD')}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 px-6 py-5" style={{ background: 'linear-gradient(to top, #F6F4F0 80%, transparent)' }}>
        <div className="max-w-lg mx-auto">
          <button onClick={goNext} disabled={!canProceed()} className="w-full cursor-pointer" style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
            color: '#FFFEF9',
            background: canProceed() ? step.color : '#D5D0C8',
            border: 'none', borderRadius: 12, padding: '16px',
            transition: 'all 0.3s ease',
            boxShadow: canProceed() ? `0 4px 20px ${step.color}30` : 'none',
            opacity: canProceed() ? 1 : 0.6,
          }}>
            {isLastStep ? 'Complete Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
