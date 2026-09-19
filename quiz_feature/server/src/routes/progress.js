import { Router } from 'express';
import { z } from 'zod';

const lessonBody = z.object({ lessonId: z.string().min(1) });
const chantBody = z.object({ chantId: z.string().min(1).max(100) });

export function progressRoutes({ progress }) {
  const r = Router();

  r.get('/', (req, res) => res.json(progress.get(req.ctx.userId)));
  r.get('/badges', (req, res) => res.json({ badges: progress.badges(req.ctx.userId) }));

  r.post('/lesson-complete', (req, res) => {
    const { lessonId } = lessonBody.parse(req.body);
    res.json(progress.lessonComplete(req.ctx.userId, { lessonId, clientDate: req.ctx.clientDate }));
  });

  r.post('/chant-viewed', (req, res) => {
    const { chantId } = chantBody.parse(req.body);
    res.json(progress.chantViewed(req.ctx.userId, { chantId }));
  });

  r.post('/reset', (req, res) => res.json(progress.reset(req.ctx.userId)));

  return r;
}
