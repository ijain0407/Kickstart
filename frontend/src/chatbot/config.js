/** Chatbot content that's meant to be edited: suggested prompts and UI labels. */

/**
 * First-open suggestion chips. One array, one { en, es } pair each — the text
 * is sent verbatim as the user's message, so write it as the user would.
 */
export const SUGGESTED_PROMPTS = [
  { en: 'How do I use this site?', es: '¿Cómo uso este sitio?' },
  { en: 'Take me to the Quiz', es: 'Llévame al Test' },
  { en: 'Explain offside', es: 'Explícame el fuera de juego' },
  { en: "What's the story behind club nicknames?", es: '¿Cuál es la historia de los apodos de los clubes?' },
  { en: 'Latest soccer news', es: 'Últimas noticias de fútbol' },
  { en: 'What can I learn in the Field tab?', es: '¿Qué puedo aprender en la pestaña Campo?' },
]

export const MAX_INPUT_CHARS = 500

export const STRINGS = {
  name: { en: 'Leo AI', es: 'Leo AI' },
  title: { en: 'Leo AI', es: 'Leo AI' },
  greeting: {
    en: "Hi! I'm Leo, your Kickstart guide. Ask me how the site works, or anything about soccer: rules, tactics, players, clubs or the latest news.",
    es: '¡Hola! Soy Leo, tu guía en Kickstart. Pregúntame cómo funciona el sitio o cualquier cosa de fútbol: reglas, tácticas, jugadores, clubes o las últimas noticias.',
  },
  placeholder: { en: 'Ask about the site or soccer…', es: 'Pregunta sobre el sitio o fútbol…' },
  networkError: {
    en: "Sorry, I couldn't reach the server. Please try again in a moment.",
    es: 'Lo siento, no pude conectar con el servidor. Inténtalo de nuevo en un momento.',
  },
  newChat: { en: 'New chat', es: 'Nuevo chat' },
  close: { en: 'Close chat', es: 'Cerrar chat' },
  open: { en: 'Chat with Leo', es: 'Chatear con Leo' },
  send: { en: 'Send', es: 'Enviar' },
  openedPage: { en: 'Opened', es: 'Abierto' },
}
