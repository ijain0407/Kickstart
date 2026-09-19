import { vi } from 'vitest';

/**
 * In-memory stand-in for the league/culture API. Mirrors the real server: bodies come
 * back already localized for the request's X-Locale, so the fixtures are bilingual and
 * the fake does the picking.
 */
const TRAITS = [
  { id: 'pace', label: { en: 'Pace', es: 'Ritmo' } },
  { id: 'tactics', label: { en: 'Tactics', es: 'Táctica' } },
];

const LEAGUES = [
  {
    id: 'league-premier-league',
    order: 1,
    name: { en: 'Premier League', es: 'Premier League' },
    country: { en: 'England', es: 'Inglaterra' },
    founded: 1992,
    tagline: { en: 'Relentless pace.', es: 'Ritmo implacable.' },
    style: { en: 'Fast and physical.', es: 'Rápida y física.' },
    traits: { pace: 5, tactics: 3 },
    topClubs: [{ name: { en: 'Liverpool' }, cultureId: 'culture-liverpool' }],
    rivalries: [{ name: { en: 'Merseyside Derby', es: 'Derbi de Merseyside' }, clubs: [{ en: 'Liverpool' }, { en: 'Everton' }], description: { en: 'The city derby.', es: 'El derbi de la ciudad.' } }],
    contentStatus: 'draft',
  },
  {
    id: 'league-serie-a',
    order: 2,
    name: { en: 'Serie A', es: 'Serie A' },
    country: { en: 'Italy', es: 'Italia' },
    founded: 1929,
    tagline: { en: 'Football as chess.', es: 'El fútbol como ajedrez.' },
    style: { en: 'Tactical and patient.', es: 'Táctica y paciente.' },
    traits: { pace: 2, tactics: 5 },
    topClubs: [{ name: { en: 'Juventus' }, cultureId: null }],
    rivalries: [],
    contentStatus: 'draft',
  },
];

const CARD = {
  id: 'culture-liverpool',
  leagueId: 'league-premier-league',
  order: 1,
  club: { en: 'Liverpool' },
  city: { en: 'Liverpool, England', es: 'Liverpool, Inglaterra' },
  founded: 1892,
  colors: { en: 'Red', es: 'Rojo' },
  summary: { en: 'Built on its supporters.', es: 'Construido sobre su afición.' },
  nickname: {
    original: { text: 'The Reds', lang: 'en' },
    literal: { en: 'The Reds', es: 'Los Rojos' },
    meaning: { en: 'For the all-red kit.', es: 'Por la equipación roja.' },
  },
  stadium: { name: { en: 'Anfield' }, traditions: [{ en: 'Scarves up before kickoff.', es: 'Bufandas en alto antes del saque.' }] },
  rivalries: [{ name: { en: 'Merseyside Derby', es: 'Derbi de Merseyside' }, opponent: { en: 'Everton' }, opponentCultureId: null, description: { en: 'The city derby.', es: 'El derbi de la ciudad.' } }],
  chants: [
    {
      id: 'ynwa',
      title: { en: "You'll Never Walk Alone", es: "You'll Never Walk Alone" },
      when: { en: 'Before kickoff', es: 'Antes del saque inicial' },
      original: { text: "You'll never walk alone", lang: 'en' },
      literal: { en: "You'll never walk alone", es: 'Nunca caminarás solo' },
      meaning: { en: 'A promise of solidarity.', es: 'Una promesa de solidaridad.' },
    },
  ],
  contentStatus: 'draft',
};

const QUIZ = {
  id: 'league-quiz',
  title: { en: 'Find Your League', es: 'Encuentra Tu Liga' },
  intro: { en: 'Five questions.', es: 'Cinco preguntas.' },
  traits: TRAITS,
  questions: [
    {
      id: 'q1',
      order: 1,
      prompt: { en: 'What draws you in?', es: '¿Qué te atrae?' },
      options: [
        { id: 'speed', text: { en: 'Speed', es: 'Velocidad' } },
        { id: 'tactics', text: { en: 'Tactics', es: 'Táctica' } },
      ],
    },
    {
      id: 'q2',
      order: 2,
      prompt: { en: 'Best score?', es: '¿Mejor resultado?' },
      options: [
        { id: 'thriller', text: { en: '4-3 chaos', es: '4-3, caos' } },
        { id: 'masterclass', text: { en: '1-0 masterclass', es: '1-0, obra maestra' } },
      ],
    },
  ],
};

/** Same { en, es } flattening the server does. */
function localize(value, locale) {
  if (Array.isArray(value)) return value.map((v) => localize(v, locale));
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length && keys.every((k) => ['en', 'es'].includes(k) && typeof value[k] === 'string')) {
      return value[locale] || value.en;
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localize(v, locale)]));
  }
  return value;
}

const summary = (card) => ({
  id: card.id,
  leagueId: card.leagueId,
  club: card.club,
  city: card.city,
  founded: card.founded,
  nickname: card.nickname,
  summary: card.summary,
  chantCount: card.chants.length,
  contentStatus: card.contentStatus,
});

export function installFakeServer() {
  const state = { calls: [], recommendBody: null };
  const reply = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });

  const fetchMock = vi.fn(async (url, init = {}) => {
    const method = init.method ?? 'GET';
    const locale = init.headers?.['X-Locale'] ?? 'en';
    state.calls.push({ method, url, locale });
    const send = (data, status) => reply(localize(data, locale), status);

    if (method === 'GET' && url === '/api/leagues') return send({ leagues: LEAGUES, traits: TRAITS });
    if (method === 'GET' && url.startsWith('/api/leagues/')) {
      const league = LEAGUES.find((l) => l.id === url.slice('/api/leagues/'.length));
      if (!league) return reply({ error: { code: 'NOT_FOUND', message: url } }, 404);
      const cards = league.id === CARD.leagueId ? [summary(CARD)] : [];
      return send({ league, cultureCards: cards, traits: TRAITS });
    }
    if (method === 'GET' && url === `/api/culture/${CARD.id}`) {
      const league = LEAGUES.find((l) => l.id === CARD.leagueId);
      return send({ card: CARD, league: { id: league.id, name: league.name }, related: [] });
    }
    if (method === 'GET' && url === '/api/league-quiz') return send({ quiz: QUIZ });
    if (method === 'POST' && url === '/api/league-quiz/recommend') {
      state.recommendBody = JSON.parse(init.body);
      // Whichever option id was picked most often decides the league, so the test can
      // assert the answers actually travelled.
      const picks = Object.values(state.recommendBody.answers);
      const tactical = picks.filter((p) => p === 'tactics' || p === 'masterclass').length > picks.length / 2;
      const league = tactical ? LEAGUES[1] : LEAGUES[0];
      return send({
        recommendation: {
          league,
          matchPercent: 87,
          reasons: [tactical ? TRAITS[1] : TRAITS[0]],
        },
        ranking: LEAGUES.map((l) => ({ leagueId: l.id, name: l.name, tagline: l.tagline, matchPercent: l.id === league.id ? 87 : 40 })),
        profile: TRAITS.map((t) => ({ id: t.id, label: t.label, value: 3, percent: 100 })),
      });
    }
    return reply({ error: { code: 'NOT_FOUND', message: url } }, 404);
  });

  globalThis.fetch = fetchMock;
  window.fetch = fetchMock;
  return { state, fetchMock };
}
