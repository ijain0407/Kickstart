import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import PitchBoard from '../components/PitchBoard.jsx'
import PlayerToken from '../components/PlayerToken.jsx'
import LangSwitch from '../components/LangSwitch.jsx'
import { FORMATIONS, getFormation, offsideLineTop, SQUAD_NAMES } from '../data/formations.js'
import { getPosition } from '../data/positions.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useRouter } from '../router.jsx'

export default function Field() {
  const { t, tr, lang } = useI18n()
  const { navigate } = useRouter()

  const [formationId, setFormationId] = useState('433')
  const [showNames, setShowNames] = useState(true)
  const [showZones, setShowZones] = useState(false)
  const [showOffside, setShowOffside] = useState(true)
  const [selectedNum, setSelectedNum] = useState(2)
  const [overlapping, setOverlapping] = useState(false)
  const overlapTimer = useRef(null)

  useEffect(() => () => clearTimeout(overlapTimer.current), [])

  const formation = getFormation(formationId)

  // The overlap run pushes the selected shirt up the flank and back
  // again, using the same token transition as a formation change.
  const players = useMemo(() => {
    if (!overlapping) return formation.players
    return formation.players.map((p) =>
      p.num === selectedNum ? { ...p, top: Math.max(14, p.top - 42) } : p,
    )
  }, [formation, overlapping, selectedNum])

  const playOverlap = () => {
    clearTimeout(overlapTimer.current)
    setOverlapping(true)
    overlapTimer.current = setTimeout(() => setOverlapping(false), 1500)
  }

  // The selected shirt may not exist in a new formation — fall back to
  // the nearest available number so the inspector is never empty.
  const selected = useMemo(
    () => players.find((p) => p.num === selectedNum) ?? players[0],
    [players, selectedNum],
  )

  const position = getPosition(selected.code)
  const offsideTop = offsideLineTop(players)

  const speak = () => {
    if (!('speechSynthesis' in window)) return
    const text = `${tr(position.name)}. ${position.duties.map((d) => tr(d)).join('. ')}`
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang === 'es' ? 'es-ES' : 'en-GB'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  return (
    <div className="page">
      {/* ---- Header ---- */}
      <div className="row row-3">
        <Icon name="sports_soccer" fill style={{ fontSize: 26, color: 'var(--pitch-green)' }} />
        <h1 className="t-headline-lg grow">{t('field.title')}</h1>
        <span className="pill pill--green">● {t('field.pitchActive')}</span>
      </div>

      {/* ---- Formation chips ---- */}
      <div className="chip-row" role="group" aria-label={t('field.formationLabel')}>
        {FORMATIONS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chip ${f.id === formationId ? 'is-active' : ''}`.trim()}
            aria-pressed={f.id === formationId}
            onClick={() => setFormationId(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ---- Toggles ---- */}
      <div className="chip-row">
        <button
          type="button"
          className={`chip ${showNames ? 'chip--on' : ''}`.trim()}
          aria-pressed={showNames}
          onClick={() => setShowNames((v) => !v)}
        >
          <Icon name="badge" />
          {`${t('field.names')}: ${showNames ? t('field.on') : t('field.off')}`}
        </button>

        <button
          type="button"
          className={`chip ${showZones ? 'chip--on' : ''}`.trim()}
          aria-pressed={showZones}
          onClick={() => setShowZones((v) => !v)}
        >
          <Icon name="grid_on" />
          {`${t('field.zones')}: ${showZones ? t('field.on') : t('field.off')}`}
        </button>

        <button
          type="button"
          className={`chip ${showOffside ? 'chip--amber' : ''}`.trim()}
          aria-pressed={showOffside}
          onClick={() => setShowOffside((v) => !v)}
        >
          <Icon name="flag" />
          {`${t('field.offside')}: ${showOffside ? t('field.on') : t('field.off')}`}
        </button>

        <LangSwitch />
      </div>

      <div className="split-field">
        {/* ---- The board ---- */}
        <div className="split-field__pitch">
          <PitchBoard
            className="field-pitch"
            showZones={showZones}
            offside={showOffside ? offsideTop : null}
            offsideLabel={showOffside ? t('field.onside') : undefined}
            hint={t('field.tapHint')}
          >
            {players.map((p) => (
              <PlayerToken
                key={p.num}
                player={p}
                name={SQUAD_NAMES[p.num]}
                showName={showNames}
                selected={p.num === selected.num}
                onSelect={() => setSelectedNum(p.num)}
                label={`${tr(getPosition(p.code).name)} — ${t('field.numberShort')} ${p.num}`}
              />
            ))}
          </PitchBoard>
        </div>

        {/* ---- Inspector ---- */}
        <article className="card card--pad stack stack-4">
          <div className="row row-3">
            <span className="pos-badge">{selected.code}</span>
            <div className="grow stack stack-1">
              <h2 className="t-headline-md">
                {`${tr(position.name)} (${selected.code})`}
              </h2>
              <span className="t-body-md text-secondary">
                {`${t('field.numberShort')} ${selected.num}`}
              </span>
            </div>
            <button type="button" className="icon-btn icon-btn--outline" onClick={speak} aria-label={t('field.speakLabel')}>
              <Icon name="volume_up" />
            </button>
          </div>

          <p className="t-body-md" style={{ color: 'var(--moss)', fontWeight: 600 }}>
            {tr(position.unit)}
          </p>

          <div className="duties">
            <span className="t-label-meta text-secondary">{t('field.keyDuties')}</span>
            {position.duties.map((duty, i) => (
              <p className="duties__item" key={i}>
                <Icon name="check_circle" fill />
                <span>{tr(duty)}</span>
              </p>
            ))}
          </div>

          <p className="t-body-md text-secondary">
            <strong style={{ color: 'var(--text-primary)' }}>{t('field.famous')}</strong>{' '}
            {position.famous}
          </p>

          <FieldPressButton
            variant="primary"
            block
            icon="play_arrow"
            iconFill
            onClick={playOverlap}
          >
            {t('field.playOverlap')}
          </FieldPressButton>

          <FieldPressButton
            variant="soft"
            block
            icon="swap_horiz"
            onClick={() => setFormationId(formationId === '442' ? '433' : '442')}
          >
            {t('field.trySwitch')}
          </FieldPressButton>

          <FieldPressButton variant="gold" block icon="sports_soccer" onClick={() => navigate('/play')}>
            {t('field.playMatch')}
          </FieldPressButton>
        </article>
      </div>
    </div>
  )
}
