import Icon from './Icon.jsx'
import { NAV_ITEMS, isActive } from './navItems.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { Link, useRouter } from '../router.jsx'

/** Mobile bottom navigation. Becomes the sidebar at 841px and up. */
export default function TabBar() {
  const { t } = useI18n()
  const { path } = useRouter()

  return (
    <nav className="tabbar" aria-label={t('nav.learn')}>
      <div className="tabbar__inner">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, path)
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`tab ${active ? 'is-active' : ''}`.trim()}
              aria-current={active ? 'page' : undefined}
            >
              <Icon name={item.icon} fill={active} />
              <span className="tab__label">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
