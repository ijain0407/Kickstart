import { useTranslation } from 'react-i18next';
import Icon from '../../../components/Icon.jsx';
import ConfettiBurst from './ConfettiBurst.jsx';

const STYLES = {
  idle: 'border-gray-300 bg-white hover:border-primary hover:bg-green-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700',
  selected: 'border-sky bg-sky-50 dark:bg-slate-700',
  correct: 'border-green-700 bg-green-50 text-green-950 dark:bg-green-950 dark:text-green-50',
  incorrect: 'border-red-700 bg-red-50 text-red-950 motion-safe:animate-shake dark:bg-red-950 dark:text-red-50',
  dim: 'border-gray-200 bg-white opacity-70 dark:border-slate-700 dark:bg-slate-800',
};

/** state: idle | selected | correct | incorrect | dim. Correct/incorrect always carry an icon plus text, never colour alone. */
export default function AnswerButton({ letter, text, state = 'idle', disabled, onClick, shortcut }) {
  const { t } = useTranslation('quiz');
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-keyshortcuts={shortcut}
      className={`relative flex min-h-[56px] w-full items-center gap-3 rounded-btn border-2 p-3 text-left font-medium transition-colors disabled:cursor-default ${STYLES[state]}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 font-score text-lg font-bold text-ink dark:bg-slate-600 dark:text-white" aria-hidden="true">{letter}</span>
      <span className="flex-1">
        <span className="sr-only">{t('play.option', { letter })}: </span>
        {text}
      </span>
      {state === 'correct' && (
        <>
          <Icon name="check" className="h-6 w-6 shrink-0 text-green-700 dark:text-green-300" title={t('play.correct')} />
          <ConfettiBurst />
        </>
      )}
      {state === 'incorrect' && <Icon name="x" className="h-6 w-6 shrink-0 text-red-700 dark:text-red-300" title={t('play.incorrect')} />}
    </button>
  );
}
