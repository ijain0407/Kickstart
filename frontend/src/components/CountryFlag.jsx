import { useState } from 'react'

/**
 * The flag of the country a league is played in, from public/flags.
 *
 * Keyed by league id rather than the country name, because that name is
 * localised ("Germany" / "Alemania") and the filenames are not. A league with
 * no flag file — Serie A has none today — renders nothing rather than a broken
 * image, so the row just loses the flag and keeps its layout.
 */
const FLAG_BY_LEAGUE = {
  'league-premier-league': 'england',
  'league-la-liga': 'spain',
  'league-bundesliga': 'germany',
  'league-serie-a': 'italy',
  'league-ligue-1': 'france',
  'league-mls': 'united_states',
}

export default function CountryFlag({ leagueId, size = 20, className = '' }) {
  const [broken, setBroken] = useState(false)
  const file = FLAG_BY_LEAGUE[leagueId]

  if (!file || broken) return null

  return (
    <img
      className={`country-flag ${className}`.trim()}
      src={`/flags/${file}.png`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  )
}
