import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../../lib/api.js';
import Icon from '../../../components/Icon.jsx';
import { ErrorState, LoadingBlock } from '../../../components/StateViews.jsx';

export default function QuizReview() {
  const { attemptId } = useParams();
  const { t, i18n } = useTranslation('quiz');
  const lang = i18n.resolvedLanguage;
  const query = useQuery({ queryKey: ['review', attemptId, lang], queryFn: () => api(`/quiz/review?attemptId=${attemptId}`), retry: false });

  if (query.isError) return <ErrorState message={t('review.loadError')} error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <LoadingBlock />;
  const { questions } = query.data;
  const textOf = (q, id) => q.options.find((o) => o.id === id)?.text ?? '';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">{t('review.title')}</h1>
      {questions.length === 0 && <p className="card">{t('review.empty')}</p>}
      <ol className="space-y-4">
        {questions.map((q) => (
          <li key={q.id} className="card space-y-2">
            <h2 className="text-lg">{q.prompt}</h2>
            <p className="flex items-start gap-2 text-red-900 dark:text-red-200">
              <Icon name="x" className="mt-0.5 h-5 w-5 shrink-0" />
              {q.userOptionId ? t('review.yourAnswer', { answer: textOf(q, q.userOptionId) }) : t('review.noAnswer')}
            </p>
            <p className="flex items-start gap-2 text-green-900 dark:text-green-200">
              <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0" />
              {t('review.correctAnswer', { answer: textOf(q, q.correctOptionId) })}
            </p>
            <p>{q.explanation}</p>
            {/* TODO(A): confirm the /learn/:lessonId route. */}
            <Link to={`/learn/${q.lessonId}`} className="inline-flex min-h-[44px] items-center gap-1 font-semibold text-primary-dark underline dark:text-green-300">
              <Icon name="book" className="h-4 w-4" />
              {t('review.openLesson', { lesson: t(`lesson.${q.lessonId}`, { ns: 'common' }) })}
            </Link>
          </li>
        ))}
      </ol>
      <Link to={`/quiz/results/${attemptId}`} className="btn-secondary">{t('review.back')}</Link>
    </div>
  );
}
