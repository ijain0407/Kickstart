import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { RouterProvider } from '../router.jsx'
import { I18nProvider } from '../i18n/I18nContext.jsx'
import { ThemeProvider } from '../state/ThemeContext.jsx'
import { AppProvider } from '../state/AppState.jsx'
import { AuthProvider } from '../state/AuthState.jsx'

/**
 * End-to-end through the real gateway: React pages -> /api -> each workstream's
 * routers -> the JSON content. No mocked payloads, so a contract change on
 * either side fails here.
 */
function renderApp(route = '/') {
  window.location.hash = `#${route}`
  return render(
    <ThemeProvider>
      <I18nProvider>
        {/* Same nesting as main.jsx: auth wraps app state, because signing in
            changes which user id the progress calls are made as. */}
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

describe('Culture tab', () => {
  it('lists real clubs and opens one with its chant in three layers', async () => {
    const user = userEvent.setup()
    renderApp('/culture')

    // League chips come from GET /api/leagues.
    expect(await screen.findByRole('button', { name: 'Bundesliga' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Bundesliga' }))
    const bayern = await screen.findByRole('button', { name: /Bayern Munich/ })
    await user.click(bayern)

    // The card detail: nickname (shown on the hero and in its own panel) and
    // the chant, with the original left untranslated.
    expect((await screen.findAllByText('Die Roten')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('Mia san mia')).length).toBeGreaterThan(0)
    expect(screen.getByText('We are we')).toBeInTheDocument()
    expect(screen.getByText(/Bavarian dialect/)).toBeInTheDocument()
  })

  it('renders the same club in Spanish', async () => {
    const user = userEvent.setup()
    renderApp('/culture')

    await user.click(await screen.findByRole('button', { name: /ES/ }))
    await user.click(await screen.findByRole('button', { name: 'LaLiga' }))
    await user.click(await screen.findByRole('button', { name: /Atlético de Madrid/ }))

    // Original Spanish nickname, Spanish explanation — and the literal
    // translation is the Spanish one, not the English.
    expect((await screen.findAllByText('Los Colchoneros')).length).toBeGreaterThan(0)
    expect(screen.getByText(/colchones baratos/)).toBeInTheDocument()
  })
})

describe('Find Your League', () => {
  it('scores every answer live and ranks the leagues at the end', async () => {
    const user = userEvent.setup()
    renderApp('/quiz')

    // Question 1 comes from the API, in both languages (coach mode).
    expect(await screen.findByRole('heading', { name: 'What draws you into a match?' })).toBeInTheDocument()
    expect(screen.getByText('¿Qué te atrapa de un partido?')).toBeInTheDocument()

    await user.click(await screen.findByRole('checkbox', { name: /Chess-match tactics/ }))

    // The live strip is scored by POST /api/league-quiz/recommend.
    expect(await screen.findByText('Live Compatibility')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Next Question/ }))

    // The other four questions are single-select, so their options are radios.
    const answers = [/25-pass move/, /clear view of both teams/, /defender who organises/, /defensive masterclass/]
    for (const answer of answers) {
      await user.click(await screen.findByRole('radio', { name: answer }))
      await user.click(screen.getByRole('button', { name: /Next Question|See My League/ }))
    }

    // Tactical answers land on Serie A, with the reason shown.
    expect(await screen.findByRole('heading', { name: 'Your league is a match.' })).toBeInTheDocument()
    const results = screen.getByText('Serie A').closest('.result-row')
    expect(within(results).getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Tactics')).toBeInTheDocument()
  })
})

describe('Leagues tab', () => {
  it('browses the five leagues before the matcher has been taken', async () => {
    renderApp('/leagues')

    expect(await screen.findByText('Premier League')).toBeInTheDocument()
    expect(await screen.findByText('Major League Soccer')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /taken the Tactical Matcher/ })).toBeInTheDocument()
  })
})

describe('Lessons & field (Person B content)', () => {
  it('shows the formation description from the lessons API', async () => {
    const user = userEvent.setup()
    renderApp('/field')

    expect(await screen.findByText(/Four defenders, a midfield triangle/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '4-4-2' }))
    expect(await screen.findByText(/Two flat banks of four/)).toBeInTheDocument()
  })

  it('shows glossary terms beside the lesson that needs them', async () => {
    renderApp('/lesson?id=1.2')

    expect(await screen.findByRole('heading', { name: 'Key terms' })).toBeInTheDocument()
    expect(screen.getByText('Offside')).toBeInTheDocument()
    expect(screen.getByText(/nearer the opponent's goal line/)).toBeInTheDocument()
  })
})

describe('Progress (Person D)', () => {
  it('records a mastered chant on the server and reflects it in the UI', async () => {
    const user = userEvent.setup()
    renderApp('/chant?club=culture-liverpool&id=ynwa')

    // Reveal all three layers, then master it.
    await user.click(await screen.findByRole('button', { name: /Reveal/i }))
    await user.click(screen.getByRole('button', { name: /Reveal/i }))
    await user.click(screen.getByRole('button', { name: /Mark as mastered/i }))

    // The progress API is the source of truth for chants learned.
    const { api } = await import('../lib/api.js')
    await expect.poll(async () => (await api('/progress')).stats.chantsLearned).toBe(1)
  })
})

describe('Knowledge drills (Person D engine)', () => {
  it('plays a drill end to end and banks the XP on the server', async () => {
    const user = userEvent.setup()
    const { api } = await import('../lib/api.js')
    renderApp('/drills')

    // Lesson names come from Person B, matched through shared/lessons.js.
    expect(await screen.findByText('The Basic Rules')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Quick drill/ }))

    // Answer all five questions; the server marks each one.
    for (let i = 0; i < 5; i += 1) {
      const options = await screen.findAllByRole('radio')
      await user.click(options[0])
      await user.click(await screen.findByRole('button', { name: /Next|Finish drill/ }))
    }

    expect(await screen.findByRole('heading', { name: 'Drill complete' })).toBeInTheDocument()

    // XP was awarded by the progress API, not the client.
    const progress = await api('/progress')
    expect(progress.stats.questionsAnswered).toBe(5)
  })

  it('awards the league matcher XP through the progress API', async () => {
    const { api } = await import('../lib/api.js')
    const before = await api('/progress')
    expect(before.xp).toBe(0)

    await api('/progress/league-matched', { method: 'POST', body: { leagueId: 'league-serie-a' } })

    const after = await api('/progress')
    expect(after.xp).toBeGreaterThanOrEqual(120)
    expect(after.matchedLeagueId).toBe('league-serie-a')
  })
})

describe('The learning path (Person B path-lessons API)', () => {
  it('draws the unit from the API, in both languages', async () => {
    const user = userEvent.setup()
    renderApp('/path')

    // Six nodes, their titles and step counts served by GET /api/path-lessons.
    expect(await screen.findByRole('button', { name: '1.2 The Offside Rule' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1.6 VAR & Referee' })).toBeInTheDocument()
    expect(screen.getByText('0 / 6 Done')).toBeInTheDocument()
    expect(screen.getByText('3 steps')).toBeInTheDocument()

    // A language switch refetches the path, it does not translate it locally.
    await user.click(screen.getByRole('button', { name: /ES/ }))
    expect(
      await screen.findByRole('button', { name: '1.2 La regla del fuera de juego' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1.6 VAR y arbitraje' })).toBeInTheDocument()
  })
})

describe('Units', () => {
  it('toggles between units, keeping the later ones locked until the earlier is done', async () => {
    const user = userEvent.setup()
    renderApp('/path')

    expect(await screen.findByRole('button', { name: '1.2 The Offside Rule' })).toBeInTheDocument()

    // Unit 2 is closed while unit 1 is unfinished.
    const unit2 = screen.getByRole('button', { name: 'Unit 2' })
    expect(unit2).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Unit 1' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('Lesson scenes (Person B path-lessons API)', () => {
  it('plays the offside scene and flips the verdict', async () => {
    const user = userEvent.setup()
    renderApp('/lesson?id=1.2')

    // Step one is a slider scene: three positions, a live verdict.
    expect(await screen.findByRole('heading', { name: 'The second-to-last defender' })).toBeInTheDocument()
    expect(screen.getByText('ONSIDE')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Beyond the line' }))

    expect(await screen.findByText('OFFSIDE')).toBeInTheDocument()
    expect(screen.getByText(/Nearer the goal line than the second-to-last defender/)).toBeInTheDocument()

    // Back to level and the flag comes down again.
    await user.click(screen.getByRole('button', { name: 'Dead level' }))
    expect(await screen.findByText(/Level is onside/)).toBeInTheDocument()
  })

  it('switches formation in the chip scene', async () => {
    const user = userEvent.setup()
    renderApp('/lesson?id=1.4')

    expect(await screen.findByRole('heading', { name: 'A formation is a starting point' })).toBeInTheDocument()
    expect(screen.getByText(/Four across the back, a midfield triangle/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '3-5-2' }))
    expect(await screen.findByText(/Three centre backs, five across the middle/)).toBeInTheDocument()
  })

  it('opens a labelled region on the pitch diagram', async () => {
    const user = userEvent.setup()
    renderApp('/lesson?id=1.1')

    expect(await screen.findByRole('heading', { name: 'The shape of the ground' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Halfway line' }))
    expect(await screen.findByText(/You can never be offside in your own half/)).toBeInTheDocument()
  })

  it('reveals a layer in the culture scene', async () => {
    const user = userEvent.setup()
    renderApp('/lesson?id=1.5')

    // Step two of 1.5 is a layer stack rather than a pitch.
    await user.click(await screen.findByRole('button', { name: /Next/ }))

    const layer = await screen.findByRole('button', { name: /New words, same melody/ })
    expect(layer).toHaveAttribute('aria-expanded', 'false')

    await user.click(layer)
    expect(await screen.findByText(/puts local words over it/)).toBeInTheDocument()
  })

  it('carries a scene through to the comprehension check and banks the XP', async () => {
    const user = userEvent.setup()
    renderApp('/lesson?id=1.2')

    // Three teaching steps, then the check.
    for (let i = 0; i < 3; i += 1) {
      await user.click(await screen.findByRole('button', { name: /Next/ }))
    }

    expect(await screen.findByRole('heading', { name: /What is the call\?/ })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /perfectly onside/ }))
    expect(await screen.findByText('That is it.')).toBeInTheDocument()
  })
})

describe('Opening a lesson from the path', () => {
  it('opens a node on a single tap', async () => {
    const user = userEvent.setup()
    renderApp('/path')

    const node = await screen.findByRole('button', { name: '1.2 The Offside Rule' })

    await user.click(node)
    expect(
      await screen.findByRole('heading', { name: 'The second-to-last defender' }),
    ).toBeInTheDocument()
  })

  it('refuses to open a locked node', async () => {
    const user = userEvent.setup()
    renderApp('/path')

    // 1.3 is two steps ahead of the active lesson, so it is locked.
    const locked = await screen.findByRole('button', { name: '1.3 Defenders & Midfield' })
    await user.click(locked)
    await user.click(locked)

    expect(await screen.findByText(/Finish the lesson before this one/)).toBeInTheDocument()
    // Still on the path, not in a lesson.
    expect(screen.getByRole('heading', { name: 'Tactical Foundations' })).toBeInTheDocument()
  })
})

describe('Find Your Club', () => {
  it('scores clubs within the chosen league and recommends one', async () => {
    const user = userEvent.setup()
    renderApp('/club-quiz?league=league-premier-league')

    expect(await screen.findByRole('heading', { name: 'What would make you pick a club?' })).toBeInTheDocument()
    expect(screen.getByText('¿Qué te haría elegir un club?')).toBeInTheDocument()

    // Answer as an underdog-and-belonging supporter.
    await user.click(await screen.findByRole('checkbox', { name: /nobody expects anything from/ }))
    expect(await screen.findByText('Live Compatibility')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Next Question/ }))

    const answers = [/Staying up on the final day/, /the town actually owns/, /Add it to the list/, /I want to belong/]
    for (const answer of answers) {
      await user.click(await screen.findByRole('radio', { name: answer }))
      await user.click(screen.getByRole('button', { name: /Next Question|See My League/ }))
    }

    expect(await screen.findByRole('heading', { name: 'This one is yours.' })).toBeInTheDocument()

    // A club from that league, not from the full list of 25.
    const heading = await screen.findByRole('heading', { level: 2 })
    expect(['Sunderland', 'West Ham United', 'Crystal Palace', 'Leeds United', 'Newcastle United']).toContain(
      heading.textContent,
    )
    expect(screen.getByRole('button', { name: /Explore their culture/ })).toBeInTheDocument()
  })
})
