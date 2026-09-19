import { vi } from 'vitest';

const BANK = [
  {
    id: 'q1', lessonId: 'positions', topic: 'goalkeeper', difficulty: 1, type: 'multiple_choice', media: { type: 'none', ref: null }, hasHint: true, correct: 'a',
    prompt: { en: 'Who may use their hands in their own area?', es: '¿Quién puede usar las manos en su área?' },
    options: [{ id: 'a', text: { en: 'The goalkeeper', es: 'El portero' } }, { id: 'b', text: { en: 'The striker', es: 'El delantero' } }],
    explanation: { en: 'Only the goalkeeper can.', es: 'Solo el portero puede.' },
  },
  {
    id: 'q2', lessonId: 'positions', topic: 'players', difficulty: 1, type: 'multiple_choice', media: { type: 'none', ref: null }, hasHint: true, correct: 'b',
    prompt: { en: 'How many players per side?', es: '¿Cuántos jugadores por equipo?' },
    options: [{ id: 'a', text: { en: 'Ten', es: 'Diez' } }, { id: 'b', text: { en: 'Eleven', es: 'Once' } }],
    explanation: { en: 'Eleven including the goalkeeper.', es: 'Once, incluido el portero.' },
  },
];

/** In-memory stand-in for the quiz API. Correct answers stay server-side, like the real thing. */
const BOT = { q1: { optionId: 'b', correct: false, delayMs: 1500 }, q2: { optionId: 'b', correct: true, delayMs: 2000 } };

export function installFakeServer({ result, battle = false } = {}) {
  const state = { answers: {}, calls: [] };
  const view = (locale) => ({
    attemptId: 'att-1',
    mode: battle ? 'battle' : 'quick',
    ...(battle ? { bot: { name: 'bot', difficulty: 'medium' } } : {}),
    lessonId: null,
    completed: false,
    hintsUsed: [],
    questions: BANK.map((q) => ({
      id: q.id, lessonId: q.lessonId, topic: q.topic, difficulty: q.difficulty, type: q.type, media: q.media, hasHint: q.hasHint,
      prompt: q.prompt[locale], options: q.options.map((o) => ({ id: o.id, text: o.text[locale] })),
    })),
    answers: Object.fromEntries(
      Object.entries(state.answers).map(([qid, optionId]) => {
        const q = BANK.find((x) => x.id === qid);
        return [qid, { optionId, correct: optionId === q.correct, correctOptionId: q.correct, explanation: q.explanation[locale], ...(battle ? { bot: BOT[qid] } : {}) }];
      }),
    ),
  });
  const reply = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });

  const fetchMock = vi.fn(async (url, init = {}) => {
    const method = init.method ?? 'GET';
    const locale = init.headers?.['X-Locale'] ?? 'en';
    state.calls.push({ method, url, locale });
    if (method === 'POST' && url === '/api/quiz/attempts') return reply(view(locale), 201);
    if (method === 'GET' && url === '/api/quiz/attempts/att-1') return reply(view(locale));
    if (method === 'POST' && url === '/api/quiz/answer') {
      const { questionId, optionId } = JSON.parse(init.body);
      state.answers[questionId] ??= optionId;
      const q = BANK.find((x) => x.id === questionId);
      return reply({ correct: state.answers[questionId] === q.correct, selectedOptionId: state.answers[questionId], correctOptionId: q.correct, explanation: q.explanation[locale], ...(battle ? { bot: BOT[questionId] } : {}) });
    }
    if (method === 'POST' && url === '/api/quiz/hint') return reply({ hint: locale === 'es' ? 'Pista de prueba' : 'Test hint', xpCost: 5 });
    if (method === 'POST' && url === '/api/quiz/attempts/att-1/complete') return reply(result);
    if (url === '/api/progress') {
      return reply({ xp: 0, level: 'fan', nextLevel: 'enthusiast', xpIntoLevel: 0, xpForNextLevel: 300, progressPercent: 0, streak: { current: 0, best: 0 }, stats: {}, bestScores: {}, history: [], badges: [] });
    }
    return reply({ error: { code: 'NOT_FOUND', message: url } }, 404);
  });
  globalThis.fetch = fetchMock;
  window.fetch = fetchMock;
  return { state, fetchMock };
}
