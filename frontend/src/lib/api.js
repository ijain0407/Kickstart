import { useCallback, useEffect, useRef, useState } from 'react'

/* ============================================================
   API CLIENT
   One helper for all three backends, which the gateway serves on
   a single origin under /api (see server/gateway.js).

   Every request carries the active language and an anonymous user
   id — Person D's progress endpoints require the id, the others
   ignore it.
   ============================================================ */

const USER_KEY = 'soccerteaching.userId'
let memoryUserId = null

/**
 * Adopt the id the auth API handed back: the account's id after signing in, a
 * fresh anonymous one after signing out. The server is authoritative either
 * way — while a session cookie is live the gateway overwrites X-User-Id with
 * the account id — so this only keeps the client honest about who it thinks
 * it is.
 */
export function setUserId(id) {
  memoryUserId = id ?? null
  try {
    if (id) localStorage.setItem(USER_KEY, id)
    else localStorage.removeItem(USER_KEY)
  } catch {
    /* the memory copy above still carries this session */
  }
}

export function getUserId() {
  try {
    let id = localStorage.getItem(USER_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(USER_KEY, id)
    }
    return id
  } catch {
    // Storage blocked: stay stable for this session at least.
    memoryUserId ??= crypto.randomUUID()
    return memoryUserId
  }
}


/** Today in the browser's own timezone — Person D's streak logic needs it. */
export function localDate(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function api(path, { method = 'GET', body, lang = 'en', signal } = {}) {
  const headers = {
    'X-User-Id': getUserId(),
    'X-Locale': lang,
    'X-Client-Date': localDate(),
  }
  try {
    headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    /* optional */
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      signal,
      // The session cookie is httpOnly and same-origin (both the Vite proxy
      // and the deployed gateway serve /api from this origin), so it rides
      // along without ever being readable from script.
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError(0, 'NETWORK', 'Network error')
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data?.error?.code ?? 'ERROR', data?.error?.message ?? 'Request failed')
  return data
}

/**
 * Minimal data hook: { data, error, loading, reload }.
 *
 * `load` is called with the active language and an AbortSignal. Pass anything
 * the request depends on in `deps` — the language is already included, so a
 * language switch refetches and the page re-renders in the new language.
 */
export function useResource(load, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [nonce, setNonce] = useState(0)
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    const controller = new AbortController()
    let live = true
    setState((s) => ({ ...s, loading: true, error: null }))

    loadRef
      .current(controller.signal)
      .then((data) => live && setState({ data, error: null, loading: false }))
      .catch((err) => {
        if (err.name === 'AbortError' || !live) return
        setState({ data: null, error: err, loading: false })
      })

    return () => {
      live = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, reload }
}
