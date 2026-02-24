import { useState } from 'react'

export default function UHTest() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXQiOiJlOTk4NmQxMDA5M2NhOGUxZDkxOCIsInNjb3BlcyI6WyJyaW5nIl0sIm5hbWUiOiJVbHRyYWh1bWFuLVYyIiwiZXhwIjoxODAyNzUzOTkyfQ.agqjS2CXBk8aRzDBYRJwgMixV_TuD8AOlqW933zLd-Y' // Replace with your token

  const testAPI = async (date) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      // Official endpoint from docs - no email needed for own data
      const url = `https://partner.ultrahuman.com/api/v1/partner/daily_metrics?date=${date}`
      const res = await fetch(url, {
        headers: { 'Authorization': TOKEN }
      })
      const text = await res.text()
      let parsed = null
      try { parsed = JSON.parse(text) } catch {}
      setResult({
        status: res.status,
        isJSON: parsed !== null,
        data: parsed,
        raw: text.slice(0, 3000),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 30, fontFamily: 'monospace', maxWidth: 900, margin: '0 auto' }}>
      <h2>Ultrahuman API Test — Correct Endpoint</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Endpoint: /api/v1/partner/daily_metrics
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button onClick={() => testAPI('2026-02-15')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Test Feb 15
        </button>
        <button onClick={() => testAPI('2026-02-14')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Test Feb 14
        </button>
        <button onClick={() => testAPI('2026-02-13')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Test Feb 13
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {result && (
        <div>
          <div style={{
            padding: '10px 14px', marginBottom: 10,
            background: result.status === 200 && result.isJSON ? '#4CAF50' : '#f44336',
            color: 'white', borderRadius: 8, fontSize: 14,
          }}>
            Status: {result.status} — {result.isJSON ? '✓ JSON response!' : '✗ Not JSON'}
          </div>
          <pre style={{
            background: '#1a1a1a', color: result.isJSON ? '#0f0' : '#ff6b6b',
            padding: 20, borderRadius: 8, overflow: 'auto', maxHeight: '70vh',
            fontSize: 11, lineHeight: 1.4, whiteSpace: 'pre-wrap',
          }}>
            {result.isJSON ? JSON.stringify(result.data, null, 2) : result.raw}
          </pre>
        </div>
      )}
    </div>
  )
}
