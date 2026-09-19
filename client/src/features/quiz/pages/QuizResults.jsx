import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../../lib/api.js';
import { useCountUp } from '../../../lib/hooks.js';
import Icon from '../../../components/Icon.jsx';
import { ErrorState, LoadingBlock } from '../../../components/StateViews.jsx';
import { BADGE_ICONS } from '../../progress/badgeIcons.js';
import { clearActiveAttempt } from '../attemptSession.js';
import { useProgress } from '../hooks/useProgress.js';
import LevelBadge from '../components/LevelBadge.jsx';
import LevelUpOverlay from '../components/LevelUpOverlay.jsx';

export default function QuizResults() {
  const { attemptId } = useParams();
  const { t } = useTranslation('quiz');
  const { refresh } = useProgress();
  // Completing is idempotent on the server, so reloading this page never double-awards XP.
  const query = useQuery({
    queryKey: ['result', attemptId],
    queryFn: () => api(`/quiz/attempts/${attemptId}/complete`, { method: 'POST' }),
    staleTime: Infinity,
    retry: false,
  });
  const result = query.data;
  const [levelUpOpen, setLevelUpOpen] = useState(true);
  const xp = useCountUp(result?.xpEarned ?? 0);

  useEffect(() => {
    if (result) {
      clearActiveAttempt();
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (query.isError) return <ErrorState message={t('results.loadError')} error={query.error} onRetry={() => query.refetch()} />;
  if (!result) return <LoadingBlock />;

  const leveledUp = result.levelAfter !== result.levelBefore;
  const isBattle = result.mode === 'battle';
  const replayHref = isBattle ? '/quiz/battle' : result.mode === 'lesson' ? `/quiz/play?mode=lesson&lesson=${result.lessonId}` : '/quiz/play?mode=quick';

  return (
    <div className="space-y-6 text-center">
      {leveledUp && levelUpOpen && <LevelUpOverlay level={result.levelAfter} onClose={() => setLevelUpOpen(false)} />}

      <h1 className="text-2xl">{t('results.title')}</h1>

      <section className="card space-y-2" aria-live="polite">
        <p className="score-num text-7xl text-primary-dark dark:text-green-300">
          {result.score}<span className="text-4xl text-subtle">/{result.total}</span>
        </p>
        <p className="text-xl font-semibold">{t('results.score', { score: result.score, total: result.total })}</p>
        {isBattle && (
          <div className="space-y-1 py-2">
            <p className="text-2xl font-display font-bold">{t(`battle.${result.battleResult}`)}</p>
            <p className="score-num text-3xl">{t('battle.resultScore', { score: result.score, botScore: result.botScore })}</p>
            {result.xpBreakdown.battleBonus > 0 && <p className="text-subtle">{t('battle.bonus', { xp: result.xpBreakdown.battleBonus })}</p>}
          </div>
        )}
        {result.perfect && <p className="chip"><Icon name="star" className="h-4 w-4" />{t('results.perfect')}</p>}
        <p className="pt-2">
          <span className="sr-only">{t('results.xpLabel')}: </span>
          <span className="score-num text-4xl text-amber-800 dark:text-amber-300">{t('results.xp', { xp })}</span>
        </p>
        <div className="flex justify-center"><LevelBadge level={result.levelAfter} /></div>
        <p className="flex items-center justify-center gap-2 text-subtle">
          <Icon name="flame" className="h-5 w-5" />
          {result.streak.current > 0 ? t('results.streakDay', { count: result.streak.current }) : t('results.streakNone')}
        </p>
      </section>

      {result.newBadges.length > 0 && (
        <section aria-labelledby="new-badges">
          <h2 id="new-badges" className="mb-2 text-lg">{t('results.newBadges')}</h2>
          <ul className="flex gap-3 overflow-x-auto pb-2">
            {result.newBadges.map((id) => (
              <li key={id} className="card flex min-w-[140px] shrink-0 flex-col items-center gap-2 motion-safe:animate-pop">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-900"><Icon name={BADGE_ICONS[id]} className="h-6 w-6" /></span>
                <span className="text-sm font-semibold">{t(`badge.${id}.name`, { ns: 'progress' })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to={replayHref} className="btn-primary" onClick={clearActiveAttempt}>{isBattle ? t('battle.rematch') : t('results.playAgain')}</Link>
        {result.missedCount > 0 && <Link to={`/quiz/review/${attemptId}`} className="btn-secondary">{t('results.review')}</Link>}
        {/* TODO(A): point at the Learn Hub route once it exists. */}
        <Link to="/learn" className="btn-secondary">{t('results.backToLearn')}</Link>
      </div>
    </div>
  );
}
