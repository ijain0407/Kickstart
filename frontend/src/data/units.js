/* ============================================================
   UNITS 2 & 3
   Unit 1 lives in lessons.js / lessonContent.js. These units carry
   their metadata and teaching body together, in the same {en, es}
   shape. person-b/server/data/path-lessons.json is generated from
   this file (see person-b/scripts/build-units.mjs), so the path
   still draws the same lessons when the API is down.
   ============================================================ */

const t = (en, es) => ({ en, es })
const opt = (id, en, es, correct = false) => ({ id, label: t(en, es), correct })

export const UNITS = [
  { id: 1, title: t('Tactical Foundations', 'Fundamentos tácticos') },
  { id: 2, title: t('Tactics in Motion', 'Táctica en movimiento') },
  { id: 3, title: t('The Wider Game', 'El juego en su conjunto') },
]

/** Which unit a path id belongs to: "2.3" -> 2. */
export const unitOf = (id) => Number(String(id).split('.')[0]) || 1

export const UNIT_LESSONS = [
  /* ---------------- UNIT 2 ---------------- */
  {
    id: '2.1',
    align: 'center',
    icon: 'north_east',
    xp: 50,
    minutes: 7,
    category: 'formations',
    lessonId: 'lesson-formations-overview',
    quizSlug: 'formations',
    glossaryIds: ['term-formation'],
    title: t('Building an Attack', 'Construir un ataque'),
    detailTitle: t('Module 2.1: Building an Attack', 'Módulo 2.1: Construir un ataque'),
    desc: t(
      'How a team moves the ball from its own box to the other one: playing out from the back, using the width, and finding the player between the lines.',
      'Cómo un equipo lleva el balón de su área a la contraria: salir jugando desde atrás, usar la amplitud y encontrar al jugador entre líneas.',
    ),
    bounty: t('+50 XP Drill Bounty', '+50 XP de recompensa'),
    unlocks: t("Unlocks 'Playmaker'", "Desbloquea 'Creador de juego'"),
    steps: [
      {
        title: t('Playing out from the back', 'Salir jugando desde atrás'),
        body: t(
          'Many teams start an attack with the goalkeeper and centre backs passing among themselves, drawing the opposition forward. If the first press is beaten, there is suddenly a lot of open grass ahead. The risk is obvious — a lost ball near your own goal — which is why it takes a lot of practice.',
          'Muchos equipos empiezan el ataque con el portero y los centrales pasándose el balón para atraer al rival hacia delante. Si se supera la primera presión, aparece de golpe mucho campo libre. El riesgo es evidente —perder el balón cerca de tu portería—, por eso exige muchísimo entrenamiento.',
        ),
      },
      {
        title: t('Width and overlaps', 'Amplitud y desdoblamientos'),
        body: t(
          'Wingers stay wide to stretch the defence and open gaps in the middle. A full back can then run past them on the outside — an overlap — giving the winger a choice: pass to the runner, or cut inside. Two attackers against one defender is the whole idea.',
          'Los extremos se abren para estirar a la defensa y crear huecos por dentro. Un lateral puede entonces pasar por fuera —un desdoblamiento—, y el extremo elige: pasarle al que corre o tirarse hacia dentro. Dos atacantes contra un defensa: esa es toda la idea.',
        ),
      },
      {
        title: t('The player between the lines', 'El jugador entre líneas'),
        body: t(
          'The most dangerous spot is the gap between the opposition midfield and defence. A creative player receiving the ball there, facing forward, forces defenders to choose: step out and leave space behind, or stay and let them turn. It is why teams prize the number 10.',
          'La zona más peligrosa es el hueco entre el mediocampo y la defensa rival. Un creativo que recibe ahí, de cara a la portería, obliga a los defensas a elegir: salir y dejar espacio a la espalda, o quedarse y dejarle girar. Por eso se valora tanto al número 10.',
        ),
      },
    ],
    check: {
      question: t(
        'What does an overlapping full back give the winger?',
        '¿Qué le da al extremo un lateral que se desdobla?',
      ),
      options: [
        opt('a', 'A second option: pass to the runner or cut inside', 'Una segunda opción: pasar al que corre o tirarse hacia dentro', true),
        opt('b', 'A free kick', 'Un tiro libre'),
        opt('c', 'Permission to stand offside', 'Permiso para estar en fuera de juego'),
      ],
      explain: t(
        'The overlap creates two attackers against one defender out wide, so the defender cannot cover both the pass and the cut inside.',
        'El desdoblamiento crea dos atacantes contra un defensa en banda, y este no puede cubrir a la vez el pase y el recorte hacia dentro.',
      ),
    },
  },
  {
    id: '2.2',
    align: 'right',
    icon: 'bolt',
    xp: 55,
    minutes: 7,
    category: 'positions',
    lessonId: 'lesson-positions-overview',
    quizSlug: 'positions',
    glossaryIds: ['term-clean-sheet'],
    title: t('Pressing & Transitions', 'Presión y transiciones'),
    detailTitle: t('Module 2.2: Pressing & Transitions', 'Módulo 2.2: Presión y transiciones'),
    desc: t(
      'What happens in the seconds after the ball changes hands: why some teams hunt it straight back, and why others sit deep and spring a counter-attack.',
      'Qué pasa en los segundos después de que el balón cambia de manos: por qué unos equipos lo recuperan al instante y otros se repliegan y salen al contraataque.',
    ),
    bounty: t('+55 XP Drill Bounty', '+55 XP de recompensa'),
    unlocks: t("Unlocks 'Press Leader'", "Desbloquea 'Líder de la presión'"),
    steps: [
      {
        title: t('The moment the ball turns over', 'El instante de la pérdida'),
        body: t(
          'A transition is the switch from attacking to defending, or the reverse. It is the moment a team is most disorganised: attackers are high up the pitch and the defenders are out of position. Coaches build whole game plans around exploiting or surviving those few seconds.',
          'Una transición es el paso de atacar a defender, o al revés. Es el momento en que un equipo está más desordenado: los atacantes están arriba y los defensas fuera de posición. Los entrenadores construyen planes enteros para aprovechar o sobrevivir esos pocos segundos.',
        ),
      },
      {
        title: t('The counter-press', 'La contrapresión'),
        body: t(
          'Instead of retreating after losing the ball, a counter-pressing team swarms the player who took it, straight away. The logic: the opponent has just won it and has no time to look up, so winning it back high up the pitch leaves you close to goal. Often called by its German name, gegenpressing.',
          'En lugar de replegarse al perder el balón, un equipo que contrapresiona rodea de inmediato al jugador que lo ha ganado. La lógica: el rival acaba de recuperarlo y no tiene tiempo de levantar la cabeza, así que recuperarlo arriba te deja cerca de la portería. Suele llamarse por su nombre alemán, gegenpressing.',
        ),
      },
      {
        title: t('Sitting deep and countering', 'Replegarse y contraatacar'),
        body: t(
          'The opposite plan is to defend in a compact low block, win the ball, and go forward quickly into the space the opponent left. Pace on the wings and a striker who can hold the ball up are what make a counter-attack work. Neither approach is better; each suits different players.',
          'El plan contrario es defender en un bloque bajo y compacto, ganar el balón y salir rápido al espacio que ha dejado el rival. La velocidad en las bandas y un delantero que sostenga el balón hacen funcionar un contraataque. Ninguno es mejor: cada uno encaja con jugadores distintos.',
        ),
      },
    ],
    check: {
      question: t(
        'Why does a team counter-press straight after losing the ball?',
        '¿Por qué un equipo contrapresiona justo después de perder el balón?',
      ),
      options: [
        opt('a', 'The opponent has no time to look up, and winning it back is close to goal', 'El rival no tiene tiempo de levantar la cabeza y recuperarlo queda cerca de la portería', true),
        opt('b', 'The rules require it', 'Lo exige el reglamento'),
        opt('c', 'It gives the referee time to review', 'Da tiempo al árbitro a revisar la jugada'),
      ],
      explain: t(
        'The team that has just won the ball is at its most disorganised, so the quickest way to hurt them is to win it straight back.',
        'El equipo que acaba de ganar el balón está en su momento más desordenado, así que la forma más rápida de hacerle daño es recuperarlo al instante.',
      ),
    },
  },
  {
    id: '2.3',
    align: 'left',
    icon: 'flag',
    xp: 50,
    minutes: 8,
    category: 'rules',
    lessonId: 'lesson-rules-basics',
    quizSlug: 'rules-basics',
    glossaryIds: ['term-corner-kick', 'term-free-kick', 'term-penalty-kick'],
    title: t('Set Pieces', 'Jugadas a balón parado'),
    detailTitle: t('Module 2.3: Set Pieces', 'Módulo 2.3: Jugadas a balón parado'),
    desc: t(
      'Corners, free kicks and penalties: how each restart works, what the defenders must do, and why so many goals come from them.',
      'Córners, tiros libres y penaltis: cómo funciona cada reanudación, qué deben hacer los defensas y por qué tantos goles nacen de ellas.',
    ),
    bounty: t('+50 XP Drill Bounty', '+50 XP de recompensa'),
    unlocks: t("Unlocks 'Dead-Ball Specialist'", "Desbloquea 'Especialista a balón parado'"),
    steps: [
      {
        title: t('Corners', 'Córners'),
        body: t(
          'A corner is awarded when the defending team last touches the ball before it crosses their own goal line. It is taken from the corner arc, and you can score directly from one. Teams defend them with a mix of zonal marking (guarding an area) and man-marking (guarding a player).',
          'Se concede un córner cuando el equipo que defiende toca el balón por última vez antes de que cruce su propia línea de gol. Se saca desde el arco de esquina y se puede marcar directamente. Los equipos los defienden combinando marca en zona (guardar un espacio) y marca al hombre (guardar a un jugador).',
        ),
      },
      {
        title: t('Free kicks', 'Tiros libres'),
        body: t(
          'A direct free kick can go straight into the goal. An indirect one must touch another player first. For a free kick, the defending wall must stand at least 9.15 metres (10 yards) back. Fouls inside the box do not earn a free kick — they earn something bigger.',
          'Un tiro libre directo puede entrar directamente en la portería. Uno indirecto debe tocar antes a otro jugador. En un tiro libre, la barrera debe colocarse al menos a 9,15 metros (10 yardas). Las faltas dentro del área no dan tiro libre: dan algo mucho mayor.',
        ),
      },
      {
        title: t('Penalties', 'Penaltis'),
        body: t(
          'A foul by a defender inside their own penalty area gives a penalty: one shot from 11 metres (12 yards), goalkeeper against taker. The keeper must keep at least one foot on the goal line until the ball is struck. Because they are so likely to score, the offence has to be a genuine foul, not a hunch.',
          'Una falta de un defensa dentro de su propia área supone penalti: un tiro a 11 metros (12 yardas), portero contra lanzador. El portero debe mantener al menos un pie sobre la línea de gol hasta que se golpee el balón. Como es tan probable que acabe en gol, la infracción debe ser una falta real, no una sospecha.',
        ),
      },
    ],
    check: {
      question: t(
        'A defender fouls an attacker inside the penalty area. What is awarded?',
        'Un defensa hace falta a un atacante dentro del área. ¿Qué se concede?',
      ),
      options: [
        opt('a', 'A penalty kick', 'Un penalti', true),
        opt('b', 'A corner kick', 'Un córner'),
        opt('c', 'An indirect free kick on the edge of the box', 'Un tiro libre indirecto en el borde del área'),
      ],
      explain: t(
        'A direct-free-kick foul by the defending team inside its own penalty area is punished with a penalty.',
        'Una falta que sería de tiro libre directo cometida por el equipo defensor dentro de su propia área se castiga con penalti.',
      ),
    },
  },
  {
    id: '2.4',
    align: 'right',
    icon: 'sports_handball',
    xp: 55,
    minutes: 6,
    category: 'positions',
    lessonId: 'lesson-positions-overview',
    quizSlug: 'positions',
    glossaryIds: ['term-clean-sheet'],
    title: t('The Goalkeeper', 'El portero'),
    detailTitle: t('Module 2.4: The Goalkeeper', 'Módulo 2.4: El portero'),
    desc: t(
      'The only player allowed to use their hands: where, when, and how the modern keeper has become the first attacker as well as the last defender.',
      'El único jugador que puede usar las manos: dónde, cuándo y cómo el portero moderno se ha convertido en el primer atacante además del último defensor.',
    ),
    bounty: t('+55 XP Drill Bounty', '+55 XP de recompensa'),
    unlocks: t("Unlocks 'Last Line'", "Desbloquea 'Última línea'"),
    steps: [
      {
        title: t('Hands, but only here', 'Manos, pero solo aquí'),
        body: t(
          'The goalkeeper may handle the ball inside their own penalty area and nowhere else. Step outside it and they are treated like any other player — a handball there is a foul. That is why a keeper who wanders far from goal is taking a real risk.',
          'El portero puede usar las manos dentro de su propia área y en ningún otro sitio. Si sale de ella, es un jugador más: la mano fuera del área es falta. Por eso un portero que se aleja mucho de la portería asume un riesgo real.',
        ),
      },
      {
        title: t('The back-pass rule', 'La cesión al portero'),
        body: t(
          'A keeper may not pick the ball up when a teammate deliberately kicks it to them. The rule was introduced in 1992 because teams were wasting time by passing back and letting the keeper hold on. It is the reason modern keepers must be comfortable with the ball at their feet.',
          'El portero no puede coger el balón con las manos si un compañero se lo pasa deliberadamente con el pie. La regla se introdujo en 1992 porque los equipos perdían tiempo cediendo el balón y dejando que el portero lo retuviera. Es la razón por la que los porteros modernos deben sentirse cómodos con el balón en los pies.',
        ),
      },
      {
        title: t('The sweeper-keeper', 'El portero líbero'),
        body: t(
          'A sweeper-keeper stands high, near the edge of the box or beyond, ready to clear balls played in behind a high defensive line. It only works with a team that presses high, because the space behind the defence is the keeper\'s to guard. A clean sheet is a shared achievement, but the keeper is its last line.',
          'Un portero líbero se coloca alto, cerca del borde del área o más allá, listo para despejar los balones que se cuelan a la espalda de una línea defensiva adelantada. Solo funciona en equipos que presionan alto, porque el espacio a la espalda de la defensa es cosa del portero. Mantener la portería a cero es un logro compartido, pero el portero es su última línea.',
        ),
      },
    ],
    check: {
      question: t(
        'When is a goalkeeper NOT allowed to pick the ball up?',
        '¿Cuándo NO puede un portero coger el balón con las manos?',
      ),
      options: [
        opt('a', 'When a teammate deliberately kicks it back to them', 'Cuando un compañero se lo cede deliberadamente con el pie', true),
        opt('b', 'When they are inside their own penalty area', 'Cuando está dentro de su propia área'),
        opt('c', 'When the ball is a shot from the opposition', 'Cuando el balón es un disparo del rival'),
      ],
      explain: t(
        'The back-pass rule stops teams wasting time by passing to their keeper. A shot from the opposition can always be handled inside the area.',
        'La regla de la cesión evita que los equipos pierdan tiempo pasándole el balón al portero. Un disparo del rival siempre se puede coger dentro del área.',
      ),
    },
  },

  /* ---------------- UNIT 3 ---------------- */
  {
    id: '3.1',
    align: 'center',
    icon: 'emoji_events',
    xp: 55,
    minutes: 7,
    category: 'how-to-watch',
    lessonId: 'lesson-how-to-watch',
    quizSlug: 'how-to-watch',
    glossaryIds: [],
    title: t('Leagues & Cups', 'Ligas y copas'),
    detailTitle: t('Module 3.1: Leagues & Cups', 'Módulo 3.1: Ligas y copas'),
    desc: t(
      'Why a league title is won over a season and a cup is won in a night: points, knockouts, promotion, relegation and the road to Europe.',
      'Por qué un título de liga se gana en una temporada y una copa en una noche: puntos, eliminatorias, ascensos, descensos y el camino a Europa.',
    ),
    bounty: t('+55 XP Drill Bounty', '+55 XP de recompensa'),
    unlocks: t("Unlocks 'Season Ticket'", "Desbloquea 'Abonado'"),
    steps: [
      {
        title: t('How a league works', 'Cómo funciona una liga'),
        body: t(
          'In most leagues every club plays every other twice, home and away. A win earns three points, a draw one, a defeat none, and whoever has the most points at the end of the season is champion. Because it is spread over dozens of matches, luck evens out and the best team usually wins.',
          'En casi todas las ligas cada club juega contra todos los demás dos veces, en casa y fuera. Una victoria da tres puntos, un empate uno y una derrota ninguno, y el que más puntos suma al final de la temporada es campeón. Al repartirse en decenas de partidos, la suerte se compensa y suele ganar el mejor.',
        ),
      },
      {
        title: t('Promotion and relegation', 'Ascensos y descensos'),
        body: t(
          'Leagues are stacked in divisions. The bottom clubs in the top division are relegated, and the best clubs from the division below are promoted to replace them. It means a match between two mid-table sides in April can still be a matter of survival for one of them.',
          'Las ligas se organizan en divisiones. Los últimos clasificados de la máxima categoría descienden, y los mejores de la división inferior ascienden para sustituirles. Así, un partido entre dos equipos de media tabla en abril puede seguir siendo cuestión de supervivencia para uno de ellos.',
        ),
      },
      {
        title: t('Cups and continental football', 'Copas y fútbol continental'),
        body: t(
          'Domestic cups are knockout competitions: lose once and you are out, which is why smaller clubs sometimes beat giants. Finishing near the top of a league also qualifies clubs for European competitions such as the Champions League, which since 2024-25 begins with one league phase of 36 clubs.',
          'Las copas nacionales son eliminatorias: pierdes una vez y quedas fuera, por eso los clubes pequeños a veces derrotan a gigantes. Terminar en los primeros puestos de la liga también clasifica para competiciones europeas como la Champions League, que desde 2024-25 arranca con una fase de liga de 36 clubes.',
        ),
      },
    ],
    check: {
      question: t(
        'What happens to the bottom clubs in a top division at the end of the season?',
        '¿Qué les pasa a los últimos clubes de la máxima categoría al final de la temporada?',
      ),
      options: [
        opt('a', 'They are relegated to the division below', 'Descienden a la división inferior', true),
        opt('b', 'They are given extra points next year', 'Reciben puntos extra el año siguiente'),
        opt('c', 'They play a knockout cup against the champions', 'Juegan una copa eliminatoria contra el campeón'),
      ],
      explain: t(
        'Relegation replaces the worst teams in a division with the best from the one below, so every league position carries consequences.',
        'El descenso sustituye a los peores equipos de una división por los mejores de la inferior, así que cada puesto de la tabla tiene consecuencias.',
      ),
    },
  },
  {
    id: '3.2',
    align: 'left',
    icon: 'swap_horiz',
    xp: 50,
    minutes: 6,
    category: 'how-to-watch',
    lessonId: 'lesson-how-to-watch',
    quizSlug: 'how-to-watch',
    glossaryIds: [],
    title: t('Transfers & Contracts', 'Fichajes y contratos'),
    detailTitle: t('Module 3.2: Transfers & Contracts', 'Módulo 3.2: Fichajes y contratos'),
    desc: t(
      'How players change clubs: transfer windows, fees, loans, and why a contract running out is the moment a player holds the most power.',
      'Cómo cambian de club los jugadores: mercados de fichajes, traspasos, cesiones y por qué el final de un contrato es cuando el jugador tiene más poder.',
    ),
    bounty: t('+50 XP Drill Bounty', '+50 XP de recompensa'),
    unlocks: t("Unlocks 'Deadline Day'", "Desbloquea 'Día de cierre'"),
    steps: [
      {
        title: t('The transfer window', 'El mercado de fichajes'),
        body: t(
          'Clubs can only register new players during set periods, usually one in summer and a shorter one in winter. A player is under contract to a club, so to sign them another club pays a transfer fee to buy out that contract, and agrees separate terms with the player.',
          'Los clubes solo pueden inscribir jugadores nuevos en periodos fijados, normalmente uno en verano y otro más corto en invierno. Un jugador tiene contrato con un club, así que para ficharlo otro club paga un traspaso para comprar ese contrato y pacta aparte las condiciones con el jugador.',
        ),
      },
      {
        title: t('Loans and clauses', 'Cesiones y cláusulas'),
        body: t(
          'A loan sends a player to another club for a set period, and they return afterwards. It is how young players get minutes. Some contracts, notably in Spain, carry a release clause: a fixed sum that lets any club take the player if they pay it, whatever the current club says.',
          'Una cesión envía a un jugador a otro club por un periodo determinado, y después regresa. Así los jóvenes consiguen minutos. Algunos contratos, sobre todo en España, incluyen una cláusula de rescisión: una cantidad fija que permite a cualquier club llevarse al jugador si la paga, diga lo que diga su club actual.',
        ),
      },
      {
        title: t('When a contract runs out', 'Cuando termina un contrato'),
        body: t(
          'When a contract ends, a player can leave for nothing — a free transfer. Under what is known as the Bosman ruling, players in the last six months of a contract can even agree a deal with a club abroad. That is why clubs try to sell or renew stars before their last year.',
          'Cuando termina un contrato, el jugador puede irse gratis: un traspaso libre. Según la llamada sentencia Bosman, los jugadores en los últimos seis meses de contrato pueden incluso pactar con un club extranjero. Por eso los clubes intentan vender o renovar a sus estrellas antes de su último año.',
        ),
      },
    ],
    check: {
      question: t(
        'What is a player on an expiring contract able to do?',
        '¿Qué puede hacer un jugador cuyo contrato está a punto de expirar?',
      ),
      options: [
        opt('a', 'Leave for free when it ends, and agree a deal abroad in the last six months', 'Irse gratis cuando termine y pactar con un club extranjero en los últimos seis meses', true),
        opt('b', 'Force his club to pay him a release clause', 'Obligar a su club a pagarle una cláusula de rescisión'),
        opt('c', 'Play for two clubs at once', 'Jugar en dos clubes a la vez'),
      ],
      explain: t(
        'With no fee left to collect, the club loses its leverage — which is exactly why expiring contracts are treated as a deadline.',
        'Sin traspaso que cobrar, el club pierde su ventaja, y por eso los contratos a punto de expirar se tratan como una fecha límite.',
      ),
    },
  },
  {
    id: '3.3',
    align: 'right',
    icon: 'insights',
    xp: 60,
    minutes: 8,
    category: 'how-to-watch',
    lessonId: 'lesson-how-to-watch',
    quizSlug: 'how-to-watch',
    glossaryIds: ['term-clean-sheet'],
    title: t('Reading the Stats', 'Leer las estadísticas'),
    detailTitle: t('Module 3.3: Reading the Stats', 'Módulo 3.3: Leer las estadísticas'),
    desc: t(
      'Possession, shots, expected goals: what the numbers on the broadcast graphic really tell you, and what they hide.',
      'Posesión, tiros, goles esperados: qué te cuentan de verdad los números del gráfico de la retransmisión y qué esconden.',
    ),
    bounty: t('+60 XP Drill Bounty', '+60 XP de recompensa'),
    unlocks: t("Unlocks 'Data Scout'", "Desbloquea 'Ojeador de datos'"),
    steps: [
      {
        title: t('Possession is not a score', 'La posesión no es un marcador'),
        body: t(
          'Possession is the share of time a team has the ball, and it feels like dominance. But a team can pass sideways for sixty per cent of the match and still lose to two quick counter-attacks. The number describes style at least as much as it describes quality.',
          'La posesión es el porcentaje de tiempo que un equipo tiene el balón, y parece dominio. Pero un equipo puede pasarse el balón de lado el sesenta por ciento del partido y perder por dos contraataques rápidos. El número describe el estilo al menos tanto como la calidad.',
        ),
      },
      {
        title: t('Expected goals (xG)', 'Goles esperados (xG)'),
        body: t(
          'Every shot is given a value between 0 and 1: how often a shot from that spot, in that situation, has historically been a goal. A tap-in might be 0.8, a shot from 30 metres 0.03. Add up the values and you get the goals a team probably deserved on chances alone.',
          'A cada tiro se le da un valor entre 0 y 1: con qué frecuencia un disparo desde ese punto y en esa situación ha sido gol históricamente. Un remate a puerta vacía puede valer 0,8; un disparo a 30 metros, 0,03. Suma los valores y obtienes los goles que un equipo merecía probablemente solo por sus ocasiones.',
        ),
      },
      {
        title: t('Why the numbers still need eyes', 'Por qué los números aún necesitan ojos'),
        body: t(
          'Stats are a summary, not the match. One match is a tiny sample, xG cannot see a great pass that led to nothing, and a clean sheet may owe more to a keeper\'s heroics than to defending. Use the numbers to ask better questions, then watch the game to answer them.',
          'Las estadísticas son un resumen, no el partido. Un solo partido es una muestra minúscula, el xG no ve un gran pase que no acabó en nada, y una portería a cero puede deberse más a las paradas del portero que a la defensa. Usa los números para hacer mejores preguntas y mira el partido para responderlas.',
        ),
      },
    ],
    check: {
      question: t(
        'What does a single shot\'s expected-goals value tell you?',
        '¿Qué te dice el valor de goles esperados de un solo tiro?',
      ),
      options: [
        opt('a', 'How often a shot like it has historically been a goal', 'Con qué frecuencia un tiro como ese ha sido gol históricamente', true),
        opt('b', 'How fast the ball travelled', 'A qué velocidad viajó el balón'),
        opt('c', 'Whether the shooter was offside', 'Si el que disparó estaba en fuera de juego'),
      ],
      explain: t(
        'xG measures chance quality from the shot\'s position and situation, not from what actually happened.',
        'El xG mide la calidad de la ocasión según la posición y la situación del tiro, no según lo que ocurrió en realidad.',
      ),
    },
  },
  {
    id: '3.4',
    align: 'center',
    icon: 'local_fire_department',
    xp: 65,
    minutes: 8,
    category: 'how-to-watch',
    lessonId: 'lesson-how-to-watch',
    quizSlug: 'how-to-watch',
    glossaryIds: [],
    title: t('Derbies & Rivalries', 'Derbis y rivalidades'),
    detailTitle: t('Module 3.4: Derbies & Rivalries', 'Módulo 3.4: Derbis y rivalidades'),
    desc: t(
      'Why some fixtures matter more than the table says: local pride, history and the matches nobody wants to lose.',
      'Por qué algunos partidos importan más de lo que dice la tabla: orgullo local, historia y los encuentros que nadie quiere perder.',
    ),
    bounty: t('+65 XP Drill Bounty', '+65 XP de recompensa'),
    unlocks: t("Unlocks 'Derby Day'", "Desbloquea 'Día de derbi'"),
    steps: [
      {
        title: t('What makes a derby', 'Qué hace un derbi'),
        body: t(
          'A derby is a match between local rivals — two clubs from the same city or region. Distance is what makes it personal: fans live and work side by side, so the result is argued about for a year. Form goes out of the window, and a struggling side can beat the league leaders.',
          'Un derbi es un partido entre rivales locales: dos clubes de la misma ciudad o región. La cercanía lo hace personal: los aficionados viven y trabajan puerta con puerta, así que el resultado se discute todo un año. La forma pasa a un segundo plano y un equipo en apuros puede ganar al líder.',
        ),
      },
      {
        title: t('Famous rivalries', 'Rivalidades famosas'),
        body: t(
          'Some have their own names: the Old Firm (Celtic and Rangers in Glasgow), the Derby della Madonnina (Inter and AC Milan), and the Merseyside derby (Everton and Liverpool). Not all rivalries are local — El Clásico between Real Madrid and Barcelona, or Der Klassiker between Bayern Munich and Borussia Dortmund, are about trophies and identity.',
          'Algunos tienen nombre propio: el Old Firm (Celtic y Rangers en Glasgow), el Derby della Madonnina (Inter y AC Milan) y el derbi de Merseyside (Everton y Liverpool). No todas las rivalidades son locales: El Clásico entre Real Madrid y Barcelona, o Der Klassiker entre Bayern de Múnich y Borussia Dortmund, giran en torno a títulos e identidad.',
        ),
      },
      {
        title: t('The matchday around the match', 'El día de partido alrededor del partido'),
        body: t(
          'The atmosphere is part of the fixture: bigger tifos, louder singing, more fans in the streets outside. Clubs and police plan for it, and away supporters are usually kept in their own section. If you are ever at one, arrive early — the build-up is half the event.',
          'El ambiente forma parte del encuentro: tifos más grandes, cánticos más fuertes, más aficionados en las calles. Clubes y policía lo planifican, y la afición visitante suele estar en su propia zona. Si alguna vez vas a uno, llega pronto: la previa es la mitad del evento.',
        ),
      },
    ],
    check: {
      question: t(
        'Which of these is a local derby?',
        '¿Cuál de estos es un derbi local?',
      ),
      options: [
        opt('a', 'Inter vs AC Milan', 'Inter contra AC Milan', true),
        opt('b', 'Bayern Munich vs Real Madrid', 'Bayern de Múnich contra Real Madrid'),
        opt('c', 'Barcelona vs Liverpool', 'Barcelona contra Liverpool'),
      ],
      explain: t(
        'Inter and AC Milan share a city and a stadium — the Derby della Madonnina. The others are clubs from different countries.',
        'Inter y AC Milan comparten ciudad y estadio: el Derby della Madonnina. Los demás son clubes de países distintos.',
      ),
    },
  },
]
