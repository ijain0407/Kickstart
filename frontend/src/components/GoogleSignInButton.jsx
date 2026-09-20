import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useAuth } from '../state/AuthState.jsx'

/* ============================================================
   GOOGLE SIGN-IN BUTTON
   Google Identity Services renders its own button into a div we
   hand it, and calls back with a signed ID token. The token goes
   straight to our API, which verifies it — nothing here is
   trusted client-side.

   The script is third-party and blockable, so every failure path
   ends in a plain message rather than a broken page: an ad
   blocker, an offline machine or a test environment all just see
   "sign-in unavailable".
   ============================================================ */

const GSI_SRC = 'https://accounts.google.com/gsi/client'

let scriptPromise = null

/** Loads the GIS script once per page, whoever asks first. */
function loadGsi() {
  if (typeof document === 'undefined') return Promise.reject(new Error('No document'))
  if (window.google?.accounts?.id) return Promise.resolve(window.google)

  scriptPromise ??= new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`)
    const script = existing ?? document.createElement('script')
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', () =>
      window.google?.accounts?.id
        ? resolve(window.google)
        : reject(new Error('Google Identity Services loaded without an id client')),
    )
    script.addEventListener('error', () => {
      // Let a later attempt retry rather than caching the failure forever.
      scriptPromise = null
      reject(new Error('Could not reach Google Identity Services'))
    })
    if (!existing) document.head.append(script)
  })

  return scriptPromise
}

export default function GoogleSignInButton({ onSignedIn }) {
  const { t, lang } = useI18n()
  const { clientId, enabled, signIn } = useAuth()
  const holder = useRef(null)
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)

  // `signIn` and `onSignedIn` are read through a ref: GIS keeps whichever
  // callback it was initialized with, and re-initializing on every render
  // would tear the rendered button down under the user's cursor.
  const handler = useRef(null)
  handler.current = async ({ credential }) => {
    if (!credential) return
    setBusy(true)
    const ok = await signIn(credential)
    setBusy(false)
    if (ok) onSignedIn?.()
  }

  useEffect(() => {
    if (!enabled || !clientId) return undefined
    let cancelled = false

    loadGsi()
      .then((google) => {
        if (cancelled || !holder.current) return
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => handler.current?.(response),
          // The prompt is opt-in here: a full-page overlay the moment someone
          // opens their profile would be hostile, and sign-in is optional.
          auto_select: false,
          cancel_on_tap_outside: true,
        })
        holder.current.replaceChildren()
        google.accounts.id.renderButton(holder.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          locale: lang === 'es' ? 'es' : 'en',
        })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [enabled, clientId, lang])

  if (!enabled) return <p className="t-body-sm text-secondary">{t('auth.disabled')}</p>
  if (failed) return <p className="t-body-sm text-secondary">{t('auth.unavailable')}</p>

  return (
    <div className="gsi">
      <div ref={holder} className="gsi__button" />
      {busy ? (
        <span className="t-body-sm text-secondary" role="status">
          {t('auth.signingIn')}
        </span>
      ) : null}
    </div>
  )
}
