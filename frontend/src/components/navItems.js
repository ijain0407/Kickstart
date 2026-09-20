/** The destinations, shared by the mobile tab bar and the desktop sidebar. */
export const NAV_ITEMS = [
  { id: 'learn', to: '/', icon: 'menu_book', labelKey: 'nav.learn', match: ['/', '/path', '/lesson', '/streak', '/profile', '/drills'] },
  { id: 'field', to: '/field', icon: 'sports_soccer', labelKey: 'nav.field', match: ['/field', '/play'] },
  { id: 'leagues', to: '/leagues', icon: 'emoji_events', labelKey: 'nav.leagues', match: ['/leagues'] },
  { id: 'culture', to: '/culture', icon: 'campaign', labelKey: 'nav.culture', match: ['/culture', '/chant'] },
  // FIFA Culture has nested routes (/fifa/uefa/ESP), so it matches on a path prefix.
  { id: 'fifa', to: '/fifa', icon: 'public', labelKey: 'nav.fifa', match: ['/fifa'], prefix: '/fifa' },
  { id: 'quiz', to: '/quiz', icon: 'bolt', labelKey: 'nav.quiz', match: ['/quiz'] },
]

/** Is this nav item the current destination? */
export function isActive(item, path) {
  return item.match.includes(path) || (item.prefix != null && path.startsWith(`${item.prefix}/`))
}
