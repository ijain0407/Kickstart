import { useState } from 'react'
import Icon from './Icon.jsx'

/** League badge from public/league-logos; falls back to a trophy if the file is missing. */
export default function LeagueLogo({ leagueId, size = 44 }) {
  const [broken, setBroken] = useState(false)

  if (broken) {
    return (
      <span className="tile tile--lavender tile--circle">
        <Icon name="emoji_events" fill />
      </span>
    )
  }
  return (
    <img
      className="league-logo"
      src={`/league-logos/${leagueId}.png`}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  )
}
