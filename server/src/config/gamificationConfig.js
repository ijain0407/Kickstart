// All tunable gamification numbers live here.
export const gamificationConfig = {
  xp: {
    correctByDifficulty: { 1: 10, 2: 15, 3: 20 },
    perfectQuizBonus: 25,
    perfectMinQuestions: 5,
    lessonComplete: 50,
    streakBonusPerDay: 5,
    streakBonusMaxDays: 7,
    battleWin: 30,
    battleDraw: 10,
    hintCost: 5,
  },
  levels: [
    { id: 'fan', threshold: 0 },
    { id: 'enthusiast', threshold: 300 },
    { id: 'tactics_nerd', threshold: 900 },
  ],
  quiz: {
    quickCount: 5,
    lessonCount: 5,
    maxCount: 20,
    difficultyMix: { 1: 0.4, 2: 0.4, 3: 0.2 },
    hintsEnabled: true,
  },
  battle: {
    accuracy: { easy: 0.6, medium: 0.75, hard: 0.9 },
    delayMs: [1500, 5000],
  },
  historyLimit: 50,
};
