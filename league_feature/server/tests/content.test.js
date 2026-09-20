import { describe, expect, it } from 'vitest';
import { createContentRepo } from '../src/repos/contentRepo.js';

const content = createContentRepo();
const leagues = content.leagues();
const cards = content.cultureCards();
const quiz = content.quiz();
const traitIds = quiz.traits.map((t) => t.id);

/** Walks every { en, es } field in a record. */
function localizedStrings(value, path = '', found = []) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => localizedStrings(item, `${path}[${i}]`, found));
  } else if (value && typeof value === 'object') {
    if (typeof value.en === 'string' || typeof value.es === 'string') found.push({ path, value });
    else Object.entries(value).forEach(([k, v]) => localizedStrings(v, path ? `${path}.${k}` : k, found));
  }
  return found;
}

const allRecords = [...leagues, ...cards, quiz];

describe('ids', () => {
  it('uses the prefixes this workstream owns, and no duplicates', () => {
    expect(leagues.every((l) => l.id.startsWith('league-'))).toBe(true);
    expect(cards.every((c) => c.id.startsWith('culture-'))).toBe(true);
    expect(quiz.questions.every((q) => q.id.startsWith('league-quiz-'))).toBe(true);
    const ids = [...leagues, ...cards].map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is kebab-case throughout', () => {
    for (const id of [...leagues, ...cards, ...quiz.questions].map((r) => r.id)) {
      expect(id, id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});

describe('bilingual content', () => {
  it('has English for every text field', () => {
    for (const record of allRecords) {
      for (const { path, value } of localizedStrings(record)) {
        expect(typeof value.en, `${record.id}.${path}`).toBe('string');
        expect(value.en.length, `${record.id}.${path}`).toBeGreaterThan(0);
      }
    }
  });

  it('has Spanish for everything except deliberate same-in-both club names', () => {
    const missing = [];
    for (const record of allRecords) {
      for (const { path, value } of localizedStrings(record)) {
        if (value.es === undefined) missing.push(`${record.id}.${path}: ${value.en}`);
        else expect(value.es.length, `${record.id}.${path}`).toBeGreaterThan(0);
      }
    }
    // Club and competition names that read identically in both languages are stored
    // en-only on purpose; consumers fall back to English.
    expect(missing.every((m) => /clubs\[|opponent|topClubs\[|\.club:|stadium\.name/.test(m)), missing.join('\n')).toBe(true);
  });
});

describe('cross-references', () => {
  it('points every culture card at a real league', () => {
    const leagueIds = new Set(leagues.map((l) => l.id));
    for (const card of cards) expect(leagueIds.has(card.leagueId), card.id).toBe(true);
  });

  it('resolves every cultureId mentioned by a league or a rivalry', () => {
    const cardIds = new Set(cards.map((c) => c.id));
    for (const league of leagues) {
      for (const club of league.topClubs) {
        if (club.cultureId) expect(cardIds.has(club.cultureId), club.cultureId).toBe(true);
      }
    }
    for (const card of cards) {
      for (const rivalry of card.rivalries) {
        if (rivalry.opponentCultureId) expect(cardIds.has(rivalry.opponentCultureId), rivalry.opponentCultureId).toBe(true);
      }
    }
  });

  it('gives every league at least two culture cards', () => {
    for (const league of leagues) {
      expect(content.cultureCards(league.id).length, league.id).toBeGreaterThanOrEqual(2);
    }
    expect(cards.length).toBeGreaterThanOrEqual(10);
  });
});

describe('shape', () => {
  it('rates every league on every trait, 1-5', () => {
    for (const league of leagues) {
      expect(Object.keys(league.traits).sort(), league.id).toEqual([...traitIds].sort());
      for (const value of Object.values(league.traits)) {
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(5);
      }
    }
  });

  it('gives every culture card a three-layer nickname and at least one three-layer chant', () => {
    for (const card of cards) {
      for (const layered of [card.nickname, ...card.chants]) {
        expect(layered.original.text.length, card.id).toBeGreaterThan(0);
        expect(layered.original.lang, card.id).toMatch(/^[a-z]{2,3}$/);
        expect(layered.literal.en.length, card.id).toBeGreaterThan(0);
        expect(layered.meaning.en.length, card.id).toBeGreaterThan(0);
      }
      expect(card.chants.length, card.id).toBeGreaterThanOrEqual(1);
      expect(card.stadium.traditions.length, card.id).toBeGreaterThanOrEqual(1);
    }
  });

  it('only scores traits the quiz defines, and covers all of them', () => {
    const scored = new Set();
    for (const question of quiz.questions) {
      expect(question.options.length, question.id).toBeGreaterThanOrEqual(4);
      for (const option of question.options) {
        for (const [trait, weight] of Object.entries(option.weights)) {
          expect(traitIds, `${question.id}/${option.id}`).toContain(trait);
          expect(weight).toBeGreaterThan(0);
          scored.add(trait);
        }
      }
    }
    expect([...scored].sort()).toEqual([...traitIds].sort());
    expect(quiz.questions.length).toBeGreaterThanOrEqual(4);
  });

  it('flags content that still needs research', () => {
    for (const record of [...leagues, ...cards]) {
      expect(['draft', 'placeholder', 'verified'], record.id).toContain(record.contentStatus);
    }
  });
});
