import { useTranslation } from 'react-i18next';

/** Renders the prompt and optional media. TODO(A): render the shared field diagram component for media.type === 'diagram'. */
export default function QuestionCard({ question, headingId, children }) {
  const { t } = useTranslation('quiz');
  return (
    <section className="card" aria-labelledby={headingId}>
      {question.media?.type === 'diagram' && (
        <div className="mb-4 flex h-32 items-center justify-center rounded-btn border-2 border-dashed border-primary/50 bg-green-50 text-sm font-semibold text-primary-dark dark:bg-slate-700 dark:text-green-200">
          {t('play.diagramPlaceholder', { ref: question.media.ref })}
        </div>
      )}
      <h2 id={headingId} className="text-xl leading-snug sm:text-2xl">{question.prompt}</h2>
      {children}
    </section>
  );
}
