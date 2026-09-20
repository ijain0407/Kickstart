import { badRequest } from './errors.js';

/** Leagues rate each trait 1-5, so 3 means "average for a top league". */
const NEUTRAL = 3;
const MAX_REASONS = 2;

/**
 * Turns answers into a trait profile: { pace: 3, tactics: 1, ... }.
 * Answers are `{ [questionId]: optionId }`. Partial answer sets are allowed so the
 * UI can show a provisional result, but unknown ids are a client bug and get a 400.
 */
export function buildProfile(quiz, answers) {
  const entries = Object.entries(answers ?? {});
  if (entries.length === 0) throw badRequest('Answer at least one question', 'NO_ANSWERS');

  const profile = Object.fromEntries(quiz.traits.map((t) => [t.id, 0]));

  for (const [questionId, picked] of entries) {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) throw badRequest(`Unknown question '${questionId}'`, 'UNKNOWN_QUESTION');

    // A question can be single- or multi-select; one id and a list of ids are
    // both accepted, and a multi-select answer simply adds up its options.
    const optionIds = Array.isArray(picked) ? picked : [picked];
    if (optionIds.length === 0) throw badRequest(`No option chosen for question '${questionId}'`, 'NO_ANSWERS');

    for (const optionId of optionIds) {
      const option = question.options.find((o) => o.id === optionId);
      if (!option) throw badRequest(`Unknown option '${optionId}' for question '${questionId}'`, 'UNKNOWN_OPTION');

      for (const [trait, weight] of Object.entries(option.weights)) {
        if (!(trait in profile)) throw new Error(`Content error: option '${optionId}' scores unknown trait '${trait}'`);
        profile[trait] += weight;
      }
    }
  }

  return profile;
}

/**
 * Cosine similarity between the answer profile and a league's trait profile,
 * centered on NEUTRAL. Centering is what makes the result meaningful: a league that
 * is merely average at what you asked for shouldn't score as a match, and a league
 * that is *weak* at it should score below zero. Cosine (rather than a plain dot
 * product) keeps leagues with strong opinions from beating leagues with mild ones
 * just because their numbers are bigger.
 */
function similarity(profile, league, traitIds) {
  let dot = 0;
  let magProfile = 0;
  let magLeague = 0;

  for (const trait of traitIds) {
    const want = profile[trait] ?? 0;
    const has = (league.traits[trait] ?? NEUTRAL) - NEUTRAL;
    dot += want * has;
    magProfile += want * want;
    magLeague += has * has;
  }

  if (magProfile === 0 || magLeague === 0) return 0;
  return dot / (Math.sqrt(magProfile) * Math.sqrt(magLeague));
}

/** Cosine runs -1..1; show it as a friendlier 0-100 match score. */
const toPercent = (score) => Math.round(50 * (score + 1));

/** The traits that actually drove this match, strongest first. */
function reasonsFor(profile, league, traitIds) {
  return traitIds
    .map((trait) => ({ trait, contribution: (profile[trait] ?? 0) * ((league.traits[trait] ?? NEUTRAL) - NEUTRAL) }))
    .filter((r) => r.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, MAX_REASONS)
    .map((r) => r.trait);
}

/**
 * Ranks every league against the answers. `leagues` is expected in display order,
 * which is also the tie-break — equal scores stay in a stable, predictable order.
 */
export function recommendLeagues({ quiz, leagues, answers }) {
  const profile = buildProfile(quiz, answers);
  const traitIds = quiz.traits.map((t) => t.id);

  const ranking = leagues
    .map((league, index) => ({
      league,
      index,
      score: similarity(profile, league, traitIds),
      reasons: reasonsFor(profile, league, traitIds),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ league, score, reasons }) => ({
      leagueId: league.id,
      matchPercent: toPercent(score),
      reasons,
    }));

  return { profile, ranking, best: ranking[0] };
}
