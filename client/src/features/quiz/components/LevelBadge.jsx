import { useTranslation } from 'react-i18next';
import Icon from '../../../components/Icon.jsx';

const TONE = {
  fan: 'bg-green-100 text-primary-dark dark:bg-green-900 dark:text-green-100',
  enthusiast: 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100',
  tactics_nerd: 'bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100',
};

export default function LevelBadge({ level, className = '' }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${TONE[level] ?? TONE.fan} ${className}`}>
      <Icon name="shield" className="h-4 w-4" />
      {t(`level.${level}`)}
    </span>
  );
}
