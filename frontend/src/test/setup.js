import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { createGateway } from '../../../server/gateway.js'

/**
 * These tests run against the real API gateway — all three workstreams' routers
 * on one app — rather than a hand-written fake. If a teammate changes a payload,
 * these tests fail, which is exactly what we want from an integration suite.
 *
 * The pages fetch relative URLs ('/api/…') the way the browser does behind the
 * Vite proxy; jsdom has no origin to resolve those against, so fetch is pointed
 * at the test server here. Nothing else about the request changes.
 */
let server
let origin

beforeAll(async () => {
  server = createGateway().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  origin = `http://127.0.0.1:${server.address().port}`

  const realFetch = globalThis.fetch

  /**
   * Two adjustments, both artefacts of jsdom rather than app behaviour:
   * the relative URL gets the test server's origin, and the AbortSignal is
   * dropped because Node's fetch rejects jsdom's implementation of it. Abort
   * is still honoured afterwards, so cancelled requests behave as they would
   * in a browser.
   */
  const proxied = async (input, init = {}) => {
    const url = typeof input === 'string' && input.startsWith('/') ? `${origin}${input}` : input
    const { signal, ...rest } = init
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const res = await realFetch(url, rest)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return res
  }

  globalThis.fetch = proxied
  window.fetch = proxied
})

afterEach(() => {
  cleanup()
  try {
    window.localStorage.clear()
  } catch {
    /* storage unavailable */
  }
})

afterAll(() => {
  server?.close()
})

// jsdom lacks these; components read them for motion and speech.
window.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
})
window.scrollTo ??= () => {}
