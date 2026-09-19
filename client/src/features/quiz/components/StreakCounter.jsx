import { useTranslation } from 'react-i18next';
import Icon from '../../../components/Icon.jsx';

export default function StreakCounter({ count }) {
  const { t } = useTranslation('quiz');
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-100" aria-label={t('streak.label', { count })}>
      <Icon name="flame" className="h-4 w-4" />
      <span className="score-num text-base" aria-hidden="true">{count}</span>
    </span>
  );
}
