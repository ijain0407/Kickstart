import { describe, expect, it } from 'vitest'
import { CONFEDERATIONS, COUNTRIES, getCountry, flagUrl } from '../data/worldcup/index.js'

const REQUIRED = ['id', 'name', 'code', 'confederation', 'ranking', 'rankingAsOf', 'titles', 'appearances', 'bestFinish', 'history', 'players', 'chants', 'gallery']

describe('World Cup data', () => {
  it('has the six confederations in order', () => {
    expect(CONFEDERATIONS.map((c) => c.id)).toEqual(['UEFA', 'CONMEBOL', 'CAF', 'AFC', 'CONCACAF', 'OFC'])
  })

  it.each(COUNTRIES.map((c) => [c.id, c]))('%s is complete', (_id, c) => {
    for (const key of REQUIRED) expect(c[key], key).toBeDefined()
    expect(CONFEDERATIONS.map((x) => x.id)).toContain(c.confederation)
    expect(c.rankingAsOf).toMatch(/^\d{4}-\d{2}$/)
    expect(c.history.length).toBeGreaterThanOrEqual(2)
    expect(c.players.length).toBeGreaterThanOrEqual(4)
    expect(c.chants.length).toBeGreaterThanOrEqual(2)
    expect(c.gallery.length).toBeGreaterThanOrEqual(3)
    for (const g of c.gallery) expect(g.url).toMatch(/^https:\/\/upload\.wikimedia\.org\//)
  })

  it('has unique ids and a working lookup', () => {
    const ids = COUNTRIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of COUNTRIES) expect(getCountry(c.id)).toBe(c)
    expect(getCountry('nope')).toBeUndefined()
  })

  it('builds flag urls', () => {
    expect(flagUrl('br')).toBe('https://flagcdn.com/w80/br.png')
    expect(flagUrl('gb-eng', 160)).toBe('https://flagcdn.com/w160/gb-eng.png')
  })
})
