import { Router } from 'express';
import { z } from 'zod';
import { notFound } from '../lib/errors.js';
import { loc, localizeDeep } from '../lib/localize.js';
import { recommendClubs } from '../lib/recommend.js';

/* ============================================================
   FIND YOUR CLUB

   GET  /api/club-quiz?league=league-serie-a
   POST /api/club-quiz/recommend { leagueId, answers }

   The league matcher answers "which competition"; this answers
   "which of its clubs". Same scoring engine, different traits:
   glory, history, underdog, drama, belonging, style, atmosphere.
   ============================================================ */

const answerValue = z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]);

const recommendBody = z.object({
  // Optional: with no league the whole set of clubs is in play.
  leagueId: z.string().trim().max(80).optional(),
  answers: z.record(z.string().min(1), answerValue),
});

/** Scoring weights stay on the server; the presentation metadata goes out. */
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

function toProfileBars(profile, traits) {
  const max = Math.max(0, ...Object.values(profile));
  return traits.map((trait) => ({
    id: trait.id,
    label: trait.label,
    value: profile[trait.id] ?? 0,
    percent: max === 0 ? 0 : Math.round(((profile[trait.id] ?? 0) / max) * 100),
  }));
}

export function clubQuizRoutes({ content }) {
  const r = Router();

  r.get('/', (req, res, next) => {
    const { locale } = req.ctx;
    const leagueId = req.query.league;

    const league = leagueId ? content.league(leagueId) : null;
    if (leagueId && !league) return next(notFound(`No league with id '${leagueId}'`));

    const quiz = content.clubQuiz();
    const localized = localizeDeep(toPublicQuiz(quiz), locale);

    // Both phrasings, so the UI can show the other language underneath.
    const other = locale === 'es' ? 'en' : 'es';
    localized.questions = localized.questions.map((question) => {
      const source = quiz.questions.find((q) => q.id === question.id);
      return { ...question, promptAlt: loc(source.prompt, other) };
    });

    res.json({
      quiz: localized,
      league: league ? localizeDeep({ id: league.id, name: league.name }, locale) : null,
      clubCount: content.cultureCards(league?.id).length,
    });
  });

  r.post('/recommend', (req, res, next) => {
    const { leagueId, answers } = recommendBody.parse(req.body);

    if (leagueId && !content.league(leagueId)) return next(notFound(`No league with id '${leagueId}'`));

    const clubs = content.cultureCards(leagueId);
    if (clubs.length === 0) return next(notFound(`No clubs to choose from in '${leagueId}'`));

    const quiz = content.clubQuiz();
    const { profile, ranking, best } = recommendClubs({ quiz, clubs, answers });

    const traitById = new Map(quiz.traits.map((t) => [t.id, t]));
    const clubById = new Map(clubs.map((c) => [c.id, c]));

    res.json(
      localizeDeep(
        {
          recommendation: {
            // The full card: the result screen shows the nickname and can link
            // straight into the club's culture page.
            club: clubById.get(best.cultureId),
            matchPercent: best.matchPercent,
            reasons: best.reasons.map((id) => traitById.get(id)),
          },
          ranking: ranking.map((entry) => {
            const club = clubById.get(entry.cultureId);
            return {
              cultureId: entry.cultureId,
              club: club.club,
              leagueId: club.leagueId,
              kit: club.kit ?? null,
              crestUrl: club.crestUrl ?? null,
              matchPercent: entry.matchPercent,
            };
          }),
          profile: toProfileBars(profile, quiz.traits),
        },
        req.ctx.locale,
      ),
    );
  });

  return r;
}
