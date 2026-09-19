import { Router } from 'express';
import { notFound } from '../lib/errors.js';
import { localizeDeep } from '../lib/localize.js';
import { toCardSummary } from './culture.js';

export function leagueRoutes({ content }) {
  const r = Router();

  r.get('/', (req, res) => {
    const { locale } = req.ctx;
    res.json({
      leagues: localizeDeep(content.leagues(), locale),
      traits: localizeDeep(content.traits(), locale),
    });
  });

  r.get('/:id', (req, res, next) => {
    const league = content.league(req.params.id);
    if (!league) return next(notFound(`No league with id '${req.params.id}'`));

    const { locale } = req.ctx;
    res.json({
      league: localizeDeep(league, locale),
      cultureCards: localizeDeep(content.cultureCards(league.id).map(toCardSummary), locale),
      traits: localizeDeep(content.traits(), locale),
    });
  });

  return r;
}
