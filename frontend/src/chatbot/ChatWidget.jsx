import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { api } from '../lib/api.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import './chatbot.css'

const STRINGS = {
  title: { en: 'Quick help', es: 'Ayuda rápida' },
  placeholder: { en: 'Ask a quick question…', es: 'Haz una pregunta rápida…' },
  greeting: {
    en: "Hi! I'm the Kickstart chat ball — ask me anything quick about the rules or how the app works.",
    es: '¡Hola! Soy el balón de chat de Kickstart. Pregúntame algo rápido sobre las reglas o cómo funciona la app.',
  },
  networkError: {
    en: "Hmm, I couldn't reach the server. Try again in a moment.",
    es: 'No pude conectar con el servidor. Intenta de nuevo en un momento.',
  },
  close: { en: 'Close chat', es: 'Cerrar chat' },
  open: { en: 'Open quick-question chat', es: 'Abrir chat de preguntas rápidas' },
  send: { en: 'Send', es: 'Enviar' },
}

/** Floating soccer-ball chat trigger + quick-question panel. */
export default function ChatWidget() {
  const { lang, tr } = useI18n()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (!open) return
    api('/chatbot/suggestions', { lang })
      .then((res) => setSuggestions(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setSuggestions([]))
  }, [open, lang])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, loading])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.text }))
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setLoading(true)

    try {
      const res = await api('/chatbot/ask', { method: 'POST', lang, body: { message: trimmed, history } })
      setMessages((prev) => [...prev, { role: 'bot', text: res?.data?.reply ?? tr(STRINGS.networkError) }])
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: tr(STRINGS.networkError) }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="chatbot-panel" role="dialog" aria-label={tr(STRINGS.title)}>
          <div className="chatbot-panel__head">
            <Icon name="sports_soccer" />
            <span className="chatbot-panel__title">{tr(STRINGS.title)}</span>
            <button
              type="button"
              className="chatbot-panel__close"
              aria-label={tr(STRINGS.close)}
              onClick={() => setOpen(false)}
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="chatbot-panel__body" ref={bodyRef}>
            {messages.length === 0 && <div className="chatbot-msg chatbot-msg--bot">{tr(STRINGS.greeting)}</div>}

            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${m.role}`}>
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="chatbot-msg chatbot-msg--bot chatbot-msg--typing">
                <span />
                <span />
                <span />
              </div>
            )}

            {!loading && messages.length === 0 && suggestions.length > 0 && (
              <div className="chatbot-suggestions">
                {suggestions.map((q) => (
                  <button key={q} type="button" className="chatbot-suggestion" onClick={() => sendMessage(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="chatbot-panel__form"
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage(input)
            }}
          >
            <input
              className="chatbot-panel__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tr(STRINGS.placeholder)}
              aria-label={tr(STRINGS.placeholder)}
            />
            <button type="submit" className="chatbot-panel__send" disabled={loading || !input.trim()} aria-label={tr(STRINGS.send)}>
              <Icon name="send" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-ball"
        aria-label={tr(open ? STRINGS.close : STRINGS.open)}
        onClick={() => setOpen((o) => !o)}
      >
        {!open && <span className="chatbot-ball__pulse" aria-hidden="true" />}
        <Icon name={open ? 'close' : 'sports_soccer'} />
      </button>
    </>
  )
}
