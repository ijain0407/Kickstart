import { Router } from 'express';
import { z } from 'zod';

// The clip itself is never uploaded: the demo only needs its metadata (or a link) to pick a pre-written scenario.
const analyzeBody = z.discriminatedUnion('source', [
  z.object({ source: z.literal('file'), filename: z.string().min(1).max(500), mimeType: z.string().max(100), size: z.number().int().min(0) }),
  z.object({ source: z.literal('url'), url: z.string().min(1).max(4000) }),
  z.object({ source: z.literal('scenario'), scenarioId: z.string().min(1).max(50) }),
]);

export function explainRoutes({ explain }) {
  const r = Router();
  r.get('/scenarios', (req, res) => res.json({ scenarios: explain.scenarios(req.ctx.locale) }));
  r.post('/analyze', (req, res) => res.json(explain.analyze(analyzeBody.parse(req.body), req.ctx.locale)));
  return r;
}
