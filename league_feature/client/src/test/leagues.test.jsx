import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { installFakeServer } from './fakeServer.js';
import { renderApp } from './render.jsx';

let server;
beforeEach(() => {
  server = installFakeServer();
});

describe('Leagues hub', () => {
  it('lists the leagues and opens a profile', async () => {
    const user = userEvent.setup();
    renderApp('/leagues');

    expect(screen.getByRole('heading', { name: 'Leagues & Culture' })).toBeInTheDocument();
    expect(await screen.findByText('Relentless pace.')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Premier League/ }));

    expect(await screen.findByRole('heading', { name: 'How they play' })).toBeInTheDocument();
    expect(screen.getByText('Fast and physical.')).toBeInTheDocument();
    // Trait ratings render as meters, not just text.
    expect(screen.getByRole('meter', { name: 'Pace' })).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('Merseyside Derby')).toBeInTheDocument();
  });

  it('renders Spanish content when the language is Spanish', async () => {
    renderApp('/leagues', { language: 'es' });

    expect(screen.getByRole('heading', { name: 'Ligas y Cultura' })).toBeInTheDocument();
    expect(await screen.findByText('Ritmo implacable.')).toBeInTheDocument();
    expect(server.state.calls.at(-1).locale).toBe('es');
  });
});

describe('Culture card', () => {
  it('shows the chant in three layers, with the original left in its own language', async () => {
    renderApp('/culture/culture-liverpool', { language: 'es' });

    expect(await screen.findByRole('heading', { name: 'Liverpool', level: 1 })).toBeInTheDocument();

    // Original untranslated, literal and meaning in Spanish — the whole point of the format.
    expect(screen.getByText("You'll never walk alone")).toBeInTheDocument();
    expect(screen.getByText('Nunca caminarás solo')).toBeInTheDocument();
    expect(screen.getByText('Una promesa de solidaridad.')).toBeInTheDocument();
    expect(screen.getAllByText('Traducción literal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lo que realmente significa').length).toBeGreaterThan(0);

    // The nickname uses the same three-layer component.
    expect(screen.getByText('The Reds')).toBeInTheDocument();
    expect(screen.getByText('Los Rojos')).toBeInTheDocument();
    expect(screen.getByText('Bufandas en alto antes del saque.')).toBeInTheDocument();
  });
});

describe('Find Your League quiz', () => {
  it('walks through the questions and shows the recommendation', async () => {
    const user = userEvent.setup();
    renderApp('/leagues/find-your-league');

    expect(await screen.findByRole('heading', { name: 'Find Your League' })).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tactics' }));
    expect(await screen.findByText('Question 2 of 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '1-0 masterclass' }));

    expect(await screen.findByRole('heading', { name: 'Serie A', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('87% match')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Serie A' })).toHaveAttribute('aria-valuenow', '87');

    // The answers reached the API keyed by question id.
    expect(server.state.recommendBody).toEqual({ answers: { q1: 'tactics', q2: 'masterclass' } });
  });

  it('lets you go back and change an answer before submitting', async () => {
    const user = userEvent.setup();
    renderApp('/leagues/find-your-league');

    await user.click(await screen.findByRole('button', { name: 'Tactics' }));
    await user.click(screen.getByRole('button', { name: /Previous/ }));

    expect(await screen.findByText('Question 1 of 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Speed' }));
    await user.click(await screen.findByRole('button', { name: '4-3 chaos' }));

    await waitFor(() => expect(server.state.recommendBody).toEqual({ answers: { q1: 'speed', q2: 'thriller' } }));
    expect(await screen.findByRole('heading', { name: 'Premier League', level: 1 })).toBeInTheDocument();
  });

  it('surfaces a failed submission with a retry', async () => {
    const user = userEvent.setup();
    renderApp('/leagues/find-your-league');
    await screen.findByRole('heading', { name: 'Find Your League' });

    server.fetchMock.mockImplementationOnce(async () => ({ ok: false, status: 500, json: async () => ({ error: { code: 'INTERNAL', message: 'boom' } }) }));
    await user.click(screen.getByRole('button', { name: 'Speed' }));
    await user.click(await screen.findByRole('button', { name: '4-3 chaos' }));

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't work out your league.");
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Premier League', level: 1 })).toBeInTheDocument();
  });
});
