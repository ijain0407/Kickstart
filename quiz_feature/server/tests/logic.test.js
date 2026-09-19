import { describe, expect, it } from 'vitest';
import { computeAttemptXp, levelIdForXp, levelInfo, xpForCorrect } from '../src/lib/xp.js';
import { resolveClientDate, streakBonusXp, updateStreak } from '../src/lib/streak.js';
import { evaluateBadges } from '../src/lib/badges.js';
import { selectQuestions } from '../src/lib/selection.js';
import { defaultProgress } from '../src/repos/progressRepo.js';
import { createQuizRepo } from '../src/repos/quizRepo.js';
import { validateQuestions } from '../scripts/validate-questions.js';

describe('xp & levels', () => {
  it('awards XP by difficulty', () => {
    expect([1, 2, 3].map(xpForCorrect)).toEqual([10, 15, 20]);
  });

  it('crosses level thresholds at 300 and 900', () => {
    expect([0, 299, 300, 899, 900, 5000].map(levelIdForXp)).toEqual(['fan', 'fan', 'enthusiast', 'enthusiast', 'tactics_nerd', 'tactics_nerd']);
  });

  it('computes progress toward the next level', () => {
    expect(levelInfo(150)).toMatchObject({ level: 'fan', xpIntoLevel: 150, xpForNextLevel: 300, progressPercent: 50 });
    expect(levelInfo(600)).toMatchObject({ level: 'enthusiast', xpIntoLevel: 300, xpForNextLevel: 600, progressPercent: 50 });
    expect(levelInfo(1200)).toMatchObject({ level: 'tactics_nerd', nextLevel: null, progressPercent: 100 });
  });

  it('adds a perfect bonus only for 5+ questions', () => {
    const five = computeAttemptXp({ correctDifficulties: [1, 1, 1, 1, 1], total: 5, streakBonus: 0 });
    expect(five).toMatchObject({ xpEarned: 75, perfect: true });
    const three = computeAttemptXp({ correctDifficulties: [1, 1, 1], total: 3, streakBonus: 0 });
    expect(three).toMatchObject({ xpEarned: 30, perfect: false });
  });

  it('applies streak bonus and hint cost, never going negative', () => {
    expect(computeAttemptXp({ correctDifficulties: [2], total: 5, streakBonus: 10, hintsUsed: 1 }).xpEarned).toBe(20);
    expect(computeAttemptXp({ correctDifficulties: [], total: 5, hintsUsed: 3 }).xpEarned).toBe(0);
  });

  it('awards battle bonuses', () => {
    expect(computeAttemptXp({ correctDifficulties: [], total: 5, battleResult: 'win' }).xpEarned).toBe(30);
    expect(computeAttemptXp({ correctDifficulties: [], total: 5, battleResult: 'draw' }).xpEarned).toBe(10);
  });
});

describe('streaks', () => {
  const fresh = { current: 0, best: 0, lastActiveDate: null };

  it('starts at 1 on first activity', () => {
    const r = updateStreak(fresh, '2026-03-01');
    expect(r.streak).toEqual({ current: 1, best: 1, lastActiveDate: '2026-03-01' });
    expect(r.firstActivityToday).toBe(true);
  });

  it('does not change on the same day', () => {
    const s = { current: 2, best: 2, lastActiveDate: '2026-03-01' };
    const r = updateStreak(s, '2026-03-01');
    expect(r.streak).toEqual(s);
    expect(r.firstActivityToday).toBe(false);
  });

  it('increments on consecutive days, including month and year boundaries', () => {
    expect(updateStreak({ current: 2, best: 2, lastActiveDate: '2026-02-28' }, '2026-03-01').streak.current).toBe(3);
    expect(updateStreak({ current: 4, best: 4, lastActiveDate: '2025-12-31' }, '2026-01-01').streak.current).toBe(5);
  });

  it('resets to 1 after a gap but keeps best', () => {
    const r = updateStreak({ current: 5, best: 5, lastActiveDate: '2026-03-01' }, '2026-03-03');
    expect(r.streak).toEqual({ current: 1, best: 5, lastActiveDate: '2026-03-03' });
  });

  it('ignores a clock that went backwards', () => {
    const s = { current: 3, best: 3, lastActiveDate: '2026-03-05' };
    expect(updateStreak(s, '2026-03-04')).toEqual({ streak: s, firstActivityToday: false });
  });

  it('caps the streak bonus at 7 days', () => {
    expect([1, 3, 7, 12].map(streakBonusXp)).toEqual([5, 15, 35, 35]);
  });

  it('resolves the client date from header, timezone, or UTC', () => {
    const now = new Date('2026-03-01T02:30:00Z');
    expect(resolveClientDate({ clientDate: '2026-02-28', now })).toBe('2026-02-28');
    expect(resolveClientDate({ timezone: 'America/Los_Angeles', now })).toBe('2026-02-28');
    expect(resolveClientDate({ timezone: 'Pacific/Auckland', now })).toBe('2026-03-01');
    expect(resolveClientDate({ clientDate: 'garbage', timezone: 'Not/AZone', now })).toBe('2026-03-01');
  });
});

describe('badges', () => {
  const base = () => defaultProgress('u');
  const withQuiz = (p) => ({ ...p, quizHistory: [{}] });

  it('awards first_whistle after the first quiz', () => {
    expect(evaluateBadges(base(), null)).toEqual([]);
    expect(evaluateBadges(withQuiz(base()), { score: 1, total: 5 })).toEqual(['first_whistle']);
  });

  it('awards perfect_score only for 100% on 5+ questions', () => {
    expect(evaluateBadges(withQuiz(base()), { score: 5, total: 5 })).toContain('perfect_score');
    expect(evaluateBadges(withQuiz(base()), { score: 3, total: 3 })).not.toContain('perfect_score');
    expect(evaluateBadges(withQuiz(base()), { score: 4, total: 5 })).not.toContain('perfect_score');
  });

  it('awards topic, chant, streak and level badges', () => {
    const p = base();
    p.stats.correctByTopic = { offside: 5, formations: 5 };
    p.stats.chantsLearned = 5;
    p.streak = { current: 7, best: 7, lastActiveDate: '2026-01-01' };
    p.xp = 900;
    expect(evaluateBadges(p, null).sort()).toEqual(['chant_collector', 'formation_guru', 'hat_trick', 'offside_expert', 'tactics_nerd', 'week_warrior']);
  });

  it('awards polyglot only after a quiz with 2+ locales', () => {
    const p = withQuiz(base());
    p.localesSeen = ['en', 'es'];
    expect(evaluateBadges(p, { score: 1, total: 5 })).toContain('polyglot');
    expect(evaluateBadges(p, null)).not.toContain('polyglot');
  });

  it('never re-awards an earned badge', () => {
    const p = withQuiz(base());
    p.badges = [{ id: 'first_whistle', earnedAt: 'x' }];
    expect(evaluateBadges(p, { score: 1, total: 5 })).toEqual([]);
  });
});

describe('question selection', () => {
  const pool = createQuizRepo().all();

  it('never repeats a question', () => {
    for (let i = 0; i < 50; i++) {
      const ids = selectQuestions(pool, { mode: 'quick', count: 10 }).map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('filters by lesson', () => {
    const qs = selectQuestions(pool, { mode: 'lesson', lesson: 'positions', count: 5 });
    expect(qs).toHaveLength(5);
    expect(qs.every((q) => q.lessonId === 'positions')).toBe(true);
  });

  it('spreads difficulty roughly 40/40/20 in quick mode', () => {
    const qs = selectQuestions(pool, { mode: 'quick', count: 10 });
    const by = (d) => qs.filter((q) => q.difficulty === d).length;
    expect([by(1), by(2), by(3)]).toEqual([4, 4, 2]);
  });

  it('caps at the available number of questions', () => {
    expect(selectQuestions(pool, { mode: 'quick', count: 500 })).toHaveLength(pool.length);
  });
});

describe('question bank', () => {
  it('has 40+ valid bilingual questions', () => {
    const pool = createQuizRepo().all();
    expect(pool.length).toBeGreaterThanOrEqual(40);
    expect(validateQuestions(pool)).toEqual([]);
  });

  it('flags broken questions', () => {
    const bad = [{ id: 'x', lessonId: 'positions', difficulty: 1, prompt: { en: 'a', es: '' }, explanation: { en: 'a', es: 'a' }, hint: { en: 'a', es: 'a' }, options: [{ id: 'a', text: { en: 'a', es: 'a' } }, { id: 'b', text: { en: 'b', es: 'b' } }], correctOptionId: 'z' }];
    expect(validateQuestions(bad).join('\n')).toMatch(/empty "es"|correctOptionId/);
  });
});
