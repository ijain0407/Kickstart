import { useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import QuizOption from '../components/QuizOption.jsx'
import { QUIZ_STEPS, TOTAL_STEPS, scoreLeagues } from '../data/quiz.js'
import { RANKED_LEAGUES } from '../data/leagues.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

const leagueName = (id) => RANKED_LEAGUES.find((l) => l.id === id)?.name ?? { en: id, es: id }

/** The live compatibility strip: top match now, and who is next. */
function CompatStrip({ ranked }) {
  const { t, tr } = useI18n()
  const [first, second] = ranked

  return (
    <div className="compat">
      <span className="tile tile--green tile--circle" style={{ width: 36, height: 36 }}>
        <Icon name="monitoring" fill />
      </span>

      <div className="grow stack stack-1">
        <span className="t-label-meta text-secondary">{t('quiz.liveCompat')}</span>
        <span className="t-headline-sm">{tr(leagueName(first.id))}</span>
        <span className="t-body-sm text-secondary">
          {`${t('quiz.nextUp')}: ${tr(leagueName(second.id))} (${second.score}%)`}
        </span>
      </div>

      <span className="compat__score t-num">{first.score}%</span>
    </div>
  )
}

/** Ranked results with animated bars, shown once all five steps are done. */
function Results({ ranked, onRetake }) {
  const { t, tr } = useI18n()
  const { navigate } = useRouter()
  const top = ranked[0]
  const topLeague = RANKED_LEAGUES.find((l) => l.id === top.id)

  return (
    <div className="page">
      <div className="stack stack-2">
        <span className="t-label-meta text-secondary">{t('quiz.resultsKicker')}</span>
        <h1 className="t-headline-xl">{t('quiz.resultsTitle')}</h1>
        <p className="t-body-md text-secondary">{t('quiz.resultsSub')}</p>
      </div>

      <div className="card stack">
        {ranked.map((row, i) => (
          <div className={`result-row ${i === 0 ? 'is-top' : ''}`.trim()} key={row.id}>
            <span className="result-row__rank t-num">{i + 1}</span>
            <span className="grow stack stack-2">
              <span className="t-headline-sm">{tr(leagueName(row.id))}</span>
              <span className="result-row__bar">
                <i style={{ width: `${row.score}%` }} />
              </span>
            </span>
            <span className="result-row__pct t-num">{row.score}%</span>
          </div>
        ))}
      </div>

      <div className="bounty">
        <Icon name="bolt" fill style={{ color: 'var(--gold-rim)', fontSize: 24 }} />
        <span className="t-headline-sm grow" style={{ color: 'var(--gold-badge-text)' }}>
          {t('quiz.rewardXp')}
        </span>
      </div>

      {topLeague?.hasCulture ? (
        <FieldPressButton
          variant="primary"
          block
          icon="campaign"
          onClick={() => navigate(`/culture?league=${top.id}`)}
        >
          {t('quiz.exploreCulture')}
        </FieldPressButton>
      ) : null}

      <FieldPressButton variant="soft" block icon="restart_alt" onClick={onRetake}>
        {t('quiz.retake')}
      </FieldPressButton>
    </div>
  )
}

export default function Quiz() {
  const { t, tr, lang } = useI18n()
  const { navigate } = useRouter()
  const { quizAnswers, setQuizAnswer, quizDone, finishQuiz, resetQuiz, addXp, celebrate } = useApp()

  const [stepIndex, setStepIndex] = useState(0)

  const ranked = useMemo(() => scoreLeagues(quizAnswers), [quizAnswers])

  if (quizDone) {
    return (
      <Results
        ranked={ranked}
        onRetake={() => {
          resetQuiz()
          setStepIndex(0)
        }}
      />
    )
  }

  const step = QUIZ_STEPS[stepIndex]
  const picked = quizAnswers[step.id] ?? []
  const stepNumber = stepIndex + 1
  const percent = Math.round((stepNumber / TOTAL_STEPS) * 100)
  const otherLang = lang === 'en' ? 'es' : 'en'
  const isLast = stepIndex === TOTAL_STEPS - 1

  const toggle = (optionId) => {
    if (step.multi) {
      const next = picked.includes(optionId)
        ? picked.filter((id) => id !== optionId)
        : [...picked, optionId]
      setQuizAnswer(step.id, next)
    } else {
      setQuizAnswer(step.id, [optionId])
    }
  }

  const advance = () => {
    if (isLast) {
      finishQuiz()
      addXp(120)
      celebrate({
        title: t('quiz.celebrateTitle'),
        sub: t('quiz.celebrateSub'),
        xp: 120,
        icon: 'emoji_events',
      })
      return
    }
    setStepIndex((i) => i + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const skipAll = () => {
    finishQuiz()
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
            onClick={() => (stepIndex === 0 ? navigate('/') : setStepIndex((i) => i - 1))}
          >
            <Icon name={stepIndex === 0 ? 'close' : 'arrow_back'} />
          </button>

          <div className="grow stack stack-1">
            <span className="t-label-meta text-secondary">{t('quiz.title')}</span>
            <span className="t-headline-sm">
              {`${t('quiz.step')} ${stepNumber} ${t('quiz.stepOf')} ${TOTAL_STEPS}`}
            </span>
          </div>

          <button type="button" className="pill pill--grey" onClick={skipAll}>
            {t('quiz.skipAll')}
          </button>
        </div>

        <div
          className="progress"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
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

            <h1 className="t-headline-lg">{tr(step.title)}</h1>
            <p className="t-headline-sm" style={{ color: 'var(--pitch-green)' }}>
              {step.title[otherLang]}
            </p>
            <p className="t-body-md text-secondary">
              {step.multi ? t('quiz.multiSelect') : t('quiz.singleSelect')}
            </p>
          </div>

          {/* ---- Options ---- */}
          <div
            className="stack stack-3"
            role={step.multi ? 'group' : 'radiogroup'}
            aria-label={tr(step.title)}
          >
            {step.options.map((option) => (
              <QuizOption
                key={option.id}
                option={option}
                multi={step.multi}
                selected={picked.includes(option.id)}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>

        {/* ---- Live compatibility (moves beside the question on tablet+) ---- */}
        <div className="split-quiz__side">
          <CompatStrip ranked={ranked} />
        </div>
      </div>

      {/* ---- Sticky action bar ---- */}
      <div className="quiz-actions">
        <span className="t-num text-secondary" style={{ fontSize: 16, letterSpacing: '0.04em' }}>
          {`${picked.length} ${t('quiz.selectedCount')}`}
        </span>

        <FieldPressButton
          variant="primary"
          block
          iconAfter="arrow_forward"
          onClick={advance}
          disabled={picked.length === 0}
        >
          {isLast
            ? t('quiz.seeResults')
            : `${t('quiz.nextQuestion')} (${stepNumber}/${TOTAL_STEPS})`}
        </FieldPressButton>
      </div>
    </div>
  )
}
