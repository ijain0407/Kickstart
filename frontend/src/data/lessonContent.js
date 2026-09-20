/* ============================================================
   LESSON CONTENT
   The teaching body behind each node on the path. Every lesson
   runs three steps and closes with one comprehension check.

   `visual` names an arrangement the lesson player knows how to
   draw on a PitchBoard; null renders text only.
   Visuals: 'basics' | 'offside' | 'block' | 'formation' | 'var'
   ============================================================ */

import { UNIT_LESSONS } from './units.js'

export const LESSON_CONTENT = {
  '1.1': {
    steps: [
      {
        visual: 'basics',
        title: { en: 'The shape of the ground', es: 'La forma del campo' },
        body: {
          en: 'A pitch is a rectangle between 100 and 110 metres long. The halfway line splits it, the centre circle marks the ten metres opponents must stand back at kickoff, and the two boxes at each end are where the goalkeeper may use their hands and where fouls become penalties.',
          es: 'El campo es un rectángulo de entre 100 y 110 metros de largo. La línea de medio campo lo divide, el círculo central marca los diez metros que el rival debe respetar en el saque inicial, y las dos áreas de cada extremo son donde el portero puede usar las manos y donde una falta se convierte en penalti.',
        },
      },
      {
        visual: null,
        title: { en: 'Eleven shirts, three jobs', es: 'Once camisetas, tres trabajos' },
        body: {
          en: 'Every team puts eleven players out: one goalkeeper and ten outfielders split between defence, midfield and attack. The numbers are a shorthand — 1 is always the keeper, 2 to 5 are usually the back line, 6 to 8 the middle, 9 to 11 the front. Nothing forces this, but commentary assumes it.',
          es: 'Cada equipo saca a once jugadores: un portero y diez de campo repartidos entre defensa, mediocampo y ataque. Los números son un código: el 1 siempre es el portero, del 2 al 5 suele ser la línea defensiva, del 6 al 8 el centro y del 9 al 11 la delantera. Nada lo obliga, pero los comentaristas lo dan por hecho.',
        },
      },
      {
        visual: null,
        title: { en: 'Ninety minutes, two halves', es: 'Noventa minutos, dos tiempos' },
        body: {
          en: 'Two halves of forty-five minutes, with added time at the end of each for stoppages. The clock never stops and never counts down — it runs up past 45 and past 90, which is why a goal in the 96th minute is possible at all.',
          es: 'Dos tiempos de cuarenta y cinco minutos, con descuento al final de cada uno por las interrupciones. El reloj nunca se para ni cuenta hacia atrás: sigue más allá del 45 y del 90, y por eso es posible un gol en el minuto 96.',
        },
      },
    ],
    check: {
      question: {
        en: 'What does the centre circle actually mark?',
        es: '¿Qué marca en realidad el círculo central?',
      },
      options: [
        {
          id: 'a',
          label: { en: 'Where the goalkeeper may use their hands', es: 'Dónde el portero puede usar las manos' },
          correct: false,
        },
        {
          id: 'b',
          label: {
            en: 'The distance opponents must stand back at kickoff',
            es: 'La distancia que el rival debe respetar en el saque inicial',
          },
          correct: true,
        },
        {
          id: 'c',
          label: { en: 'The line that decides offside', es: 'La línea que decide el fuera de juego' },
          correct: false,
        },
      ],
      explain: {
        en: 'It is a ten-metre exclusion zone at kickoff — nothing more. The keeper\'s hands are limited by the penalty area, and offside has no fixed line at all.',
        es: 'Es una zona de exclusión de diez metros en el saque inicial, nada más. Las manos del portero las limita el área, y el fuera de juego no tiene ninguna línea fija.',
      },
    },
  },

  '1.2': {
    steps: [
      {
        visual: 'offside',
        title: { en: 'The second-to-last defender', es: 'El penúltimo defensa' },
        body: {
          en: 'An attacker is offside if they are nearer the opponents\' goal line than both the ball and the second-to-last defender at the moment a team-mate plays the ball. The goalkeeper is usually the last defender, so in practice you are watching the last outfield player.',
          es: 'Un atacante está en fuera de juego si se encuentra más cerca de la línea de gol rival que el balón y que el penúltimo defensa en el momento en que un compañero toca el balón. El portero suele ser el último defensa, así que en la práctica miras al último jugador de campo.',
        },
      },
      {
        visual: null,
        title: { en: 'The moment matters, not the finish', es: 'Importa el momento, no la definición' },
        body: {
          en: 'Position is judged when the pass is played, not when it is received. An attacker can start level, sprint past the defence and collect the ball twenty metres clear — that is onside. This is the single thing new fans get wrong most often.',
          es: 'La posición se juzga cuando se da el pase, no cuando se recibe. Un atacante puede salir a la misma altura, superar a la defensa a la carrera y recoger el balón veinte metros por delante: eso es legal. Es lo que más confunde a quien empieza a seguir el fútbol.',
        },
      },
      {
        visual: null,
        title: { en: 'Three ways it does not apply', es: 'Tres casos en los que no se aplica' },
        body: {
          en: 'You cannot be offside in your own half, from a throw-in, corner or goal kick, or when the ball is passed backwards to you. Being in an offside position is not itself an offence either — the player must interfere with play, interfere with an opponent, or gain an advantage.',
          es: 'No hay fuera de juego en tu propio campo, ni en un saque de banda, de esquina o de puerta, ni cuando el balón te llega en un pase hacia atrás. Estar en posición de fuera de juego tampoco es una infracción en sí: el jugador debe intervenir en el juego, interferir a un rival u obtener ventaja.',
        },
      },
    ],
    check: {
      question: {
        en: 'A striker starts level with the last defender, sprints clear, and receives the pass ten metres beyond them. What is the call?',
        es: 'Un delantero sale a la altura del último defensa, se va a la carrera y recibe el pase diez metros por delante. ¿Qué decide el árbitro?',
      },
      options: [
        { id: 'a', label: { en: 'Offside', es: 'Fuera de juego' }, correct: false },
        { id: 'b', label: { en: 'Play on — perfectly onside', es: 'Sigue el juego: está habilitado' }, correct: true },
        {
          id: 'c',
          label: { en: 'Offside only if they score', es: 'Fuera de juego solo si marca' },
          correct: false,
        },
      ],
      explain: {
        en: 'Position is frozen at the instant the pass is played, and at that instant they were level. Everything after is just running.',
        es: 'La posición se congela en el instante del pase, y en ese instante estaba a la misma altura. Lo de después es solo correr.',
      },
    },
  },

  '1.3': {
    steps: [
      {
        visual: 'block',
        title: { en: 'The back four hold a line', es: 'La línea de cuatro se sostiene' },
        body: {
          en: 'Defenders move as one unit, stepping up and dropping together. Holding a straight line is what makes the offside trap work — one defender lagging behind plays the whole attack onside.',
          es: 'Los defensas se mueven como una sola unidad, subiendo y bajando a la vez. Mantener la línea recta es lo que hace funcionar la trampa del fuera de juego: un defensa rezagado habilita a todo el ataque.',
        },
      },
      {
        visual: null,
        title: { en: 'The screen in front', es: 'El filtro por delante' },
        body: {
          en: 'The defensive midfielder — the number 6 — sits in the gap between the back line and the rest of midfield. Their job is unglamorous: block the passing lane into the opposition striker, and cover whichever full back has run forward.',
          es: 'El mediocentro defensivo, el 6, se coloca en el hueco entre la defensa y el resto del mediocampo. Su trabajo es poco vistoso: tapar la línea de pase al delantero rival y cubrir al lateral que se haya incorporado.',
        },
      },
      {
        visual: null,
        title: { en: 'High block, mid block, low block', es: 'Bloque alto, medio y bajo' },
        body: {
          en: 'A block is simply where the team chooses to start defending. High means pressing near the opponents\' box and risking space behind. Low means dropping to your own third, conceding the ball and daring them to break you down. Mid is the compromise most teams live in.',
          es: 'El bloque es sencillamente dónde decide el equipo empezar a defender. Alto significa presionar cerca del área rival y arriesgar el espacio a la espalda. Bajo significa replegarse a tu propio tercio, ceder el balón y retar al rival a romperte. El medio es el término medio en el que vive casi todo el mundo.',
        },
      },
    ],
    check: {
      question: {
        en: 'Why does one defender dropping deeper than the rest break the offside trap?',
        es: '¿Por qué un defensa más retrasado que el resto rompe la trampa del fuera de juego?',
      },
      options: [
        {
          id: 'a',
          label: { en: 'They become the second-to-last defender, playing attackers onside', es: 'Pasa a ser el penúltimo defensa y habilita a los atacantes' },
          correct: true,
        },
        { id: 'b', label: { en: 'The referee cannot see the line', es: 'El árbitro no puede ver la línea' }, correct: false },
        { id: 'c', label: { en: 'It is a foul', es: 'Es falta' }, correct: false },
      ],
      explain: {
        en: 'Offside is measured against the second-to-last defender. A straggler resets that reference point deeper, and every attacker ahead of the line is suddenly legal.',
        es: 'El fuera de juego se mide respecto al penúltimo defensa. Un rezagado desplaza esa referencia hacia atrás, y todos los atacantes por delante quedan habilitados de golpe.',
      },
    },
  },

  '1.4': {
    steps: [
      {
        visual: 'formation',
        title: { en: 'A formation is a starting point', es: 'La formación es un punto de partida' },
        body: {
          en: 'Numbers like 4-3-3 read from defence forward: four defenders, three midfielders, three forwards. It describes where players begin, not where they stay. Within ten seconds of kickoff the shape has already changed.',
          es: 'Los números como 4-3-3 se leen de atrás hacia adelante: cuatro defensas, tres centrocampistas, tres delanteros. Describe dónde empiezan los jugadores, no dónde se quedan. A los diez segundos del saque inicial el dibujo ya ha cambiado.',
        },
      },
      {
        visual: null,
        title: { en: 'Every shape trades something', es: 'Cada dibujo cambia una cosa por otra' },
        body: {
          en: '4-3-3 gives you width and pressing bodies high up, but leaves the midfield three outnumbered against a four. 4-4-2 is compact and hard to play through, but cedes the middle. 3-5-2 floods midfield and asks two wing backs to cover the entire touchline on their own.',
          es: 'El 4-3-3 te da amplitud y gente para presionar arriba, pero deja a tres centrocampistas en inferioridad ante cuatro. El 4-4-2 es compacto y difícil de atravesar, pero cede el centro. El 3-5-2 llena el mediocampo y exige a dos carrileros cubrir toda la banda ellos solos.',
        },
      },
      {
        visual: null,
        title: { en: 'Why coaches switch at half time', es: 'Por qué los entrenadores cambian en el descanso' },
        body: {
          en: 'A change of shape is usually a change of where the spare player is. Moving from 4-3-3 to 4-4-2 sacrifices a midfielder to add a second striker — you are choosing to lose the middle in exchange for a direct threat. Watch which area suddenly has an extra body.',
          es: 'Un cambio de dibujo suele ser un cambio de dónde está el jugador libre. Pasar de 4-3-3 a 4-4-2 sacrifica a un centrocampista para sumar un segundo punta: eliges perder el centro a cambio de una amenaza directa. Fíjate en qué zona aparece de pronto un jugador de más.',
        },
      },
    ],
    check: {
      question: {
        en: 'A team switches from 4-3-3 to 4-4-2. What have they given up?',
        es: 'Un equipo pasa de 4-3-3 a 4-4-2. ¿Qué ha cedido?',
      },
      options: [
        { id: 'a', label: { en: 'A defender', es: 'Un defensa' }, correct: false },
        {
          id: 'b',
          label: { en: 'A central midfielder, and control of the middle', es: 'Un centrocampista, y el control del centro' },
          correct: true,
        },
        { id: 'c', label: { en: 'Nothing — it is the same eleven', es: 'Nada: son los mismos once' }, correct: false },
      ],
      explain: {
        en: 'The back four is untouched. The third central midfielder becomes a second striker, so the team is now outnumbered in the area where possession is decided.',
        es: 'La línea de cuatro no se toca. El tercer centrocampista pasa a ser segundo delantero, así que el equipo queda en inferioridad en la zona donde se decide la posesión.',
      },
    },
  },

  '1.5': {
    steps: [
      {
        visual: null,
        title: { en: 'A stand is an instrument', es: 'Una grada es un instrumento' },
        body: {
          en: 'Most grounds have one end where the loudest supporters gather — the Kop at Anfield, the Curva at an Italian ground, the Südtribüne in Dortmund. Songs start there and spread outward. That end is usually behind a goal, standing or densely packed, and cheaper than the rest of the stadium.',
          es: 'Casi todos los estadios tienen un fondo donde se juntan los más ruidosos: el Kop en Anfield, la Curva en Italia, el Südtribüne en Dortmund. Los cánticos nacen ahí y se extienden. Ese fondo suele estar detrás de una portería, de pie o muy apretado, y es más barato que el resto del estadio.',
        },
      },
      {
        visual: null,
        title: { en: 'Where the tunes come from', es: 'De dónde salen las melodías' },
        body: {
          en: 'Almost no chant has an original melody. Terraces borrow from hymns, folk songs, pop hits and musicals, then rewrite the words. That is why the same tune turns up in four countries with four different meanings — the melody travels, the words stay local.',
          es: 'Casi ningún cántico tiene melodía propia. Las gradas toman prestado de himnos, canciones populares, éxitos pop y musicales, y luego reescriben la letra. Por eso la misma melodía aparece en cuatro países con cuatro significados distintos: la música viaja, la letra se queda.',
        },
      },
      {
        visual: null,
        title: { en: 'What a tifo is for', es: 'Para qué sirve un tifo' },
        body: {
          en: 'A tifo is a coordinated display — cards, banners, flags — covering a whole stand at a set moment. It takes weeks of secret work and lasts about ninety seconds. The point is not the picture. It is the proof that thousands of strangers organised themselves for no reward.',
          es: 'Un tifo es un mosaico coordinado —cartulinas, pancartas, banderas— que cubre toda una grada en un momento exacto. Cuesta semanas de trabajo en secreto y dura unos noventa segundos. Lo importante no es la imagen: es la prueba de que miles de desconocidos se organizaron sin recibir nada a cambio.',
        },
      },
    ],
    check: {
      question: {
        en: 'Why do the same melodies appear in stadiums across different countries?',
        es: '¿Por qué aparecen las mismas melodías en estadios de países distintos?',
      },
      options: [
        {
          id: 'a',
          label: { en: 'Clubs license them from each other', es: 'Los clubes se las licencian entre ellos' },
          correct: false,
        },
        {
          id: 'b',
          label: {
            en: 'Terraces borrow existing tunes and rewrite the words locally',
            es: 'Las gradas toman melodías existentes y reescriben la letra en local',
          },
          correct: true,
        },
        { id: 'c', label: { en: 'Leagues supply official songs', es: 'Las ligas reparten canciones oficiales' }, correct: false },
      ],
      explain: {
        en: 'The melody is common property — hymns, folk songs, pop. What makes a chant belong to one club is the words its own supporters put on top.',
        es: 'La melodía es patrimonio común: himnos, canciones populares, pop. Lo que hace que un cántico sea de un club es la letra que le pone su propia afición.',
      },
    },
  },

  '1.6': {
    steps: [
      {
        visual: 'var',
        title: { en: 'Four situations only', es: 'Solo cuatro situaciones' },
        body: {
          en: 'VAR may review exactly four things: goals, penalty decisions, direct red cards, and mistaken identity. It cannot review a corner, a yellow card, or a foul in midfield. If the incident is not in those four categories, the referee\'s call stands however wrong it looks.',
          es: 'El VAR puede revisar exactamente cuatro cosas: goles, penaltis, rojas directas y confusión de identidad. No puede revisar un córner, una amarilla ni una falta en el mediocampo. Si la jugada no entra en esas cuatro categorías, la decisión del árbitro se mantiene por mal que se vea.',
        },
      },
      {
        visual: null,
        title: { en: '"Clear and obvious"', es: '"Error claro y manifiesto"' },
        body: {
          en: 'VAR is not there to referee the match again. It intervenes only on a clear and obvious error — something the video official is certain about in a few seconds. A decision that is merely arguable is meant to be left alone, which is why two similar incidents can end differently.',
          es: 'El VAR no está para volver a arbitrar el partido. Solo interviene ante un error claro y manifiesto: algo de lo que el videoarbitraje está seguro en pocos segundos. Una decisión simplemente discutible debe dejarse como está, y por eso dos jugadas parecidas pueden acabar distinto.',
        },
      },
      {
        visual: null,
        title: { en: 'Why the lines take so long', es: 'Por qué tardan tanto las líneas' },
        body: {
          en: 'An offside check needs two things fixed by hand: the exact frame the ball was touched, and which body part of each player to measure from. Only then is the line drawn. The delay is almost entirely those two human decisions, not the drawing.',
          es: 'Una revisión de fuera de juego necesita fijar a mano dos cosas: el fotograma exacto en que se tocó el balón y qué parte del cuerpo de cada jugador se mide. Solo entonces se traza la línea. La demora está casi toda en esas dos decisiones humanas, no en el trazado.',
        },
      },
    ],
    check: {
      question: {
        en: 'A referee gives a yellow card you think should have been red. Can VAR step in?',
        es: 'El árbitro saca una amarilla que tú crees que debía ser roja. ¿Puede intervenir el VAR?',
      },
      options: [
        {
          id: 'a',
          label: { en: 'Yes — a direct red card is reviewable', es: 'Sí: la roja directa es revisable' },
          correct: true,
        },
        { id: 'b', label: { en: 'No — cards are never reviewed', es: 'No: las tarjetas nunca se revisan' }, correct: false },
        {
          id: 'c',
          label: { en: 'Only if the referee asks the captain', es: 'Solo si el árbitro consulta al capitán' },
          correct: false,
        },
      ],
      explain: {
        en: 'Direct red cards are one of the four reviewable categories, so a missed sending-off can be corrected. A second yellow cannot — that is outside VAR\'s remit.',
        es: 'La roja directa es una de las cuatro categorías revisables, así que una expulsión no señalada puede corregirse. Una segunda amarilla no: queda fuera del alcance del VAR.',
      },
    },
  },
}

export function getLessonContent(id) {
  const unitLesson = UNIT_LESSONS.find((l) => l.id === id)
  if (unitLesson) return { steps: unitLesson.steps, check: unitLesson.check }
  return LESSON_CONTENT[id] ?? LESSON_CONTENT['1.1']
}
