import { useState } from 'react'
import Icon from './Icon.jsx'
import { toEmbedUrl } from '../lib/spotify.js'
import { useI18n } from '../i18n/I18nContext.jsx'

/**
 * Spotify's official iframe player. It loads only once the learner asks for it,
 * so opening a club page doesn't pull in a third-party frame per chant — and a
 * demo machine on a slow connection isn't fetching several at once.
 *
 * Listeners who aren't signed in to Spotify get the 30-second preview; signed-in
 * listeners get the full track. Either way it plays in the page.
 */
export default function SpotifyEmbed({ url, compact = false, autoLoad = false }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(autoLoad)
  const embed = toEmbedUrl(url)

  if (!embed) return null

  if (!open) {
    return (
      <button type="button" className="fp fp--tertiary spotify-cue" onClick={() => setOpen(true)}>
        <Icon name="play_circle" fill />
        {t('culture.playOnSpotify')}
      </button>
    )
  }

  return (
    <div className="spotify-embed">
      <iframe
        title={t('culture.spotifyPlayer')}
        src={embed}
        width="100%"
        height={compact ? 152 : 352}
        frameBorder="0"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
      <a className="chant__source" href={url} target="_blank" rel="noopener noreferrer">
        <Icon name="open_in_new" />
        {t('culture.openInSpotify')}
      </a>
    </div>
  )
}
