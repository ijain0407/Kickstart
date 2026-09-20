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
| `/api/path-lessons` | Person B | The learning path and the lesson player — steps, interactive scenes and checks |
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
- `src/components/LessonScene.jsx` — draws the four scene kinds `/api/path-lessons` can send
  (`states`, `hotspots`, `squad`, `layers`). Nothing in it is lesson-specific, so a new
  interactive diagram is a content change on the server rather than a component here.
- `src/state/AppState.jsx` — XP, level, streak, badges and chants come from the progress API;
  lesson-path state and matcher answers stay local. Everything degrades to localStorage when
  the API is unreachable.

## Cross-team conventions

- **Lesson ids** live in `shared/lessons.js`, the one place the three schemes line up:
  Person B's canonical `lesson-rules-basics`, Person D's `rules-basics`, and the path nodes
  `1.1`–`1.6`. Person D's config derives its slugs from that file and the frontend maps
  through it, so the lists can't drift apart quietly. `npm run smoke` checks both ends still
  resolve against the live APIs.
- **XP is server-side.** Lessons, chants, the league matcher and drills are all awarded by the
  progress API, once each, with the streak bonus applied. The client never invents XP.

## Known gaps

- **The pitch-pass mini-game's XP is local only.** It's arcade play rather than a learning
  activity, so the progress API doesn't model it; it's added on top of the server's XP for
  display and doesn't persist across devices.
- **Battles and review are still unreached.** Person D's engine supports bot battles, attempt
  review and a hint economy; the drills screen uses questions, hints, answers and completion,
  but there's no battle or review screen in the shell yet.
- **`terms-slang` has no lesson.** Person D has questions for it and the glossary covers the
  vocabulary, but Person B hasn't written that lesson, so it maps to `null` in
  `shared/lessons.js`.
- **Content is draft.** League and culture records carry a `contentStatus` (`draft`,
  `placeholder`, `verified`); the Seattle chant is a flagged placeholder awaiting real
  research. No club crests, logos or licensed lyrics anywhere — text and generic visuals only.
