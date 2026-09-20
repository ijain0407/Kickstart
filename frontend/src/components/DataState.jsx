import Icon from './Icon.jsx'
import FieldPressButton from './FieldPressButton.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

/** Shimmering stand-in while a request is in flight. */
export function Loading({ rows = 3 }) {
  const { t } = useI18n()
  return (
    <div className="stack stack-3" role="status">
      <span className="sr-only">{t('common.loading')}</span>
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} className="skeleton" aria-hidden="true" style={{ height: i === 0 ? 96 : 64 }} />
      ))}
    </div>
  )
}

/** A failed request, with a way back. */
export function ErrorState({ error, onRetry }) {
  const { t } = useI18n()
  return (
    <section className="card card--pad-lg stack stack-3" role="alert">
      <span className="tile tile--red tile--circle">
        <Icon name="cloud_off" fill />
      </span>
      <h2 className="t-headline-sm">{t('common.loadError')}</h2>
      {error?.message ? <p className="t-body-sm text-secondary">{error.message}</p> : null}
      {onRetry ? (
        <FieldPressButton variant="soft" icon="refresh" onClick={onRetry}>
          {t('common.retry')}
        </FieldPressButton>
      ) : null}
    </section>
  )
}

/** Loading / error / ready in one wrapper, so pages stay readable. */
export default function DataState({ loading, error, onRetry, rows, children }) {
  if (loading) return <Loading rows={rows} />
  if (error) return <ErrorState error={error} onRetry={onRetry} />
  return children
}
