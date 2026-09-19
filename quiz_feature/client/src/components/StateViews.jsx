import { useTranslation } from 'react-i18next';

export function Skeleton({ className = 'h-24' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-card bg-gray-200 motion-reduce:animate-none dark:bg-slate-700 ${className}`} />;
}

export function LoadingBlock({ label }) {
  const { t } = useTranslation();
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">{label ?? t('loading')}</span>
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-40" />
      <Skeleton className="h-24" />
    </div>
  );
}

export function ErrorState({ message, error, onRetry }) {
  const { t } = useTranslation();
  const detail = error?.code === 'NETWORK' ? t('errors.network') : t('errors.generic');
  return (
    <div role="alert" className="card border-2 border-red-700 text-red-950 dark:text-red-50">
      <p className="font-semibold">{message}</p>
      <p className="mt-1 text-sm">{detail}</p>
      {onRetry && (
        <button type="button" className="btn-primary mt-4" onClick={onRetry}>
          {t('retry')}
        </button>
      )}
    </div>
  );
}
