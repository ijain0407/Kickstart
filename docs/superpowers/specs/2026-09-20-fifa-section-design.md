# FIFA section — design

## Goal
A dedicated FIFA culture section reachable from the sidebar, grouped by confederation, listing the 48 teams of the 2026 World Cup. Each country opens a detail page.

## Navigation
- Add to `frontend/src/components/navItems.js`, **directly after Learn**:
  `{ id: 'fifa', to: '/fifa', icon: 'public', labelKey: 'nav.fifa', match: ['/fifa'] }`
- Sidebar and mobile tab bar both read this list. Verify six tabs still fit on a phone; adjust `TabBar` styling if not.
- Add `nav.fifa` and page UI labels to `i18n/dictionary.js` (EN + ES). Country content is English only.
- Routes (hash router): `#/fifa` (hub), `#/fifa/<countryId>` (country). Router currently supports path + query only, so the page parses the id from `path`.
- Add `/fifa` to `chatbot_feature/server/lib/siteMap.js`.

## Data (frontend static, like `data/leagues.js`)
`frontend/src/data/worldcup/` — one file per confederation (`uefa.js`, `conmebol.js`, `caf.js`, `afc.js`, `concacaf.js`, `ofc.js`) plus `index.js` exporting confederations and a lookup by id.

Country shape:
`{ id, name, code, flag, confederation, ranking, rankingAsOf, titles: [years], appearances, bestFinish, history: [paragraph], players: [{name, note}], chants: [{title, text, note}], gallery: [{url, caption, credit}] }`

- The 48-team field is verified against a web source before writing data.
- Ranking is a dated snapshot; the page shows the "as of" date.
- Chants are short well-known lines or descriptions, never full copyrighted lyrics.
- Gallery images are Wikimedia Commons hotlinks with attribution; URLs are checked; a failed image hides its tile.

## Pages
- `pages/Fifa.jsx`: header + one section per confederation, each a grid of flag/name tiles linking to the country.
- `pages/FifaCountry.jsx`: back link, flag/name header, stats (ranking, titles, appearances, best finish), football journey, famous players, famous chants, gallery. Unknown id shows a not-found state linking back to the hub.
- Register both in `App.jsx`; styles in `styles/pages.css` following existing tokens.

## Testing
- Data test: 48 teams, unique ids, required fields, valid confederation, every confederation non-empty.
- Render test (pattern of `test/wired.test.jsx`): hub lists confederations; a country page renders all sections; unknown id shows not-found; nav has FIFA directly after Learn.

## Out of scope
Spanish country content, live ranking data, servers/APIs.
