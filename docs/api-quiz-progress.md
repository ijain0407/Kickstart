# Quiz & Progress API (Person D)

Base path `/api`. JSON in, JSON out. Errors always look like:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "mode: Invalid enum value" } }
```

## Request headers

| Header | Required | Purpose |
|---|---|---|
| `X-User-Id` | yes | Anonymous UUID generated client-side (8-64 chars, letters/digits/hyphens). Progress is created lazily. Missing/invalid → `401 MISSING_USER`. |
| `X-Client-Date` | no | User's local date `YYYY-MM-DD`, used for streaks. |
| `X-Timezone` | no | IANA zone (e.g. `America/Chicago`), used only when `X-Client-Date` is absent. Falls back to server UTC. |
| `X-Locale` | no | `en` / `es`. Also accepted: `?locale=` query param, then `Accept-Language`. Anything else falls back to `en`. |

The client (`client/src/lib/api.js`) sends all four automatically.

## Quiz

### `GET /quiz/questions?mode=&lesson=&count=&locale=`
Stateless randomized set. `mode` = `quick` (default) or `lesson` (requires `lesson`). `count` 1-20 (default 5).
Never contains `correctOptionId`, `explanation` or hint text.

```json
{ "questions": [ { "id": "q_offside_001", "lessonId": "rules-basics", "topic": "offside", "difficulty": 1,
  "type": "multiple_choice", "prompt": "When is an attacker…", "options": [ { "id": "a", "text": "…" } ],
  "media": { "type": "none", "ref": null }, "hasHint": true } ] }
```

### `POST /quiz/attempts`
Body `{ "mode": "quick" | "lesson", "lesson"?: "positions", "count"?: 5 }` → `201`
Returns `{ attemptId, mode, lessonId, completed, questions[], answers{}, hintsUsed[] }`.

**Battle mode:** `{ "mode": "battle", "difficulty": "easy" | "medium" | "hard", "count"?: 5 }` (default `medium`). The response adds `bot: { name, difficulty }`. The bot answers each question with 60% / 75% / 90% accuracy and a random 1.5-5 s delay, planned server-side (`server/src/bots/scriptedBot.js`, behind a `plan(question)` interface so real-time PvP could replace it). The bot's answer for a question is only revealed in the `POST /quiz/answer` response (`bot: { optionId, correct, delayMs }`) and in `answers[qid].bot` after the user has answered it. Completing adds `battleResult` (`win`/`draw`/`loss`), `botScore` and `botDifficulty`; XP: win +30, draw +10.

### `GET /quiz/attempts/:id`
Same shape, localized to the current locale. Used to resume after a reload and to re-render in another language **without resetting the attempt**. `answers` only contains already-answered questions (with their correct option and explanation).

### `POST /quiz/answer`
Body `{ questionId, optionId, attemptId }` → `{ correct, selectedOptionId, correctOptionId, explanation }`.
The first answer to a question stands; retries return the recorded result. Answering a completed attempt → `409 ATTEMPT_COMPLETED`.

### `POST /quiz/hint`
Body `{ questionId, attemptId }` → `{ hint, xpCost }`. The cost (5 XP) is deducted once per question when the attempt completes.

### `POST /quiz/attempts/:id/complete`
Scores on the server, awards XP, updates streak/badges. **Idempotent**: a second call returns the same result and awards nothing. Unanswered questions count as missed.

```json
{ "attemptId": "…", "mode": "quick", "lessonId": null, "score": 4, "total": 5, "perfect": false,
  "xpEarned": 75, "xpBreakdown": { "answers": 60, "perfectBonus": 0, "battleBonus": 0, "streakBonus": 15, "hintPenalty": 0 },
  "levelBefore": "fan", "levelAfter": "enthusiast",
  "levelInfo": { "level": "enthusiast", "nextLevel": "tactics_nerd", "xpIntoLevel": 10, "xpForNextLevel": 600, "nextLevelThreshold": 900, "progressPercent": 1 },
  "newBadges": ["first_whistle"], "streak": { "current": 1, "best": 1, "lastActiveDate": "2026-03-01" }, "missedCount": 1 }
```

### `GET /quiz/review?attemptId=`
Missed questions of a **completed** attempt (`409` otherwise): each has the public question fields plus `userOptionId` (null if unanswered), `correctOptionId`, `explanation`.

## Progress

### `GET /progress`
```json
{ "userId": "…", "xp": 130, "level": "fan", "nextLevel": "enthusiast", "xpIntoLevel": 130, "xpForNextLevel": 300,
  "nextLevelThreshold": 300, "progressPercent": 43,
  "streak": { "current": 2, "best": 2, "lastActiveDate": "2026-03-02" },
  "stats": { "questionsAnswered": 10, "correctAnswers": 8, "chantsLearned": 1, "lessonsCompleted": 1, "accuracyPercent": 80 },
  "badges": [ { "id": "first_whistle", "earnedAt": "…" } ], "completedLessonIds": ["positions"],
  "bestScores": { "quick": 100, "positions": 80 },
  "history": [ { "kind": "quiz", "attemptId": "…", "mode": "quick", "score": 4, "total": 5, "xpEarned": 60, "completedAt": "…" },
               { "kind": "lesson", "lessonId": "positions", "xpEarned": 55, "completedAt": "…" } ] }
```
`bestScores` values are best percentages, keyed by `quick` or lesson id (local best scores only, no cross-user leaderboard).

### `GET /progress/badges`
`{ "badges": [ { "id", "icon", "earned", "earnedAt", "progress": { "current", "target" } | null } ] }`

### `POST /progress/reset`
Wipes the current user's progress; returns the fresh progress view.

## Explain This Play (rules-based demo)

**Not real video analysis.** The clip is never uploaded, stored or inspected. The endpoint only receives a file's name/type/size (or a link) and picks a pre-written scenario from `server/data/scenarios.json` by keyword (`offside`, `corner`/`esquina`, `penalty`/`penal`, accent-insensitive), falling back to generic viewing tips. Responses carry `demo: true` and the UI labels everything "Demo analysis".

### `GET /explain/scenarios`
`{ "scenarios": [ { "id": "offside", "title": "Offside call" }, … ] }` (localized). Used for the "try a sample" buttons.

### `POST /explain/analyze`
```json
{ "source": "file", "filename": "offside-goal.mp4", "mimeType": "video/mp4", "size": 1048576 }
{ "source": "url", "url": "https://example.com/clips/penalty.gif" }
{ "source": "scenario", "scenarioId": "offside" }
```
→ `{ demo: true, matched, source, sourceLabel, scenarioId, title, annotations: [ { timestamp, title, explanation, lessonId } ] }`

Limits: `video/mp4`, `video/webm`, `image/gif` only (`415 UNSUPPORTED_TYPE`), max 25 MB (`413 FILE_TOO_LARGE`), links must be plain `http(s)` without credentials and ≤2048 chars (`400 INVALID_URL`; the server never fetches them). File names are reduced to a clean base name (control characters and paths stripped, ≤120 chars). Unknown `scenarioId` → `400 UNKNOWN_SCENARIO`.

## Integration hooks for other teams

### Person A: `POST /progress/lesson-complete`
Call when a learner finishes a lesson.
```json
// request
{ "lessonId": "positions" }
// response
{ "alreadyCompleted": false, "xpEarned": 55, "levelBefore": "fan", "levelAfter": "fan", "newBadges": [], "streak": { "current": 1, "best": 1, "lastActiveDate": "2026-03-01" } }
```
+50 XP the first time only (plus the daily streak bonus on the first activity of the day). Valid ids: `rules-basics`, `positions`, `formations`, `terms-slang`, `how-to-watch`, otherwise `400 UNKNOWN_LESSON`.

### Person C: `POST /progress/chant-viewed`
Call when a learner opens a chant card.
```json
// request
{ "chantId": "liverpool-ynwa" }
// response
{ "alreadyViewed": false, "chantsLearned": 1, "newBadges": [] }
```
Counted once per unique `chantId` (any stable string ≤100 chars). Five unique chants unlock `chant_collector`.

## Gamification config

All numbers live in `server/src/config/gamificationConfig.js`.

| Setting | Value |
|---|---|
| Correct answer XP | 10 (difficulty 1) / 15 (2) / 20 (3) |
| Perfect quiz bonus | +25 (quiz of 5+ questions) |
| Lesson complete | +50, first time per lesson |
| Daily streak bonus | +5 × min(streak, 7), on the first activity of the day |
| Hint cost | −5 XP each (never drops the attempt below 0) |
| Battle win / draw | +30 / +10 (Tier 3, not built) |
| Levels | Fan 0 · Enthusiast 300 · Tactics Nerd 900 |
| Quick quiz mix | ~40% easy / 40% medium / 20% hard |

Badges (`server/src/config/badges.js`, rules in `server/src/lib/badges.js`): `first_whistle`, `perfect_score`, `offside_expert`, `formation_guru`, `chant_collector`, `hat_trick`, `week_warrior`, `tactics_nerd`, `polyglot`.

## Question bank

`server/data/questions.json`, validated by `npm run validate:questions` (unique ids, exactly one correct option, `en` + `es` on every text field, no empty strings). 46 questions across the five lessons plus `leagues-culture`, which only appears in quick quizzes.

Lesson ids are placeholders in `server/src/config/lessonIds.js` (and `client/src/features/quiz/config.js`); change them there if Person B's ids differ.
