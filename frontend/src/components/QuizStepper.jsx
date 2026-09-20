import { useState } from 'react'
import Icon from './Icon.jsx'
import FieldPressButton from './FieldPressButton.jsx'
import QuizOption from './QuizOption.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

/**
 * The question flow shared by both matchers — "which league" and "which club".
 *
 * It owns only which step you're on. The answers, the scoring and the result
 * screen belong to the page using it, because those differ: the league matcher
 * awards XP on completion, the club matcher scores within one league.
 *
 * `aside` is whatever the page wants beside the question on tablet and up —
 * the live compatibility strip, in both current cases.
 */
export default function QuizStepper({ kicker, questions, answers, onAnswer, onFinish, onExit, aside, footnote }) {
  const { t, tr } = useI18n()
  const [stepIndex, setStepIndex] = useState(0)

  const step = questions[stepIndex]
  const picked = answers[step.id] ?? []
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
    onAnswer(step.id, next)
  }

  const advance = () => {
    if (isLast) {
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
            <span className="t-label-meta text-secondary">{kicker}</span>
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
          {aside}
          {footnote}
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
