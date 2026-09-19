import { useTranslation } from 'react-i18next';
import Icon from '../../../components/Icon.jsx';

/** Earned = full colour. Locked = greyscale with a lock icon and text (not colour alone). */
export default function BadgeCard({ badge, onSelect, selected = false }) {
  const { t } = useTranslation('progress');
  const name = t(`badge.${badge.id}.name`);
  const state = badge.earned ? t('badges.earned') : t('badges.locked');
  return (
    <button
      type="button"
      onClick={() => onSelect?.(badge)}
      aria-pressed={selected}
      aria-label={`${name}, ${state}`}
      className={`card relative flex min-h-[112px] flex-col items-center justify-center gap-2 text-center ${selected ? 'ring-2 ring-sky' : ''} ${badge.earned ? '' : 'grayscale'}`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-full ${badge.earned ? 'bg-amber-100 text-amber-900' : 'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-200'}`}>
        <Icon name={badge.icon} className="h-6 w-6" />
      </span>
      <span className="text-sm font-semibold leading-tight">{name}</span>
      {!badge.earned && <Icon name="lock" className="absolute right-3 top-3 h-4 w-4 text-gray-600 dark:text-slate-300" />}
    </button>
  );
}
