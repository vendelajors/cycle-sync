// proxy-server.js
// Run with: node proxy-server.js
// Proxies Claude API requests to bypass CORS in local dev

import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY environment variable is required.')
  console.error('Set it with: export ANTHROPIC_API_KEY=sk-ant-...')
  process.exit(1)
}

app.post('/api/insights', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: req.body.messages,
      }),
    })

    const data = await response.json()
    res.json(data)
  } catch (err) {
    console.error('Proxy error:', err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`✓ Claude API proxy running on http://localhost:${PORT}`)
  console.log(`  Dashboard will call POST http://localhost:${PORT}/api/insights`)
})