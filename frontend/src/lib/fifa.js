/** Replace {token} placeholders, e.g. fmt('Open {name}', { name: 'Spain' }). */
export function fmt(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
}

const displayNames = {}

/**
 * Localized country name. Uses Intl.DisplayNames for ISO regions; England,
 * Scotland and a few short forms carry their own { en, es } pair in the data.
 */
export function countryName(country, lang) {
  if (country.name) return country.name[lang] ?? country.name.en
  try {
    displayNames[lang] ??= new Intl.DisplayNames([lang], { type: 'region' })
    return displayNames[lang].of(country.iso2) ?? country.iso2
  } catch {
    return country.iso2
  }
}

/** Locale-aware number, e.g. 1 -> "1". Used for ranks and title counts. */
export const formatNumber = (n, lang) => new Intl.NumberFormat(lang).format(n)

/** "2026-07-20" -> "July 20, 2026" / "20 de julio de 2026". */
export function formatDate(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)))
}
