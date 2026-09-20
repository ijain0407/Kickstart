import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import DataState from '../components/DataState.jsx'
import { api, useResource } from '../lib/api.js'
import { LESSONS } from '../../../shared/lessons.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/**
 * Knowledge drills, played on the quiz engine (Person D): it picks the
 * questions, marks the answers server-side and awards the XP, streak and
 * badges. Lesson names come from the lessons API (Person B), matched through
 * shared/lessons.js — the only place the three id schemes line up.
 */
export default function Drills() {
  const { t, lang } = useI18n()
  const { navigate } = useRouter()
  const { refresh, celebrate } = useApp()

  const [attempt, setAttempt] = useState(null)
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [hint, setHint] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const lessons = useResource((signal) => api('/lessons', { lang, signal }), [lang])

  /** Lesson slug -> the title Person B wrote for it. */
  const titleFor = (quizSlug) => {
    const canonical = LESSONS.find((l) => l.quizSlug === quizSlug)?.lessonId
    const lesson = lessons.data?.data?.find((l) => l.id === canonical)
    return lesson?.title ?? quizSlug
  }

  const start = async (mode, lesson) => {
    setBusy(true)
    setError(null)
    try {
      const started = await api('/quiz/attempts', { method: 'POST', lang, body: { mode, ...(lesson ? { lesson } : {}) } })
      setAttempt(started)
      setIndex(0)
      setFeedback(null)
      setHint(null)
      setResult(null)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const answer = async (optionId) => {
    const question = attempt.questions[index]
    setBusy(true)
    try {
      const res = await api('/quiz/answer', {
        method: 'POST',
        lang,
        body: { questionId: question.id, optionId, attemptId: attempt.attemptId },
      })
      setFeedback(res)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const askHint = async () => {
    const question = attempt.questions[index]
    try {
      setHint(await api('/quiz/hint', { method: 'POST', lang, body: { questionId: question.id, attemptId: attempt.attemptId } }))
    } catch (err) {
      setError(err)
    }
  }

  const next = async () => {
    setFeedback(null)
    setHint(null)
    if (index + 1 < attempt.questions.length) {
      setIndex(index + 1)
      return
    }
    setBusy(true)
    try {
      const done = await api(`/quiz/attempts/${attempt.attemptId}/complete`, { method: 'POST', lang })
      setResult(done)
      await refresh()
      celebrate({
        title: t('drills.completeTitle'),
        sub: `${done.score} / ${done.total}`,
        xp: done.xpEarned,
        icon: 'military_tech',
      })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  /* ---- Result ---- */
  if (result) {
    return (
      <div className="page">
        <div className="stack stack-2">
          <span className="t-label-meta text-secondary">{t('drills.kicker')}</span>
          <h1 className="t-headline-xl">{t('drills.completeTitle')}</h1>
        </div>

        <section className="card card--pad-lg stack stack-3" style={{ textAlign: 'center' }}>
          <span className="score-num t-num" style={{ fontSize: 48 }}>
            {result.score} / {result.total}
          </span>
          <p className="t-body-md text-secondary">{t('drills.scoreSub')}</p>
          <div className="bounty">
            <Icon name="bolt" fill style={{ color: 'var(--gold-rim)', fontSize: 24 }} />
            <span className="t-headline-sm grow" style={{ color: 'var(--gold-badge-text)' }}>
              +{result.xpEarned} {t('common.xp')}
            </span>
          </div>
          {result.levelAfter !== result.levelBefore ? <span className="pill pill--gold">{t('drills.levelUp')}</span> : null}
          {result.newBadges?.length ? (
            <div className="row row-2 wrap" style={{ justifyContent: 'center' }}>
              {result.newBadges.map((badge) => (
                <span key={badge} className="pill pill--lavender">
                  <Icon name="military_tech" fill />
                  {badge.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <FieldPressButton variant="primary" block icon="restart_alt" onClick={() => start('quick')}>
          {t('drills.again')}
        </FieldPressButton>
        <FieldPressButton variant="soft" block icon="arrow_back" onClick={() => navigate('/')}>
          {t('drills.backToLearn')}
        </FieldPressButton>
      </div>
    )
  }

  /* ---- Playing ---- */
  if (attempt) {
    const question = attempt.questions[index]
    const total = attempt.questions.length
    const percent = Math.round(((index + 1) / total) * 100)

    return (
      <div className="page">
        <div className="quiz-head">
          <div className="row row-3">
            <button type="button" className="icon-btn icon-btn--outline" aria-label={t('common.close')} onClick={() => setAttempt(null)}>
              <Icon name="close" />
            </button>
            <div className="grow stack stack-1">
              <span className="t-label-meta text-secondary">{t('drills.kicker')}</span>
              <span className="t-headline-sm">{`${t('quiz.step')} ${index + 1} ${t('quiz.stepOf')} ${total}`}</span>
            </div>
            {question.hasHint && !hint && !feedback ? (
              <button type="button" className="pill pill--grey" onClick={askHint}>
                <Icon name="lightbulb" />
                {t('drills.hint')}
              </button>
            ) : null}
          </div>

          <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress__fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <h1 className="t-headline-lg">{question.prompt}</h1>

        {hint ? (
          <p className="t-body-md text-secondary">
            <Icon name="lightbulb" style={{ fontSize: 16, verticalAlign: '-3px' }} /> {hint.hint}
          </p>
        ) : null}

        <div className="stack stack-3" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((option) => {
            const chosen = feedback?.selectedOptionId === option.id
            const isAnswer = feedback && feedback.correctOptionId === option.id
            const tone = isAnswer ? 'is-correct' : chosen ? 'is-wrong' : ''
            return (
              <button
                key={option.id}
                type="button"
                className={`qopt lesson-opt ${tone}`.trim()}
                role="radio"
                aria-checked={chosen}
                disabled={Boolean(feedback) || busy}
                onClick={() => answer(option.id)}
              >
                <span className="qopt__check">
                  <Icon name={isAnswer ? 'check' : 'radio_button_unchecked'} />
                </span>
                <span className="qopt__body">
                  <span className="t-body-lg">{option.text}</span>
                </span>
              </button>
            )
          })}
        </div>

        {feedback ? (
          <>
            <div className={`explain ${feedback.correct ? 'explain--good' : 'explain--bad'}`}>
              <Icon name={feedback.correct ? 'check_circle' : 'info'} fill />
              <div className="stack stack-1">
                <span className="t-headline-sm">{feedback.correct ? t('lesson.correct') : t('lesson.notQuite')}</span>
                <span className="t-body-md">{feedback.explanation}</span>
              </div>
            </div>

            <div className="quiz-actions">
              <FieldPressButton variant="primary" block iconAfter="arrow_forward" onClick={next} disabled={busy}>
                {index + 1 < total ? t('common.next') : t('drills.finish')}
              </FieldPressButton>
            </div>
          </>
        ) : null}

        {error ? <p className="placeholder-note">{t('common.loadError')}</p> : null}
      </div>
    )
  }

  /* ---- Start ---- */
  return (
    <div className="page">
      <div className="stack stack-2">
        <h1 className="t-headline-lg">{t('drills.title')}</h1>
        <p className="t-body-md text-secondary">{t('drills.sub')}</p>
      </div>

      {error ? <p className="placeholder-note">{t('common.loadError')}</p> : null}

      <FieldPressButton variant="primary" block icon="bolt" onClick={() => start('quick')} disabled={busy}>
        {t('drills.quick')}
      </FieldPressButton>

      <DataState loading={lessons.loading} error={lessons.error} onRetry={lessons.reload}>
        <div className="stack stack-3">
          <h2 className="t-headline-md">{t('drills.byLesson')}</h2>
          {LESSONS.map((lesson) => (
            <button
              key={lesson.quizSlug}
              type="button"
              className="card chant-row"
              onClick={() => start('lesson', lesson.quizSlug)}
              disabled={busy}
            >
              <span className="tile tile--lavender tile--circle">
                <Icon name="menu_book" fill />
              </span>
              <span className="grow stack stack-1">
                <span className="t-headline-sm">{titleFor(lesson.quizSlug)}</span>
              </span>
              <span className="icon-btn icon-btn--chevron">
                <Icon name="chevron_right" />
              </span>
            </button>
          ))}
        </div>
      </DataState>
    </div>
  )
}
