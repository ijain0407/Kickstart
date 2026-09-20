import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import Confetti from './Confetti.jsx'
import FieldPressButton from './FieldPressButton.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/** L3 modal: blurred scrim, bottom drawer, confetti and the XP award. */
export default function CelebrationDrawer() {
  const { t } = useI18n()
  const { celebration, dismissCelebration } = useApp()
  const { path, navigate } = useRouter()
  // The route the drawer opened on, so a later route change closes it.
  const openedOn = useRef(null)

  useEffect(() => {
    if (!celebration) {
      openedOn.current = null
      return undefined
    }
    if (openedOn.current === null) openedOn.current = path
    else if (openedOn.current !== path) dismissCelebration()
    const onKey = (e) => {
      if (e.key === 'Escape') dismissCelebration()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [celebration, dismissCelebration, path])

  // Dismissing is also what carries the learner onward, when the
  // reward was earned on a page they should leave.
  const close = () => {
    const next = celebration?.next
    dismissCelebration()
    if (next) navigate(next)
  }

  if (!celebration) return null

  return (
    <>
      <Confetti />
      <div
        className="scrim"
        role="dialog"
        aria-modal="true"
        aria-label={celebration.title}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
      >
        <div className="drawer">
          <div className="drawer__handle" />
          <div className="drawer__medal">
            <Icon name={celebration.icon ?? 'emoji_events'} fill />
          </div>
          <h2 className="t-headline-lg" style={{ marginTop: 16 }}>
            {celebration.title}
          </h2>
          <p className="t-body-md text-secondary" style={{ marginTop: 8 }}>
            {celebration.sub}
          </p>
          {celebration.xp ? (
            <div className="row row-2" style={{ justifyContent: 'center', marginTop: 16 }}>
              <span className="pill pill--gold">
                <Icon name="bolt" fill />
                +{celebration.xp} XP
              </span>
            </div>
          ) : null}
          <div className="stack stack-3" style={{ marginTop: 20 }}>
            {celebration.secondary ? (
              <FieldPressButton
                variant="primary"
                block
                autoFocus
                iconAfter="arrow_forward"
                onClick={() => {
                  dismissCelebration()
                  navigate(celebration.secondary.to)
                }}
              >
                {celebration.secondary.label}
              </FieldPressButton>
            ) : null}
            <FieldPressButton
              variant={celebration.secondary ? 'soft' : 'primary'}
              block
              autoFocus={!celebration.secondary}
              onClick={close}
            >
              {celebration.cta ?? t('quiz.celebrateCta')}
            </FieldPressButton>
          </div>
        </div>
      </div>
    </>
  )
}
