import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import i18n from '../i18n.js';
import { installFakeServer } from './fakeServer.js';
import { renderApp } from './render.jsx';
import { quizConfig } from '../features/quiz/config.js';

const result = (over = {}) => ({
  attemptId: 'att-1', mode: 'quick', lessonId: null, score: 4, total: 5, perfect: false, xpEarned: 60,
  levelBefore: 'fan', levelAfter: 'fan', newBadges: [], streak: { current: 2, best: 2 }, missedCount: 1, ...over,
});

beforeEach(async () => {
  quizConfig.botDelayScale = 0;
  await i18n.changeLanguage('en');
});

describe('Quiz screen', () => {
  it('plays through answer, feedback, next and finish', async () => {
    installFakeServer({ result: result() });
    const user = userEvent.setup();
    renderApp('/quiz/play?mode=quick');

    expect(await screen.findByRole('heading', { name: 'Who may use their hands in their own area?' })).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /The goalkeeper/ }));
    const feedback = await screen.findByText('Correct!');
    expect(within(feedback.closest('[role="status"]')).getByText('Only the goalkeeper can.')).toBeInTheDocument();
    // Answer buttons lock after answering, and focus moves to Next.
    expect(screen.getByRole('button', { name: /The striker/ })).toBeDisabled();
    const next = screen.getByRole('button', { name: /Next question/ });
    expect(next).toHaveFocus();

    await user.click(next);
    expect(await screen.findByText('How many players per side?')).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ten/ }));
    expect(await screen.findByText('Not quite')).toBeInTheDocument();
    expect(screen.getByText(/The correct answer is: Eleven/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /See results/ }));
    expect(screen.getByTestId('path')).toHaveTextContent('/quiz/results/att-1');
  });

  it('supports keyboard shortcuts and ignores a second answer', async () => {
    const { state } = installFakeServer({ result: result() });
    const user = userEvent.setup();
    renderApp('/quiz/play?mode=quick');
    await screen.findByText('Who may use their hands in their own area?');

    await user.keyboard('2');
    expect(await screen.findByText('Not quite')).toBeInTheDocument();
    await user.keyboard('1');
    expect(state.calls.filter((c) => c.url === '/api/quiz/answer')).toHaveLength(1);
  });

  it('charges for a hint and shows it', async () => {
    installFakeServer({ result: result() });
    const user = userEvent.setup();
    renderApp('/quiz/play?mode=quick');
    await screen.findByText('Who may use their hands in their own area?');
    await user.click(screen.getByRole('button', { name: /Show hint/ }));
    expect(await screen.findByText('Test hint')).toBeInTheDocument();
  });

  it('switches language mid-quiz without resetting the attempt', async () => {
    const { state } = installFakeServer({ result: result() });
    const user = userEvent.setup();
    renderApp('/quiz/play?mode=quick');
    await screen.findByText('Who may use their hands in their own area?');
    await user.click(screen.getByRole('button', { name: /The goalkeeper/ }));
    await user.click(await screen.findByRole('button', { name: /Next question/ }));
    await screen.findByText('How many players per side?');

    await act(async () => {
      await i18n.changeLanguage('es');
    });

    expect(await screen.findByText('¿Cuántos jugadores por equipo?')).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(state.calls.filter((c) => c.method === 'POST' && c.url === '/api/quiz/attempts')).toHaveLength(1);
    expect(state.calls.some((c) => c.method === 'GET' && c.locale === 'es')).toBe(true);
  });

  it('resumes the same attempt after a reload', async () => {
    const { state } = installFakeServer({ result: result() });
    const user = userEvent.setup();
    const first = renderApp('/quiz/play?mode=quick');
    await screen.findByText('Who may use their hands in their own area?');
    await user.click(screen.getByRole('button', { name: /The goalkeeper/ }));
    await screen.findByText('Correct!');
    first.unmount();

    renderApp('/quiz/play?mode=quick');
    // Resumes on the first unanswered question, with the earlier answer still counted.
    expect(await screen.findByText('How many players per side?')).toBeInTheDocument();
    expect(state.calls.filter((c) => c.method === 'POST' && c.url === '/api/quiz/attempts')).toHaveLength(1);
  });
});

describe('Results screen', () => {
  it('shows the score, XP and streak', async () => {
    installFakeServer({ result: result() });
    renderApp('/quiz/results/att-1');
    expect(await screen.findByText('You got 4 of 5!')).toBeInTheDocument();
    expect(screen.getByText('2 day streak')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review mistakes' })).toBeInTheDocument();
    // The XP number counts up, so wait for the final value.
    await waitFor(() => expect(screen.getByText('+60 XP')).toBeInTheDocument(), { timeout: 3000 });
  });

  it('hides Review when nothing was missed and celebrates a level-up', async () => {
    installFakeServer({ result: result({ score: 5, perfect: true, missedCount: 0, levelBefore: 'fan', levelAfter: 'enthusiast', newBadges: ['first_whistle'] }) });
    const user = userEvent.setup();
    renderApp('/quiz/results/att-1');
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Level up!')).toBeInTheDocument();
    expect(within(dialog).getByText("You're now a Enthusiast.")).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Review mistakes' })).not.toBeInTheDocument();
    expect(screen.getByText('First Whistle')).toBeInTheDocument();
    expect(screen.getByText('Perfect score!')).toBeInTheDocument();
  });

  it('renders in Spanish', async () => {
    await i18n.changeLanguage('es');
    installFakeServer({ result: result() });
    renderApp('/quiz/results/att-1');
    expect(await screen.findByText('¡Acertaste 4 de 5!')).toBeInTheDocument();
    expect(screen.getByText('Racha de 2 días')).toBeInTheDocument();
  });
});

describe('Quiz Battle', () => {
  const battleResult = (over = {}) => result({ mode: 'battle', score: 1, total: 2, botScore: 1, battleResult: 'draw', xpBreakdown: { battleBonus: 10 }, missedCount: 1, ...over });

  it('shows the split header and reveals the bot answer before allowing Next', async () => {
    installFakeServer({ result: battleResult(), battle: true });
    const user = userEvent.setup();
    renderApp('/quiz/play?mode=battle&difficulty=medium');

    const header = await screen.findByRole('region', { name: 'Quiz Battle' });
    expect(within(header).getByText('You')).toBeInTheDocument();
    expect(within(header).getByText('Bot')).toBeInTheDocument();
    expect(within(header).getByText('VS')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /The goalkeeper/ }));
    expect(await screen.findByText('Correct!')).toBeInTheDocument();
    // Bot answered wrong on q1 (option b = "The striker"); its answer appears after its delay.
    expect(await screen.findByText('Bot answered: The striker')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Next question/ })).toBeInTheDocument();
    expect(within(header).getByRole('progressbar', { name: 'You: 1 of 2' })).toBeInTheDocument();
    expect(within(header).getByRole('progressbar', { name: 'Bot: 0 of 2' })).toBeInTheDocument();
  });

  it('renders the battle outcome on the results screen in both languages', async () => {
    installFakeServer({ result: battleResult({ battleResult: 'win', score: 2, botScore: 1, xpBreakdown: { battleBonus: 30 } }), battle: true });
    renderApp('/quiz/results/att-1');
    expect(await screen.findByText('You beat the bot!')).toBeInTheDocument();
    expect(screen.getByText('You 2 – 1 Bot')).toBeInTheDocument();
    expect(screen.getByText('Battle bonus: +30 XP')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Rematch' })).toHaveAttribute('href', '/quiz/battle');
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    expect(await screen.findByText('¡Le ganaste al bot!')).toBeInTheDocument();
  });
});
