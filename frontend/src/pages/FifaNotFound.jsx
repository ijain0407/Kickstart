import Icon from '../components/Icon.jsx'
import { Link } from '../router.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

/** Unknown confederation or country: a friendly dead end with a way back. */
export default function FifaNotFound() {
  const { t } = useI18n()
  return (
    <div className="page fifa-page">
      <section className="card card--pad-lg stack stack-3" role="status">
        <span className="tile tile--gold tile--circle">
          <Icon name="search_off" fill />
        </span>
        <h1 className="t-headline-sm">{t('fifa.notFound.title')}</h1>
        <p className="t-body-md text-secondary">{t('fifa.notFound.body')}</p>
        <Link to="/fifa" className="fp fp--soft fifa-back">
          {t('fifa.notFound.back')}
        </Link>
      </section>
    </div>
  )
}
