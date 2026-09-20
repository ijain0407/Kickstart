import { useState } from 'react'
import Icon from './Icon.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { fmt } from '../lib/fifa.js'

/**
 * A famous player's photo with its Commons licence line. Players without a free
 * photo (or whose file fails to load) get a neutral placeholder instead.
 */
export default function PlayerPhoto({ player }) {
  const { t } = useI18n()
  const [failed, setFailed] = useState(false)
  const { photo, name } = player

  if (!photo || failed) {
    return (
      <span className="fifa-photo fifa-photo--empty" role="img" aria-label={name}>
        <Icon name="person" fill />
      </span>
    )
  }

  return (
    <figure className="fifa-photo-figure">
      <img className="fifa-photo" src={photo.src} alt={name} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      {photo.author ? (
        <figcaption className="fifa-photo__credit">
          <a href={photo.page} target="_blank" rel="noreferrer">
            {fmt(t('fifa.photoCredit'), { author: photo.author, license: photo.license })}
          </a>
        </figcaption>
      ) : null}
    </figure>
  )
}
