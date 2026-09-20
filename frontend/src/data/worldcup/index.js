import uefa from './uefa.js'
import conmebol from './conmebol.js'
import caf from './caf.js'
import afc from './afc.js'
import concacaf from './concacaf.js'
import ofc from './ofc.js'

export const CONFEDERATIONS = [
  { id: 'UEFA', name: 'Europe' },
  { id: 'CONMEBOL', name: 'South America' },
  { id: 'CAF', name: 'Africa' },
  { id: 'AFC', name: 'Asia' },
  { id: 'CONCACAF', name: 'North & Central America, Caribbean' },
  { id: 'OFC', name: 'Oceania' },
]

export const COUNTRIES = [...uefa, ...conmebol, ...caf, ...afc, ...concacaf, ...ofc]

export const getCountry = (id) => COUNTRIES.find((c) => c.id === id)

export const flagUrl = (code, width = 80) => `https://flagcdn.com/w${width}/${code}.png`
