import Icon from '../components/Icon.jsx'
import WeekStrip from '../components/WeekStrip.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

const MILESTONES = [3, 7, 14, 30]

export default function Streak() {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const { streak, weekDone, today } = useApp()

  const trainedToday = weekDone.includes(today)
  const nextMilestone = MILESTONES.find((m) => m > streak) ?? MILESTONES.at(-1)
  const toGo = Math.max(0, nextMilestone - streak)

  return (
    <div className="page">
      <div className="row row-3">
        <button
          type="button"
          className="icon-btn icon-btn--outline"
          aria-label={t('common.back')}
          onClick={() => navigate('/')}
        >
          <Icon name="arrow_back" />
        </button>
        <h1 className="t-headline-lg grow">{t('streak.title')}</h1>
      </div>

      {/* ---- The number ---- */}
      <section className="streak-hero">
        <span className="streak-hero__flame">
          <Icon name="local_fire_department" fill />
        </span>
        <span className="streak-hero__n t-num">{streak}</span>
        <span className="t-headline-sm" style={{ color: 'var(--gold-badge-text)' }}>
          {t('streak.daysRunning')}
        </span>
        <p className="t-body-md" style={{ color: 'var(--gold-badge-text)' }}>
          {trainedToday ? t('streak.doneToday') : t('streak.notYetToday')}
        </p>
      </section>

      {/* ---- This week ---- */}
      <section className="card card--pad stack stack-3">
        <h2 className="t-headline-sm">{t('rail.thisWeek')}</h2>
        <WeekStrip />
      </section>

      {/* ---- Milestones ---- */}
      <section className="stack stack-3">
        <div className="section-head">
          <h2 className="t-headline-md">{t('streak.milestones')}</h2>
          <span className="pill pill--gold">
            {`${toGo} ${t('streak.toGo')}`}
          </span>
        </div>

        <div className="stack stack-2">
          {MILESTONES.map((days) => {
            const reached = streak >= days
            const pct = Math.min(100, Math.round((streak / days) * 100))
            return (
              <div className={`card card--pad badge-row ${reached ? 'is-earned' : ''}`.trim()} key={days}>
                <span className={`tile tile--circle ${reached ? 'tile--goldsolid' : 'tile--lavender'}`}>
                  <Icon name={reached ? 'local_fire_department' : 'lock'} fill={reached} />
                </span>

                <span className="grow stack stack-2">
                  <span className="row row-2" style={{ justifyContent: 'space-between' }}>
                    <span className="t-headline-sm">{`${days} ${t('rail.days')}`}</span>
                    <span className="t-num text-secondary" style={{ fontSize: 16 }}>
                      {pct}%
                    </span>
                  </span>
                  <span className="progress">
                    <span className="progress__fill" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="t-body-sm text-secondary">
                    {t(`streak.rewards.d${days}`)}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="inset-lavender">
        <span className="tile tile--lavender tile--circle">
          <Icon name="info" fill />
        </span>
        <p className="t-body-md">{t('streak.rules')}</p>
      </section>

      <FieldPressButton
        variant="primary"
        block
        iconAfter="arrow_forward"
        onClick={() => navigate('/path')}
      >
        {trainedToday ? t('streak.keepGoing') : t('streak.trainToday')}
      </FieldPressButton>
    </div>
  )
}
