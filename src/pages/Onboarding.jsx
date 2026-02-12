import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  {
    id: 'cycle',
    title: 'Your Cycle',
    subtitle: 'Help us understand your baseline',
    questions: [
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
    ],
  },
  {
    id: 'health',
    title: 'Health Goals',
    subtitle: "What you're focusing on",
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
          { value: 'thyroid', label: 'Thyroid issues' },
          { value: 'anemia', label: 'Anemia' },
          { value: 'ibs', label: 'IBS / digestive issues' },
          { value: 'anxiety', label: 'Anxiety / depression' },
          { value: 'other', label: 'Other' },
          { value: 'none', label: 'None of these' },
        ],
      },
    ],
  },
  {
    id: 'data',
    title: 'Your Data Sources',
    subtitle: 'What data can we work with?',
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
    questions: [
        {
            id: 'current_supplements',
            label: 'Select any supplements you currently take',
            type: 'multi',
            options: [
              { value: 'multivitamin', label: 'Multivitamin' },
              { value: 'vitamin_d', label: 'Vitamin D' },
              { value: 'vitamin_c', label: 'Vitamin C' },
              { value: 'vitamin_e', label: 'Vitamin E' },
              { value: 'magnesium', label: 'Magnesium' },
              { value: 'iron', label: 'Iron' },
              { value: 'calcium', label: 'Calcium' },
              { value: 'omega3', label: 'Omega-3 / Fish Oil' },
              { value: 'probiotic', label: 'Probiotic' },
              { value: 'b_complex', label: 'B-Complex' },
              { value: 'zinc', label: 'Zinc' },
              { value: 'ashwagandha', label: 'Ashwagandha' },
              { value: 'maca', label: 'Maca' },
              { value: 'vitex', label: 'Vitex' },
              { value: 'dim', label: 'DIM' },
              { value: 'inositol', label: 'Inositol' },
              { value: 'nac', label: 'NAC' },
              { value: 'berberine', label: 'Berberine' },
              { value: 'l_theanine', label: 'L-Theanine' },
              { value: 'turmeric', label: 'Turmeric / Curcumin' },
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

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleMultiSelect = (questionId, value) => {
    setAnswers((prev) => {
      const current = prev[questionId] || []

      // Handle "none" type options - deselect others when "none" is picked
      const noneValues = ['none']
      if (noneValues.includes(value)) {
        return { ...prev, [questionId]: current.includes(value) ? [] : [value] }
      }

      // If selecting a real option, remove "none"
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
        // Save answers and go to dashboard
        console.log('Onboarding complete:', answers)
        navigate('/dashboard')
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

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          {/* Back button + Logo */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goBack}
              className="cursor-pointer"
              style={{
                fontSize: 14,
                color: currentStep > 0 ? '#2D2A3E' : 'transparent',
                background: 'none',
                border: 'none',
                padding: '4px 0',
                fontFamily: 'inherit',
                pointerEvents: currentStep > 0 ? 'auto' : 'none',
              }}
            >
              ← Back
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #E8A0BF, #C4E0A5)' }}
            >
              ◐
            </div>
            <div style={{ width: 50 }} />
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(135deg, #E8A0BF, #C4E0A5)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span style={{ fontSize: 11, color: '#bbb' }}>
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span style={{ fontSize: 11, color: '#bbb' }}>
              {step.id.charAt(0).toUpperCase() + step.id.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 px-6 pb-8"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateX(20px)' : 'translateX(0)',
          transition: 'all 0.2s ease',
        }}
      >
        <div className="max-w-lg mx-auto">
          {/* Step title */}
          <div className="mb-8 mt-4">
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 700,
                color: '#2D2A3E',
                marginBottom: 4,
              }}
            >
              {step.title}
            </h1>
            <p style={{ fontSize: 14, color: '#999' }}>{step.subtitle}</p>
          </div>

          {/* Questions */}
          <div className="flex flex-col gap-8">
            {step.questions.map((question) => (
              <div key={question.id}>
                <label
                  className="block mb-3"
                  style={{ fontSize: 14, fontWeight: 600, color: '#2D2A3E' }}
                >
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
                            fontFamily: 'inherit',
                            fontSize: 14,
                            padding: '12px 16px',
                            borderRadius: 10,
                            border: isSelected ? '2px solid #2D2A3E' : '1px solid #e0ded9',
                            background: isSelected ? '#2D2A3E08' : 'white',
                            color: isSelected ? '#2D2A3E' : '#555',
                            fontWeight: isSelected ? 600 : 400,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                )}

                {question.type === 'multi' && (
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
                            fontFamily: 'inherit',
                            fontSize: 13,
                            padding: '8px 16px',
                            borderRadius: 30,
                            border: isSelected ? '2px solid #2D2A3E' : '1px solid #e0ded9',
                            background: isSelected ? '#2D2A3E' : 'white',
                            color: isSelected ? 'white' : '#555',
                            fontWeight: isSelected ? 600 : 400,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                )}
                {question.type === 'text' && (
                  <input
                    type="text"
                    placeholder={question.placeholder || ''}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleSelect(question.id, e.target.value)}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 14,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e0ded9',
                      background: 'white',
                      color: '#2D2A3E',
                      width: '100%',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#2D2A3E')}
                    onBlur={(e) => (e.target.style.borderColor = '#e0ded9')}
                  />
                )}
                {question.id === 'conditions' &&
                    (answers['conditions'] || []).includes('other') && (
                      <input
                        type="text"
                        placeholder="Tell us more..."
                        value={answers['conditions_other'] || ''}
                        onChange={(e) => handleSelect('conditions_other', e.target.value)}
                        className="mt-3"
                        style={{
                          fontFamily: 'inherit',
                          fontSize: 14,
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: '1px solid #e0ded9',
                          background: 'white',
                          color: '#2D2A3E',
                          width: '100%',
                          outline: 'none',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#2D2A3E')}
                        onBlur={(e) => (e.target.style.borderColor = '#e0ded9')}
                      />
                    )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="sticky bottom-0 px-6 py-5"
        style={{
          background: 'linear-gradient(to top, #FAFAF7 80%, transparent)',
        }}
      >
        <div className="max-w-lg mx-auto">
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className="w-full cursor-pointer"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: 'white',
              background: canProceed()
                ? 'linear-gradient(135deg, #2D2A3E, #3d3856)'
                : '#d0cfc9',
              border: 'none',
              borderRadius: 14,
              padding: '16px',
              transition: 'all 0.3s ease',
              boxShadow: canProceed() ? '0 4px 20px rgba(45, 42, 62, 0.2)' : 'none',
              opacity: canProceed() ? 1 : 0.7,
            }}
          >
            {isLastStep ? 'Complete Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
