import Icon from './Icon.jsx'
import { NAV_ITEMS } from './navItems.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { Link, useRouter } from '../router.jsx'

/** Desktop-only left rail carrying the same five destinations. */
export default function Sidebar() {
  const { t } = useI18n()
  const { path } = useRouter()

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav" aria-label={t('brand')}>
        {NAV_ITEMS.map((item) => {
          const active = item.match.includes(path)
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`sidebar__item ${active ? 'is-active' : ''}`.trim()}
              aria-current={active ? 'page' : undefined}
            >
              <Icon name={item.icon} fill={active} />
              <span>{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
