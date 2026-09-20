import { Router } from 'express'
import { isGeminiConfigured, streamChat } from '../lib/gemini.js'
import { answerFaq, SUGGESTED_QUESTIONS } from '../lib/faq.js'
import { rateLimit } from '../lib/limiter.js'

export const MAX_MESSAGE_CHARS = 500
const MAX_HISTORY = 12
const MAX_HISTORY_CHARS = 2000

const FRIENDLY = {
  en: {
    tooLong: `Please keep messages under ${MAX_MESSAGE_CHARS} characters.`,
    empty: 'Type a question first.',
    failed: "Sorry, I hit a snag answering that. Please try again in a moment.",
  },
  es: {
    tooLong: `Por favor, mantén los mensajes por debajo de ${MAX_MESSAGE_CHARS} caracteres.`,
    empty: 'Escribe una pregunta primero.',
    failed: 'Lo siento, tuve un problema al responder. Inténtalo de nuevo en un momento.',
  },
}

function cleanHistory(history) {
  if (!Array.isArray(history)) return []
  return history
    .slice(-MAX_HISTORY)
    .filter((h) => h && typeof h.text === 'string' && (h.role === 'user' || h.role === 'bot'))
    .map((h) => ({ role: h.role, text: h.text.slice(0, MAX_HISTORY_CHARS) }))
}

/** Validates the body; returns { message, history } or { status, error }. */
function parseBody(body, locale) {
  const { message, history } = body ?? {}
  const msgs = FRIENDLY[locale]
  if (typeof message !== 'string' || !message.trim()) return { status: 400, error: msgs.empty }
  if (message.trim().length > MAX_MESSAGE_CHARS) return { status: 400, error: msgs.tooLong }
  return { message: message.trim(), history: cleanHistory(history) }
}

/**
 * Chatbot API.
 *
 *   GET  /suggestions   example questions (fallback chips)
 *   POST /stream        { message, history? } -> Server-Sent Events:
 *                         {type:'text', text} | {type:'navigate', section, path, label}
 *                         | {type:'done', source} | {type:'error', message}
 *   POST /ask           same input, single JSON reply { reply, navigate?, source }
 *
 * Gemini is used when GEMINI_API_KEY is set. If it fails before producing
 * anything, the built-in FAQ answers instead so the widget never goes silent.
 * Errors sent to clients are always friendly strings, never stack traces.
 */
export function chatbotRoutes() {
  const router = Router()
  const limiter = rateLimit({ max: 20, windowMs: 60_000 })
  const localeOf = (req) => (req.ctx?.locale === 'es' ? 'es' : 'en')

  router.get('/suggestions', (req, res) => {
    const locale = localeOf(req)
    res.json({ data: SUGGESTED_QUESTIONS.map((q) => q[locale] ?? q.en) })
  })

  /** Shared driver: yields events, applying the FAQ fallback and friendly errors. */
  async function* respond(message, history, locale, signal) {
    if (isGeminiConfigured()) {
      let sent = false
      try {
        for await (const event of streamChat(message, { locale, history, signal })) {
          sent = true
          yield event
        }
        yield { type: 'done', source: 'gemini' }
        return
      } catch (err) {
        if (signal.aborted) return
        console.error('[chatbot] Gemini call failed:', err.message)
        if (sent) {
          yield { type: 'error', message: FRIENDLY[locale].failed }
          return
        }
      }
    }
    yield { type: 'text', text: answerFaq(message, locale) }
    yield { type: 'done', source: 'faq' }
  }

  router.post('/stream', limiter, async (req, res) => {
    const locale = localeOf(req)
    const parsed = parseBody(req.body, locale)
    if (parsed.error) {
      return res.status(parsed.status).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error } })
    }

    const abort = new AbortController()
    res.on('close', () => {
      if (!res.writableFinished) abort.abort()
    })

    res.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    res.flushHeaders()

    try {
      for await (const event of respond(parsed.message, parsed.history, locale, abort.signal)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }
    } catch (err) {
      console.error('[chatbot] stream failed:', err.message)
      res.write(`data: ${JSON.stringify({ type: 'error', message: FRIENDLY[locale].failed })}\n\n`)
    }
    res.end()
  })

  router.post('/ask', limiter, async (req, res) => {
    const locale = localeOf(req)
    const parsed = parseBody(req.body, locale)
    if (parsed.error) {
      return res.status(parsed.status).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error } })
    }

    let reply = ''
    let navigate
    let source = 'faq'
    for await (const event of respond(parsed.message, parsed.history, locale, new AbortController().signal)) {
      if (event.type === 'text') reply += event.text
      else if (event.type === 'navigate') navigate = { section: event.section, path: event.path, label: event.label }
      else if (event.type === 'done') source = event.source
      else if (event.type === 'error') reply ||= event.message
    }
    res.json({ data: { reply, navigate, source } })
  })

  return router
}
