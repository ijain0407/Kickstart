import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/Icon.jsx';
import { ErrorState, LoadingBlock } from '../../../components/StateViews.jsx';
import { clearActiveAttempt } from '../attemptSession.js';
import { LESSON_IDS } from '../config.js';
import { useProgress } from '../hooks/useProgress.js';
import LevelBadge from '../components/LevelBadge.jsx';
import StreakCounter from '../components/StreakCounter.jsx';
import XPBar from '../components/XPBar.jsx';

export default function QuizHub() {
  const { t } = useTranslation('quiz');
  const progress = useProgress();

  if (progress.isError) return <ErrorState message={t('errors.generic', { ns: 'common' })} error={progress.error} onRetry={() => progress.refetch()} />;
  if (!progress.data) return <LoadingBlock />;
  const p = progress.data;
  const firstTime = p.history.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">{t('hub.title')}</h1>
        <p className="text-subtle">{t('hub.subtitle')}</p>
      </div>

      <section className="card space-y-3" aria-label={t('level', { ns: 'progress', level: t(`level.${p.level}`, { ns: 'common' }) })}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <LevelBadge level={p.level} />
          <StreakCounter count={p.streak.current} />
        </div>
        <XPBar info={p} />
      </section>

      {firstTime && <p className="card border-2 border-primary text-lg font-medium">{t('hub.welcome')}</p>}

      <section className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl">{t('hub.quick.title')}</h2>
          <p className="text-subtle">{t('hub.quick.description')}</p>
        </div>
        <Link to="/quiz/play?mode=quick" className="btn-primary" onClick={clearActiveAttempt}>
          {t('hub.quick.start')}
          <Icon name="arrowRight" />
        </Link>
      </section>

      <section aria-labelledby="lesson-quizzes">
        <h2 id="lesson-quizzes" className="text-xl">{t('hub.lessons.title')}</h2>
        <p className="mb-3 text-subtle">{t('hub.lessons.description')}</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {LESSON_IDS.map((id) => {
            const best = p.bestScores[id];
            const name = t(`lesson.${id}`, { ns: 'common' });
            return (
              <li key={id}>
                <Link
                  to={`/quiz/play?mode=lesson&lesson=${id}`}
                  onClick={clearActiveAttempt}
                  aria-label={`${t('hub.lessons.play', { lesson: name })}. ${best === undefined ? t('hub.lessons.noBest') : t('hub.lessons.best', { percent: best })}`}
                  className="card flex min-h-[44px] items-center justify-between gap-3 hover:ring-2 hover:ring-primary"
                >
                  <span>
                    <span className="block font-display font-bold">{name}</span>
                    <span className="text-sm text-subtle">{best === undefined ? t('hub.lessons.noBest') : t('hub.lessons.best', { percent: best })}</span>
                  </span>
                  <Icon name="arrowRight" className="h-5 w-5 shrink-0 text-primary-dark dark:text-green-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Tier 3: stays disabled until Quiz Battle ships. */}
      <section className="card flex items-center justify-between gap-3 opacity-80" aria-disabled="true">
        <div className="flex items-center gap-3">
          <Icon name="swords" className="h-6 w-6" />
          <div>
            <h2 className="text-xl">{t('hub.battle.title')}</h2>
            <p className="text-subtle">{t('hub.battle.description')}</p>
          </div>
        </div>
        <span className="chip">{t('hub.battle.soon')}</span>
      </section>
    </div>
  );
}
