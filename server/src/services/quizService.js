import { randomUUID } from 'node:crypto';
import { gamificationConfig as cfg } from '../config/gamificationConfig.js';
import { lessonIds } from '../config/lessonIds.js';
import { badRequest, conflict, notFound, AppError } from '../lib/errors.js';
import { loc } from '../lib/localize.js';
import { selectQuestions } from '../lib/selection.js';
import { computeAttemptXp, levelIdForXp, levelInfo } from '../lib/xp.js';
import { streakBonusXp, updateStreak } from '../lib/streak.js';
import { awardBadges } from './progressService.js';

export function toPublicQuestion(q, locale) {
  return {
    id: q.id,
    lessonId: q.lessonId,
    topic: q.topic,
    difficulty: q.difficulty,
    type: q.type,
    prompt: loc(q.prompt, locale),
    options: q.options.map((o) => ({ id: o.id, text: loc(o.text, locale) })),
    media: q.media,
    hasHint: cfg.quiz.hintsEnabled && Boolean(q.hint),
  };
}

export function createQuizService({ quizRepo, attemptRepo, progressRepo, now = () => new Date(), rng = Math.random }) {
  const ownedAttempt = (userId, attemptId) => {
    const attempt = attemptRepo.get(attemptId);
    if (!attempt || attempt.userId !== userId) throw notFound('Attempt not found', 'ATTEMPT_NOT_FOUND');
    return attempt;
  };

  const noteLocale = (attempt, locale) => {
    if (!attempt.locales.includes(locale)) attempt.locales.push(locale);
  };

  const select = ({ mode, lesson, count }) => {
    if (mode === 'lesson' && !lessonIds.includes(lesson)) throw badRequest('Unknown or missing lesson', 'UNKNOWN_LESSON');
    const size = count ?? (mode === 'lesson' ? cfg.quiz.lessonCount : cfg.quiz.quickCount);
    return selectQuestions(quizRepo.all(), { mode, lesson, count: Math.min(size, cfg.quiz.maxCount), rng });
  };

  const attemptView = (attempt, locale) => ({
    attemptId: attempt.id,
    mode: attempt.mode,
    lessonId: attempt.lessonId,
    completed: Boolean(attempt.result),
    questions: attempt.questionIds.map((id) => toPublicQuestion(quizRepo.byId(id), locale)),
    // Only answered questions reveal their correct answer.
    answers: Object.fromEntries(
      Object.entries(attempt.answers).map(([qid, a]) => {
        const q = quizRepo.byId(qid);
        return [qid, { optionId: a.optionId, correct: a.correct, correctOptionId: q.correctOptionId, explanation: loc(q.explanation, locale) }];
      }),
    ),
    hintsUsed: Object.keys(attempt.hints),
  });

  return {
    /** Stateless randomized set. Never includes answers or explanations. */
    questions({ mode, lesson, count, locale }) {
      return { questions: select({ mode, lesson, count }).map((q) => toPublicQuestion(q, locale)) };
    },

    start(userId, { mode, lesson, count, locale }) {
      const questions = select({ mode, lesson, count });
      if (!questions.length) throw badRequest('No questions available', 'NO_QUESTIONS');
      const attempt = {
        id: randomUUID(),
        userId,
        mode,
        lessonId: mode === 'lesson' ? lesson : null,
        questionIds: questions.map((q) => q.id),
        answers: {},
        hints: {},
        locales: [locale],
        startedAt: now().toISOString(),
        result: null,
      };
      attemptRepo.save(attempt);
      return attemptView(attempt, locale);
    },

    get(userId, attemptId, locale) {
      return attemptView(ownedAttempt(userId, attemptId), locale);
    },

    answer(userId, { questionId, optionId, attemptId, locale }) {
      const attempt = ownedAttempt(userId, attemptId);
      if (attempt.result) throw conflict('Attempt already completed', 'ATTEMPT_COMPLETED');
      if (!attempt.questionIds.includes(questionId)) throw badRequest('Question is not part of this attempt', 'QUESTION_NOT_IN_ATTEMPT');
      const q = quizRepo.byId(questionId);
      if (!q.options.some((o) => o.id === optionId)) throw badRequest('Invalid option', 'INVALID_OPTION');
      noteLocale(attempt, locale);
      // Idempotent: the first answer stands, retries return the recorded result.
      const existing = attempt.answers[questionId];
      const recorded = existing ?? { optionId, correct: optionId === q.correctOptionId };
      if (!existing) attempt.answers[questionId] = recorded;
      attemptRepo.save(attempt);
      return {
        correct: recorded.correct,
        selectedOptionId: recorded.optionId,
        correctOptionId: q.correctOptionId,
        explanation: loc(q.explanation, locale),
      };
    },

    hint(userId, { questionId, attemptId, locale }) {
      if (!cfg.quiz.hintsEnabled) throw new AppError(403, 'HINTS_DISABLED', 'Hints are disabled');
      const attempt = ownedAttempt(userId, attemptId);
      if (attempt.result) throw conflict('Attempt already completed', 'ATTEMPT_COMPLETED');
      if (!attempt.questionIds.includes(questionId)) throw badRequest('Question is not part of this attempt', 'QUESTION_NOT_IN_ATTEMPT');
      if (attempt.answers[questionId]) throw conflict('Question already answered', 'ALREADY_ANSWERED');
      attempt.hints[questionId] = true;
      attemptRepo.save(attempt);
      return { hint: loc(quizRepo.byId(questionId).hint, locale), xpCost: cfg.xp.hintCost };
    },

    complete(userId, attemptId, { clientDate, locale }) {
      const attempt = ownedAttempt(userId, attemptId);
      if (attempt.result) return attempt.result; // idempotent: never double-award

      const questions = attempt.questionIds.map((id) => quizRepo.byId(id));
      const correctQs = questions.filter((q) => attempt.answers[q.id]?.correct);
      const missedQuestionIds = questions.filter((q) => !attempt.answers[q.id]?.correct).map((q) => q.id);
      const score = correctQs.length;
      const total = questions.length;
      noteLocale(attempt, locale);

      const progress = progressRepo.get(userId);
      const levelBefore = levelIdForXp(progress.xp);
      const { streak, firstActivityToday } = updateStreak(progress.streak, clientDate);
      const streakBonus = firstActivityToday ? streakBonusXp(streak.current) : 0;
      const { xpEarned, perfect, breakdown } = computeAttemptXp({
        correctDifficulties: correctQs.map((q) => q.difficulty),
        total,
        hintsUsed: Object.keys(attempt.hints).length,
        streakBonus,
      });

      progress.xp += xpEarned;
      progress.level = levelIdForXp(progress.xp);
      progress.streak = streak;
      progress.stats.questionsAnswered += Object.keys(attempt.answers).length;
      progress.stats.correctAnswers += score;
      for (const q of correctQs) {
        progress.stats.correctByTopic[q.topic] = (progress.stats.correctByTopic[q.topic] ?? 0) + 1;
      }
      for (const l of attempt.locales) if (!progress.localesSeen.includes(l)) progress.localesSeen.push(l);

      const percent = Math.round((score / total) * 100);
      const bestKey = attempt.mode === 'lesson' ? attempt.lessonId : attempt.mode;
      progress.bestScores[bestKey] = Math.max(progress.bestScores[bestKey] ?? 0, percent);
      progress.quizHistory.unshift({
        attemptId: attempt.id,
        mode: attempt.mode,
        lessonId: attempt.lessonId,
        score,
        total,
        xpEarned,
        completedAt: now().toISOString(),
        missedQuestionIds,
      });
      progress.quizHistory = progress.quizHistory.slice(0, cfg.historyLimit);

      const newBadges = awardBadges(progress, { score, total }, now());
      progressRepo.save(progress);

      attempt.result = {
        attemptId: attempt.id,
        mode: attempt.mode,
        lessonId: attempt.lessonId,
        score,
        total,
        perfect,
        xpEarned,
        xpBreakdown: breakdown,
        levelBefore,
        levelAfter: progress.level,
        levelInfo: levelInfo(progress.xp),
        newBadges,
        streak: progress.streak,
        missedCount: missedQuestionIds.length,
      };
      attemptRepo.save(attempt);
      return attempt.result;
    },

    review(userId, attemptId, locale) {
      const attempt = ownedAttempt(userId, attemptId);
      if (!attempt.result) throw conflict('Attempt not completed yet', 'ATTEMPT_NOT_COMPLETED');
      const missed = attempt.questionIds.filter((id) => !attempt.answers[id]?.correct);
      return {
        attemptId: attempt.id,
        questions: missed.map((id) => {
          const q = quizRepo.byId(id);
          return {
            ...toPublicQuestion(q, locale),
            userOptionId: attempt.answers[id]?.optionId ?? null,
            correctOptionId: q.correctOptionId,
            explanation: loc(q.explanation, locale),
          };
        }),
      };
    },
  };
}
