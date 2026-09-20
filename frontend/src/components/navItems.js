/**
 * The four destinations, shared by the mobile tab bar and the desktop sidebar.
 *
 * Leagues and the Tactical Matcher quiz used to be separate tabs, but the
 * matcher only exists to answer "which league fits me" — so /quiz now lives
 * under the Leagues tab instead of getting its own, and that tab is named
 * for the question it answers.
 */
export const NAV_ITEMS = [
  { id: 'learn', to: '/', icon: 'menu_book', labelKey: 'nav.learn', match: ['/', '/path', '/lesson', '/streak', '/profile', '/drills'] },
  { id: 'field', to: '/field', icon: 'sports_soccer', labelKey: 'nav.field', match: ['/field', '/play'] },
  { id: 'leagues', to: '/leagues', icon: 'emoji_events', labelKey: 'nav.leagues', match: ['/leagues', '/quiz'] },
  { id: 'culture', to: '/culture', icon: 'campaign', labelKey: 'nav.culture', match: ['/culture', '/chant'] },
]
