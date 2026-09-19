/* ============================================================
   LEAGUES, CLUBS & CHANTS
   Each league carries one featured club and its chant set.

   COPYRIGHT NOTE — layer 1 ("original stadium lyrics") never
   reproduces a published lyric. Every entry holds clearly marked
   placeholder text plus a short factual description of the song.
   Swap `layer1` for your own licensed lines when you have them.
   ============================================================ */

export const LEAGUES = [
  {
    id: 'premier',
    name: { en: 'Premier League', es: 'Premier League' },
    short: 'PL',
    club: {
      name: 'Liverpool FC',
      region: { en: 'ENGLAND · MERSEYSIDE', es: 'INGLATERRA · MERSEYSIDE' },
      stadium: 'Anfield',
      capacity: '61,276',
      crest: 'LFC',
      colors: { a: '#dc2626', b: '#7f1d1d' },
      tags: [
        { label: { en: 'The Reds', es: 'Los Reds' }, tone: 'white' },
        { label: { en: 'Anfield Pride', es: 'Orgullo de Anfield' }, tone: 'gold' },
        { label: { en: 'The Kop Stand', es: 'La grada del Kop' }, tone: 'white' },
      ],
    },
    chants: [
      {
        id: 'ynwa',
        kicker: { en: 'CLUB ANTHEM · MATCH OPENING', es: 'HIMNO DEL CLUB · ANTES DEL PARTIDO' },
        title: "You'll Never Walk Alone (YNWA)",
        audioLabel: {
          en: 'Play Anfield Kop crowd chorus',
          es: 'Reproducir el coro del Kop en Anfield',
        },
        layer1: {
          en: '[Licensed lyric goes here] — a show tune adopted by the Kop in the 1960s, built on a single promise repeated to the person beside you: keep walking, and you will not walk alone.',
          es: '[Aquí va la letra con licencia] — una canción de musical adoptada por el Kop en los años sesenta, construida sobre una sola promesa repetida a quien tienes al lado: sigue caminando y no caminarás solo.',
        },
        layer2: {
          en: 'Literal sense: walk on through the storm, hold your head up high, and you will never walk alone.',
          es: 'Sentido literal: camina a través de la tormenta, mantén la cabeza alta y nunca caminarás solo.',
        },
        layer3: {
          en: 'It is not really a football song. Anfield sings it as a pledge of collective resilience — the same solidarity Merseyside turned to after the Hillsborough disaster of 1989, when 97 supporters died. Sixty thousand people telling each other that nobody in this city grieves by themselves.',
          es: 'En realidad no es una canción de fútbol. Anfield la canta como una promesa de resistencia colectiva: la misma solidaridad a la que se aferró Merseyside tras la tragedia de Hillsborough en 1989, donde murieron 97 aficionados. Sesenta mil personas diciéndose que en esta ciudad nadie llora a solas.',
        },
        footnote: {
          en: 'Sung before kickoff & after emotional European comebacks.',
          es: 'Se canta antes del saque inicial y tras las remontadas europeas más emotivas.',
        },
      },
      {
        id: 'allez',
        kicker: { en: 'EUROPEAN ANTHEM', es: 'HIMNO EUROPEO' },
        title: 'Allez, Allez, Allez',
        audioLabel: { en: 'Play away-end chorus', es: 'Reproducir el coro de la grada visitante' },
        layer1: {
          en: '[Licensed lyric goes here] — a travelling chant adapted by Liverpool supporters in 2018, listing the club\'s European nights over a simple three-word refrain.',
          es: '[Aquí va la letra con licencia] — un cántico de viaje que los hinchas del Liverpool adaptaron en 2018 y que repasa las noches europeas del club sobre un estribillo de tres palabras.',
        },
        layer2: {
          en: 'Literal sense: "go on, go on, go on" — a French/Italian terrace call borrowed across Europe.',
          es: 'Sentido literal: "vamos, vamos, vamos" — una llamada de grada francesa e italiana tomada prestada por toda Europa.',
        },
        layer3: {
          en: 'A away-day song above all. It is sung walking to the ground, on trains and in foreign squares — the sound of a support that measures itself by how far it travels.',
          es: 'Sobre todo es una canción de desplazamiento. Se canta camino al estadio, en los trenes y en plazas extranjeras: el sonido de una afición que se mide por lo lejos que viaja.',
        },
        footnote: {
          en: 'Heard loudest in away ends and continental away trips.',
          es: 'Suena más fuerte en la grada visitante y en los viajes europeos.',
        },
      },
    ],
    spotlight: {
      place: 'Anfield Road',
      pill: { en: 'Psychological Fortress', es: 'Fortaleza psicológica' },
      kicker: { en: 'PRE-MATCH RITUAL', es: 'RITUAL PREVIO AL PARTIDO' },
      title: { en: "The 'This Is Anfield' Touch", es: "El toque del cartel 'This Is Anfield'" },
      body: {
        en: 'A red sign hangs above the tunnel steps. Bill Shankly put it there in 1974 for one reason: to remind his own players what they represented, and to remind visitors exactly where they had just arrived. Players still reach up and touch it on the way out.',
        es: 'Un cartel rojo cuelga sobre los escalones del túnel. Bill Shankly lo colocó allí en 1974 por una razón: recordar a sus jugadores lo que representaban y recordar a los visitantes dónde acababan de llegar. Los jugadores todavía estiran la mano y lo tocan al salir.',
      },
      mini: {
        title: { en: 'The Scarf Wall Ceremony', es: 'La ceremonia del muro de bufandas' },
        body: {
          en: 'Scarves raised in both hands across the Kop before kickoff — a wall of colour held up for the length of the anthem.',
          es: 'Bufandas en alto con las dos manos por todo el Kop antes del saque: un muro de color sostenido durante todo el himno.',
        },
      },
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=70',
    },
  },

  {
    id: 'laliga',
    name: { en: 'La Liga', es: 'LaLiga' },
    short: 'LL',
    club: {
      name: 'Athletic Club',
      region: { en: 'SPAIN · BASQUE COUNTRY', es: 'ESPAÑA · PAÍS VASCO' },
      stadium: 'San Mamés',
      capacity: '53,289',
      crest: 'AC',
      colors: { a: '#ee2523', b: '#8c1a18' },
      tags: [
        { label: { en: 'Los Leones', es: 'Los Leones' }, tone: 'white' },
        { label: { en: 'La Catedral', es: 'La Catedral' }, tone: 'gold' },
        { label: { en: 'Cantera Only', es: 'Solo cantera' }, tone: 'white' },
      ],
    },
    chants: [
      {
        id: 'athletic-eup',
        kicker: { en: 'TERRACE CALL · KICKOFF', es: 'GRITO DE GRADA · SAQUE INICIAL' },
        title: 'Athletic Eup!',
        audioLabel: {
          en: 'Play San Mamés terrace call',
          es: 'Reproducir el grito de la grada de San Mamés',
        },
        layer1: {
          en: '[Licensed lyric goes here] — a short Basque call-and-response: one side of the ground shouts the club name, the other answers with a single rising syllable.',
          es: '[Aquí va la letra con licencia] — una llamada y respuesta corta en euskera: un lado del estadio grita el nombre del club y el otro responde con una sola sílaba ascendente.',
        },
        layer2: {
          en: 'Literal sense: "Athletic — hey!" The word "eup" is a Basque greeting shout, closer to "oi" than to any word about football.',
          es: 'Sentido literal: "Athletic, ¡eup!". La palabra "eup" es un saludo vasco a voces, más cercano a "¡eh!" que a cualquier palabra futbolística.',
        },
        layer3: {
          en: 'It works because it is in Basque, not Spanish. Athletic fields only players formed in the Basque Country, so the chant is a language test as much as a greeting: the ground identifying itself before a ball is kicked.',
          es: 'Funciona porque está en euskera, no en castellano. El Athletic solo alinea a jugadores formados en el País Vasco, así que el cántico es tanto una declaración de lengua como un saludo: el estadio identificándose antes de que ruede el balón.',
        },
        footnote: {
          en: 'Shouted as the teams emerge and after every home goal.',
          es: 'Se grita cuando salen los equipos y tras cada gol local.',
        },
      },
      {
        id: 'aliron',
        kicker: { en: 'TITLE SONG · CELEBRATION', es: 'CANCIÓN DE TÍTULO · CELEBRACIÓN' },
        title: 'Alirón',
        audioLabel: { en: 'Play celebration chorus', es: 'Reproducir el coro de celebración' },
        layer1: {
          en: '[Licensed lyric goes here] — an early-20th-century Bilbao music-hall tune claimed by the club, sung only when there is something to celebrate.',
          es: '[Aquí va la letra con licencia] — una tonada de music-hall bilbaíno de principios del siglo XX que el club hizo suya y que solo se canta cuando hay algo que celebrar.',
        },
        layer2: {
          en: 'Literal sense: "Alirón — Athletic are champions." The word itself has no translation; it is a shout of triumph.',
          es: 'Sentido literal: "Alirón, el Athletic es campeón". La palabra en sí no tiene traducción; es un grito de triunfo.',
        },
        layer3: {
          en: 'One story traces "alirón" to the "all iron" stamp British mining engineers left on good Biscay ore in the 1890s — the same British workers who brought football to Bilbao. Whether or not that is true, the club sings it as proof that the game arrived here with the industry.',
          es: 'Una versión sitúa el origen de "alirón" en el sello "all iron" que los ingenieros mineros británicos ponían al buen mineral vizcaíno en la década de 1890: los mismos trabajadores británicos que trajeron el fútbol a Bilbao. Sea cierto o no, el club lo canta como prueba de que el juego llegó aquí con la industria.',
        },
        footnote: {
          en: 'Reserved for trophies — singing it early is considered bad luck.',
          es: 'Reservado para los títulos: cantarlo antes de tiempo se considera mala suerte.',
        },
      },
    ],
    spotlight: {
      place: 'San Mamés',
      pill: { en: 'The Cathedral', es: 'La Catedral' },
      kicker: { en: 'MATCHDAY RITUAL', es: 'RITUAL DE JORNADA' },
      title: { en: 'The Walk Along the Nervión', es: 'El paseo por el Nervión' },
      body: {
        en: 'Supporters gather in the bars of Pozas and walk to the ground along the river in one slow current of red and white. The old stadium was nicknamed La Catedral — a cathedral being somewhere you go on foot, with everyone else, at the same hour every other week.',
        es: 'La afición se junta en los bares de Pozas y camina hasta el estadio siguiendo el río en una sola corriente lenta de rojo y blanco. Al viejo campo lo apodaron La Catedral, y a una catedral se va a pie, con todos los demás, a la misma hora cada quince días.',
      },
      mini: {
        title: { en: 'The Lions of the Cantera', es: 'Los leones de la cantera' },
        body: {
          en: 'Every player on the pitch was raised in the Basque Country. The crowd knows which village each one came from.',
          es: 'Todos los jugadores del campo se criaron en el País Vasco. La grada sabe de qué pueblo viene cada uno.',
        },
      },
      image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=70',
    },
  },

  {
    id: 'seriea',
    name: { en: 'Serie A', es: 'Serie A' },
    short: 'SA',
    club: {
      name: 'SSC Napoli',
      region: { en: 'ITALY · CAMPANIA', es: 'ITALIA · CAMPANIA' },
      stadium: 'Stadio Diego Armando Maradona',
      capacity: '54,726',
      crest: 'SSC',
      colors: { a: '#0ea5e9', b: '#075985' },
      tags: [
        { label: { en: 'Gli Azzurri', es: 'Gli Azzurri' }, tone: 'white' },
        { label: { en: 'Curva B', es: 'Curva B' }, tone: 'gold' },
        { label: { en: 'Fortitudo Nostra', es: 'Fortitudo Nostra' }, tone: 'white' },
      ],
    },
    chants: [
      {
        id: 'un-giorno',
        kicker: { en: "CURVA ANTHEM · PLAYERS' WALKOUT", es: 'HIMNO DE LA CURVA · SALIDA DE LOS EQUIPOS' },
        title: "Un Giorno all'Improvviso",
        audioLabel: { en: 'Play Curva B chorus', es: 'Reproducir el coro de la Curva B' },
        layer1: {
          en: '[Licensed lyric goes here] — a 1980s Italian pop melody re-worded by the curva, about loving a city and a team without deciding to.',
          es: '[Aquí va la letra con licencia] — una melodía pop italiana de los años ochenta con letra nueva de la curva, sobre querer a una ciudad y a un equipo sin haberlo decidido.',
        },
        layer2: {
          en: 'Literal sense: "one day, all of a sudden, I fell in love with you" — addressed to the club, not a person.',
          es: 'Sentido literal: "un día, de repente, me enamoré de ti", dirigido al club y no a una persona.',
        },
        layer3: {
          en: 'Naples spent decades being written off by the industrial north, and the song answers that directly: the love was never chosen, so it cannot be argued with. It became the sound of the 2023 scudetto, sung in streets painted blue for a year.',
          es: 'Durante décadas el norte industrial despreció a Nápoles, y la canción responde a eso sin rodeos: el amor nunca se eligió, así que no se discute. Se convirtió en el sonido del scudetto de 2023, cantada en calles pintadas de azul durante un año.',
        },
        footnote: {
          en: 'Sung as the teams walk out, with the whole ground standing.',
          es: 'Se canta cuando salen los equipos, con todo el estadio en pie.',
        },
      },
      {
        id: 'surdato',
        kicker: { en: 'NEAPOLITAN STANDARD', es: 'CLÁSICO NAPOLITANO' },
        title: "'O Surdato 'Nnammurato",
        audioLabel: { en: 'Play terrace version', es: 'Reproducir la versión de la grada' },
        layer1: {
          en: '[Licensed lyric goes here] — a 1915 Neapolitan song about a soldier writing home, taken up by the stands and sung in dialect.',
          es: '[Aquí va la letra con licencia] — una canción napolitana de 1915 sobre un soldado que escribe a casa, adoptada por la grada y cantada en dialecto.',
        },
        layer2: {
          en: 'Literal sense: "the soldier in love" — a man at the front telling the person he left behind that he is still hers.',
          es: 'Sentido literal: "el soldado enamorado": un hombre en el frente diciéndole a quien dejó atrás que sigue siendo suyo.',
        },
        layer3: {
          en: 'It predates the club by a decade and belongs to the city first. Singing a First World War love song at a football match is Naples insisting that the team is simply one more thing the city does with its own voice.',
          es: 'Es una década anterior al club y pertenece antes que nada a la ciudad. Cantar una canción de amor de la Primera Guerra Mundial en un partido es la forma que tiene Nápoles de insistir en que el equipo es solo una cosa más que la ciudad hace con su propia voz.',
        },
        footnote: {
          en: 'Heard at full time and at every Neapolitan wedding.',
          es: 'Suena al final del partido y en todas las bodas napolitanas.',
        },
      },
    ],
    spotlight: {
      place: 'Fuorigrotta',
      pill: { en: 'City-Wide Ritual', es: 'Ritual de toda la ciudad' },
      kicker: { en: 'MATCHDAY RITUAL', es: 'RITUAL DE JORNADA' },
      title: { en: 'The Painted Alleyways', es: 'Los callejones pintados' },
      body: {
        en: 'In the Quartieri Spagnoli the murals go up before the season does. Balconies string blue and white across streets barely wide enough for a scooter, and the same alleys become the route the trophy takes if there is one to carry.',
        es: 'En los Quartieri Spagnoli los murales aparecen antes que la temporada. Los balcones tienden el azul y el blanco sobre calles en las que apenas cabe una moto, y esos mismos callejones son el recorrido del trofeo cuando hay alguno que pasear.',
      },
      mini: {
        title: { en: 'The Maradona Shrine', es: 'El altar de Maradona' },
        body: {
          en: 'A lit corner in a Spanish Quarter alley, kept by neighbours since 1984 and visited year-round.',
          es: 'Una esquina iluminada en un callejón de los Quartieri, cuidada por los vecinos desde 1984 y visitada todo el año.',
        },
      },
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=70',
    },
  },
]

/** Competitions ranked by the Tactical Matcher (superset of the culture set). */
export const RANKED_LEAGUES = [
  { id: 'premier', name: { en: 'Premier League', es: 'Premier League' }, hasCulture: true },
  { id: 'laliga', name: { en: 'La Liga', es: 'LaLiga' }, hasCulture: true },
  { id: 'seriea', name: { en: 'Serie A', es: 'Serie A' }, hasCulture: true },
  { id: 'bundesliga', name: { en: 'Bundesliga', es: 'Bundesliga' }, hasCulture: false },
  { id: 'mls', name: { en: 'MLS', es: 'MLS' }, hasCulture: false },
  { id: 'ucl', name: { en: 'Champions League', es: 'Champions League' }, hasCulture: false },
]

export function getLeague(id) {
  return LEAGUES.find((l) => l.id === id) ?? LEAGUES[0]
}
