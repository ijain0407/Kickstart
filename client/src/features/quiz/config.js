// Client-side feature flags for the quiz screen. Server-side numbers live in server/src/config.
export const quizConfig = {
  livesEnabled: false,
  lives: 3,
  hintsEnabled: true,
  hintCost: 5, // keep in sync with server gamificationConfig.xp.hintCost
  battleEnabled: false, // Tier 3 entry point stays hidden until built
};

export const LESSON_IDS = ['rules-basics', 'positions', 'formations', 'terms-slang', 'how-to-watch'];
