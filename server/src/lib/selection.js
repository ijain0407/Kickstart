import { gamificationConfig as cfg } from '../config/gamificationConfig.js';

export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` unique questions.
 * lesson mode: only that lesson. quick mode: mix of lessons with ~40/40/20 difficulty spread.
 */
export function selectQuestions(pool, { mode, lesson, count, rng = Math.random }) {
  const candidates = mode === 'lesson' ? pool.filter((q) => q.lessonId === lesson) : pool;
  const n = Math.min(count, candidates.length);
  if (mode === 'lesson') return shuffle(candidates, rng).slice(0, n);

  const mix = cfg.quiz.difficultyMix;
  const buckets = { 1: [], 2: [], 3: [] };
  for (const q of shuffle(candidates, rng)) (buckets[q.difficulty] ?? buckets[1]).push(q);

  const picked = [];
  const targets = { 1: Math.round(n * mix[1]), 2: Math.round(n * mix[2]) };
  targets[3] = Math.max(0, n - targets[1] - targets[2]);
  for (const d of [1, 2, 3]) picked.push(...buckets[d].splice(0, targets[d]));
  // Top up from whatever is left if a bucket ran short.
  const leftovers = shuffle([...buckets[1], ...buckets[2], ...buckets[3]], rng);
  while (picked.length < n && leftovers.length) picked.push(leftovers.shift());
  return shuffle(picked, rng);
}
