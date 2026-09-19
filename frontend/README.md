# SoccerTeaching

A bilingual (English / Spanish) soccer-learning platform built on the **Pitch Craft** design system. Mobile-first, fully responsive, five views, no backend.

## Running it

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
```

Requires Node 18+. The only runtime dependencies are React and ReactDOM.

## Routes

Hash-based routing (`#/field`), so `npm run preview` and any static host work with no rewrite rules.

| Route | View | Contents |
| --- | --- | --- |
| `/` | Learn / Home | Hero + tactical preview, dual-immersion panel, today's drill, Pitch Pass, three training modules |
| `/#/path` | Learn Hub | Division summary, week strip, the winding six-node lesson path, lesson detail card |
| `/#/field` | Tactical Lab | Formation switcher, toggles, full pitch, position inspector |
| `/#/leagues` | Leagues | Your ranked competitions from the matcher, with links into Culture |
| `/#/culture` | Culture | League chips, club hero, three-layer chant cards, tradition spotlight |
| `/#/quiz` | Tactical Matcher | The five-step matcher with live compatibility scoring, then results |
| `/#/lesson?id=1.2` | Lesson player | Three teaching steps with pitch diagrams, then a comprehension check |
| `/#/chant?league=premier&id=ynwa` | Chant practice | Layer-by-layer chant drill with playback and text-to-speech |
| `/#/profile` | Profile | Level, stats, achievements, language preference, reset progress |
| `/#/streak` | Streak | Streak count, weekly strip, milestone rewards, streak rules |
| `/#/play` | Jumpers for Goalposts | A real-time 4-a-side match with live tactical commentary |

Query deep links: `/#/culture?league=laliga`, `/#/lesson?id=1.4`, `/#/chant?league=seriea&id=surdato`.

### Where every button goes

| Control | Destination |
| --- | --- |
| Hero "Start Learning" | `/path` |
| Hero "Find Your League" / module "Find Your League" | `/quiz` |
| Today's drill "Play" | `/lesson?id=1.2` |
| Pitch Pass stops (New Fan / Rules / Pick League / Club Love) | `/path`, `/lesson?id=1.2`, `/quiz`, `/culture` |
| Module "Interactive Tactics" / "Culture & Chants" | `/field`, `/culture` |
| Path node + "Start Lesson" | `/lesson?id=<selected>` |
| "Practice with Simulation" | `/field` |
| Chant "Learn the Chorus" | `/chant?league=…&id=…` |
| Matcher results "Explore this league" | `/culture?league=…` |
| Leagues row chevron | `/culture?league=…` |
| App bar streak pill | `/streak` |
| App bar avatar | `/profile` |
| Learn "Match Day" card / Field "Play a live match" | `/play` |
| Full-time report "Brush up on this" | the lesson the match stats implicate |

Everything else (formation chips, pitch toggles, player tokens, language switch, quiz options, chant layers) is in-page state by design.

## Project structure

```
src/
  main.jsx               entry: providers + root render
  App.jsx                shell, route table, which pages show the progress rail
  router.jsx             ~60-line hash router: RouterProvider, useRouter, Link

  i18n/
    dictionary.js        all UI copy, en + es
    I18nContext.jsx      useI18n() -> { lang, setLang, t, tr }
  state/
    AppState.jsx         useApp() -> XP, streak, lessons, quiz answers, celebration

  data/
    formations.js        4-3-3 / 4-4-2 / 3-5-2 / 4-2-3-1 coordinates + squad names
    lessonContent.js     teaching steps + comprehension check for all six lessons
    positions.js         role, unit, duties and examples for all 15 position codes
    lessons.js           the six Unit 1 lessons and their node states
    leagues.js           clubs, chants (3 layers), spotlights, ranked competitions
    quiz.js              five steps, per-option league weights, scoring

  components/
    AppBar TabBar Sidebar ProgressRail   navigation + chrome (ProgressRail
                                         is the desktop pop-out flyout)
    LangSwitch FieldPressButton XPBar Icon Logo
    PitchBoard PlayerToken               the pitch, shared by hero and Tactical Lab
    LessonNode PitchPass WeekStrip       the learning path
    QuizOption ChantCard                 page-specific cards
    Confetti CelebrationDrawer           the L3 reward modal

  game/
    engine.js            pure match simulation — no React, no DOM, no canvas
    render.js            draws a match state onto a 2D context

  pages/                 Learn, LearnPath, Field, Leagues, Culture, Quiz,
                         Lesson, Chant, Profile, Streak, Play
  styles/
    tokens.css           colour, type, spacing, radii, elevation, motion
    app.css              shell, navigation, primitives, modal
    pitch.css            turf, chalk, player tokens, offside, zones
    pages.css            per-page compositions
    responsive.css       the three breakpoints
```

## How translation works

Two mechanisms, chosen by the shape of the content:

- **UI chrome** lives in `src/i18n/dictionary.js` as parallel `en` / `es` trees, read with `t('home.heroTitle')`. A missing key falls back to English and warns in dev.
- **Domain content** (position duties, chant layers, quiz options) keeps its two languages adjacent as `{ en: '…', es: '…' }` pairs in `src/data/*.js`, read with `tr(pair)`. This keeps each chant's three layers reviewable as one block rather than split across two large trees.

Flipping the EN/ES switch re-renders every string on the page, including nav labels, quiz questions, drill copy and position duties. The choice persists in `localStorage` under `soccerteaching.lang`; on a first visit a Spanish browser locale selects Spanish.

## State and persistence

`AppState` holds XP, level, streak, completed lessons, the weekly strip, quiz answers and chants mastered, persisted to `localStorage` under `soccerteaching.progress`. Every storage read and write is wrapped, so private mode or blocked storage degrades to an in-memory session rather than throwing.

Clear progress from the console:

```js
localStorage.removeItem('soccerteaching.progress')
```

## Design system notes

- **Field Press buttons** carry a solid 4px bottom rim (`0 4px 0 #15803D`, gold variant `#D97706`). Pressing translates the face down 4px and collapses the rim, rather than fading opacity.
- **The pitch** is entirely percentage-based, so `PitchBoard` renders both the hero preview and the full Tactical Lab. Formation coordinates are transcribed exactly from the source screens — see the note at the top of `formations.js` before rounding anything.
- **Barlow Condensed** is used for every number (scores, XP, jersey numbers, timers) with tabular figures enabled, so digits never shift width as values change.
- **Motion** is decoration only. Everything collapses under `prefers-reduced-motion: reduce`.

## Accessibility

Tap targets are 44–48px (the language pill stays visually compact but carries a 44px hit area). Icon-only buttons have `aria-label`; toggles report `aria-pressed`; quiz options use `checkbox` / `radio` roles; the celebration drawer is an `aria-modal` `dialog` that moves focus to its action on open and closes on Escape or backdrop click. Focus rings are a green outline plus `0 0 0 3px rgba(22,163,74,.15)`.

## Jumpers for Goalposts (the match game)

A 90-second, four-a-side arcade match on a canvas, at `/#/play`. The pitch is **landscape** — goals left and right, home attacking right — and the view is built to give the playing surface as much of the screen as it can get.

**Screen space.** The HUD is a single strip; the thumb stick, buttons and Coach's Eye float *over* the pitch rather than stacking below it. A fullscreen button sits in the HUD (and asks for a landscape orientation lock, which Android honours and desktop/iOS ignore). On a short screen — a phone held landscape — the app bar and tab bar step aside automatically while a match is live, so the game gets the whole viewport; the HUD carries its own exit button for that case.

Resulting pitch sizes, measured:

| Viewport | Canvas | Share of screen |
| --- | --- | --- |
| Desktop 1440×950 | 848×565 | 35% |
| Desktop, fullscreen | 1035×690 | — |
| Phone landscape 844×390 | 488×326 | 48% |
| Phone portrait 390×844 | 370×246 | 28% (with a rotate nudge) |

**Controls.** Arrows or WASD to move (right is forward), `J` to pass, hold `Space` to build shot power and release to strike. On touch, a thumb stick and two buttons. You always control whoever is nearest the ball; the switch is automatic. Shots auto-aim at the corner the keeper has vacated, so placement is a reward rather than a chore.

**Coach's Eye.** This is the part that makes it belong to a teaching app rather than being a generic kickabout. Every engine event is translated into the tactical idea behind it — winning the ball back becomes *"Won it back — press worked"*, a completed one-two becomes *"Passing triangle"*, a switch of play is named as such. You learn the vocabulary while playing, not before.

**Full-time report.** Possession, shots, pass accuracy and tackles, then a coach's verdict that reads your numbers and links to the lesson that addresses the weakness — poor pass accuracy points at the midfield-screen lesson, low possession at the six-second press, and so on.

### Architecture

`src/game/engine.js` is a pure simulation: `stepMatch(state, dt, input)` advances a plain object and has no React, DOM or canvas dependency. The pitch is 150×100 field units; `FIELD` and the two goal helpers (`targetGoal` / `ownGoal`) are the only places orientation is encoded. `src/game/render.js` is a pure function of that state onto a 2D context. That split means the match can be simulated headlessly — the balance figures below come from running 8 full matches per configuration in Node with no browser at all:

| Setup | Avg score | Possession | Shots |
| --- | --- | --- | --- |
| Idle player, Sunday League | 0–5.1 | 34% | 7.0 |
| Idle player, Cup Final | 0–8.8 | 34% | 15.9 |
| Active player, Sunday League | 2.9–0 | 52% | 9.4 |
| Active player, Cup Final | 1.3–0 | 50% | 7.5 |

Across those runs: no NaN, nothing leaves the pitch, and every match reaches full time. The "active player" rows use a frame-perfect scripted bot, so a human will concede more than the zeroes suggest.

Tunable constants sit at the top of `engine.js` — `USER_SPEED`, `GK_CONTROL_R` (keeper reach, which shrinks as the ball arrives faster, so a well-struck shot can beat them), `TURNOVER_IMMUNITY`, and the `DIFFICULTY` table.

## Rewards

Finishing a lesson or mastering a chant awards XP and opens the celebration drawer **on the page you earned it**. Dismissing the drawer is what carries you onward — the reward payload takes an optional `next` route, so the lesson player returns you to the path and chant practice returns you to that league's Culture page. Navigating away by any other means closes the drawer rather than dragging it along.

## Content and licensing

**Chant lyrics are not reproduced.** Every `layer1` block in `src/data/leagues.js` holds clearly marked placeholder text plus a short factual description of the song. Replace those strings with your own licensed lines. Layers 2 and 3 (literal translation and cultural meaning) are original text and ship as-is.

Stadium photography uses Unsplash placeholder URLs. They fail gracefully to the card's gradient if unreachable, and should be swapped for licensed imagery before launch.

Squad surnames on the Tactical Lab are invented; the "famous modern examples" in each position entry name real players illustratively and are not affiliated with any club.

## Two deliberate deviations from the source screens

1. **Plain CSS instead of Tailwind.** The spec allowed either. The design leans on custom rims, layered shadows, mowing-stripe gradients and chalk geometry that would become arbitrary-value soup in utility classes, so the tokens live in `tokens.css` as CSS custom properties and components read them by name.
2. **The matcher opens on "Step 1 of 5 / 20%".** The source screen was captured mid-flow at step 2, and it labels that step "Pace & Tone" — which is the first of the five topics the brief lists. Advancing one step reproduces the pictured "Step 2 of 5 / 40%" state exactly.

## The desktop progress flyout

Progress and Pitch Pass are **pop-out tabs pinned to the right edge**, not a docked column. Two handles sit at the vertical centre of the viewport; clicking one slides a 320px panel in from the right and the handles ride out on its edge.

It closes on Escape, on a click anywhere outside it, or on the panel's own close button. There is deliberately no backdrop — the page stays fully usable while a panel is open, so you can read your streak while tapping players on the pitch.

Because the panel overlays rather than occupying a grid column, the desktop layout is `sidebar + content` (two columns) and **every page gets the full content width**. That is what fixes the Field page: the position inspector is no longer squeezed by a permanently docked rail, and the Quiz keeps its 320px compatibility column.

The flyout appears at 841px and up only. On mobile and tablet the same information already lives in the app bar (streak, level) and inline on the Learn pages.
