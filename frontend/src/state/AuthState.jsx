import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getUserId, setUserId } from '../lib/api.js'

/* ============================================================
   AUTH STATE

   Signing in is optional. Anonymous visitors keep the id in
   localStorage and earn progress as before; signing in swaps
   that id for the account's, and whatever was earned first is
   carried over by the server on the first sign-in.

   `accounts` is false when the server has no DATABASE_URL, so
   the UI can hide sign-in rather than offer something that will
   always fail.
   ============================================================ */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accounts, setAccounts] = useState(false)
  const [loading, setLoading] = useState(true)

  /** Adopt the signed-in id, or fall back to a fresh anonymous one. */
  const applyUser = useCallback((next) => {
    setUser(next)
    if (next?.id) setUserId(next.id)
    else setUserId(null)
  }, [])

  useEffect(() => {
    let live = true
    api('/auth/session')
      .then((data) => {
        if (!live) return
        setAccounts(Boolean(data.accounts))
        if (data.user) applyUser(data.user)
      })
      .catch(() => {
        /* offline or no accounts — stay anonymous */
      })
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [applyUser])

  const register = useCallback(
    async ({ email, password, displayName }) => {
      const data = await api('/auth/register', {
        method: 'POST',
        // The anonymous id goes with the request so the server can carry
        // existing progress onto the new account.
        body: { email, password, displayName, anonymousId: getUserId() },
      })
      applyUser(data.user)
      return data
    },
    [applyUser],
  )

  const login = useCallback(
    async ({ email, password }) => {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email, password, anonymousId: getUserId() },
      })
      applyUser(data.user)
      return data
    },
    [applyUser],
  )

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } finally {
      // A fresh anonymous identity, so the next visitor on this device
      // doesn't inherit the last person's progress.
      applyUser(null)
    }
  }, [applyUser])

  const updateProfile = useCallback(
    async (patch) => {
      const data = await api('/auth/profile', { method: 'PATCH', body: patch })
      applyUser(data.user)
      return data.user
    },
    [applyUser],
  )

  const value = useMemo(
    () => ({ user, accounts, loading, register, login, logout, updateProfile }),
    [user, accounts, loading, register, login, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
