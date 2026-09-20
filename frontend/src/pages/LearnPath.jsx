import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import XPBar from '../components/XPBar.jsx'
import WeekStrip from '../components/WeekStrip.jsx'
import LessonNode from '../components/LessonNode.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import { Loading } from '../components/DataState.jsx'
import { LESSONS as LOCAL_LESSONS, lessonState } from '../data/lessons.js'
import { toPathNode } from '../lib/adapters.js'
import { api, useResource } from '../lib/api.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/* Horizontal centre of a row, as a percentage, used to draw the link. */
const ALIGN_X = { left: 26, center: 50, right: 74 }

/** One curved chalk link drawn in the 32px gap between two nodes. */
function PathLink({ from, to, solid }) {
  const x1 = ALIGN_X[from]
  const x2 = ALIGN_X[to]
  return (
    <div className="path__link" aria-hidden="true">
      <svg viewBox="0 0 100 32" preserveAspectRatio="none">
        <path
          d={`M ${x1} 0 C ${x1} 16, ${x2} 16, ${x2} 32`}
          fill="none"
          stroke={solid ? 'var(--pitch-green)' : '#d7dbe8'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={solid ? undefined : '2 7'}
        />
      </svg>
    </div>
  )
}

export default function LearnPath() {
  const { t, tr, lang } = useI18n()
  const { navigate } = useRouter()
  const {
    xp,
    xpPerLevel,
    streak,
    completedLessons,
    activeLesson,
  } = useApp()

  // The unit is served by Person B's path-lessons API; the bundled nodes are
  // the fallback so the path still draws with the API down.
  const { data, error, loading } = useResource(
    (signal) => api('/path-lessons', { lang, signal }),
    [lang],
  )
  const lessons = error || !data?.data?.length ? LOCAL_LESSONS : data.data.map(toPathNode)

  const [selectedId, setSelectedId] = useState(activeLesson)
  const [lockedNotice, setLockedNotice] = useState(false)

  const selected = lessons.find((l) => l.id === selectedId) ?? lessons[0]
  const selectedState = lessonState(selected, completedLessons, activeLesson, lessons)

  const doneCount = completedLessons.filter((id) =>
    lessons.some((l) => l.id === id),
  ).length

  const startLesson = (id = selected.id) => navigate(`/lesson?id=${id}`)

  /**
   * Tapping a node previews it in the detail card; tapping the node already
   * being previewed opens it. Two taps rather than one so the bounty and the
   * step count still get a chance to be read.
   */
  const handleSelect = (lesson, state) => {
    if (state === 'locked') {
      setLockedNotice(true)
      return
    }
    setLockedNotice(false)
    if (lesson.id === selectedId) {
      startLesson(lesson.id)
      return
    }
    setSelectedId(lesson.id)
  }

  return (
    <div className="page">
      {/* ---- Division summary ---- */}
      <section className="card card--pad division">
        <div className="row row-3">
          <span className="tile tile--gold tile--lg">
            <Icon name="military_tech" fill />
          </span>
          <div className="grow stack stack-1">
            <span className="t-label-meta text-secondary">{t('path.activeDivision')}</span>
            <h1 className="t-headline-md">{t('path.levelName')}</h1>
          </div>
          <span className="pill pill--gold">
            <Icon name="local_fire_department" fill />
            <span className="t-num" style={{ fontSize: 14 }}>
              {streak}
            </span>
            {t('path.streakUnit')}
          </span>
        </div>

        <div className="stack stack-2">
          <span className="t-body-md text-secondary">
            {`${xp} / ${xpPerLevel} ${t('path.xpToNextSuffix')}`}
          </span>
          <XPBar value={xp} max={xpPerLevel} />
        </div>

        <WeekStrip />
      </section>

      {/* ---- Unit header ---- */}
      <div className="section-head">
        <div className="stack stack-1">
          <span className="t-label-meta text-secondary">{t('path.unitLabel')}</span>
          <h2 className="t-headline-lg">{t('path.unitTitle')}</h2>
        </div>
        <span className="pill pill--green">
          {`${doneCount} / ${lessons.length} ${t('path.doneSuffix')}`}
        </span>
      </div>

      {loading ? (
        <Loading rows={3} />
      ) : (
        <>
          {/* ---- The winding path ---- */}
          <section className="path">
            {lessons.map((lesson, i) => {
              const state = lessonState(lesson, completedLessons, activeLesson, lessons)
              const prev = lessons[i - 1]
              return (
                <div key={lesson.id}>
                  {prev ? (
                    <PathLink
                      from={prev.align}
                      to={lesson.align}
                      solid={completedLessons.includes(prev.id)}
                    />
                  ) : null}
                  <div className="path__row" data-align={lesson.align}>
                    <LessonNode
                      lesson={lesson}
                      state={state}
                      title={tr(lesson.title)}
                      tagText={t('path.startDrill')}
                      onSelect={handleSelect}
                      isFocused={lesson.id === selectedId}
                    />
                  </div>
                </div>
              )
            })}
          </section>

          {lockedNotice ? (
            <p className="t-body-md text-secondary" role="status" style={{ textAlign: 'center' }}>
              <Icon name="lock" style={{ fontSize: 16, verticalAlign: '-3px' }} />{' '}
              {t('path.lockedMsg')}
            </p>
          ) : null}

          {/* ---- Lesson detail ---- */}
          <section className="card card--pad lesson-detail">
            <div className="row row-2 wrap">
              <span className="pill pill--green-solid">{t('path.readyToPlay')}</span>
              <span className="pill pill--grey">
                <Icon name="schedule" />
                {`${selected.minutes} ${t('path.bitesizeUnit')}`}
              </span>
              {selected.stepCount ? (
                <span className="pill pill--grey">
                  <Icon name="menu_book" />
                  {`${selected.stepCount} ${t('path.stepsSuffix')}`}
                </span>
              ) : null}
            </div>

            <h2 className="t-headline-md">{tr(selected.detailTitle ?? selected.title)}</h2>

            <div className="inset-lavender">
              <span className="tile tile--greensolid">
                <Icon name="flag" fill />
              </span>
              <p className="t-body-md">{tr(selected.desc)}</p>
            </div>

            <div className="bounty">
              <Icon name="bolt" fill style={{ color: 'var(--gold-rim)', fontSize: 24 }} />
              <div className="stack stack-1 grow">
                <span className="t-headline-sm" style={{ color: 'var(--gold-badge-text)' }}>
                  {tr(selected.bounty)}
                </span>
                <span className="t-body-sm" style={{ color: 'var(--gold-badge-text)' }}>
                  {tr(selected.unlocks)}
                </span>
              </div>
            </div>

            <FieldPressButton
              variant="primary"
              block
              iconAfter="play_arrow"
              onClick={() => startLesson()}
              disabled={selectedState === 'locked'}
            >
              {t('path.startLesson')}
            </FieldPressButton>

            <FieldPressButton
              variant="soft"
              block
              icon="science"
              onClick={() => navigate('/field')}
            >
              {t('path.practice')}
            </FieldPressButton>

            <p className="quote-foot">{t('path.footQuote')}</p>
          </section>
        </>
      )}
    </div>
  )
}
