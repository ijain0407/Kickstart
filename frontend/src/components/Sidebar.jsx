import Icon from './Icon.jsx'
import { NAV_ITEMS, isActive } from './navItems.js'
import { useI18n } from '../i18n/I18nContext.jsx'
import { Link, useRouter } from '../router.jsx'
import { useChat } from '../chatbot/ChatContext.jsx'
import { STRINGS } from '../chatbot/config.js'

/** Desktop-only left rail: the five destinations, plus Leo the chat assistant. */
export default function Sidebar() {
  const { t, tr } = useI18n()
  const { open, setOpen } = useChat()
  const { path } = useRouter()

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav" aria-label={t('brand')}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, path)
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
        <button
          type="button"
          className={`sidebar__item sidebar__leo ${open ? 'is-active' : ''}`.trim()}
          aria-pressed={open}
          onClick={() => setOpen(!open)}
        >
          <Icon name="forum" fill={open} />
          <span>{tr(STRINGS.name)}</span>
        </button>
      </nav>
    </aside>
  )
}
