import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { dictionary, LANGS } from './dictionary.js'

const STORAGE_KEY = 'soccerteaching.lang'

const I18nContext = createContext(null)

function readStoredLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && LANGS.includes(saved)) return saved
  } catch {
    /* private mode / blocked storage — fall through to the default */
  }
  // Fall back to the browser's language when we have a match for it.
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es')) {
    return 'es'
  }
  return 'en'
}

/** Walk a dotted path through the active dictionary, e.g. t('home.heroTitle'). */
function resolve(tree, path) {
  return path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), tree)
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* nothing to do — the switch still works for this session */
    }
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next) => {
    if (LANGS.includes(next)) setLangState(next)
  }, [])

  const toggleLang = useCallback(() => {
    setLangState((cur) => (cur === 'en' ? 'es' : 'en'))
  }, [])

  const t = useCallback(
    (path) => {
      const hit = resolve(dictionary[lang], path)
      if (hit !== undefined) return hit
      // Missing a translation should degrade to English, never to a blank.
      const fallback = resolve(dictionary.en, path)
      if (fallback !== undefined) return fallback
      if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${path}`)
      return path
    },
    [lang],
  )

  /** Resolve an inline { en, es } content pair from the data files. */
  const tr = useCallback((pair) => (pair == null ? '' : pair[lang] ?? pair.en ?? ''), [lang])

  const value = useMemo(() => ({ lang, setLang, toggleLang, t, tr }), [lang, setLang, toggleLang, t, tr])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
