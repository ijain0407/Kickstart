import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import QuizHub from './features/quiz/pages/QuizHub.jsx';
import BattleSetup from './features/quiz/pages/BattleSetup.jsx';
import QuizPlay from './features/quiz/pages/QuizPlay.jsx';
import QuizResults from './features/quiz/pages/QuizResults.jsx';
import QuizReview from './features/quiz/pages/QuizReview.jsx';
import ExplainPlay from './features/explain/pages/ExplainPlay.jsx';
import ProgressPage from './features/progress/pages/ProgressPage.jsx';
import LanguageToggle from './components/LanguageToggle.jsx';
import { useTheme } from './lib/hooks.js';

const navClass = ({ isActive }) =>
  `inline-flex min-h-[44px] items-center rounded-btn px-4 font-semibold ${isActive ? 'bg-primary-dark text-white' : 'text-primary-dark hover:bg-green-100 dark:text-green-200 dark:hover:bg-slate-700'}`;

// TODO(A): replace this minimal shell (header, nav, language switcher) with the app shell; the feature routes below are what to mount.
export default function App() {
  const { t } = useTranslation();
  useTheme(); // applies the persisted / system theme on load
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-btn focus:bg-white focus:p-3">
        {t('nav.skip')}
      </a>
      <header className="border-b border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <span className="font-display text-lg font-bold text-primary-dark dark:text-green-200">{t('appName')}</span>
          <nav aria-label={t('nav.main')} className="flex gap-1">
            <NavLink to="/quiz" className={navClass}>{t('nav.quiz')}</NavLink>
            <NavLink to="/explain-play" className={navClass}>{t('nav.explain')}</NavLink>
            <NavLink to="/progress" className={navClass}>{t('nav.progress')}</NavLink>
          </nav>
          <LanguageToggle />
        </div>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-4 py-6">
        <Routes>
          <Route path="/quiz" element={<QuizHub />} />
          <Route path="/quiz/battle" element={<BattleSetup />} />
          <Route path="/quiz/play" element={<QuizPlay />} />
          <Route path="/quiz/results/:attemptId" element={<QuizResults />} />
          <Route path="/quiz/review/:attemptId" element={<QuizReview />} />
          <Route path="/explain-play" element={<ExplainPlay />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="*" element={<Navigate to="/quiz" replace />} />
        </Routes>
      </main>
    </>
  );
}
