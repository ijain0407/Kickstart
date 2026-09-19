# Data Contract — for Person C (Leagues/Culture) and Person D (Quiz/Progress)

Quick reference so your endpoints feel like one API to Person A's frontend. Full detail in
[API_CONTRACT.md](API_CONTRACT.md) — this is the short version.

## 1. Every text field is bilingual

```json
{ "en": "English text", "es": "Texto en español" }
```
`en` required, `es` optional. If `es` is missing, consumers fall back to `en` — never leave a
field `null` or omit it entirely if you don't have the translation yet, just skip the `es` key.

## 2. Response envelope

Lists: `{ "data": [ ... ] }`
Single item: `{ "data": { ... } }`
Errors: `{ "error": { "code": "NOT_FOUND", "message": "..." } }` with matching HTTP status.

## 3. ID prefixes — don't collide with mine

| Prefix       | Owner    |
|--------------|----------|
| `lesson-`    | Person B |
| `formation-` | Person B |
| `term-`      | Person B |
| `league-`    | Person C |
| `culture-`   | Person C |
| `quiz-`      | Person D |

IDs are kebab-case and permanent once you publish them — the frontend and (for Person D)
lesson references will hardcode them.

## 4. Person D specifically: linking quiz questions to lessons

Each quiz question that's tied to lesson content should carry a `lessonId` field matching a
real id from `GET /lessons` (e.g. `"lessonId": "lesson-rules-basics"`). Fetch `/lessons` live
rather than hardcoding a copy of the list — lesson content may still change tonight/tomorrow.

Current lesson IDs (as of contract lock): `lesson-rules-basics`, `lesson-positions-overview`,
`lesson-formations-overview`, `lesson-how-to-watch`. Formation IDs: `formation-4-4-2`,
`formation-4-3-3`, `formation-3-5-2`. Glossary term IDs: see `GET /glossary` — nine terms
covering rules and match-watching vocabulary.

## 5. Optional but nice: `?lang=en|es`

If practical, support a `?lang=` query param on your GET endpoints that flattens `{en,es}`
objects to plain strings (fallback to `en`). Not required — Person A's frontend can also just
read `obj[i18n.language] || obj.en` on the raw bilingual object — but consistent behavior
across all our endpoints makes any shared fetch helper simpler.

## 6. Where to put your code

- Data: `server/data/<yours>.json`
- Routes: `server/routes/<yours>.js`, mounted in `server/index.js`
- Follow the pattern in `server/routes/lessons.js` as a template.
