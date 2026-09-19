import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/* ============================================================
   ROUTER
   A ~60-line hash router. Hash routing keeps `npm run preview`
   and any static host working without a rewrite rule, which is
   all this five-view app needs.
   Supports a query string: #/culture?league=laliga
   ============================================================ */

const RouterContext = createContext(null)

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, search = ''] = raw.split('?')
  const query = Object.fromEntries(new URLSearchParams(search))
  return { path: path || '/', query }
}

export function RouterProvider({ children }) {
  const [route, setRoute] = useState(parseHash)

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash())
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((to) => {
    const next = to.startsWith('#') ? to : `#${to}`
    if (window.location.hash === next) {
      // Same target: still scroll up so a repeat tap feels responsive.
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    window.location.hash = next
  }, [])

  const value = useMemo(() => ({ ...route, navigate }), [route, navigate])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used inside <RouterProvider>')
  return ctx
}

export function Link({ to, className, children, ...rest }) {
  const { navigate } = useRouter()
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        // Let modified clicks open a new tab as usual.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
