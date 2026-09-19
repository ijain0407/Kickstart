import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import '../i18n.js';
import QuizPlay from '../features/quiz/pages/QuizPlay.jsx';
import QuizResults from '../features/quiz/pages/QuizResults.jsx';

function Where() {
  const loc = useLocation();
  return <p data-testid="path">{loc.pathname}</p>;
}

export function renderApp(route) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <Where />
        <Routes>
          <Route path="/quiz/play" element={<QuizPlay />} />
          <Route path="/quiz/results/:attemptId" element={<QuizResults />} />
          <Route path="/quiz" element={<p>hub</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
