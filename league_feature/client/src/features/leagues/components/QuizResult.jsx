import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TraitBars from './TraitBars.jsx';

/** The result screen. Takes the /league-quiz/recommend response as-is. */
export default function QuizResult({ result, onRestart }) {
  const { t } = useTranslation('leagues');
  const { recommendation, ranking, profile } = result;
  const league = recommendation.league;
  const reasonIds = recommendation.reasons.map((reason) => reason.id);

  return (
    <div className="space-y-8">
      <section className="card text-center" aria-labelledby="result-heading">
        <p className="text-subtle">{t('quiz.result.title')}</p>
        <h1 id="result-heading" className="font-display text-3xl">
          {league.name}
        </h1>
        <p className="score-num mt-1 text-2xl text-primary-dark dark:text-green-300">
          {t('quiz.result.match', { percent: recommendation.matchPercent })}
        </p>
        <p className="mt-3 text-pretty">{league.tagline}</p>

        {recommendation.reasons.length > 0 && (
          <>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-subtle">{t('quiz.result.because')}</p>
            <ul className="mt-2 flex flex-wrap justify-center gap-2">
              {recommendation.reasons.map((reason) => (
                <li key={reason.id} className="chip">
                  {reason.label}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={`/leagues/${league.id}`} className="btn-primary">
            {t('quiz.result.explore', { league: league.name })}
          </Link>
          <button type="button" className="btn-secondary" onClick={onRestart}>
            {t('quiz.result.restart')}
          </button>
        </div>
      </section>

      <TraitBars items={profile} title={t('quiz.result.profile')} titleId="profile-heading" highlightIds={reasonIds} />

      <TraitBars
        title={t('quiz.result.ranking')}
        titleId="ranking-heading"
        highlightIds={[league.id]}
        items={ranking.map((entry) => ({
          id: entry.leagueId,
          label: entry.name,
          percent: entry.matchPercent,
        }))}
      />
    </div>
  );
}
