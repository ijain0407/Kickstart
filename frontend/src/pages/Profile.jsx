import { useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import XPBar from '../components/XPBar.jsx'
import LangSwitch from '../components/LangSwitch.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'
import { LESSONS } from '../data/lessons.js'
import { scoreLeagues } from '../data/quiz.js'
import { RANKED_LEAGUES } from '../data/leagues.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useAuth } from '../state/AuthState.jsx'
import { useRouter } from '../router.jsx'

/** Achievements are derived from progress — nothing extra is stored. */
function useAchievements() {
  const { completedLessons, streak, chantsMastered, quizDone, level } = useApp()

  return useMemo(
    () => [
      {
        id: 'firstWhistle',
        icon: 'sports',
        earned: completedLessons.length >= 1,
      },
      { id: 'tactics', icon: 'insights', earned: completedLessons.includes('1.2') },
      { id: 'weekOne', icon: 'local_fire_department', earned: streak >= 7 },
      { id: 'terrace', icon: 'campaign', earned: chantsMastered >= 2 },
      { id: 'matched', icon: 'emoji_events', earned: quizDone },
      { id: 'enthusiast', icon: 'military_tech', earned: level >= 2 },
    ],
    [completedLessons, streak, chantsMastered, quizDone, level],
  )
}

/** Two letters from a display name, for when Google sends no photo. */
function initials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ''
  const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0]
  return letters.toUpperCase()
}

export default function Profile() {
  const { t, tr } = useI18n()
  const { navigate } = useRouter()
  const app = useApp()
  const { user, signedIn, signOut, loading: authLoading, error: authError } = useAuth()
  const { xp, xpPerLevel, level, streak, completedLessons, chantsMastered, quizAnswers, quizDone } = app

  const achievements = useAchievements()
  const [confirmingReset, setConfirmingReset] = useState(false)

  const topLeague = useMemo(() => {
    if (!quizDone) return null
    const [first] = scoreLeagues(quizAnswers)
    return RANKED_LEAGUES.find((l) => l.id === first.id) ?? null
  }, [quizAnswers, quizDone])

  const stats = [
    { id: 'xp', icon: 'bolt', value: xp + (level - 1) * xpPerLevel, tone: 'gold' },
    { id: 'streak', icon: 'local_fire_department', value: streak, tone: 'orange' },
    { id: 'lessons', icon: 'menu_book', value: `${completedLessons.length}/${LESSONS.length}`, tone: 'blue' },
    { id: 'chants', icon: 'campaign', value: `${chantsMastered}/4`, tone: 'red' },
  ]

  const resetAll = () => {
    try {
      localStorage.removeItem('soccerteaching.progress')
    } catch {
      /* nothing persisted to clear */
    }
    window.location.reload()
  }

  const displayName = user?.name || t('profile.name')

  return (
    <div className="page">
      {/* ---- Identity ---- */}
      <section className="card card--pad-lg stack stack-4" style={{ textAlign: 'center' }}>
        <div className="avatar avatar--xl" style={{ margin: '0 auto' }}>
          {user?.picture ? (
            <img className="avatar__img" src={user.picture} alt="" referrerPolicy="no-referrer" />
          ) : (
            <div className="avatar__img" aria-hidden="true">
              {initials(displayName) || 'IJ'}
            </div>
          )}
          <span className="avatar__level">L{level}</span>
        </div>

        <div className="stack stack-1">
          <h1 className="t-headline-lg">{displayName}</h1>
          <p className="t-body-md text-secondary">{t('path.levelName')}</p>
        </div>

        <XPBar value={xp} max={xpPerLevel} label={`${xp} / ${xpPerLevel} XP`} />
      </section>

      {/* ---- Account ---- */}
      <section className="card card--pad stack stack-3">
        <div className="section-head">
          <h2 className="t-headline-sm">{t('auth.accountTitle')}</h2>
          <Icon
            name={signedIn ? 'verified_user' : 'account_circle'}
            fill
            style={{ color: signedIn ? 'var(--pitch-green)' : 'var(--text-secondary)' }}
          />
        </div>

        {authLoading ? (
          <p className="t-body-md text-secondary">{t('common.loading')}</p>
        ) : signedIn ? (
          <>
            <div className="account">
              {user.picture ? (
                <img className="account__photo" src={user.picture} alt="" referrerPolicy="no-referrer" />
              ) : (
                <span className="account__photo account__photo--text" aria-hidden="true">
                  {initials(displayName)}
                </span>
              )}
              <span className="stack stack-1 grow">
                <span className="t-headline-sm">{displayName}</span>
                {user.email ? <span className="t-body-sm text-secondary">{user.email}</span> : null}
              </span>
            </div>

            <p className="t-body-sm text-secondary">{t('auth.syncedNote')}</p>

            <FieldPressButton variant="soft" block icon="logout" onClick={signOut}>
              {t('auth.signOut')}
            </FieldPressButton>
          </>
        ) : (
          <>
            <p className="t-body-md text-secondary">{t('auth.signedOutNote')}</p>
            <GoogleSignInButton />
          </>
        )}

        {authError ? (
          <p className="t-body-sm" role="alert" style={{ color: 'var(--coral)' }}>
            {t('auth.failed')}
          </p>
        ) : null}
      </section>

      {/* ---- Stats ---- */}
      <section className="stats-grid">
        {stats.map((stat) => (
          <div className="card card--pad stat" key={stat.id}>
            <span className={`tile tile--${stat.tone} tile--circle`}>
              <Icon name={stat.icon} fill />
            </span>
            <span className="t-score-md">{stat.value}</span>
            <span className="t-label-meta text-secondary">{t(`profile.stats.${stat.id}`)}</span>
          </div>
        ))}
      </section>

      {/* ---- League match ---- */}
      <section className="card card--pad stack stack-3">
        <div className="section-head">
          <h2 className="t-headline-sm">{t('leagues.yourMatch')}</h2>
          <Icon name="emoji_events" fill style={{ color: 'var(--gold)' }} />
        </div>

        {topLeague ? (
          <>
            <p className="t-headline-md">{tr(topLeague.name)}</p>
            <FieldPressButton
              variant="soft"
              block
              icon="chevron_right"
              onClick={() => navigate('/leagues')}
            >
              {t('profile.viewLeagues')}
            </FieldPressButton>
          </>
        ) : (
          <>
            <p className="t-body-md text-secondary">{t('leagues.empty')}</p>
            <FieldPressButton variant="primary" block icon="bolt" onClick={() => navigate('/quiz')}>
              {t('leagues.takeQuiz')}
            </FieldPressButton>
          </>
        )}
      </section>

      {/* ---- Achievements ---- */}
      <section className="stack stack-3">
        <div className="section-head">
          <h2 className="t-headline-md">{t('profile.achievements')}</h2>
          <span className="pill pill--green">
            {`${achievements.filter((a) => a.earned).length} / ${achievements.length}`}
          </span>
        </div>

        <div className="stack stack-2">
          {achievements.map((ach) => (
            <div className={`card card--pad badge-row ${ach.earned ? 'is-earned' : ''}`.trim()} key={ach.id}>
              <span className={`tile tile--circle ${ach.earned ? 'tile--goldsolid' : 'tile--lavender'}`}>
                <Icon name={ach.earned ? ach.icon : 'lock'} fill={ach.earned} />
              </span>
              <span className="grow stack stack-1">
                <span className="t-headline-sm">{t(`profile.badges.${ach.id}.title`)}</span>
                <span className="t-body-sm text-secondary">{t(`profile.badges.${ach.id}.desc`)}</span>
              </span>
              {ach.earned ? (
                <Icon name="check_circle" fill style={{ color: 'var(--pitch-green)' }} />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* ---- Settings ---- */}
      <section className="card card--pad stack stack-4">
        <h2 className="t-headline-sm">{t('profile.settings')}</h2>

        <div className="row row-3" style={{ justifyContent: 'space-between' }}>
          <span className="t-body-md">{t('lang.label')}</span>
          <LangSwitch wide />
        </div>

        <div className="stack stack-2">
          <span className="t-body-md">{t('profile.resetLabel')}</span>
          <span className="t-body-sm text-secondary">{t('profile.resetHint')}</span>

          {confirmingReset ? (
            <div className="row row-2">
              <FieldPressButton variant="secondary" size="sm" onClick={() => setConfirmingReset(false)}>
                {t('profile.cancel')}
              </FieldPressButton>
              <FieldPressButton variant="gold" size="sm" icon="restart_alt" onClick={resetAll}>
                {t('profile.resetConfirm')}
              </FieldPressButton>
            </div>
          ) : (
            <FieldPressButton
              variant="secondary"
              size="sm"
              icon="restart_alt"
              onClick={() => setConfirmingReset(true)}
            >
              {t('profile.reset')}
            </FieldPressButton>
          )}
        </div>
      </section>
    </div>
  )
}
