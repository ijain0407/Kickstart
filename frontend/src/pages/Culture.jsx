import { useCallback, useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import ChantCard from '../components/ChantCard.jsx'
import DataState from '../components/DataState.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import { api, useResource } from '../lib/api.js'
import { toChantCard, toClubHero, toSpotlight } from '../lib/adapters.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { useRouter } from '../router.jsx'

/** Club identity card — also the picker tile when several clubs are listed. */
function ClubHero({ club, leagueName, onClick }) {
  const { t, tr } = useI18n()
  const style = {
    '--club-a': club.colors.a,
    '--club-b': club.colors.b,
    ...(club.imageUrl ? { backgroundImage: `url(${club.imageUrl})` } : null),
  }
  // The motif is drawn from the club's colours — stripes, hoops or a centre
  // band. No crests or logos: those are trademarks, and this is our own artwork.
  const kitClass = `club-crest club-crest--${club.kit?.pattern ?? 'solid'}`

  const inner = (
    <div className="club-hero__inner">
      <div className="row row-2 wrap">
        <span className="t-label-meta" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {club.region}
        </span>
        {club.stadium ? (
          <span className="t-body-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
            • {club.stadium}
          </span>
        ) : null}
      </div>

      <div className="row row-2">
        <Icon name="star" fill style={{ color: 'var(--gold)', fontSize: 18 }} />
        <span className="t-body-sm" style={{ color: '#fff', fontWeight: 600 }}>
          {leagueName} · {t('culture.founded')} {club.founded}
        </span>
      </div>

      <div className="row row-3">
        {club.crestUrl ? (
          <img
            className="club-crest club-crest--img"
            src={club.crestUrl}
            alt=""
            loading="lazy"
            /* If the file is missing or won't decode, drop back to the motif
               rather than leaving a broken image in the header. */
            onError={(e) => e.currentTarget.classList.add('is-broken')}
          />
        ) : (
          <span className={kitClass} aria-hidden="true">
            <span className="club-crest__text">{club.crest}</span>
          </span>
        )}
        <h2 className="t-headline-lg grow" style={{ color: '#fff' }}>
          {club.name}
        </h2>
      </div>

      <div className="row row-2 wrap">
        {club.tags.map((tag) => (
          <span key={tag.label} className={`pill ${tag.tone === 'gold' ? 'pill--gold' : 'pill--white'}`}>
            {tr(tag.label)}
          </span>
        ))}
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button type="button" className={`club-hero ${club.imageUrl ? 'club-hero--photo' : ''}`.trim()} style={style} onClick={onClick}>
        {inner}
      </button>
    )
  }
  return (
    <section className={`club-hero ${club.imageUrl ? 'club-hero--photo' : ''}`.trim()} style={style}>
      {inner}
    </section>
  )
}

export default function Culture() {
  const { t, tr, lang } = useI18n()
  const { query, navigate } = useRouter()
  const { chantsMastered } = useApp()

  const [leagueId, setLeagueId] = useState(query.league ?? 'all')
  const [cultureId, setCultureId] = useState(query.club ?? null)
  const [openChantId, setOpenChantId] = useState(null)
  const [search, setSearch] = useState('')

  // Deep links from the matcher results land here with ?league=… (&club=…)
  useEffect(() => {
    if (query.league) setLeagueId(query.league)
    setCultureId(query.club ?? null)
  }, [query.league, query.club])

  const leaguesReq = useResource((signal) => api('/leagues', { lang, signal }), [lang])
  const cardsReq = useResource(
    (signal) => api(leagueId === 'all' ? '/culture' : `/culture?league=${leagueId}`, { lang, signal }),
    [lang, leagueId],
  )
  const detailReq = useResource(
    (signal) => (cultureId ? api(`/culture/${cultureId}`, { lang, signal }) : Promise.resolve(null)),
    [lang, cultureId],
  )

  const labels = {
    draft: t('culture.draftNote'),
    chant: t('culture.chantKicker'),
    kicker: t('culture.spotlightKicker'),
    miniTitle: t('culture.miniTitle'),
  }

  const openClub = useCallback((card) => {
    setCultureId(card.id)
    setOpenChantId(null)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const leagues = leaguesReq.data?.leagues ?? []
  const allCards = cardsReq.data?.cards ?? []
  const detail = detailReq.data
  const leagueNameOf = (id) => leagues.find((l) => l.id === id)?.name ?? ''

  const searchTerm = search.trim().toLowerCase()
  const cards = searchTerm
    ? allCards.filter(
        (card) =>
          card.club.toLowerCase().includes(searchTerm) || card.nickname?.original?.text?.toLowerCase().includes(searchTerm),
      )
    : allCards

  return (
    <div className="page">
      <h1 className="t-headline-lg">{t('culture.pageTitle')}</h1>

      {/* ---- League chips ---- */}
      <div className="chip-row" role="group" aria-label={t('nav.culture')}>
        <button
          type="button"
          className={`chip ${leagueId === 'all' ? 'is-active' : ''}`.trim()}
          aria-pressed={leagueId === 'all'}
          onClick={() => {
            setLeagueId('all')
            setCultureId(null)
          }}
        >
          {t('culture.allLeagues')}
        </button>
        {leagues.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`chip ${l.id === leagueId ? 'is-active' : ''}`.trim()}
            aria-pressed={l.id === leagueId}
            onClick={() => {
              setLeagueId(l.id)
              setCultureId(null)
              setOpenChantId(null)
            }}
          >
            {tr(l.name)}
          </button>
        ))}
      </div>

      {/* ---- Club picker ---- */}
      {!cultureId ? (
        <DataState loading={cardsReq.loading || leaguesReq.loading} error={cardsReq.error ?? leaguesReq.error} onRetry={cardsReq.reload}>
          <div className="stack stack-4">
            <label className="search-field">
              <Icon name="search" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('culture.searchPlaceholder')}
                aria-label={t('culture.searchPlaceholder')}
              />
              {search ? (
                <button type="button" className="search-field__clear" aria-label={t('common.clear')} onClick={() => setSearch('')}>
                  <Icon name="close" />
                </button>
              ) : null}
            </label>

            <h2 className="t-headline-md">{leagueId === 'all' ? t('culture.allLeagues') : t('culture.clubsIn')}</h2>

            {/* Too many clubs to choose blind — offer the matcher for this league. */}
            {leagueId !== 'all' ? (
              <section className="card card--pad stack stack-2">
                <h3 className="t-headline-sm">{t('clubQuiz.cta')}</h3>
                <p className="t-body-sm text-secondary">{t('clubQuiz.ctaSub')}</p>
                <FieldPressButton
                  variant="secondary"
                  block
                  iconAfter="arrow_forward"
                  onClick={() => navigate(`/club-quiz?league=${leagueId}`)}
                >
                  {t('clubQuiz.cta')}
                </FieldPressButton>
              </section>
            ) : null}
            {cards.map((card) => (
              <ClubHero
                key={card.id}
                club={toClubHero(card, { leagueId: card.leagueId, labels })}
                leagueName={tr(leagueNameOf(card.leagueId))}
                onClick={() => openClub(card)}
              />
            ))}
            {cards.length === 0 ? <p className="placeholder-note">{t('culture.searchEmpty')}</p> : null}
          </div>
        </DataState>
      ) : (
        <DataState loading={detailReq.loading} error={detailReq.error} onRetry={detailReq.reload}>
          {detail ? (
            <ClubDetail
              detail={detail}
              labels={labels}
              openChantId={openChantId}
              setOpenChantId={setOpenChantId}
              chantsMastered={chantsMastered}
              onPickClub={openClub}
              onBack={() => setCultureId(null)}
              onLearnChorus={(chant) => navigate(`/chant?club=${detail.card.id}&id=${chant.id}`)}
              onFindLeague={() => navigate('/quiz')}
            />
          ) : null}
        </DataState>
      )}
    </div>
  )
}

function ClubDetail({
  detail,
  labels,
  openChantId,
  setOpenChantId,
  chantsMastered,
  onPickClub,
  onBack,
  onLearnChorus,
  onFindLeague,
}) {
  const { t, tr } = useI18n()
  const { card, league, related } = detail
  const chants = card.chants.map((chant) => toChantCard(chant, { labels }))
  const openId = openChantId ?? chants[0]?.id
  const spotlight = toSpotlight(card, { leagueName: league?.name ?? '', labels })

  return (
    <>
      <button type="button" className="chip" onClick={onBack}>
        <Icon name="arrow_back" /> {league?.name ?? t('common.back')}
      </button>

      <ClubHero club={toClubHero(card, { leagueId: card.leagueId, labels })} leagueName={league?.name ?? ''} />

      {/* ---- Nickname: the same three layers as a chant ---- */}
      <section className="card card--pad stack stack-2">
        <span className="t-label-meta text-secondary">{t('culture.nickname')}</span>
        <h3 className="t-headline-md">{card.nickname.original.text}</h3>
        <p className="t-body-md text-secondary">{card.nickname.literal}</p>
        <p className="t-body-md">{card.nickname.meaning}</p>
      </section>

      <div className="culture-grid stack stack-4">
        <div className="stack stack-4">
          {/* ---- Anthems ---- */}
          <div className="section-head">
            <h2 className="t-headline-md">{t('culture.anthemsTitle')}</h2>
            <span className="pill pill--gold">{`${chantsMastered} ${t('common.of')} 4`}</span>
          </div>

          {chants.map((chant) =>
            chant.id === openId ? (
              <ChantCard key={chant.id} chant={chant} onLearn={() => onLearnChorus(chant)} />
            ) : (
              <button key={chant.id} type="button" className="card chant-row" onClick={() => setOpenChantId(chant.id)}>
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

          {/* ---- Rivalries ---- */}
          {card.rivalries.length > 0 ? (
            <div className="stack stack-3">
              <h2 className="t-headline-md">{t('culture.rivalries')}</h2>
              {card.rivalries.map((rivalry) => (
                <article key={rivalry.name} className="card card--pad stack stack-2">
                  <div className="row row-2 wrap">
                    <span className="t-headline-sm">{rivalry.name}</span>
                    <span className="pill pill--ghost">{rivalry.opponent}</span>
                  </div>
                  <p className="t-body-md text-secondary">{rivalry.description}</p>
                  {rivalry.opponentCultureId ? (
                    <button
                      type="button"
                      className="fp fp--tertiary"
                      onClick={() => onPickClub({ id: rivalry.opponentCultureId })}
                    >
                      {rivalry.opponent} <Icon name="arrow_forward" />
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </div>

        {/* ---- Tradition spotlight ---- */}
        <div className="stack stack-3">
          <h2 className="t-headline-md">{t('culture.spotlightTitle')}</h2>

          <article className="spotlight spotlight--flat">
            <div className="spotlight__scrim" />
            <div className="spotlight__body">
              <div className="row row-2 wrap">
                <span className="pill pill--gold">{spotlight.pill}</span>
                <span className="t-body-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {spotlight.place}
                </span>
              </div>
              <span className="t-label-meta" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {spotlight.kicker}
              </span>
              <h3 className="t-headline-sm" style={{ color: '#fff' }}>
                {spotlight.title}
              </h3>
              <p className="t-body-md" style={{ color: 'rgba(255,255,255,0.86)' }}>
                {spotlight.body}
              </p>

              {spotlight.mini ? (
                <div className="spotlight__mini">
                  <Icon name="auto_awesome" fill style={{ color: 'var(--gold)' }} />
                  <span className="stack stack-1">
                    <span className="t-headline-sm" style={{ color: '#fff', fontSize: 15 }}>
                      {spotlight.mini.title}
                    </span>
                    <span className="t-body-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {spotlight.mini.body}
                    </span>
                  </span>
                </div>
              ) : null}
            </div>
          </article>

          {/* ---- Other clubs in the same league ---- */}
          {related?.length ? (
            <div className="stack stack-2">
              <h3 className="t-headline-sm">{t('culture.otherClubs')}</h3>
              <div className="chip-row">
                {related.map((other) => (
                  <button key={other.id} type="button" className="chip" onClick={() => onPickClub(other)}>
                    {other.club}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button type="button" className="fp fp--tertiary" onClick={onFindLeague}>
            {t('home.findLeague')}
          </button>
        </div>
      </div>
    </>
  )
}
