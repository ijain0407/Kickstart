import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/Icon.jsx';
import { clearActiveAttempt } from '../attemptSession.js';

const LEVELS = ['easy', 'medium', 'hard'];

export default function BattleSetup() {
  const { t } = useTranslation('quiz');
  const [difficulty, setDifficulty] = useState('medium');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">{t('battle.title')}</h1>
        <p className="text-subtle">{t('battle.intro')}</p>
      </div>
      <fieldset className="card">
        <legend className="px-1 font-display text-lg font-bold">{t('battle.difficulty')}</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {LEVELS.map((level) => (
            <label
              key={level}
              className={`flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-btn border-2 px-4 py-3 font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky ${difficulty === level ? 'border-primary-dark bg-green-50 text-primary-dark dark:bg-slate-700 dark:text-green-200' : 'border-gray-300 dark:border-slate-600'}`}
            >
              <input type="radio" name="difficulty" value={level} checked={difficulty === level} onChange={() => setDifficulty(level)} className="sr-only" />
              {difficulty === level && <Icon name="check" className="h-4 w-4" />}
              {t(`battle.${level}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <Link to={`/quiz/play?mode=battle&difficulty=${difficulty}`} className="btn-primary" onClick={clearActiveAttempt}>
        {t('battle.start')}
        <Icon name="arrowRight" />
      </Link>
    </div>
  );
}
