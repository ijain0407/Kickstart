import cors from 'cors';
import express from 'express';
import { ZodError } from 'zod';

// Person B — lessons, formations, glossary.
import { lessonsRouter } from '../person-b/server/routes/lessons.js';
import { pathLessonsRouter } from '../person-b/server/routes/pathLessons.js';
import { formationsRouter } from '../person-b/server/routes/formations.js';
import { glossaryRouter } from '../person-b/server/routes/glossary.js';

// Person C — leagues, culture cards, the league matcher.
import { createContentRepo } from '../league_feature/server/src/repos/contentRepo.js';
import { normalizeLocale } from '../league_feature/server/src/lib/localize.js';
import { leagueRoutes } from '../league_feature/server/src/routes/leagues.js';
import { cultureRoutes } from '../league_feature/server/src/routes/culture.js';
import { leagueQuizRoutes } from '../league_feature/server/src/routes/leagueQuiz.js';
import { AppError } from '../league_feature/server/src/lib/errors.js';

// Person D — quiz engine, XP, progress, explain-a-play.
import { createApp as createQuizApp } from '../quiz_feature/server/src/app.js';

// Chatbot — quick-question chat ball, Gemini-backed with a built-in FAQ fallback.
import { chatbotRoutes } from '../chatbot_feature/server/routes/chatbot.js';

// Shared — Google sign-in. Optional: with no GOOGLE_CLIENT_ID set, /api/auth
// still answers, reports itself disabled, and every visitor stays anonymous.
import { authRoutes } from './auth/routes.js';
import { createAuthStore } from './auth/store.js';
import { sessionResolver } from './auth/session.js';

/**
 * One API for the whole app, so the demo is a single backend process.
 *
 * Nobody's feature code is copied or edited here — this file imports each
 * workstream's routers as they are and mounts them on one Express app:
 *
 *   /api/lessons, /api/path-lessons,
 *   /api/formations, /api/glossary                 Person B
 *   /api/leagues, /api/culture, /api/league-quiz   Person C
 *   /api/quiz, /api/progress, /api/explain         Person D
 *   /api/chatbot                                   Chatbot (chat ball widget)
 *   /api/auth                                      shared, see auth/
 *
 * Person B's routes were written without the /api prefix and read `?lang=`;
 * mounting them under /api gives the frontend one base path, and the
 * middleware below lets them answer to `?locale=` like everyone else.
 */
export function createGateway({ quizDataDir, authDataDir = null, verifyGoogleToken } = {}) {
  const app = express();
  const content = createContentRepo();
  const authStore = createAuthStore({ dataDir: authDataDir });

  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true, services: ['lessons', 'leagues', 'quiz', 'chatbot'] }));

  // Identity, before anything that reads it. A live session overwrites
  // X-User-Id, so while signed in the server decides whose progress a request
  // touches; without one the browser's anonymous id is left alone.
  app.use('/api', sessionResolver(authStore));
  // `verifyGoogleToken` is a test seam. Left out — which is every real run —
  // the routes use the real verifier in auth/google.js.
  app.use('/api/auth', authRoutes({ store: authStore, verify: verifyGoogleToken }));

  // One locale convention across all three APIs: ?locale= wins, then X-Locale,
  // then Accept-Language, falling back to English.
  app.use('/api', (req, res, next) => {
    const locale = normalizeLocale(req.query.locale ?? req.get('X-Locale') ?? req.get('Accept-Language'));
    req.ctx = { ...req.ctx, locale };
    // Person B's routers read `req.query.lang`, which Express won't let us
    // assign directly on newer versions — redefine it on a copy instead.
    if (!req.query.lang) {
      Object.defineProperty(req, 'query', { value: { ...req.query, lang: locale }, configurable: true });
    }
    next();
  });

  app.use('/api/lessons', lessonsRouter);
  app.use('/api/path-lessons', pathLessonsRouter);
  app.use('/api/formations', formationsRouter);
  app.use('/api/glossary', glossaryRouter);

  app.use('/api/leagues', leagueRoutes({ content }));
  app.use('/api/culture', cultureRoutes({ content }));
  app.use('/api/league-quiz', leagueQuizRoutes({ content }));

  app.use('/api/chatbot', chatbotRoutes());

  // Person D's app mounts its own /api/quiz, /api/progress and /api/explain,
  // plus its own validation and error handling. It goes last because it ends
  // with a catch-all /api 404 — anything unmatched above lands there.
  app.use(createQuizApp({ dataDir: quizDataDir }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof AppError) return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    if (err instanceof ZodError) {
      const message = err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
    }
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } });
    console.error(err);
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected server error' } });
  });

  return app;
}
