import Icon from './Icon.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useTheme } from '../state/ThemeContext.jsx'

/** Round icon button that flips between light and dark. */
export default function ThemeToggle({ className = '' }) {
  const { t } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      aria-pressed={dark}
      aria-label={t('theme.label')}
      title={dark ? t('theme.light') : t('theme.dark')}
      onClick={toggleTheme}
    >
      <Icon name={dark ? 'light_mode' : 'dark_mode'} />
    </button>
  )
}
