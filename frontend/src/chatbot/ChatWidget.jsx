import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useRouter } from '../router.jsx'
import { useChat } from './ChatContext.jsx'
import { MAX_INPUT_CHARS, STRINGS, SUGGESTED_PROMPTS } from './config.js'
import Markdown from './markdown.jsx'
import { streamChat } from './stream.js'
import './chatbot.css'

const MAX_HISTORY = 10
const NARROW = '(max-width: 840px)'

let nextId = 1

/** Floating chat trigger + assistant panel: site help, navigation and soccer Q&A. */
export default function ChatWidget() {
  const { lang, tr } = useI18n()
  const { navigate } = useRouter()
  const { open, setOpen } = useChat()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)
  const closeTimer = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, loading, open])

  // Keep the composer focused: on open, and again once a reply finishes.
  useEffect(() => {
    if (open && !loading) inputRef.current?.focus()
  }, [open, loading])

  // Grow the textarea with its content, up to a few lines.
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }, [input, open])

  useEffect(
    () => () => {
      abortRef.current?.abort()
      clearTimeout(closeTimer.current)
    },
    [],
  )

  const goTo = useCallback(
    (path) => {
      navigate(path)
      // On phones the panel would cover the page we just opened.
      if (window.matchMedia?.(NARROW).matches) setOpen(false)
    },
    [navigate, setOpen],
  )

  const patchLast = useCallback((patch) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (!last) return prev
      return [...prev.slice(0, -1), { ...last, ...(typeof patch === 'function' ? patch(last) : patch) }]
    })
  }, [])

  async function sendMessage(text) {
    const trimmed = text.trim().slice(0, MAX_INPUT_CHARS)
    if (!trimmed || loading) return

    const history = messages
      .filter((m) => m.text && !m.error)
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, text: m.text }))

    setMessages((prev) => [
      ...prev,
      { id: nextId++, role: 'user', text: trimmed },
      { id: nextId++, role: 'bot', text: '' },
    ])
    setInput('')
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller
    let navigated = false

    try {
      await streamChat({
        message: trimmed,
        history,
        lang,
        signal: controller.signal,
        onEvent: (event) => {
          if (event.type === 'text') {
            patchLast((m) => ({ text: m.text + event.text }))
          } else if (event.type === 'navigate') {
            navigated = true
            patchLast({ nav: { path: event.path, label: event.label } })
            navigate(event.path)
          } else if (event.type === 'error') {
            patchLast({ text: event.message, error: true })
          }
        },
      })
      if (navigated && window.matchMedia?.(NARROW).matches) {
        // Leave a moment to read the confirmation, then reveal the page.
        closeTimer.current = setTimeout(() => setOpen(false), 1400)
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      // Friendly server messages (validation, rate limit) come through as-is;
      // anything else is a network failure.
      const known = err.message && err.message !== 'Request failed' && err.message !== 'Failed to fetch'
      patchLast({ text: known ? err.message : tr(STRINGS.networkError), error: true })
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setLoading(false)
      }
    }
  }

  function newChat() {
    abortRef.current?.abort()
    abortRef.current = null
    clearTimeout(closeTimer.current)
    setMessages([])
    setInput('')
    setLoading(false)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendMessage(input)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const lastBot = messages[messages.length - 1]
  const waitingForFirstChunk = loading && lastBot?.role === 'bot' && !lastBot.text

  return (
    <>
      {open && (
        <div className="chatbot-panel" role="dialog" aria-label={tr(STRINGS.title)}>
          <div className="chatbot-panel__head">
            <Icon name="sports_soccer" />
            <span className="chatbot-panel__title">{tr(STRINGS.title)}</span>
            <button
              type="button"
              className="chatbot-panel__action"
              aria-label={tr(STRINGS.newChat)}
              title={tr(STRINGS.newChat)}
              onClick={newChat}
              disabled={messages.length === 0}
            >
              <Icon name="add_comment" />
            </button>
            <button
              type="button"
              className="chatbot-panel__action"
              aria-label={tr(STRINGS.close)}
              title={tr(STRINGS.close)}
              onClick={() => setOpen(false)}
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="chatbot-panel__body" ref={bodyRef} role="log" aria-live="polite">
            {messages.length === 0 && (
              <>
                <div className="chatbot-msg chatbot-msg--bot">{tr(STRINGS.greeting)}</div>
                <div className="chatbot-suggestions">
                  {SUGGESTED_PROMPTS.map((q) => (
                    <button key={q.en} type="button" className="chatbot-suggestion" onClick={() => sendMessage(tr(q))}>
                      {tr(q)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((m) => {
              if (m.role === 'bot' && !m.text) return null
              return (
                <div key={m.id} className={`chatbot-msg chatbot-msg--${m.role}${m.error ? ' chatbot-msg--error' : ''}`}>
                  {m.role === 'bot' ? <Markdown text={m.text} onNavigate={goTo} /> : m.text}
                  {m.nav && (
                    <button type="button" className="chatbot-nav" onClick={() => goTo(m.nav.path)}>
                      <Icon name="open_in_new" />
                      {tr(STRINGS.openedPage)}: {m.nav.label}
                    </button>
                  )}
                </div>
              )
            })}

            {waitingForFirstChunk && (
              <div className="chatbot-msg chatbot-msg--bot chatbot-msg--typing" aria-label="…">
                <span />
                <span />
                <span />
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
            <textarea
              ref={inputRef}
              className="chatbot-panel__input"
              value={input}
              rows={1}
              maxLength={MAX_INPUT_CHARS}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
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
