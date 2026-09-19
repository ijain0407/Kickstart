# League & Culture API

Owner: Person C. Base path `/api`, default port **4100** (Person D's quiz API uses 4000, so
both can run during the demo).

## Conventions

- **Bilingual storage, localized responses.** Every user-facing field is stored as
  `{ "en": "...", "es": "..." }`. Responses come back already flattened to one language,
  chosen per request: `?locale=` → `X-Locale` header → `Accept-Language` → `en`. An
  unsupported locale falls back to English rather than erroring, and a missing `es` value
  falls back to the `en` one.
- **One exception, on purpose:** a chant's or nickname's `original` field is
  `{ text, lang }`, not `{ en, es }`. It is never translated in any locale — that's the
  point of the three-layer format.
- **Errors**: `{ "error": { "code": "...", "message": "..." } }` with a matching status —
  the same shape Person D's API uses, so one client error handler covers both.
- **IDs** are kebab-case and prefixed by owner: `league-`, `culture-`, and `league-quiz-`
  for quiz questions. They're permanent once published.

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | `{ ok: true }` |
| GET | `/api/leagues` | All five leagues plus the trait definitions |
| GET | `/api/leagues/:id` | One league, its culture-card summaries, trait definitions |
| GET | `/api/culture` | Culture card summaries; `?league=league-la-liga` filters |
| GET | `/api/culture/:id` | One full card, its league, and the league's other cards |
| GET | `/api/league-quiz` | Quiz questions (scoring weights are stripped) |
| POST | `/api/league-quiz/recommend` | `{ answers: { [questionId]: optionId } }` → best-fit league |

### GET /api/leagues

```json
{
  "leagues": [
    {
      "id": "league-premier-league",
      "order": 1,
      "name": "Premier League",
      "country": "England",
      "founded": 1992,
      "tagline": "Relentless pace, physical battles, and no easy weekends.",
      "style": "The Premier League is known for…",
      "traits": { "pace": 5, "physicality": 5, "tactics": 3, "technique": 4, "atmosphere": 4, "underdogs": 3, "rivalries": 4 },
      "topClubs": [{ "name": "Liverpool", "cultureId": "culture-liverpool" }],
      "rivalries": [{ "name": "North West Derby", "clubs": ["Liverpool", "Manchester United"], "description": "…" }],
      "contentStatus": "draft"
    }
  ],
  "traits": [{ "id": "pace", "label": "Pace", "description": "End-to-end speed and fast transitions." }]
}
```

`traits` rates each league 1-5 on the same seven traits the quiz scores, so the profile page
can draw bars and the quiz can rank leagues against an answer profile. `cultureId` is `null`
for clubs that don't have a culture card yet.

### GET /api/culture/:id

```json
{
  "card": {
    "id": "culture-bayern-munich",
    "leagueId": "league-bundesliga",
    "club": "Bayern Munich",
    "city": "Munich, Germany",
    "founded": 1900,
    "colors": "Red and white",
    "summary": "…",
    "nickname": {
      "original": { "text": "Die Roten", "lang": "de" },
      "literal": "The Reds",
      "meaning": "A simple nod to the red shirts…"
    },
    "stadium": { "name": "Allianz Arena", "traditions": ["…"] },
    "rivalries": [{ "name": "Der Klassiker", "opponent": "Borussia Dortmund", "opponentCultureId": "culture-borussia-dortmund", "description": "…" }],
    "chants": [
      {
        "id": "mia-san-mia",
        "title": "Mia san mia",
        "when": "The club's motto — on banners, shirts, and in songs",
        "original": { "text": "Mia san mia", "lang": "bar" },
        "literal": "We are we",
        "meaning": "Bavarian dialect for 'we are who we are'…"
      }
    ],
    "contentStatus": "draft"
  },
  "league": { "id": "league-bundesliga", "name": "Bundesliga" },
  "related": [ /* card summaries from the same league */ ]
}
```

**The three layers** — `original`, `literal`, `meaning` — are the feature. `nickname` and each
chant use the identical shape, so one UI component renders both (`LayeredText.jsx`).
`original.lang` is a language code (`en`, `es`, `ca`, `de`, `bar`, `it`) the UI turns into a
name with `Intl.DisplayNames`.

Card **summaries** (used by list endpoints) carry `id`, `leagueId`, `club`, `city`, `founded`,
`nickname`, `summary`, `chantCount`, `contentStatus` — no chants or stadium detail.

### POST /api/league-quiz/recommend

Request — a partial set of answers is allowed, so the UI can show a provisional result:

```json
{ "answers": { "league-quiz-q1-draw": "tactics", "league-quiz-q5-scoreline": "masterclass" } }
```

Response:

```json
{
  "recommendation": {
    "league": { /* the full league object */ },
    "matchPercent": 87,
    "reasons": [{ "id": "tactics", "label": "Tactics", "description": "…" }]
  },
  "ranking": [{ "leagueId": "league-serie-a", "name": "Serie A", "tagline": "…", "matchPercent": 87 }],
  "profile": [{ "id": "tactics", "label": "Tactics", "value": 6, "percent": 100 }]
}
```

Errors: `NO_ANSWERS` (empty), `UNKNOWN_QUESTION`, `UNKNOWN_OPTION` (all 400), plus
`VALIDATION_ERROR` for a malformed body.

## How the recommendation works

`server/src/lib/recommend.js`, no dependencies — it can be lifted into the client if we ever
want the quiz to work offline.

1. Each chosen option adds weights to an **answer profile** across the seven traits.
2. Each league's 1-5 trait ratings are **centered on 3**, so "average at this" scores zero and
   "weak at this" scores negative.
3. The match is the **cosine similarity** between the two. Cosine rather than a plain dot
   product means a league with strong opinions can't win just by having bigger numbers.
4. `matchPercent` maps that -1…1 score onto 0-100. Ties break by league display order, never
   at random.
5. `reasons` are the traits that contributed most to the winning score — what the result
   screen shows as "because you picked…".

Every league is reachable: each of the seven traits leads to a different best fit, which
`server/tests/recommend.test.js` asserts so a content edit can't quietly create a dead end.

## Content status

Every league and card carries `contentStatus`: `draft` (written, not fact-checked),
`placeholder` (structure only — replace the text), or `verified`. Seattle's chant is the one
`placeholder` right now. No club crests, logos, or images anywhere — text only.
