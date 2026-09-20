/* ============================================================
   SPOTIFY EMBEDS
   Spotify publishes an official iframe player, so a chant can play
   in the page instead of sending people to another site. Paste any
   normal share link into `spotifyUrl` and it's converted here.

   Accepted shapes:
     https://open.spotify.com/track/abc123?si=…
     https://open.spotify.com/intl-es/playlist/abc123
     spotify:track:abc123
   ============================================================ */

const EMBEDDABLE = ['track', 'playlist', 'album', 'episode', 'show', 'artist']

/**
 * A share link or URI -> the embed URL for the iframe player.
 * Returns null for anything that isn't a Spotify link, so callers can decide
 * what to do rather than rendering a broken frame.
 */
export function toEmbedUrl(input) {
  if (typeof input !== 'string' || !input.trim()) return null
  const value = input.trim()

  // spotify:track:abc123
  const uri = value.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/)
  if (uri && EMBEDDABLE.includes(uri[1])) return `https://open.spotify.com/embed/${uri[1]}/${uri[2]}`

  let url
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (!/(^|\.)spotify\.com$/.test(url.hostname)) return null

  // Localised links carry a prefix: /intl-es/track/abc123
  const parts = url.pathname.split('/').filter(Boolean)
  const start = parts[0]?.startsWith('intl-') || parts[0] === 'embed' ? 1 : 0
  const [kind, id] = [parts[start], parts[start + 1]]

  if (!EMBEDDABLE.includes(kind) || !id) return null
  return `https://open.spotify.com/embed/${kind}/${id}`
}

/** What the embed is, for labelling: 'track', 'playlist', … */
export function embedKind(input) {
  const embed = toEmbedUrl(input)
  return embed ? embed.split('/')[4] : null
}
