import { gamificationConfig as cfg } from '../config/gamificationConfig.js';

export function xpForCorrect(difficulty) {
  return cfg.xp.correctByDifficulty[difficulty] ?? cfg.xp.correctByDifficulty[1];
}

export function levelIdForXp(xp) {
  let id = cfg.levels[0].id;
  for (const level of cfg.levels) if (xp >= level.threshold) id = level.id;
  return id;
}

export function levelInfo(xp) {
  const levels = cfg.levels;
  const idx = levels.findIndex((l) => l.id === levelIdForXp(xp));
  const current = levels[idx];
  const next = levels[idx + 1] ?? null;
  const xpIntoLevel = xp - current.threshold;
  const xpForNextLevel = next ? next.threshold - current.threshold : null;
  const progressPercent = next ? Math.min(100, Math.floor((xpIntoLevel / xpForNextLevel) * 100)) : 100;
  return {
    level: current.id,
    nextLevel: next ? next.id : null,
    xpIntoLevel,
    xpForNextLevel,
    nextLevelThreshold: next ? next.threshold : null,
    progressPercent,
  };
}

/**
 * Pure XP computation for a finished quiz attempt.
 * @param {{ correctDifficulties: number[], total: number, hintsUsed: number, streakBonus: number, battleResult?: 'win'|'draw'|'loss' }} p
 */
export function computeAttemptXp({ correctDifficulties, total, hintsUsed = 0, streakBonus = 0, battleResult }) {
  const answers = correctDifficulties.reduce((sum, d) => sum + xpForCorrect(d), 0);
  const perfect = total >= cfg.xp.perfectMinQuestions && correctDifficulties.length === total;
  const perfectBonus = perfect ? cfg.xp.perfectQuizBonus : 0;
  let battleBonus = 0;
  if (battleResult === 'win') battleBonus = cfg.xp.battleWin;
  else if (battleResult === 'draw') battleBonus = cfg.xp.battleDraw;
  const hintPenalty = hintsUsed * cfg.xp.hintCost;
  const xpEarned = Math.max(0, answers + perfectBonus + battleBonus + streakBonus - hintPenalty);
  return { xpEarned, perfect, breakdown: { answers, perfectBonus, battleBonus, streakBonus, hintPenalty } };
}
