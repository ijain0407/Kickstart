import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import DataState from '../components/DataState.jsx'
import { api, useResource } from '../lib/api.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/**
 * Chant practice: the three layers revealed one at a time, then mastered for XP.
 * Content comes from the culture API — layer 1 is the line the stand actually
 * sings, in its own language, so it is never translated or replaced.
 */
export default function Chant() {
  const { t, lang } = useI18n()
  const { query, navigate } = useRouter()
  const { masterChant, celebrate } = useApp()

  const cultureId = query.club ?? 'culture-liverpool'
  const { data, loading, error, reload } = useResource(
    (signal) => api(`/culture/${cultureId}`, { lang, signal }),
    [lang, cultureId],
  )

  const card = data?.card
  const chant = card?.chants.find((c) => c.id === query.id) ?? card?.chants[0] ?? null

  const [playing, setPlaying] = useState(false)
  const [revealed, setRevealed] = useState(1)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => setRevealed(1), [chant?.id])

  const togglePlay = () => {
    setPlaying((p) => {
      const next = !p
      clearTimeout(timer.current)
      // No audio asset ships with the demo; the bars run for a beat and settle.
      if (next) timer.current = setTimeout(() => setPlaying(false), 6000)
      return next
    })
  }

  /** Read the original line aloud, in the language it's sung in. */
  const speak = () => {
    if (!chant || !('speechSynthesis' in window)) return
    const utter = new SpeechSynthesisUtterance(chant.original.text)
    utter.lang = { es: 'es-ES', ca: 'ca-ES', it: 'it-IT', de: 'de-DE', bar: 'de-DE' }[chant.original.lang] ?? 'en-GB'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  const master = () => {
    // Chant ids are free-form on the progress API; scope it by club so two
    // clubs can't collide on a shared chant id.
    masterChant(`${card.id}/${chant.id}`)
    celebrate({
      title: chant.title,
      sub: t('chant.mastered'),
      xp: 25,
      icon: 'mic',
      next: `/culture?league=${card.leagueId}&club=${card.id}`,
    })
  }

  const audioLabel = t('culture.audio')

  return (
    <div className="page">
      <DataState loading={loading} error={error} onRetry={reload}>
        {chant ? (
          <>
            {/* ---- Header ---- */}
            <div className="row row-3">
              <button
                type="button"
                className="icon-btn icon-btn--outline"
                aria-label={t('common.back')}
                onClick={() => navigate(`/culture?league=${card.leagueId}&club=${card.id}`)}
              >
                <Icon name="arrow_back" />
              </button>
              <div className="grow stack stack-1">
                <span className="t-label-meta text-secondary">{t('chant.kicker')}</span>
                <h1 className="t-headline-md">{chant.title}</h1>
              </div>
            </div>

            <div className="row row-2 wrap">
              <span className="pill pill--lavender">{card.club}</span>
              {card.stadium?.name ? <span className="pill pill--grey">{card.stadium.name}</span> : null}
              <span className="pill pill--gold">{t('culture.chorusXp')}</span>
            </div>

            {/* ---- Playback ---- */}
            <div className="audio-bar">
              <button
                type="button"
                className="audio-bar__play"
                onClick={togglePlay}
                aria-label={audioLabel}
                aria-pressed={playing}
              >
                <Icon name={playing ? 'pause' : 'play_arrow'} fill />
              </button>
              <span className="grow t-body-md text-secondary">{audioLabel}</span>
              <span className={`eq ${playing ? 'is-playing' : ''}`.trim()} aria-hidden="true">
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={i} />
                ))}
              </span>
            </div>

            {/* ---- The three layers, revealed one at a time ---- */}
            <section className="stack stack-3">
              <div className="section-head">
                <h2 className="t-headline-sm">{t('chant.layersTitle')}</h2>
                <span className="pill pill--grey">{`${revealed} / 3`}</span>
              </div>

              {[
                { n: 1, cls: 'layer--1', label: t('culture.layer1'), text: chant.original.text, lang: chant.original.lang },
                { n: 2, cls: 'layer--2', label: t('culture.layer2'), text: chant.literal },
                { n: 3, cls: 'layer--3', label: t('culture.layer3'), text: chant.meaning, note: chant.when },
              ]
                .slice(0, revealed)
                .map((layer) => (
                  <section className={`layer ${layer.cls}`} key={layer.n}>
                    <span className="t-label-meta text-secondary">{layer.label}</span>
                    <blockquote className="layer__quote" lang={layer.lang}>
                      {layer.text}
                    </blockquote>
                    {layer.note ? <p className="placeholder-note">{layer.note}</p> : null}
                  </section>
                ))}

              {revealed < 3 ? (
                <FieldPressButton variant="soft" block icon="layers" onClick={() => setRevealed((r) => r + 1)}>
                  {t('chant.revealNext')}
                </FieldPressButton>
              ) : null}
            </section>

            {/* ---- Repeat drill ---- */}
            <section className="card card--pad stack stack-3">
              <div className="row row-3">
                <span className="tile tile--greensolid tile--circle">
                  <Icon name="mic" fill />
                </span>
                <div className="grow stack stack-1">
                  <h2 className="t-headline-sm">{t('chant.repeatTitle')}</h2>
                  <p className="t-body-md text-secondary">{t('chant.repeatBody')}</p>
                </div>
              </div>

              <FieldPressButton variant="secondary" block icon="volume_up" onClick={speak}>
                {t('chant.hearMeaning')}
              </FieldPressButton>
            </section>

            <FieldPressButton variant="primary" block icon="check" onClick={master} disabled={revealed < 3}>
              {t('chant.markMastered')}
            </FieldPressButton>

            {revealed < 3 ? <p className="quote-foot">{t('chant.revealFirst')}</p> : null}
          </>
        ) : null}
      </DataState>
    </div>
  )
}
