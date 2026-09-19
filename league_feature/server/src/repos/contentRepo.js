import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataUrl = (name) => new URL(`../../data/${name}`, import.meta.url);
const readJson = (name) => JSON.parse(readFileSync(fileURLToPath(dataUrl(name)), 'utf-8'));

/**
 * The JSON files are the data layer (same choice Person B made): content is small,
 * read-only, and editable without a migration. Swap the reads for DB queries later
 * and the rest of the server doesn't change.
 */
export function createContentRepo({ leagues = readJson('leagues.json'), culture = readJson('culture.json'), quiz = readJson('league-quiz.json') } = {}) {
  const byOrder = (a, b) => a.order - b.order;
  const sortedLeagues = [...leagues].sort(byOrder);
  const sortedCulture = [...culture].sort(byOrder);

  return {
    leagues: () => sortedLeagues,
    league: (id) => sortedLeagues.find((l) => l.id === id) ?? null,
    cultureCards: (leagueId) => (leagueId ? sortedCulture.filter((c) => c.leagueId === leagueId) : sortedCulture),
    cultureCard: (id) => sortedCulture.find((c) => c.id === id) ?? null,
    quiz: () => quiz,
    traits: () => quiz.traits,
  };
}
