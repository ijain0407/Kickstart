import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { toEmbedUrl } from '../lib/spotify.js'
import { useI18n } from '../i18n/I18nContext.jsx'

const API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'
let apiReadyPromise = null

/** Loads Spotify's IFrame API once per page load; every embed shares the promise. */
function loadSpotifyIframeApi() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.__spotifyIframeApi) return Promise.resolve(window.__spotifyIframeApi)
  if (apiReadyPromise) return apiReadyPromise

  apiReadyPromise = new Promise((resolve) => {
    const previous = window.onSpotifyIframeApiReady
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      window.__spotifyIframeApi = IFrameAPI
      previous?.(IFrameAPI)
      resolve(IFrameAPI)
    }
    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const script = document.createElement('script')
      script.src = API_SRC
      script.async = true
      document.body.appendChild(script)
    }
  })
  return apiReadyPromise
}

/**
 * Spotify's official iframe player, used for a chant's own recording.
 *
 * Listeners who aren't signed in to Spotify get the 30-second preview; signed-in
 * listeners get the full track. The IFrame API gives us a controller so an
 * explicit play/pause button sits above the embed too, not just Spotify's own.
 */
export default function SpotifyEmbed({ url, compact = false }) {
  const { t } = useI18n()
  const embed = toEmbedUrl(url)
  const hostRef = useRef(null)
  const controllerRef = useRef(null)
  const [isPaused, setIsPaused] = useState(true)
  const [controllerReady, setControllerReady] = useState(false)

  useEffect(() => {
    if (!embed || !hostRef.current) return
    let disposed = false
    setControllerReady(false)
    setIsPaused(true)

    const [, , , , kind, id] = embed.split('/')
    const uri = `spotify:${kind}:${id}`

    loadSpotifyIframeApi().then((IFrameAPI) => {
      if (disposed || !IFrameAPI || !hostRef.current) return
      IFrameAPI.createController(hostRef.current, { uri, width: '100%', height: compact ? 152 : 352 }, (controller) => {
        if (disposed) {
          controller.destroy?.()
          return
        }
        controllerRef.current = controller
        controller.addListener('ready', () => setControllerReady(true))
        controller.addListener('playback_update', (e) => setIsPaused(Boolean(e.data?.isPaused)))
      })
    })

    return () => {
      disposed = true
      controllerRef.current?.destroy?.()
      controllerRef.current = null
    }
  }, [embed, compact])

  if (!embed) return null

  return (
    <div className="spotify-embed">
      <div className="spotify-embed__frame" ref={hostRef} style={{ minHeight: compact ? 152 : 352 }} />

      {controllerReady ? (
        <button
          type="button"
          className="spotify-embed__toggle"
          onClick={() => controllerRef.current?.togglePlay()}
        >
          <Icon name={isPaused ? 'play_arrow' : 'pause'} fill />
          {t(isPaused ? 'culture.spotifyPlay' : 'culture.spotifyPause')}
        </button>
      ) : null}

      <a className="chant__source" href={url} target="_blank" rel="noopener noreferrer">
        <Icon name="open_in_new" />
        {t('culture.openInSpotify')}
      </a>
    </div>
  )
}
