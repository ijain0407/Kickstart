import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import XPBar from './XPBar.jsx'
import WeekStrip from './WeekStrip.jsx'
import PitchPass from './PitchPass.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'

/* ============================================================
   PROGRESS FLYOUT
   Desktop-only pop-out tabs pinned to the right edge. They sit
   above the page rather than taking a grid column, so split
   views (Field, Quiz) keep their full width and nothing can be
   covered up by a permanently docked rail.
   ============================================================ */

const TABS = [
  { id: 'progress', icon: 'monitoring', labelKey: 'rail.tabProgress' },
  { id: 'pass', icon: 'emoji_events', labelKey: 'rail.tabPass' },
]

export default function ProgressRail() {
  const { t } = useI18n()
  const { xp, xpPerLevel, streak, level } = useApp()
  const [openId, setOpenId] = useState(null)
  const rootRef = useRef(null)

  // Escape closes; so does a click anywhere outside the flyout. There is
  // no backdrop on purpose — the page stays usable while it is open.
  useEffect(() => {
    if (!openId) return undefined

    const onKey = (e) => {
      if (e.key === 'Escape') setOpenId(null)
    }
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpenId(null)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [openId])

  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id))

  return (
    <div className="flyout" ref={rootRef}>
      <div className={`flyout__tabs ${openId ? 'is-shifted' : ''}`.trim()}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`flyout__tab ${openId === tab.id ? 'is-open' : ''}`.trim()}
            aria-expanded={openId === tab.id}
            aria-controls="flyout-panel"
            onClick={() => toggle(tab.id)}
          >
            <Icon name={tab.icon} fill={openId === tab.id} />
            <span className="flyout__tab-label">{t(tab.labelKey)}</span>
          </button>
        ))}
      </div>

      <aside
        id="flyout-panel"
        className={`flyout__panel ${openId ? 'is-open' : ''}`.trim()}
        aria-hidden={!openId}
        aria-label={t('rail.progress')}
      >
        <div className="flyout__head">
          <h2 className="t-headline-sm grow">
            {openId === 'pass' ? t('home.passTitle') : t('rail.progress')}
          </h2>
          <button
            type="button"
            className="icon-btn"
            aria-label={t('rail.close')}
            onClick={() => setOpenId(null)}
          >
            <Icon name="close" />
          </button>
        </div>

        {openId === 'pass' ? (
          <PitchPass compact />
        ) : (
          <div className="card card--pad stack stack-4">
            <div className="section-head">
              <span className="t-label-meta text-secondary">{t('rail.streak')}</span>
              <span className="pill pill--gold">
                <Icon name="local_fire_department" fill />
                <span className="t-num" style={{ fontSize: 14 }}>
                  {streak}
                </span>
                {t('rail.days')}
              </span>
            </div>

            <XPBar
              value={xp}
              max={xpPerLevel}
              label={`${xp} / ${xpPerLevel} XP · ${t('appbar.levelLabel')} ${level}`}
            />

            <div className="stack stack-2">
              <span className="t-label-meta text-secondary">{t('rail.thisWeek')}</span>
              <WeekStrip />
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
