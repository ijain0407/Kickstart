import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n.js';

// TODO(A): replaced by the app-wide language switcher. Also reused in Progress > Settings.
export default function LanguageToggle() {
  const { t, i18n } = useTranslation();
  return (
    <div role="group" aria-label={t('language.label')} className="flex gap-1">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          lang={lng}
          aria-pressed={i18n.resolvedLanguage === lng}
          onClick={() => i18n.changeLanguage(lng)}
          className={`min-h-[44px] min-w-[44px] rounded-btn px-3 font-semibold ${i18n.resolvedLanguage === lng ? 'bg-primary-dark text-white' : 'text-primary-dark hover:bg-green-100 dark:text-green-200 dark:hover:bg-slate-700'}`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
