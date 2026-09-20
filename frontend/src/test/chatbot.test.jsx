import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Markdown from '../chatbot/markdown.jsx'
import ChatWidget from '../chatbot/ChatWidget.jsx'
import { SUGGESTED_PROMPTS } from '../chatbot/config.js'
import { ChatProvider } from '../chatbot/ChatContext.jsx'
import { RouterProvider } from '../router.jsx'
import { I18nProvider } from '../i18n/I18nContext.jsx'

describe('chat markdown', () => {
  it('renders bold, lists and in-app links', () => {
    const onNavigate = vi.fn()
    const { container } = render(
      <Markdown text={'Try **offside**:\n* one\n* two\n\nSee [Field](#/field)'} onNavigate={onNavigate} />,
    )
    expect(container.querySelector('strong')).toHaveTextContent('offside')
    expect(container.querySelectorAll('li')).toHaveLength(2)
    expect(screen.getByRole('link', { name: /Field/ })).toHaveAttribute('href', '#/field')
  })

  it('never turns model output into HTML or unsafe links', () => {
    const { container } = render(
      <Markdown
        text={'<img src=x onerror=alert(1)> [bad](javascript:alert(1)) [nope](#/admin) [ok](https://example.com)'}
        onNavigate={() => {}}
      />,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['https://example.com'])
    expect(container.querySelector('a')).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})

function sse(events) {
  const enc = new TextEncoder()
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const e of events) controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`))
        controller.close()
      },
    }),
    { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
  )
}

describe('ChatWidget', () => {
  const realFetch = globalThis.fetch
  let fetchMock

  beforeEach(() => {
    window.location.hash = '#/'
    localStorage.clear()
    fetchMock = vi.fn()
    globalThis.fetch = fetchMock
  })
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  function renderWidget() {
    return render(
      <I18nProvider>
        <RouterProvider>
          <ChatProvider>
            <ChatWidget />
          </ChatProvider>
        </RouterProvider>
      </I18nProvider>,
    )
  }

  it('shows every configured suggestion chip on first open', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /chat with leo/i }))
    for (const q of SUGGESTED_PROMPTS) {
      expect(screen.getByRole('button', { name: q.en })).toBeInTheDocument()
    }
  })

  it('streams a reply, sends history, and Shift+Enter does not submit', async () => {
    const user = userEvent.setup()
    fetchMock.mockImplementation(async () =>
      sse([{ type: 'text', text: 'Offside is ' }, { type: 'text', text: '**tricky**.' }, { type: 'done', source: 'gemini' }]),
    )
    renderWidget()
    await user.click(screen.getByRole('button', { name: /chat with leo/i }))

    await user.click(screen.getByRole('button', { name: 'Explain offside' }))
    expect(await screen.findByText('tricky')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ message: 'Explain offside', history: [] })
    expect(fetchMock.mock.calls[0][1].headers['X-Locale']).toBe('en')

    const box = screen.getByRole('textbox')
    await waitFor(() => expect(box).not.toBeDisabled())
    await user.type(box, 'and why?{Shift>}{Enter}{/Shift}')
    expect(fetchMock).toHaveBeenCalledTimes(1) // Shift+Enter only adds a newline
    await user.keyboard('{Enter}')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    const body = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(body.message).toBe('and why?')
    expect(body.history).toEqual([
      { role: 'user', text: 'Explain offside' },
      { role: 'bot', text: 'Offside is **tricky**.' },
    ])
  })

  it('performs navigate events and New chat resets the conversation', async () => {
    const user = userEvent.setup()
    fetchMock.mockImplementation(async () =>
      sse([
        { type: 'navigate', section: 'culture', path: '/culture?league=league-la-liga', label: 'Culture' },
        { type: 'text', text: 'Opening La Liga clubs.' },
        { type: 'done', source: 'gemini' },
      ]),
    )
    renderWidget()
    await user.click(screen.getByRole('button', { name: /chat with leo/i }))
    await user.click(screen.getByRole('button', { name: 'Take me to the Quiz' }))

    expect(await screen.findByText('Opening La Liga clubs.')).toBeInTheDocument()
    expect(window.location.hash).toBe('#/culture?league=league-la-liga')

    await user.click(screen.getByRole('button', { name: /new chat/i }))
    expect(screen.queryByText('Opening La Liga clubs.')).toBeNull()
    expect(screen.getByRole('button', { name: 'Explain offside' })).toBeInTheDocument()
  })

  it('shows a friendly message when the server is unreachable', async () => {
    const user = userEvent.setup()
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    renderWidget()
    await user.click(screen.getByRole('button', { name: /chat with leo/i }))
    await user.click(screen.getByRole('button', { name: 'Explain offside' }))
    expect(await screen.findByText(/couldn't reach the server/i)).toBeInTheDocument()
  })

  it('uses Spanish chips and passes the language when the site is in ES', async () => {
    const user = userEvent.setup()
    localStorage.setItem('soccerteaching.lang', 'es')
    fetchMock.mockImplementation(async () => sse([{ type: 'text', text: 'Hola' }, { type: 'done', source: 'faq' }]))
    renderWidget()
    await user.click(screen.getByRole('button', { name: /chatear con leo/i }))
    await user.click(screen.getByRole('button', { name: 'Explícame el fuera de juego' }))
    await screen.findByText('Hola')
    expect(fetchMock.mock.calls[0][1].headers['X-Locale']).toBe('es')
  })
})
