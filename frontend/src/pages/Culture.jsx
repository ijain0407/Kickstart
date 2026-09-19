import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import ChantCard from '../components/ChantCard.jsx'
import { LEAGUES, getLeague } from '../data/leagues.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/** Club identity card — also used as the picker tile in "All Leagues". */
function ClubHero({ league, onClick }) {
  const { t, tr } = useI18n()
  const { club } = league
  const style = { '--club-a': club.colors.a, '--club-b': club.colors.b }

  const inner = (
    <div className="club-hero__inner">
      <div className="row row-2 wrap">
        <span className="t-label-meta" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {tr(club.region)}
        </span>
        <span className="t-body-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
          • {club.stadium} {club.capacity} {t('culture.capacity')}
        </span>
      </div>

      <div className="row row-2">
        <Icon name="star" fill style={{ color: 'var(--gold)', fontSize: 18 }} />
        <span className="t-body-sm" style={{ color: '#fff', fontWeight: 600 }}>
          {t('culture.tier1')}
        </span>
      </div>

      <div className="row row-3">
        <span className="club-crest">{club.crest}</span>
        <h2 className="t-headline-lg grow" style={{ color: '#fff' }}>
          {club.name}
        </h2>
      </div>

      <div className="row row-2 wrap">
        {club.tags.map((tag) => (
          <span
            key={tag.label.en}
            className={`pill ${tag.tone === 'gold' ? 'pill--gold' : 'pill--white'}`}
          >
            {tr(tag.label)}
          </span>
        ))}
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button type="button" className="club-hero" style={style} onClick={onClick}>
        {inner}
      </button>
    )
  }

  return (
    <section className="club-hero" style={style}>
      {inner}
    </section>
  )
}

export default function Culture() {
  const { t, tr } = useI18n()
  const { query, navigate } = useRouter()
  const { chantsMastered } = useApp()

  const [leagueId, setLeagueId] = useState(query.league ?? 'premier')
  const [openChantId, setOpenChantId] = useState(null)

  // Deep links from the matcher results land here with ?league=…
  useEffect(() => {
    if (query.league) setLeagueId(query.league)
  }, [query.league])

  const showingAll = leagueId === 'all'
  const league = getLeague(leagueId)
  const openId = openChantId ?? league.chants[0].id

  const learnChorus = (chant) => navigate(`/chant?league=${league.id}&id=${chant.id}`)

  return (
    <div className="page">
      <h1 className="t-headline-lg">{t('culture.pageTitle')}</h1>

      {/* ---- League chips ---- */}
      <div className="chip-row" role="group" aria-label={t('nav.culture')}>
        <button
          type="button"
          className={`chip ${showingAll ? 'is-active' : ''}`.trim()}
          aria-pressed={showingAll}
          onClick={() => setLeagueId('all')}
        >
          {t('culture.allLeagues')}
        </button>
        {LEAGUES.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`chip ${l.id === leagueId ? 'is-active' : ''}`.trim()}
            aria-pressed={l.id === leagueId}
            onClick={() => {
              setLeagueId(l.id)
              setOpenChantId(null)
            }}
          >
            {tr(l.name)}
          </button>
        ))}
      </div>

      {showingAll ? (
        <div className="stack stack-4">
          {LEAGUES.map((l) => (
            <ClubHero
              key={l.id}
              league={l}
              onClick={() => {
                setLeagueId(l.id)
                setOpenChantId(null)
              }}
            />
          ))}
        </div>
      ) : (
        <>
          <ClubHero league={league} />

          <div className="culture-grid stack stack-4">
            <div className="stack stack-4">
              {/* ---- Anthems ---- */}
              <div className="section-head">
                <h2 className="t-headline-md">{t('culture.anthemsTitle')}</h2>
                <span className="pill pill--gold">
                  {`${chantsMastered} ${t('common.of')} 4`}
                </span>
              </div>

              {league.chants.map((chant) =>
                chant.id === openId ? (
                  <ChantCard key={chant.id} chant={chant} onLearn={() => learnChorus(chant)} />
                ) : (
                  <button
                    key={chant.id}
                    type="button"
                    className="card chant-row"
                    onClick={() => setOpenChantId(chant.id)}
                  >
                    <span className="tile tile--lavender tile--circle">
                      <Icon name="music_note" fill />
                    </span>
                    <span className="grow stack stack-1">
                      <span className="t-headline-sm">{chant.title}</span>
                      <span className="t-body-sm text-secondary">{tr(chant.kicker)}</span>
                    </span>
                    <span className="icon-btn icon-btn--chevron">
                      <Icon name="expand_more" />
                    </span>
                  </button>
                ),
              )}
            </div>

            {/* ---- Tradition spotlight ---- */}
            <div className="stack stack-3">
              <h2 className="t-headline-md">{t('culture.spotlightTitle')}</h2>

              <article className="spotlight">
                <img
                  className="spotlight__img"
                  src={league.spotlight.image}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    // Placeholder photos may be unreachable offline; the
                    // gradient underneath keeps the card readable.
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="spotlight__scrim" />
                <div className="spotlight__body">
                  <div className="row row-2 wrap">
                    <span className="pill pill--gold">{tr(league.spotlight.pill)}</span>
                    <span className="t-body-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {league.spotlight.place}
                    </span>
                  </div>
                  <span className="t-label-meta" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {tr(league.spotlight.kicker)}
                  </span>
                  <h3 className="t-headline-sm" style={{ color: '#fff' }}>
                    {tr(league.spotlight.title)}
                  </h3>
                  <p className="t-body-md" style={{ color: 'rgba(255,255,255,0.86)' }}>
                    {tr(league.spotlight.body)}
                  </p>

                  <div className="spotlight__mini">
                    <Icon name="auto_awesome" fill style={{ color: 'var(--gold)' }} />
                    <span className="stack stack-1">
                      <span className="t-headline-sm" style={{ color: '#fff', fontSize: 15 }}>
                        {tr(league.spotlight.mini.title)}
                      </span>
                      <span className="t-body-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {tr(league.spotlight.mini.body)}
                      </span>
                    </span>
                  </div>
                </div>
              </article>

              <button
                type="button"
                className="fp fp--tertiary"
                onClick={() => navigate('/quiz')}
              >
                {t('home.findLeague')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
