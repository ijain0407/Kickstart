import Icon from './Icon.jsx'
import { Link } from '../router.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'

const STEPS = [
  { id: 'newFan', icon: 'check', to: '/path' },
  { id: 'rules', icon: 'menu_book', to: '/lesson?id=1.2' },
  { id: 'pickLeague', icon: 'emoji_events', to: '/quiz' },
  { id: 'clubLove', icon: 'favorite', to: '/culture' },
]

/**
 * The four-stop roadmap. Stops advance as the learner finishes the
 * matcher and starts collecting lessons, so it is derived, not fixed.
 */
export default function PitchPass({ compact = false }) {
  const { t } = useI18n()
  const { completedLessons, quizDone } = useApp()

  const reached =
    (completedLessons.length > 0 ? 1 : 0) +
    (completedLessons.length >= 3 ? 1 : 0) +
    (quizDone ? 1 : 0)

  return (
    <div className="card card--pad stack stack-4">
      <div className="section-head">
        {/* In the flyout the panel header already names this card. */}
        <div className="stack stack-1">
          {!compact ? <h3 className="t-headline-md">{t('home.passTitle')}</h3> : null}
          {!compact ? <p className="t-body-md text-secondary">{t('home.passSub')}</p> : null}
        </div>
        <span className="row row-2" style={{ gap: 6 }}>
          <Icon name="emoji_events" fill style={{ color: 'var(--gold)', fontSize: 20 }} />
          <span className="t-num" style={{ fontSize: 22 }}>
            {t('home.passLevel')}
          </span>
        </span>
      </div>

      <ol className="roadmap">
        {STEPS.map((step, i) => {
          const done = i < reached
          const current = i === reached
          return (
            <li key={step.id}>
              <Link
                to={step.to}
                className={`roadmap__step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`.trim()}
              >
                <span className="roadmap__badge">
                  <Icon name={done ? 'check' : step.icon} fill={done || current} />
                </span>
                <span className="roadmap__label">{t(`home.steps.${step.id}`)}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
