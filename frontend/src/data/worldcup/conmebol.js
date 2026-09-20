const W = 'https://upload.wikimedia.org/wikipedia/commons/'

export default [
  {
    id: 'brazil', name: 'Brazil', code: 'br', confederation: 'CONMEBOL',
    ranking: 5, rankingAsOf: '2026-07',
    titles: [1958, 1962, 1970, 1994, 2002], appearances: 23, bestFinish: 'Champions (5x)',
    history: [
      'Brazil is the only nation to play in every World Cup. Football arrived with Charles Miller in the 1890s and became a national identity, with the joga bonito style tying skill and joy together.',
      'The Seleção won its first title in 1958 with a 17-year-old Pelé, added 1962 and 1970 (often called the greatest team ever), then waited until 1994 and 2002 for titles four and five.',
    ],
    players: [
      { name: 'Pelé', note: 'Three-time World Cup winner and the face of the 1970 team.' },
      { name: 'Garrincha', note: 'The wing wizard who led the 1962 win.' },
      { name: 'Ronaldo Nazário', note: 'Scored 15 World Cup goals and starred in 2002.' },
      { name: 'Ronaldinho', note: 'Magician of the 2002 winners.' },
      { name: 'Neymar', note: "Brazil's all-time leading scorer." },
    ],
    chants: [
      { title: 'Eu sou brasileiro, com muito orgulho', text: 'I am Brazilian, with great pride', note: 'A stadium staple sung with drums and samba rhythm.' },
      { title: 'Olê, olê, olê, Seleção', text: 'Olé, olé, olé, Seleção', note: 'Fans sing it as the team walks out.' },
    ],
    gallery: [
      { url: W + '5/5e/Brazil_national_team_1970.jpg', caption: 'The Brazil team of 1970', credit: 'El Gráfico, public domain' },
      { url: W + '5/5e/Pel%C3%A9_goal_1958_WC_final.jpg', caption: 'Pelé scoring in the 1958 final', credit: 'Scanpix, public domain' },
      { url: W + 'd/de/Brasil_-_1958.jpg', caption: 'Brazil at the 1958 World Cup', credit: 'Scanpix, public domain' },
      { url: W + 'b/b9/Maracan%C3%A3_Stadium_Panorama.jpg', caption: 'Maracanã Stadium in Rio', credit: 'ianjvoos, CC0' },
      { url: W + '9/94/Brazilian_Football_Fans.jpg', caption: 'Brazilian fans', credit: 'Klafubra, CC BY-SA 3.0' },
    ],
  },
  {
    id: 'argentina', name: 'Argentina', code: 'ar', confederation: 'CONMEBOL',
    ranking: 2, rankingAsOf: '2026-07',
    titles: [1978, 1986, 2022], appearances: 19, bestFinish: 'Champions (3x)',
    history: [
      'Argentina played in the very first World Cup in 1930, losing the final to Uruguay. Football came with British railway workers and grew into a national obsession in Buenos Aires and Rosario.',
      'La Albiceleste won on home soil in 1978, then in 1986 behind Diego Maradona, and finally in 2022 when Lionel Messi lifted the trophy after a penalty shootout with France. Argentina reached the 2026 final, losing to Spain 1-0 after extra time.',
    ],
    players: [
      { name: 'Diego Maradona', note: 'Captain and inspiration of the 1986 winners, famous for the Hand of God and his solo goal against England.' },
      { name: 'Mario Kempes', note: 'Top scorer of the 1978 tournament on home soil.' },
      { name: 'Lionel Messi', note: 'Won the Golden Ball at the 2014 and 2022 World Cups.' },
      { name: 'Gabriel Batistuta', note: 'A prolific striker in the 1990s and one of the best World Cup finishers.' },
    ],
    chants: [
      { title: 'Muchachos, ahora nos volvimos a ilusionar', text: 'Boys, now we have dreamed again', note: 'The song of the 2022 title run, sung to a Creedence Clearwater Revival tune.' },
      { title: 'Vamos, vamos, Argentina', text: "Let's go, let's go, Argentina", note: 'A classic terrace chant with drums and horns.' },
    ],
    gallery: [
      { url: W + '8/88/Argentina_National_Football_Team_1978.jpg', caption: 'Argentina, 1978 World Cup winners', credit: 'Assabah, public domain' },
      { url: W + '3/35/Argentina_national_football_team_1977.jpg', caption: 'Argentina team in 1977', credit: 'ALbayan, public domain' },
      { url: W + '0/0a/Argentina_national_football_team_-_1_-_2022.jpg', caption: 'Argentina squad in 2022', credit: 'Argentina.gob.ar, CC BY 4.0' },
      { url: W + '9/95/Argentina_Starting_XI_Argentina_v_Egypt_7_July_2026-118.jpg', caption: 'Argentina starting eleven at the 2026 World Cup', credit: 'Bryan Berlin, CC BY-SA 4.0' },
    ],
  },
  {
    id: 'uruguay', name: 'Uruguay', code: 'uy', confederation: 'CONMEBOL',
    ranking: 20, rankingAsOf: '2026-07',
    titles: [1930, 1950], appearances: 15, bestFinish: 'Champions (2x)',
    history: [
      'Uruguay hosted and won the first World Cup in 1930, beating Argentina 4-2 in Montevideo. A country of only a few million people, it had already won Olympic gold in 1924 and 1928.',
      'In 1950 Uruguay stunned Brazil 2-1 at the Maracanã in the match known as the Maracanazo, clinching a second title. La Celeste later reached the semi-finals in 2010.',
    ],
    players: [
      { name: 'José Nasazzi', note: 'Captain of the 1930 winners.' },
      { name: 'Obdulio Varela', note: 'Captain and heart of the 1950 Maracanazo team.' },
      { name: 'Enzo Francescoli', note: 'Elegant playmaker of the 1980s and 1990s.' },
      { name: 'Diego Forlán', note: 'Golden Ball winner at the 2010 World Cup.' },
      { name: 'Luis Suárez', note: "Uruguay's all-time leading scorer." },
    ],
    chants: [
      { title: 'Uruguayo, uruguayo', text: 'Uruguayan, Uruguayan', note: 'Short drum-driven chant heard across the stands.' },
      { title: 'Garra charrúa', text: 'Charrúa grit', note: 'Not a song but a rallying cry for the fighting spirit of the national team.' },
    ],
    gallery: [
      { url: W + '3/39/2022_FIFA_World_Cup_Korea_Uruguay_02.jpg', caption: 'Uruguay at the 2022 World Cup', credit: 'Republic of Korea, CC BY-SA 2.0' },
      { url: W + 'e/e5/FIFA_World_Cup_2010_Netherlands_Uruguay_6.jpg', caption: 'Uruguay at the 2010 World Cup', credit: 'Jimmy Baikovicius, CC BY-SA 2.0' },
      { url: W + '6/60/Uruguay_-_Costa_Rica_FIFA_World_Cup_2014_%2814%29.jpg', caption: 'Uruguay versus Costa Rica, 2014', credit: 'Danilo Borges/Portal da Copa, CC BY 3.0 br' },
      { url: W + '1/14/Eliminatorias_Uruguay-Colombia_2021.jpg', caption: 'Uruguay versus Colombia in qualifying', credit: 'Tinchocndef, CC BY-SA 4.0' },
    ],
  },
  {
    id: 'colombia', name: 'Colombia', code: 'co', confederation: 'CONMEBOL',
    ranking: 11, rankingAsOf: '2026-07',
    titles: [], appearances: 7, bestFinish: 'Quarter-finals (2014)',
    history: [
      'Colombia first played at the 1962 World Cup, then had a golden generation in the 1990s with Carlos Valderrama and Faustino Asprilla.',
      'At Brazil 2014 Colombia reached the quarter-finals, its best result, led by James Rodríguez, who won the Golden Boot with six goals.',
    ],
    players: [
      { name: 'Carlos Valderrama', note: 'Curly-haired playmaker who captained the 1990s team.' },
      { name: 'Faustino Asprilla', note: 'Explosive forward of the 1990s.' },
      { name: 'Radamel Falcao', note: "One of Colombia's top scorers of all time." },
      { name: 'James Rodríguez', note: 'Golden Boot winner at the 2014 World Cup.' },
    ],
    chants: [
      { title: 'Colombia, Colombia', text: 'Colombia, Colombia', note: 'Fans in yellow shirts chant the name with clapping and trumpets.' },
      { title: 'Sí se puede', text: 'Yes we can', note: 'A common rallying call in the stands.' },
    ],
    gallery: [
      { url: W + '2/28/Colombia_national_football_team_in_1985.jpg', caption: 'Colombia team in 1985', credit: 'Unknown author, public domain' },
      { url: W + 'a/a8/Colombia_vs_England.jpg', caption: 'Colombia versus England', credit: 'Sarah Q, CC BY-SA 2.0' },
      { url: W + 'a/a5/Selecci%C3%B3n_de_f%C3%BAtbol_de_Colombia_en_Brasil_2014.jpg', caption: 'Colombia in Brazil, 2014', credit: 'Darthvader2, CC BY-SA 4.0' },
      { url: W + '2/24/Colombia_vs_Brasil.jpg', caption: 'Colombia versus Brazil', credit: 'Luis Angel Camargo, CC BY-SA 2.0' },
    ],
  },
  {
    id: 'ecuador', name: 'Ecuador', code: 'ec', confederation: 'CONMEBOL',
    ranking: 25, rankingAsOf: '2026-07',
    titles: [], appearances: 5, bestFinish: 'Round of 16 (2006)',
    history: [
      'Ecuador made its World Cup debut in 2002 after qualifying ahead of Brazil and Uruguay. High-altitude games in Quito have long made it a tough place to visit.',
      'In 2006 La Tri reached the round of 16, its best result. At the 2026 World Cup Ecuador beat Germany 2-1 in the group stage before losing to Mexico in the round of 32.',
    ],
    players: [
      { name: 'Iván Hurtado', note: "Ecuador's most-capped player with 168 caps." },
      { name: 'Agustín Delgado', note: 'Scored the first World Cup goal in Ecuadorian history in 2002.' },
      { name: 'Enner Valencia', note: "Ecuador's all-time top scorer with 49 goals." },
      { name: 'Moisés Caicedo', note: 'Midfield engine and captain of the 2026 team.' },
    ],
    chants: [
      { title: 'Sí se puede', text: 'Yes we can', note: 'Fans in yellow use this call as the team pushes forward.' },
      { title: 'Ecuador, Ecuador', text: 'Ecuador, Ecuador', note: 'A simple drum-backed chant of the national name.' },
    ],
    gallery: [
      { url: W + '8/87/FIFA_World_Cup_2006_-_ENG_vs_ECU.jpg', caption: 'Ecuador versus England, 2006 World Cup', credit: 'georgio, CC BY 2.0' },
      { url: W + '5/57/Ecudaor_World_Cup_Roster_Cote_D%27Ivoire_v_Ecuador_14_June_2026-97.jpg', caption: 'Ecuador at the 2026 World Cup', credit: 'Bryan Berlin, CC BY-SA 4.0' },
      { url: W + 'f/f3/Ecudaor_World_Cup_Roster_Cote_D%27Ivoire_v_Ecuador_14_June_2026-98.jpg', caption: 'Ecuador squad, June 2026', credit: 'Bryan Berlin, CC BY-SA 4.0' },
      { url: W + '4/4e/Cote_D%27Ivoire_v_Ecuador_14_June_2026-114.jpg', caption: 'Ivory Coast versus Ecuador, 2026', credit: 'Bryan Berlin, CC BY-SA 4.0' },
    ],
  },
  {
    id: 'paraguay', name: 'Paraguay', code: 'py', confederation: 'CONMEBOL',
    ranking: 34, rankingAsOf: '2026-07',
    titles: [], appearances: 9, bestFinish: 'Quarter-finals (2010)',
    history: [
      'Paraguay played at the first World Cup in 1930 and returned in 1950, 1958 and 1986. In the late 1990s and 2000s La Albirroja qualified four times in a row, built on tough defending and goalkeeper José Luis Chilavert.',
      'The team reached the quarter-finals in 2010 and returned to the World Cup in 2026 after a 16-year absence, beating Turkey in the group stage.',
    ],
    players: [
      { name: 'José Luis Chilavert', note: 'Goalkeeper famous for scoring free kicks and penalties.' },
      { name: 'Roque Santa Cruz', note: "Paraguay's all-time top scorer with 32 goals." },
      { name: 'Paulo da Silva', note: 'Most-capped Paraguayan with 148 matches.' },
      { name: 'Denis Caniza', note: 'Only Paraguayan to play in four consecutive World Cups (1998 to 2010).' },
    ],
    chants: [
      { title: 'Vamos, Paraguay', text: "Let's go, Paraguay", note: 'Red and white fans sing it with drums.' },
      { title: 'Y dale Albirroja', text: 'Come on, Albirroja', note: 'A common cheer using the national nickname.' },
    ],
    gallery: [
      { url: W + '6/6e/Paraguay_1929.JPG', caption: 'Paraguay team in 1929', credit: 'Unknown author, public domain' },
      { url: W + 'c/cd/Paraguay_en_el_Sudamericano_1953%2C_Estadio%2C_1953-04-25_%28519%29.jpg', caption: 'Paraguay at the 1953 South American Championship', credit: 'Unknown author, public domain' },
      { url: W + '2/27/Brazil_vs_Paraguay%2C_2019_Copa_America_quarterfinal.png', caption: 'Brazil versus Paraguay, 2019 Copa America', credit: 'Paninigenie, CC BY-SA 4.0' },
      { url: W + '0/0c/Moroccan_national_team_vs_Paraguay.jpg_%28cropped%29.jpg', caption: 'Morocco versus Paraguay', credit: 'Abdelali Bentarki, CC BY-SA 4.0' },
    ],
  },
]
