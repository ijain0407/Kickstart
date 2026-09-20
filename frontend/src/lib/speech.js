/* ============================================================
   SPEECH
   No crowd recordings ship with this app — match audio is
   copyrighted and we license nothing. So the play button reads
   the chant out loud with the browser's own voice, in the
   language the stand sings it in.
   ============================================================ */

/** BCP-47 tags for the languages our chants are written in. */
const VOICE_LANG = {
  en: 'en-GB',
  es: 'es-ES',
  ca: 'ca-ES',
  it: 'it-IT',
  de: 'de-DE',
  // Bavarian has no voice of its own anywhere; German is the closest.
  bar: 'de-DE',
}

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function cancelSpeech() {
  if (speechSupported()) window.speechSynthesis.cancel()
}

/**
 * Speaks `text` in `lang`. Returns a cleanup function, and calls `onEnd` when
 * it finishes or fails, so the caller can drop its "playing" state either way.
 * Chants are short and repetitive, so it reads slightly slowly.
 */
export function speak(text, lang = 'en', { onEnd } = {}) {
  if (!speechSupported() || !text) {
    onEnd?.()
    return () => {}
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = VOICE_LANG[lang] ?? VOICE_LANG.en
  utterance.rate = 0.9
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)

  return () => window.speechSynthesis.cancel()
}
