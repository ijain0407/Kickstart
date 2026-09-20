import Icon from './Icon.jsx'
import { Link } from '../router.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

/** FIFA Culture > Confederation > Country. `items` are { to, label }; the last is the current page. */
export default function FifaBreadcrumb({ items }) {
  const { t } = useI18n()
  return (
    <nav aria-label={t('fifa.crumbLabel')}>
      <ol className="fifa-crumbs">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={item.label} className="row row-2">
              {last ? (
                <span aria-current="page" className="fifa-crumbs__current">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link to={item.to} className="fifa-crumbs__link">
                    {item.label}
                  </Link>
                  <Icon name="chevron_right" />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
