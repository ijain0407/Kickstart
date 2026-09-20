import { cancelSpeech, speak, speechSupported } from './speech.js'

/* ============================================================
   CHANT AUDIO
   A chant plays its recording when it has one, and falls back to
   the browser voice reading the original line when it doesn't.

   To add a recording: drop the file in frontend/public/chants/
   and set `audioUrl` on that chant in
   league_feature/server/data/culture.json, e.g.

     "audioUrl": "/chants/mia-san-mia.mp3"

   Anything the browser can play works (mp3, m4a, ogg, wav).
   ============================================================ */

let current = null

/** Stops whatever is playing — a clip or the voice. */
export function stopChant() {
  if (current) {
    current.pause()
    current.currentTime = 0
    current = null
  }
  cancelSpeech()
}

/**
 * Plays `audioUrl` if the chant has one, otherwise speaks `text` in `lang`.
 * `onEnd` fires when playback finishes, is stopped, or fails — including when
 * a recording 404s, in which case it falls back to the voice rather than
 * leaving the button stuck in "playing".
 */
export function playChant({ audioUrl, text, lang }, { onEnd } = {}) {
  stopChant()

  if (audioUrl) {
    const clip = new Audio(audioUrl)
    current = clip
    clip.onended = () => {
      current = null
      onEnd?.()
    }
    clip.onerror = () => {
      // Missing or unplayable file: say the line instead of failing silently.
      current = null
      speak(text, lang, { onEnd })
    }
    clip.play().catch(() => {
      current = null
      speak(text, lang, { onEnd })
    })
    return stopChant
  }

  speak(text, lang, { onEnd })
  return stopChant
}

/** True when the chant can produce sound at all on this device. */
export const canPlayChant = (audioUrl) => Boolean(audioUrl) || speechSupported()
