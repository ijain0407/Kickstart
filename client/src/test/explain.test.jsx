import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n.js';
import ExplainPlay from '../features/explain/pages/ExplainPlay.jsx';

const T = {
  en: { title: 'Penalty kick', a: 'Foul inside the box' },
  es: { title: 'Tiro penal', a: 'Falta dentro del área' },
};
let calls;

function install({ matched = true } = {}) {
  calls = [];
  const reply = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
  globalThis.fetch = window.fetch = vi.fn(async (url, init = {}) => {
    const locale = init.headers?.['X-Locale'] ?? 'en';
    calls.push({ url, body: init.body ? JSON.parse(init.body) : null, locale });
    if (url === '/api/explain/scenarios') return reply({ scenarios: [{ id: 'penalty', title: T[locale].title }] });
    if (url === '/api/explain/analyze') {
      return reply({
        demo: true, matched, scenarioId: matched ? 'penalty' : 'generic', source: 'file', sourceLabel: 'x', title: T[locale].title,
        annotations: [{ timestamp: 65, title: T[locale].a, explanation: 'Because.', lessonId: 'rules-basics' }],
      });
    }
    return reply({ error: { code: 'NOT_FOUND', message: url } }, 404);
  });
}

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter><ExplainPlay /></MemoryRouter>
    </QueryClientProvider>,
  );

const fileOf = (name, type, size = 100) => {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
};

beforeEach(async () => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
  await i18n.changeLanguage('en');
});

describe('Explain This Play (demo)', () => {
  it('is clearly labeled as a demo', async () => {
    install();
    renderPage();
    expect(screen.getByText('Demo analysis')).toBeInTheDocument();
    expect(screen.getByText(/It doesn't watch your video/)).toBeInTheDocument();
  });

  it('runs a sample scenario and shows the timeline with a lesson link', async () => {
    install();
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Sample: Penalty kick' }));
    const timeline = await screen.findByRole('heading', { name: 'Timeline: Penalty kick' });
    const section = timeline.closest('section');
    expect(within(section).getByText('Foul inside the box')).toBeInTheDocument();
    expect(within(section).getByText('1:05')).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: /Rules Basics/ })).toHaveAttribute('href', '/learn/rules-basics');
  });

  it('sends only file metadata, shows a preview, and re-explains in Spanish', async () => {
    install();
    const user = userEvent.setup();
    const { container } = renderPage();
    await user.upload(container.querySelector('input[type=file]'), fileOf('penalty.mp4', 'video/mp4', 5000));
    await screen.findByText('Foul inside the box');
    expect(calls.find((c) => c.url === '/api/explain/analyze').body).toEqual({ source: 'file', filename: 'penalty.mp4', mimeType: 'video/mp4', size: 5000 });
    expect(container.querySelector('video')).toBeInTheDocument();
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    expect(await screen.findByText('Falta dentro del área')).toBeInTheDocument();
  });

  it('rejects unsupported and oversized files without calling the server', async () => {
    install();
    const user = userEvent.setup({ applyAccept: false });
    const { container } = renderPage();
    const input = container.querySelector('input[type=file]');
    await user.upload(input, fileOf('notes.pdf', 'application/pdf'));
    expect(await screen.findByRole('alert')).toHaveTextContent("That file type isn't supported");
    await user.upload(input, fileOf('big.mp4', 'video/mp4', 26 * 1024 * 1024));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('larger than 25 MB'));
    expect(calls.some((c) => c.url === '/api/explain/analyze')).toBe(false);
  });

  it('rejects a link that is not http(s)', async () => {
    install();
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText('Or paste a link to a clip'), 'javascript:alert(1)');
    await user.click(screen.getByRole('button', { name: 'Analyze link' }));
    expect(await screen.findByRole('alert')).toHaveTextContent("doesn't look like a valid web link");
    expect(calls.some((c) => c.url === '/api/explain/analyze')).toBe(false);
  });

  it('explains when a clip could not be matched', async () => {
    install({ matched: false });
    const user = userEvent.setup();
    const { container } = renderPage();
    await user.upload(container.querySelector('input[type=file]'), fileOf('IMG_1.gif', 'image/gif'));
    expect(await screen.findByText(/couldn't match this clip/)).toBeInTheDocument();
  });
});
