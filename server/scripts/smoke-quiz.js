// Starts the app on an ephemeral port with an in-memory store, plays a full quiz, asserts progress updated.
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createQuizRepo } from '../src/repos/quizRepo.js';

const server = createApp().listen(0);
const base = `http://localhost:${server.address().port}/api`;
const headers = { 'Content-Type': 'application/json', 'X-User-Id': 'smoke-user-0001', 'X-Client-Date': '2026-01-01' };
const call = async (path, options = {}) => {
  const res = await fetch(base + path, { ...options, headers });
  assert.ok(res.ok, `${path} -> ${res.status}`);
  return res.json();
};

try {
  const bank = createQuizRepo();
  const attempt = await call('/quiz/attempts', { method: 'POST', body: JSON.stringify({ mode: 'quick' }) });
  assert.equal(attempt.questions.length, 5);
  assert.ok(attempt.questions.every((q) => !('correctOptionId' in q)), 'answers must not be exposed');
  for (const q of attempt.questions) {
    const truth = bank.byId(q.id).correctOptionId;
    const r = await call('/quiz/answer', { method: 'POST', body: JSON.stringify({ questionId: q.id, optionId: truth, attemptId: attempt.attemptId }) });
    assert.equal(r.correct, true);
  }
  const result = await call(`/quiz/attempts/${attempt.attemptId}/complete`, { method: 'POST' });
  assert.equal(result.score, 5);
  const progress = await call('/progress');
  assert.equal(progress.xp, result.xpEarned);
  assert.ok(progress.xp > 0);
  assert.equal(progress.history.length, 1);
  console.log(`smoke:quiz OK (score ${result.score}/${result.total}, +${result.xpEarned} XP, badges: ${result.newBadges.join(', ') || 'none'})`);
} finally {
  server.close();
}
