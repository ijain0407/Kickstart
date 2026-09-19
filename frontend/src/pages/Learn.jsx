import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import LangSwitch from '../components/LangSwitch.jsx'
import PitchBoard from '../components/PitchBoard.jsx'
import PlayerToken from '../components/PlayerToken.jsx'
import PitchPass from '../components/PitchPass.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useRouter } from '../router.jsx'

/* The five shirts in the hero preview. The pass runs 4 → 8 → 11. */
const HERO_PLAYERS = [
  { num: 1, code: 'GK', top: 88, left: 50, gold: true },
  { num: 4, code: 'CB', top: 71, left: 26 },
  { num: 8, code: 'CM', top: 50, left: 44, highlight: true },
  { num: 11, code: 'LW', top: 28, left: 20 },
  { num: 9, code: 'ST', top: 20, left: 62, gold: true },
]

const MODULES = [
  { key: 'tactics', icon: 'sports_soccer', tone: 'blue', to: '/field', labelColor: '#0284c7' },
  { key: 'league', icon: 'emoji_events', tone: 'orange', to: '/quiz', labelColor: '#ea580c' },
  { key: 'culture', icon: 'campaign', tone: 'red', to: '/culture', labelColor: '#dc2626' },
]

export default function Learn() {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const playDrill = () => navigate('/lesson?id=1.2')

  return (
    <div className="page">
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="hero__turf" aria-hidden="true" />
        <div className="hero__inner">
          <div className="hero__copy">
            <span className="pill pill--ghost">
              <Icon name="sports_soccer" fill />
              {t('home.heroTag')}
            </span>

            <h1 className="t-headline-xl">{t('home.heroTitle')}</h1>
            <p className="hero__sub">{t('home.heroSub')}</p>

            <div className="hero__actions">
              <FieldPressButton
                variant="primary"
                block
                iconAfter="arrow_forward"
                onClick={() => navigate('/path')}
              >
                {t('home.startLearning')}
              </FieldPressButton>
              <FieldPressButton
                variant="secondary"
                block
                icon="explore"
                onClick={() => navigate('/quiz')}
              >
                {t('home.findLeague')}
              </FieldPressButton>
            </div>
          </div>

          {/* Mini tactical preview with a looping dashed pass */}
          <PitchBoard
            className="hero__pitch pitch--mini"
            markings="simple"
            aria-label={t('home.passPreviewLabel')}
          >
            <svg
              className="pass-path"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M26 71 Q 30 58 44 50 Q 34 40 20 28" />
            </svg>

            {HERO_PLAYERS.map((p) => (
              <PlayerToken
                key={p.num}
                player={p}
                gold={p.gold}
                highlight={p.highlight}
              />
            ))}
          </PitchBoard>
        </div>
      </section>

      {/* ---- Match day ---- */}
      <button type="button" className="matchday" onClick={() => navigate('/play')}>
        <span className="matchday__turf" aria-hidden="true" />
        <span className="matchday__inner">
          <span className="pill pill--ghost">
            <Icon name="stadium" fill />
            {t('play.kicker')}
          </span>
          <span className="t-headline-md" style={{ color: '#fff' }}>
            {t('play.title')}
          </span>
          <span className="t-body-md" style={{ color: 'rgba(255,255,255,0.82)' }}>
            {t('home.matchdayTeaser')}
          </span>
          <span className="pill pill--white">
            <Icon name="play_arrow" fill />
            {t('play.kickOff')}
          </span>
        </span>
      </button>

      {/* ---- Instant dual immersion ---- */}
      <section className="immersion">
        <div className="row row-3">
          <Icon name="translate" style={{ color: '#4338ca', fontSize: 22 }} />
          <h2 className="t-headline-md grow">{t('home.immersionTitle')}</h2>
        </div>

        <LangSwitch wide />

        <div className="immersion__note">
          <Icon name="check_circle" fill />
          <p className="t-body-md">{t('home.immersionNote')}</p>
        </div>
      </section>

      {/* ---- Today's drill ---- */}
      <section className="drill">
        <span className="drill__flag">
          <Icon name="flag" fill />
        </span>

        <div className="drill__body">
          <div className="row row-2 wrap">
            <span className="t-label-meta" style={{ color: 'var(--gold-badge-text)' }}>
              {t('home.drillTag')}
            </span>
            <span className="pill pill--green">{t('home.drillXp')}</span>
          </div>
          <h3 className="t-headline-sm">{t('home.drillTitle')}</h3>
          <p className="t-body-md text-secondary">{t('home.drillCopy')}</p>
        </div>

        <FieldPressButton variant="primary" size="sm" iconAfter="play_arrow" onClick={playDrill}>
          {t('home.drillPlay')}
        </FieldPressButton>
      </section>

      {/* ---- Your Pitch Pass ---- */}
      <PitchPass />

      {/* ---- Core training modules ---- */}
      <section className="stack stack-3">
        <div className="section-head">
          <h2 className="t-headline-lg">{t('home.modulesTitle')}</h2>
          <span className="t-body-sm text-secondary">{t('home.modulesCount')}</span>
        </div>

        <div className="modules-grid stack stack-3">
          {MODULES.map((mod) => (
            <button
              key={mod.key}
              type="button"
              className="card module"
              onClick={() => navigate(mod.to)}
            >
              <span className={`tile tile--${mod.tone}`}>
                <Icon name={mod.icon} fill />
              </span>

              <span className="module__body">
                <span className="module__meta">
                  <span style={{ color: mod.labelColor }}>{t(`home.modules.${mod.key}.cat`)}</span>
                  <span className="dot">·</span>
                  <span className="dur">{t(`home.modules.${mod.key}.dur`)}</span>
                </span>
                <span className="t-headline-sm">{t(`home.modules.${mod.key}.title`)}</span>
                <span className="module__desc">{t(`home.modules.${mod.key}.desc`)}</span>
              </span>

              <span className="icon-btn icon-btn--chevron module__chev">
                <Icon name="chevron_right" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
