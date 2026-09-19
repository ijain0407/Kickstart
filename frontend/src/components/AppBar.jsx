import Logo from './Logo.jsx'
import Icon from './Icon.jsx'
import LangSwitch from './LangSwitch.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useApp } from '../state/AppState.jsx'
import { Link } from '../router.jsx'

/** Sticky white bar: brand, language pill, streak, avatar with level badge. */
export default function AppBar() {
  const { t } = useI18n()
  const { streak, level } = useApp()

  return (
    <header className="appbar">
      <div className="appbar__inner">
        <Link to="/" className="appbar__brand" aria-label={t('brand')}>
          <Logo size={32} className="appbar__logo" id="bar" />
          <span className="appbar__wordmark">{t('brand')}</span>
        </Link>

        <LangSwitch />

        <Link
          to="/streak"
          className="streak-pill"
          aria-label={`${streak} ${t('appbar.streakLabel')} — ${t('streak.title')}`}
        >
          <Icon name="local_fire_department" fill />
          <span className="t-num streak-pill__n">{streak}</span>
        </Link>

        <Link to="/profile" className="avatar" aria-label={t('appbar.avatarLabel')}>
          <span className="avatar__img" aria-hidden="true">
            IJ
          </span>
          <span className="avatar__level" aria-hidden="true">
            L{level}
          </span>
        </Link>
      </div>
    </header>
  )
}
