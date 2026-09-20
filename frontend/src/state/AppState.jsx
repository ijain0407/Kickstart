import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api.js'

/* ============================================================
   APP STATE
   XP, level, streak, badges and chant mastery come from the
   progress API (Person D) and are shared across devices for the
   same anonymous user id.

   What stays local: which nodes on the learning path are done
   (Person A's lesson ids), the matcher answers, and the week
   strip. Those have no server model yet — see the notes below.
   Everything is mirrored to localStorage so the UI still works
   with the API down.
   ============================================================ */

const STORAGE_KEY = 'soccerteaching.progress'

const INITIAL = {
  // Local-only view state.
  completedLessons: [],
  activeLesson: '1.1',
  weekDone: [],
  today: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
  quizAnswers: {},
  quizDone: false,
  leagueResult: null,
  // XP for actions the progress API doesn't model yet (finishing the league
  // matcher). Added on top of the server's XP for display.
  bonusXp: 0,
}

/** Server progress before the first response arrives. */
const EMPTY_PROGRESS = {
  xp: 0,
  level: 'fan',
  xpIntoLevel: 0,
  xpForNextLevel: 600,
  progressPercent: 0,
  streak: { current: 0, best: 0 },
  stats: { chantsLearned: 0, lessonsCompleted: 0, questionsAnswered: 0, correctAnswers: 0, accuracyPercent: 0 },
  badges: [],
  completedLessonIds: [],
}

const LEVEL_NUMBER = { fan: 1, enthusiast: 2, tactics_nerd: 3 }

/**
 * Person A's path has six lessons; the progress API knows five category slugs
 * (and its own list still differs from Person B's lesson ids — see the TODO in
 * quiz_feature/server/src/config/lessonIds.js). Mapping here keeps XP and
 * streaks flowing; the team should agree on one id list before launch.
 */
const LESSON_SLUG = {
  '1.1': 'rules-basics',
  '1.2': 'rules-basics',
  '1.3': 'positions',
  '1.4': 'formations',
  '1.5': 'terms-slang',
  '1.6': 'how-to-watch',
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL
    return { ...INITIAL, ...JSON.parse(raw) }
  } catch {
    return INITIAL
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(readStored)
  const [progress, setProgress] = useState(EMPTY_PROGRESS)
  const [online, setOnline] = useState(true)
  const [celebration, setCelebration] = useState(null)
  const live = useRef(true)

  useEffect(() => {
    live.current = true
    return () => {
      live.current = false
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* progress just won't persist this session */
    }
  }, [state])

  /** Pull the authoritative progress record. */
  const refresh = useCallback(async () => {
    try {
      const next = await api('/progress')
      if (!live.current) return
      setProgress({ ...EMPTY_PROGRESS, ...next })
      setOnline(true)
    } catch {
      if (live.current) setOnline(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  /** XP the API can't record yet, so the number still moves for the learner. */
  const addXp = useCallback((amount) => {
    setState((s) => ({ ...s, bonusXp: s.bonusXp + amount }))
  }, [])

  const markToday = useCallback(() => {
    setState((s) => (s.weekDone.includes(s.today) ? s : { ...s, weekDone: [...s.weekDone, s.today] }))
  }, [])

  const completeLesson = useCallback(
    async (id) => {
      setState((s) => (s.completedLessons.includes(id) ? s : { ...s, completedLessons: [...s.completedLessons, id] }))
      markToday()
      try {
        await api('/progress/lesson-complete', { method: 'POST', body: { lessonId: LESSON_SLUG[id] ?? 'rules-basics' } })
        await refresh()
      } catch {
        if (live.current) setOnline(false)
      }
    },
    [markToday, refresh],
  )

  /** Chant ids are free-form on the API, so the culture card's own id is used. */
  const masterChant = useCallback(
    async (chantId) => {
      markToday()
      try {
        await api('/progress/chant-viewed', { method: 'POST', body: { chantId } })
        await refresh()
      } catch {
        if (live.current) setOnline(false)
      }
    },
    [markToday, refresh],
  )

  const bumpStreak = markToday

  const setQuizAnswer = useCallback((stepId, optionIds) => {
    setState((s) => ({ ...s, quizAnswers: { ...s.quizAnswers, [stepId]: optionIds } }))
  }, [])

  const finishQuiz = useCallback(() => setState((s) => ({ ...s, quizDone: true })), [])

  const resetQuiz = useCallback(
    () => setState((s) => ({ ...s, quizAnswers: {}, quizDone: false, leagueResult: null })),
    [],
  )

  const setLeagueResult = useCallback((leagueResult) => setState((s) => ({ ...s, leagueResult })), [])

  const celebrate = useCallback((payload) => setCelebration(payload), [])
  const dismissCelebration = useCallback(() => setCelebration(null), [])

  const xp = progress.xpIntoLevel + state.bonusXp
  const xpPerLevel = progress.xpForNextLevel || 600

  const value = useMemo(
    () => ({
      ...state,
      // Server-backed, with the field names the existing components already read.
      xp,
      xpPerLevel,
      xpPercent: Math.min(100, Math.round((xp / xpPerLevel) * 100)),
      level: LEVEL_NUMBER[progress.level] ?? 1,
      levelId: progress.level,
      streak: progress.streak.current,
      bestStreak: progress.streak.best,
      chantsMastered: progress.stats.chantsLearned,
      badges: progress.badges,
      stats: progress.stats,
      online,
      refresh,
      addXp,
      completeLesson,
      bumpStreak,
      setQuizAnswer,
      finishQuiz,
      resetQuiz,
      setLeagueResult,
      masterChant,
      celebration,
      celebrate,
      dismissCelebration,
    }),
    [
      state,
      xp,
      xpPerLevel,
      progress,
      online,
      refresh,
      addXp,
      completeLesson,
      bumpStreak,
      setQuizAnswer,
      finishQuiz,
      resetQuiz,
      setLeagueResult,
      masterChant,
      celebration,
      celebrate,
      dismissCelebration,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
