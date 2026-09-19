export function defaultProgress(userId) {
  return {
    userId,
    xp: 0,
    level: 'fan',
    streak: { current: 0, best: 0, lastActiveDate: null },
    quizHistory: [],
    lessonHistory: [],
    badges: [],
    completedLessonIds: [],
    viewedChantIds: [],
    localesSeen: [],
    stats: { questionsAnswered: 0, correctAnswers: 0, chantsLearned: 0, correctByTopic: {} },
    bestScores: {},
  };
}

export function createProgressRepo(store) {
  return {
    get: (userId) => store.get(userId) ?? defaultProgress(userId),
    save: (progress) => store.set(progress.userId, progress),
    reset: (userId) => {
      const fresh = defaultProgress(userId);
      store.set(userId, fresh);
      return fresh;
    },
  };
}
