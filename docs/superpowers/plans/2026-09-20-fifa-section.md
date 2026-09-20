# FIFA Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a FIFA sidebar/tab entry (directly under Learn) opening a hub of the 48 teams of the 2026 World Cup grouped by confederation, with a detail page per country.

**Architecture:** Static content in `frontend/src/data/worldcup/` (one file per confederation + `index.js`), two new pages (`Fifa.jsx` hub, `FifaCountry.jsx`), selected by `#/fifa` and `#/fifa?team=<id>`. No server changes except adding `/fifa` to the chatbot site map.

**Tech Stack:** React 19, hash router (`src/router.jsx`), Vitest + Testing Library, plain CSS (`src/styles/*.css`).

## Global Constraints

- FIFA nav item placed **directly after Learn** in `NAV_ITEMS`.
- Country content is **English only**; UI chrome labels are translated EN + ES in `i18n/dictionary.js`.
- Exactly **48 teams**, the 2026 World Cup field, verified against a web source (Task 1).
- Confederations: `UEFA`, `CONMEBOL`, `CAF`, `AFC`, `CONCACAF`, `OFC`.
- Chants: short well-known lines or descriptions, never full lyrics.
- Gallery images: Wikimedia Commons URLs with `credit`; a failed image hides its tile.
- Rankings are a dated snapshot: every country carries `rankingAsOf` (`YYYY-MM`).
- **Deviation from spec:** country pages use `#/fifa?team=<id>` (query param, same pattern as `#/culture?league=`) instead of `#/fifa/<id>`. The router only matches exact paths and the nav "active" check uses `match.includes(path)`, so a path segment would need changes in `App.jsx`, `Sidebar` and `TabBar`. Behaviour is identical for the user.
- Run frontend tests with `npm test --prefix frontend` from the repo root. Commit messages end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

## File Structure

- Create `frontend/src/data/worldcup/{uefa,conmebol,caf,afc,concacaf,ofc}.js`: country arrays.
- Create `frontend/src/data/worldcup/index.js`: `CONFEDERATIONS`, `COUNTRIES`, `getCountry(id)`, `flagUrl(code, width)`.
- Create `frontend/src/pages/Fifa.jsx`: hub, and renders `FifaCountry` when `query.team` is set.
- Create `frontend/src/pages/FifaCountry.jsx`: country detail.
- Create `frontend/src/test/fifa-data.test.js`, `frontend/src/test/fifa.test.jsx`.
- Modify `components/navItems.js`, `i18n/dictionary.js`, `App.jsx`, `styles/app.css` (tab grid), `styles/pages.css`, `chatbot_feature/server/lib/siteMap.js`.

### Country shape (used by every task)

```js
{
  id: 'brazil',                // kebab-case, unique
  name: 'Brazil',
  code: 'br',                  // flagcdn.com code (gb-eng, gb-sct for home nations)
  confederation: 'CONMEBOL',
  ranking: 5, rankingAsOf: '2026-06',
  titles: [1958, 1962, 1970, 1994, 2002],   // [] if none
  appearances: 23,             // incl. 2026
  bestFinish: 'Champions (5x)',
  history: ['paragraph', 'paragraph'],      // 2-4 paragraphs
  players: [{ name: 'Pelé', note: 'Only player with three World Cup wins.' }],   // 4-6
  chants: [{ title: 'Eu sou brasileiro', text: 'short line or description', note: 'origin/context' }],  // 2-3
  gallery: [{ url: 'https://upload.wikimedia.org/...', caption: '...', credit: 'Author / Wikimedia Commons, CC BY-SA 4.0' }],  // 3-5
}
```

Flags use images from flagcdn.com rather than emoji, because Windows browsers render flag emoji as plain letters.

---

### Task 1: Data module, validation test, verified roster, CONMEBOL

**Files:**
- Create: `frontend/src/data/worldcup/index.js`, `conmebol.js`, and the other five confederation files as `export default []`
- Test: `frontend/src/test/fifa-data.test.js`

**Interfaces:**
- Produces: `CONFEDERATIONS: { id, name }[]` (order above), `COUNTRIES: Country[]`, `getCountry(id): Country | undefined`, `flagUrl(code, width = 80): string`.

- [ ] **Step 1: Verify the 2026 field.** Use WebSearch/WebFetch for "2026 FIFA World Cup qualified teams". Write the 48 names by confederation into your notes; confirm the per-confederation counts sum to 48. This list drives Tasks 2-5.
- [ ] **Step 2: Write the failing test** `frontend/src/test/fifa-data.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { CONFEDERATIONS, COUNTRIES, getCountry, flagUrl } from '../data/worldcup/index.js'

const REQUIRED = ['id', 'name', 'code', 'confederation', 'ranking', 'rankingAsOf', 'titles', 'appearances', 'bestFinish', 'history', 'players', 'chants', 'gallery']

describe('World Cup data', () => {
  it('has the six confederations in order', () => {
    expect(CONFEDERATIONS.map((c) => c.id)).toEqual(['UEFA', 'CONMEBOL', 'CAF', 'AFC', 'CONCACAF', 'OFC'])
  })

  it.each(COUNTRIES.map((c) => [c.id, c]))('%s is complete', (_id, c) => {
    for (const key of REQUIRED) expect(c[key], key).toBeDefined()
    expect(CONFEDERATIONS.map((x) => x.id)).toContain(c.confederation)
    expect(c.rankingAsOf).toMatch(/^\d{4}-\d{2}$/)
    expect(c.history.length).toBeGreaterThanOrEqual(2)
    expect(c.players.length).toBeGreaterThanOrEqual(4)
    expect(c.chants.length).toBeGreaterThanOrEqual(2)
    expect(c.gallery.length).toBeGreaterThanOrEqual(3)
    for (const g of c.gallery) expect(g.url).toMatch(/^https:\/\/upload\.wikimedia\.org\//)
  })

  it('has unique ids and a working lookup', () => {
    const ids = COUNTRIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of COUNTRIES) expect(getCountry(c.id)).toBe(c)
    expect(getCountry('nope')).toBeUndefined()
  })

  it('builds flag urls', () => {
    expect(flagUrl('br')).toBe('https://flagcdn.com/w80/br.png')
    expect(flagUrl('gb-eng', 160)).toBe('https://flagcdn.com/w160/gb-eng.png')
  })
})
```

- [ ] **Step 3: Run** `npm test --prefix frontend -- fifa-data` → FAIL (module not found).
- [ ] **Step 4: Create `index.js`:**

```js
import uefa from './uefa.js'
import conmebol from './conmebol.js'
import caf from './caf.js'
import afc from './afc.js'
import concacaf from './concacaf.js'
import ofc from './ofc.js'

export const CONFEDERATIONS = [
  { id: 'UEFA', name: 'Europe' },
  { id: 'CONMEBOL', name: 'South America' },
  { id: 'CAF', name: 'Africa' },
  { id: 'AFC', name: 'Asia' },
  { id: 'CONCACAF', name: 'North & Central America, Caribbean' },
  { id: 'OFC', name: 'Oceania' },
]

export const COUNTRIES = [...uefa, ...conmebol, ...caf, ...afc, ...concacaf, ...ofc]

export const getCountry = (id) => COUNTRIES.find((c) => c.id === id)

export const flagUrl = (code, width = 80) => `https://flagcdn.com/w${width}/${code}.png`
```

Create `uefa.js`, `caf.js`, `afc.js`, `concacaf.js`, `ofc.js` each containing `export default []`.

- [ ] **Step 5: Write `conmebol.js`** with every CONMEBOL team from Step 1, each following the Country shape. Brazil reference entry (the quality bar for length and tone):

```js
export default [
  {
    id: 'brazil', name: 'Brazil', code: 'br', confederation: 'CONMEBOL',
    ranking: 5, rankingAsOf: '2026-06',
    titles: [1958, 1962, 1970, 1994, 2002], appearances: 23, bestFinish: 'Champions (5x)',
    history: [
      'Brazil is the only nation to play in every World Cup. Football arrived with Charles Miller in the 1890s and became a national identity, with the joga bonito style tying skill and joy together.',
      'The Seleção won its first title in 1958 with a 17-year-old Pelé, added 1962 and 1970 (often called the greatest team ever), then waited until 1994 and 2002 for titles four and five.',
    ],
    players: [
      { name: 'Pelé', note: 'Three-time World Cup winner and the face of the 1970 team.' },
      { name: 'Garrincha', note: 'The wing wizard who led the 1962 win.' },
      { name: 'Ronaldo Nazário', note: 'Scored 15 World Cup goals and starred in 2002.' },
      { name: 'Ronaldinho', note: 'Magician of the 2002 winners.' },
      { name: 'Neymar', note: "Brazil's all-time leading scorer." },
    ],
    chants: [
      { title: 'Eu sou brasileiro, com muito orgulho', text: 'I am Brazilian, with great pride', note: 'A stadium staple sung with drums and samba rhythm.' },
      { title: 'Olê, olê, olê, Seleção', text: 'Olé, olé, olé, Seleção', note: 'Fans sing it as the team walks out.' },
    ],
    gallery: [/* 3-5 Wikimedia Commons items, URLs verified in Step 6 */],
  },
  // ...remaining CONMEBOL teams
]
```

The real file must contain complete gallery arrays (no comments left in), and Brazil's stats (ranking, appearances) must be checked against a current source.

- [ ] **Step 6: Find and verify gallery URLs.** For each country, search Wikimedia Commons (WebSearch/WebFetch on `commons.wikimedia.org`) for 3-5 freely licensed images (national team, stadium, trophy moment, fans). Use the direct `upload.wikimedia.org/wikipedia/commons/...` URL and record author and licence in `credit`. Confirm each URL returns 200 (`curl -sI <url> | head -1`). Drop any that fail.
- [ ] **Step 7: Run** `npm test --prefix frontend -- fifa-data` → PASS.
- [ ] **Step 8: Commit** `git add frontend/src/data/worldcup frontend/src/test/fifa-data.test.js && git commit -m "Add World Cup data module and CONMEBOL teams"`

### Task 2: UEFA teams

**Files:** Modify `frontend/src/data/worldcup/uefa.js`

- [ ] **Step 1:** Replace `export default []` with all UEFA teams from the Task 1 roster, following the Country shape and the Brazil quality bar. Home nations use codes `gb-eng`, `gb-sct`, `gb-wls` if qualified. Gallery URLs are verified as in Task 1 Step 6.
- [ ] **Step 2:** Run `npm test --prefix frontend -- fifa-data` → PASS.
- [ ] **Step 3:** Commit `git add frontend/src/data/worldcup/uefa.js && git commit -m "Add UEFA teams"`.

### Task 3: CAF teams

Same steps as Task 2 for `caf.js`. Commit message "Add CAF teams".

### Task 4: AFC teams

Same steps as Task 2 for `afc.js`. Commit message "Add AFC teams".

### Task 5: CONCACAF and OFC teams

Same steps as Task 2 for `concacaf.js` and `ofc.js` (hosts USA, Canada and Mexico belong to CONCACAF). Commit message "Add CONCACAF and OFC teams".

- [ ] **Final step:** append this test to `fifa-data.test.js` inside the `describe` block, confirm it passes, and commit as "Assert 48 teams":

```js
  it('has exactly the 48 teams of the 2026 World Cup', () => {
    expect(COUNTRIES).toHaveLength(48)
    for (const conf of CONFEDERATIONS) expect(COUNTRIES.some((c) => c.confederation === conf.id)).toBe(true)
  })
```

### Task 6: Navigation, i18n, routing, hub page

**Files:**
- Modify: `frontend/src/components/navItems.js`, `frontend/src/i18n/dictionary.js`, `frontend/src/App.jsx`, `frontend/src/styles/app.css`, `frontend/src/styles/pages.css`, `chatbot_feature/server/lib/siteMap.js`
- Create: `frontend/src/pages/Fifa.jsx`, `frontend/src/pages/FifaCountry.jsx` (temporary body: `export default function FifaCountry() { return null }`, replaced in Task 7)
- Test: `frontend/src/test/fifa.test.jsx`

**Interfaces:**
- Consumes: `CONFEDERATIONS`, `COUNTRIES`, `getCountry`, `flagUrl` from Task 1; `useRouter()` returns `{ path, query, navigate }`; `Link` from `router.jsx`.
- Produces: `Fifa` default export, which renders `<FifaCountry country={...} />` when `query.team` matches a country and a not-found state when it doesn't; `FifaCountry` receives prop `country`.

- [ ] **Step 1: Write the failing test** `frontend/src/test/fifa.test.jsx`:

```jsx
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import App from '../App.jsx'
import { RouterProvider } from '../router.jsx'
import { I18nProvider } from '../i18n/I18nContext.jsx'
import { ThemeProvider } from '../state/ThemeContext.jsx'
import { AppProvider } from '../state/AppState.jsx'
import { NAV_ITEMS } from '../components/navItems.js'
import { CONFEDERATIONS, COUNTRIES } from '../data/worldcup/index.js'

function renderApp(route) {
  window.location.hash = `#${route}`
  return render(
    <ThemeProvider><I18nProvider><AppProvider><RouterProvider><App /></RouterProvider></AppProvider></I18nProvider></ThemeProvider>,
  )
}

describe('FIFA nav', () => {
  it('sits directly after Learn', () => {
    const ids = NAV_ITEMS.map((i) => i.id)
    expect(ids.indexOf('fifa')).toBe(ids.indexOf('learn') + 1)
  })
})

describe('FIFA hub', () => {
  it('lists each confederation with its teams', () => {
    renderApp('/fifa')
    for (const conf of CONFEDERATIONS) {
      const teams = COUNTRIES.filter((c) => c.confederation === conf.id)
      const section = screen.getByRole('region', { name: new RegExp(conf.id) })
      for (const team of teams) expect(within(section).getByRole('link', { name: new RegExp(team.name) })).toBeInTheDocument()
    }
  })

  it('shows not-found for an unknown team', () => {
    renderApp('/fifa?team=atlantis')
    expect(screen.getByText(/couldn.t find that team/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run** `npm test --prefix frontend -- fifa.test` → FAIL.
- [ ] **Step 3: `navItems.js`:** insert after the learn line:

```js
  { id: 'fifa', to: '/fifa', icon: 'public', labelKey: 'nav.fifa', match: ['/fifa'] },
```
and change the file's comment from "five" to "six destinations".

- [ ] **Step 4: Dictionary.** In `nav` add `fifa: 'FIFA'` in both EN (~line 419) and ES (~line 423). Add a top-level `fifa` block to each language next to `leagues`:

EN:
```js
    fifa: {
      title: 'FIFA World Cup',
      sub: 'The 48 teams of the 2026 World Cup, by confederation.',
      notFound: "We couldn't find that team.",
      backToHub: 'All teams',
      ranking: 'FIFA ranking',
      rankingAsOf: 'as of',
      titles: 'World Cups won',
      none: 'None',
      appearances: 'Appearances',
      bestFinish: 'Best finish',
      journey: 'Football journey',
      players: 'Famous players',
      chants: 'Famous chants',
      gallery: 'Gallery',
    },
```
ES:
```js
    fifa: {
      title: 'Copa Mundial de la FIFA',
      sub: 'Las 48 selecciones del Mundial 2026, por confederación.',
      notFound: 'No encontramos esa selección.',
      backToHub: 'Todas las selecciones',
      ranking: 'Ranking FIFA',
      rankingAsOf: 'a',
      titles: 'Mundiales ganados',
      none: 'Ninguno',
      appearances: 'Participaciones',
      bestFinish: 'Mejor resultado',
      journey: 'Historia futbolística',
      players: 'Jugadores famosos',
      chants: 'Cánticos famosos',
      gallery: 'Galería',
    },
```

- [ ] **Step 5: `App.jsx`:** add `import Fifa from './pages/Fifa.jsx'` and `'/fifa': Fifa,` in `ROUTES`.
- [ ] **Step 6: `Fifa.jsx`:**

```jsx
import { useI18n } from '../i18n/I18nContext.jsx'
import { Link, useRouter } from '../router.jsx'
import { CONFEDERATIONS, COUNTRIES, getCountry, flagUrl } from '../data/worldcup/index.js'
import FifaCountry from './FifaCountry.jsx'

/** FIFA hub: the 2026 World Cup field by confederation. `?team=<id>` opens a country. */
export default function Fifa() {
  const { t } = useI18n()
  const { query } = useRouter()

  if (query.team) {
    const country = getCountry(query.team)
    if (country) return <FifaCountry country={country} />
    return (
      <div className="page">
        <p className="t-body-md">{t('fifa.notFound')}</p>
        <Link to="/fifa" className="fifa-back">{t('fifa.backToHub')}</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="stack stack-2">
        <h1 className="t-headline-lg">{t('fifa.title')}</h1>
        <p className="t-body-md text-secondary">{t('fifa.sub')}</p>
      </div>

      {CONFEDERATIONS.map((conf) => {
        const teams = COUNTRIES.filter((c) => c.confederation === conf.id)
        const headingId = `fifa-conf-${conf.id}`
        return (
          <section key={conf.id} className="stack stack-3" aria-labelledby={headingId}>
            <h2 className="t-headline-md" id={headingId}>{conf.id} <span className="text-secondary t-body-sm">{conf.name}</span></h2>
            <div className="fifa-grid">
              {teams.map((team) => (
                <Link key={team.id} to={`/fifa?team=${team.id}`} className="card fifa-tile">
                  <img className="fifa-flag" src={flagUrl(team.code)} alt="" loading="lazy" />
                  <span className="t-headline-sm">{team.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
```
(`<section aria-labelledby>` gives the `region` role the test queries; the accessible name starts with the confederation id.)

- [ ] **Step 7: CSS.** In `app.css` change `.tabbar__inner` to `grid-template-columns: repeat(6, 1fr);` and `max-width: 560px;`. Append to `pages.css`:

```css
/* ---- FIFA ---- */
.fifa-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.fifa-tile { display: flex; align-items: center; gap: 10px; padding: 12px 14px; }
.fifa-flag { width: 32px; height: 24px; object-fit: cover; border-radius: 4px; flex: none; background: var(--track); }
.fifa-back { display: inline-flex; align-items: center; gap: 4px; color: var(--green-ink); font-weight: 600; }
```

- [ ] **Step 8: `siteMap.js`:** add `fifa: { path: '/fifa', label: { en: 'FIFA World Cup', es: 'Copa Mundial FIFA' } },` after `learn`. Check whether chatbot tests or prompts hard-code the section list (`grep -rn "SECTION_IDS\|siteMap" chatbot_feature frontend/src/test`) and update them if so.
- [ ] **Step 9: Create the temporary `FifaCountry.jsx`** stub, then run `npm test --prefix frontend` → all PASS.
- [ ] **Step 10: Commit** `git add -A frontend chatbot_feature && git commit -m "Add FIFA nav entry and hub page"`.

### Task 7: Country page

**Files:**
- Modify: `frontend/src/pages/FifaCountry.jsx`, `frontend/src/styles/pages.css`, `frontend/src/test/fifa.test.jsx`

**Interfaces:**
- Consumes: prop `country` (Country shape), `flagUrl`, `Link`, `useI18n().t`, dictionary keys from Task 6.

- [ ] **Step 1: Append failing tests** to `fifa.test.jsx`:

```jsx
describe('FIFA country page', () => {
  const brazil = COUNTRIES.find((c) => c.id === 'brazil')

  it('renders stats, history, players, chants and gallery', () => {
    renderApp('/fifa?team=brazil')
    expect(screen.getByRole('heading', { name: brazil.name, level: 1 })).toBeInTheDocument()
    expect(screen.getByText(`#${brazil.ranking}`)).toBeInTheDocument()
    expect(screen.getByText('1958, 1962, 1970, 1994, 2002')).toBeInTheDocument()
    for (const key of ['Football journey', 'Famous players', 'Famous chants', 'Gallery']) {
      expect(screen.getByRole('heading', { name: key })).toBeInTheDocument()
    }
    expect(screen.getByText(brazil.players[0].name)).toBeInTheDocument()
    expect(screen.getByText(brazil.chants[0].title)).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /./ }).length).toBeGreaterThanOrEqual(brazil.gallery.length)
  })

  it('links back to the hub', () => {
    renderApp('/fifa?team=brazil')
    expect(screen.getByRole('link', { name: /all teams/i })).toHaveAttribute('href', '#/fifa')
  })
})
```

- [ ] **Step 2: Run** → FAIL (the stub renders nothing).
- [ ] **Step 3: Implement `FifaCountry.jsx`:**

```jsx
import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { Link } from '../router.jsx'
import { flagUrl } from '../data/worldcup/index.js'

function GalleryImage({ item }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <figure className="fifa-shot">
      <img src={item.url} alt={item.caption} loading="lazy" onError={() => setFailed(true)} />
      <figcaption className="t-body-sm text-secondary">{item.caption} <span className="fifa-credit">{item.credit}</span></figcaption>
    </figure>
  )
}

/** One country: FIFA stats, history, players, chants and a Commons gallery. */
export default function FifaCountry({ country: c }) {
  const { t } = useI18n()
  const stats = [
    { label: t('fifa.ranking'), value: `#${c.ranking}`, sub: `${t('fifa.rankingAsOf')} ${c.rankingAsOf}` },
    { label: t('fifa.titles'), value: c.titles.length ? c.titles.join(', ') : t('fifa.none') },
    { label: t('fifa.appearances'), value: String(c.appearances) },
    { label: t('fifa.bestFinish'), value: c.bestFinish },
  ]

  return (
    <div className="page">
      <Link to="/fifa" className="fifa-back"><Icon name="chevron_left" />{t('fifa.backToHub')}</Link>

      <header className="row row-3">
        <img className="fifa-flag fifa-flag--lg" src={flagUrl(c.code, 160)} alt="" />
        <div className="stack stack-1">
          <h1 className="t-headline-lg">{c.name}</h1>
          <span className="pill pill--grey">{c.confederation}</span>
        </div>
      </header>

      <section className="fifa-stats">
        {stats.map((s) => (
          <div className="card card--pad stack stack-1" key={s.label}>
            <span className="t-body-sm text-secondary">{s.label}</span>
            <span className="t-headline-sm">{s.value}</span>
            {s.sub ? <span className="t-body-sm text-secondary">{s.sub}</span> : null}
          </div>
        ))}
      </section>

      <section className="stack stack-3">
        <h2 className="t-headline-md">{t('fifa.journey')}</h2>
        {c.history.map((p, i) => <p className="t-body-md" key={i}>{p}</p>)}
      </section>

      <section className="stack stack-3">
        <h2 className="t-headline-md">{t('fifa.players')}</h2>
        {c.players.map((p) => (
          <div className="card card--pad stack stack-1" key={p.name}>
            <span className="t-headline-sm">{p.name}</span>
            <span className="t-body-sm text-secondary">{p.note}</span>
          </div>
        ))}
      </section>

      <section className="stack stack-3">
        <h2 className="t-headline-md">{t('fifa.chants')}</h2>
        {c.chants.map((ch) => (
          <div className="card card--pad stack stack-1" key={ch.title}>
            <span className="t-headline-sm">{ch.title}</span>
            <span className="t-body-md">{ch.text}</span>
            <span className="t-body-sm text-secondary">{ch.note}</span>
          </div>
        ))}
      </section>

      <section className="stack stack-3">
        <h2 className="t-headline-md">{t('fifa.gallery')}</h2>
        <div className="fifa-gallery">
          {c.gallery.map((g) => <GalleryImage key={g.url} item={g} />)}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: CSS.** Append to `pages.css`:

```css
.fifa-flag--lg { width: 64px; height: 48px; }
.fifa-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.fifa-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.fifa-shot { margin: 0; display: flex; flex-direction: column; gap: 6px; }
.fifa-shot img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--r-card); background: var(--track); }
.fifa-credit { opacity: 0.7; }
```

- [ ] **Step 5: Run** `npm test --prefix frontend` → all PASS.
- [ ] **Step 6: Commit** `git add -A frontend && git commit -m "Add FIFA country detail page"`.

### Task 8: Visual verification

- [ ] **Step 1:** Run `npm run dev` and open the app (use the `run` skill). Check: FIFA appears directly under Learn in the desktop sidebar; six tabs fit at 375px width with no label clipping (if clipped, reduce `.tab__label` size at `max-width: 379px` in `responsive.css`); the hub shows six confederation sections; a country page shows all sections; broken gallery images disappear; the ES language switch translates the labels; dark mode is readable.
- [ ] **Step 2:** Run `npm test --prefix frontend` and `npm run build`; both must succeed.
- [ ] **Step 3:** Commit any fixes: `git commit -am "Polish FIFA section layout"`.
