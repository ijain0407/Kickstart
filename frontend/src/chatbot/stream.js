/**
 * POSTs to /api/chatbot/stream and calls onEvent for each server-sent event:
 *   { type: 'text', text } | { type: 'navigate', section, path, label }
 *   | { type: 'done', source } | { type: 'error', message }
 * Throws Error (with a friendly message when the server sent one) on failure.
 */
export async function streamChat({ message, history, lang, signal, onEvent }) {
  const res = await fetch('/api/chatbot/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Locale': lang },
    body: JSON.stringify({ message, history }),
    signal,
  })

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error?.message ?? 'Request failed')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const flush = (block) => {
    for (const line of block.split('\n')) {
      if (!line.startsWith('data:')) continue
      try {
        onEvent(JSON.parse(line.slice(5).trim()))
      } catch {
        /* ignore a malformed frame rather than killing the whole reply */
      }
    }
  }

  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() ?? ''
    blocks.forEach(flush)
  }
  if (buffer.trim()) flush(buffer)
}
