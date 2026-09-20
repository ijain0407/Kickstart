const DEFAULT_MODEL = 'gemini-2.5-flash'
const TIMEOUT_MS = 12000

const SYSTEM_PROMPT = {
  en: "You are the quick-help chat bubble inside Kickstart, a bilingual (English/Spanish) app for learning soccer: lessons, a tactics board, club culture and chants, a league matcher, and XP/streaks/badges. Answer the user's question in 1-3 short sentences, friendly and to the point, suitable for a small chat bubble. If asked about soccer rules, answer accurately. If you don't know something about the app itself, say so briefly rather than inventing details.",
  es: 'Eres la burbuja de ayuda rápida dentro de Kickstart, una app bilingüe (inglés/español) para aprender fútbol: lecciones, un tablero táctico, cultura de aficiones y cánticos, un buscador de ligas, y XP/rachas/insignias. Responde la pregunta del usuario en 1 a 3 frases breves, amigable y directa, adecuada para una pequeña burbuja de chat. Si preguntan sobre reglas de fútbol, responde con precisión. Si no sabes algo sobre la app, dilo brevemente en vez de inventar detalles.',
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY)
}

/**
 * Calls the Gemini API's generateContent endpoint. Throws on any failure —
 * the caller (routes/chatbot.js) catches it and falls back to the local FAQ,
 * so a bad key or a network hiccup never breaks the widget.
 */
export async function askGemini(message, { locale = 'en', history = [] } = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL

  const contents = [
    ...history
      .filter((h) => h && typeof h.text === 'string')
      .map((h) => ({ role: h.role === 'bot' ? 'model' : 'user', parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ]

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT[locale] ?? SYSTEM_PROMPT.en }] },
          contents,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.4,
            // 2.5 Flash "thinks" by default, and those tokens eat into
            // maxOutputTokens — a short chat-bubble reply doesn't need it,
            // and leaving it on was truncating answers mid-sentence.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    )

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`)
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('')
      .trim()
    if (!text) throw new Error('Gemini returned no text')
    return text
  } finally {
    clearTimeout(timeout)
  }
}
