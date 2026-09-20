import { createGateway } from './gateway.js';
import { CULTURE_QUIZ_SLUG, LESSONS, canonicalLessonIds } from '../shared/lessons.js';

/**
 * Starts the gateway on an ephemeral port and checks that one endpoint from
 * each workstream answers. Run with `npm run smoke` — it's the fastest way to
 * catch an integration break after someone merges.
 */
const USER = 'smoke-user-0001';

const CHECKS = [
  { name: 'health', path: '/api/health', check: (b) => b.ok === true },
  { name: 'B · lessons', path: '/api/lessons?locale=es', check: (b) => Array.isArray(b.data) && b.data.length > 0 },
  { name: 'B · formations', path: '/api/formations', check: (b) => b.data.some((f) => f.positions?.length === 11) },
  { name: 'B · glossary', path: '/api/glossary', check: (b) => b.data.length > 0 },
  { name: 'C · leagues', path: '/api/leagues?locale=es', check: (b) => b.leagues.length === 5 && b.leagues[0].country === 'Inglaterra' },
  { name: 'C · culture', path: '/api/culture/culture-bayern-munich', check: (b) => b.card.chants[0].original.text === 'Mia san mia' },
  { name: 'C · quiz', path: '/api/league-quiz', check: (b) => b.quiz.questions.length === 5 },
  {
    name: 'C · recommend',
    path: '/api/league-quiz/recommend',
    method: 'POST',
    body: { answers: { 'league-quiz-q1-draw': 'tactics', 'league-quiz-q5-scoreline': 'masterclass' } },
    check: (b) => b.recommendation.league.id === 'league-serie-a',
  },
  { name: 'D · quiz questions', path: '/api/quiz/questions?mode=quick', check: (b) => b.questions.length > 0 },
  { name: 'D · progress', path: '/api/progress', check: (b) => typeof b.xp === 'number' },
  {
    // The three id schemes are only as good as this check: every canonical
    // lesson id in shared/lessons.js must exist in Person B's content.
    name: 'lesson ids agree',
    path: '/api/lessons',
    check: (b) => canonicalLessonIds.every((id) => b.data.some((lesson) => lesson.id === id)),
  },
  {
    name: 'quiz slugs agree',
    path: '/api/quiz/questions?mode=quick&count=20',
    check: (b) => {
      const known = [...LESSONS.map((l) => l.quizSlug), CULTURE_QUIZ_SLUG];
      return b.questions.every((q) => known.includes(q.lessonId));
    },
  },
  { name: 'D · league matcher XP', path: '/api/progress/league-matched', method: 'POST', body: { leagueId: 'league-serie-a' }, check: (b) => b.xpEarned >= 120 },
  { name: '404 shape', path: '/api/nope', check: (b, res) => res.status === 404 && b.error.code === 'NOT_FOUND' },
];

const server = createGateway().listen(0);
const { port } = server.address();
let failed = 0;

for (const { name, path, method = 'GET', body, check } of CHECKS) {
  try {
    const res = await fetch(`http://localhost:${port}${path}`, {
      method,
      headers: { 'X-User-Id': USER, 'X-Client-Date': '2026-09-19', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (check(json, res)) {
      console.log(`  ok   ${name}`);
    } else {
      failed += 1;
      console.error(`  FAIL ${name} — ${res.status} ${JSON.stringify(json).slice(0, 160)}`);
    }
  } catch (err) {
    failed += 1;
    console.error(`  FAIL ${name} — ${err.message}`);
  }
}

console.log(failed === 0 ? `\nAll ${CHECKS.length} checks passed.` : `\n${failed} of ${CHECKS.length} checks failed.`);
// Set the code and let the server close on its own: calling process.exit() while
// the handle is still closing trips a libuv assertion on Windows.
process.exitCode = failed === 0 ? 0 : 1;
server.close();
