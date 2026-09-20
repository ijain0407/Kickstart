import CountryCard from '../components/CountryCard.jsx'
import FifaBreadcrumb from '../components/FifaBreadcrumb.jsx'
import { COUNTRIES } from '../data/fifa.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { fmt, formatNumber } from '../lib/fifa.js'

/** A confederation and the countries it sent to the 2026 World Cup. */
export default function FifaConfederation({ confederation }) {
  const { t, tr, lang } = useI18n()
  const count = confederation.teams.length
  const teams = fmt(t(count === 1 ? 'fifa.teamsOne' : 'fifa.teamsOther'), { n: formatNumber(count, lang) })

  return (
    <div className="page fifa-page">
      <FifaBreadcrumb
        items={[
          { to: '/fifa', label: t('fifa.title') },
          { label: confederation.abbr },
        ]}
      />

      <header className="stack stack-2">
        <div className="row row-2 wrap">
          <span className="pill pill--green-solid">{confederation.abbr}</span>
          <span className="t-label-meta text-secondary">{tr(confederation.region)}</span>
        </div>
        <h1 className="t-headline-lg">{tr(confederation.name)}</h1>
        <p className="t-body-lg text-secondary fifa-intro">{tr(confederation.description)}</p>
      </header>

      <section className="stack stack-3" aria-labelledby="fifa-teams">
        <div className="row row-2 wrap">
          <h2 className="t-headline-sm" id="fifa-teams">
            {t('fifa.confederationTeamsTitle')}
          </h2>
          <span className="pill pill--grey">{teams}</span>
        </div>

        {count === 0 ? (
          <p className="card card--pad t-body-md text-secondary">{t('fifa.confederationEmpty')}</p>
        ) : (
          // A single team (OFC) gets one card at normal width rather than a stretched row.
          <ul className={`fifa-grid fifa-grid--countries ${count === 1 ? 'fifa-grid--single' : ''}`.trim()}>
            {confederation.teams.map((code) => (
              <li key={code}>
                <CountryCard code={code} country={COUNTRIES[code]} confederationId={confederation.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
