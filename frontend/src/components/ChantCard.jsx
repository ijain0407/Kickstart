import { useState } from 'react'
import Icon from './Icon.jsx'
import FieldPressButton from './FieldPressButton.jsx'
import SpotifyEmbed from './SpotifyEmbed.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

/**
 * The expanded chant card: the recording first, then the three translation
 * layers. Layer 1 is the line the stand actually sings, kept in the language
 * it's sung in.
 */
export default function ChantCard({ chant, onLearn }) {
  const { t, tr } = useI18n()
  const [saved, setSaved] = useState(false)

  return (
    <article className="card chant">
      <header className="chant__head">
        <div className="grow stack stack-1">
          <span className="t-label-meta text-secondary">{tr(chant.kicker)}</span>
          <h3 className="t-headline-md">{chant.title}</h3>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={t('culture.bookmark')}
          aria-pressed={saved}
          onClick={() => setSaved((s) => !s)}
        >
          <Icon name="bookmark" fill={saved} style={{ color: saved ? '#f59e0b' : undefined }} />
        </button>
      </header>

      <div className="chant__body">
        {/* The recording leads the card: hear it, then read why it matters. */}
        {chant.spotifyUrl ? <SpotifyEmbed url={chant.spotifyUrl} compact /> : null}

        {chant.sourceUrl && !chant.spotifyUrl ? (
          <a className="chant__source" href={chant.sourceUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="open_in_new" />
            {t('culture.listenElsewhere')}
          </a>
        ) : null}

        <section className="layer layer--1">
          <span className="t-label-meta text-secondary">{t('culture.layer1')}</span>
          {/* The original is never translated — it renders in the language the
              stand actually sings, tagged with `lang` so screen readers switch voice. */}
          <blockquote className="layer__quote" lang={chant.layer1Lang}>
            {tr(chant.layer1)}
          </blockquote>
          {chant.layer1Note ? <p className="placeholder-note">{tr(chant.layer1Note)}</p> : null}
        </section>

        <section className="layer layer--2">
          <span className="t-label-meta" style={{ color: '#0369a1' }}>
            {t('culture.layer2')}
          </span>
          <blockquote className="layer__quote">{tr(chant.layer2)}</blockquote>
        </section>

        <section className="layer layer--3">
          <div className="row row-2" style={{ justifyContent: 'space-between' }}>
            <span className="t-label-meta" style={{ color: 'var(--gold-badge-text)' }}>
              {t('culture.layer3')}
            </span>
            <span className="pill pill--white">
              <Icon name="favorite" fill style={{ color: '#ef4444' }} />
              {t('culture.fanSoul')}
            </span>
          </div>
          <p className="t-body-md">{tr(chant.layer3)}</p>
          <p className="placeholder-note">{tr(chant.footnote)}</p>
        </section>

        <FieldPressButton variant="primary" block icon="mic" onClick={onLearn}>
          {`${t('culture.learnChorus')}  ${t('culture.chorusXp')}`}
        </FieldPressButton>
      </div>
    </article>
  )
}
