import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { parseSafeUrl, sanitizeFilename } from '../src/services/explainService.js';

const app = createApp();
const post = (body, extra = {}) => request(app).post('/api/explain/analyze').set({ 'X-User-Id': 'explain-user-01', ...extra }).send(body);
const file = (filename, over = {}) => ({ source: 'file', filename, mimeType: 'video/mp4', size: 1024, ...over });

describe('POST /api/explain/analyze (demo)', () => {
  it('matches a scenario by file name and flags the result as a demo', async () => {
    const res = await post(file('my_Offside_goal.mp4'));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ demo: true, matched: true, scenarioId: 'offside' });
    expect(res.body.annotations.length).toBeGreaterThan(2);
    for (const a of res.body.annotations) expect(a).toEqual({ timestamp: expect.any(Number), title: expect.any(String), explanation: expect.any(String), lessonId: expect.any(String) });
  });

  it('matches Spanish and accented names, and localizes the annotations', async () => {
    const res = await post(file('Tiro de esquina final.webm', { mimeType: 'video/webm' }), { 'X-Locale': 'es' });
    expect(res.body.scenarioId).toBe('corner-kick');
    expect(res.body.annotations[0].title).toBe('El balón cruza la línea de meta');
  });

  it('matches a link by its path', async () => {
    const res = await post({ source: 'url', url: 'https://example.com/clips/penalty-kick.gif' });
    expect(res.body).toMatchObject({ matched: true, scenarioId: 'penalty', sourceLabel: 'example.com/clips/penalty-kick.gif' });
  });

  it('falls back to generic tips for unknown clips', async () => {
    const res = await post(file('IMG_2041.mp4'));
    expect(res.body).toMatchObject({ demo: true, matched: false, scenarioId: 'generic' });
    expect(res.body.annotations.length).toBeGreaterThan(0);
  });

  it('serves sample scenarios by id', async () => {
    const list = await request(app).get('/api/explain/scenarios').set('X-User-Id', 'explain-user-01');
    expect(list.body.scenarios.map((s) => s.id)).toEqual(['offside', 'corner-kick', 'penalty']);
    const res = await post({ source: 'scenario', scenarioId: 'penalty' });
    expect(res.body).toMatchObject({ matched: true, scenarioId: 'penalty' });
    expect((await post({ source: 'scenario', scenarioId: 'nope' })).body.error.code).toBe('UNKNOWN_SCENARIO');
  });

  it('enforces type and size limits', async () => {
    const type = await post(file('offside.exe', { mimeType: 'application/x-msdownload' }));
    expect(type.status).toBe(415);
    expect(type.body.error.code).toBe('UNSUPPORTED_TYPE');
    const big = await post(file('offside.mp4', { size: 26 * 1024 * 1024 }));
    expect(big.status).toBe(413);
    expect(big.body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('rejects unsafe links and malformed bodies', async () => {
    for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'https://user:pw@example.com/a.mp4', 'not a url']) {
      const res = await post({ source: 'url', url });
      expect(res.status, url).toBe(400);
      expect(res.body.error.code).toBe('INVALID_URL');
    }
    expect((await post({ source: 'file', filename: 'x.mp4' })).body.error.code).toBe('VALIDATION_ERROR');
    expect((await post({})).status).toBe(400);
  });
});

describe('input sanitizing', () => {
  it('keeps only a clean base file name', () => {
    expect(sanitizeFilename('..\..\evil/../clip\u0000\u0007.mp4')).toBe('clip.mp4');
    expect(sanitizeFilename('a'.repeat(500)).length).toBe(120);
  });

  it('accepts only plain http(s) links', () => {
    expect(parseSafeUrl('https://example.com/a').hostname).toBe('example.com');
    expect(() => parseSafeUrl('ftp://example.com/a')).toThrow();
  });
});
