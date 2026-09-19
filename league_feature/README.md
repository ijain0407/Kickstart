# League & Culture (Person C)

Leagues hub, league profiles, club culture cards with chants in three layers, and the
"Find Your League" quiz. Bilingual (EN/ES) throughout.

```
league_feature/
  server/   Express API (leagues, culture, league quiz) + JSON content + scoring engine
  client/   React + Tailwind + i18next (hub, profile, culture card, quiz)
  docs/api-league-culture.md   endpoints, content shapes, how the recommendation works
```

## Run it

All commands run from `league_feature/`.

```bash
npm install
npm run dev:server   # http://localhost:4100
npm run dev:client   # http://localhost:5173 (proxies /api to :4100)
```

| Command | What it does |
|---|---|
| `npm test` | server (Vitest + Supertest) and client (Vitest + Testing Library) tests |
| `npm run lint` | ESLint for both workspaces |

Port 4100 rather than 4000 so this runs alongside Person D's quiz API during the demo.

## What's here

- **5 leagues** — Premier League, La Liga, Bundesliga, Serie A, MLS. Style description, top
  clubs, historic rivalries, and a 1-5 rating on seven traits (`server/data/leagues.json`).
- **13 culture cards** across those leagues (`server/data/culture.json`). Each has a nickname,
  stadium traditions, rivalries, and 1-2 chants.
- **The three-layer format** — every chant and nickname is stored as `original` (what fans
  actually sing, in Catalan, Bavarian, Italian…), `literal` (word-for-word), and `meaning`
  (the culture behind it). The original is never translated, in any locale.
- **Find Your League** — 5 weighted questions scoring onto the seven traits, and a
  recommendation engine that ranks all five leagues with an explanation
  (`server/src/lib/recommend.js`).

No club crests, logos, or copyrighted imagery — text and generic visuals only.

## Content status

Content is **draft**: structured and written, not fact-checked. Every league and card carries
a `contentStatus` field (`draft` / `placeholder` / `verified`); Seattle's chant is a
`placeholder` waiting on real research, and the UI shows a notice for those. Editing a JSON
file is the whole content workflow — no migration, and `server/tests/content.test.js` checks
ID prefixes, bilingual coverage, cross-references, and trait coverage on every run.

## Stand-ins for other people's work

- **App shell, nav, language toggle, design tokens**: the same minimal stand-ins Person D
  used, copied deliberately so the two merge cleanly — `client/src/App.jsx`,
  `components/LanguageToggle.jsx`, `components/StateViews.jsx`, `tailwind.config.js`,
  `src/index.css`. All marked `TODO(A)`.
- **Component kit**: pages compose small generic components (`Tile`, `TraitBars`,
  `LayeredText`, `ChantCard`, `RivalryList`) that take plain props and use the shared
  `card` / `btn-primary` / `chip` classes, so swapping in Person A's kit is a component
  substitution, not a rewrite.
- **Lessons API (Person B)**: not consumed yet. If lessons come back, a culture card can link
  to a lesson by `lesson-*` id.

## Routes

`/leagues`, `/leagues/find-your-league`, `/leagues/:leagueId`, `/culture/:cultureId`.

API reference: [docs/api-league-culture.md](docs/api-league-culture.md).
