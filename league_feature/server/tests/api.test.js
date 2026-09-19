import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

let app;
beforeEach(() => {
  app = createApp();
});

const get = (url, headers = {}) => request(app).get(url).set(headers);

describe('GET /api/leagues', () => {
  it('returns the five leagues in display order, localized to English by default', async () => {
    const res = await get('/api/leagues');
    expect(res.status).toBe(200);
    expect(res.body.leagues.map((l) => l.id)).toEqual([
      'league-premier-league',
      'league-la-liga',
      'league-bundesliga',
      'league-serie-a',
      'league-mls',
    ]);
    expect(res.body.leagues[0].name).toBe('Premier League');
    expect(typeof res.body.leagues[0].style).toBe('string');
    expect(res.body.traits).toHaveLength(7);
  });

  it('localizes by query param, X-Locale header and Accept-Language', async () => {
    const spanish = (body) => body.leagues.find((l) => l.id === 'league-bundesliga').country;
    expect(spanish((await get('/api/leagues?locale=es')).body)).toBe('Alemania');
    expect(spanish((await get('/api/leagues', { 'X-Locale': 'es' })).body)).toBe('Alemania');
    expect(spanish((await get('/api/leagues', { 'Accept-Language': 'es-MX,es;q=0.9' })).body)).toBe('Alemania');
    // Unsupported locales fall back to English rather than erroring.
    expect(spanish((await get('/api/leagues?locale=fr')).body)).toBe('Germany');
  });
});

describe('GET /api/leagues/:id', () => {
  it('returns the profile with its culture card summaries', async () => {
    const res = await get('/api/leagues/league-la-liga?locale=es');
    expect(res.status).toBe(200);
    expect(res.body.league.name).toBe('LaLiga');
    expect(res.body.league.rivalries[0].name).toBe('El Clásico');
    expect(res.body.cultureCards.map((c) => c.id)).toEqual([
      'culture-real-madrid',
      'culture-fc-barcelona',
      'culture-atletico-madrid',
    ]);
    // Summaries stay light: no chants, no stadium detail.
    expect(res.body.cultureCards[0].chants).toBeUndefined();
    expect(res.body.cultureCards[0].chantCount).toBe(1);
  });

  it('404s on an unknown league', async () => {
    const res = await get('/api/leagues/league-nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('GET /api/culture', () => {
  it('lists every card, or filters by league', async () => {
    const all = await get('/api/culture');
    expect(all.body.cards.length).toBeGreaterThanOrEqual(10);

    const bundesliga = await get('/api/culture?league=league-bundesliga');
    expect(bundesliga.body.cards.map((c) => c.id)).toEqual(['culture-bayern-munich', 'culture-borussia-dortmund']);
  });

  it('404s when filtering by a league that does not exist', async () => {
    expect((await get('/api/culture?league=league-nope')).status).toBe(404);
  });
});

describe('GET /api/culture/:id', () => {
  it('returns the three chant layers with the original left untranslated', async () => {
    const res = await get('/api/culture/culture-bayern-munich?locale=es');
    expect(res.status).toBe(200);

    const chant = res.body.card.chants.find((c) => c.id === 'mia-san-mia');
    expect(chant.original).toEqual({ text: 'Mia san mia', lang: 'bar' });
    expect(chant.literal).toBe('Nosotros somos nosotros');
    expect(chant.meaning).toMatch(/dialecto bávaro/i);

    expect(res.body.card.nickname.original.text).toBe('Die Roten');
    expect(res.body.league).toEqual({ id: 'league-bundesliga', name: 'Bundesliga' });
    expect(res.body.related.map((c) => c.id)).toEqual(['culture-borussia-dortmund']);
  });

  it('404s on an unknown card', async () => {
    expect((await get('/api/culture/culture-nope')).status).toBe(404);
  });
});

describe('GET /api/league-quiz', () => {
  it('returns localized questions without leaking the scoring weights', async () => {
    const res = await get('/api/league-quiz?locale=es');
    expect(res.status).toBe(200);
    expect(res.body.quiz.title).toBe('Encuentra Tu Liga');
    expect(res.body.quiz.questions).toHaveLength(5);
    expect(res.body.quiz.questions.map((q) => q.order)).toEqual([1, 2, 3, 4, 5]);
    expect(typeof res.body.quiz.questions[0].options[0].text).toBe('string');
    expect(JSON.stringify(res.body)).not.toMatch(/weights/);
  });
});

describe('POST /api/league-quiz/recommend', () => {
  const post = (body, query = '') => request(app).post(`/api/league-quiz/recommend${query}`).send(body);

  const tacticalAnswers = {
    'league-quiz-q1-draw': 'tactics',
    'league-quiz-q2-goal': 'passing-move',
    'league-quiz-q3-matchday': 'analysis',
    'league-quiz-q4-player': 'defender',
    'league-quiz-q5-scoreline': 'masterclass',
  };

  it('recommends a league, with the reasons and the full ranking', async () => {
    const res = await post({ answers: tacticalAnswers });
    expect(res.status).toBe(200);
    expect(res.body.recommendation.league.id).toBe('league-serie-a');
    expect(res.body.recommendation.matchPercent).toBeGreaterThan(50);
    expect(res.body.recommendation.reasons[0]).toMatchObject({ id: 'tactics', label: 'Tactics' });
    expect(res.body.ranking).toHaveLength(5);
    expect(res.body.ranking[0].leagueId).toBe('league-serie-a');
    expect(res.body.profile.find((p) => p.id === 'tactics').percent).toBe(100);
  });

  it('localizes the result', async () => {
    const res = await post({ answers: tacticalAnswers }, '?locale=es');
    expect(res.body.recommendation.league.country).toBe('Italia');
    expect(res.body.recommendation.reasons[0].label).toBe('Táctica');
    expect(res.body.ranking[0].tagline).toMatch(/ajedrez/i);
  });

  it('accepts a partial answer set', async () => {
    const res = await post({ answers: { 'league-quiz-q1-draw': 'underdogs' } });
    expect(res.status).toBe(200);
    expect(res.body.recommendation.league.id).toBe('league-mls');
  });

  it('rejects empty, malformed and unknown answers', async () => {
    expect((await post({ answers: {} })).body.error.code).toBe('NO_ANSWERS');
    expect((await post({})).body.error.code).toBe('VALIDATION_ERROR');
    expect((await post({ answers: { 'league-quiz-q1-draw': 5 } })).body.error.code).toBe('VALIDATION_ERROR');
    expect((await post({ answers: { nope: 'tactics' } })).body.error.code).toBe('UNKNOWN_QUESTION');
    expect((await post({ answers: { 'league-quiz-q1-draw': 'nope' } })).body.error.code).toBe('UNKNOWN_OPTION');
    expect((await post({ answers: {} })).status).toBe(400);
  });
});

describe('plumbing', () => {
  it('answers /api/health and JSON-404s unknown routes', async () => {
    expect((await get('/api/health')).body).toEqual({ ok: true });
    const res = await get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
