import { useMemo } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import { scoreLeagues } from '../data/quiz.js'
import { RANKED_LEAGUES } from '../data/leagues.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/**
 * The Leagues tab holds the outcome of the Tactical Matcher: every
 * competition ranked, with a route into its Culture content. Taking
 * or retaking the matcher itself lives on the Quiz tab.
 */
export default function Leagues() {
  const { t, tr } = useI18n()
  const { navigate } = useRouter()
  const { quizAnswers, quizDone, resetQuiz } = useApp()

  const ranked = useMemo(() => scoreLeagues(quizAnswers), [quizAnswers])
  const answered = Object.values(quizAnswers).some((picks) => picks?.length)

  return (
    <div className="page">
      <div className="stack stack-2">
        <h1 className="t-headline-lg">{t('leagues.title')}</h1>
        <p className="t-body-md text-secondary">{t('leagues.sub')}</p>
      </div>

      {!answered && !quizDone ? (
        <section className="card card--pad-lg stack stack-4" style={{ textAlign: 'center' }}>
          <span className="tile tile--goldsolid tile--lg tile--circle" style={{ margin: '0 auto' }}>
            <Icon name="emoji_events" fill />
          </span>
          <h2 className="t-headline-md">{t('leagues.empty')}</h2>
          <p className="t-body-md text-secondary">{t('leagues.emptySub')}</p>
          <FieldPressButton
            variant="primary"
            block
            iconAfter="arrow_forward"
            onClick={() => navigate('/quiz')}
          >
            {t('leagues.takeQuiz')}
          </FieldPressButton>
        </section>
      ) : (
        <>
          <section className="card stack">
            {ranked.map((row, i) => {
              const league = RANKED_LEAGUES.find((l) => l.id === row.id)
              return (
                <div className={`result-row ${i === 0 ? 'is-top' : ''}`.trim()} key={row.id}>
                  <span className="result-row__rank t-num">{i + 1}</span>

                  <span className="grow stack stack-2">
                    <span className="row row-2 wrap">
                      <span className="t-headline-sm">{tr(league.name)}</span>
                      {i === 0 ? (
                        <span className="pill pill--gold">{t('leagues.yourMatch')}</span>
                      ) : null}
                    </span>
                    <span className="result-row__bar">
                      <i style={{ width: `${row.score}%` }} />
                    </span>
                  </span>

                  <span className="result-row__pct t-num">{row.score}%</span>

                  {league.hasCulture ? (
                    <button
                      type="button"
                      className="icon-btn icon-btn--chevron"
                      aria-label={`${t('leagues.viewCulture')} — ${tr(league.name)}`}
                      onClick={() => navigate(`/culture?league=${league.id}`)}
                    >
                      <Icon name="chevron_right" />
                    </button>
                  ) : null}
                </div>
              )
            })}
          </section>

          <FieldPressButton
            variant="soft"
            block
            icon="restart_alt"
            onClick={() => {
              resetQuiz()
              navigate('/quiz')
            }}
          >
            {t('leagues.retake')}
          </FieldPressButton>
        </>
      )}
    </div>
  )
}
