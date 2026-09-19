import { useTranslation } from 'react-i18next';
import Icon from '../../../components/Icon.jsx';

function Side({ name, icon, score, total, tone }) {
  const { t } = useTranslation('quiz');
  return (
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}><Icon name={icon} className="h-5 w-5" /></span>
        <span className="font-display font-bold">{name}</span>
        <span className="score-num ml-auto text-2xl" aria-hidden="true">{score}</span>
      </div>
      <div
        role="progressbar"
        aria-label={t('battle.scoreLabel', { name, score, total })}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={score}
        className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700"
      >
        <div className="h-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${total ? (score / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

/** Split header for Quiz Battle: two avatars, score bars and a VS badge. */
export default function BattleHeader({ userScore, botScore, total, difficulty }) {
  const { t } = useTranslation('quiz');
  return (
    <section className="card flex items-center gap-3" aria-label={t('battle.title')}>
      <Side name={t('battle.you')} icon="user" score={userScore} total={total} tone="bg-green-100 text-primary-dark" />
      <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-full bg-amber-100 font-score text-lg font-bold text-amber-900" title={difficulty ? t(`battle.${difficulty}`) : undefined}>
        {t('battle.vs')}
      </span>
      <Side name={t('battle.bot')} icon="bolt" score={botScore} total={total} tone="bg-sky-100 text-sky-900" />
    </section>
  );
}
