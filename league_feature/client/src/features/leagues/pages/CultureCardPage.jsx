import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ErrorState, LoadingBlock } from '../../../components/StateViews.jsx';
import { useCultureCard } from '../api.js';
import ChantCard from '../components/ChantCard.jsx';
import LayeredText from '../components/LayeredText.jsx';
import RivalryList from '../components/RivalryList.jsx';
import Tile from '../components/Tile.jsx';

export default function CultureCardPage() {
  const { cultureId } = useParams();
  const { t } = useTranslation('leagues');
  const { data, isPending, error, refetch } = useCultureCard(cultureId);

  if (isPending) return <LoadingBlock />;
  if (error) return <ErrorState message={t('culture.loadError')} error={error} onRetry={refetch} />;

  const { card, league, related } = data;

  return (
    <article className="space-y-8">
      <header>
        {league && (
          <Link to={`/leagues/${league.id}`} className="text-sm font-semibold text-primary-dark underline dark:text-green-300">
            ← {league.name}
          </Link>
        )}
        <h1 className="mt-2 font-display text-3xl">{card.club}</h1>
        <p className="text-subtle">
          {card.city} · {t('league.founded', { year: card.founded })} · {card.colors}
        </p>
        <p className="mt-3 text-pretty">{card.summary}</p>
        {card.contentStatus === 'placeholder' && (
          <p className="mt-3 rounded-btn bg-amber/20 px-3 py-2 text-sm font-semibold">{t('culture.placeholder')}</p>
        )}
      </header>

      <section aria-labelledby="nickname-heading" className="card">
        <h2 id="nickname-heading" className="font-display text-xl">
          {t('culture.nickname')}
        </h2>
        <LayeredText className="mt-4" original={card.nickname.original} literal={card.nickname.literal} meaning={card.nickname.meaning} />
      </section>

      <section aria-labelledby="chants-heading">
        <h2 id="chants-heading" className="font-display text-xl">
          {t('culture.chants')}
        </h2>
        <ul className="mt-3 space-y-4">
          {card.chants.map((chant) => (
            <li key={chant.id}>
              <ChantCard chant={chant} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="stadium-heading">
        <h2 id="stadium-heading" className="font-display text-xl">
          {t('culture.stadium')}
        </h2>
        <p className="mt-1 font-semibold">{card.stadium.name}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {card.stadium.traditions.map((tradition) => (
            <li key={tradition} className="text-pretty">
              {tradition}
            </li>
          ))}
        </ul>
      </section>

      <RivalryList rivalries={card.rivalries} title={t('culture.rivalries')} titleId="card-rivalries-heading" />

      {related.length > 0 && league && (
        <section aria-labelledby="related-heading">
          <h2 id="related-heading" className="font-display text-xl">
            {t('culture.moreFrom', { league: league.name })}
          </h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {related.map((other) => (
              <li key={other.id}>
                <Tile eyebrow={other.city} title={other.club} description={other.summary} to={`/culture/${other.id}`} cta={t('league.cardCta', { club: other.club })} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
