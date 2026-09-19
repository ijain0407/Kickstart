const SUPPORTED_LANGS = ["en", "es"];

/**
 * Recursively flattens { en, es } LocalizedString objects into a plain string
 * for the given lang, falling back to `en` when the translation is missing.
 * Leaves non-LocalizedString values untouched.
 */
function localizeValue(value, lang) {
  if (Array.isArray(value)) {
    return value.map((item) => localizeValue(item, lang));
  }

  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    const isLocalizedString =
      keys.length > 0 && keys.every((k) => SUPPORTED_LANGS.includes(k));

    if (isLocalizedString) {
      return value[lang] || value.en;
    }

    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, localizeValue(v, lang)])
    );
  }

  return value;
}

export function localize(data, lang) {
  if (!lang) return data;
  return localizeValue(data, lang);
}

export function isSupportedLang(lang) {
  return SUPPORTED_LANGS.includes(lang);
}

export { SUPPORTED_LANGS };
