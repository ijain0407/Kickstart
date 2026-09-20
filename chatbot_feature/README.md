# Chatbot feature

A floating soccer-ball chat widget that answers quick questions about the app
and the rules of soccer. Lives entirely in this folder plus one new folder on
the frontend (`frontend/src/chatbot/`) — see the two integration points below.

## Backend

```
chatbot_feature/
  server/
    index.js          standalone runner (npm run dev, port 4020)
    routes/chatbot.js  GET /suggestions, POST /ask
    lib/gemini.js       calls the Gemini API when GEMINI_API_KEY is set
    lib/faq.js           built-in bilingual FAQ, used as a fallback
```

`POST /ask` tries Gemini first. If `GEMINI_API_KEY` isn't set, or the call
fails for any reason (bad key, network, quota), it falls back to the local
FAQ matcher — the widget always answers something, even fully offline.

### Setup

1. Get a free key at https://aistudio.google.com/apikey (optional).
2. Copy the repo-root `.env.example` to `.env` and paste the key in as
   `GEMINI_API_KEY=...`. Leave it blank to run FAQ-only.
3. `npm run dev` at the repo root picks it up automatically.

## Integration points

Two small, deliberate edits to shared files — everything else is new:

- `server/gateway.js` — one import + one `app.use('/api/chatbot', ...)` line.
- `frontend/src/App.jsx` — one import + one `<ChatWidget />` render line.

## Frontend

`frontend/src/chatbot/ChatWidget.jsx` renders the floating ball and its chat
panel, and pulls in `frontend/src/chatbot/chatbot.css` itself — no shared
stylesheet was touched.
