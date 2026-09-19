import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createQuizRepo } from '../src/repos/quizRepo.js';

const bank = createQuizRepo();
const truth = (id) => bank.byId(id).correctOptionId;
let app;
let n = 0;
let uid;
const api = (method, url, body, extra = {}) =>
  request(app)[method](url).set({ 'X-User-Id': uid, 'X-Client-Date': '2026-03-01', ...extra }).send(body);

beforeEach(() => {
  app = createApp({ now: () => new Date('2026-03-01T12:00:00Z') });
  uid = `test-user-${String(++n).padStart(4, '0')}`;
});

const startQuick = async (extra) => (await api('post', '/api/quiz/attempts', { mode: 'quick' }, extra)).body;
const answerAll = async (attempt, correct = true) => {
  for (const q of attempt.questions) {
    const wrong = q.options.find((o) => o.id !== truth(q.id)).id;
    await api('post', '/api/quiz/answer', { questionId: q.id, optionId: correct ? truth(q.id) : wrong, attemptId: attempt.attemptId });
  }
};

describe('auth & validation', () => {
  it('requires X-User-Id', async () => {
    const res = await request(app).get('/api/progress');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('MISSING_USER');
  });

  it('validates bodies with a consistent error shape', async () => {
    const res = await api('post', '/api/quiz/attempts', { mode: 'nope' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('rejects an unknown lesson', async () => {
    const res = await api('post', '/api/quiz/attempts', { mode: 'lesson', lesson: 'nope' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('UNKNOWN_LESSON');
  });

  it('returns JSON 404 for unknown routes', async () => {
    const res = await api('get', '/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/quiz/questions', () => {
  it('never exposes correct answers, explanations or hints', async () => {
    const res = await api('get', '/api/quiz/questions?mode=quick&count=10');
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(10);
    const raw = JSON.stringify(res.body);
    expect(raw).not.toMatch(/correctOptionId|explanation/);
    for (const q of res.body.questions) {
      expect(q.hint).toBeUndefined();
      expect(typeof q.prompt).toBe('string');
    }
  });

  it('localizes by query param and falls back to English', async () => {
    const es = await api('get', '/api/quiz/questions?lesson=positions&mode=lesson&locale=es');
    expect(es.body.questions[0].prompt).toBe(bank.byId(es.body.questions[0].id).prompt.es);
    const fr = await api('get', '/api/quiz/questions?lesson=positions&mode=lesson&locale=fr');
    expect(fr.body.questions[0].prompt).toBe(bank.byId(fr.body.questions[0].id).prompt.en);
    const header = await api('get', '/api/quiz/questions?mode=quick', undefined, { 'Accept-Language': 'es-MX,es;q=0.9' });
    expect(header.body.questions[0].prompt).toBe(bank.byId(header.body.questions[0].id).prompt.es);
  });
});

describe('attempt lifecycle', () => {
  it('starts an attempt without leaking answers', async () => {
    const attempt = await startQuick();
    expect(attempt.questions).toHaveLength(5);
    expect(attempt.answers).toEqual({});
    expect(JSON.stringify(attempt)).not.toMatch(/correctOptionId/);
  });

  it('checks answers server-side and returns the explanation', async () => {
    const attempt = await startQuick();
    const q = attempt.questions[0];
    const wrong = q.options.find((o) => o.id !== truth(q.id)).id;
    const res = await api('post', '/api/quiz/answer', { questionId: q.id, optionId: wrong, attemptId: attempt.attemptId });
    expect(res.body).toMatchObject({ correct: false, correctOptionId: truth(q.id) });
    expect(res.body.explanation).toBeTruthy();
  });

  it('keeps the first answer when the same question is answered twice', async () => {
    const attempt = await startQuick();
    const q = attempt.questions[0];
    const wrong = q.options.find((o) => o.id !== truth(q.id)).id;
    await api('post', '/api/quiz/answer', { questionId: q.id, optionId: wrong, attemptId: attempt.attemptId });
    const again = await api('post', '/api/quiz/answer', { questionId: q.id, optionId: truth(q.id), attemptId: attempt.attemptId });
    expect(again.body.correct).toBe(false);
  });

  it('rejects answers for foreign questions, invalid options and other users', async () => {
    const attempt = await startQuick();
    const outside = bank.all().find((q) => !attempt.questions.some((x) => x.id === q.id));
    const r1 = await api('post', '/api/quiz/answer', { questionId: outside.id, optionId: 'a', attemptId: attempt.attemptId });
    expect(r1.body.error.code).toBe('QUESTION_NOT_IN_ATTEMPT');
    const r2 = await api('post', '/api/quiz/answer', { questionId: attempt.questions[0].id, optionId: 'zzz', attemptId: attempt.attemptId });
    expect(r2.body.error.code).toBe('INVALID_OPTION');
    const r3 = await request(app).get(`/api/quiz/attempts/${attempt.attemptId}`).set('X-User-Id', 'someone-else-0001');
    expect(r3.status).toBe(404);
  });

  it('restores an attempt in another language without resetting it', async () => {
    const attempt = await startQuick();
    await api('post', '/api/quiz/answer', { questionId: attempt.questions[0].id, optionId: 'a', attemptId: attempt.attemptId });
    const es = (await api('get', `/api/quiz/attempts/${attempt.attemptId}?locale=es`)).body;
    expect(es.questions.map((q) => q.id)).toEqual(attempt.questions.map((q) => q.id));
    expect(es.questions[0].prompt).toBe(bank.byId(es.questions[0].id).prompt.es);
    expect(Object.keys(es.answers)).toHaveLength(1);
  });

  it('charges hints against XP', async () => {
    const attempt = await startQuick();
    const q = attempt.questions[0];
    const hint = await api('post', '/api/quiz/hint', { questionId: q.id, attemptId: attempt.attemptId });
    expect(hint.body.hint).toBeTruthy();
    await answerAll(attempt);
    const result = (await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`)).body;
    expect(result.xpBreakdown.hintPenalty).toBe(5);
  });
});

describe('completion, XP and progress', () => {
  it('scores on the server, awards XP and updates progress', async () => {
    const attempt = await startQuick();
    await answerAll(attempt);
    const res = await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ score: 5, total: 5, perfect: true, levelBefore: 'fan' });
    expect(res.body.newBadges).toEqual(expect.arrayContaining(['first_whistle', 'perfect_score']));
    expect(res.body.streak.current).toBe(1);

    const p = (await api('get', '/api/progress')).body;
    expect(p.xp).toBe(res.body.xpEarned);
    expect(p.stats).toMatchObject({ questionsAnswered: 5, correctAnswers: 5, accuracyPercent: 100 });
    expect(p.history).toHaveLength(1);
    expect(p.bestScores.quick).toBe(100);
  });

  it('does not double-award XP when completing twice', async () => {
    const attempt = await startQuick();
    await answerAll(attempt);
    const first = (await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`)).body;
    const second = (await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`)).body;
    expect(second).toEqual(first);
    const p = (await api('get', '/api/progress')).body;
    expect(p.xp).toBe(first.xpEarned);
    expect(p.history).toHaveLength(1);
  });

  it('counts unanswered questions as missed and locks the attempt', async () => {
    const attempt = await startQuick();
    const res = (await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`)).body;
    expect(res).toMatchObject({ score: 0, missedCount: 5 });
    const late = await api('post', '/api/quiz/answer', { questionId: attempt.questions[0].id, optionId: 'a', attemptId: attempt.attemptId });
    expect(late.status).toBe(409);
  });

  it('levels up when crossing 300 XP', async () => {
    let last;
    for (let i = 0; i < 6; i++) {
      const attempt = await startQuick();
      await answerAll(attempt);
      last = (await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`)).body;
      if (last.levelAfter !== 'fan') break;
    }
    expect(last.levelBefore).toBe('fan');
    expect(last.levelAfter).toBe('enthusiast');
  });

  it('lists missed questions for review only after completion', async () => {
    const attempt = await startQuick();
    const early = await api('get', `/api/quiz/review?attemptId=${attempt.attemptId}`);
    expect(early.status).toBe(409);
    await answerAll(attempt, false);
    await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`);
    const review = (await api('get', `/api/quiz/review?attemptId=${attempt.attemptId}&locale=es`)).body;
    expect(review.questions).toHaveLength(5);
    expect(review.questions[0]).toMatchObject({ correctOptionId: truth(review.questions[0].id) });
    expect(review.questions[0].userOptionId).not.toBe(review.questions[0].correctOptionId);
  });

  it('awards polyglot after switching language during a quiz', async () => {
    const attempt = await startQuick();
    await api('post', '/api/quiz/answer', { questionId: attempt.questions[0].id, optionId: 'a', attemptId: attempt.attemptId }, { 'X-Locale': 'es' });
    const res = (await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`)).body;
    expect(res.newBadges).toContain('polyglot');
  });
});

describe('lesson-complete and chant-viewed hooks', () => {
  it('awards lesson XP once per lesson', async () => {
    const a = (await api('post', '/api/progress/lesson-complete', { lessonId: 'positions' })).body;
    expect(a).toMatchObject({ alreadyCompleted: false, xpEarned: 55 }); // 50 lesson + 5 streak
    const b = (await api('post', '/api/progress/lesson-complete', { lessonId: 'positions' })).body;
    expect(b).toMatchObject({ alreadyCompleted: true, xpEarned: 0 });
    expect((await api('get', '/api/progress')).body.stats.lessonsCompleted).toBe(1);
  });

  it('rejects unknown lessons', async () => {
    const res = await api('post', '/api/progress/lesson-complete', { lessonId: 'zzz' });
    expect(res.status).toBe(400);
  });

  it('counts unique chants and awards chant_collector at 5', async () => {
    let res;
    for (const id of ['c1', 'c2', 'c3', 'c4', 'c4', 'c5']) res = (await api('post', '/api/progress/chant-viewed', { chantId: id })).body;
    expect(res.chantsLearned).toBe(5);
    expect(res.newBadges).toContain('chant_collector');
  });
});

describe('badge catalog and streaks', () => {
  it('lists the catalog with earned/locked state', async () => {
    await api('post', '/api/progress/chant-viewed', { chantId: 'c1' });
    const { badges } = (await api('get', '/api/progress/badges')).body;
    expect(badges).toHaveLength(9);
    expect(badges.every((b) => b.earned === false)).toBe(true);
    expect(badges.find((b) => b.id === 'chant_collector').progress).toEqual({ current: 1, target: 5 });
  });

  it('tracks consecutive days via X-Client-Date', async () => {
    const day = (date) => api('post', '/api/progress/lesson-complete', { lessonId: 'positions' }, { 'X-Client-Date': date });
    await day('2026-03-01');
    await day('2026-03-02');
    const r = (await day('2026-03-03')).body;
    expect(r.streak).toMatchObject({ current: 3, best: 3 });
    expect((await api('get', '/api/progress/badges')).body.badges.find((b) => b.id === 'hat_trick').progress.current).toBe(3);
  });

  it('resets progress', async () => {
    await api('post', '/api/progress/lesson-complete', { lessonId: 'positions' });
    const res = (await api('post', '/api/progress/reset')).body;
    expect(res).toMatchObject({ xp: 0, level: 'fan' });
  });
});

describe('battle mode (bot)', () => {
  // rng()=0 makes a 90%/75%/60% bot always right; rng()=0.99 makes it always wrong.
  const battleApp = (rngValue) => {
    app = createApp({ now: () => new Date('2026-03-01T12:00:00Z'), rng: () => rngValue });
  };
  const startBattle = async (body = {}) => (await api('post', '/api/quiz/attempts', { mode: 'battle', ...body })).body;

  it('starts with bot config and never leaks the bot plan up front', async () => {
    battleApp(0);
    const attempt = await startBattle({ difficulty: 'hard' });
    expect(attempt.bot).toEqual({ name: 'bot', difficulty: 'hard' });
    expect(JSON.stringify(attempt)).not.toMatch(/delayMs|plan|correctOptionId/);
    expect(attempt.answers).toEqual({});
  });

  it('reveals the bot answer only after the user answers that question', async () => {
    battleApp(0);
    const attempt = await startBattle();
    const q = attempt.questions[0];
    const res = (await api('post', '/api/quiz/answer', { questionId: q.id, optionId: truth(q.id), attemptId: attempt.attemptId })).body;
    expect(res.bot).toMatchObject({ correct: true, optionId: truth(q.id), delayMs: 1500 });
    const view = (await api('get', `/api/quiz/attempts/${attempt.attemptId}`)).body;
    expect(Object.keys(view.answers)).toHaveLength(1);
    expect(view.answers[q.id].bot.correct).toBe(true);
  });

  it('draws against a perfect bot and awards draw XP', async () => {
    battleApp(0);
    const attempt = await startBattle();
    await answerAll(attempt);
    const r = (await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`)).body;
    expect(r).toMatchObject({ battleResult: 'draw', botScore: 5, score: 5 });
    expect(r.xpBreakdown.battleBonus).toBe(10);
  });

  it('wins against a bot that always misses and awards win XP once', async () => {
    battleApp(0.99);
    const attempt = await startBattle();
    await answerAll(attempt);
    const r = (await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`)).body;
    expect(r).toMatchObject({ battleResult: 'win', botScore: 0 });
    expect(r.xpBreakdown.battleBonus).toBe(30);
    await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`);
    expect((await api('get', '/api/progress')).body.xp).toBe(r.xpEarned);
  });

  it('loses when the user misses everything and records the battle in history', async () => {
    battleApp(0);
    const attempt = await startBattle();
    await answerAll(attempt, false);
    const r = (await api('post', `/api/quiz/attempts/${attempt.attemptId}/complete`)).body;
    expect(r).toMatchObject({ battleResult: 'loss', score: 0 });
    expect(r.xpBreakdown.battleBonus).toBe(0);
    expect((await api('get', '/api/progress')).body.history[0]).toMatchObject({ mode: 'battle' });
  });

  it('rejects an unknown bot difficulty', async () => {
    battleApp(0);
    const res = await api('post', '/api/quiz/attempts', { mode: 'battle', difficulty: 'impossible' });
    expect(res.status).toBe(400);
  });
});
