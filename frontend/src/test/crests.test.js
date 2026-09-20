import { describe, expect, it } from 'vitest'
import { initialsFor, toClubHero } from '../lib/adapters.js'

const base = {
  id: 'culture-juventus',
  leagueId: 'league-serie-a',
  club: 'Juventus',
  city: 'Turin, Italy',
  founded: 1897,
  nickname: { original: { text: 'La Vecchia Signora', lang: 'it' }, literal: 'The Old Lady', meaning: '…' },
  kit: { primary: '#000000', secondary: '#ffffff', pattern: 'stripes' },
  contentStatus: 'draft',
}

const labels = { draft: 'Research in progress' }

describe('club visuals', () => {
  it('passes a supplied crest through to the header', () => {
    const hero = toClubHero({ ...base, crestUrl: '/crests/culture-juventus.svg' }, { leagueId: base.leagueId, labels })
    expect(hero.crestUrl).toBe('/crests/culture-juventus.svg')
  })

  it('falls back to the kit motif when no crest file is linked', () => {
    const hero = toClubHero(base, { leagueId: base.leagueId, labels })
    expect(hero.crestUrl).toBeNull()
    expect(hero.kit.pattern).toBe('stripes')
    // The club's own colours drive the card, not the league palette.
    expect(hero.colors).toEqual({ a: '#000000', b: '#ffffff' })
  })

  it('derives readable initials for the badge', () => {
    expect(initialsFor('Juventus')).toBe('JUV')
    expect(initialsFor('Manchester United')).toBe('MU')
    expect(initialsFor('Brighton & Hove Albion')).toBe('BHA')
    expect(initialsFor('Paris Saint-Germain')).toBe('PSG')
  })
})
