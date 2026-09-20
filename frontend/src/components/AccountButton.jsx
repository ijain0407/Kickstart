import Icon from './Icon.jsx'
import { Link } from '../router.jsx'
import { useAuth } from '../state/AuthState.jsx'
import { useApp } from '../state/AppState.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

/** Two letters from a name or email, for the avatar disc. */
function initials(user) {
  const source = (user?.displayName || user?.email || '').trim()
  if (!source) return '??'
  const words = source.split(/[\s._-]+/).filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words[1][0] : source.slice(0, 2)
  return letters.toUpperCase()
}

/**
 * The header's account control.
 *
 *   signed in          -> avatar with initials and level, opens the account page
 *   signed out         -> a "Sign in" button, so the page is actually reachable
 *   accounts disabled  -> the plain avatar, linking to the progress page as before
 */
export default function AccountButton() {
  const { t } = useI18n()
  const { level } = useApp()
  const { user, accounts, loading } = useAuth()

  if (accounts && !user && !loading) {
    return (
      <Link to="/account" className="signin-pill">
        <Icon name="login" />
        <span className="signin-pill__text">{t('account.signInCta')}</span>
      </Link>
    )
  }

  const to = accounts ? '/account' : '/profile'
  const label = user ? `${user.displayName} — ${t('account.title')}` : t('appbar.avatarLabel')

  return (
    <Link to={to} className="avatar" aria-label={label}>
      <span className="avatar__img" aria-hidden="true">
        {user ? initials(user) : 'KS'}
      </span>
      <span className="avatar__level" aria-hidden="true">
        L{level}
      </span>
    </Link>
  )
}
