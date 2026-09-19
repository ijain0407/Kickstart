import cors from 'cors';
import express from 'express';
import { ZodError } from 'zod';
import { AppError } from './lib/errors.js';
import { normalizeLocale } from './lib/localize.js';
import { resolveClientDate } from './lib/streak.js';
import { createAttemptRepo } from './repos/attemptRepo.js';
import { createJsonStore } from './repos/jsonStore.js';
import { createProgressRepo } from './repos/progressRepo.js';
import { createQuizRepo } from './repos/quizRepo.js';
import { createProgressService } from './services/progressService.js';
import { createQuizService } from './services/quizService.js';
import { quizRoutes } from './routes/quiz.js';
import { progressRoutes } from './routes/progress.js';

const USER_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

/** Attach userId / locale / clientDate to the request. TODO(B): swap for real auth when available. */
function context(req, res, next) {
  const userId = req.get('X-User-Id');
  if (!userId || !USER_ID_RE.test(userId)) {
    return next(new AppError(401, 'MISSING_USER', 'A valid X-User-Id header is required'));
  }
  req.ctx = {
    userId,
    locale: normalizeLocale(req.query.locale ?? req.get('X-Locale') ?? req.get('Accept-Language')),
    clientDate: resolveClientDate({ clientDate: req.get('X-Client-Date'), timezone: req.get('X-Timezone') }),
  };
  next();
}

export function createApp({ dataDir = null, quizFile, now, rng } = {}) {
  const file = (name) => (dataDir ? `${dataDir}/${name}` : null);
  const progressRepo = createProgressRepo(createJsonStore(file('progress.json')));
  const attemptRepo = createAttemptRepo(createJsonStore(file('attempts.json')));
  const quizRepo = createQuizRepo(quizFile);
  const services = {
    quiz: createQuizService({ quizRepo, attemptRepo, progressRepo, now, rng }),
    progress: createProgressService({ progressRepo, now }),
  };

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api', context);
  app.use('/api/quiz', quizRoutes(services));
  app.use('/api/progress', progressRoutes(services));

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
