import { useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import DataState from '../components/DataState.jsx'
import QuizStepper from '../components/QuizStepper.jsx'
import LeagueLogo from '../components/LeagueLogo.jsx'
import CountryFlag from '../components/CountryFlag.jsx'
import { api, useResource } from '../lib/api.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useAuth } from '../state/AuthState.jsx'
import { useRouter } from '../router.jsx'

/**
 * "Find Your Club" — the second matcher.
 *
 * The league matcher answers which competition to follow; this one picks a
 * club inside it, scored on what actually makes people choose: glory, history,
 * an underdog story, drama, belonging, style, atmosphere.
 *
 * Every answer posts the set so far, so the live strip reflects real scoring
 * rather than a guess made in the browser.
 */

/** A club's kit motif, or its crest when one has been supplied. */
function ClubBadge({ club }) {
  if (club?.crestUrl) return <img className="club-crest club-crest--img" src={club.crestUrl} alt="" loading="lazy" />
  const style = { '--club-a': club?.kit?.primary ?? '#334155', '--club-b': club?.kit?.secondary ?? '#0f172a' }
  return <span className={`club-crest club-crest--${club?.kit?.pattern ?? 'solid'}`} style={style} aria-hidden="true" />
}

function LiveStrip({ ranking }) {
  const { t } = useI18n()
  if (!ranking?.length) return null
  const [first, second] = ranking

  return (
    <div className="compat">
      <div className="grow stack stack-1">
        <span className="t-label-meta text-secondary">{t('quiz.liveCompat')}</span>
        <span className="t-headline-sm">{first.club}</span>
        {second ? (
          <span className="t-body-sm text-secondary">
            {t('quiz.nextUp')}: {second.club} · {second.matchPercent}%
          </span>
        ) : null}
      </div>
      <span className="compat__score t-num">{first.matchPercent}%</span>
    </div>
  )
}

function Result({ result, leagueName, onRetake, savedTo }) {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const { recommendation, ranking } = result
  const club = recommendation.club

  return (
    <div className="page">
      <div className="stack stack-2">
        <span className="t-label-meta text-secondary">{t('clubQuiz.resultsKicker')}</span>
        <h1 className="t-headline-xl">{t('clubQuiz.resultsTitle')}</h1>
        {leagueName ? (
          <p className="row row-2 t-body-md text-secondary">
            <LeagueLogo leagueId={club.leagueId} size={22} />
            {leagueName}
            <CountryFlag leagueId={club.leagueId} size={16} />
          </p>
        ) : null}
      </div>

      <section className="card card--pad-lg stack stack-3" style={{ textAlign: 'center' }}>
        <div className="row row-3" style={{ justifyContent: 'center' }}>
          <ClubBadge club={{ ...club, kit: club.kit, crestUrl: club.crestUrl }} />
          <div className="stack stack-1" style={{ textAlign: 'left' }}>
            <h2 className="t-headline-lg">{club.club}</h2>
            <p className="t-body-sm text-secondary">{club.nickname.original.text}</p>
          </div>
        </div>

        <p className="score-num t-num" style={{ fontSize: 32, color: 'var(--green-ink)' }}>
          {`${recommendation.matchPercent}% ${t('clubQuiz.match')}`}
        </p>

        <p className="t-body-md text-pretty">{club.summary}</p>

        <p className="t-body-sm text-secondary">
          <Icon name="check_circle" fill style={{ fontSize: 16, verticalAlign: '-3px' }} />{' '}
          {savedTo === 'account' ? t('clubQuiz.savedAccount') : t('clubQuiz.savedLocal')}
        </p>

        {recommendation.reasons.length > 0 ? (
          <>
            <p className="t-label-meta text-secondary">{t('clubQuiz.because')}</p>
            <div className="row row-2 wrap" style={{ justifyContent: 'center' }}>
              {recommendation.reasons.map((reason) => (
                <span key={reason.id} className="pill pill--gold">
                  <Icon name="check" fill />
                  {reason.label}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <FieldPressButton
        variant="primary"
        block
        icon="campaign"
        onClick={() => navigate(`/culture?league=${club.leagueId}&club=${club.id}`)}
      >
        {t('clubQuiz.explore')}
      </FieldPressButton>

      {/* How the rest of the league scored, so the choice is legible. */}
      <section className="card stack">
        {ranking.map((row, i) => (
          <div className={`result-row ${i === 0 ? 'is-top' : ''}`.trim()} key={row.cultureId}>
            <span className="result-row__rank t-num">{i + 1}</span>
            <ClubBadge club={row} />
            <span className="grow stack stack-2">
              <span className="t-headline-sm">{row.club}</span>
              <span className="result-row__bar">
                <i style={{ width: `${row.matchPercent}%` }} />
              </span>
            </span>
            <span className="result-row__pct t-num">{row.matchPercent}%</span>
          </div>
        ))}
      </section>

      <FieldPressButton variant="soft" block icon="restart_alt" onClick={onRetake}>
        {t('clubQuiz.retake')}
      </FieldPressButton>
    </div>
  )
}

export default function ClubQuiz() {
  const { t, lang } = useI18n()
  const { query, navigate } = useRouter()
  const { clubResult, setClubResult } = useApp()
  const { user, updateProfile } = useAuth()
  const leagueId = query.league ?? null

  const [answers, setAnswers] = useState({})
  const [live, setLive] = useState(null)
  const [result, setResult] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const scoring = useRef(0)

  const { data, loading, error, reload } = useResource(
    (signal) => api(`/club-quiz${leagueId ? `?league=${leagueId}` : ''}`, { lang, signal }),
    [lang, leagueId],
  )

  /** Score what's been answered so far; the newest response wins. */
  const score = async (next, { final = false } = {}) => {
    if (!Object.values(next).some((picks) => picks?.length)) return setLive(null)

    const ticket = ++scoring.current
    try {
      const scored = await api('/club-quiz/recommend', {
        method: 'POST',
        lang,
        body: { leagueId: leagueId ?? undefined, answers: next },
      })
      if (ticket !== scoring.current) return
      setSubmitError(null)
      setLive(scored)

      if (final) {
        setResult(scored)
        // Keep the pick: on this device always, and on the account when there
        // is one, so it follows the person rather than the browser.
        setClubResult(scored)
        if (user) {
          const club = scored.recommendation.club
          updateProfile({ favouriteClubId: club.id, favouriteLeagueId: club.leagueId }).catch(() => {
            /* the local copy still holds it; the profile page can retry */
          })
        }
      }
    } catch (err) {
      if (ticket === scoring.current) setSubmitError(err)
    }
  }

  const leagueName = data?.league?.name ?? null

  // A pick made earlier counts, as long as it belongs to the league being asked
  // about — otherwise the quiz would restart on every visit.
  const remembered = clubResult && (!leagueId || clubResult.recommendation?.club?.leagueId === leagueId) ? clubResult : null
  const shown = result ?? remembered

  if (shown) {
    return (
      <Result
        result={shown}
        leagueName={leagueName}
        savedTo={user ? 'account' : 'device'}
        onRetake={() => {
          setAnswers({})
          setLive(null)
          setResult(null)
          setClubResult(null)
        }}
      />
    )
  }

  return (
    <DataState loading={loading} error={error} onRetry={reload}>
      {data?.quiz.questions.length ? (
        <>
          <QuizStepper
            kicker={leagueName ? `${t('clubQuiz.kicker')} · ${leagueName}` : t('clubQuiz.kicker')}
            subtitle={t('clubQuiz.subtitle')}
            questions={data.quiz.questions}
            answers={answers}
            onAnswer={(questionId, optionIds) => {
              const next = { ...answers, [questionId]: optionIds }
              setAnswers(next)
              score(next)
            }}
            onFinish={() => score(answers, { final: true })}
            onExit={() => navigate(leagueId ? `/culture?league=${leagueId}` : '/leagues')}
            aside={<LiveStrip ranking={live?.ranking} />}
            footnote={submitError ? <p className="placeholder-note">{t('common.loadError')}</p> : null}
          />
        </>
      ) : null}
    </DataState>
  )
}
