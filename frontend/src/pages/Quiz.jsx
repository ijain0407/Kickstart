import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import QuizOption from '../components/QuizOption.jsx'
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

  const [stepIndex, setStepIndex] = useState(0)
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
          setStepIndex(0)
        }}
      />
    )
  }

  return (
    <DataState loading={loading} error={error} onRetry={reload}>
      {questions.length ? (
        <Steps
          questions={questions}
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
          quizAnswers={quizAnswers}
          setQuizAnswer={setQuizAnswer}
          live={live}
          submitError={submitError}
          score={score}
          onExit={() => navigate('/')}
          onFinish={() => {
            finishQuiz()
            celebrate({ title: t('quiz.celebrateTitle'), sub: t('quiz.celebrateSub'), xp: 120, icon: 'emoji_events' })
          }}
          t={t}
          tr={tr}
        />
      ) : null}
    </DataState>
  )
}

function Steps({
  questions,
  stepIndex,
  setStepIndex,
  quizAnswers,
  setQuizAnswer,
  live,
  submitError,
  score,
  onExit,
  onFinish,
  t,
  tr,
}) {
  const step = questions[stepIndex]
  const picked = quizAnswers[step.id] ?? []
  const total = questions.length
  const stepNumber = stepIndex + 1
  const percent = Math.round((stepNumber / total) * 100)
  const isLast = stepIndex === total - 1

  const toggle = (optionId) => {
    const next = step.multi
      ? picked.includes(optionId)
        ? picked.filter((id) => id !== optionId)
        : [...picked, optionId]
      : [optionId]

    setQuizAnswer(step.id, next)
    score({ ...quizAnswers, [step.id]: next })
  }

  const advance = () => {
    if (isLast) {
      score(quizAnswers, { final: true, award: true })
      onFinish()
      return
    }
    setStepIndex((i) => i + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page">
      {/* ---- Header ---- */}
      <div className="quiz-head">
        <div className="row row-3">
          <button
            type="button"
            className="icon-btn icon-btn--outline"
            aria-label={t('quiz.exit')}
            onClick={() => (stepIndex === 0 ? onExit() : setStepIndex((i) => i - 1))}
          >
            <Icon name={stepIndex === 0 ? 'close' : 'arrow_back'} />
          </button>

          <div className="grow stack stack-1">
            <span className="t-label-meta text-secondary">{t('quiz.title')}</span>
            <span className="t-headline-sm">{`${t('quiz.step')} ${stepNumber} ${t('quiz.stepOf')} ${total}`}</span>
          </div>
        </div>

        <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress__fill" style={{ width: `${percent}%` }} />
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="t-body-sm text-secondary">{tr(step.section)}</span>
          <span className="t-body-sm text-secondary">{`${percent}% ${t('quiz.completed')}`}</span>
        </div>
      </div>

      <div className="split-quiz">
        <div className="stack stack-4">
          {/* ---- Question ---- */}
          <div className="stack stack-2">
            <div className="row row-2 wrap">
              <span className="pill pill--peach">{t('quiz.drillTag')}</span>
              <span className="pill pill--lavender">
                <Icon name="translate" />
                {t('quiz.coachMode')}
              </span>
            </div>

            <h1 className="t-headline-lg">{step.prompt}</h1>
            {/* Bilingual coach mode: the same question in the other language. */}
            <p className="t-headline-sm" style={{ color: 'var(--pitch-green)' }}>
              {step.promptAlt}
            </p>
            <p className="t-body-md text-secondary">{step.multi ? t('quiz.multiSelect') : t('quiz.singleSelect')}</p>
          </div>

          {/* ---- Options ---- */}
          <div className="stack stack-3" role={step.multi ? 'group' : 'radiogroup'} aria-label={step.prompt}>
            {step.options.map((option) => (
              <QuizOption
                key={option.id}
                option={{ ...option, title: option.text }}
                multi={step.multi}
                selected={picked.includes(option.id)}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>

        {/* ---- Live compatibility (moves beside the question on tablet+) ---- */}
        <div className="split-quiz__side">
          <CompatStrip ranking={live?.ranking} />
          {submitError ? <p className="placeholder-note">{t('common.loadError')}</p> : null}
        </div>
      </div>

      {/* ---- Sticky action bar ---- */}
      <div className="quiz-actions">
        <span className="t-num text-secondary" style={{ fontSize: 16, letterSpacing: '0.04em' }}>
          {`${picked.length} ${t('quiz.selectedCount')}`}
        </span>

        <FieldPressButton variant="primary" block iconAfter="arrow_forward" onClick={advance} disabled={picked.length === 0}>
          {isLast ? t('quiz.seeResults') : `${t('quiz.nextQuestion')} (${stepNumber}/${total})`}
        </FieldPressButton>
      </div>
    </div>
  )
}
