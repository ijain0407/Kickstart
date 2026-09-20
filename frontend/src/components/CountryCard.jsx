import Flag from './Flag.jsx'
import { Link } from '../router.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { countryName, fmt } from '../lib/fifa.js'

/** A country tile: flag and localized name, linking to its detail page. */
export default function CountryCard({ code, country, confederationId }) {
  const { t, lang } = useI18n()
  const name = countryName(country, lang)

  return (
    <Link
      to={`/fifa/${confederationId}/${code}`}
      className="card card--pad fifa-card fifa-card--country"
      aria-label={fmt(t('fifa.openCountry'), { name })}
    >
      <Flag code={code} label={name} />
      <span className="t-headline-sm">{name}</span>
    </Link>
  )
}
