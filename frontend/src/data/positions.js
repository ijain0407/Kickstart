/* ============================================================
   POSITION LIBRARY
   One entry per position code used by any formation. Every
   string is an { en, es } pair so the two languages sit side by
   side and stay in sync. Resolve with tr() from useI18n().
   ============================================================ */

export const POSITIONS = {
  GK: {
    name: { en: 'Goalkeeper', es: 'Portero' },
    unit: { en: 'Last Line / Shot Stopper', es: 'Última línea / Parador de tiros' },
    duties: [
      {
        en: 'Stop shots and command the six-yard box on crosses and set pieces.',
        es: 'Detener los remates y mandar en el área pequeña en centros y balones parados.',
      },
      {
        en: 'Sweep in behind a high defensive line to clear through balls early.',
        es: 'Salir a barrer detrás de una línea adelantada para cortar los pases filtrados a tiempo.',
      },
      {
        en: 'Start attacks with the feet — short to a centre back or long over the press.',
        es: 'Iniciar el ataque con los pies: en corto al central o en largo por encima de la presión.',
      },
    ],
    famous: 'Alisson Becker, Manuel Neuer, Thibaut Courtois',
  },

  RB: {
    name: { en: 'Right Back', es: 'Lateral derecho' },
    unit: { en: 'Defense / Wide Transition', es: 'Defensa / Transición por banda' },
    duties: [
      {
        en: 'Defend the opposing left winger and protect the flank.',
        es: 'Defender al extremo izquierdo rival y proteger la banda.',
      },
      {
        en: 'Overlap on counter-attacks to deliver crosses into the penalty box.',
        es: 'Desdoblarse en los contraataques para meter centros al área.',
      },
      {
        en: 'Maintain the offside trap line with the central defenders.',
        es: 'Mantener la línea del fuera de juego junto a los centrales.',
      },
    ],
    famous: 'Kyle Walker, Trent Alexander-Arnold, Dani Carvajal',
  },

  LB: {
    name: { en: 'Left Back', es: 'Lateral izquierdo' },
    unit: { en: 'Defense / Wide Transition', es: 'Defensa / Transición por banda' },
    duties: [
      {
        en: 'Lock down the opposing right winger one-on-one along the touchline.',
        es: 'Frenar al extremo derecho rival en el uno contra uno junto a la línea de banda.',
      },
      {
        en: 'Push high to stretch the pitch and give the midfield a wide passing outlet.',
        es: 'Subir para ensanchar el campo y dar al mediocampo una salida por fuera.',
      },
      {
        en: 'Tuck inside as a third centre back when the team builds from the back.',
        es: 'Meterse por dentro como tercer central cuando el equipo sale jugando desde atrás.',
      },
    ],
    famous: 'Andrew Robertson, Theo Hernández, Alphonso Davies',
  },

  CB: {
    name: { en: 'Centre Back', es: 'Defensa central' },
    unit: { en: 'Defense / Central Shield', es: 'Defensa / Escudo central' },
    duties: [
      {
        en: 'Win aerial duels and block the direct route to goal.',
        es: 'Ganar los duelos aéreos y tapar el camino directo a la portería.',
      },
      {
        en: 'Set and hold the defensive line so the offside trap springs together.',
        es: 'Fijar y sostener la línea defensiva para que la trampa del fuera de juego funcione.',
      },
      {
        en: 'Break the first line of pressure with a forward pass into midfield.',
        es: 'Romper la primera línea de presión con un pase hacia el mediocampo.',
      },
    ],
    famous: 'Virgil van Dijk, Rúben Dias, Antonio Rüdiger',
  },

  CDM: {
    name: { en: 'Defensive Midfielder', es: 'Mediocentro defensivo' },
    unit: { en: 'Midfield / Screen & Recycle', es: 'Mediocampo / Filtro y circulación' },
    duties: [
      {
        en: 'Screen the space in front of the back four and cut off passes into the striker.',
        es: 'Tapar el espacio delante de la defensa y cortar los pases al delantero.',
      },
      {
        en: 'Recycle possession quickly so the team keeps its shape while attacking.',
        es: 'Hacer circular el balón rápido para que el equipo mantenga su forma al atacar.',
      },
      {
        en: 'Cover for a full back who has pushed forward, sliding across to fill the gap.',
        es: 'Cubrir al lateral que se ha incorporado, desplazándose para tapar el hueco.',
      },
    ],
    famous: 'Rodri, Casemiro, Joshua Kimmich',
  },

  CM: {
    name: { en: 'Central Midfielder', es: 'Mediocentro' },
    unit: { en: 'Midfield / Box-to-Box Engine', es: 'Mediocampo / Motor de área a área' },
    duties: [
      {
        en: 'Link defence to attack, covering ground in both penalty boxes.',
        es: 'Unir defensa y ataque, pisando las dos áreas.',
      },
      {
        en: 'Find passing triangles to beat the press and turn the play.',
        es: 'Buscar triángulos de pase para superar la presión y cambiar la orientación del juego.',
      },
      {
        en: 'Press the opposition midfield and win the ball back within six seconds of losing it.',
        es: 'Presionar al mediocampo rival y recuperar el balón en los seis segundos tras perderlo.',
      },
    ],
    famous: 'Jude Bellingham, Federico Valverde, Toni Kroos',
  },

  CAM: {
    name: { en: 'Attacking Midfielder', es: 'Mediapunta' },
    unit: { en: 'Attack / Creator', es: 'Ataque / Creador' },
    duties: [
      {
        en: 'Find and occupy the pocket of space between midfield and defence.',
        es: 'Encontrar y ocupar el espacio entre líneas, entre el mediocampo y la defensa.',
      },
      {
        en: 'Play the final pass that cuts the defensive line open.',
        es: 'Dar el último pase que rompe la línea defensiva.',
      },
      {
        en: 'Arrive late into the box to attack cutbacks and second balls.',
        es: 'Llegar desde atrás al área para rematar pases atrás y segundas jugadas.',
      },
    ],
    famous: 'Kevin De Bruyne, Martin Ødegaard, Bruno Fernandes',
  },

  LW: {
    name: { en: 'Left Winger', es: 'Extremo izquierdo' },
    unit: { en: 'Attack / Wide Threat', es: 'Ataque / Amenaza por banda' },
    duties: [
      {
        en: 'Hold the touchline to stretch the defence, then attack the full back one-on-one.',
        es: 'Abrirse a la banda para estirar la defensa y luego encarar al lateral en el uno contra uno.',
      },
      {
        en: 'Cut inside onto the stronger foot to shoot from the angle of the box.',
        es: 'Entrar hacia dentro con su pierna buena para rematar desde la esquina del área.',
      },
      {
        en: 'Press the opposing full back to force a rushed clearance.',
        es: 'Presionar al lateral rival para forzar un despeje apresurado.',
      },
    ],
    famous: 'Vinícius Júnior, Rafael Leão, Mohamed Salah',
  },

  RW: {
    name: { en: 'Right Winger', es: 'Extremo derecho' },
    unit: { en: 'Attack / Wide Threat', es: 'Ataque / Amenaza por banda' },
    duties: [
      {
        en: 'Beat the left back on the outside and whip an early cross to the far post.',
        es: 'Superar al lateral izquierdo por fuera y colgar un centro temprano al segundo palo.',
      },
      {
        en: 'Time runs off the last defender to stay onside as the pass is played.',
        es: 'Medir los desmarques a espaldas del último defensa para no caer en fuera de juego.',
      },
      {
        en: 'Drift into the half-space to combine with the attacking midfielder.',
        es: 'Moverse al pasillo interior para combinar con la mediapunta.',
      },
    ],
    famous: 'Bukayo Saka, Lamine Yamal, Phil Foden',
  },

  ST: {
    name: { en: 'Striker', es: 'Delantero centro' },
    unit: { en: 'Attack / Finisher', es: 'Ataque / Definidor' },
    duties: [
      {
        en: 'Finish chances first time inside the six-yard box.',
        es: 'Definir al primer toque dentro del área pequeña.',
      },
      {
        en: 'Pin the centre backs so midfielders can run into the space behind them.',
        es: 'Fijar a los centrales para que los mediocampistas puedan aparecer en el espacio que dejan.',
      },
      {
        en: 'Lead the press from the front and steer the defence toward one side.',
        es: 'Iniciar la presión desde arriba y orientar a la defensa hacia un solo lado.',
      },
    ],
    famous: 'Erling Haaland, Kylian Mbappé, Harry Kane',
  },

  SS: {
    name: { en: 'Second Striker', es: 'Segundo delantero' },
    unit: { en: 'Attack / Support Forward', es: 'Ataque / Delantero de apoyo' },
    duties: [
      {
        en: 'Play off the shoulder of the main striker and feed on knock-downs.',
        es: 'Jugar al costado del delantero centro y aprovechar sus descargas.',
      },
      {
        en: 'Drop between the lines to receive facing forward and drive at the defence.',
        es: 'Caer entre líneas para recibir de cara y encarar a la defensa.',
      },
      {
        en: 'Attack the near post on crosses while the striker holds the far post.',
        es: 'Atacar el primer palo en los centros mientras el delantero fija el segundo.',
      },
    ],
    famous: 'Lautaro Martínez, Antoine Griezmann, Paulo Dybala',
  },

  LM: {
    name: { en: 'Left Midfielder', es: 'Interior izquierdo' },
    unit: { en: 'Midfield / Wide Worker', es: 'Mediocampo / Trabajo por banda' },
    duties: [
      {
        en: 'Track the opposing right back all the way to the corner flag.',
        es: 'Seguir al lateral derecho rival hasta el banderín de córner.',
      },
      {
        en: 'Supply crosses from deep when the full back cannot join the attack.',
        es: 'Poner centros desde atrás cuando el lateral no puede sumarse al ataque.',
      },
      {
        en: 'Hold a compact flat four in midfield when the team drops into a mid-block.',
        es: 'Mantener una línea de cuatro compacta en el mediocampo cuando el equipo forma bloque medio.',
      },
    ],
    famous: 'Jack Grealish, Cody Gakpo, Nicolò Barella',
  },

  RM: {
    name: { en: 'Right Midfielder', es: 'Interior derecho' },
    unit: { en: 'Midfield / Wide Worker', es: 'Mediocampo / Trabajo por banda' },
    duties: [
      {
        en: 'Double up with the right back to trap the winger against the touchline.',
        es: 'Doblar con el lateral derecho para atrapar al extremo contra la banda.',
      },
      {
        en: 'Switch play with a long diagonal to the opposite flank.',
        es: 'Cambiar el juego con una diagonal larga a la banda contraria.',
      },
      {
        en: 'Get to the byline and pull the ball back for arriving runners.',
        es: 'Llegar a la línea de fondo y tirar el pase atrás para los que llegan.',
      },
    ],
    famous: 'Bernardo Silva, Dominik Szoboszlai, Federico Chiesa',
  },

  LWB: {
    name: { en: 'Left Wing Back', es: 'Carrilero izquierdo' },
    unit: { en: 'Wing Back / Full-Flank Runner', es: 'Carrilero / Recorredor de banda' },
    duties: [
      {
        en: 'Run the whole left flank — a defender out of possession, a winger in it.',
        es: 'Recorrer toda la banda izquierda: defensa sin balón, extremo con balón.',
      },
      {
        en: 'Drop into a back five when the opposition attacks down that side.',
        es: 'Caer a una línea de cinco cuando el rival ataca por ese costado.',
      },
      {
        en: 'Stretch the pitch high and wide so the strikers get one-on-one space inside.',
        es: 'Estirar el campo por fuera y arriba para que los delanteros tengan espacio por dentro.',
      },
    ],
    famous: 'Federico Dimarco, Destiny Udogie, Marcos Alonso',
  },

  RWB: {
    name: { en: 'Right Wing Back', es: 'Carrilero derecho' },
    unit: { en: 'Wing Back / Full-Flank Runner', es: 'Carrilero / Recorredor de banda' },
    duties: [
      {
        en: 'Cover the entire right channel from your own corner flag to theirs.',
        es: 'Cubrir todo el carril derecho de banderín a banderín.',
      },
      {
        en: 'Deliver crosses at speed before the defence can reset its shape.',
        es: 'Centrar en velocidad antes de que la defensa recupere su forma.',
      },
      {
        en: 'Form a back five with the three centre backs in the defensive phase.',
        es: 'Formar una línea de cinco con los tres centrales en la fase defensiva.',
      },
    ],
    famous: 'Denzel Dumfries, Reece James, Achraf Hakimi',
  },
}

export function getPosition(code) {
  return POSITIONS[code] ?? POSITIONS.CM
}
