import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataPath = (name) => fileURLToPath(new URL(`../../data/${name}`, import.meta.url));

/**
 * Reads a JSON file, re-parsing only when it has changed on disk. Editing a
 * content file is the whole content workflow here, so a save should show up on
 * the next refresh without restarting the API — but re-parsing on every request
 * would be wasteful, hence the mtime check.
 */
function jsonFile(name) {
  const path = dataPath(name);
  let cached = null;
  let cachedAt = 0;

  return () => {
    const { mtimeMs } = statSync(path);
    if (!cached || mtimeMs !== cachedAt) {
      cached = JSON.parse(readFileSync(path, 'utf-8'));
      cachedAt = mtimeMs;
    }
    return cached;
  };
}

/**
 * The JSON files are the data layer (same choice Person B made): content is small,
 * read-only, and editable without a migration. Swap the reads for DB queries later
 * and the rest of the server doesn't change.
 *
 * Tests pass their own data in, which skips the filesystem entirely.
 */
export function createContentRepo({ leagues, culture, quiz } = {}) {
  const byOrder = (a, b) => a.order - b.order;

  const loadLeagues = leagues ? () => leagues : jsonFile('leagues.json');
  const loadCulture = culture ? () => culture : jsonFile('culture.json');
  const loadQuiz = quiz ? () => quiz : jsonFile('league-quiz.json');

  const sortedLeagues = () => [...loadLeagues()].sort(byOrder);
  const sortedCulture = () => [...loadCulture()].sort(byOrder);

  return {
    leagues: () => sortedLeagues(),
    league: (id) => sortedLeagues().find((l) => l.id === id) ?? null,
    cultureCards: (leagueId) => (leagueId ? sortedCulture().filter((c) => c.leagueId === leagueId) : sortedCulture()),
    cultureCard: (id) => sortedCulture().find((c) => c.id === id) ?? null,
    quiz: () => loadQuiz(),
    traits: () => loadQuiz().traits,
  };
}
