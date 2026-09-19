import { useTranslation } from 'react-i18next';

/** `info` is the progress payload: xpIntoLevel, xpForNextLevel, progressPercent, nextLevel. */
export default function XPBar({ info }) {
  const { t } = useTranslation('progress');
  const max = info.xpForNextLevel;
  const label = max
    ? t('xpBar', { into: info.xpIntoLevel, total: max })
    : t('maxLevel');
  return (
    <div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={info.progressPercent}
        className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700"
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${info.progressPercent}%` }} />
      </div>
      <p className="mt-1 text-sm text-subtle">
        {info.nextLevel ? t('xpToNext', { xp: info.xpForNextLevel - info.xpIntoLevel, level: t(`level.${info.nextLevel}`, { ns: 'common' }) }) : label}
      </p>
    </div>
  );
}
