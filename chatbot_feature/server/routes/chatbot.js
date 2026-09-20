import { Router } from 'express'
import { askGemini, isGeminiConfigured } from '../lib/gemini.js'
import { answerFaq, SUGGESTED_QUESTIONS } from '../lib/faq.js'

/**
 * Quick-question chat widget API.
 *
 *   GET  /suggestions   a few example questions to show as tappable chips
 *   POST /ask           { message, history? } -> { reply, source }
 *
 * Tries Gemini first when GEMINI_API_KEY is set; any failure (missing key,
 * network error, bad response) falls back to the built-in FAQ so the widget
 * always answers something.
 */
export function chatbotRoutes() {
  const router = Router()

  router.get('/suggestions', (req, res) => {
    const locale = req.ctx?.locale === 'es' ? 'es' : 'en'
    res.json({ data: SUGGESTED_QUESTIONS.map((q) => q[locale] ?? q.en) })
  })

  router.post('/ask', async (req, res) => {
    const { message, history } = req.body ?? {}
    const locale = req.ctx?.locale === 'es' ? 'es' : 'en'

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'message is required' } })
    }
    const trimmed = message.trim().slice(0, 500)

    if (isGeminiConfigured()) {
      try {
        const reply = await askGemini(trimmed, {
          locale,
          history: Array.isArray(history) ? history.slice(-6) : [],
        })
        return res.json({ data: { reply, source: 'gemini' } })
      } catch (err) {
        console.error('[chatbot] Gemini call failed, falling back to FAQ:', err.message)
      }
    }

    return res.json({ data: { reply: answerFaq(trimmed, locale), source: 'faq' } })
  })

  return router
}
