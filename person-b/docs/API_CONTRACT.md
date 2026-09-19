# API Contract — Soccer Learn Platform (v1)

Owner: Person B (Core & Lessons). This is the source of truth for content shape, IDs, and
localization. Person C (Leagues/Culture) and Person D (Quiz/Progress) should follow the same
`LocalizedString` pattern and ID conventions in their own endpoints.

Base URL (local): `http://localhost:4010`
Base URL (deployed): see deploy/DEPLOY.md once the domain is live.

All responses are JSON. All list endpoints return `{ "data": [...] }`. All single-item
endpoints return `{ "data": {...} }`. Errors return `{ "error": { "code": "...", "message": "..." } }`
with a matching HTTP status.

---

## 1. Localization pattern

Every human-readable field on a content record is a `LocalizedString`:

```json
{ "en": "Offside", "es": "Fuera de juego" }
```

Rules:
- `en` is **required** on every record. Content is authored in English first.
- `es` is optional at the data layer (a record can exist before it's translated), but for
  launch content we aim to fill both.
- **Fallback**: if `es` is missing or empty, consumers fall back to `en`. This fallback can
  happen in two places — pick whichever's easier per-teammate:
  1. **Client-side (recommended for Person A):** i18next already does this — request the full
     `LocalizedString` object, read `obj[i18n.language] || obj.en`.
  2. **Server-side flattening:** pass `?lang=en` or `?lang=es` on any GET endpoint below and
     the API returns plain strings instead of `{en, es}` objects, with fallback already applied.
     Useful for quick curl testing or non-i18next consumers.

Example — same lesson, two response shapes:

Default (`GET /lessons/lesson-rules-basics`):
```json
{ "title": { "en": "The Basic Rules", "es": "Las Reglas Básicas" } }
```

Flattened (`GET /lessons/lesson-rules-basics?lang=es`):
```json
{ "title": "Las Reglas Básicas" }
```

Flattened with missing translation (`?lang=es` but `es` not yet written):
```json
{ "title": "The Basic Rules" }
```
(falls back to `en`, no error, no `null`)

---

## 2. ID conventions

IDs are lowercase kebab-case strings, prefixed by content type so they're unambiguous across
the whole team's data (all four of us share one ID space in the demo):

| Prefix       | Owner     | Example                    |
|--------------|-----------|-----------------------------|
| `lesson-`    | Person B  | `lesson-rules-basics`       |
| `formation-` | Person B  | `formation-4-4-2`           |
| `term-`      | Person B  | `term-offside`              |
| `league-`    | Person C  | `league-la-liga` (example)  |
| `culture-`   | Person C  | `culture-derby-day` (example) |
| `quiz-`      | Person D  | `quiz-rules-basics-q1`      |

IDs are permanent once published — don't reuse or renumber. Person D's quiz questions
reference lesson content via a `lessonId` field that must match a real `lesson-*` id exactly
(see §6 below), so lesson IDs are frozen as soon as mocks ship tonight.

---

## 3. Schemas

### 3.1 Lesson

```ts
{
  id: string;                    // "lesson-rules-basics"
  category: "rules" | "positions" | "formations" | "how-to-watch";
  order: number;                 // display order within category, starting at 1
  title: LocalizedString;
  summary: LocalizedString;      // 1-2 sentence teaser, shown on Learn Hub cards
  body: LocalizedString;         // full lesson content, markdown string
  relatedFormationIds: string[]; // e.g. ["formation-4-4-2", "formation-4-3-3"], can be []
  relatedGlossaryIds: string[];  // e.g. ["term-offside"], can be []
  updatedAt: string;             // ISO 8601
}
```

### 3.2 Formation

This is Person A's top blocker for the field diagram — locked first, see §7.

```ts
{
  id: string;                    // "formation-4-4-2"
  name: LocalizedString;         // { en: "4-4-2", es: "4-4-2" } (numbers don't translate)
  description: LocalizedString;
  positions: Array<{
    id: string;                  // "gk", "lb", "cb1", "cb2", "st1", ... unique within formation
    role: string;                // short role code: "GK", "LB", "CB", "CM", "ST", etc.
    label: LocalizedString;      // { en: "Goalkeeper", es: "Portero" }
    x: number;                   // 0-100, left-to-right across the pitch
    y: number;                   // 0-100, own goal (0) to opponent goal (100)
  }>;
}
```

**Coordinate convention** (critical for Person A — document this in the diagram component too):
- Field is treated as a 0-100 by 0-100 box regardless of actual aspect ratio; the frontend maps
  it onto whatever SVG/div dimensions it wants.
- `x: 0` = left touchline, `x: 100` = right touchline, `x: 50` = center.
- `y: 0` = your own goal line, `y: 100` = opponent's goal line. Goalkeeper is always `y` near 0.
- This is a single team facing "up" the pitch — no need to model both teams.

### 3.3 Glossary term

```ts
{
  id: string;                    // "term-offside"
  term: LocalizedString;
  definition: LocalizedString;
  relatedLessonIds: string[];    // lessons that reference this term, can be []
}
```

### 3.4 LocalizedString

```ts
{
  en: string;   // required
  es?: string;  // optional; falls back to en when absent
}
```

---

## 4. Endpoints

### `GET /health`
No params. Returns 200 always if the server is up.
```json
{ "status": "ok", "timestamp": "2026-09-19T20:00:00.000Z" }
```

### `GET /lessons`
Query params: `category` (optional, filters by category), `lang` (optional, `en`|`es`, flattens).

Request: `GET /lessons?category=positions`

Response:
```json
{
  "data": [
    {
      "id": "lesson-positions-overview",
      "category": "positions",
      "order": 1,
      "title": { "en": "Player Positions", "es": "Posiciones de los Jugadores" },
      "summary": { "en": "Who plays where and why.", "es": "Quién juega dónde y por qué." },
      "body": { "en": "## Positions\n...", "es": "## Posiciones\n..." },
      "relatedFormationIds": ["formation-4-4-2"],
      "relatedGlossaryIds": ["term-offside"],
      "updatedAt": "2026-09-19T20:00:00.000Z"
    }
  ]
}
```

### `GET /lessons/:id`
Query params: `lang` (optional).
404 if not found:
```json
{ "error": { "code": "NOT_FOUND", "message": "No lesson with id 'lesson-xyz'" } }
```

### `GET /formations`
Query params: `lang` (optional).
```json
{
  "data": [
    {
      "id": "formation-4-4-2",
      "name": { "en": "4-4-2", "es": "4-4-2" },
      "description": { "en": "Two banks of four...", "es": "Dos líneas de cuatro..." },
      "positions": [
        { "id": "gk", "role": "GK", "label": { "en": "Goalkeeper", "es": "Portero" }, "x": 50, "y": 5 },
        { "id": "lb", "role": "LB", "label": { "en": "Left Back", "es": "Lateral Izquierdo" }, "x": 15, "y": 25 }
      ]
    }
  ]
}
```

### `GET /formations/:id`
Same shape as one item above. 404 shape same as lessons.

### `GET /glossary`
Query params: `search` (optional, matches term in en or es, case-insensitive), `lang` (optional).
```json
{
  "data": [
    {
      "id": "term-offside",
      "term": { "en": "Offside", "es": "Fuera de juego" },
      "definition": { "en": "A player is offside if...", "es": "Un jugador está en fuera de juego si..." },
      "relatedLessonIds": ["lesson-rules-basics"]
    }
  ]
}
```

### `GET /glossary/:id`
Same shape as one item above.

---

## 5. Error format

All errors:
```json
{ "error": { "code": "NOT_FOUND", "message": "human readable message" } }
```
Status codes used: `404` (not found), `400` (bad query param, e.g. invalid `lang`), `500` (unexpected).

---

## 6. Cross-team conventions (for Person C and Person D)

- Follow `LocalizedString` for every user-facing text field: `{ en, es }`, `es` optional with
  fallback to `en`.
- Prefix your IDs (`league-`, `culture-`, `quiz-`) and never reuse a `lesson-`/`formation-`/`term-`
  prefixed ID.
- Person D: quiz questions should carry a `lessonId` field referencing an existing `lesson-*` id
  from `GET /lessons`, so progress can be tied back to lesson content. Fetch `/lessons` to get
  the live list of valid IDs — don't hardcode a copy that can drift.
- Wrap your list/single responses the same way: `{ "data": [...] }` / `{ "data": {...} }`,
  errors as `{ "error": { "code", "message" } }`. Keeps the frontend's fetch helpers uniform.
- Support `?lang=en|es` flattening on your own endpoints if practical, for consistency — not
  a hard requirement, but nice for Person A/D if they reuse a shared fetch+localize helper.

---

## 7. Status

- [x] Locked by Person B.
- Formation coordinates for 4-4-2, 4-3-3, 3-5-2 are in `server/data/formations.json`.
