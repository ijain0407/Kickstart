import { Router } from 'express';
import { z } from 'zod';
import { localizeDeep } from '../lib/localize.js';
import { recommendLeagues } from '../lib/recommend.js';

const recommendBody = z.object({
  answers: z.record(z.string().min(1), z.string().min(1)),
});

/** Option weights are scoring internals — the client never needs them. */
function toPublicQuiz(quiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    intro: quiz.intro,
    traits: quiz.traits,
    questions: [...quiz.questions]
      .sort((a, b) => a.order - b.order)
      .map((q) => ({
        id: q.id,
        order: q.order,
        prompt: q.prompt,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
      })),
  };
}

/** Raw trait totals plus a 0-100 share, so the result screen can draw bars directly. */
function toProfileBars(profile, traits) {
  const max = Math.max(0, ...Object.values(profile));
  return traits.map((trait) => ({
    id: trait.id,
    label: trait.label,
    value: profile[trait.id] ?? 0,
    percent: max === 0 ? 0 : Math.round(((profile[trait.id] ?? 0) / max) * 100),
  }));
}

export function leagueQuizRoutes({ content }) {
  const r = Router();

  r.get('/', (req, res) => {
    res.json({ quiz: localizeDeep(toPublicQuiz(content.quiz()), req.ctx.locale) });
  });

  r.post('/recommend', (req, res) => {
    const { answers } = recommendBody.parse(req.body);
    const quiz = content.quiz();
    const leagues = content.leagues();
    const { profile, ranking, best } = recommendLeagues({ quiz, leagues, answers });

    const traitById = new Map(quiz.traits.map((t) => [t.id, t]));
    const leagueById = new Map(leagues.map((l) => [l.id, l]));

    res.json(
      localizeDeep(
        {
          recommendation: {
            league: leagueById.get(best.leagueId),
            matchPercent: best.matchPercent,
            reasons: best.reasons.map((id) => traitById.get(id)),
          },
          ranking: ranking.map((entry) => ({
            leagueId: entry.leagueId,
            name: leagueById.get(entry.leagueId).name,
            tagline: leagueById.get(entry.leagueId).tagline,
            matchPercent: entry.matchPercent,
          })),
          profile: toProfileBars(profile, quiz.traits),
        },
        req.ctx.locale,
      ),
    );
  });

  return r;
}
