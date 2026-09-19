import { gamificationConfig as cfg } from '../config/gamificationConfig.js';

/**
 * Bot interface: `plan(question) -> { optionId, correct, delayMs }`.
 * The scripted bot decides its answer up front from a fixed accuracy. A real-time PvP mode
 * (WebSocket) could replace this by implementing the same `plan` contract per opponent.
 */
export function createScriptedBot({ difficulty = 'medium', rng = Math.random } = {}) {
  const accuracy = cfg.battle.accuracy[difficulty] ?? cfg.battle.accuracy.medium;
  const [minDelay, maxDelay] = cfg.battle.delayMs;
  return {
    name: 'bot',
    difficulty,
    plan(question) {
      const correct = rng() < accuracy;
      const wrong = question.options.filter((o) => o.id !== question.correctOptionId);
      const pick = correct ? question.correctOptionId : wrong[Math.floor(rng() * wrong.length)].id;
      return { optionId: pick, correct, delayMs: Math.round(minDelay + rng() * (maxDelay - minDelay)) };
    },
  };
}

export const botDifficulties = Object.keys(cfg.battle.accuracy);
