import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ErrorState, LoadingBlock } from '../../../components/StateViews.jsx';
import { useLeague } from '../api.js';
import Tile from '../components/Tile.jsx';
import RivalryList from '../components/RivalryList.jsx';
import TraitBars, { traitsToItems } from '../components/TraitBars.jsx';

export default function LeagueProfile() {
  const { leagueId } = useParams();
  const { t } = useTranslation('leagues');
  const { data, isPending, error, refetch } = useLeague(leagueId);

  if (isPending) return <LoadingBlock />;
  if (error) return <ErrorState message={t('league.loadError')} error={error} onRetry={refetch} />;

  const { league, cultureCards, traits } = data;

  return (
    <article className="space-y-8">
      <header>
        <Link to="/leagues" className="text-sm font-semibold text-primary-dark underline dark:text-green-300">
          ← {t('league.backToLeagues')}
        </Link>
        <h1 className="mt-2 font-display text-3xl">{league.name}</h1>
        <p className="text-subtle">
          {league.country} · {t('league.founded', { year: league.founded })}
        </p>
        <p className="mt-3 text-lg text-pretty">{league.tagline}</p>
      </header>

      <section aria-labelledby="style-heading">
        <h2 id="style-heading" className="font-display text-xl">
          {t('league.style')}
        </h2>
        <p className="mt-2 text-pretty">{league.style}</p>
      </section>

      <TraitBars items={traitsToItems(league.traits, traits)} title={t('league.traits')} titleId="traits-heading" />

      <section aria-labelledby="clubs-heading">
        <h2 id="clubs-heading" className="font-display text-xl">
          {t('league.topClubs')}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {league.topClubs.map((club) => (
            <li key={club.name}>
              {club.cultureId ? (
                <Link to={`/culture/${club.cultureId}`} className="chip underline">
                  {club.name}
                </Link>
              ) : (
                <span className="chip">{club.name}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <RivalryList rivalries={league.rivalries} title={t('league.rivalries')} titleId="rivalries-heading" />

      <section aria-labelledby="culture-heading">
        <h2 id="culture-heading" className="font-display text-xl">
          {t('league.cultureCards')}
        </h2>
        <ul className="mt-3 grid gap-4 sm:grid-cols-2">
          {cultureCards.map((card) => (
            <li key={card.id}>
              <Tile
                eyebrow={card.city}
                title={card.club}
                description={card.summary}
                badge={t('culture.chantCount', { count: card.chantCount })}
                meta={[card.nickname.original.text, t('league.founded', { year: card.founded })]}
                to={`/culture/${card.id}`}
                cta={t('league.cardCta', { club: card.club })}
              />
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
