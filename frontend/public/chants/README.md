# Chant recordings

Drop audio files here and point a chant at one in
`league_feature/server/data/culture.json`:

```json
{
  "id": "mia-san-mia",
  "audioUrl": "/chants/mia-san-mia.mp3",
  ...
}
```

The file name is up to you; the path is what the browser requests. Any format the
browser can play works (mp3, m4a, ogg, wav).

Chants without an `audioUrl` fall back to the browser voice reading the original
line, so the player always does something. If a file is missing or won't decode,
the UI falls back to the voice rather than failing silently.
