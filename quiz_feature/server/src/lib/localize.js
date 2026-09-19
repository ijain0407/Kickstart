export const SUPPORTED_LOCALES = ['en', 'es'];
export const DEFAULT_LOCALE = 'en';

export function normalizeLocale(raw) {
  if (typeof raw !== 'string') return DEFAULT_LOCALE;
  const base = raw.split(',')[0].trim().split(';')[0].split('-')[0].toLowerCase();
  return SUPPORTED_LOCALES.includes(base) ? base : DEFAULT_LOCALE;
}

/** Pick a locale from a per-locale text object, falling back to English. */
export function loc(textObj, locale) {
  if (!textObj) return '';
  return textObj[locale] || textObj[DEFAULT_LOCALE] || '';
}
