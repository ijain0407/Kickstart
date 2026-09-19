# Kickstart

Localized soccer-teaching platform. This branch (`feature/quiz-progress`) holds **Person D's workstream**: quiz engine, XP / levels / badges / streaks, the progress API, and the quiz + progress UI.

```
quiz_feature/
  server/   Express API (quiz, progress) + JSON-file storage + question bank
  client/   React + Tailwind + i18next (quiz hub, play, results, review, progress)
  docs/api-quiz-progress.md   endpoint reference, hook contracts, gamification config
```

## Run it

All commands run from `quiz_feature/`.

```bash
cd quiz_feature
npm install
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173 (proxies /api to :4000)
```

| Command | What it does |
|---|---|
| `npm test` | server (Vitest + Supertest) and client (Vitest + Testing Library) tests |
| `npm run lint` | ESLint for both workspaces |
| `npm run validate:questions` | checks the bilingual question bank |
| `npm run smoke:quiz` | plays a full quiz against an in-memory API and asserts progress updated |

Routes: `/quiz`, `/quiz/battle`, `/quiz/play`, `/quiz/results/:id`, `/quiz/review/:id`, `/progress`, `/explain-play`.

## Stand-ins for other people's work

- **Lesson ids**: placeholders in `server/src/config/lessonIds.js` and `client/src/features/quiz/config.js`.
- **App shell, nav, language switcher, theme, design tokens**: minimal versions in `client/src/App.jsx`, `components/LanguageToggle.jsx`, `tailwind.config.js`, marked `TODO(A)`.
- **Storage**: JSON files under `server/data/` behind `progressRepo` / `attemptRepo` (swap for a DB later).
- **Identity**: anonymous `X-User-Id` UUID stored in `localStorage`.
- **Field diagram** on formation questions: a labelled placeholder until A's component exists.
- **`/learn` links**: Back to Learn and Review link to `/learn` and `/learn/:lessonId`.
