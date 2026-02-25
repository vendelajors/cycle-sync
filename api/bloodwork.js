// Vercel serverless function — forwards bloodwork AI requests to Anthropic's API
// Endpoint: POST /api/bloodwork

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

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
    res.status(response.status).json(data)
  } catch (err) {
    console.error('Bloodwork API error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
