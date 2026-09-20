import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { RouterProvider } from '../router.jsx'
import { I18nProvider } from '../i18n/I18nContext.jsx'
import { AppProvider } from '../state/AppState.jsx'

/**
 * End-to-end through the real gateway: React pages -> /api -> each workstream's
 * routers -> the JSON content. No mocked payloads, so a contract change on
 * either side fails here.
 */
function renderApp(route = '/') {
  window.location.hash = `#${route}`
  return render(
    <I18nProvider>
      <AppProvider>
        <RouterProvider>
          <App />
        </RouterProvider>
      </AppProvider>
    </I18nProvider>,
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

describe('Chant audio', () => {
  it('links out to a crowd recording only when the chant has one', async () => {
    const user = userEvent.setup()
    renderApp('/culture')

    await user.click(await screen.findByRole('button', { name: 'Bundesliga' }))
    await user.click(await screen.findByRole('button', { name: /Bayern Munich/ }))

    // Bayern's chant carries a sourceUrl; the link opens it safely in a new tab.
    const link = await screen.findByRole('link', { name: /Listen to the real crowd/ })
    expect(link).toHaveAttribute('href', expect.stringContaining('http'))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))

    // Dortmund's has no link yet, so no dead button is shown. It's reachable
    // both as a rivalry and in the related-clubs row; either gets us there.
    await user.click(screen.getAllByRole('button', { name: /Borussia Dortmund/ })[0])
    // Title and original line both read "Heja BVB!" — either means we arrived.
    expect((await screen.findAllByText('Heja BVB!')).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /Listen to the real crowd/ })).not.toBeInTheDocument()
  })
})
