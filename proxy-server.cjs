// proxy-server.cjs
// Run with: node proxy-server.cjs

const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json({ limit: '25mb' }))

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY environment variable is required.')
  console.error('Set it with: export ANTHROPIC_API_KEY=sk-ant-...')
  process.exit(1)
}

async function forwardToAnthropic(req, res) {
  const endpoint = req.path
  console.log(`→ Received ${endpoint} request`)
  try {
    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: req.body.max_tokens || 1024,
      messages: req.body.messages,
    }
    if (req.body.system) {
      body.system = req.body.system
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    console.log(`← Got ${endpoint} response, status:`, response.status)
    res.json(data)
  } catch (err) {
    console.error('Proxy error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

app.post('/api/insights', forwardToAnthropic)
app.post('/api/bloodwork', forwardToAnthropic)

const PORT = 3001
app.listen(PORT, () => {
  console.log('')
  console.log('✓ Claude API proxy running on http://localhost:' + PORT)
  console.log('  Endpoints: /api/insights, /api/bloodwork')
  console.log('')
})
