import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import DataState from '../components/DataState.jsx'
import LeagueLogo from '../components/LeagueLogo.jsx'
import { api, useResource } from '../lib/api.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/**
 * The Leagues tab: every competition ranked by the matcher, with a route into
 * its culture content. Before the matcher has been taken it browses the five
 * leagues instead of showing an empty state with nothing to do.
 */
export default function Leagues() {
  const { t, tr, lang } = useI18n()
  const { navigate } = useRouter()
  const { leagueResult, quizDone, resetQuiz } = useApp()

  const { data, loading, error, reload } = useResource((signal) => api('/leagues', { lang, signal }), [lang])
  const leagues = data?.leagues ?? []
  const ranking = quizDone ? leagueResult?.ranking : null

  return (
    <div className="page">
      <div className="stack stack-2">
        <h1 className="t-headline-lg">{t('leagues.title')}</h1>
        <p className="t-body-md text-secondary">{t('leagues.sub')}</p>
      </div>

      <DataState loading={loading} error={error} onRetry={reload}>
        {ranking ? (
          <>
            <section className="card stack">
              {ranking.map((row, i) => (
                <div className={`result-row ${i === 0 ? 'is-top' : ''}`.trim()} key={row.leagueId}>
                  <span className="result-row__rank t-num">{i + 1}</span>

                  <LeagueLogo leagueId={row.leagueId} />

                  <span className="grow stack stack-2">
                    <span className="row row-2 wrap">
                      <span className="t-headline-sm">{row.name}</span>
                      {i === 0 ? <span className="pill pill--gold">{t('leagues.yourMatch')}</span> : null}
                    </span>
                    <span className="result-row__bar">
                      <i style={{ width: `${row.matchPercent}%` }} />
                    </span>
                  </span>

                  <span className="result-row__pct t-num">{row.matchPercent}%</span>

                  <button
                    type="button"
                    className="icon-btn icon-btn--chevron"
                    aria-label={`${t('leagues.viewCulture')} — ${row.name}`}
                    onClick={() => navigate(`/culture?league=${row.leagueId}`)}
                  >
                    <Icon name="chevron_right" />
                  </button>
                </div>
              ))}
            </section>

            {/* Picked a league — the obvious next question is which club. */}
            <FieldPressButton
              variant="primary"
              block
              iconAfter="arrow_forward"
              onClick={() => navigate(`/club-quiz?league=${ranking[0].leagueId}`)}
            >
              {t('clubQuiz.cta')}
            </FieldPressButton>

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
        ) : (
          <>
            <section className="card card--pad-lg stack stack-4" style={{ textAlign: 'center' }}>
              <span className="tile tile--goldsolid tile--lg tile--circle" style={{ margin: '0 auto' }}>
                <Icon name="emoji_events" fill />
              </span>
              <h2 className="t-headline-md">{t('leagues.empty')}</h2>
              <p className="t-body-md text-secondary">{t('leagues.emptySub')}</p>
              <FieldPressButton variant="primary" block iconAfter="arrow_forward" onClick={() => navigate('/quiz')}>
                {t('leagues.takeQuiz')}
              </FieldPressButton>
            </section>

            {/* Browsable in the meantime — the matcher isn't a paywall. */}
            <div className="stack stack-3">
              <h2 className="t-headline-md">{t('culture.allLeagues')}</h2>
              {leagues.map((league) => (
                <button
                  key={league.id}
                  type="button"
                  className="card chant-row"
                  onClick={() => navigate(`/culture?league=${league.id}`)}
                >
                  <LeagueLogo leagueId={league.id} />
                  <span className="grow stack stack-1">
                    <span className="t-headline-sm">{tr(league.name)}</span>
                    <span className="t-body-sm text-secondary">{tr(league.tagline)}</span>
                  </span>
                  <span className="icon-btn icon-btn--chevron">
                    <Icon name="chevron_right" />
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </DataState>
    </div>
  )
}
