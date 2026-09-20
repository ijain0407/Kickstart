/* ============================================================
   FORMATIONS
   Coordinates are percentages of the pitch box: `top` runs from
   0 (opposition goal, at the top) to 100 (own goal), `left` from
   0 to 100 across the width. They are transcribed exactly from
   the source screens — do not round them.
   ============================================================ */

export const FORMATIONS = [
  {
    id: '433',
    label: '4-3-3',
    players: [
      { num: 1, code: 'GK', top: 89, left: 50 },
      { num: 3, code: 'LB', top: 75, left: 16 },
      { num: 4, code: 'CB', top: 76, left: 38 },
      { num: 5, code: 'CB', top: 76, left: 62 },
      { num: 2, code: 'RB', top: 73, left: 84 },
      { num: 6, code: 'CDM', top: 57, left: 50 },
      { num: 8, code: 'CM', top: 45, left: 32 },
      { num: 10, code: 'CAM', top: 43, left: 68 },
      { num: 11, code: 'LW', top: 24, left: 18 },
      { num: 9, code: 'ST', top: 18, left: 50 },
      { num: 7, code: 'RW', top: 24, left: 82 },
    ],
  },
  {
    id: '442',
    label: '4-4-2',
    players: [
      { num: 1, code: 'GK', top: 89, left: 50 },
      { num: 3, code: 'LB', top: 75, left: 16 },
      { num: 4, code: 'CB', top: 76, left: 38 },
      { num: 5, code: 'CB', top: 76, left: 62 },
      { num: 2, code: 'RB', top: 75, left: 84 },
      { num: 11, code: 'LM', top: 48, left: 15 },
      { num: 6, code: 'CM', top: 52, left: 38 },
      { num: 8, code: 'CM', top: 52, left: 62 },
      { num: 7, code: 'RM', top: 48, left: 85 },
      { num: 10, code: 'SS', top: 24, left: 38 },
      { num: 9, code: 'ST', top: 22, left: 62 },
    ],
  },
  {
    id: '352',
    label: '3-5-2',
    players: [
      { num: 1, code: 'GK', top: 89, left: 50 },
      { num: 3, code: 'CB', top: 77, left: 26 },
      { num: 4, code: 'CB', top: 79, left: 50 },
      { num: 5, code: 'CB', top: 77, left: 74 },
      { num: 11, code: 'LWB', top: 50, left: 12 },
      { num: 6, code: 'CM', top: 58, left: 40 },
      { num: 8, code: 'CM', top: 58, left: 60 },
      { num: 2, code: 'RWB', top: 50, left: 88 },
      { num: 10, code: 'CAM', top: 38, left: 50 },
      { num: 7, code: 'ST', top: 22, left: 36 },
      { num: 9, code: 'ST', top: 22, left: 64 },
    ],
  },
  {
    id: '4231',
    label: '4-2-3-1',
    players: [
      { num: 1, code: 'GK', top: 89, left: 50 },
      { num: 3, code: 'LB', top: 76, left: 16 },
      { num: 4, code: 'CB', top: 77, left: 38 },
      { num: 5, code: 'CB', top: 77, left: 62 },
      { num: 2, code: 'RB', top: 76, left: 84 },
      { num: 6, code: 'CDM', top: 62, left: 36 },
      { num: 8, code: 'CDM', top: 62, left: 64 },
      { num: 11, code: 'LW', top: 38, left: 18 },
      { num: 10, code: 'CAM', top: 38, left: 50 },
      { num: 7, code: 'RW', top: 38, left: 82 },
      { num: 9, code: 'ST', top: 18, left: 50 },
    ],
  },
]

/** Squad surnames keyed by shirt number, shown when "Names" is ON. */
/**
 * Names on the shirts. Players a beginner will actually recognise, chosen so
 * the number and the role agree the way they traditionally do — the 9 is a
 * striker, the 7 and 11 are wide, the 10 creates, the 6 screens the defence.
 *
 * They're keyed by shirt number rather than position because the same number
 * plays a different role in each formation (in 3-5-2 the 7 is a second
 * striker; in 4-3-3 it's the right winger), and these names read sensibly in
 * all three. Illustrative examples only — no club affiliation implied.
 */
export const SQUAD_NAMES = {
  1: 'Alisson',
  2: 'Trent',
  3: 'Davies',
  4: 'Van Dijk',
  5: 'Dias',
  6: 'Rodri',
  7: 'Ronaldo',
  8: 'Bellingham',
  9: 'Haaland',
  10: 'De Bruyne',
  11: 'Messi',
}

export function getFormation(id) {
  return FORMATIONS.find((f) => f.id === id) ?? FORMATIONS[0]
}

/**
 * The offside line sits level with the second-to-last defender of the
 * defending side. Here it tracks the deepest attacking line so the
 * overlay moves sensibly when the formation changes.
 */
export function offsideLineTop(players) {
  const attackers = players
    .filter((p) => p.code !== 'GK')
    .map((p) => p.top)
    .sort((a, b) => a - b)
  const front = attackers[0] ?? 20
  return Math.max(10, front - 4)
}
