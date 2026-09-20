# Chatbot feature

A floating soccer-ball chat widget that helps people use the Kickstart site and
answers soccer questions (rules, tactics, players, clubs, current news). It can
also take the user to a page ("take me to the Quiz", "show me La Liga clubs").

## Backend

```
chatbot_feature/server/
  index.js            standalone runner (npm run dev, port 4020)
  routes/chatbot.js   GET /suggestions, POST /stream (SSE), POST /ask (JSON)
  lib/gemini.js       @google/genai streaming chat, navigate_to tool, Google Search grounding
  lib/siteMap.js      real site routes, league ids, and the system prompt / site guide
  lib/limiter.js      in-memory rate limit (20 requests/min per IP)
  lib/faq.js          built-in bilingual FAQ, used when Gemini is unavailable
```

- The Gemini key is read **server-side only** (`GEMINI_API_KEY`); the browser only
  talks to `/api/chatbot/*`. Never prefix it with `VITE_`.
- The model comes from `GEMINI_MODEL` (default `gemini-2.5-flash`).
- Messages are capped at 500 characters, history at 12 turns, and requests are
  rate limited. Errors sent to the browser are always friendly strings.
- News-style questions ("latest", "score", "transfer"…) use Google Search
  grounding; everything else gets the `navigate_to` tool. Gemini 2.5 can't
  combine both in one request.
- If Gemini fails before answering, the FAQ answers instead.

`POST /stream` events: `{type:'text'}`, `{type:'navigate', section, path, label}`,
`{type:'done', source}`, `{type:'error', message}`.

### Setup

1. Get a key at https://aistudio.google.com/apikey.
2. Copy the repo-root `.env.example` to `.env` and set `GEMINI_API_KEY=...`
   (`.env` is git-ignored). Leave it blank to run FAQ-only.
3. `npm run dev` at the repo root picks it up (the server loads `.env` itself).

## Frontend

`frontend/src/chatbot/`

- `ChatWidget.jsx` — floating ball, panel, streaming, New chat, navigation.
- `config.js` — **edit here** to change the suggested-prompt chips and UI text (EN/ES).
- `markdown.jsx` — safe markdown (no raw HTML; links limited to app routes and https).
- `stream.js` — SSE client.
- `chatbot.css` — styles, self-contained.

Adding a page the bot can open: add it to `SECTIONS` in `lib/siteMap.js`, to
`APP_PATHS` in `markdown.jsx`, and mention it in the site guide.

## Integration points

- `server/gateway.js` — mounts `/api/chatbot`.
- `frontend/src/App.jsx` — renders `<ChatWidget />` inside the router.
