import cors from 'cors';
import express from 'express';
import { ZodError } from 'zod';
import { AppError } from './lib/errors.js';
import { normalizeLocale } from './lib/localize.js';
import { createContentRepo } from './repos/contentRepo.js';
import { leagueRoutes } from './routes/leagues.js';
import { cultureRoutes } from './routes/culture.js';
import { leagueQuizRoutes } from './routes/leagueQuiz.js';
import { clubQuizRoutes } from './routes/clubQuiz.js';

/**
 * Locale per request, in the same order Person D's server uses it:
 * ?locale= wins, then the X-Locale header, then the browser's Accept-Language.
 * Unlike the quiz API there's no user identity here — league content is public.
 */
function context(req, res, next) {
  req.ctx = { locale: normalizeLocale(req.query.locale ?? req.get('X-Locale') ?? req.get('Accept-Language')) };
  next();
}

export function createApp({ content = createContentRepo() } = {}) {
  const app = express();
  const deps = { content };

  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api', context);
  app.use('/api/leagues', leagueRoutes(deps));
  app.use('/api/culture', cultureRoutes(deps));
  app.use('/api/league-quiz', leagueQuizRoutes(deps));
  app.use('/api/club-quiz', clubQuizRoutes(deps));

  app.use('/api', (req, res, next) => next(new AppError(404, 'NOT_FOUND', 'Route not found')));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ZodError) {
      const message = err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
    }
    if (err instanceof AppError) return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } });
    console.error(err);
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected server error' } });
  });

  return app;
}
