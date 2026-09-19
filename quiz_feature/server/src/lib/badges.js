import { BADGE_TARGETS } from '../config/badges.js';
import { levelIdForXp } from './xp.js';

const rules = {
  first_whistle: (p) => p.quizHistory.length >= 1,
  perfect_score: (p, a) => Boolean(a) && a.total >= 5 && a.score === a.total,
  offside_expert: (p) => (p.stats.correctByTopic?.offside ?? 0) >= BADGE_TARGETS.offside_expert,
  formation_guru: (p) => (p.stats.correctByTopic?.formations ?? 0) >= BADGE_TARGETS.formation_guru,
  chant_collector: (p) => p.stats.chantsLearned >= BADGE_TARGETS.chant_collector,
  hat_trick: (p) => p.streak.best >= BADGE_TARGETS.hat_trick,
  week_warrior: (p) => p.streak.best >= BADGE_TARGETS.week_warrior,
  tactics_nerd: (p) => levelIdForXp(p.xp) === 'tactics_nerd',
  polyglot: (p, a) => Boolean(a) && (p.localesSeen?.length ?? 0) >= 2,
};

/**
 * Pure: given progress AFTER the update and an optional attempt result, return ids of newly earned badges.
 * @param {object} progress
 * @param {{ score: number, total: number } | null} attemptResult
 * @returns {string[]}
 */
export function evaluateBadges(progress, attemptResult = null) {
  const earned = new Set(progress.badges.map((b) => b.id));
  return Object.entries(rules)
    .filter(([id, rule]) => !earned.has(id) && rule(progress, attemptResult))
    .map(([id]) => id);
}
