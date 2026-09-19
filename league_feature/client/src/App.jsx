import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LeaguesHub from './features/leagues/pages/LeaguesHub.jsx';
import LeagueProfile from './features/leagues/pages/LeagueProfile.jsx';
import CultureCardPage from './features/leagues/pages/CultureCardPage.jsx';
import FindYourLeague from './features/leagues/pages/FindYourLeague.jsx';
import LanguageToggle from './components/LanguageToggle.jsx';

const navClass = ({ isActive }) =>
  `inline-flex min-h-[44px] items-center rounded-btn px-4 font-semibold ${isActive ? 'bg-primary-dark text-white' : 'text-primary-dark hover:bg-green-100 dark:text-green-200 dark:hover:bg-slate-700'}`;

// TODO(A): replace this minimal shell with the app shell — the routes below are what to mount.
// They're the same stand-in header/nav Person D used, so the two merge cleanly.
export default function App() {
  const { t } = useTranslation();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-btn focus:bg-white focus:p-3">
        {t('nav.skip')}
      </a>
      <header className="border-b border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <span className="font-display text-lg font-bold text-primary-dark dark:text-green-200">{t('appName')}</span>
          <nav aria-label={t('nav.main')} className="flex gap-1">
            <NavLink to="/leagues" end className={navClass}>
              {t('nav.leagues')}
            </NavLink>
            <NavLink to="/leagues/find-your-league" className={navClass}>
              {t('nav.quiz')}
            </NavLink>
          </nav>
          <LanguageToggle />
        </div>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-4 py-6">
        <Routes>
          <Route path="/leagues" element={<LeaguesHub />} />
          <Route path="/leagues/find-your-league" element={<FindYourLeague />} />
          <Route path="/leagues/:leagueId" element={<LeagueProfile />} />
          <Route path="/culture/:cultureId" element={<CultureCardPage />} />
          <Route path="*" element={<Navigate to="/leagues" replace />} />
        </Routes>
      </main>
    </>
  );
}
