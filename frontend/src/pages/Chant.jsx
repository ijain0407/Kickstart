import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import { getLeague } from '../data/leagues.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/**
 * Chant practice. Because published lyrics are not reproduced here, the
 * drill teaches the three layers instead: what the stand sings, what it
 * literally means, and why it matters. Drop licensed lines into the
 * `layer1` fields in src/data/leagues.js and they appear as the call.
 */
export default function Chant() {
  const { t, tr, lang } = useI18n()
  const { query, navigate } = useRouter()
  const { masterChant, addXp, celebrate } = useApp()

  const league = getLeague(query.league ?? 'premier')
  const chant = league.chants.find((c) => c.id === query.id) ?? league.chants[0]

  const [playing, setPlaying] = useState(false)
  const [revealed, setRevealed] = useState(1)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => setRevealed(1), [chant.id])

  const togglePlay = () => {
    setPlaying((p) => {
      const next = !p
      clearTimeout(timer.current)
      if (next) timer.current = setTimeout(() => setPlaying(false), 6000)
      return next
    })
  }

  const speak = () => {
    if (!('speechSynthesis' in window)) return
    const utter = new SpeechSynthesisUtterance(tr(chant.layer2))
    utter.lang = lang === 'es' ? 'es-ES' : 'en-GB'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  const master = () => {
    masterChant()
    addXp(25)
    celebrate({
      title: chant.title,
      sub: t('chant.mastered'),
      xp: 25,
      icon: 'mic',
      next: `/culture?league=${league.id}`,
    })
  }

  const LAYERS = [
    { n: 1, cls: 'layer--1', label: t('culture.layer1'), text: tr(chant.layer1), note: t('culture.lyricsPlaceholder') },
    { n: 2, cls: 'layer--2', label: t('culture.layer2'), text: tr(chant.layer2) },
    { n: 3, cls: 'layer--3', label: t('culture.layer3'), text: tr(chant.layer3), note: tr(chant.footnote) },
  ]

  return (
    <div className="page">
      {/* ---- Header ---- */}
      <div className="row row-3">
        <button
          type="button"
          className="icon-btn icon-btn--outline"
          aria-label={t('common.back')}
          onClick={() => navigate(`/culture?league=${league.id}`)}
        >
          <Icon name="arrow_back" />
        </button>
        <div className="grow stack stack-1">
          <span className="t-label-meta text-secondary">{t('chant.kicker')}</span>
          <h1 className="t-headline-md">{chant.title}</h1>
        </div>
      </div>

      <div className="row row-2 wrap">
        <span className="pill pill--lavender">{league.club.name}</span>
        <span className="pill pill--grey">{league.club.stadium}</span>
        <span className="pill pill--gold">{t('culture.chorusXp')}</span>
      </div>

      {/* ---- Playback ---- */}
      <div className="audio-bar">
        <button
          type="button"
          className="audio-bar__play"
          onClick={togglePlay}
          aria-label={tr(chant.audioLabel)}
          aria-pressed={playing}
        >
          <Icon name={playing ? 'pause' : 'play_arrow'} fill />
        </button>
        <span className="grow t-body-md text-secondary">{tr(chant.audioLabel)}</span>
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

        {LAYERS.slice(0, revealed).map((layer) => (
          <section className={`layer ${layer.cls}`} key={layer.n}>
            <span className="t-label-meta text-secondary">{layer.label}</span>
            <blockquote className="layer__quote">{layer.text}</blockquote>
            {layer.note ? <p className="placeholder-note">{layer.note}</p> : null}
          </section>
        ))}

        {revealed < 3 ? (
          <FieldPressButton
            variant="soft"
            block
            icon="layers"
            onClick={() => setRevealed((r) => r + 1)}
          >
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

      <FieldPressButton
        variant="primary"
        block
        icon="check"
        onClick={master}
        disabled={revealed < 3}
      >
        {t('chant.markMastered')}
      </FieldPressButton>

      {revealed < 3 ? (
        <p className="quote-foot">{t('chant.revealFirst')}</p>
      ) : null}
    </div>
  )
}
