import { Router } from 'express';
import { z } from 'zod';
import { loc, localizeDeep } from '../lib/localize.js';
import { recommendLeagues } from '../lib/recommend.js';

const answerValue = z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]);

const recommendBody = z.object({
  answers: z.record(z.string().min(1), answerValue),
});

/**
 * Option weights are scoring internals — the client never needs them.
 * Everything else, including the presentation metadata the UI renders
 * (tag, icon, description, meta chips), passes through.
 */
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
        section: q.section,
        multi: Boolean(q.multi),
        prompt: q.prompt,
        options: q.options.map(({ weights, ...option }) => option),
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
    const { locale } = req.ctx;
    const quiz = content.quiz();
    const localized = localizeDeep(toPublicQuiz(quiz), locale);

    // "Bilingual coach mode": the UI shows each question in the other language
    // underneath, so a learner sees both phrasings of the same question.
    const other = locale === 'es' ? 'en' : 'es';
    localized.questions = localized.questions.map((question) => {
      const source = quiz.questions.find((q) => q.id === question.id);
      return { ...question, promptAlt: loc(source.prompt, other) };
    });

    res.json({ quiz: localized });
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
