import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from './icons'
import { callProxy } from './promptBuilder'

const BLOODWORK_SYSTEM = 'You are a medical lab results parser. Extract ALL lab test results from bloodwork PDFs into structured JSON. Be thorough and precise.'

const EXTRACTION_PROMPT = `Extract ALL lab test results from this bloodwork PDF into structured JSON.

For each test, extract:
- test_name: the name of the test (e.g. "FERRITIN", "TSH", "VITAMIN D")
- value: the numeric or text result value
- unit: the unit of measurement
- reference_range: the reference/normal range
- status: "normal", "low", or "high" based on whether the value is in range
- flag: any flag like "L", "H", "A" if present, otherwise empty string
- category: group the test into a category like "Iron Panel", "Thyroid", "Metabolic Panel", "CBC", "Lipid Panel", "Hormones", "Vitamins & Minerals", "Inflammation", "Autoimmune", "Urinalysis", "Fatty Acids", "Other"

IMPORTANT RULES:
- Skip duplicate entries (the PDF may repeat results in appendix pages)
- Skip headers, notes, and non-test text
- For values like "<10" or "<0.2", keep them as strings
- Include the collection date if you can find it
- Be thorough - extract EVERY test result

Return ONLY valid JSON in this exact format, no other text:
{
  "collection_date": "YYYY-MM-DD",
  "lab_source": "detected lab name",
  "results": [
    {
      "test_name": "...",
      "value": "...",
      "unit": "...",
      "reference_range": "...",
      "status": "normal|low|high",
      "flag": "",
      "category": "..."
    }
  ]
}`

function StatusBadge({ status }) {
  const colors = {
    normal: { bg: '#9BAF9320', text: '#7A9470', label: 'Normal' },
    low: { bg: '#C4948A20', text: '#B07A6E', label: 'Low' },
    high: { bg: '#C9A96E20', text: '#A8893E', label: 'High' },
  }
  const c = colors[status] || colors.normal
  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      padding: '3px 10px', borderRadius: 20,
      background: c.bg, color: c.text,
    }}>
      {c.label}
    </span>
  )
}

export default function Bloodwork() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.type === 'application/pdf') {
      setFile(selected)
      setError(null)
      setResults(null)
      setSaved(false)
    } else {
      setError('Please select a PDF file')
    }
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const processBloodwork = async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setProcessingStatus('Reading PDF...')

    try {
      const base64Data = await fileToBase64(file)
      setProcessingStatus('Analyzing with AI — this may take 30-60 seconds...')

      const parsed = await callProxy({
        system: BLOODWORK_SYSTEM,
        endpoint: '/bloodwork',
        maxTokens: 8000,
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: EXTRACTION_PROMPT,
          },
        ],
      })

      setResults(parsed)
      setProcessingStatus('')

      // Auto-expand categories that have out-of-range results
      const autoExpand = {}
      const categories = [...new Set(parsed.results.map((r) => r.category))]
      categories.forEach((cat) => {
        const hasFlags = parsed.results.some(
          (r) => r.category === cat && r.status !== 'normal'
        )
        autoExpand[cat] = hasFlags
      })
      setExpandedCategories(autoExpand)
    } catch (err) {
      console.error('Processing error:', err)
      setError(err.message || 'Failed to process bloodwork. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const saveToSheets = async () => {
    if (!results) return
    setIsSaving(true)

    try {
      // Send each result as a row to Make.com
      const payload = {
        upload_date: new Date().toISOString().split('T')[0],
        collection_date: results.collection_date || '',
        lab_source: results.lab_source || '',
        file_name: file.name,
        results: results.results.map((r) => ({
          test_name: r.test_name,
          value: r.value,
          unit: r.unit,
          reference_range: r.reference_range,
          status: r.status,
          flag: r.flag,
          category: r.category,
        })),
      }

      await fetch('https://hook.us2.make.com/ia5rjtypacgeug5g12x8q2gndb9gck5f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setSaved(true)
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save results. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const groupedResults = results
    ? results.results.reduce((acc, r) => {
        if (!acc[r.category]) acc[r.category] = []
        acc[r.category].push(r)
        return acc
      }, {})
    : {}

  const totalTests = results ? results.results.length : 0
  const outOfRange = results
    ? results.results.filter((r) => r.status !== 'normal').length
    : 0

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#F6F4F0', fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

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
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Icons.arrowLeft size={14} color="#A09A90" /> Back
            </button>
            <Icons.logo size={32} />
            <div style={{ width: 50 }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-lg mx-auto">
          {/* Title */}
          <div className="mb-6 mt-2">
            <h1
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 28,
                fontWeight: 400,
                color: '#2C2825',
                marginBottom: 4,
              }}
            >
              Bloodwork Upload
            </h1>
            <p style={{ fontSize: 13, color: '#A09A90' }}>
              Upload your lab results PDF — AI will extract and organize your data
            </p>
          </div>

          {/* Upload Area */}
          {!results && !isProcessing && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer"
              style={{
                background: '#FFFEF9',
                border: '2px dashed #E8E4DD',
                borderRadius: 14,
                padding: '40px 20px',
                textAlign: 'center',
                marginBottom: 14,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2C2825'
                e.currentTarget.style.background = '#2C28250A'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E8E4DD'
                e.currentTarget.style.background = '#FFFEF9'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C4948A20, #9BAF9320)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: 20,
                }}
              >
                ↑
              </div>
              <div
                style={{ fontSize: 14, fontWeight: 600, color: '#2C2825', marginBottom: 4 }}
              >
                {file ? file.name : 'Click to upload PDF'}
              </div>
              <div style={{ fontSize: 12, color: '#A09A90' }}>
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(1)} MB — ready to analyze`
                  : 'Supports Quest, Labcorp, Function Health, and most lab formats'}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {file && !results && !isProcessing && (
            <button
              onClick={processBloodwork}
              className="w-full cursor-pointer"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: '#FFFEF9',
                background: '#2C2825',
                border: 'none',
                borderRadius: 12,
                padding: '16px',
                marginBottom: 14,
                boxShadow: '0 4px 20px rgba(44, 40, 37, 0.15)',
              }}
            >
              Analyze Bloodwork
            </button>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div
              style={{
                background: '#FFFEF9',
                border: '1px solid #E8E4DD',
                borderRadius: 14,
                padding: '40px 20px',
                textAlign: 'center',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C4948A, #9BAF93)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              >
                <Icons.logo size={36} />
              </div>
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.7; transform: scale(0.95); }
                }
              `}</style>
              <div
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 18,
                  color: '#2C2825',
                  marginBottom: 6,
                }}
              >
                Analyzing your results...
              </div>
              <div style={{ fontSize: 13, color: '#A09A90' }}>{processingStatus}</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div
              style={{
                background: '#C4948A12',
                border: '1px solid #C4948A30',
                borderLeft: '3px solid #C4948A',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 14,
                fontSize: 13,
                color: '#B07A6E',
              }}
            >
              {error}
            </div>
          )}

          {/* Results */}
          {results && (
            <>
              {/* Summary Card */}
              <div
                style={{
                  background: '#2C2825',
                  borderRadius: 14,
                  padding: '20px',
                  marginBottom: 14,
                  color: 'white',
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 4 }}>
                  {results.lab_source} · Collected{' '}
                  {results.collection_date || 'Unknown date'}
                </div>
                <div
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 24,
                    marginBottom: 12,
                  }}
                >
                  {totalTests} tests extracted
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div
                    style={{
                      background: '#9BAF9330',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{totalTests - outOfRange}</span>{' '}
                    in range
                  </div>
                  {outOfRange > 0 && (
                    <div
                      style={{
                        background: '#C4948A30',
                        borderRadius: 8,
                        padding: '8px 14px',
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{outOfRange}</span> out of range
                    </div>
                  )}
                </div>
              </div>

              {/* Categories */}
              {Object.entries(groupedResults).map(([category, tests]) => {
                const isExpanded = expandedCategories[category]
                const flaggedCount = tests.filter(
                  (t) => t.status !== 'normal'
                ).length
                return (
                  <div
                    key={category}
                    style={{
                      background: '#FFFEF9',
                      border: '1px solid #E8E4DD',
                      borderRadius: 14,
                      marginBottom: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full text-left cursor-pointer"
                      style={{
                        fontFamily: 'inherit',
                        padding: '14px 18px',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#2C2825',
                          }}
                        >
                          {category}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: '#A09A90',
                            marginLeft: 8,
                          }}
                        >
                          {tests.length} tests
                        </span>
                        {flaggedCount > 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              color: '#C4948A',
                              marginLeft: 8,
                              fontWeight: 600,
                            }}
                          >
                            {flaggedCount} flagged
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: '#A09A90',
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      >
                        ▼
                      </span>
                    </button>

                    {isExpanded && (
                      <div style={{ padding: '0 18px 14px' }}>
                        {tests.map((test, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 0',
                              borderTop: i === 0 ? '1px solid #E8E4DD' : 'none',
                              borderBottom:
                                i < tests.length - 1
                                  ? '1px solid #F0EDE8'
                                  : 'none',
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: '#2C2825',
                                  fontWeight: test.status !== 'normal' ? 600 : 400,
                                }}
                              >
                                {test.test_name}
                              </div>
                              <div style={{ fontSize: 11, color: '#C8C3BA' }}>
                                Ref: {test.reference_range}
                              </div>
                            </div>
                            <div
                              style={{
                                textAlign: 'right',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    fontFamily: "'Instrument Serif', serif",
                                    fontSize: 18,
                                    color:
                                      test.status !== 'normal'
                                        ? test.status === 'low'
                                          ? '#B07A6E'
                                          : '#A8893E'
                                        : '#2C2825',
                                  }}
                                >
                                  {test.value}
                                </span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: '#A09A90',
                                    marginLeft: 4,
                                  }}
                                >
                                  {test.unit}
                                </span>
                              </div>
                              <StatusBadge status={test.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Save / Actions */}
              <div style={{ marginTop: 10, marginBottom: 20 }}>
                {!saved ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={saveToSheets}
                      disabled={isSaving}
                      className="cursor-pointer"
                      style={{
                        flex: 1,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#FFFEF9',
                        background: '#2C2825',
                        border: 'none',
                        borderRadius: 12,
                        padding: '16px',
                        boxShadow: '0 4px 20px rgba(44, 40, 37, 0.15)',
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Confirm & Save Results'}
                    </button>
                    <button
                      onClick={() => {
                        setResults(null)
                        setFile(null)
                        setSaved(false)
                      }}
                      className="cursor-pointer"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#8A8279',
                        background: 'none',
                        border: '1.5px solid #E8E4DD',
                        borderRadius: 12,
                        padding: '16px 20px',
                      }}
                    >
                      Redo
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#7A9470',
                        marginBottom: 12,
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Icons.check size={14} color="#7A9470" /> Results saved to your profile
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          setResults(null)
                          setFile(null)
                          setSaved(false)
                        }}
                        className="cursor-pointer"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#FFFEF9',
                          background: '#2C2825',
                          border: 'none',
                          borderRadius: 10,
                          padding: '12px 28px',
                        }}
                      >
                        Upload Another
                      </button>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="cursor-pointer"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#8A8279',
                          background: 'none',
                          border: '1.5px solid #E8E4DD',
                          borderRadius: 10,
                          padding: '12px 28px',
                        }}
                      >
                        Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
