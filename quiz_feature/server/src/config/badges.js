// Badge catalog. Names/descriptions are localized on the client via i18n keys badge.<id>.name / .description.
export const badgeCatalog = [
  { id: 'first_whistle', icon: 'whistle' },
  { id: 'perfect_score', icon: 'star' },
  { id: 'offside_expert', icon: 'flag' },
  { id: 'formation_guru', icon: 'grid' },
  { id: 'chant_collector', icon: 'megaphone' },
  { id: 'hat_trick', icon: 'flame' },
  { id: 'week_warrior', icon: 'calendar' },
  { id: 'tactics_nerd', icon: 'brain' },
  { id: 'polyglot', icon: 'globe' },
];
export const badgeIds = badgeCatalog.map((b) => b.id);

export const BADGE_TARGETS = { offside_expert: 5, formation_guru: 5, chant_collector: 5, hat_trick: 3, week_warrior: 7 };
