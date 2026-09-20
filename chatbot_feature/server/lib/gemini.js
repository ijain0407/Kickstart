import { GoogleGenAI } from '@google/genai'
import { NAVIGATE_TOOL, buildSystemPrompt, resolveRoute } from './siteMap.js'

const DEFAULT_MODEL = 'gemini-2.5-flash'
const TIMEOUT_MS = 25000
const MAX_TOOL_ROUNDS = 2

// Questions about live/recent events get Google Search grounding. Gemini 2.5
// can't combine search with function calling in one request, so the two
// tool sets are picked per message rather than sent together.
const NEWS_RE =
  /\b(news|latest|today|tonight|yesterday|last night|this (week|weekend|season|month)|right now|currently|scores?|results?|fixtures?|standings|league table|transfers?|rumou?rs?|injur(y|ies)|who won|noticias|hoy|ayer|resultados?|fichajes?|clasificacion|esta semana|esta temporada|ultimas|actualidad)\b/

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function needsSearch(message) {
  return NEWS_RE.test(normalize(message))
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY)
}

let client = null
let clientKey = null
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  if (!client || clientKey !== apiKey) {
    client = new GoogleGenAI({ apiKey })
    clientKey = apiKey
  }
  return client
}

function toContents(history, message) {
  const turns = history
    .filter((h) => h && typeof h.text === 'string' && h.text.trim())
    .map((h) => ({ role: h.role === 'bot' ? 'model' : 'user', parts: [{ text: h.text }] }))
  // Gemini wants the conversation to open with a user turn.
  while (turns.length && turns[0].role === 'model') turns.shift()
  return [...turns, { role: 'user', parts: [{ text: message }] }]
}

async function* runOnce(message, { locale, history, tools, signal }) {
  const ai = getClient()
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const contents = toContents(history, message)
  const config = {
    systemInstruction: buildSystemPrompt(locale),
    maxOutputTokens: 800,
    temperature: 0.5,
    abortSignal: signal,
    ...(tools.length ? { tools } : {}),
    // 2.5 Flash "thinks" by default and those tokens eat into
    // maxOutputTokens, truncating short chat replies mid-sentence.
    ...(/2\.5-flash/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
  }

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const stream = await ai.models.generateContentStream({ model, contents, config })
    const modelParts = []
    const calls = []

    for await (const chunk of stream) {
      for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
        if (part.text) yield { type: 'text', text: part.text }
        if (part.functionCall) calls.push(part.functionCall)
        modelParts.push(part)
      }
    }

    if (!calls.length) return

    const responses = []
    for (const call of calls) {
      const route = call.name === NAVIGATE_TOOL.name ? resolveRoute(call.args, locale) : null
      if (route) yield { type: 'navigate', ...route }
      responses.push({
        functionResponse: {
          name: call.name,
          response: route ? { ok: true, navigatedTo: route.label } : { ok: false, error: 'Unknown section' },
        },
      })
    }
    // Feed the result back so the model can confirm in one sentence.
    contents.push({ role: 'model', parts: modelParts }, { role: 'user', parts: responses })
  }
}

/**
 * Streams a reply as events: { type: 'text', text } and { type: 'navigate',
 * section, path, label }. Throws on failure; the caller decides how to fall
 * back. If Google Search grounding is rejected before anything was sent, it
 * retries once without tools so general questions still get answered.
 */
export async function* streamChat(message, { locale = 'en', history = [], signal } = {}) {
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout
  const search = needsSearch(message)
  const attempts = search ? [[{ googleSearch: {} }], []] : [[{ functionDeclarations: [NAVIGATE_TOOL] }]]

  let sent = false
  for (let i = 0; i < attempts.length; i++) {
    try {
      for await (const event of runOnce(message, { locale, history, tools: attempts[i], signal: combined })) {
        sent = true
        yield event
      }
      return
    } catch (err) {
      if (sent || i === attempts.length - 1 || combined.aborted) throw err
      console.error('[chatbot] Gemini with search failed, retrying without tools:', err.message)
    }
  }
}
