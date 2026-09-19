import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AppError, badRequest } from '../lib/errors.js';
import { loc } from '../lib/localize.js';

const scenarioFile = fileURLToPath(new URL('../../data/scenarios.json', import.meta.url));

export const EXPLAIN_LIMITS = {
  maxBytes: 25 * 1024 * 1024,
  mimeTypes: ['video/mp4', 'video/webm', 'image/gif'],
  maxUrlLength: 2048,
  maxNameLength: 120,
};

/** Keep only the base name, drop control characters and cap the length. The name is used for keyword matching only. */
export function sanitizeFilename(name) {
  const base = String(name).split(/[\\/]/).pop() ?? '';
  return base.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, EXPLAIN_LIMITS.maxNameLength);
}

/** Accept plain http(s) links without credentials. The server never fetches them. */
export function parseSafeUrl(raw) {
  if (typeof raw !== 'string' || raw.length > EXPLAIN_LIMITS.maxUrlLength) throw badRequest('Invalid link', 'INVALID_URL');
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    throw badRequest('Invalid link', 'INVALID_URL');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw badRequest('Invalid link', 'INVALID_URL');
  return url;
}

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * DEMO ONLY: this does not analyze video. It matches keywords in the file name or link
 * against pre-authored scenarios and falls back to generic viewing tips.
 */
export function createExplainService({ file = scenarioFile } = {}) {
  const scenarios = JSON.parse(fs.readFileSync(file, 'utf8'));
  const generic = scenarios.find((s) => s.id === 'generic');
  const known = scenarios.filter((s) => s.id !== 'generic');

  const present = (scenario, locale) => ({
    scenarioId: scenario.id,
    title: loc(scenario.title, locale),
    annotations: scenario.annotations.map((a) => ({
      timestamp: a.timestamp,
      title: loc(a.title, locale),
      explanation: loc(a.explanation, locale),
      lessonId: a.lessonId,
    })),
  });

  return {
    scenarios: (locale) => known.map((s) => ({ id: s.id, title: loc(s.title, locale) })),

    analyze(input, locale) {
      let haystack = '';
      let sourceLabel = '';
      let scenario = null;

      if (input.source === 'scenario') {
        scenario = known.find((s) => s.id === input.scenarioId);
        if (!scenario) throw badRequest('Unknown scenario', 'UNKNOWN_SCENARIO');
        sourceLabel = scenario.id;
      } else if (input.source === 'file') {
        if (!EXPLAIN_LIMITS.mimeTypes.includes(input.mimeType)) throw new AppError(415, 'UNSUPPORTED_TYPE', 'Only MP4, WebM or GIF clips are supported');
        if (input.size > EXPLAIN_LIMITS.maxBytes) throw new AppError(413, 'FILE_TOO_LARGE', 'Clip is larger than 25 MB');
        sourceLabel = sanitizeFilename(input.filename);
        haystack = sourceLabel;
      } else {
        const url = parseSafeUrl(input.url);
        sourceLabel = `${url.hostname}${url.pathname}`.slice(0, EXPLAIN_LIMITS.maxNameLength);
        haystack = decodeURIComponentSafe(`${url.pathname}${url.search}`);
      }

      if (!scenario) {
        const text = normalize(haystack);
        scenario = known.find((s) => s.keywords.some((k) => text.includes(normalize(k)))) ?? null;
      }
      const matched = Boolean(scenario);
      return { demo: true, matched, source: input.source, sourceLabel, ...present(scenario ?? generic, locale) };
    },
  };
}

function decodeURIComponentSafe(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
