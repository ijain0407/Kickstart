import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { ThemeProvider } from '../state/ThemeContext.jsx'
import { I18nProvider } from '../i18n/I18nContext.jsx'

const setup = () =>
  render(
    <ThemeProvider>
      <I18nProvider>
        <ThemeToggle />
      </I18nProvider>
    </ThemeProvider>,
  )

afterEach(() => {
  delete document.documentElement.dataset.theme
})

describe('dark mode', () => {
  it('toggles data-theme on <html> and remembers the choice', async () => {
    const user = userEvent.setup()
    setup()
    const btn = screen.getByRole('button', { name: /dark mode/i })
    expect(document.documentElement.dataset.theme).toBe('light')

    await user.click(btn)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('soccerteaching.theme')).toBe('dark')

    await user.click(btn)
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('starts from the saved theme', () => {
    localStorage.setItem('soccerteaching.theme', 'dark')
    setup()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
