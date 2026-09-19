import { Router } from 'express';
import { z } from 'zod';
import { botDifficulties } from '../bots/scriptedBot.js';

const modeSchema = z.enum(['quick', 'lesson', 'battle']);
const count = z.coerce.number().int().min(1).max(20).optional();

const questionsQuery = z.object({ mode: modeSchema.default('quick'), lesson: z.string().optional(), count });
const startBody = z.object({ mode: modeSchema, lesson: z.string().optional(), count: z.number().int().min(1).max(20).optional(), difficulty: z.enum(botDifficulties).default('medium') });
const answerBody = z.object({ questionId: z.string().min(1), optionId: z.string().min(1), attemptId: z.string().min(1) });
const hintBody = z.object({ questionId: z.string().min(1), attemptId: z.string().min(1) });
const reviewQuery = z.object({ attemptId: z.string().min(1) });

export function quizRoutes({ quiz }) {
  const r = Router();

  r.get('/questions', (req, res) => {
    const q = questionsQuery.parse(req.query);
    res.json(quiz.questions({ ...q, locale: req.ctx.locale }));
  });

  r.post('/attempts', (req, res) => {
    const body = startBody.parse(req.body);
    res.status(201).json(quiz.start(req.ctx.userId, { ...body, locale: req.ctx.locale }));
  });

  r.get('/attempts/:id', (req, res) => {
    res.json(quiz.get(req.ctx.userId, req.params.id, req.ctx.locale));
  });

  r.post('/attempts/:id/complete', (req, res) => {
    res.json(quiz.complete(req.ctx.userId, req.params.id, { clientDate: req.ctx.clientDate, locale: req.ctx.locale }));
  });

  r.post('/answer', (req, res) => {
    const body = answerBody.parse(req.body);
    res.json(quiz.answer(req.ctx.userId, { ...body, locale: req.ctx.locale }));
  });

  r.post('/hint', (req, res) => {
    const body = hintBody.parse(req.body);
    res.json(quiz.hint(req.ctx.userId, { ...body, locale: req.ctx.locale }));
  });

  r.get('/review', (req, res) => {
    const { attemptId } = reviewQuery.parse(req.query);
    res.json(quiz.review(req.ctx.userId, attemptId, req.ctx.locale));
  });

  return r;
}
