import { useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import PitchBoard from '../components/PitchBoard.jsx'
import PlayerToken from '../components/PlayerToken.jsx'
import { LESSONS, lessonState } from '../data/lessons.js'
import { getLessonContent } from '../data/lessonContent.js'
import { getFormation } from '../data/formations.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/* Small preset arrangements the lesson steps can illustrate. */
const VISUALS = {
  basics: {
    offside: null,
    players: [
      { num: 1, code: 'GK', top: 88, left: 50 },
      { num: 4, code: 'CB', top: 72, left: 38 },
      { num: 5, code: 'CB', top: 72, left: 62 },
      { num: 6, code: 'CDM', top: 52, left: 50 },
      { num: 9, code: 'ST', top: 22, left: 50 },
    ],
  },
  offside: {
    // The 9 has strayed beyond the last defender; the line shows why.
    offside: 30,
    players: [
      { num: 1, code: 'GK', top: 88, left: 50 },
      { num: 4, code: 'CB', top: 34, left: 38 },
      { num: 5, code: 'CB', top: 34, left: 62 },
      { num: 10, code: 'CAM', top: 52, left: 50 },
      { num: 9, code: 'ST', top: 20, left: 46, flagged: true },
    ],
  },
  block: {
    offside: null,
    players: [
      { num: 3, code: 'LB', top: 62, left: 18 },
      { num: 4, code: 'CB', top: 62, left: 39 },
      { num: 5, code: 'CB', top: 62, left: 61 },
      { num: 2, code: 'RB', top: 62, left: 82 },
      { num: 6, code: 'CDM', top: 46, left: 50 },
    ],
  },
  formation: { offside: null, players: getFormation('433').players },
  var: {
    offside: 42,
    players: [
      { num: 4, code: 'CB', top: 46, left: 40 },
      { num: 9, code: 'ST', top: 38, left: 56, flagged: true },
    ],
  },
}

function LessonVisual({ name, label }) {
  const preset = VISUALS[name]
  if (!preset) return null

  return (
    <PitchBoard
      className="lesson-visual"
      offside={preset.offside}
      offsideLabel={undefined}
      aria-label={label}
    >
      {preset.players.map((p) => (
        <PlayerToken key={`${p.num}-${p.code}`} player={p} gold={p.flagged} />
      ))}
    </PitchBoard>
  )
}

export default function Lesson() {
  const { t, tr } = useI18n()
  const { query, navigate } = useRouter()
  const { completedLessons, activeLesson, completeLesson, bumpStreak, celebrate } = useApp()

  const id = query.id ?? activeLesson
  const lesson = useMemo(() => LESSONS.find((l) => l.id === id) ?? LESSONS[0], [id])
  const content = getLessonContent(lesson.id)

  // step 0..n-1 are the teaching steps, step n is the comprehension check
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState(null)

  const totalSteps = content.steps.length + 1
  const onCheck = step === content.steps.length
  const current = onCheck ? null : content.steps[step]
  const percent = Math.round(((step + 1) / totalSteps) * 100)

  const state = lessonState(lesson, completedLessons, activeLesson)
  const alreadyDone = state === 'completed'
  const chosen = picked ? content.check.options.find((o) => o.id === picked) : null

  const finish = () => {
    if (!alreadyDone) {
      completeLesson(lesson.id, lesson.xp)
      bumpStreak()
    }
    celebrate({
      title: tr(lesson.title),
      sub: tr(lesson.unlocks),
      xp: alreadyDone ? 0 : lesson.xp,
      icon: 'military_tech',
      next: '/path',
    })
  }

  const advance = () => {
    if (onCheck) {
      finish()
      return
    }
    setStep((s) => s + 1)
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
            aria-label={t('common.back')}
            onClick={() => (step === 0 ? navigate('/path') : setStep((s) => s - 1))}
          >
            <Icon name={step === 0 ? 'close' : 'arrow_back'} />
          </button>

          <div className="grow stack stack-1">
            <span className="t-label-meta text-secondary">
              {`${t('lesson.module')} ${lesson.id}`}
            </span>
            <span className="t-headline-sm">
              {`${t('quiz.step')} ${step + 1} ${t('quiz.stepOf')} ${totalSteps}`}
            </span>
          </div>

          <span className="pill pill--gold">
            <Icon name="bolt" fill />+{lesson.xp} XP
          </span>
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
      </div>

      <h1 className="t-headline-lg">{tr(lesson.detailTitle ?? lesson.title)}</h1>

      {onCheck ? (
        /* ---- Comprehension check ---- */
        <section className="stack stack-4">
          <span className="pill pill--green-solid">{t('lesson.checkTag')}</span>
          <h2 className="t-headline-md">{tr(content.check.question)}</h2>

          <div className="stack stack-3" role="radiogroup" aria-label={tr(content.check.question)}>
            {content.check.options.map((option) => {
              const isPicked = picked === option.id
              // Only reveal right/wrong once an answer is locked in.
              const tone = !picked
                ? ''
                : option.correct
                  ? 'is-correct'
                  : isPicked
                    ? 'is-wrong'
                    : ''
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`qopt lesson-opt ${isPicked ? 'is-selected' : ''} ${tone}`.trim()}
                  role="radio"
                  aria-checked={isPicked}
                  disabled={Boolean(picked)}
                  onClick={() => setPicked(option.id)}
                >
                  <span className="qopt__check">
                    <Icon name={picked && option.correct ? 'check' : 'radio_button_unchecked'} />
                  </span>
                  <span className="qopt__body">
                    <span className="t-body-lg">{tr(option.label)}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {picked ? (
            <div className={`explain ${chosen?.correct ? 'explain--good' : 'explain--bad'}`}>
              <Icon name={chosen?.correct ? 'check_circle' : 'info'} fill />
              <div className="stack stack-1">
                <span className="t-headline-sm">
                  {chosen?.correct ? t('lesson.correct') : t('lesson.notQuite')}
                </span>
                <span className="t-body-md">{tr(content.check.explain)}</span>
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        /* ---- Teaching step ---- */
        <section className="stack stack-4">
          <LessonVisual name={current.visual} label={tr(current.title)} />
          <h2 className="t-headline-md">{tr(current.title)}</h2>
          <p className="t-body-lg text-secondary">{tr(current.body)}</p>
        </section>
      )}

      {/* ---- Action bar ---- */}
      <div className="quiz-actions">
        <span className="t-num text-secondary" style={{ fontSize: 16, letterSpacing: '0.04em' }}>
          {`${step + 1} / ${totalSteps}`}
        </span>

        <FieldPressButton
          variant="primary"
          block
          iconAfter={onCheck ? 'check' : 'arrow_forward'}
          onClick={advance}
          disabled={onCheck && !picked}
        >
          {onCheck ? t('lesson.finish') : t('common.next')}
        </FieldPressButton>
      </div>
    </div>
  )
}
