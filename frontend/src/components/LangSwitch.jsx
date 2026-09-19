import { useI18n } from '../i18n/I18nContext.jsx'

/**
 * Split pill with a sliding white thumb. Flipping it re-renders every
 * string on the page, because all copy resolves through useI18n().
 */
export default function LangSwitch({ wide = false, className = '' }) {
  const { lang, setLang, t } = useI18n()
  const index = lang === 'es' ? 1 : 0

  return (
    <div
      className={`lang ${wide ? 'lang--wide' : ''} ${className}`.trim()}
      role="group"
      aria-label={t('lang.label')}
    >
      <span className="lang__thumb" data-i={index} />
      {['en', 'es'].map((code) => (
        <button
          key={code}
          type="button"
          className={`lang__seg ${lang === code ? 'is-active' : ''}`.trim()}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {wide ? t(`lang.${code}Long`) : t(`lang.${code}`)}
        </button>
      ))}
    </div>
  )
}
