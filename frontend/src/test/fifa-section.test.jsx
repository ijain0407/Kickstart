import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { RouterProvider } from '../router.jsx'
import { I18nProvider } from '../i18n/I18nContext.jsx'
import { ThemeProvider } from '../state/ThemeContext.jsx'
import { AppProvider } from '../state/AppState.jsx'
import { AuthProvider } from '../state/AuthState.jsx'
import { CONFEDERATIONS, COUNTRIES, WC2026_STAGES, flagSrc } from '../data/fifa.js'
import { dictionary } from '../i18n/dictionary.js'

function renderApp(route) {
  window.location.hash = `#${route}`
  return render(
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <AppProvider>
            <RouterProvider>
              <App />
            </RouterProvider>
          </AppProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>,
  )
}

describe('FIFA data', () => {
  const codes = CONFEDERATIONS.flatMap((c) => c.teams)

  it('lists exactly the 48 teams once each, in six confederations', () => {
    expect(CONFEDERATIONS).toHaveLength(6)
    expect(codes).toHaveLength(48)
    expect(new Set(codes).size).toBe(48)
    expect(Object.keys(COUNTRIES).sort()).toEqual([...codes].sort())
  })

  it.each(codes)('%s is complete and bilingual', (code) => {
    const c = COUNTRIES[code]
    expect(c.iso2 || c.name).toBeTruthy()
    expect(WC2026_STAGES).toContain(c.wc2026)
    for (const pair of [c.history, c.famousPlayer.blurb, c.famousPlayer.position]) {
      expect(pair.en.length).toBeGreaterThan(0)
      expect(pair.es.length).toBeGreaterThan(0)
    }
    expect(c.mensRanking).toBeGreaterThan(0)
    expect(existsSync(`public${flagSrc(code)}`), 'flag file').toBe(true)
    const photo = c.famousPlayer.photo
    if (photo) {
      expect(existsSync(`public${photo.src}`), 'photo file').toBe(true)
      if (photo.author) expect(photo.license).toBeTruthy()
    }
  })

  it('has matching English and Spanish keys for the section', () => {
    const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]))
    expect(keys(dictionary.es.fifa).sort()).toEqual(keys(dictionary.en.fifa).sort())
  })
})

describe('FIFA Culture section', () => {
  it('shows the sidebar entry as active with the description and six confederations', () => {
    renderApp('/fifa')
    const active = screen.getAllByRole('link', { name: /FIFA Culture/ }).filter((a) => a.getAttribute('aria-current') === 'page')
    expect(active.length).toBeGreaterThan(0)
    expect(screen.getByText(/international governing body/)).toBeInTheDocument()
    for (const abbr of ['AFC', 'CAF', 'CONCACAF', 'CONMEBOL', 'OFC', 'UEFA']) {
      expect(screen.getByRole('link', { name: new RegExp(`^Open ${abbr},`) })).toBeInTheDocument()
    }
  })

  it('lists the confederation teams and links on to a country', async () => {
    const user = userEvent.setup()
    renderApp('/fifa/conmebol')
    const teams = screen.getByRole('region', { name: 'World Cup 2026 teams' })
    expect(within(teams).getAllByRole('link')).toHaveLength(6)
    await user.click(screen.getByRole('link', { name: 'Open Brazil' }))
    expect(await screen.findByRole('heading', { name: 'Brazil' })).toBeInTheDocument()
  })

  it('handles a one-team confederation (OFC)', () => {
    renderApp('/fifa/ofc')
    const teams = screen.getByRole('region', { name: 'World Cup 2026 teams' })
    expect(within(teams).getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Open New Zealand' })).toBeInTheDocument()
    expect(screen.getByText('1 team at World Cup 2026')).toBeInTheDocument()
  })

  it('shows country stats and switches language live', async () => {
    const user = userEvent.setup()
    renderApp('/fifa/uefa/ESP')
    expect(screen.getByRole('heading', { name: 'Spain' })).toBeInTheDocument()
    expect(screen.getByText('Short history')).toBeInTheDocument()
    expect(screen.getAllByText('#1')).toHaveLength(2)
    expect(screen.getByText('Andrés Iniesta')).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'Spain' })[0]).toHaveAttribute('src', '/flags/spain.png')
    expect(screen.getByRole('img', { name: 'Andrés Iniesta' })).toHaveAttribute('src', '/players/ESP.jpg')
    expect(screen.getByText(/Photo: Bryan Berlin, CC BY-SA 4.0/)).toBeInTheDocument()
    expect(screen.getByText(/Rankings as of July 20, 2026/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ES/ }))
    expect(await screen.findByRole('heading', { name: 'España' })).toBeInTheDocument()
    expect(screen.getByText('Breve historia')).toBeInTheDocument()
    expect(screen.getByText(/Rankings a fecha de 20 de julio de 2026/)).toBeInTheDocument()
  })

  it('renders unranked and unknown values as words, not guesses', () => {
    renderApp('/fifa/afc/QAT')
    expect(screen.getByText('Not ranked')).toBeInTheDocument()
  })

  it('shows supplied photos without a licence caption', () => {
    renderApp('/fifa/afc/KSA')
    expect(screen.getByRole('img', { name: 'Saeed Al-Owairan' })).toHaveAttribute('src', '/players/KSA.png')
    expect(screen.queryByText(/Photo:/)).not.toBeInTheDocument()
  })

  it('shows N/A for an unverified founding year', () => {
    renderApp('/fifa/afc/JPN')
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('shows a friendly not-found for unknown routes', () => {
    renderApp('/fifa/nope')
    expect(screen.getByText('We couldn’t find that page')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to FIFA Culture' })).toHaveAttribute('href', '#/fifa')
  })

  it('rejects a country filed under the wrong confederation', () => {
    renderApp('/fifa/uefa/BRA')
    expect(screen.getByText('We couldn’t find that page')).toBeInTheDocument()
  })
})
