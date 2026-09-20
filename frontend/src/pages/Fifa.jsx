import ConfederationCard from '../components/ConfederationCard.jsx'
import FifaConfederation from './FifaConfederation.jsx'
import FifaCountry from './FifaCountry.jsx'
import FifaNotFound from './FifaNotFound.jsx'
import { CONFEDERATIONS, COUNTRIES, getConfederation } from '../data/fifa.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useRouter } from '../router.jsx'

/**
 * FIFA Culture. The router only matches exact paths, so this one page owns the
 * whole /fifa subtree and picks a view from the path:
 *   /fifa                         landing
 *   /fifa/:confederationId        teams at the 2026 World Cup
 *   /fifa/:confederationId/:code  country detail
 * All content is static, so there is no loading or error state to handle.
 */
export default function Fifa() {
  const { path } = useRouter()
  const [, , confederationId, code, ...extra] = path.split('/')

  if (!confederationId) return <FifaLanding />

  const confederation = getConfederation(confederationId)
  if (!confederation || extra.length) return <FifaNotFound />
  if (!code) return <FifaConfederation confederation={confederation} />

  const country = confederation.teams.includes(code) ? COUNTRIES[code] : undefined
  if (!country) return <FifaNotFound />
  return <FifaCountry confederation={confederation} code={code} country={country} />
}

function FifaLanding() {
  const { t } = useI18n()
  return (
    <div className="page fifa-page">
      <header className="stack stack-2">
        <h1 className="t-headline-lg">{t('fifa.title')}</h1>
        <p className="t-body-lg text-secondary fifa-intro">{t('fifa.intro')}</p>
      </header>

      <section className="stack stack-3" aria-labelledby="fifa-confs">
        <h2 className="t-headline-sm" id="fifa-confs">
          {t('fifa.confederationsTitle')}
        </h2>
        <div className="fifa-grid">
          {CONFEDERATIONS.map((c) => (
            <ConfederationCard key={c.id} confederation={c} />
          ))}
        </div>
      </section>
    </div>
  )
}
