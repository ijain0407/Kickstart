/* ============================================================
   ADAPTERS
   The APIs and this design system were built in parallel, so each
   adapter maps one API payload onto the shape a component here
   already expects. Keeping the mapping in one file means the
   pages stay presentational and nobody's backend had to change.
   ============================================================ */

/* ---- Leagues & culture (Person C) ---- */

/**
 * Card gradients. Deliberately generic competition colours, not club
 * branding — the project ships no crests, logos or licensed imagery.
 */
const LEAGUE_PALETTE = {
  'league-premier-league': { a: '#7c3aed', b: '#2e1065' },
  'league-la-liga': { a: '#dc2626', b: '#7f1d1d' },
  'league-bundesliga': { a: '#dc2626', b: '#18181b' },
  'league-serie-a': { a: '#1d4ed8', b: '#172554' },
  'league-mls': { a: '#0f766e', b: '#134e4a' },
}

const DEFAULT_PALETTE = { a: '#334155', b: '#0f172a' }

export const paletteFor = (leagueId) => LEAGUE_PALETTE[leagueId] ?? DEFAULT_PALETTE

/** Text-only stand-in for a crest: the club's initials, up to three letters. */
export function initialsFor(clubName = '') {
  const words = clubName.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(Boolean)
  const letters = words.length === 1 ? words[0].slice(0, 3) : words.map((w) => w[0]).join('')
  return letters.slice(0, 3).toUpperCase()
}

/** Culture cards that have a logo file in public/crests (culture-<id>.png). */
const LOGOS = new Set([
  'culture-liverpool',
  'culture-manchester-united',
  'culture-arsenal',
  'culture-real-madrid',
  'culture-fc-barcelona',
  'culture-atletico-madrid',
  'culture-bayern-munich',
  'culture-borussia-dortmund',
  'culture-juventus',
  'culture-inter-milan',
  'culture-ac-milan',
  'culture-seattle-sounders',
  'culture-portland-timbers',
  'culture-manchester-city',
  'culture-chelsea',
  'culture-tottenham',
  'culture-west-ham',
  'culture-newcastle',
  'culture-sunderland',
  'culture-brighton',
  'culture-nottingham-forest',
  'culture-crystal-palace',
  'culture-leeds',
  'culture-marseille',
  'culture-psg',
])

/**
 * A culture card -> the ClubHero shape.
 * `labels` carries the few chrome strings the page translates itself.
 */
export function toClubHero(card, { leagueId, labels }) {
  const kit = card.kit ?? null

  // `literal` arrives already localized to the current language; `original`
  // never translates (the three-layer format's whole point). For a club
  // whose nickname originated in the UI's own language — an English-origin
  // club viewed in English, a Spanish-origin one viewed in Spanish — the two
  // are the same string, so only one tag is shown instead of a duplicate.
  // The (localized, so most legible) literal name leads; the original only
  // gets its own tag when it actually adds something.
  const { original, literal } = card.nickname
  const nicknameTags =
    literal === original.text
      ? [{ label: literal, tone: 'gold' }]
      : [
          { label: literal, tone: 'gold' },
          { label: original.text, tone: 'white' },
        ]

  return {
    name: card.club,
    region: card.city.toUpperCase(),
    stadium: card.stadium?.name ?? '',
    founded: card.founded,
    crest: initialsFor(card.club),
    // The club's playing colours drive the card; the league palette is the
    // fallback for a card that hasn't been given a kit yet.
    colors: kit ? { a: kit.primary, b: kit.secondary } : paletteFor(leagueId),
    kit,
    crestUrl: card.crestUrl ?? (card.id && LOGOS.has(card.id) ? `/crests/${card.id}.png` : null),
    imageUrl: card.imageUrl ?? null,
    tags: [...nicknameTags, ...(card.contentStatus === 'placeholder' ? [{ label: labels.draft, tone: 'white' }] : [])],
  }
}

/**
 * A chant -> the ChantCard shape. The three layers line up exactly:
 * what the stand sings, the literal translation, and the meaning behind it.
 */
export function toChantCard(chant, { labels }) {
  return {
    id: chant.id,
    kicker: chant.when ?? labels.chant,
    title: chant.title,
    layer1: chant.original.text,
    layer1Lang: chant.original.lang,
    sourceUrl: chant.sourceUrl ?? null,
    spotifyUrl: chant.spotifyUrl ?? null,
    layer2: chant.literal,
    layer3: chant.meaning,
    footnote: chant.when ?? '',
  }
}

/** Stadium traditions -> the spotlight panel. */
export function toSpotlight(card, { leagueName, labels }) {
  const [first, second] = card.stadium?.traditions ?? []
  return {
    pill: leagueName,
    place: card.stadium?.name ?? '',
    kicker: labels.kicker,
    title: card.club,
    body: first ?? card.summary,
    mini: second ? { title: labels.miniTitle, body: second } : null,
  }
}

/* ---- Lessons (Person B) ---- */

/** Presentation metadata the lesson API doesn't carry, keyed by category. */
const LESSON_STYLE = {
  rules: { icon: 'gavel', xp: 40, minutes: 5 },
  positions: { icon: 'shield', xp: 45, minutes: 6 },
  formations: { icon: 'grid_view', xp: 55, minutes: 8 },
  'how-to-watch': { icon: 'visibility', xp: 50, minutes: 7 },
}

const ALIGN_CYCLE = ['center', 'right', 'left', 'right']

/**
 * A lesson from `GET /api/lessons` -> a node on the learning path.
 * The winding path needs an alignment and an icon per node; those are
 * presentation, so they're derived here rather than asked of the API.
 */
export function toLessonNode(lesson, index) {
  const style = LESSON_STYLE[lesson.category] ?? { icon: 'sports_soccer', xp: 50, minutes: 6 }
  return {
    id: lesson.id,
    align: ALIGN_CYCLE[index % ALIGN_CYCLE.length],
    icon: style.icon,
    xp: style.xp,
    minutes: style.minutes,
    stars: 0,
    category: lesson.category,
    title: lesson.title,
    desc: lesson.summary,
    body: lesson.body,
    relatedFormationIds: lesson.relatedFormationIds ?? [],
    relatedGlossaryIds: lesson.relatedGlossaryIds ?? [],
  }
}

/**
 * Lesson bodies are markdown. The renderer here covers exactly what the
 * content uses — headings, bold, and bullet lists — rather than pulling in
 * a markdown dependency for four constructs.
 */
export function parseLessonBody(markdown = '') {
  const blocks = []
  let list = null

  for (const raw of markdown.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    if (line.startsWith('- ')) {
      list ??= { type: 'list', items: [] }
      list.items.push(line.slice(2))
      continue
    }
    if (list) {
      blocks.push(list)
      list = null
    }

    const heading = line.match(/^(#{2,3})\s+(.*)$/)
    if (heading) blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] })
    else blocks.push({ type: 'para', text: line })
  }

  if (list) blocks.push(list)
  return blocks
}

/** Inline **bold** -> segments, so a page can render it without dangerouslySetInnerHTML. */
export function boldSegments(text = '') {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part) =>
    part.startsWith('**') && part.endsWith('**')
      ? { bold: true, text: part.slice(2, -2) }
      : { bold: false, text: part },
  )
}

/**
 * A node from `GET /api/path-lessons` -> the shape the winding path and its
 * detail card already expect. The API owns the ordering, the stagger and the
 * icon, so unlike `toLessonNode` nothing has to be invented here — this only
 * renames `summary` to the `desc` the components read.
 */
export function toPathNode(node) {
  return {
    id: node.id,
    align: node.align,
    icon: node.icon,
    xp: node.xp,
    minutes: node.minutes,
    stars: node.stars ?? 0,
    stepCount: node.stepCount ?? 0,
    category: node.category,
    title: node.title,
    detailTitle: node.detailTitle,
    desc: node.summary,
    bounty: node.bounty,
    unlocks: node.unlocks,
    lessonId: node.lessonId ?? null,
    quizSlug: node.quizSlug ?? null,
    glossaryIds: node.glossaryIds ?? [],
  }
}
