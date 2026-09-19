import { Router } from 'express';
import { notFound } from '../lib/errors.js';
import { localizeDeep } from '../lib/localize.js';

/** Enough for a grid tile: identity, the nickname hook, and how much is inside. */
export function toCardSummary(card) {
  return {
    id: card.id,
    leagueId: card.leagueId,
    club: card.club,
    city: card.city,
    founded: card.founded,
    nickname: card.nickname,
    summary: card.summary,
    chantCount: card.chants.length,
    contentStatus: card.contentStatus,
  };
}

export function cultureRoutes({ content }) {
  const r = Router();

  r.get('/', (req, res, next) => {
    const leagueId = req.query.league;
    if (leagueId && !content.league(leagueId)) return next(notFound(`No league with id '${leagueId}'`));

    const cards = content.cultureCards(leagueId).map(toCardSummary);
    res.json({ cards: localizeDeep(cards, req.ctx.locale) });
  });

  r.get('/:id', (req, res, next) => {
    const card = content.cultureCard(req.params.id);
    if (!card) return next(notFound(`No culture card with id '${req.params.id}'`));

    const league = content.league(card.leagueId);
    const related = content
      .cultureCards(card.leagueId)
      .filter((c) => c.id !== card.id)
      .map(toCardSummary);

    res.json(
      localizeDeep(
        {
          card,
          league: league ? { id: league.id, name: league.name } : null,
          related,
        },
        req.ctx.locale,
      ),
    );
  });

  return r;
}
