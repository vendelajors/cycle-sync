/**
 * Shared AI prompt infrastructure for Cycle Sync.
 *
 * Provides system/user message construction, a proxy call wrapper,
 * safe JSON parsing, and boundary-aware text truncation.
 */

const PROXY_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api'

const BASE_RULES = `- Respond ONLY with valid JSON. No markdown, no code fences, no extra text.
- Use Fahrenheit for all temperatures.
- Never give medical diagnoses. Frame everything as wellness observations and suggestions.
- Reference the user's actual data — never give generic advice when specific data is available.`

/**
 * Build a system message for the Anthropic API.
 * @param {string} role - The AI persona (e.g. "women's health analyst")
 * @param {string} [extraRules] - Additional rules appended after the base rules
 * @returns {string}
 */
export function buildSystemMessage(role, extraRules = '') {
  let msg = `You are a ${role} for the Cycle Sync women's health app.\n\nRULES:\n${BASE_RULES}`
  if (extraRules) msg += '\n' + extraRules
  return msg
}

/**
 * Build a structured user message from named sections.
 * @param {Array<{heading: string, content: string}>} sections
 * @returns {string}
 */
export function buildUserMessage(sections) {
  return sections
    .filter(s => s.content && s.content.trim())
    .map(s => `## ${s.heading}\n${s.content.trim()}`)
    .join('\n\n')
}

/**
 * Call the proxy server's insights endpoint.
 * @param {object} opts
 * @param {string} opts.system - System message
 * @param {string} opts.userMessage - User message content
 * @param {number} [opts.maxTokens=1024] - Max tokens for the response
 * @param {string} [opts.endpoint='/insights'] - Proxy endpoint path
 * @param {Array} [opts.content] - Raw content array (for multimodal like PDF + text)
 * @returns {Promise<object>} Parsed JSON response from the AI
 */
export async function callProxy({ system, userMessage, maxTokens = 1024, endpoint = '/insights', content }) {
  const messages = content
    ? [{ role: 'user', content }]
    : [{ role: 'user', content: userMessage }]

  const response = await fetch(`${PROXY_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system,
      messages,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    throw new Error(`Proxy returned ${response.status}: ${await response.text()}`)
  }

  const data = await response.json()
  const text = data.content?.map(c => c.text || '').join('') || ''
  return safeParseJSON(text)
}

/**
 * Parse JSON from AI output, handling common quirks:
 * 1. Markdown code fences
 * 2. Trailing commas
 * 3. Truncated JSON (find last valid closing brace)
 *
 * @param {string} text - Raw text from the AI response
 * @returns {object} Parsed JSON object
 */
export function safeParseJSON(text) {
  let clean = text.replace(/```json\s?|```/g, '').trim()

  // Attempt 1: direct parse
  try { return JSON.parse(clean) } catch {}

  // Attempt 2: fix trailing commas before } or ]
  try {
    const fixed = clean.replace(/,\s*([\]}])/g, '$1')
    return JSON.parse(fixed)
  } catch {}

  // Attempt 3: truncated JSON — find last } and try parsing up to it
  const lastBrace = clean.lastIndexOf('}')
  if (lastBrace > 0) {
    try { return JSON.parse(clean.substring(0, lastBrace + 1)) } catch {}
  }

  throw new Error('Could not parse AI response as JSON')
}

/**
 * Truncate text at a line boundary to avoid cutting mid-sentence.
 * @param {string} text - Text to truncate
 * @param {number} maxChars - Maximum character count
 * @returns {string}
 */
export function truncateAtBoundary(text, maxChars) {
  if (!text || text.length <= maxChars) return text
  const cut = text.lastIndexOf('\n', maxChars)
  return cut > 0 ? text.substring(0, cut) : text.substring(0, maxChars)
}
