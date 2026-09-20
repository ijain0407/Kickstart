import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import PitchBoard from '../components/PitchBoard.jsx'
import PlayerToken from '../components/PlayerToken.jsx'
import LessonScene from '../components/LessonScene.jsx'
import { Loading } from '../components/DataState.jsx'
import { LESSONS, lessonState } from '../data/lessons.js'
import { getLessonContent } from '../data/lessonContent.js'
import { getFormation } from '../data/formations.js'
import { api, useResource } from '../lib/api.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/* ============================================================
   THE LESSON PLAYER
   Teaching steps, their interactive scenes and the comprehension
   check all come from Person B's /api/path-lessons. The bundled
   copy in src/data/lessonContent.js is the offline fallback: same
   words, but static diagrams instead of the live scenes.
   ============================================================ */

/* Static stand-ins used only when the content API is unreachable. */
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

/** Glossary terms per lesson — the fallback for when the API can't say. */
const LESSON_TERMS = {
  '1.1': ['term-formation'],
  '1.2': ['term-offside', 'term-free-kick'],
  '1.3': ['term-clean-sheet'],
  '1.4': ['term-formation'],
  '1.5': ['term-nutmeg'],
  '1.6': ['term-yellow-card', 'term-red-card', 'term-penalty-kick'],
}

export default function Lesson() {
  const { t, tr, lang } = useI18n()
  const { query, navigate } = useRouter()
  const { completedLessons, activeLesson, completeLesson, bumpStreak, celebrate } = useApp()

  const id = query.id ?? activeLesson
  const lesson = useMemo(() => LESSONS.find((l) => l.id === id) ?? LESSONS[0], [id])

  // The teaching content: steps, their scenes and the check.
  const { data, error, loading } = useResource(
    (signal) => api(`/path-lessons/${lesson.id}`, { lang, signal }),
    [lang, lesson.id],
  )
  const remote = data?.data ?? null
  const offline = Boolean(error)
  const fallback = getLessonContent(lesson.id)

  const steps = remote?.steps ?? fallback.steps
  const check = remote?.check ?? fallback.check
  const xp = remote?.xp ?? lesson.xp
  const glossaryIds = remote?.glossaryIds ?? LESSON_TERMS[lesson.id] ?? lesson.glossaryIds ?? []

  // Key terms come from Person B's glossary API — bilingual definitions the
  // lesson copy doesn't repeat.
  const { data: glossary } = useResource((signal) => api('/glossary', { lang, signal }), [lang])
  const terms = (glossary?.data ?? []).filter((term) => glossaryIds.includes(term.id))

  // step 0..n-1 are the teaching steps, step n is the comprehension check
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState(null)

  // Moving between lessons without leaving the route must start over.
  useEffect(() => {
    setStep(0)
    setPicked(null)
  }, [lesson.id])

  const totalSteps = steps.length + 1
  const onCheck = step >= steps.length
  const current = onCheck ? null : steps[step]
  const percent = Math.round(((step + 1) / totalSteps) * 100)

  const state = lessonState(lesson, completedLessons, activeLesson)
  const alreadyDone = state === 'completed'
  const chosen = picked ? check.options.find((o) => o.id === picked) : null
  // A wrong pick shows the explanation but doesn't lock in — only the right
  // answer does, so finishing the module actually requires understanding it.
  const solved = chosen?.correct === true

  const upcoming = LESSONS[LESSONS.findIndex((l) => l.id === lesson.id) + 1]

  const finish = () => {
    if (!alreadyDone) {
      completeLesson(lesson.id, xp)
      bumpStreak()
    }
    celebrate({
      title: tr(remote?.title ?? lesson.title),
      sub: tr(remote?.unlocks ?? lesson.unlocks),
      xp: alreadyDone ? 0 : xp,
      icon: 'military_tech',
      next: '/path',
      cta: upcoming ? t('lesson.backToPath') : undefined,
      secondary: upcoming
        ? { label: t('lesson.nextModule'), to: `/lesson?id=${upcoming.id}` }
        : undefined,
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

  if (loading) {
    return (
      <div className="page">
        <Loading rows={4} />
      </div>
    )
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
            <Icon name="bolt" fill />+{xp} XP
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

      <h1 className="t-headline-lg">
        {tr(remote?.detailTitle ?? lesson.detailTitle ?? lesson.title)}
      </h1>

      {offline ? (
        <p className="t-body-sm text-secondary" role="status">
          <Icon name="cloud_off" style={{ fontSize: 16, verticalAlign: '-3px' }} />{' '}
          {t('lesson.offlineScenes')}
        </p>
      ) : null}

      {onCheck ? (
        /* ---- Comprehension check ---- */
        <section className="stack stack-4">
          <span className="pill pill--green-solid">{t('lesson.checkTag')}</span>
          <h2 className="t-headline-md">{tr(check.question)}</h2>

          <div className="stack stack-3" role="radiogroup" aria-label={tr(check.question)}>
            {check.options.map((option) => {
              const isPicked = picked === option.id
              // Reveal this option's own rightness once it's been tried, but
              // only the correct one locks the question — a wrong pick can
              // be retried instead of just being shown the answer.
              const tried = isPicked && Boolean(picked)
              const tone = !tried ? '' : option.correct ? 'is-correct' : 'is-wrong'
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`qopt lesson-opt ${isPicked ? 'is-selected' : ''} ${tone}`.trim()}
                  role="radio"
                  aria-checked={isPicked}
                  disabled={solved}
                  onClick={() => setPicked(option.id)}
                >
                  <span className="qopt__check">
                    <Icon name={tried && option.correct ? 'check' : 'radio_button_unchecked'} />
                  </span>
                  <span className="qopt__body">
                    <span className="t-body-lg">{tr(option.label)}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {picked ? (
            <div className={`explain ${solved ? 'explain--good' : 'explain--bad'}`}>
              <Icon name={solved ? 'check_circle' : 'info'} fill />
              <div className="stack stack-1">
                <span className="t-headline-sm">{solved ? t('lesson.correct') : t('lesson.notQuite')}</span>
                <span className="t-body-md">{solved ? tr(check.explain) : t('lesson.tryAgain')}</span>
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        /* ---- Teaching step ---- */
        <section className="stack stack-4">
          {current.scene ? (
            <LessonScene key={current.id ?? step} scene={current.scene} label={tr(current.title)} />
          ) : (
            <LessonVisual name={current.visual} label={tr(current.title)} />
          )}
          <h2 className="t-headline-md">{tr(current.title)}</h2>
          <p className="t-body-lg text-secondary">{tr(current.body)}</p>
        </section>
      )}

      {/* ---- Key terms (glossary API) ---- */}
      {terms.length > 0 ? (
        <section className="card card--pad stack stack-3">
          <h2 className="t-headline-sm">{t('lesson.keyTerms')}</h2>
          <dl className="stack stack-2">
            {terms.map((term) => (
              <div key={term.id} className="stack stack-1">
                <dt className="t-headline-sm">{term.term}</dt>
                <dd className="t-body-md text-secondary">{term.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

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
          disabled={onCheck && !solved}
        >
          {onCheck ? t('lesson.finish') : t('common.next')}
        </FieldPressButton>
      </div>
    </div>
  )
}
