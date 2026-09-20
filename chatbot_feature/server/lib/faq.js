/**
 * Built-in fallback knowledge base — used whenever GEMINI_API_KEY isn't set,
 * or the Gemini call fails, so the chat ball still answers something useful
 * offline. Keyword-scored, not fuzzy: good enough for short quick-questions.
 */

const ENTRIES = [
  {
    keywords: ['xp', 'points', 'experience', 'puntos', 'experiencia'],
    en: "You earn XP by finishing lessons, chants, the league matcher and drills — it's all awarded server-side, with a streak bonus on top.",
    es: 'Ganas XP al completar lecciones, cánticos, el buscador de ligas y ejercicios. Todo se otorga desde el servidor, con un bono por racha.',
  },
  {
    keywords: ['streak', 'racha'],
    en: 'Your streak counts consecutive days with at least one completed activity. Miss a day and it resets, so a little every day beats a lot once in a while.',
    es: 'Tu racha cuenta los días consecutivos con al menos una actividad completada. Si falta un día, se reinicia: un poco cada día es mejor que mucho de vez en cuando.',
  },
  {
    keywords: ['badge', 'badges', 'insignia', 'insignias'],
    en: 'Badges unlock at milestones — lessons finished, streak length, quiz mastery — and show up on your profile.',
    es: 'Las insignias se desbloquean en hitos: lecciones terminadas, duración de la racha, dominio del quiz, y aparecen en tu perfil.',
  },
  {
    keywords: ['league', 'leagues', 'matcher', 'liga', 'ligas'],
    en: 'The league matcher asks a few quick questions and matches you to real leagues and clubs that fit your vibe.',
    es: 'El buscador de ligas te hace unas preguntas rápidas y te sugiere ligas y clubes reales que combinan con tu estilo.',
  },
  {
    keywords: ['chant', 'chants', 'cantico', 'canticos', 'nickname'],
    en: 'Chants are explained in three layers: what the stands actually sing, the literal translation, and what it really means.',
    es: 'Los cánticos se explican en tres capas: lo que canta la grada, la traducción literal, y lo que realmente significa.',
  },
  {
    keywords: ['offside', 'fuera de juego'],
    en: "A player is offside if they're nearer the opponent's goal line than both the ball and the second-last defender when a teammate passes to them — no penalty unless they get involved in the play.",
    es: 'Un jugador está en fuera de juego si está más cerca de la línea de gol rival que el balón y el segundo defensor más retrasado cuando un compañero le pasa, salvo que no participe en la jugada.',
  },
  {
    keywords: ['card', 'yellow card', 'red card', 'tarjeta', 'tarjeta amarilla', 'tarjeta roja'],
    en: 'A yellow card is a caution; a second yellow or a straight red sends a player off, leaving their team a player short for the rest of the match.',
    es: 'La tarjeta amarilla es una advertencia; una segunda amarilla o una roja directa expulsa al jugador, dejando a su equipo con uno menos el resto del partido.',
  },
  {
    keywords: ['how long', 'match length', 'minutes', 'duracion', 'cuanto dura', 'minutos'],
    en: 'A match is 90 minutes — two 45-minute halves — plus stoppage time and, in some competitions, extra time.',
    es: 'Un partido dura 90 minutos, dos tiempos de 45, más el tiempo añadido y, en algunas competiciones, la prórroga.',
  },
  {
    keywords: ['formation', 'formaciones', 'formacion', '4-3-3', '4-4-2'],
    en: 'A formation is how a team arranges its players on the pitch, like 4-3-3 or 4-4-2 — check the tactics board on the Field page to see them in action.',
    es: 'Una formación es cómo un equipo distribuye a sus jugadores en el campo, como 4-3-3 o 4-4-2. Mira el tablero táctico en la página de Campo.',
  },
  {
    keywords: ['language', 'spanish', 'english', 'idioma', 'espanol', 'ingles'],
    en: 'Tap the language switch in the top bar to flip between English and Spanish — everything refetches in the new language.',
    es: 'Toca el interruptor de idioma en la barra superior para cambiar entre inglés y español. Todo se vuelve a cargar en el nuevo idioma.',
  },
  {
    keywords: ['what is kickstart', 'about', 'app', 'que es kickstart', 'que es esta app'],
    en: 'Kickstart is a bilingual soccer-learning platform: lessons, a tactics board, club culture and chants, a league matcher, and XP/streaks/badges.',
    es: 'Kickstart es una plataforma bilingüe para aprender fútbol: lecciones, un tablero táctico, cultura de clubes y cánticos, un buscador de ligas, y XP/rachas/insignias.',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'hola', 'buenas'],
    en: 'Hey! Ask me about Kickstart or anything soccer — rules, tactics, clubs, players.',
    es: '¡Hola! Pregúntame sobre Kickstart o cualquier tema de fútbol: reglas, tácticas, clubes, jugadores.',
  },
]

const DEFAULT_REPLY = {
  en: "I can't look that up right now (live soccer answers are offline), but I can help with XP, streaks, leagues, chants, offside, cards or formations.",
  es: 'Ahora mismo no puedo consultar eso (las respuestas de fútbol en vivo no están disponibles), pero puedo ayudarte con XP, rachas, ligas, cánticos, fuera de juego, tarjetas o formaciones.',
}

export const SUGGESTED_QUESTIONS = [
  { en: 'How do I earn XP?', es: '¿Cómo gano XP?' },
  { en: "What's the offside rule?", es: '¿Qué es el fuera de juego?' },
  { en: 'How does the league matcher work?', es: '¿Cómo funciona el buscador de ligas?' },
  { en: "What's the latest soccer news?", es: '¿Cuáles son las últimas noticias de fútbol?' },
  { en: 'Explain a false 9', es: 'Explícame qué es un falso 9' },
]

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function answerFaq(message, locale = 'en') {
  const lang = locale === 'es' ? 'es' : 'en'
  const norm = normalize(message)
  const padded = ` ${norm.replace(/[^a-z0-9-]+/g, ' ')} `

  let best = null
  let bestScore = 0
  for (const entry of ENTRIES) {
    // Whole-word match: plain substring made "explain" hit the "xp" entry.
    const score = entry.keywords.reduce((n, kw) => n + (padded.includes(` ${normalize(kw)} `) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }

  if (best) return best[lang] ?? best.en
  return DEFAULT_REPLY[lang] ?? DEFAULT_REPLY.en
}
