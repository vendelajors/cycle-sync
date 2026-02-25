// Vercel serverless function — forwards AI requests to Anthropic's API
// Endpoint: POST /api/insights

// Allow up to 60s for AI generation (Vercel Hobby default is 10s)
export const maxDuration = 60

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  try {
    // Parse body — Vercel may pass it as string or object depending on size
    const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: parsed.messages,
    }
    if (parsed.system) {
      body.system = parsed.system
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
    console.error('Insights API error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
