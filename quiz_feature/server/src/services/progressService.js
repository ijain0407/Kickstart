import { gamificationConfig as cfg } from '../config/gamificationConfig.js';
import { badgeCatalog, BADGE_TARGETS } from '../config/badges.js';
import { lessonIds } from '../config/lessonIds.js';
import { evaluateBadges } from '../lib/badges.js';
import { badRequest } from '../lib/errors.js';
import { levelIdForXp, levelInfo } from '../lib/xp.js';
import { streakBonusXp, updateStreak } from '../lib/streak.js';

export function awardBadges(progress, attemptResult, now) {
  const ids = evaluateBadges(progress, attemptResult);
  for (const id of ids) progress.badges.push({ id, earnedAt: now.toISOString() });
  return ids;
}

export function badgeProgress(progress) {
  const t = BADGE_TARGETS;
  const s = progress.stats;
  return {
    offside_expert: { current: s.correctByTopic?.offside ?? 0, target: t.offside_expert },
    formation_guru: { current: s.correctByTopic?.formations ?? 0, target: t.formation_guru },
    chant_collector: { current: s.chantsLearned, target: t.chant_collector },
    hat_trick: { current: progress.streak.best, target: t.hat_trick },
    week_warrior: { current: progress.streak.best, target: t.week_warrior },
  };
}

export function createProgressService({ progressRepo, now = () => new Date() }) {
  const view = (progress) => {
    const info = levelInfo(progress.xp);
    return {
      userId: progress.userId,
      xp: progress.xp,
      ...info,
      streak: progress.streak,
      stats: {
        questionsAnswered: progress.stats.questionsAnswered,
        correctAnswers: progress.stats.correctAnswers,
        chantsLearned: progress.stats.chantsLearned,
        lessonsCompleted: progress.completedLessonIds.length,
        accuracyPercent: progress.stats.questionsAnswered
          ? Math.round((progress.stats.correctAnswers / progress.stats.questionsAnswered) * 100)
          : 0,
      },
      badges: progress.badges,
      completedLessonIds: progress.completedLessonIds,
      matchedLeagueId: progress.matchedLeagueId ?? null,
      bestScores: progress.bestScores,
      history: [
        ...progress.quizHistory.map((h) => ({ kind: 'quiz', ...h })),
        ...progress.lessonHistory.map((h) => ({ kind: 'lesson', ...h })),
      ]
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
        .slice(0, cfg.historyLimit),
    };
  };

  return {
    view,
    get: (userId) => view(progressRepo.get(userId)),

    badges(userId) {
      const progress = progressRepo.get(userId);
      const earned = new Map(progress.badges.map((b) => [b.id, b.earnedAt]));
      const prog = badgeProgress(progress);
      return badgeCatalog.map((b) => ({
        id: b.id,
        icon: b.icon,
        earned: earned.has(b.id),
        earnedAt: earned.get(b.id) ?? null,
        progress: prog[b.id] ?? null,
      }));
    },

    lessonComplete(userId, { lessonId, clientDate }) {
      if (!lessonIds.includes(lessonId)) throw badRequest(`Unknown lessonId "${lessonId}"`, 'UNKNOWN_LESSON');
      const progress = progressRepo.get(userId);
      const levelBefore = levelIdForXp(progress.xp);
      const alreadyCompleted = progress.completedLessonIds.includes(lessonId);
      const { streak, firstActivityToday } = updateStreak(progress.streak, clientDate);
      progress.streak = streak;
      const streakBonus = firstActivityToday ? streakBonusXp(streak.current) : 0;
      const lessonXp = alreadyCompleted ? 0 : cfg.xp.lessonComplete;
      const xpEarned = lessonXp + streakBonus;
      if (!alreadyCompleted) {
        progress.completedLessonIds.push(lessonId);
        progress.lessonHistory.unshift({ lessonId, xpEarned, completedAt: now().toISOString() });
        progress.lessonHistory = progress.lessonHistory.slice(0, cfg.historyLimit);
      }
      progress.xp += xpEarned;
      progress.level = levelIdForXp(progress.xp);
      const newBadges = awardBadges(progress, null, now());
      progressRepo.save(progress);
      return { alreadyCompleted, xpEarned, levelBefore, levelAfter: progress.level, newBadges, streak: progress.streak };
    },

    chantViewed(userId, { chantId, clientDate }) {
      const progress = progressRepo.get(userId);
      const levelBefore = levelIdForXp(progress.xp);
      const alreadyViewed = progress.viewedChantIds.includes(chantId);
      if (!alreadyViewed) {
        progress.viewedChantIds.push(chantId);
        progress.stats.chantsLearned = progress.viewedChantIds.length;
      }
      // Learning a chant is study too: it earns XP once and counts for the streak.
      const { streak, firstActivityToday } = updateStreak(progress.streak, clientDate);
      progress.streak = streak;
      const streakBonus = firstActivityToday ? streakBonusXp(streak.current) : 0;
      const xpEarned = (alreadyViewed ? 0 : cfg.xp.chantLearned) + streakBonus;
      progress.xp += xpEarned;
      progress.level = levelIdForXp(progress.xp);
      const newBadges = awardBadges(progress, null, now());
      progressRepo.save(progress);
      return {
        alreadyViewed,
        chantsLearned: progress.stats.chantsLearned,
        xpEarned,
        levelBefore,
        levelAfter: progress.level,
        newBadges,
        streak: progress.streak,
      };
    },

    /** The league matcher: XP once, whichever league it lands on. */
    leagueMatched(userId, { leagueId, clientDate }) {
      const progress = progressRepo.get(userId);
      const levelBefore = levelIdForXp(progress.xp);
      const alreadyMatched = Boolean(progress.matchedLeagueId);
      const { streak, firstActivityToday } = updateStreak(progress.streak, clientDate);
      progress.streak = streak;
      const streakBonus = firstActivityToday ? streakBonusXp(streak.current) : 0;
      const xpEarned = (alreadyMatched ? 0 : cfg.xp.leagueMatched) + streakBonus;
      progress.matchedLeagueId = leagueId;
      progress.xp += xpEarned;
      progress.level = levelIdForXp(progress.xp);
      const newBadges = awardBadges(progress, null, now());
      progressRepo.save(progress);
      return {
        alreadyMatched,
        matchedLeagueId: leagueId,
        xpEarned,
        levelBefore,
        levelAfter: progress.level,
        newBadges,
        streak: progress.streak,
      };
    },

    reset: (userId) => view(progressRepo.reset(userId)),
  };
}
