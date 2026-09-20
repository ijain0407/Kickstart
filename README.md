# Kickstart

A bilingual (EN/ES) soccer-learning platform: lessons and a tactics board, club culture with
chants explained in three layers, a league matcher, and XP / streaks / badges.

```
frontend/        React app — the shell, design system and every screen (Person A)
server/          API gateway: mounts all three backends on one port
person-b/        Lessons, formations, glossary API (Person B)
league_feature/  Leagues, culture cards, league matcher API (Person C)
quiz_feature/    Quiz engine, XP, progress, explain-a-play API (Person D)
```

## Run it

```bash
npm run install:all   # first time only
npm run dev           # API on :4000, app on http://localhost:5173
```

`npm run dev` starts both. The frontend proxies `/api` to the gateway, so there's one origin
and no CORS juggling during the demo.

| Command | What it does |
|---|---|
| `npm run dev` | API + frontend together |
| `npm run smoke` | Hits one endpoint per workstream and checks the shape |
| `npm run build` | Production build of the frontend |
| `npm test --prefix frontend` | Frontend tests — they run against the real API |
| `npm test --prefix league_feature` | Leagues/culture API + scoring engine |
| `npm test --prefix quiz_feature` | Quiz engine, XP and progress |

## How it fits together

`server/gateway.js` imports each workstream's routers as they are — nobody's feature code was
copied or forked — and mounts them on one Express app:

| Path | Owner | Notes |
|---|---|---|
| `/api/lessons`, `/api/formations`, `/api/glossary` | Person B | `?lang=` handled via the shared locale middleware |
| `/api/leagues`, `/api/culture`, `/api/league-quiz` | Person C | |
| `/api/quiz`, `/api/progress`, `/api/explain` | Person D | Requires the `X-User-Id` header, which the client sends automatically |

**Locale**: one convention everywhere — `?locale=`, then the `X-Locale` header, then
`Accept-Language`, falling back to English. Responses come back already localized, and the
frontend refetches when the language switches.

**Chants and nicknames** are the exception: their `original` field is `{ text, lang }` and is
never translated, in any locale. That's the point of the three-layer format — what the stand
sings, what it literally means, and what it really means.

### Frontend data flow

- `src/lib/api.js` — one fetch helper (locale + anonymous user id) and a small `useResource`
  hook. No data-fetching dependency was added.
- `src/lib/adapters.js` — maps API payloads onto the shapes the existing components expect,
  so the pages stayed presentational and the design system was not rewritten.
- `src/state/AppState.jsx` — XP, level, streak, badges and chants come from the progress API;
  lesson-path state and matcher answers stay local. Everything degrades to localStorage when
  the API is unreachable.

## Known gaps

- **Lesson ids don't line up across workstreams.** Person B publishes `lesson-rules-basics`,
  Person D's `config/lessonIds.js` expects `rules-basics`, and the path in the frontend uses
  `1.1`–`1.6`. The frontend maps between them (`LESSON_SLUG` in `AppState.jsx`); the team
  should agree on one list.
- **The league matcher's +120 XP is local only.** The progress API awards XP for lessons,
  chants and quiz attempts, with no endpoint for other activity, so that bonus isn't
  server-backed yet.
- **Person D's quiz engine has no screen in the shell.** Battles, hints, review and badges are
  all built and tested in `quiz_feature/`, but the app currently surfaces only progress.
- **Content is draft.** League and culture records carry a `contentStatus` (`draft`,
  `placeholder`, `verified`); the Seattle chant is a flagged placeholder. No club crests,
  logos or licensed lyrics anywhere — text and generic visuals only.
