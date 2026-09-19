import { describe, expect, it } from 'vitest';
import { createContentRepo } from '../src/repos/contentRepo.js';
import { buildProfile, recommendLeagues } from '../src/lib/recommend.js';

const content = createContentRepo();
const quiz = content.quiz();
const leagues = content.leagues();

/** Answers that pick, for every question, the option scoring `trait` highest. */
function answersFavouring(trait) {
  const answers = {};
  for (const question of quiz.questions) {
    const best = [...question.options].sort((a, b) => (b.weights[trait] ?? 0) - (a.weights[trait] ?? 0))[0];
    if (best.weights[trait]) answers[question.id] = best.id;
  }
  return answers;
}

const recommend = (answers) => recommendLeagues({ quiz, leagues, answers });

describe('buildProfile', () => {
  it('sums the weights of the chosen options', () => {
    const profile = buildProfile(quiz, { 'league-quiz-q1-draw': 'tactics', 'league-quiz-q5-scoreline': 'masterclass' });
    expect(profile.tactics).toBe(6);
    expect(profile.pace).toBe(0);
  });

  it('accepts a partial answer set', () => {
    expect(buildProfile(quiz, { 'league-quiz-q1-draw': 'speed' }).pace).toBe(3);
  });

  it('rejects empty, unknown and mismatched answers', () => {
    expect(() => buildProfile(quiz, {})).toThrow(/at least one/i);
    expect(() => buildProfile(quiz, { nope: 'speed' })).toThrow(/Unknown question/);
    expect(() => buildProfile(quiz, { 'league-quiz-q1-draw': 'nope' })).toThrow(/Unknown option/);
    // An option id that's real, but belongs to a different question.
    expect(() => buildProfile(quiz, { 'league-quiz-q1-draw': 'masterclass' })).toThrow(/Unknown option/);
  });
});

describe('recommendLeagues', () => {
  it('ranks every league exactly once, best first', () => {
    const { ranking } = recommend(answersFavouring('pace'));
    expect(ranking).toHaveLength(leagues.length);
    expect(new Set(ranking.map((r) => r.leagueId)).size).toBe(leagues.length);
    const percents = ranking.map((r) => r.matchPercent);
    expect([...percents].sort((a, b) => b - a)).toEqual(percents);
  });

  it('matches each trait to the league that leads in it', () => {
    // Every league has to be reachable, or parts of the quiz are dead ends.
    const expected = {
      physicality: 'league-premier-league',
      technique: 'league-la-liga',
      atmosphere: 'league-bundesliga',
      tactics: 'league-serie-a',
      underdogs: 'league-mls',
    };
    for (const [trait, leagueId] of Object.entries(expected)) {
      expect(recommend(answersFavouring(trait)).best.leagueId, trait).toBe(leagueId);
    }
  });

  it('explains the match with the traits that drove it', () => {
    const { best } = recommend(answersFavouring('underdogs'));
    expect(best.leagueId).toBe('league-mls');
    expect(best.reasons).toContain('underdogs');
    expect(best.reasons.length).toBeLessThanOrEqual(2);
  });

  it('scores a league higher when the answers match its strengths', () => {
    const percentFor = (trait, leagueId) =>
      recommend(answersFavouring(trait)).ranking.find((r) => r.leagueId === leagueId).matchPercent;
    // Serie A is the tactical league and the slowest of the five.
    expect(percentFor('tactics', 'league-serie-a')).toBeGreaterThan(percentFor('pace', 'league-serie-a'));
    expect(percentFor('pace', 'league-serie-a')).toBeLessThan(50);
  });

  it('breaks ties by display order rather than at random', () => {
    const flat = leagues.map((l) => ({ ...l, traits: Object.fromEntries(Object.keys(l.traits).map((k) => [k, 3])) }));
    const ranking = recommendLeagues({ quiz, leagues: flat, answers: answersFavouring('pace') }).ranking;
    expect(ranking.map((r) => r.leagueId)).toEqual(flat.map((l) => l.id));
    expect(ranking.every((r) => r.matchPercent === 50)).toBe(true);
  });
});
