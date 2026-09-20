import Icon from './Icon.jsx'
import { Link } from '../router.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { fmt, formatNumber } from '../lib/fifa.js'

/** One confederation on the FIFA landing page: name, abbreviation, region, team count. */
export default function ConfederationCard({ confederation }) {
  const { t, tr, lang } = useI18n()
  const count = confederation.teams.length
  const teams = fmt(t(count === 1 ? 'fifa.teamsOne' : 'fifa.teamsOther'), { n: formatNumber(count, lang) })

  return (
    <Link
      to={`/fifa/${confederation.id}`}
      className="card card--pad fifa-card"
      aria-label={fmt(t('fifa.openConfederation'), { name: `${confederation.abbr}, ${tr(confederation.name)}` })}
    >
      <div className="row row-2">
        <span className="pill pill--green-solid">{confederation.abbr}</span>
        <span className="t-label-meta text-secondary">{tr(confederation.region)}</span>
      </div>
      <h3 className="t-headline-sm">{tr(confederation.name)}</h3>
      <div className="row row-2 fifa-card__foot">
        <span className="t-body-md grow">{teams}</span>
        <Icon name="arrow_forward" />
      </div>
    </Link>
  )
}
