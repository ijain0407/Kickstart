/** The five destinations, shared by the mobile tab bar and the desktop sidebar. */
export const NAV_ITEMS = [
  { id: 'learn', to: '/', icon: 'menu_book', labelKey: 'nav.learn', match: ['/', '/path', '/lesson', '/streak', '/profile', '/drills'] },
  { id: 'field', to: '/field', icon: 'sports_soccer', labelKey: 'nav.field', match: ['/field', '/play'] },
  { id: 'leagues', to: '/leagues', icon: 'emoji_events', labelKey: 'nav.leagues', match: ['/leagues'] },
  { id: 'culture', to: '/culture', icon: 'campaign', labelKey: 'nav.culture', match: ['/culture', '/chant'] },
  { id: 'quiz', to: '/quiz', icon: 'bolt', labelKey: 'nav.quiz', match: ['/quiz'] },
]
