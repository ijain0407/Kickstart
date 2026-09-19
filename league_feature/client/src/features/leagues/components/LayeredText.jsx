import { useTranslation } from 'react-i18next';

/** 'ca' -> 'Catalan' / 'catalán', with the raw code as a fallback. */
function languageName(code, locale) {
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}

function Layer({ label, lang, children }) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</h4>
      <p lang={lang} className="text-pretty">
        {children}
      </p>
    </div>
  );
}

/**
 * The three-layer format this feature is built around: what the fans actually sing,
 * what the words mean word-for-word, and the culture behind it. Side by side on wide
 * screens, stacked in the same order on phones.
 *
 * Generic on purpose — it renders a nickname, a chant, or anything else with the
 * same { original: { text, lang }, literal, meaning } shape.
 */
export default function LayeredText({ original, literal, meaning, className = '' }) {
  const { t, i18n } = useTranslation('leagues');
  const language = languageName(original.lang, i18n.resolvedLanguage || 'en');

  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
      <Layer label={`${t('layers.original')} · ${t('layers.inLanguage', { language })}`} lang={original.lang}>
        <q className="font-display text-lg font-bold">{original.text}</q>
      </Layer>
      <Layer label={t('layers.literal')}>{literal}</Layer>
      <Layer label={t('layers.meaning')}>{meaning}</Layer>
    </div>
  );
}
