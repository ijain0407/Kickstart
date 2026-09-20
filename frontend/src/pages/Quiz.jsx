import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import QuizStepper from '../components/QuizStepper.jsx'
import DataState from '../components/DataState.jsx'
import { api, useResource } from '../lib/api.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/**
 * The Tactical Matcher, scored by the league API.
 *
 * Every tap posts the answers so far to /api/league-quiz/recommend — the
 * endpoint accepts a partial set — which is what keeps the live compatibility
 * strip honest instead of guessing at client-side weights.
 */

/** The live compatibility strip: top match now, and who is next. */
function CompatStrip({ ranking }) {
  const { t } = useI18n()
  if (!ranking?.length) return null
  const [first, second] = ranking

  return (
    <div className="compat">
      <div className="grow stack stack-1">
        <span className="t-label-meta text-secondary">{t('quiz.liveCompat')}</span>
        <span className="t-headline-sm">{first.name}</span>
        {second ? (
          <span className="t-body-sm text-secondary">
            {t('quiz.nextUp')}: {second.name} · {second.matchPercent}%
          </span>
        ) : null}
      </div>
      <span className="compat__score t-num">{first.matchPercent}%</span>
    </div>
  )
}

/** Ranked results, shown once the last question is answered. */
function Results({ result, onRetake }) {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const { recommendation, ranking } = result
  const top = recommendation.league

  return (
    <div className="page">
      <div className="stack stack-2">
        <span className="t-label-meta text-secondary">{t('quiz.resultsKicker')}</span>
        <h1 className="t-headline-xl">{t('quiz.resultsTitle')}</h1>
        <p className="t-body-md text-secondary">{t('quiz.resultsSub')}</p>
      </div>

      {/* Why this league — straight from the scoring engine. */}
      {recommendation.reasons.length > 0 ? (
        <div className="row row-2 wrap">
          {recommendation.reasons.map((reason) => (
            <span key={reason.id} className="pill pill--gold">
              <Icon name="check" fill />
              {reason.label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="card stack">
        {ranking.map((row, i) => (
          <div className={`result-row ${i === 0 ? 'is-top' : ''}`.trim()} key={row.leagueId}>
            <span className="result-row__rank t-num">{i + 1}</span>
            <span className="grow stack stack-2">
              <span className="t-headline-sm">{row.name}</span>
              <span className="result-row__bar">
                <i style={{ width: `${row.matchPercent}%` }} />
              </span>
            </span>
            <span className="result-row__pct t-num">{row.matchPercent}%</span>
          </div>
        ))}
      </div>

      <div className="bounty">
        <Icon name="bolt" fill style={{ color: 'var(--gold-rim)', fontSize: 24 }} />
        <span className="t-headline-sm grow" style={{ color: 'var(--gold-badge-text)' }}>
          {t('quiz.rewardXp')}
        </span>
      </div>

      <FieldPressButton variant="primary" block icon="campaign" onClick={() => navigate(`/culture?league=${top.id}`)}>
        {t('quiz.exploreCulture')}
      </FieldPressButton>

      <FieldPressButton variant="soft" block icon="restart_alt" onClick={onRetake}>
        {t('quiz.retake')}
      </FieldPressButton>
    </div>
  )
}

export default function Quiz() {
  const { t, tr, lang } = useI18n()
  const { navigate } = useRouter()
  const { quizAnswers, setQuizAnswer, quizDone, finishQuiz, resetQuiz, leagueResult, setLeagueResult, recordLeagueMatch, celebrate } = useApp()

  const [live, setLive] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const scoring = useRef(0)

  const { data, loading, error, reload } = useResource((signal) => api('/league-quiz', { lang, signal }), [lang])
  const questions = data?.quiz.questions ?? []

  /** Score the answers so far. The last call to return wins, so a fast tapper
      never sees an older ranking overwrite a newer one. */
  const score = async (answers, { final = false, award = false } = {}) => {
    const hasAny = Object.values(answers).some((picks) => picks?.length)
    if (!hasAny) return setLive(null)

    const ticket = ++scoring.current
    try {
      const result = await api('/league-quiz/recommend', { method: 'POST', lang, body: { answers } })
      if (ticket !== scoring.current) return
      setSubmitError(null)
      setLive(result)
      if (final) setLeagueResult(result)
      // XP for finishing the matcher is awarded by the progress API, once.
      // Re-scoring after a language switch must not fire this again.
      if (award) recordLeagueMatch(result.recommendation.league.id)
    } catch (err) {
      if (ticket === scoring.current) setSubmitError(err)
    }
  }

  // Re-score when the language changes so the stored result is in the right language.
  useEffect(() => {
    if (quizDone && Object.keys(quizAnswers).length) score(quizAnswers, { final: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  if (quizDone && (leagueResult || live)) {
    return (
      <Results
        result={leagueResult ?? live}
        onRetake={() => {
          resetQuiz()
          setLive(null)
        }}
      />
    )
  }

  return (
    <DataState loading={loading} error={error} onRetry={reload}>
      {questions.length ? (
        <QuizStepper
          kicker={t('quiz.title')}
          subtitle={t('quiz.subtitle')}
          questions={questions}
          answers={quizAnswers}
          onAnswer={(questionId, optionIds) => {
            setQuizAnswer(questionId, optionIds)
            score({ ...quizAnswers, [questionId]: optionIds })
          }}
          onFinish={() => {
            score(quizAnswers, { final: true, award: true })
            finishQuiz()
            celebrate({ title: t('quiz.celebrateTitle'), sub: t('quiz.celebrateSub'), xp: 120, icon: 'emoji_events' })
          }}
          onExit={() => navigate('/')}
          aside={<CompatStrip ranking={live?.ranking} />}
          footnote={submitError ? <p className="placeholder-note">{t('common.loadError')}</p> : null}
        />
      ) : null}
    </DataState>
  )
}
