import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api, getUserId, setUserId } from '../lib/api.js'

/* ============================================================
   AUTH STATE
   Google sign-in, which is optional everywhere. Signed out, the
   app runs on the anonymous id the browser generated and nothing
   behaves differently — this provider just reports `user: null`.

   `userId` is the effective id every API call is made under. It
   is the one number the rest of the app cares about:

     guest      the browser's anonymous id
     signed in  the id the account is bound to, which is whatever
                anonymous id it first signed in with

   So signing in doesn't migrate anything, and signing in on a
   second device adopts the first device's id — which is how
   progress follows a person around.
   ============================================================ */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [config, setConfig] = useState({ enabled: false, clientId: null })
  const [user, setUser] = useState(null)
  const [userId, setId] = useState(() => getUserId())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const live = useRef(true)

  useEffect(() => {
    live.current = true
    return () => {
      live.current = false
    }
  }, [])

  /** Adopt an identity returned by the auth API. */
  const adopt = useCallback((next) => {
    const id = next.userId ?? getUserId()
    setUserId(id)
    setId(id)
    setUser(next.user ?? null)
  }, [])

  // One round trip on boot: is sign-in available, and are we already in a
  // session? A failure here is not an error the user needs to see — it just
  // means they stay a guest.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [cfg, me] = await Promise.all([api('/auth/config'), api('/auth/me')])
        if (cancelled || !live.current) return
        setConfig(cfg)
        if (me.user) adopt(me)
      } catch {
        if (!cancelled && live.current) setConfig({ enabled: false, clientId: null })
      } finally {
        if (!cancelled && live.current) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [adopt])

  /**
   * Exchange the ID token Google handed the page for a session. The anonymous
   * id goes with it so a first-time account keeps the XP earned before it
   * signed up — Google has no separate sign-up step, the first sign-in is it.
   */
  const signIn = useCallback(
    async (credential) => {
      setError(null)
      try {
        adopt(await api('/auth/google', { method: 'POST', body: { credential, anonymousId: getUserId() } }))
        return true
      } catch (err) {
        if (live.current) setError(err)
        return false
      }
    },
    [adopt],
  )

  const signOut = useCallback(async () => {
    setError(null)
    try {
      // The server hands back a brand new anonymous id rather than the
      // account's, so signing out on a shared computer really does leave.
      adopt(await api('/auth/logout', { method: 'POST' }))
      return true
    } catch (err) {
      if (live.current) setError(err)
      return false
    }
  }, [adopt])

  const value = useMemo(
    () => ({
      enabled: config.enabled,
      clientId: config.clientId,
      user,
      userId,
      signedIn: Boolean(user),
      loading,
      error,
      signIn,
      signOut,
    }),
    [config, user, userId, loading, error, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
