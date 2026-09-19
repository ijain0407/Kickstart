import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState, LoadingBlock } from '../../../components/StateViews.jsx';
import { useLeagueQuiz, useRecommendation } from '../api.js';
import QuizResult from '../components/QuizResult.jsx';

export default function FindYourLeague() {
  const { t } = useTranslation('leagues');
  const { data, isPending, error, refetch } = useLeagueQuiz();
  const recommend = useRecommendation();
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);

  if (isPending) return <LoadingBlock />;
  if (error) return <ErrorState message={t('quiz.loadError')} error={error} onRetry={refetch} />;

  const { quiz } = data;
  const questions = quiz.questions;
  const question = questions[index];

  const restart = () => {
    setAnswers({});
    setIndex(0);
    recommend.reset();
  };

  const choose = (optionId) => {
    const next = { ...answers, [question.id]: optionId };
    setAnswers(next);
    if (index + 1 < questions.length) setIndex(index + 1);
    else recommend.mutate(next);
  };

  if (recommend.data) return <QuizResult result={recommend.data} onRestart={restart} />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">{quiz.title}</h1>
        <p className="mt-1 text-subtle">{quiz.intro}</p>
      </header>

      <div>
        <p className="text-sm font-semibold text-subtle" role="status">
          {t('quiz.progress', { current: index + 1, total: questions.length })}
        </p>
        <div
          className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
        >
          <div className="h-full rounded-full bg-primary-dark dark:bg-green-400" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <fieldset className="card" disabled={recommend.isPending}>
        <legend className="font-display text-xl">{question.prompt}</legend>
        <ul className="mt-4 space-y-3">
          {question.options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => choose(option.id)}
                aria-pressed={answers[question.id] === option.id}
                className={`w-full rounded-btn border-2 p-4 text-left font-semibold transition-colors ${
                  answers[question.id] === option.id
                    ? 'border-primary-dark bg-primary-dark text-white'
                    : 'border-gray-300 hover:border-primary-dark hover:bg-green-50 dark:border-slate-600 dark:hover:bg-slate-700'
                }`}
              >
                {option.text}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      {index > 0 && (
        <button type="button" className="btn-secondary" onClick={() => setIndex(index - 1)}>
          ← {t('quiz.previous')}
        </button>
      )}

      {recommend.isPending && <LoadingBlock />}
      {recommend.error && <ErrorState message={t('quiz.submitError')} error={recommend.error} onRetry={() => recommend.mutate(answers)} />}
    </div>
  );
}
