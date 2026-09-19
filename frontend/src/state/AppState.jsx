import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

/* ============================================================
   APP STATE
   XP, streak, lesson completion, quiz answers and the league
   ranking. Persisted to localStorage so progress survives a
   reload; every read is guarded because storage can be blocked.
   ============================================================ */

const STORAGE_KEY = 'soccerteaching.progress'

const INITIAL = {
  xp: 450,
  xpPerLevel: 600,
  level: 1,
  streak: 4,
  // Lesson ids the learner has finished. 1.1 ships done so the path
  // opens on the same state as the source screens.
  completedLessons: ['1.1'],
  activeLesson: '1.2',
  // Days of the current week already trained (0 = Monday).
  weekDone: [0, 1, 2],
  today: 3,
  quizAnswers: {},
  quizDone: false,
  chantsMastered: 1,
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL
    const parsed = JSON.parse(raw)
    return { ...INITIAL, ...parsed }
  } catch {
    return INITIAL
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(readStored)
  // Celebration drawer payload: { title, sub, xp } or null.
  const [celebration, setCelebration] = useState(null)
  const xpTimer = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* progress just won't persist this session */
    }
  }, [state])

  useEffect(() => () => clearTimeout(xpTimer.current), [])

  const addXp = useCallback((amount) => {
    setState((s) => {
      let xp = s.xp + amount
      let level = s.level
      // Roll over as many levels as the award covers.
      while (xp >= s.xpPerLevel) {
        xp -= s.xpPerLevel
        level += 1
      }
      return { ...s, xp, level }
    })
  }, [])

  const completeLesson = useCallback((id, xpReward = 50) => {
    setState((s) => {
      if (s.completedLessons.includes(id)) return s
      const completedLessons = [...s.completedLessons, id]
      let xp = s.xp + xpReward
      let level = s.level
      while (xp >= s.xpPerLevel) {
        xp -= s.xpPerLevel
        level += 1
      }
      return { ...s, completedLessons, xp, level }
    })
  }, [])

  const bumpStreak = useCallback(() => {
    setState((s) => {
      if (s.weekDone.includes(s.today)) return s
      return { ...s, streak: s.streak + 1, weekDone: [...s.weekDone, s.today] }
    })
  }, [])

  const setQuizAnswer = useCallback((stepId, optionIds) => {
    setState((s) => ({ ...s, quizAnswers: { ...s.quizAnswers, [stepId]: optionIds } }))
  }, [])

  const finishQuiz = useCallback(() => {
    setState((s) => ({ ...s, quizDone: true }))
  }, [])

  const resetQuiz = useCallback(() => {
    setState((s) => ({ ...s, quizAnswers: {}, quizDone: false }))
  }, [])

  const masterChant = useCallback(() => {
    setState((s) => ({ ...s, chantsMastered: Math.min(4, s.chantsMastered + 1) }))
  }, [])

  const celebrate = useCallback((payload) => setCelebration(payload), [])
  const dismissCelebration = useCallback(() => setCelebration(null), [])

  const value = useMemo(
    () => ({
      ...state,
      xpPercent: Math.min(100, Math.round((state.xp / state.xpPerLevel) * 100)),
      addXp,
      completeLesson,
      bumpStreak,
      setQuizAnswer,
      finishQuiz,
      resetQuiz,
      masterChant,
      celebration,
      celebrate,
      dismissCelebration,
    }),
    [
      state,
      addXp,
      completeLesson,
      bumpStreak,
      setQuizAnswer,
      finishQuiz,
      resetQuiz,
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
