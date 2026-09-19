import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../../lib/api.js';
import { useTheme } from '../../../lib/hooks.js';
import Dialog from '../../../components/Dialog.jsx';
import Icon from '../../../components/Icon.jsx';
import LanguageToggle from '../../../components/LanguageToggle.jsx';
import { ErrorState, LoadingBlock } from '../../../components/StateViews.jsx';
import { clearActiveAttempt } from '../../quiz/attemptSession.js';
import { LESSON_IDS } from '../../quiz/config.js';
import { progressKey, useProgress } from '../../quiz/hooks/useProgress.js';
import BadgeCard from '../../quiz/components/BadgeCard.jsx';
import LevelBadge from '../../quiz/components/LevelBadge.jsx';
import StreakCounter from '../../quiz/components/StreakCounter.jsx';
import XPBar from '../../quiz/components/XPBar.jsx';

function ProgressRing({ percent, children }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-gray-200 dark:stroke-slate-700" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round" className="stroke-primary transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none" strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="card text-center">
      <p className="score-num text-3xl text-primary-dark dark:text-green-300">{value}</p>
      <p className="text-sm text-subtle">{label}</p>
    </div>
  );
}

export default function ProgressPage() {
  const { t, i18n } = useTranslation('progress');
  const lang = i18n.resolvedLanguage;
  const client = useQueryClient();
  const progress = useProgress();
  const badges = useQuery({ queryKey: [...progressKey, 'badges'], queryFn: () => api('/progress/badges') });
  const [theme, setTheme] = useTheme();
  const [selected, setSelected] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState('');

  const reset = useMutation({
    mutationFn: () => api('/progress/reset', { method: 'POST' }),
    onSuccess: () => {
      clearActiveAttempt();
      client.invalidateQueries({ queryKey: progressKey });
      setConfirmReset(false);
      setSelected(null);
      setToast(t('toast.reset'));
    },
  });

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  if (progress.isError) return <ErrorState message={t('loadError')} error={progress.error} onRetry={() => progress.refetch()} />;
  if (!progress.data) return <LoadingBlock />;
  const p = progress.data;
  const fmt = new Intl.DateTimeFormat(lang, { dateStyle: 'medium' });
  const levelName = t(`level.${p.level}`, { ns: 'common' });
  const selectedBadge = selected && badges.data?.badges.find((b) => b.id === selected);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl">{t('title')}</h1>

      <section className="card flex flex-wrap items-center gap-5">
        <ProgressRing percent={p.progressPercent}>
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-primary-dark dark:bg-green-900 dark:text-green-100">
            <Icon name="user" className="h-10 w-10" title={t('avatar')} />
          </span>
        </ProgressRing>
        <div className="min-w-[200px] flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={p.level} />
            <StreakCounter count={p.streak.current} />
          </div>
          <p className="sr-only">{t('level', { level: levelName })}</p>
          <XPBar info={p} />
          <p className="text-sm text-subtle">{t('totalXp', { xp: p.xp })}</p>
        </div>
      </section>

      <section aria-label={t('title')} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={p.stats.lessonsCompleted} label={t('stats.lessons')} />
        <Stat value={`${p.stats.accuracyPercent}%`} label={t('stats.accuracy')} />
        <Stat value={p.streak.current} label={t('stats.streak')} />
        <Stat value={p.stats.chantsLearned} label={t('stats.chants')} />
      </section>

      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="mb-3 text-xl">{t('badges.title')}</h2>
        {badges.isError && <ErrorState message={t('loadError')} error={badges.error} onRetry={() => badges.refetch()} />}
        {badges.data && (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {badges.data.badges.map((b) => (
                <li key={b.id}><BadgeCard badge={b} selected={selected === b.id} onSelect={(x) => setSelected(x.id)} /></li>
              ))}
            </ul>
            {selectedBadge && (
              <div role="status" className="card mt-3 border-l-8 border-amber">
                <p className="flex items-center gap-2 font-display text-lg font-bold">
                  <Icon name={selectedBadge.icon} />
                  {t(`badge.${selectedBadge.id}.name`)}
                </p>
                <p>{t(`badge.${selectedBadge.id}.description`)}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-subtle">
                  <Icon name={selectedBadge.earned ? 'check' : 'lock'} className="h-4 w-4" />
                  {selectedBadge.earned ? t('badges.earnedOn', { date: fmt.format(new Date(selectedBadge.earnedAt)) }) : t('badges.locked')}
                  {!selectedBadge.earned && selectedBadge.progress && ` · ${t('badges.progress', selectedBadge.progress)}`}
                </p>
                <button type="button" className="btn-secondary mt-2" onClick={() => setSelected(null)}>{t('badges.close')}</button>
              </div>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="best-heading">
        <h2 id="best-heading" className="mb-3 text-xl">{t('best.title')}</h2>
        <ul className="card divide-y divide-gray-200 dark:divide-slate-700">
          {['quick', ...LESSON_IDS].map((key) => (
            <li key={key} className="flex items-center justify-between py-2">
              <span>{key === 'quick' ? t('best.quick') : t(`lesson.${key}`, { ns: 'common' })}</span>
              <span className="score-num text-xl">{p.bestScores[key] === undefined ? t('best.none') : t('best.percent', { percent: p.bestScores[key] })}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-3 text-xl">{t('history.title')}</h2>
        {p.history.length === 0 ? (
          <p className="card">{t('history.empty')}</p>
        ) : (
          <ol className="space-y-2">
            {p.history.map((h) => (
              <li key={`${h.kind}-${h.attemptId ?? h.lessonId}-${h.completedAt}`} className="card flex items-center justify-between gap-3 py-3">
                <span className="flex items-center gap-3">
                  <Icon name={h.kind === 'quiz' ? 'bolt' : 'book'} className="h-5 w-5 shrink-0 text-primary-dark dark:text-green-300" />
                  <span>
                    <span className="block font-medium">
                      {h.kind === 'quiz'
                        ? t('history.quiz', { mode: t(`history.mode.${h.mode}`), score: h.score, total: h.total })
                        : t('history.lesson', { lesson: t(`lesson.${h.lessonId}`, { ns: 'common' }) })}
                    </span>
                    <time dateTime={h.completedAt} className="text-sm text-subtle">{fmt.format(new Date(h.completedAt))}</time>
                  </span>
                </span>
                <span className="score-num text-lg text-amber-800 dark:text-amber-300">{t('history.xp', { xp: h.xpEarned })}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="settings-heading" className="card space-y-4">
        <h2 id="settings-heading" className="text-xl">{t('settings.title')}</h2>
        <div className="flex items-center justify-between gap-3">
          <span id="lang-label">{t('settings.language')}</span>
          <LanguageToggle />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span id="dark-label">{t('settings.darkMode')}</span>
          <button type="button" role="switch" aria-checked={theme === 'dark'} aria-labelledby="dark-label" className="btn-secondary" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? t('settings.on') : t('settings.off')}
          </button>
        </div>
        <button type="button" className="btn border-2 border-red-700 text-red-800 hover:bg-red-50 dark:text-red-300 dark:hover:bg-slate-700" onClick={() => setConfirmReset(true)}>
          {t('settings.reset')}
        </button>
      </section>

      <div aria-live="polite" role="status" className="fixed inset-x-0 bottom-4 flex justify-center px-4">
        {toast && <p className="rounded-btn bg-primary-dark px-4 py-3 font-semibold text-white shadow-card">{toast}</p>}
      </div>

      {confirmReset && (
        <Dialog role="alertdialog" titleId="reset-title" onClose={() => setConfirmReset(false)}>
          <h2 id="reset-title" className="text-xl">{t('settings.resetTitle')}</h2>
          <p className="mt-2">{t('settings.resetBody')}</p>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setConfirmReset(false)}>{t('settings.cancel')}</button>
            <button type="button" className="btn bg-red-800 text-white hover:bg-red-900" disabled={reset.isPending} onClick={() => reset.mutate()}>
              {t('settings.resetConfirm')}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
