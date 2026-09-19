/* ============================================================
   TACTICAL MATCHER
   Five steps. Every option carries a weight per competition;
   weights are added to the baseline below as answers come in, so
   the "Live Compatibility" strip moves on every tap.

   The question heading always renders in the active language and
   the subtitle renders the other one — that is Bilingual Coach
   Mode, so a learner sees both phrasings of the same question.
   ============================================================ */

/** Opening scores, matching the state the design screens show. */
export const BASE_SCORES = {
  premier: 88,
  laliga: 74,
  seriea: 71,
  bundesliga: 68,
  ucl: 66,
  mls: 62,
}

export const QUIZ_STEPS = [
  {
    id: 'pace',
    section: { en: 'Pace & Tone', es: 'Ritmo y tono' },
    multi: true,
    title: {
      en: 'What draws you into a match?',
      es: '¿Qué te atrapa de un partido?',
    },
    options: [
      {
        id: 'pace-high',
        title: { en: 'High-Octane Pace & Drama', es: 'Ritmo altísimo y drama' },
        tag: { en: 'Electric', es: 'Eléctrico' },
        tagIcon: 'bolt',
        tagTone: 'gold',
        desc: {
          en: 'End-to-end lightning counters, screaming managers, and desperate 96th-minute stoppage-time winners.',
          es: 'Contras a toda velocidad de área a área, entrenadores gritando y goles desesperados en el minuto 96.',
        },
        metas: [
          { icon: 'speed', label: { en: 'High tempo', es: 'Ritmo alto' } },
          { icon: 'directions_run', label: { en: 'Box-to-box grit', es: 'Garra de área a área' } },
        ],
        weights: { premier: 6, ucl: 3, mls: 3, bundesliga: 2, seriea: -2, laliga: -1 },
      },
      {
        id: 'pace-chess',
        title: { en: 'Chess-Match Tactics', es: 'Táctica de ajedrez' },
        tag: { en: 'Spatial', es: 'Espacial' },
        tagIcon: 'psychology',
        tagTone: 'lavender',
        desc: {
          en: 'Geometric passing triangles, suffocating mid-blocks, false nines, and technical maestro playmakers.',
          es: 'Triángulos de pase geométricos, bloques medios asfixiantes, falsos nueves y maestros técnicos que llevan el juego.',
        },
        metas: [
          { icon: 'hub', label: { en: 'Positional IQ', es: 'Inteligencia posicional' } },
          { icon: 'auto_awesome', label: { en: 'Tiki-Taka flows', es: 'Circulación tiki-taka' } },
        ],
        weights: { laliga: 6, seriea: 4, ucl: 3, bundesliga: 1, premier: -1, mls: -3 },
      },
      {
        id: 'pace-grit',
        title: { en: 'Physicality & Pure Grit', es: 'Físico y pura garra' },
        tag: { en: 'Heavy Metal', es: 'Heavy metal' },
        tagIcon: 'bolt',
        tagTone: 'red',
        desc: {
          en: 'Bone-rattling sliding tackles in freezing rain, bruising target forwards, and defensive backlines that refuse to yield.',
          es: 'Entradas que retumban bajo la lluvia helada, delanteros de referencia que golpean y defensas que no ceden un palmo.',
        },
        metas: [
          { icon: 'sprint', label: { en: 'Relentless pressing', es: 'Presión sin tregua' } },
          { icon: 'landscape', label: { en: 'Mud & pride', es: 'Barro y orgullo' } },
        ],
        weights: { premier: 6, bundesliga: 4, seriea: 2, mls: 1, laliga: -3, ucl: -1 },
      },
      {
        id: 'pace-underdog',
        title: { en: 'Underdog Fairytales', es: 'Cuentos de cenicienta' },
        tag: { en: 'Romance', es: 'Romance' },
        tagIcon: 'favorite',
        tagTone: 'green',
        desc: {
          en: 'Modest community clubs humbling European royal dynasties, local academy heroes, and wild cup upsets.',
          es: 'Clubes modestos de barrio humillando a las dinastías reales de Europa, héroes de la cantera y sorpresas salvajes de copa.',
        },
        metas: [
          { icon: 'emoji_events', label: { en: 'Cinderella runs', es: 'Rachas de cenicienta' } },
          { icon: 'volunteer_activism', label: { en: 'Raw heart', es: 'Corazón puro' } },
        ],
        weights: { bundesliga: 5, seriea: 3, mls: 3, premier: 2, laliga: -1, ucl: -2 },
      },
      {
        id: 'pace-derby',
        title: { en: 'Fierce Derby Rivalries', es: 'Derbis feroces' },
        tag: { en: 'Hostile', es: 'Hostil' },
        tagIcon: 'local_fire_department',
        tagTone: 'peach',
        desc: {
          en: 'Century-old neighbourhood blood feuds, pyrotechnic displays, booming choreo tifos, and legendary bragging rights.',
          es: 'Rencillas de barrio con un siglo de historia, bengalas, tifos coreografiados atronadores y el derecho legendario a presumir.',
        },
        metas: [
          { icon: 'whatshot', label: { en: 'High stakes', es: 'Mucho en juego' } },
          { icon: 'campaign', label: { en: 'Terrace anthems', es: 'Himnos de grada' } },
        ],
        weights: { seriea: 6, laliga: 4, bundesliga: 3, premier: 2, ucl: 1, mls: -2 },
      },
    ],
  },

  {
    id: 'tactics',
    section: { en: 'Tactics', es: 'Táctica' },
    multi: true,
    title: {
      en: 'Which shape would you want your team to play?',
      es: '¿Con qué dibujo te gustaría que jugara tu equipo?',
    },
    options: [
      {
        id: 'tac-press',
        title: { en: 'Suffocating High Press', es: 'Presión alta asfixiante' },
        tag: { en: 'Gegenpress', es: 'Gegenpress' },
        tagIcon: 'sprint',
        tagTone: 'red',
        desc: {
          en: 'Win it back within six seconds of losing it, twenty-five yards from the opposition goal.',
          es: 'Recuperar el balón en los seis segundos siguientes a perderlo, a veinticinco metros de la portería rival.',
        },
        metas: [
          { icon: 'timer', label: { en: '6-second rule', es: 'Regla de 6 segundos' } },
          { icon: 'groups', label: { en: 'Whole-team trigger', es: 'Señal para todo el equipo' } },
        ],
        weights: { bundesliga: 6, premier: 5, ucl: 2, mls: 1, laliga: -1, seriea: -2 },
      },
      {
        id: 'tac-possession',
        title: { en: 'Patient Possession', es: 'Posesión paciente' },
        tag: { en: 'Control', es: 'Control' },
        tagIcon: 'hub',
        tagTone: 'lavender',
        desc: {
          en: 'Seventy per cent of the ball, thirty passes before the one that matters, and a defence pulled slowly out of shape.',
          es: 'Setenta por ciento de posesión, treinta pases antes del que importa y una defensa que se va desordenando poco a poco.',
        },
        metas: [
          { icon: 'share', label: { en: 'Passing triangles', es: 'Triángulos de pase' } },
          { icon: 'schedule', label: { en: 'Slow build', es: 'Construcción lenta' } },
        ],
        weights: { laliga: 6, ucl: 3, seriea: 2, bundesliga: 1, premier: -1, mls: -2 },
      },
      {
        id: 'tac-catenaccio',
        title: { en: 'Low Block & Counter', es: 'Bloque bajo y contra' },
        tag: { en: 'Catenaccio', es: 'Catenaccio' },
        tagIcon: 'shield',
        tagTone: 'blue',
        desc: {
          en: 'Two banks of four, nothing conceded for eighty minutes, then three passes and it is finished.',
          es: 'Dos líneas de cuatro, ochenta minutos sin conceder nada y luego tres pases y está resuelto.',
        },
        metas: [
          { icon: 'lock', label: { en: 'Defensive discipline', es: 'Disciplina defensiva' } },
          { icon: 'bolt', label: { en: 'Lethal transitions', es: 'Transiciones letales' } },
        ],
        weights: { seriea: 7, ucl: 2, laliga: 1, premier: 0, bundesliga: -2, mls: -2 },
      },
      {
        id: 'tac-wide',
        title: { en: 'Wingers & Crosses', es: 'Extremos y centros' },
        tag: { en: 'Direct', es: 'Directo' },
        tagIcon: 'open_in_full',
        tagTone: 'green',
        desc: {
          en: 'Get to the byline, hang it up at the far post, and let the big centre forward do the rest.',
          es: 'Llegar a la línea de fondo, colgarla al segundo palo y dejar que el nueve grande haga el resto.',
        },
        metas: [
          { icon: 'swap_horiz', label: { en: 'Touchline width', es: 'Amplitud de banda' } },
          { icon: 'sports_soccer', label: { en: 'Aerial duels', es: 'Duelos aéreos' } },
        ],
        weights: { premier: 5, mls: 3, bundesliga: 2, seriea: 1, laliga: -1, ucl: 0 },
      },
    ],
  },

  {
    id: 'atmosphere',
    section: { en: 'Atmosphere', es: 'Ambiente' },
    multi: true,
    title: {
      en: 'What should the ground sound and feel like?',
      es: '¿Cómo quieres que suene y se sienta el estadio?',
    },
    options: [
      {
        id: 'atm-wall',
        title: { en: 'A Standing Wall of Noise', es: 'Un muro de ruido de pie' },
        tag: { en: 'Terraces', es: 'Fondo' },
        tagIcon: 'groups',
        tagTone: 'gold',
        desc: {
          en: 'Twenty-five thousand people standing behind one goal, none of them sitting down all afternoon.',
          es: 'Veinticinco mil personas de pie detrás de una portería, sin sentarse en toda la tarde.',
        },
        metas: [
          { icon: 'volume_up', label: { en: 'Non-stop singing', es: 'Cánticos sin parar' } },
          { icon: 'payments', label: { en: 'Cheap tickets', es: 'Entradas baratas' } },
        ],
        weights: { bundesliga: 7, seriea: 3, premier: 1, ucl: 1, laliga: 0, mls: 2 },
      },
      {
        id: 'atm-tifo',
        title: { en: 'Choreographed Tifos & Pyro', es: 'Tifos coreografiados y pirotecnia' },
        tag: { en: 'Spectacle', es: 'Espectáculo' },
        tagIcon: 'local_fire_department',
        tagTone: 'red',
        desc: {
          en: 'A whole stand becomes one painted banner, planned in secret for a month.',
          es: 'Una grada entera se convierte en una sola pancarta pintada, preparada en secreto durante un mes.',
        },
        metas: [
          { icon: 'palette', label: { en: 'Curva craft', es: 'Arte de curva' } },
          { icon: 'visibility', label: { en: 'Made for the camera', es: 'Hecho para la cámara' } },
        ],
        weights: { seriea: 6, bundesliga: 3, ucl: 3, laliga: 2, premier: 0, mls: 1 },
      },
      {
        id: 'atm-history',
        title: { en: 'Old Ground, Deep History', es: 'Campo viejo, historia honda' },
        tag: { en: 'Heritage', es: 'Herencia' },
        tagIcon: 'account_balance',
        tagTone: 'lavender',
        desc: {
          en: 'A stadium wedged into terraced streets, where the same families have sat in the same seats for four generations.',
          es: 'Un estadio encajado entre casas adosadas, donde las mismas familias ocupan los mismos asientos desde hace cuatro generaciones.',
        },
        metas: [
          { icon: 'history', label: { en: 'Century-old clubs', es: 'Clubes centenarios' } },
          { icon: 'home', label: { en: 'Neighbourhood ties', es: 'Raíces de barrio' } },
        ],
        weights: { premier: 5, laliga: 4, seriea: 3, bundesliga: 2, ucl: 1, mls: -4 },
      },
      {
        id: 'atm-new',
        title: { en: 'New Stadium, New Crowd', es: 'Estadio nuevo, grada nueva' },
        tag: { en: 'Modern', es: 'Moderno' },
        tagIcon: 'stadium',
        tagTone: 'blue',
        desc: {
          en: 'Supporter groups building their own traditions from scratch, in cities that only recently got a team.',
          es: 'Grupos de aficionados que crean sus propias tradiciones desde cero, en ciudades que acaban de estrenar equipo.',
        },
        metas: [
          { icon: 'auto_awesome', label: { en: 'Year-one rituals', es: 'Rituales del primer año' } },
          { icon: 'diversity_3', label: { en: 'Open to newcomers', es: 'Abierto a los nuevos' } },
        ],
        weights: { mls: 8, ucl: 0, premier: 0, bundesliga: 1, laliga: 0, seriea: -2 },
      },
    ],
  },

  {
    id: 'stars',
    section: { en: 'Star Power', es: 'Estrellas' },
    multi: false,
    title: {
      en: 'How much do the famous names matter to you?',
      es: '¿Cuánto te importan los nombres famosos?',
    },
    options: [
      {
        id: 'star-galactico',
        title: { en: 'Give Me the Galácticos', es: 'Dame a los galácticos' },
        tag: { en: 'Superstars', es: 'Superestrellas' },
        tagIcon: 'star',
        tagTone: 'gold',
        desc: {
          en: 'The best players alive, in the same eleven, expected to win every single week.',
          es: 'Los mejores jugadores vivos, en el mismo once, obligados a ganar todas las semanas.',
        },
        metas: [
          { icon: 'emoji_events', label: { en: 'Trophy pressure', es: 'Presión por títulos' } },
          { icon: 'public', label: { en: 'Global names', es: 'Nombres globales' } },
        ],
        weights: { laliga: 6, ucl: 6, premier: 3, seriea: 0, bundesliga: -1, mls: -2 },
      },
      {
        id: 'star-academy',
        title: { en: 'Kids From the Academy', es: 'Chavales de la cantera' },
        tag: { en: 'Homegrown', es: 'De casa' },
        tagIcon: 'school',
        tagTone: 'green',
        desc: {
          en: 'An eighteen-year-old from four miles away making his debut, with his old school watching.',
          es: 'Un chico de dieciocho años que vive a seis kilómetros debutando, con su antiguo colegio mirando.',
        },
        metas: [
          { icon: 'trending_up', label: { en: 'Development first', es: 'Primero la formación' } },
          { icon: 'favorite', label: { en: 'Local blood', es: 'Sangre local' } },
        ],
        weights: { bundesliga: 6, laliga: 3, premier: 2, seriea: 1, mls: 2, ucl: -2 },
      },
      {
        id: 'star-veterans',
        title: { en: 'Legends in Their Last Chapter', es: 'Leyendas en su último capítulo' },
        tag: { en: 'Icons', es: 'Iconos' },
        tagIcon: 'military_tech',
        tagTone: 'peach',
        desc: {
          en: 'Players who already won everything, choosing somewhere new to finish the story.',
          es: 'Jugadores que ya lo ganaron todo y eligen un sitio nuevo para terminar la historia.',
        },
        metas: [
          { icon: 'auto_stories', label: { en: 'Late-career arcs', es: 'Finales de carrera' } },
          { icon: 'flight_takeoff', label: { en: 'Surprise transfers', es: 'Fichajes sorpresa' } },
        ],
        weights: { mls: 7, seriea: 3, ucl: 1, premier: 0, laliga: 0, bundesliga: -1 },
      },
      {
        id: 'star-collective',
        title: { en: 'No Stars, Just the System', es: 'Sin estrellas, solo el sistema' },
        tag: { en: 'Collective', es: 'Colectivo' },
        tagIcon: 'hub',
        tagTone: 'lavender',
        desc: {
          en: 'Eleven players nobody outside the country can name, beating teams worth ten times as much.',
          es: 'Once jugadores que nadie fuera del país sabe nombrar, ganando a equipos que valen diez veces más.',
        },
        metas: [
          { icon: 'insights', label: { en: 'Coach-led', es: 'Dirigido por el míster' } },
          { icon: 'shield', label: { en: 'System over ego', es: 'Sistema sobre ego' } },
        ],
        weights: { seriea: 5, bundesliga: 4, laliga: 1, premier: 1, ucl: 0, mls: 0 },
      },
    ],
  },

  {
    id: 'loyalty',
    section: { en: 'Club Loyalty', es: 'Lealtad al club' },
    multi: false,
    title: {
      en: 'What kind of club would you want to be yours?',
      es: '¿Qué tipo de club te gustaría que fuera el tuyo?',
    },
    options: [
      {
        id: 'loy-giant',
        title: { en: 'A Global Giant', es: 'Un gigante global' },
        tag: { en: 'Dynasty', es: 'Dinastía' },
        tagIcon: 'public',
        tagTone: 'gold',
        desc: {
          en: 'Supporters on every continent, a trophy cabinet that needs its own room, and a fixture list that never stops.',
          es: 'Aficionados en todos los continentes, una sala entera para las vitrinas y un calendario que no para nunca.',
        },
        metas: [
          { icon: 'emoji_events', label: { en: 'Wins expected', es: 'Ganar es obligatorio' } },
          { icon: 'travel_explore', label: { en: 'Worldwide fanbase', es: 'Afición mundial' } },
        ],
        weights: { ucl: 6, laliga: 4, premier: 4, seriea: 1, bundesliga: 0, mls: -2 },
      },
      {
        id: 'loy-member',
        title: { en: 'Owned by Its Members', es: 'Propiedad de sus socios' },
        tag: { en: '50+1', es: '50+1' },
        tagIcon: 'groups',
        tagTone: 'green',
        desc: {
          en: 'Fans hold the controlling vote, ticket prices stay low, and the board answers to the stands.',
          es: 'Los aficionados tienen el voto de control, las entradas siguen siendo baratas y la directiva responde ante la grada.',
        },
        metas: [
          { icon: 'how_to_vote', label: { en: 'Fan ownership', es: 'Propiedad de la afición' } },
          { icon: 'savings', label: { en: 'Affordable football', es: 'Fútbol asequible' } },
        ],
        weights: { bundesliga: 8, laliga: 2, seriea: 1, premier: -1, ucl: -1, mls: 0 },
      },
      {
        id: 'loy-city',
        title: { en: 'The Club of One City', es: 'El club de una sola ciudad' },
        tag: { en: 'Rooted', es: 'Arraigado' },
        tagIcon: 'location_city',
        tagTone: 'lavender',
        desc: {
          en: 'The team is the city and the city is the team — one identity, one flag, one accent.',
          es: 'El equipo es la ciudad y la ciudad es el equipo: una identidad, una bandera, un acento.',
        },
        metas: [
          { icon: 'flag', label: { en: 'Regional identity', es: 'Identidad regional' } },
          { icon: 'record_voice_over', label: { en: 'Local dialect songs', es: 'Cánticos en dialecto' } },
        ],
        weights: { seriea: 5, laliga: 5, bundesliga: 2, premier: 1, mls: 1, ucl: -2 },
      },
      {
        id: 'loy-new',
        title: { en: 'Something Being Built Now', es: 'Algo que se construye ahora' },
        tag: { en: 'Expansion', es: 'Expansión' },
        tagIcon: 'rocket_launch',
        tagTone: 'blue',
        desc: {
          en: 'A club young enough that the supporters writing its songs are the first ones to sing them.',
          es: 'Un club tan joven que los aficionados que escriben sus canciones son los primeros en cantarlas.',
        },
        metas: [
          { icon: 'construction', label: { en: 'Founding era', es: 'Época fundacional' } },
          { icon: 'group_add', label: { en: 'Room to join in', es: 'Sitio para sumarse' } },
        ],
        weights: { mls: 8, premier: 0, ucl: 0, bundesliga: 1, laliga: -1, seriea: -1 },
      },
    ],
  },
]

/**
 * Baseline plus the weights of everything selected so far, clamped
 * to a believable percentage band. Called on every tap, so the
 * compatibility strip stays live.
 */
export function scoreLeagues(answers) {
  const scores = { ...BASE_SCORES }

  for (const step of QUIZ_STEPS) {
    const picked = answers[step.id] ?? []
    for (const optionId of picked) {
      const option = step.options.find((o) => o.id === optionId)
      if (!option) continue
      for (const [leagueId, weight] of Object.entries(option.weights)) {
        if (scores[leagueId] === undefined) continue
        scores[leagueId] += weight
      }
    }
  }

  return Object.entries(scores)
    .map(([id, raw]) => ({ id, score: Math.max(35, Math.min(99, Math.round(raw))) }))
    .sort((a, b) => b.score - a.score)
}

export const TOTAL_STEPS = QUIZ_STEPS.length
