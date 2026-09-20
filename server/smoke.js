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
  {
    name: 'B · path lessons',
    path: '/api/path-lessons',
    check: (b) => b.data.length === 6 && b.data.every((l) => l.stepCount === 3 && l.align && l.icon),
  },
  {
    // The player is only useful if every node really carries its teaching body,
    // and every scene a kind the frontend knows how to draw.
    name: 'B · lesson scenes',
    path: '/api/path-lessons?full=1&locale=es',
    check: (b) => {
      const kinds = new Set(['states', 'hotspots', 'squad', 'layers']);
      const steps = b.data.flatMap((l) => l.steps);
      return (
        steps.length === 18 &&
        steps.every((s) => kinds.has(s.scene?.kind)) &&
        b.data.every((l) => l.check.options.filter((o) => o.correct).length === 1) &&
        b.data[1].title === 'La regla del fuera de juego'
      );
    },
  },
  {
    // Every path node must point at a lesson id the content API really serves.
    name: 'path lessons agree',
    path: '/api/path-lessons',
    check: (b) => b.data.every((l) => canonicalLessonIds.includes(l.lessonId)),
  },
  { name: 'B · formations', path: '/api/formations', check: (b) => b.data.some((f) => f.positions?.length === 11) },
  { name: 'B · glossary', path: '/api/glossary', check: (b) => b.data.length > 0 },
  { name: 'C · leagues', path: '/api/leagues?locale=es', check: (b) => b.leagues.length === 6 && b.leagues[0].country === 'Inglaterra' },
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
  {
    // Sign-in is optional: with no GOOGLE_CLIENT_ID the endpoint still answers
    // and simply reports itself off, which is what keeps the button hidden.
    name: 'auth · config off',
    path: '/api/auth/config',
    check: (b) => b.enabled === false && b.clientId === null,
  },
  { name: 'auth · guest has no session', path: '/api/auth/me', check: (b) => b.user === null },
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

/**
 * The signed-in half of auth needs a client id and a Google token, so it runs
 * against its own gateway with the verifier stubbed. Everything else — the
 * session cookie, the id binding, the header override — is the real code.
 */
async function authFlowChecks() {
  const previous = process.env.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_ID = 'smoke-client-id.apps.googleusercontent.com';

  const profile = { sub: '110001112223334445556', email: 'smoke@example.com', emailVerified: true, name: 'Smoke Tester', picture: null };
  const verifyGoogleToken = async (credential) => {
    if (credential !== 'valid-token') throw new Error('unverifiable');
    return profile;
  };

  const authServer = createGateway({ verifyGoogleToken }).listen(0);
  const base = `http://localhost:${authServer.address().port}`;
  const ANON = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const post = (path, body, headers = {}) =>
    fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body ?? {}),
    });

  let localFailed = 0;
  let localRun = 0;
  const expect = (name, ok) => {
    localRun += 1;
    if (ok) console.log(`  ok   ${name}`);
    else {
      localFailed += 1;
      console.error(`  FAIL ${name}`);
    }
  };

  try {
    // Earn XP as a guest first, so we can prove the account inherits it.
    await post('/api/progress/league-matched', { leagueId: 'league-serie-a' }, { 'X-User-Id': ANON });
    const guest = await (await fetch(`${base}/api/progress`, { headers: { 'X-User-Id': ANON } })).json();
    expect('auth · guest earns XP', guest.xp >= 120);

    const bad = await post('/api/auth/google', { credential: 'forged', anonymousId: ANON });
    expect('auth · forged token refused', bad.status === 401 && (await bad.json()).error.code === 'INVALID_CREDENTIAL');

    const res = await post('/api/auth/google', { credential: 'valid-token', anonymousId: ANON });
    const signedIn = await res.json();
    const setCookie = res.headers.get('set-cookie') ?? '';
    const cookie = setCookie.split(';')[0];
    expect('auth · sign-in returns the profile', signedIn.user.email === 'smoke@example.com');
    expect('auth · cookie is httpOnly + lax', /HttpOnly/i.test(setCookie) && /SameSite=Lax/i.test(setCookie));
    expect('auth · account adopts the guest id', signedIn.userId === ANON);

    const me = await (await fetch(`${base}/api/auth/me`, { headers: { cookie } })).json();
    expect('auth · session is readable', me.user.name === 'Smoke Tester' && me.userId === ANON);

    // The session must beat a hand-edited header, or one user could read another's.
    const spoofed = await (await fetch(`${base}/api/progress`, { headers: { cookie, 'X-User-Id': 'not-my-id-0001' } })).json();
    expect('auth · session overrides X-User-Id', spoofed.userId === ANON && spoofed.xp >= 120);

    // A second device signs into the same account and inherits its id.
    const second = await (await post('/api/auth/google', { credential: 'valid-token', anonymousId: 'ffffffff-1111-2222-3333-444444444444' })).json();
    expect('auth · second device keeps the account id', second.userId === ANON);

    const out = await post('/api/auth/logout', {}, { cookie });
    const afterOut = await out.json();
    expect('auth · sign-out issues a fresh id', afterOut.userId !== ANON && afterOut.user === null);
    expect('auth · sign-out clears the cookie', /Expires=Thu, 01 Jan 1970/i.test(out.headers.get('set-cookie') ?? ''));

    const dead = await (await fetch(`${base}/api/auth/me`, { headers: { cookie } })).json();
    expect('auth · session is dead after sign-out', dead.user === null);
  } finally {
    authServer.close();
    if (previous === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = previous;
  }

  return { failed: localFailed, run: localRun };
}

const auth = await authFlowChecks();
failed += auth.failed;
const total = CHECKS.length + auth.run;

console.log(failed === 0 ? `\nAll ${total} checks passed.` : `\n${failed} of ${total} checks failed.`);
// Set the code and let the server close on its own: calling process.exit() while
// the handle is still closing trips a libuv assertion on Windows.
process.exitCode = failed === 0 ? 0 : 1;
server.close();
