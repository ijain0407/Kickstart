export const SUPPORTED_LOCALES = ['en', 'es'];
export const DEFAULT_LOCALE = 'en';

/** 'es-MX,es;q=0.9' -> 'es'. Anything unsupported falls back to English. */
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

function isLocalizedString(value) {
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((k) => SUPPORTED_LOCALES.includes(k) && typeof value[k] === 'string');
}

/**
 * Walks a content record and replaces every { en, es } object with the string for
 * `locale`, falling back to English. Objects that merely contain such fields (a
 * chant, a rivalry) are walked through; everything else is copied as-is.
 *
 * Note the deliberate asymmetry with a chant's `original` text: that field is
 * { text, lang }, not { en, es }, so it survives untouched in every locale — the
 * whole point of the three-layer format is that the original is never translated.
 */
export function localizeDeep(value, locale) {
  if (Array.isArray(value)) return value.map((item) => localizeDeep(item, locale));
  if (value && typeof value === 'object') {
    if (isLocalizedString(value)) return loc(value, locale);
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localizeDeep(v, locale)]));
  }
  return value;
}
