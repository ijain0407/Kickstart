/* ============================================================
   FIFA CULTURE DATA
   Single source for the FIFA Culture section (#/fifa).

   VERIFIED (September 2026):
   - The 48-team 2026 World Cup field and each team's confederation
     (Wikipedia "2026 FIFA World Cup qualification").
   - Every team's exit stage, taken from the bracket on Wikipedia's
     "2026 FIFA World Cup knockout stage" (final: Spain 1-0 Argentina a.e.t.,
     19 July 2026; third place England).
   - Men's ranking (2026-07-20) and women's ranking (2026-06-16) from the
     official FIFA ranking API (api.fifa.com). A women's ranking of null means
     the team does not appear in FIFA's women's table ("Not ranked").
   - Women's World Cup winners (Wikipedia "FIFA Women's World Cup").
   - federationFounded: year the national federation was founded, taken from
     each federation's Wikipedia article. null = not confirmed, shown as N/A.

   "Confederation" is FIFA's official term (the brief said "conferences").

   famousPlayer is SUBJECTIVE: one widely recognised figure per country, not a
   ranking of the greatest. Written in our own words; text and emoji only.
   ============================================================ */

export const FIFA_META = {
  rankingsAsOf: { men: '2026-07-20', women: '2026-06-16' },
  sources: [
    'https://inside.fifa.com/fifa-world-ranking (via api.fifa.com)',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification',
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage',
    'https://en.wikipedia.org/wiki/FIFA_Women%27s_World_Cup',
  ],
  tournament: { year: 2026, hosts: ['USA', 'CAN', 'MEX'], champion: 'ESP', finished: true },
}

/** Stages a 2026 team can finish at, in order (used for the stat card). */
export const WC2026_STAGES = ['group', 'r32', 'r16', 'qf', 'fourth', 'third', 'runnerUp', 'champion']

export const CONFEDERATIONS = [
  {
    id: 'afc',
    abbr: 'AFC',
    name: { en: 'Asian Football Confederation', es: 'Confederación Asiática de Fútbol' },
    region: { en: 'Asia', es: 'Asia' },
    description: {
      en: 'Founded in 1954, the AFC runs football across the world’s largest continent and stages the Asian Cup. Its teams have grown steadily on the World Cup stage, with South Korea’s 2002 semi-final still the high-water mark.',
      es: 'Fundada en 1954, la AFC organiza el fútbol en el continente más grande del mundo y celebra la Copa Asiática. Sus selecciones han crecido en los Mundiales, y las semifinales de Corea del Sur en 2002 siguen siendo su mejor resultado.',
    },
    teams: ['JPN', 'IRN', 'KOR', 'AUS', 'QAT', 'KSA', 'UZB', 'JOR', 'IRQ'],
  },
  {
    id: 'caf',
    abbr: 'CAF',
    name: { en: 'Confederation of African Football', es: 'Confederación Africana de Fútbol' },
    region: { en: 'Africa', es: 'África' },
    description: {
      en: 'Founded in 1957, CAF organizes the Africa Cup of Nations. In 2022 Morocco became the first African team to reach a World Cup semi-final, and the continent’s share of places keeps growing.',
      es: 'Fundada en 1957, la CAF organiza la Copa Africana de Naciones. En 2022 Marruecos fue el primer equipo africano en llegar a unas semifinales de un Mundial, y el continente cuenta cada vez con más plazas.',
    },
    teams: ['MAR', 'TUN', 'EGY', 'ALG', 'GHA', 'CPV', 'SEN', 'RSA', 'CIV', 'COD'],
  },
  {
    id: 'concacaf',
    abbr: 'CONCACAF',
    name: {
      en: 'Confederation of North, Central America and Caribbean Association Football',
      es: 'Confederación de Fútbol de Norteamérica, Centroamérica y el Caribe',
    },
    region: { en: 'North & Central America, Caribbean', es: 'Norte y Centroamérica y el Caribe' },
    description: {
      en: 'Formed in 1961, CONCACAF spans North America, Central America and the Caribbean and runs the Gold Cup. Three of its members, Canada, Mexico and the United States, co-hosted the 2026 World Cup.',
      es: 'Creada en 1961, la CONCACAF abarca Norteamérica, Centroamérica y el Caribe y organiza la Copa Oro. Tres de sus miembros, Canadá, México y Estados Unidos, fueron coanfitriones del Mundial 2026.',
    },
    teams: ['CAN', 'MEX', 'USA', 'PAN', 'CUW', 'HAI'],
  },
  {
    id: 'conmebol',
    abbr: 'CONMEBOL',
    name: { en: 'South American Football Confederation', es: 'Confederación Sudamericana de Fútbol' },
    region: { en: 'South America', es: 'Sudamérica' },
    description: {
      en: 'Founded in 1916, CONMEBOL is the oldest continental confederation and runs the Copa América. With only ten members, it is a heavyweight: Argentina, Brazil and Uruguay alone have won ten of the 23 men’s World Cups.',
      es: 'Fundada en 1916, la CONMEBOL es la confederación continental más antigua y organiza la Copa América. Con solo diez miembros, es un peso pesado: Argentina, Brasil y Uruguay suman por sí solas diez de los 23 Mundiales masculinos.',
    },
    teams: ['ARG', 'BRA', 'ECU', 'PAR', 'URU', 'COL'],
  },
  {
    id: 'ofc',
    abbr: 'OFC',
    name: { en: 'Oceania Football Confederation', es: 'Confederación de Fútbol de Oceanía' },
    region: { en: 'Oceania', es: 'Oceanía' },
    description: {
      en: 'Founded in 1966, the OFC covers New Zealand and the Pacific island nations. For 2026 it received a guaranteed World Cup place for the first time, and New Zealand took it.',
      es: 'Fundada en 1966, la OFC reúne a Nueva Zelanda y a las naciones insulares del Pacífico. Para 2026 obtuvo por primera vez una plaza directa en el Mundial, y la ocupó Nueva Zelanda.',
    },
    teams: ['NZL'],
  },
  {
    id: 'uefa',
    abbr: 'UEFA',
    name: { en: 'Union of European Football Associations', es: 'Unión de Asociaciones Europeas de Fútbol' },
    region: { en: 'Europe', es: 'Europa' },
    description: {
      en: 'Founded in 1954, UEFA governs European football and organizes the European Championship and the Champions League. It sends the most teams to the World Cup and has supplied most of its winners.',
      es: 'Fundada en 1954, la UEFA gobierna el fútbol europeo y organiza la Eurocopa y la Liga de Campeones. Es la confederación con más equipos en el Mundial y la que más campeones ha aportado.',
    },
    teams: ['ENG', 'FRA', 'CRO', 'POR', 'NOR', 'GER', 'NED', 'SUI', 'SCO', 'ESP', 'AUT', 'BEL', 'BIH', 'SWE', 'TUR', 'CZE'],
  },
]

/** FIFA description shown on the landing page. */
export const FIFA_FACTS = {
  founded: 1904,
  foundedIn: { en: 'Paris', es: 'París' },
  hq: { en: 'Zurich', es: 'Zúrich' },
}

/* ---- Positions, reused across players ---- */
const GK = { en: 'Goalkeeper', es: 'Portero' }
const DF = { en: 'Defender', es: 'Defensa' }
const MF = { en: 'Midfielder', es: 'Centrocampista' }
const AM = { en: 'Attacking midfielder', es: 'Mediapunta' }
const WG = { en: 'Winger', es: 'Extremo' }
const FW = { en: 'Forward', es: 'Delantero' }
const FB = { en: 'Full-back', es: 'Lateral' }
const SW = { en: 'Sweeper / defender', es: 'Líbero / defensa' }

const player = (name, position, en, es) => ({ name, position, blurb: { en, es } })

/**
 * Per-country data, keyed by FIFA three-letter code.
 * iso2: ISO 3166 region for the localized name (Intl.DisplayNames).
 * name: localized-name override (England, Scotland and a few short forms).
 */
export const COUNTRIES = {
  /* ------------------------- AFC ------------------------- */
  JPN: {
    iso2: 'JP', mensRanking: 17, womensRanking: 5, mensTitles: 0, womensTitles: 1, federationFounded: null, wc2026: 'r32',
    famousPlayer: player('Hidetoshi Nakata', AM, 'The first Japanese star in Europe, he won the 2000–01 Serie A title with Roma.', 'La primera gran estrella japonesa en Europa: ganó la Serie A 2000-01 con la Roma.'),
    history: {
      en: 'Japan reached its first World Cup in 1998 and has qualified every time since, launched by the professional J.League that began in 1993. The men’s team has made the last sixteen four times, including a famous 2022 group with wins over Germany and Spain. Its women’s side won the 2011 World Cup, the first Asian team to lift it.',
      es: 'Japón llegó a su primer Mundial en 1998 y desde entonces ha clasificado siempre, impulsado por la J.League profesional, nacida en 1993. La selección masculina ha alcanzado los octavos de final cuatro veces, con un célebre grupo en 2022 en el que venció a Alemania y a España. La femenina ganó el Mundial de 2011, la primera de Asia en lograrlo.',
    },
  },
  IRN: {
    iso2: 'IR', mensRanking: 22, womensRanking: 68, mensTitles: 0, womensTitles: 0, federationFounded: 1920, wc2026: 'group',
    famousPlayer: player('Ali Daei', FW, 'Scored 109 international goals, a men’s record that stood for years.', 'Marcó 109 goles con su selección, un récord masculino que duró muchos años.'),
    history: {
      en: 'The Iranian federation dates from 1920, and the national team has won the Asian Cup three times, the first in 1968. Iran has played at the World Cup seven times, including a celebrated 1998 win over the United States. It has never advanced from the group stage, and 2026 followed that pattern.',
      es: 'La federación iraní se fundó en 1920 y la selección ha ganado tres veces la Copa Asiática, la primera en 1968. Irán ha disputado siete Mundiales, con la célebre victoria sobre Estados Unidos en 1998. Nunca ha pasado de la fase de grupos, y 2026 siguió esa pauta.',
    },
  },
  KOR: {
    iso2: 'KR', mensRanking: 32, womensRanking: 19, mensTitles: 0, womensTitles: 0, federationFounded: 1933, wc2026: 'group',
    famousPlayer: player('Son Heung-min', FW, 'The national team captain and the first Asian to win the Premier League Golden Boot.', 'Capitán de la selección y primer asiático en ganar la Bota de Oro de la Premier League.'),
    history: {
      en: 'South Korea’s federation was founded in 1933 and the team has qualified for every World Cup since 1986. Its finest hour was 2002, when it co-hosted and reached the semi-finals, the best ever by an Asian side. It also advanced from the group in 2010 and 2022.',
      es: 'La federación surcoreana se fundó en 1933 y el equipo ha clasificado a todos los Mundiales desde 1986. Su mejor momento fue 2002, cuando fue coanfitrión y llegó a semifinales, el mejor resultado de un equipo asiático. También pasó de grupo en 2010 y 2022.',
    },
  },
  AUS: {
    iso2: 'AU', mensRanking: 28, womensRanking: 15, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'r32',
    famousPlayer: player('Tim Cahill', AM, 'Scored Australia’s first World Cup goal in 2006 and became its all-time leading scorer.', 'Marcó el primer gol de Australia en un Mundial (2006) y es su máximo goleador histórico.'),
    history: {
      en: 'Australia first played at the World Cup in 1974, then waited over three decades for a second appearance in 2006. It moved from Oceania to the Asian confederation in 2006 and reached the last sixteen that year and again in 2022. The women’s team, the Matildas, reached the 2023 semi-finals at home.',
      es: 'Australia jugó su primer Mundial en 1974 y esperó más de tres décadas para el segundo, en 2006. Ese año pasó de la confederación de Oceanía a la asiática y alcanzó los octavos, igual que en 2022. La selección femenina, las Matildas, llegó a semifinales del Mundial 2023 en casa.',
    },
  },
  QAT: {
    iso2: 'QA', mensRanking: 59, womensRanking: null, mensTitles: 0, womensTitles: 0, federationFounded: 1960, wc2026: 'group',
    famousPlayer: player('Akram Afif', WG, 'The creative spark behind Qatar’s Asian Cup wins in 2019 and 2023.', 'La chispa creativa de los títulos de Qatar en la Copa Asiática de 2019 y 2023.'),
    history: {
      en: 'The Qatar Football Association was founded in 1960. Qatar hosted the 2022 World Cup, its first, and won the Asian Cup in 2019 and 2023 after years of investment in youth training. In 2026 it qualified on merit for the first time but went out in the group stage.',
      es: 'La Federación de Fútbol de Qatar se fundó en 1960. Qatar organizó el Mundial 2022, su primero, y ganó la Copa Asiática en 2019 y 2023 tras años de inversión en la cantera. En 2026 clasificó por méritos propios por primera vez, pero cayó en la fase de grupos.',
    },
  },
  KSA: {
    iso2: 'SA', mensRanking: 58, womensRanking: 157, mensTitles: 0, womensTitles: 0, federationFounded: 1955, wc2026: 'group',
    famousPlayer: player('Saeed Al-Owairan', FW, 'Dribbled past half the Belgian team for a legendary solo goal at the 1994 World Cup.', 'Se marchó de media selección belga en un gol en solitario legendario en el Mundial de 1994.'),
    history: {
      en: 'The Saudi federation dates from 1955, and the national team won the Asian Cup three times between 1984 and 1996. It reached the round of 16 on its 1994 World Cup debut. In 2022 it stunned eventual champions Argentina 2–1, one of the great upsets in the tournament’s history.',
      es: 'La federación saudí data de 1955 y la selección ganó tres Copas Asiáticas entre 1984 y 1996. Alcanzó los octavos de final en su debut mundialista de 1994. En 2022 sorprendió a la futura campeona Argentina por 2-1, una de las mayores sorpresas de la historia del torneo.',
    },
  },
  UZB: {
    iso2: 'UZ', mensRanking: 60, womensRanking: 51, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'group',
    famousPlayer: player('Server Djeparov', MF, 'Twice Asian Player of the Year, in 2008 and 2011.', 'Dos veces Jugador Asiático del Año, en 2008 y 2011.'),
    history: {
      en: 'Uzbekistan began playing as an independent nation in 1992 after the Soviet Union dissolved. For years it came close to a World Cup place without getting one, before finally qualifying for 2026. That debut ended in the group stage, but it marked a landmark for football in Central Asia.',
      es: 'Uzbekistán empezó a jugar como nación independiente en 1992, tras la disolución de la Unión Soviética. Durante años rozó el Mundial sin conseguirlo, hasta clasificarse por fin para 2026. Ese debut terminó en la fase de grupos, pero supuso un hito para el fútbol de Asia Central.',
    },
  },
  JOR: {
    iso2: 'JO', mensRanking: 73, womensRanking: 76, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'group',
    famousPlayer: player('Musa Al-Tamari', WG, 'A quick, tricky winger who led Jordan to the 2023 Asian Cup final.', 'Extremo veloz y habilidoso que llevó a Jordania a la final de la Copa Asiática 2023.'),
    history: {
      en: 'Jordan’s football grew slowly for decades, with regional success rather than global. The breakthrough was the 2023 Asian Cup, where it reached its first final. That run carried into its first World Cup in 2026, where it went out in the group stage.',
      es: 'El fútbol jordano creció despacio durante décadas, con éxitos regionales más que mundiales. El gran salto llegó en la Copa Asiática 2023, donde alcanzó su primera final. Ese impulso lo llevó a su primer Mundial en 2026, donde cayó en la fase de grupos.',
    },
  },
  IRQ: {
    iso2: 'IQ', mensRanking: 63, womensRanking: 166, mensTitles: 0, womensTitles: 0, federationFounded: 1948, wc2026: 'group',
    famousPlayer: player('Younis Mahmoud', FW, 'Captained Iraq to the 2007 Asian Cup and scored the winner in the final.', 'Capitaneó a Irak hasta la Copa Asiática 2007 y marcó el gol decisivo en la final.'),
    history: {
      en: 'The Iraqi federation was founded in 1948. The national team played its only World Cup before 2026 in 1986. Its proudest moment came in 2007, when it won the Asian Cup during a period of great hardship at home. 2026 marked a return to the World Cup after forty years.',
      es: 'La federación iraquí se fundó en 1948. Antes de 2026, la selección solo había jugado un Mundial, el de 1986. Su momento más orgulloso fue la Copa Asiática de 2007, ganada en plena adversidad en el país. En 2026 volvió al Mundial cuarenta años después.',
    },
  },

  /* ------------------------- CAF ------------------------- */
  MAR: {
    iso2: 'MA', mensRanking: 6, womensRanking: 64, mensTitles: 0, womensTitles: 0, federationFounded: 1956, wc2026: 'qf',
    famousPlayer: player('Achraf Hakimi', FB, 'An attacking right-back who was central to Morocco’s 2022 semi-final run.', 'Lateral derecho ofensivo, pieza clave de la campaña marroquí hasta semifinales en 2022.'),
    history: {
      en: 'Morocco’s federation was founded in 1956 and joined FIFA in 1960. In 1986 it became the first African team to win a World Cup group, and in 2022 the first to reach a semi-final. It repeated the deep run in 2026, reaching the quarter-finals before losing to France.',
      es: 'La federación marroquí se fundó en 1956 e ingresó en la FIFA en 1960. En 1986 fue el primer equipo africano en ganar un grupo mundialista y en 2022 el primero en llegar a semifinales. En 2026 repitió una gran actuación: cuartos de final, donde cayó ante Francia.',
    },
  },
  TUN: {
    iso2: 'TN', mensRanking: 57, womensRanking: 102, mensTitles: 0, womensTitles: 0, federationFounded: 1957, wc2026: 'group',
    famousPlayer: player('Tarak Dhiab', AM, 'The playmaker of the 1978 side and African Footballer of the Year in 1977.', 'El cerebro del equipo de 1978 y Futbolista Africano del Año en 1977.'),
    history: {
      en: 'Tunisia’s federation was founded in 1957, soon after independence. At the 1978 World Cup it became the first African team to win a match at the finals, beating Mexico. It also stunned France in 2022, though it has yet to get past the group stage.',
      es: 'La federación tunecina se fundó en 1957, poco después de la independencia. En el Mundial de 1978 fue el primer equipo africano en ganar un partido en la fase final, al vencer a México. También sorprendió a Francia en 2022, aunque aún no ha superado la fase de grupos.',
    },
  },
  EGY: {
    iso2: 'EG', mensRanking: 24, womensRanking: 99, mensTitles: 0, womensTitles: 0, federationFounded: 1921, wc2026: 'r16',
    famousPlayer: player('Mohamed Salah', WG, 'Liverpool’s record-breaking winger and the face of Egyptian football.', 'El extremo récord del Liverpool y la cara del fútbol egipcio.'),
    history: {
      en: 'The Egyptian federation was founded in 1921, and in 1934 Egypt became the first African team at a World Cup. It has won the Africa Cup of Nations seven times, more than any other nation. After returning in 1990 and 2018, it reached the round of 16 in 2026.',
      es: 'La federación egipcia se fundó en 1921 y en 1934 Egipto fue el primer equipo africano en un Mundial. Ha ganado siete Copas Africanas de Naciones, más que ninguna otra selección. Tras volver en 1990 y 2018, alcanzó los octavos de final en 2026.',
    },
  },
  ALG: {
    iso2: 'DZ', mensRanking: 29, womensRanking: 74, mensTitles: 0, womensTitles: 0, federationFounded: 1962, wc2026: 'r32',
    famousPlayer: player('Riyad Mahrez', WG, 'Captained Algeria to the 2019 Africa Cup of Nations and won the league with Leicester.', 'Capitaneó a Argelia en la Copa Africana de 2019 y ganó la liga con el Leicester.'),
    history: {
      en: 'Algeria’s federation formed in 1962, the year of independence. The team beat West Germany in 1982 and reached the round of 16 in 2014. It has won the Africa Cup of Nations twice, in 1990 and 2019, and reached the round of 32 in 2026.',
      es: 'La federación argelina se formó en 1962, el año de la independencia. El equipo derrotó a Alemania Occidental en 1982 y llegó a octavos en 2014. Ha ganado dos veces la Copa Africana de Naciones, en 1990 y 2019, y alcanzó los dieciseisavos en 2026.',
    },
  },
  GHA: {
    iso2: 'GH', mensRanking: 65, womensRanking: 60, mensTitles: 0, womensTitles: 0, federationFounded: 1957, wc2026: 'r32',
    famousPlayer: player('Abedi Pele', AM, 'A three-time African Footballer of the Year who won the 1993 Champions League with Marseille.', 'Tres veces Futbolista Africano del Año y campeón de la Liga de Campeones 1993 con el Marsella.'),
    history: {
      en: 'The Ghana FA was founded in 1957, the year of independence, replacing an earlier Gold Coast association. The Black Stars have won the Africa Cup of Nations four times. In 2010 they came within a penalty of becoming the first African World Cup semi-finalist, and in 2026 they reached the round of 32.',
      es: 'La federación ghanesa se fundó en 1957, el año de la independencia, y sustituyó a la antigua asociación de la Costa de Oro. Las Estrellas Negras han ganado cuatro Copas Africanas de Naciones. En 2010 estuvieron a un penalti de ser la primera semifinalista africana, y en 2026 llegaron a dieciseisavos.',
    },
  },
  CPV: {
    iso2: 'CV', mensRanking: 64, womensRanking: 120, mensTitles: 0, womensTitles: 0, federationFounded: 1982, wc2026: 'r32',
    famousPlayer: player('Ryan Mendes', WG, 'A long-serving winger who has been a fixture of the side through its rise.', 'Extremo veterano que ha sido un fijo de la selección durante su ascenso.'),
    history: {
      en: 'Cape Verde is an island nation off West Africa whose football federation was founded in 1982, seven years after independence. It joined FIFA and CAF in 1986. Despite a small population it climbed steadily and reached its first World Cup in 2026, where it made the round of 32.',
      es: 'Cabo Verde es una nación insular frente a África Occidental cuya federación se fundó en 1982, siete años después de la independencia. Ingresó en la FIFA y la CAF en 1986. Pese a su pequeña población, fue escalando hasta su primer Mundial en 2026, donde alcanzó los dieciseisavos.',
    },
  },
  SEN: {
    iso2: 'SN', mensRanking: 18, womensRanking: 79, mensTitles: 0, womensTitles: 0, federationFounded: 1960, wc2026: 'r32',
    famousPlayer: player('Sadio Mané', WG, 'Scored the winning penalty in the 2021 Africa Cup of Nations final.', 'Marcó el penalti decisivo en la final de la Copa Africana de 2021.'),
    history: {
      en: 'Senegal’s federation was founded in 1960. On its World Cup debut in 2002 it beat holders France in the opening match and reached the quarter-finals. It also reached the last sixteen in 2022 and the round of 32 in 2026, where it lost 3–2 to Belgium after extra time.',
      es: 'La federación senegalesa se fundó en 1960. En su debut mundialista de 2002 derrotó a la campeona Francia en el partido inaugural y llegó a cuartos de final. También alcanzó los octavos en 2022 y los dieciseisavos en 2026, donde perdió 3-2 ante Bélgica tras la prórroga.',
    },
  },
  RSA: {
    iso2: 'ZA', mensRanking: 54, womensRanking: 57, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'r32',
    famousPlayer: player('Benni McCarthy', FW, 'South Africa’s record scorer and a Champions League winner with Porto in 2004.', 'Máximo goleador histórico de Sudáfrica y campeón de la Liga de Campeones 2004 con el Oporto.'),
    history: {
      en: 'South Africa returned to international football in 1992 after the end of apartheid-era isolation. It won the Africa Cup of Nations at home in 1996 and in 2010 became the first African nation to host a World Cup. In 2026 it reached the round of 32.',
      es: 'Sudáfrica volvió al fútbol internacional en 1992, tras el fin del aislamiento del apartheid. Ganó la Copa Africana de Naciones en casa en 1996 y en 2010 fue la primera nación africana en organizar un Mundial. En 2026 llegó a los dieciseisavos.',
    },
  },
  CIV: {
    iso2: 'CI', mensRanking: 31, womensRanking: 72, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'r32',
    famousPlayer: player('Didier Drogba', FW, 'A powerful striker and Chelsea legend who led Ivory Coast’s “golden generation”.', 'Delantero potente, leyenda del Chelsea y líder de la «generación dorada» marfileña.'),
    history: {
      en: 'Ivory Coast’s “golden generation”, led by Didier Drogba, took the Elephants to their first World Cup in 2006. They have since won the Africa Cup of Nations in 2015 and again in 2023, the second on home soil. In 2026 they reached the round of 32, losing to Norway.',
      es: 'La «generación dorada» de Costa de Marfil, liderada por Didier Drogba, llevó a los Elefantes a su primer Mundial en 2006. Después ganaron la Copa Africana de Naciones en 2015 y de nuevo en 2023, esta vez en casa. En 2026 alcanzaron los dieciseisavos y cayeron ante Noruega.',
    },
  },
  COD: {
    iso2: 'CD', name: { en: 'DR Congo', es: 'RD del Congo' }, mensRanking: 41, womensRanking: 106, mensTitles: 0, womensTitles: 0, federationFounded: 1919, wc2026: 'r32',
    famousPlayer: player('Ndaye Mulamba', FW, 'Scored a record nine goals at the 1974 Africa Cup of Nations, won by Zaire.', 'Marcó un récord de nueve goles en la Copa Africana de 1974, ganada por Zaire.'),
    history: {
      en: 'The federation dates from 1919, and the country, playing as Zaire, was the first sub-Saharan African team at a World Cup in 1974. Its two Africa Cup of Nations titles came in 1968 and 1974. After a 52-year gap it returned to the World Cup in 2026 and reached the round of 32.',
      es: 'La federación data de 1919 y el país, como Zaire, fue el primer equipo del África subsahariana en un Mundial, en 1974. Sus dos Copas Africanas de Naciones llegaron en 1968 y 1974. Tras 52 años de ausencia volvió al Mundial en 2026 y alcanzó los dieciseisavos.',
    },
  },

  /* ---------------------- CONCACAF ---------------------- */
  CAN: {
    iso2: 'CA', mensRanking: 30, womensRanking: 9, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'r16',
    famousPlayer: player('Alphonso Davies', FB, 'Blazingly fast left-back who won the Champions League with Bayern Munich in 2020.', 'Lateral izquierdo fulgurante, campeón de la Liga de Campeones 2020 con el Bayern.'),
    history: {
      en: 'Canada played its first World Cup in 1986 and did not return until 2022, before co-hosting the 2026 edition. As hosts the men advanced from their group and reached the round of 16, beating South Africa on the way. The women’s team won Olympic gold in 2020 and has become a regular on the world stage.',
      es: 'Canadá jugó su primer Mundial en 1986 y no volvió hasta 2022, antes de ser coanfitrión en 2026. Como anfitriona, la selección masculina pasó de grupo y llegó a octavos, tras vencer a Sudáfrica. La femenina ganó el oro olímpico en 2020 y es ya una habitual del panorama mundial.',
    },
  },
  MEX: {
    iso2: 'MX', mensRanking: 10, womensRanking: 28, mensTitles: 0, womensTitles: 0, federationFounded: 1927, wc2026: 'r16',
    famousPlayer: player('Hugo Sánchez', FW, 'A five-time Spanish top scorer, famed for his acrobatic goals with Real Madrid.', 'Cinco veces máximo goleador de España, famoso por sus goles acrobáticos con el Real Madrid.'),
    history: {
      en: 'The Mexican federation was established in 1927, and Mexico has played at the World Cup since the first tournament in 1930. It hosted in 1970 and 1986, reaching the quarter-finals both times, and in 2026 became the first nation to host three men’s World Cups. As co-host it reached the round of 16, losing to England.',
      es: 'La federación mexicana se fundó en 1927 y México juega los Mundiales desde el primero, en 1930. Fue sede en 1970 y 1986 y llegó a cuartos en ambas ocasiones, y en 2026 fue el primer país en albergar tres Mundiales masculinos. Como coanfitrión llegó a octavos y cayó ante Inglaterra.',
    },
  },
  USA: {
    iso2: 'US', mensRanking: 16, womensRanking: 2, mensTitles: 0, womensTitles: 4, federationFounded: null, wc2026: 'r16',
    famousPlayer: player('Landon Donovan', FW, 'Long the men’s record scorer, remembered for his last-gasp winner against Algeria in 2010.', 'Durante años máximo goleador masculino, recordado por su gol agónico ante Argelia en 2010.'),
    history: {
      en: 'The United States reached the 1930 World Cup semi-finals and hosted the men’s tournament in 1994, which helped launch Major League Soccer. The men reached the quarter-finals in 2002 and the round of 16 again in 2026 as co-hosts. The women’s team is the most successful in history, with four World Cup titles.',
      es: 'Estados Unidos llegó a semifinales del Mundial de 1930 y organizó el torneo masculino de 1994, que ayudó a lanzar la MLS. Los hombres alcanzaron los cuartos en 2002 y los octavos en 2026 como coanfitriones. La selección femenina es la más laureada de la historia, con cuatro Copas del Mundo.',
    },
  },
  PAN: {
    iso2: 'PA', mensRanking: 44, womensRanking: 56, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'group',
    famousPlayer: player('Román Torres', DF, 'His late goal sent Panama to its first World Cup in 2018.', 'Su gol en el último minuto llevó a Panamá a su primer Mundial en 2018.'),
    history: {
      en: 'Panama’s federation was a founding member of CONCACAF in 1961, but the men only reached a World Cup in 2018, when a late goal against Costa Rica clinched a place. It returned in 2026 after strong Gold Cup showings. Panama was eliminated in the group stage.',
      es: 'La federación panameña fue miembro fundador de la CONCACAF en 1961, pero la selección masculina no llegó a un Mundial hasta 2018, cuando un gol tardío ante Costa Rica selló la plaza. Volvió en 2026 tras buenas actuaciones en la Copa Oro. Panamá fue eliminada en la fase de grupos.',
    },
  },
  CUW: {
    iso2: 'CW', mensRanking: 82, womensRanking: 180, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'group',
    famousPlayer: player('Leandro Bacuna', MF, 'A midfielder with English top-flight experience who became a leader of the side.', 'Centrocampista con experiencia en la máxima categoría inglesa, líder del equipo.'),
    history: {
      en: 'Curaçao is a small Dutch-Caribbean island whose players often grew up in the Netherlands, and the team is now built on that diaspora. Its steady rise culminated in a first World Cup place in 2026, making it the smallest nation by population ever to qualify. It lost its group games and went out early.',
      es: 'Curazao es una pequeña isla del Caribe neerlandés cuyos jugadores suelen formarse en los Países Bajos, y su selección se apoya hoy en esa diáspora. Su ascenso constante culminó con la primera plaza mundialista en 2026, y es el país con menor población en clasificar jamás. Cayó en la fase de grupos.',
    },
  },
  HAI: {
    iso2: 'HT', mensRanking: 88, womensRanking: 47, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'group',
    famousPlayer: player('Emmanuel Sanon', FW, 'Scored Haiti’s goals at the 1974 World Cup, including one that ended Italy’s goalkeeper Dino Zoff’s long unbeaten run.', 'Marcó los goles de Haití en el Mundial de 1974, incluido el que acabó con la larga racha de imbatibilidad del italiano Dino Zoff.'),
    history: {
      en: 'Haiti was one of CONCACAF’s early forces and played at the 1974 World Cup, its first. It then waited fifty-two years for a return in 2026. The team was eliminated in the group stage.',
      es: 'Haití fue una de las primeras potencias de la CONCACAF y jugó el Mundial de 1974, el primero de su historia. Después esperó cincuenta y dos años para volver en 2026. El equipo quedó eliminado en la fase de grupos.',
    },
  },

  /* ---------------------- CONMEBOL ---------------------- */
  ARG: {
    iso2: 'AR', mensRanking: 2, womensRanking: 30, mensTitles: 3, womensTitles: 0, federationFounded: null, wc2026: 'runnerUp',
    famousPlayer: player('Lionel Messi', FW, 'Won the 2022 World Cup and eight Ballons d’Or; widely regarded as one of the greatest ever.', 'Ganó el Mundial 2022 y ocho Balones de Oro; considerado uno de los mejores de la historia.'),
    history: {
      en: 'Argentina won the World Cup in 1978, 1986 and 2022, led by Kempes, Maradona and Messi respectively, and has finished runner-up four times, most recently in 2026. Rivalries and a passionate football culture are woven into the national identity. In 2026 the team lost the final 1–0 to Spain after extra time.',
      es: 'Argentina ganó el Mundial en 1978, 1986 y 2022, con Kempes, Maradona y Messi como figuras, y ha sido subcampeona cuatro veces, la última en 2026. La pasión futbolera forma parte de la identidad nacional. En 2026 perdió la final 1-0 ante España en la prórroga.',
    },
  },
  BRA: {
    iso2: 'BR', mensRanking: 5, womensRanking: 7, mensTitles: 5, womensTitles: 0, federationFounded: 1914, wc2026: 'r16',
    famousPlayer: player('Pelé', FW, 'The only player to win three World Cups, symbol of Brazil’s beautiful game.', 'El único jugador con tres Copas del Mundo, símbolo del jogo bonito brasileño.'),
    history: {
      en: 'Brazil’s federation was founded in 1914, and the country is the only one to have played at every World Cup. It has won five titles: 1958, 1962, 1970, 1994 and 2002. Its flair-driven style, shaped by Pelé, Garrincha and later Ronaldo, defines the sport for many. In 2026 it lost to Norway in the round of 16.',
      es: 'La federación brasileña se fundó en 1914 y el país es el único que ha jugado todos los Mundiales. Ha ganado cinco títulos: 1958, 1962, 1970, 1994 y 2002. Su estilo, moldeado por Pelé, Garrincha y más tarde Ronaldo, define el fútbol para muchos. En 2026 cayó ante Noruega en octavos.',
    },
  },
  ECU: {
    iso2: 'EC', mensRanking: 25, womensRanking: 61, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'r32',
    famousPlayer: player('Antonio Valencia', WG, 'A powerful wide player who captained Manchester United.', 'Extremo potente que fue capitán del Manchester United.'),
    history: {
      en: 'Ecuador reached its first World Cup in 2002 and has qualified frequently since, its best result being the last sixteen in 2006. Its altitude-boosted home form in Quito helped the rise. In 2026 it reached the round of 32 before losing to Mexico.',
      es: 'Ecuador llegó a su primer Mundial en 2002 y ha clasificado con frecuencia desde entonces, con los octavos de 2006 como mejor resultado. Su fortaleza como local a gran altitud en Quito ayudó a su ascenso. En 2026 alcanzó los dieciseisavos, donde cayó ante México.',
    },
  },
  PAR: {
    iso2: 'PY', mensRanking: 34, womensRanking: 44, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'r16',
    famousPlayer: player('José Luis Chilavert', GK, 'A goalkeeper famous for scoring from free kicks and penalties.', 'Portero famoso por marcar de tiro libre y de penalti.'),
    history: {
      en: 'Paraguay is a regular World Cup qualifier, reaching its best result, the quarter-finals, in 2010. It is famed for tough defending and a strong Copa América record. In 2026 it beat Germany on penalties in the round of 32 and reached the last sixteen.',
      es: 'Paraguay clasifica con regularidad a los Mundiales, y su mejor resultado son los cuartos de final de 2010. Es célebre por su defensa firme y su buen historial en la Copa América. En 2026 eliminó a Alemania en los penaltis en dieciseisavos y llegó a octavos.',
    },
  },
  URU: {
    iso2: 'UY', mensRanking: 20, womensRanking: 62, mensTitles: 2, womensTitles: 0, federationFounded: 1900, wc2026: 'group',
    famousPlayer: player('Luis Suárez', FW, 'Uruguay’s all-time leading scorer, a fierce competitor in every match.', 'Máximo goleador histórico de Uruguay, competidor feroz en cada partido.'),
    history: {
      en: 'Uruguay’s federation was founded in 1900. As host it won the first World Cup in 1930 and beat Brazil at the Maracanã in 1950 for a second title. It has since played on with a fighting reputation, but in 2026 it went out at the group stage.',
      es: 'La federación uruguaya se fundó en 1900. Como anfitrión ganó el primer Mundial, en 1930, y venció a Brasil en el Maracaná en 1950 para lograr el segundo. Desde entonces ha mantenido su fama de garra, pero en 2026 cayó en la fase de grupos.',
    },
  },
  COL: {
    iso2: 'CO', mensRanking: 11, womensRanking: 20, mensTitles: 0, womensTitles: 0, federationFounded: 1924, wc2026: 'r16',
    famousPlayer: player('James Rodríguez', AM, 'Won the Golden Boot at the 2014 World Cup with a stunning volley against Uruguay.', 'Ganó la Bota de Oro del Mundial 2014 con una volea espectacular ante Uruguay.'),
    history: {
      en: 'Colombia’s federation was founded in 1924. Its best World Cup was 2014, when it reached the quarter-finals. The team also won the Copa América in 2001. In 2026 it reached the last sixteen, where it lost on penalties to Switzerland.',
      es: 'La federación colombiana se fundó en 1924. Su mejor Mundial fue el de 2014, cuando llegó a cuartos de final. También ganó la Copa América en 2001. En 2026 alcanzó los octavos, donde cayó en los penaltis ante Suiza.',
    },
  },

  /* -------------------------- OFC -------------------------- */
  NZL: {
    iso2: 'NZ', mensRanking: 86, womensRanking: 32, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'group',
    famousPlayer: player('Wynton Rufer', FW, 'Named Oceania’s player of the 20th century after a long career at Werder Bremen.', 'Elegido mejor jugador de Oceanía del siglo XX tras una larga carrera en el Werder Bremen.'),
    history: {
      en: 'New Zealand, the All Whites, first played at the World Cup in 1982 and returned in 2010, where it went home unbeaten with three draws. It has long dominated Oceania. In 2026 it took the region’s guaranteed place and again left in the group stage.',
      es: 'Nueva Zelanda, los All Whites, jugó su primer Mundial en 1982 y volvió en 2010, cuando se marchó invicta con tres empates. Domina Oceanía desde hace años. En 2026 ocupó la plaza asegurada de la región y de nuevo cayó en la fase de grupos.',
    },
  },

  /* ------------------------- UEFA ------------------------- */
  ENG: {
    iso2: null, name: { en: 'England', es: 'Inglaterra' }, mensRanking: 4, womensRanking: 4, mensTitles: 1, womensTitles: 0, federationFounded: 1863, wc2026: 'third',
    famousPlayer: player('David Beckham', MF, 'A former captain famous for pinpoint crosses and free kicks, and a global football icon.', 'Excapitán famoso por sus centros y tiros libres precisos, e icono mundial del fútbol.'),
    history: {
      en: 'The Football Association, formed in 1863, is the oldest in the world, and England is often called the birthplace of the modern game. The men won the World Cup once, in 1966 at Wembley. In 2026 England beat France 6–4 in the third-place match after losing a semi-final to Argentina.',
      es: 'La Football Association, creada en 1863, es la más antigua del mundo, e Inglaterra suele considerarse la cuna del fútbol moderno. La selección masculina ganó un Mundial, en 1966 en Wembley. En 2026 Inglaterra venció a Francia 6-4 en el partido por el tercer puesto tras caer en semifinales ante Argentina.',
    },
  },
  FRA: {
    iso2: 'FR', mensRanking: 3, womensRanking: 6, mensTitles: 2, womensTitles: 0, federationFounded: 1919, wc2026: 'fourth',
    famousPlayer: player('Zinedine Zidane', AM, 'Scored twice in the 1998 final and is remembered for his elegant control.', 'Marcó dos goles en la final de 1998 y es recordado por su elegancia con el balón.'),
    history: {
      en: 'The French federation was formed in 1919, and France co-founded FIFA and staged the first European Championship. It won the World Cup on home soil in 1998 and again in 2018, and reached the 2022 final. In 2026 it finished fourth after losing the third-place match.',
      es: 'La federación francesa se formó en 1919, y Francia cofundó la FIFA y organizó la primera Eurocopa. Ganó el Mundial en casa en 1998 y de nuevo en 2018, y llegó a la final de 2022. En 2026 fue cuarta tras perder el partido por el tercer puesto.',
    },
  },
  CRO: {
    iso2: 'HR', mensRanking: 13, womensRanking: 63, mensTitles: 0, womensTitles: 0, federationFounded: 1912, wc2026: 'r32',
    famousPlayer: player('Luka Modrić', MF, 'A 2018 Ballon d’Or winner who led Croatia to the World Cup final that year.', 'Balón de Oro 2018, guio a Croacia hasta la final del Mundial de ese año.'),
    history: {
      en: 'Croatia’s federation was originally formed in 1912. As an independent nation it reached the World Cup semi-finals on its 1998 debut, then the final in 2018 and third place in 2022. In 2026 it lost to Portugal in the round of 32.',
      es: 'La federación croata se formó originalmente en 1912. Como nación independiente llegó a semifinales en su debut de 1998, luego a la final en 2018 y fue tercera en 2022. En 2026 cayó ante Portugal en dieciseisavos.',
    },
  },
  POR: {
    iso2: 'PT', mensRanking: 7, womensRanking: 22, mensTitles: 0, womensTitles: 0, federationFounded: 1914, wc2026: 'r16',
    famousPlayer: player('Cristiano Ronaldo', FW, 'Five-time Ballon d’Or winner and Portugal’s record scorer.', 'Cinco veces Balón de Oro y máximo goleador de Portugal.'),
    history: {
      en: 'Portugal’s federation was formed in 1914. The 1966 side, led by Eusébio, finished third, and the team was a semi-finalist again in 2006. It won the 2016 European Championship. In 2026 it lost 1–0 to Spain in the round of 16.',
      es: 'La federación portuguesa se formó en 1914. El equipo de 1966, liderado por Eusébio, fue tercero y volvió a semifinales en 2006. Ganó la Eurocopa de 2016. En 2026 perdió 1-0 ante España en octavos.',
    },
  },
  NOR: {
    iso2: 'NO', mensRanking: 19, womensRanking: 14, mensTitles: 0, womensTitles: 1, federationFounded: 1902, wc2026: 'qf',
    famousPlayer: player('Erling Haaland', FW, 'A record-breaking striker whose scoring numbers are among the best of his generation.', 'Delantero de récords, con cifras goleadoras entre las mejores de su generación.'),
    history: {
      en: 'The Norwegian federation was formed in 1902. The men reached the last sixteen in 1998, then missed the World Cup for 28 years before returning in 2026, where they reached the quarter-finals. The women’s team won the 1995 World Cup.',
      es: 'La federación noruega se formó en 1902. Los hombres llegaron a octavos en 1998, se perdieron el Mundial durante 28 años y regresaron en 2026, cuando alcanzaron los cuartos de final. La selección femenina ganó el Mundial de 1995.',
    },
  },
  GER: {
    iso2: 'DE', mensRanking: 12, womensRanking: 3, mensTitles: 4, womensTitles: 2, federationFounded: null, wc2026: 'r32',
    famousPlayer: player('Franz Beckenbauer', SW, 'Won the World Cup as captain in 1974 and as coach in 1990.', 'Ganó el Mundial como capitán en 1974 y como entrenador en 1990.'),
    history: {
      en: 'Germany has won four men’s World Cups (1954, 1974, 1990 and 2014) and two women’s titles. The team is famed for consistency, having reached the final or semi-finals many times. In 2026 it lost on penalties to Paraguay in the round of 32.',
      es: 'Alemania ha ganado cuatro Mundiales masculinos (1954, 1974, 1990 y 2014) y dos femeninos. Es famosa por su regularidad y ha llegado muchas veces a finales o semifinales. En 2026 perdió en los penaltis ante Paraguay en dieciseisavos.',
    },
  },
  NED: {
    iso2: 'NL', mensRanking: 9, womensRanking: 10, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'r32',
    famousPlayer: player('Johan Cruyff', FW, 'The face of “Total Football” and a three-time Ballon d’Or winner.', 'Rostro del «fútbol total» y tres veces Balón de Oro.'),
    history: {
      en: 'The Netherlands invented “Total Football” in the 1970s and reached the World Cup final in 1974, 1978 and 2010, without winning. It finished third in 2014. In 2026 it lost on penalties to Morocco in the round of 32.',
      es: 'Países Bajos inventó el «fútbol total» en los años setenta y llegó a la final del Mundial en 1974, 1978 y 2010, sin ganarla. Fue tercero en 2014. En 2026 perdió en los penaltis ante Marruecos en dieciseisavos.',
    },
  },
  SUI: {
    iso2: 'CH', mensRanking: 14, womensRanking: 26, mensTitles: 0, womensTitles: 0, federationFounded: 1895, wc2026: 'qf',
    famousPlayer: player('Granit Xhaka', MF, 'The long-time captain and midfield leader of the national side.', 'Capitán de larga trayectoria y líder del centro del campo de la selección.'),
    history: {
      en: 'The Swiss federation formed in 1895 and was a founding member of FIFA. Switzerland hosted the 1954 World Cup and, after a long wait, has become a reliable knockout-stage side. In 2026 it beat Colombia on penalties to reach the quarter-finals.',
      es: 'La federación suiza se formó en 1895 y fue miembro fundador de la FIFA. Suiza organizó el Mundial de 1954 y, tras una larga espera, se ha convertido en un equipo fiable en las eliminatorias. En 2026 venció a Colombia en los penaltis y llegó a cuartos de final.',
    },
  },
  SCO: {
    iso2: null, name: { en: 'Scotland', es: 'Escocia' }, mensRanking: 42, womensRanking: 25, mensTitles: 0, womensTitles: 0, federationFounded: 1873, wc2026: 'group',
    famousPlayer: player('Denis Law', FW, 'The only Scot to win the Ballon d’Or, in 1964.', 'El único escocés que ha ganado el Balón de Oro, en 1964.'),
    history: {
      en: 'The Scottish FA was formed in 1873 and Scotland played the first international match, a 0–0 draw with England, in 1872. The team has qualified for the World Cup several times but has never advanced beyond the group stage. It returned to the finals in 2026, again going out in the group stage.',
      es: 'La federación escocesa se formó en 1873 y Escocia disputó el primer partido internacional, un 0-0 con Inglaterra, en 1872. El equipo ha clasificado varias veces al Mundial, pero nunca ha pasado de la fase de grupos. Volvió a la fase final en 2026 y de nuevo cayó en la fase de grupos.',
    },
  },
  ESP: {
    iso2: 'ES', mensRanking: 1, womensRanking: 1, mensTitles: 2, womensTitles: 1, federationFounded: 1913, wc2026: 'champion',
    famousPlayer: player('Andrés Iniesta', MF, 'Scored the winning goal in the 2010 World Cup final.', 'Marcó el gol decisivo de la final del Mundial 2010.'),
    history: {
      en: 'The Spanish federation was founded in 1913. After years of near misses, Spain won its first World Cup in 2010 and a second in 2026, beating Argentina 1–0 after extra time in the final. The women’s team won the 2023 World Cup. Spain is currently top of both FIFA rankings.',
      es: 'La federación española se fundó en 1913. Tras años de intentos frustrados, España ganó su primer Mundial en 2010 y el segundo en 2026, al derrotar a Argentina 1-0 en la prórroga de la final. La selección femenina ganó el Mundial de 2023. España encabeza actualmente ambos rankings de la FIFA.',
    },
  },
  AUT: {
    iso2: 'AT', mensRanking: 23, womensRanking: 23, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'r32',
    famousPlayer: player('David Alaba', DF, 'A versatile defender-midfielder, captain and multiple Champions League winner.', 'Defensa y centrocampista polivalente, capitán y varias veces campeón de la Liga de Campeones.'),
    history: {
      en: 'Austria’s “Wunderteam” of the 1930s was one of Europe’s best, and the country finished fourth at the 1934 World Cup and third in 1954. It returned to the finals in 2026 and reached the round of 32, losing 3–0 to Spain.',
      es: 'El «Wunderteam» austriaco de los años treinta fue uno de los mejores de Europa, y el país fue cuarto en el Mundial de 1934 y tercero en 1954. Volvió a la fase final en 2026 y llegó a dieciseisavos, donde perdió 3-0 ante España.',
    },
  },
  BEL: {
    iso2: 'BE', mensRanking: 8, womensRanking: 18, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'qf',
    famousPlayer: player('Kevin De Bruyne', AM, 'A midfield playmaker known for his vision and precise passing.', 'Creador de juego con visión y pases muy precisos.'),
    history: {
      en: 'Belgium was a founding member of FIFA in 1904. Its “golden generation” finished third at the 2018 World Cup, the country’s best result, after fourth place in 1986. In 2026 it reached the quarter-finals, beating the United States 4–1 along the way.',
      es: 'Bélgica fue miembro fundador de la FIFA en 1904. Su «generación dorada» fue tercera en el Mundial de 2018, el mejor resultado del país, tras el cuarto puesto de 1986. En 2026 alcanzó los cuartos de final, con una victoria por 4-1 sobre Estados Unidos.',
    },
  },
  BIH: {
    iso2: 'BA', mensRanking: 61, womensRanking: 70, mensTitles: 0, womensTitles: 0, federationFounded: 1920, wc2026: 'r32',
    famousPlayer: player('Edin Džeko', FW, 'The national team’s record scorer and long-time captain.', 'Máximo goleador histórico de la selección y capitán durante años.'),
    history: {
      en: 'The Bosnian football association dates from 1920, when it began as a sub-association of Yugoslavia. Bosnia and Herzegovina played its first World Cup in 2014. In 2026 it qualified via a playoff and reached the round of 32.',
      es: 'La federación bosnia data de 1920, cuando empezó como subasociación de Yugoslavia. Bosnia y Herzegovina jugó su primer Mundial en 2014. En 2026 clasificó a través de un repechaje y alcanzó los dieciseisavos.',
    },
  },
  SWE: {
    iso2: 'SE', mensRanking: 37, womensRanking: 8, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'r32',
    famousPlayer: player('Zlatan Ibrahimović', FW, 'A larger-than-life striker known for spectacular goals and a big personality.', 'Delantero de personalidad enorme, célebre por sus goles espectaculares.'),
    history: {
      en: 'Sweden hosted the 1958 World Cup and finished as runner-up, its best result, with third place in 1950 and 1994. In 2026 it qualified via a playoff and reached the round of 32, where it lost to France.',
      es: 'Suecia organizó el Mundial de 1958 y fue subcampeona, su mejor resultado, con terceros puestos en 1950 y 1994. En 2026 clasificó a través de un repechaje y alcanzó los dieciseisavos, donde cayó ante Francia.',
    },
  },
  TUR: {
    iso2: 'TR', name: { en: 'Türkiye', es: 'Turquía' }, mensRanking: 27, womensRanking: 46, mensTitles: 0, womensTitles: 0, federationFounded: 1923, wc2026: 'group',
    famousPlayer: player('Hakan Şükür', FW, 'Scored the fastest goal in World Cup history, after 11 seconds in 2002.', 'Marcó el gol más rápido de la historia de los Mundiales, a los 11 segundos, en 2002.'),
    history: {
      en: 'The Turkish federation was formed in 1923 and joined FIFA that same year. Turkey finished third at the 2002 World Cup, its best result. It qualified for 2026 via a playoff but went out in the group stage.',
      es: 'La federación turca se formó en 1923 e ingresó en la FIFA ese mismo año. Turquía fue tercera en el Mundial de 2002, su mejor resultado. Clasificó para 2026 a través de un repechaje, pero cayó en la fase de grupos.',
    },
  },
  CZE: {
    iso2: 'CZ', mensRanking: 48, womensRanking: 33, mensTitles: 0, womensTitles: 0, federationFounded: null, wc2026: 'group',
    famousPlayer: player('Pavel Nedvěd', MF, 'Won the Ballon d’Or in 2003, a tireless midfielder known for his energy.', 'Balón de Oro en 2003, centrocampista incansable conocido por su energía.'),
    history: {
      en: 'As Czechoslovakia, the country reached two World Cup finals, in 1934 and 1962. The Czech Republic later reached the Euro 1996 final. It qualified for 2026 through a playoff but was eliminated in the group stage.',
      es: 'Como Checoslovaquia, el país llegó a dos finales mundialistas, en 1934 y 1962. La República Checa alcanzó después la final de la Eurocopa de 1996. Clasificó para 2026 a través de un repechaje, pero quedó eliminada en la fase de grupos.',
    },
  },
}

export const getConfederation = (id) => CONFEDERATIONS.find((c) => c.id === id)
export const getCountry = (code) => COUNTRIES[code]
export const confederationOf = (code) => CONFEDERATIONS.find((c) => c.teams.includes(code))

/** Flag images live in public/flags (one PNG per team, in varying aspect ratios). */
const FLAG_FILES = {JPN:'japan', IRN:'iran', KOR:'south_korea', AUS:'australia', QAT:'qatar', KSA:'saudi_arabia', UZB:'uzbekistan', JOR:'jordan', IRQ:'iraq', MAR:'morocco', TUN:'tunisia', EGY:'egypt', ALG:'algeria', GHA:'ghana', CPV:'cape_verde', SEN:'senegal', RSA:'south_africa', CIV:'ivory_coast', COD:'dr_congo', CAN:'canada', MEX:'mexico', USA:'united_states', PAN:'panama', CUW:'curacao', HAI:'haiti', ARG:'argentina', BRA:'brazil', ECU:'ecuador', PAR:'paraguay', URU:'uruguay', COL:'colombia', NZL:'new_zealand', ENG:'england', FRA:'france', CRO:'croatia', POR:'portugal', NOR:'norway', GER:'germany', NED:'netherlands', SUI:'switzerland', SCO:'scotland', ESP:'spain', AUT:'austria', BEL:'belgium', BIH:'bosnia_and_herzegovina', SWE:'sweden', TUR:'turkey', CZE:'czech_republic'}

export const flagSrc = (code) => `/flags/${FLAG_FILES[code]}.png`

/**
 * Player photos from Wikimedia Commons, saved in public/players. Every one is
 * openly licensed (CC or public domain); the licence and author are shown under
 * the photo. The Saudi Arabia, DR Congo and Haiti photos were supplied by the
 * project team (no licence line, so no caption).
 */
const PLAYER_PHOTOS = {
  JPN: {
    src: '/players/JPN.jpg',
    author: 'norio nakayama',
    license: 'CC BY-SA 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Hidetoshi_Nakata_in_Okinawa.jpg'
  },
  IRN: {
    src: '/players/IRN.jpg',
    author: 'Mahdi Zare',
    license: 'CC BY 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Ali_Daei%2C_Saipa_vs._Al-Rayyan_pre-match_conference.jpg'
  },
  KOR: {
    src: '/players/KOR.jpg',
    author: 'Ujishadow',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:BFA_2023_-2_Heung-Min_Son_(cropped).jpg'
  },
  AUS: {
    src: '/players/AUS.jpg',
    author: 'Web Summit Qatar',
    license: 'CC BY 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Tim_Cahill_(53557484101).jpg'
  },
  QAT: {
    src: '/players/QAT.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Akram_Afif_Canada_v_Qatar_18_June_2026-114_(cropped).jpg'
  },
  UZB: {
    src: '/players/UZB.jpg',
    author: 'Mohammad Hassanzadeh',
    license: 'CC BY 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Server_Djeparov_playing_for_Esteghlal_against_Tractor_Sazi_02.jpg'
  },
  JOR: {
    src: '/players/JOR.png',
    author: 'Paté kroute',
    license: 'CC0',
    page: 'https://commons.wikimedia.org/wiki/File:Al_taamari_asse_mhsc_2425.png'
  },
  IRQ: {
    src: '/players/IRQ.jpg',
    author: 'Doha Stadium Plus Qatar',
    license: 'CC BY 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Younis_Mahmoud_2012_2.jpg'
  },
  MAR: {
    src: '/players/MAR.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Achraf_Hakimi_Morocco_v_Norway_7_June_2026-16.jpg'
  },
  TUN: {
    src: '/players/TUN.png',
    author: 'Assabah',
    license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Tarak_Dhiab_1980.png'
  },
  EGY: {
    src: '/players/EGY.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Mohamed_Salah_Argentina_v_Egypt_7_July_2026-163_(cropped).jpg'
  },
  ALG: {
    src: '/players/ALG.jpg',
    author: 'Jeanpierrekepseu',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Mahrez_2021.jpg'
  },
  GHA: {
    src: '/players/GHA.jpg',
    author: 'Christophe95',
    license: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Abedi_Pele_2007.jpg'
  },
  CPV: {
    src: '/players/CPV.jpg',
    author: 'Petsbikes',
    license: 'CC BY 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Ryan_Mendes_Fifa_World_Cup_2026_Cabo_Verde_vs_Saudia_Arabia_(cropped).jpg'
  },
  SEN: {
    src: '/players/SEN.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Sadio_Mane_France_v_Senegal_16_June_2026-450.jpg'
  },
  RSA: {
    src: '/players/RSA.jpg',
    author: 'East Ham Bull',
    license: 'CC BY 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:BenniMcCarthy.jpg'
  },
  CIV: {
    src: '/players/CIV.jpg',
    author: 'Y.Leclercq©',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Didier_Drogba_(2019)_(cropped2).jpg'
  },
  CAN: {
    src: '/players/CAN.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Alphonso_Davies_Canada_v_Qatar_18_June_2026-007_(cropped).jpg'
  },
  MEX: {
    src: '/players/MEX.jpg',
    author: 'Wikilast',
    license: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Huguito.jpg'
  },
  USA: {
    src: '/players/USA.jpg',
    author: 'Hameltion',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:NC_Courage_vs_SD_Wave_(Oct_2024)_045.jpg'
  },
  PAN: {
    src: '/players/PAN.jpg',
    author: 'Антон Зайцев',
    license: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Rom%C3%A1n_Torres_2018.jpg'
  },
  CUW: {
    src: '/players/CUW.jpg',
    author: 'Ben Sutherland',
    license: 'CC BY 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Leandro_Bacuna.jpg'
  },
  ARG: {
    src: '/players/ARG.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg'
  },
  BRA: {
    src: '/players/BRA.jpg',
    author: 'Unknown author',
    license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Pele_con_brasil_(cropped).jpg'
  },
  ECU: {
    src: '/players/ECU.jpg',
    author: 'Damian (El Champ)',
    license: 'CC BY 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:AntonioValencia2022.jpg'
  },
  PAR: {
    src: '/players/PAR.jpg',
    author: 'Unknown author',
    license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Chilavert_sanlorenzo.jpg'
  },
  URU: {
    src: '/players/URU.jpg',
    author: 'The White House',
    license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Luis_Su%C3%A1rez_2026_(cropped).jpg'
  },
  COL: {
    src: '/players/COL.jpg',
    author: 'jmmuguerza',
    license: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Argentina_-_Colombia_2022_(28)_(cropped_2).jpg'
  },
  NZL: {
    src: '/players/NZL.jpg',
    author: 'Licht in Sicht',
    license: 'CC BY 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Wynton_rufer_headshot.JPG'
  },
  ENG: {
    src: '/players/ENG.jpg',
    author: 'Soccer Aid for Unicef',
    license: 'CC BY 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:David_Beckham_UNICEF_(cropped2).jpg'
  },
  FRA: {
    src: '/players/FRA.jpg',
    author: 'Hadi Abyar',
    license: 'CC BY 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Zinedine_Zidane_by_Tasnim_03.jpg'
  },
  CRO: {
    src: '/players/CRO.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Luka_Modric_Croatia_v_Portugal_2_July_2026-055.jpg'
  },
  POR: {
    src: '/players/POR.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_(cropped).jpg'
  },
  NOR: {
    src: '/players/NOR.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Erling_Haaland_Morocco_v_Norway_7_June_2026-51.jpg'
  },
  GER: {
    src: '/players/GER.jpg',
    author: 'Panini Group',
    license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Franz_Beckenbauer_(1975).jpg'
  },
  NED: {
    src: '/players/NED.jpg',
    author: 'Rob Mieremet / Anefo',
    license: 'CC0',
    page: 'https://commons.wikimedia.org/wiki/File:Johan_Cruijff_(1974).jpg'
  },
  SUI: {
    src: '/players/SUI.jpg',
    author: '@cfcunofficial (Chelsea Debs) London from London, UK',
    license: 'CC BY-SA 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Granit_Xhaka_(cropped).jpg'
  },
  SCO: {
    src: '/players/SCO.jpg',
    author: 'Danny Molyneux',
    license: 'CC BY 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Denis_Law_(4x5_cropped).jpg'
  },
  ESP: {
    src: '/players/ESP.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Andr%C3%A9s_Iniesta_Argentina_v_Spain_19_July_2026-034_(cropped).jpg'
  },
  AUT: {
    src: '/players/AUT.jpg',
    author: 'Granada',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:20180610_FIFA_Friendly_Match_Austria_vs._Brazil_David_Alaba_850_1632.jpg'
  },
  BEL: {
    src: '/players/BEL.jpg',
    author: 'Bryan Berlin',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_(cropped).jpg'
  },
  BIH: {
    src: '/players/BIH.jpg',
    author: 'Ailura',
    license: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:20150331_2026_AUT_BIH_2177_Edin_D%C5%BEeko_(cropped).jpg'
  },
  SWE: {
    src: '/players/SWE.jpg',
    author: 'Colleen Sturtevant',
    license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Zlatan_Ibrahimovi%C4%87_nyc.jpg'
  },
  TUR: {
    src: '/players/TUR.jpg',
    author: 'Vulkahn at German Wikipedia',
    license: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Hakan.jpg'
  },
  CZE: {
    src: '/players/CZE.jpg',
    author: 'Pavel Lebeda',
    license: 'CC BY-SA 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Pavel_Nedv%C4%9Bd.jpg'
  }
}

Object.assign(PLAYER_PHOTOS, {
  KSA: { src: '/players/KSA.png' },
  COD: { src: '/players/COD.png' },
  HAI: { src: '/players/HAI.png' },
})

for (const [code, photo] of Object.entries(PLAYER_PHOTOS)) COUNTRIES[code].famousPlayer.photo = photo
