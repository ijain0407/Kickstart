import Flag from '../components/Flag.jsx'
import StatCard from '../components/StatCard.jsx'
import PlayerPhoto from '../components/PlayerPhoto.jsx'
import FifaBreadcrumb from '../components/FifaBreadcrumb.jsx'
import Icon from '../components/Icon.jsx'
import { Link } from '../router.jsx'
import { FIFA_META } from '../data/fifa.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { countryName, fmt, formatDate, formatNumber } from '../lib/fifa.js'

/** Country detail: history, then a stat grid. Missing values render as N/A, never a guess. */
export default function FifaCountry({ confederation, code, country }) {
  const { t, tr, lang } = useI18n()
  const name = countryName(country, lang)
  const na = t('fifa.na')
  const num = (n) => (n == null ? na : formatNumber(n, lang))
  const rank = (n) => (n == null ? na : `#${formatNumber(n, lang)}`)

  const { hosts } = FIFA_META.tournament
  const player = country.famousPlayer

  return (
    <div className="page fifa-page">
      <FifaBreadcrumb
        items={[
          { to: '/fifa', label: t('fifa.title') },
          { to: `/fifa/${confederation.id}`, label: confederation.abbr },
          { label: name },
        ]}
      />

      <header className="card card--pad-lg fifa-hero">
        <Flag code={code} label={name} size="xl" />
        <div className="stack stack-2">
          <h1 className="t-headline-lg">{name}</h1>
          <div className="row row-2 wrap">
            <Link to={`/fifa/${confederation.id}`} className="pill pill--green-solid">
              {confederation.abbr}
            </Link>
            {hosts.includes(code) ? <span className="pill pill--gold">{t('fifa.coHost')}</span> : null}
          </div>
        </div>
      </header>

      <section className="card card--pad-lg stack stack-3" aria-labelledby="fifa-history">
        <h2 className="t-headline-sm" id="fifa-history">
          {t('fifa.historyTitle')}
        </h2>
        <p className="t-body-lg">{tr(country.history)}</p>
      </section>

      <section className="stack stack-3" aria-labelledby="fifa-stats">
        <h2 className="t-headline-sm" id="fifa-stats">
          {t('fifa.statsTitle')}
        </h2>
        <dl className="fifa-stats">
          <StatCard label={t('fifa.stats.mensRanking')} value={rank(country.mensRanking)} />
          <StatCard
            label={t('fifa.stats.womensRanking')}
            value={country.womensRanking == null ? t('fifa.notRanked') : rank(country.womensRanking)}
          />
          <StatCard label={t('fifa.stats.mensTitles')} value={num(country.mensTitles)} />
          <StatCard label={t('fifa.stats.womensTitles')} value={num(country.womensTitles)} />
          <StatCard
            label={t('fifa.stats.wc2026')}
            value={<span className="fifa-stat__text">{t(`fifa.stage.${country.wc2026}`)}</span>}
          />
          <StatCard label={t('fifa.stats.founded')} value={num(country.federationFounded)} />
          <StatCard
            wide
            label={t('fifa.stats.famousPlayer')}
            value={<span className="fifa-stat__text">{player.name}</span>}
            hint={
              <>
                <PlayerPhoto player={player} />
                <span className="pill pill--lavender">{tr(player.position)}</span>
                <span className="t-body-md">{tr(player.blurb)}</span>
                <span className="t-body-sm text-secondary">{t('fifa.playerNote')}</span>
              </>
            }
          />
        </dl>
        <p className="t-body-sm text-secondary">
          {fmt(t('fifa.rankingsAsOf'), {
            men: formatDate(FIFA_META.rankingsAsOf.men, lang),
            women: formatDate(FIFA_META.rankingsAsOf.women, lang),
          })}
        </p>
      </section>

      <Link to={`/fifa/${confederation.id}`} className="fp fp--soft fifa-back">
        <Icon name="arrow_back" />
        {fmt(t('fifa.backTo'), { name: confederation.abbr })}
      </Link>
    </div>
  )
}
