import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ErrorState, LoadingBlock } from '../../../components/StateViews.jsx';
import { useLeagues } from '../api.js';
import Tile from '../components/Tile.jsx';

export default function LeaguesHub() {
  const { t } = useTranslation('leagues');
  const { data, isPending, error, refetch } = useLeagues();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">{t('hub.title')}</h1>
        <p className="mt-1 text-subtle">{t('hub.intro')}</p>
      </header>

      <Link to="/leagues/find-your-league" className="btn-primary w-full sm:w-auto">
        {t('hub.quizCta')}
      </Link>

      {isPending && <LoadingBlock />}
      {error && <ErrorState message={t('hub.loadError')} error={error} onRetry={refetch} />}

      {data && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.leagues.map((league) => (
            <li key={league.id}>
              <Tile
                eyebrow={league.country}
                title={league.name}
                description={league.tagline}
                meta={[t('league.founded', { year: league.founded })]}
                to={`/leagues/${league.id}`}
                cta={league.name}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
