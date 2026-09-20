import Icon from './Icon.jsx'
import { toEmbedUrl } from '../lib/spotify.js'
import { useI18n } from '../i18n/I18nContext.jsx'

/**
 * Spotify's official iframe player, used for a chant's own recording.
 *
 * Listeners who aren't signed in to Spotify get the 30-second preview; signed-in
 * listeners get the full track. Either way it plays in the page. A link below
 * opens the track in Spotify for anyone who wants the whole thing.
 */
export default function SpotifyEmbed({ url, compact = false }) {
  const { t } = useI18n()
  const embed = toEmbedUrl(url)

  if (!embed) return null

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
