/* ============================================================
   UNIT 1 — TACTICAL FOUNDATIONS
   The six nodes of the winding lesson path. `align` drives the
   left / centre / right stagger of each row.
   ============================================================ */

export const LESSONS = [
  {
    id: '1.1',
    align: 'center',
    icon: 'stadium',
    xp: 40,
    stars: 3,
    minutes: 5,
    title: { en: 'The Pitch & Basics', es: 'El campo y lo básico' },
    desc: {
      en: 'Walk the lines, the boxes and the eleven shirts before anything else. Where everyone stands, and why the pitch is drawn the way it is.',
      es: 'Recorre las líneas, las áreas y las once camisetas antes que nada. Dónde se coloca cada uno y por qué el campo se dibuja así.',
    },
    bounty: {
      en: '+40 XP Warm-up Bounty',
      es: '+40 XP de recompensa de calentamiento',
    },
    unlocks: { en: "Unlocks 'Pitch Reader'", es: "Desbloquea 'Lector de campo'" },
  },
  {
    id: '1.2',
    align: 'right',
    icon: 'sports_soccer',
    xp: 50,
    stars: 0,
    minutes: 6,
    title: { en: 'The Offside Rule', es: 'La regla del fuera de juego' },
    detailTitle: {
      en: 'Module 1.2: The Offside Rule Demystified',
      es: 'Módulo 1.2: El fuera de juego, sin misterio',
    },
    desc: {
      en: 'Learn why the assistant referee raises the flag, how the second-to-last defender sets the trap, and why passing backward is never offside!',
      es: '¡Aprende por qué el juez de línea levanta el banderín, cómo el penúltimo defensa arma la trampa y por qué un pase hacia atrás nunca es fuera de juego!',
    },
    bounty: { en: '+50 XP Drill Bounty', es: '+50 XP de recompensa' },
    unlocks: { en: "Unlocks 'Tactics Apprentice'", es: "Desbloquea 'Aprendiz táctico'" },
  },
  {
    id: '1.3',
    align: 'left',
    icon: 'shield',
    xp: 45,
    stars: 0,
    minutes: 7,
    title: { en: 'Defenders & Midfield', es: 'Defensas y mediocampo' },
    desc: {
      en: 'Who holds the line, who screens in front of it, and how the two units move as one block when possession is lost.',
      es: 'Quién sostiene la línea, quién la protege por delante y cómo las dos unidades se mueven como un solo bloque al perder el balón.',
    },
    bounty: { en: '+45 XP Drill Bounty', es: '+45 XP de recompensa' },
    unlocks: { en: "Unlocks 'Block Builder'", es: "Desbloquea 'Constructor de bloque'" },
  },
  {
    id: '1.4',
    align: 'right',
    icon: 'grid_view',
    xp: 55,
    stars: 0,
    minutes: 8,
    title: { en: 'Formations Matter', es: 'Las formaciones importan' },
    desc: {
      en: '4-3-3, 4-4-2, 3-5-2 — what each shape gives you, what it costs you, and when a coach switches mid-match.',
      es: '4-3-3, 4-4-2, 3-5-2: qué te da cada dibujo, qué te cuesta y cuándo un entrenador cambia a mitad de partido.',
    },
    bounty: { en: '+55 XP Drill Bounty', es: '+55 XP de recompensa' },
    unlocks: { en: "Unlocks 'Shape Shifter'", es: "Desbloquea 'Cambiaformas'" },
  },
  {
    id: '1.5',
    align: 'left',
    icon: 'campaign',
    xp: 45,
    stars: 0,
    minutes: 6,
    title: { en: 'Culture & Chants', es: 'Cultura y cánticos' },
    desc: {
      en: 'Why a stand sings, what a tifo is for, and how a chant travels from one terrace to a whole country.',
      es: 'Por qué canta una grada, para qué sirve un tifo y cómo un cántico viaja de un fondo a todo un país.',
    },
    bounty: { en: '+45 XP Drill Bounty', es: '+45 XP de recompensa' },
    unlocks: { en: "Unlocks 'Terrace Voice'", es: "Desbloquea 'Voz de la grada'" },
  },
  {
    id: '1.6',
    align: 'center',
    icon: 'videocam',
    xp: 60,
    stars: 0,
    minutes: 9,
    title: { en: 'VAR & Referee', es: 'VAR y arbitraje' },
    desc: {
      en: 'What the referee can review, what "clear and obvious" actually means, and why the offside lines take so long to draw.',
      es: 'Qué puede revisar el árbitro, qué significa de verdad "error claro y manifiesto" y por qué tardan tanto en trazar las líneas del fuera de juego.',
    },
    bounty: { en: '+60 XP Drill Bounty', es: '+60 XP de recompensa' },
    unlocks: { en: "Unlocks 'Laws Scholar'", es: "Desbloquea 'Erudito del reglamento'" },
  },
]

/**
 * Node state for the path: everything before the active lesson is
 * done, the active one is highlighted, the very next one is open,
 * and the rest stay locked.
 *
 * `list` is the ordered path the state is judged against. It defaults to the
 * bundled nodes above, but the path is served by /api/path-lessons at runtime,
 * so pages pass the list they actually rendered.
 */
export function lessonState(lesson, completedIds, activeId, list = LESSONS) {
  if (completedIds.includes(lesson.id)) return 'completed'
  if (lesson.id === activeId) return 'active'
  const activeIdx = list.findIndex((l) => l.id === activeId)
  const idx = list.findIndex((l) => l.id === lesson.id)
  return idx === activeIdx + 1 ? 'unlocked' : 'locked'
}
