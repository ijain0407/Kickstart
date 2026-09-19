import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, ApiError } from '../../../lib/api.js';
import Icon from '../../../components/Icon.jsx';
import { ErrorState, LoadingBlock } from '../../../components/StateViews.jsx';
import AnswerButton from '../components/AnswerButton.jsx';
import BattleHeader from '../components/BattleHeader.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import { clearActiveAttempt, loadActiveAttempt, saveActiveAttempt } from '../attemptSession.js';
import { quizConfig } from '../config.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizPlay() {
  const [params] = useSearchParams();
  const modeParam = params.get('mode');
  const mode = modeParam === 'lesson' || modeParam === 'battle' ? modeParam : 'quick';
  const difficulty = ['easy', 'medium', 'hard'].includes(params.get('difficulty')) ? params.get('difficulty') : 'medium';
  const lesson = mode === 'lesson' ? params.get('lesson') : null;
  const { t, i18n } = useTranslation('quiz');
  const lang = i18n.resolvedLanguage;
  const navigate = useNavigate();
  const client = useQueryClient();

  const [attemptId, setAttemptId] = useState(() => loadActiveAttempt(mode, lesson));
  const [startError, setStartError] = useState(null);
  const [idx, setIdx] = useState(null);
  const [hints, setHints] = useState({});
  const [pendingOption, setPendingOption] = useState(null);
  const startedRef = useRef(Boolean(attemptId));
  const nextRef = useRef(null);
  const [revealed, setRevealed] = useState(() => new Set()); // battle: questions whose bot answer is on screen
  const shownAt = useRef(Date.now());

  const start = useCallback(async () => {
    setStartError(null);
    try {
      const attempt = await api('/quiz/attempts', { method: 'POST', body: { mode, ...(lesson ? { lesson } : {}), ...(mode === 'battle' ? { difficulty } : {}) } });
      client.setQueryData(['attempt', attempt.attemptId, lang], attempt);
      saveActiveAttempt({ attemptId: attempt.attemptId, mode, lesson });
      setAttemptId(attempt.attemptId);
    } catch (e) {
      startedRef.current = false;
      setStartError(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, lesson, difficulty, client]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start();
  }, [start]);

  const attemptQuery = useQuery({
    queryKey: ['attempt', attemptId, lang],
    queryFn: () => api(`/quiz/attempts/${attemptId}`),
    enabled: Boolean(attemptId),
    placeholderData: keepPreviousData, // language switch keeps the current question on screen while the translation loads
    staleTime: Infinity,
    retry: false,
  });
  const data = attemptQuery.data;

  // A stale session id (e.g. server data was reset): forget it and begin a fresh attempt.
  useEffect(() => {
    if (attemptQuery.error instanceof ApiError && attemptQuery.error.status === 404) {
      clearActiveAttempt();
      setAttemptId(null);
      setIdx(null);
      start();
    }
  }, [attemptQuery.error, start]);

  useEffect(() => {
    if (data?.completed) {
      clearActiveAttempt();
      navigate(`/quiz/results/${data.attemptId}`, { replace: true });
    }
  }, [data, navigate]);

  const questions = data?.questions ?? [];
  const answers = data?.answers ?? {};
  const total = questions.length;
  const firstUnanswered = questions.findIndex((q) => !answers[q.id]);
  // Fix the position once, on first load or resume, so answering doesn't move us to the next question.
  useEffect(() => {
    if (idx === null && total > 0) {
      setIdx(firstUnanswered === -1 ? total - 1 : firstUnanswered);
      setRevealed(new Set(Object.keys(answers))); // already-answered questions (resume) show their bot answer at once
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, total, firstUnanswered]);
  const current = idx ?? 0;
  const question = idx === null ? undefined : questions[current];
  const answered = question ? answers[question.id] : undefined;
  const isBattle = data?.mode === 'battle';
  const botRevealed = !isBattle || Boolean(question && revealed.has(question.id));
  const answeredCount = Object.keys(answers).length;
  const wrongCount = Object.values(answers).filter((a) => !a.correct).length;
  const livesLeft = quizConfig.livesEnabled ? Math.max(0, quizConfig.lives - wrongCount) : null;
  const isLast = current >= total - 1 || livesLeft === 0;

  const answerMutation = useMutation({
    mutationFn: ({ questionId, optionId }) => api('/quiz/answer', { method: 'POST', body: { questionId, optionId, attemptId } }),
    onSuccess: (res, { questionId }) => {
      client.setQueryData(['attempt', attemptId, lang], (old) => ({
        ...old,
        answers: {
          ...old.answers,
          [questionId]: { optionId: res.selectedOptionId, correct: res.correct, correctOptionId: res.correctOptionId, explanation: res.explanation, bot: res.bot },
        },
      }));
    },
    onSettled: () => setPendingOption(null),
  });

  const hintMutation = useMutation({
    mutationFn: ({ questionId }) => api('/quiz/hint', { method: 'POST', body: { questionId, attemptId } }),
    onSuccess: (res, { questionId }) => setHints((h) => ({ ...h, [`${questionId}:${lang}`]: res.hint })),
  });

  const choose = useCallback(
    (optionId) => {
      if (!question || answered || answerMutation.isPending) return;
      setPendingOption(optionId);
      answerMutation.mutate({ questionId: question.id, optionId });
    },
    [question, answered, answerMutation],
  );

  // Keyboard shortcuts: 1-4 or A-D pick an answer.
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || !question) return;
      const key = e.key.toUpperCase();
      const i = LETTERS.indexOf(key) >= 0 ? LETTERS.indexOf(key) : Number(key) - 1;
      if (Number.isInteger(i) && i >= 0 && i < question.options.length) choose(question.options[i].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, choose]);

  // Move focus to Next once feedback appears so keyboard users can continue immediately.
  useEffect(() => {
    if (answered && botRevealed) nextRef.current?.focus();
  }, [answered, botRevealed]);

  // Battle: the bot 'answers' after its planned delay, counted from when the question appeared.
  const questionId = question?.id;
  useEffect(() => {
    shownAt.current = Date.now();
  }, [questionId]);
  const botDelay = answered?.bot?.delayMs;
  useEffect(() => {
    if (!isBattle || !questionId || botDelay === undefined || revealed.has(questionId)) return undefined;
    const wait = Math.max(0, botDelay * quizConfig.botDelayScale - (Date.now() - shownAt.current));
    const id = setTimeout(() => setRevealed((prev) => new Set(prev).add(questionId)), wait);
    return () => clearTimeout(id);
  }, [isBattle, questionId, botDelay, revealed]);

  const finish = () => {
    clearActiveAttempt();
    navigate(`/quiz/results/${attemptId}`);
  };
  const next = () => (isLast ? finish() : setIdx(current + 1));

  if (startError) return <ErrorState message={t('play.startError')} error={startError} onRetry={() => { startedRef.current = true; start(); }} />;
  if (attemptQuery.isError && !(attemptQuery.error instanceof ApiError && attemptQuery.error.status === 404)) {
    return <ErrorState message={t('play.startError')} error={attemptQuery.error} onRetry={() => attemptQuery.refetch()} />;
  }
  if (!question) return <LoadingBlock label={t('play.loading')} />;

  const hintText = hints[`${question.id}:${lang}`];
  const optionState = (o) => {
    if (answered) return o.id === answered.correctOptionId ? 'correct' : o.id === answered.optionId ? 'incorrect' : 'dim';
    return pendingOption === o.id ? 'selected' : 'idle';
  };
  const userScore = Object.values(answers).filter((a) => a.correct).length;
  const botScore = Object.entries(answers).filter(([qid, a]) => revealed.has(qid) && a.bot?.correct).length;
  const botText = answered?.bot ? question.options.find((o) => o.id === answered.bot.optionId)?.text : '';
  const correctText = answered ? question.options.find((o) => o.id === answered.correctOptionId)?.text : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="score-num text-lg">{t('play.counter', { current: current + 1, total })}</span>
        {livesLeft !== null && (
          <span className="flex items-center gap-1 text-red-700 dark:text-red-300" aria-label={t('play.lives', { count: livesLeft })}>
            {Array.from({ length: quizConfig.lives }, (_, i) => (
              <Icon key={i} name="heart" className={`h-5 w-5 ${i < livesLeft ? '' : 'opacity-30'}`} />
            ))}
          </span>
        )}
        <Link to="/quiz" className="btn text-sm text-subtle underline">{t('play.exit')}</Link>
      </div>

      {isBattle && <BattleHeader userScore={userScore} botScore={botScore} total={total} difficulty={data.bot?.difficulty} />}

      <div
        role="progressbar"
        aria-label={t('play.progressLabel', { current: current + 1, total })}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answeredCount}
        className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700"
      >
        <div className="h-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${(answeredCount / total) * 100}%` }} />
      </div>

      <QuestionCard question={question} headingId="question-heading">
        <div role="group" aria-labelledby="question-heading" className="mt-4 grid gap-3">
          {question.options.map((o, i) => (
            <AnswerButton
              key={o.id}
              letter={LETTERS[i]}
              text={o.text}
              state={optionState(o)}
              disabled={Boolean(answered) || answerMutation.isPending}
              onClick={() => choose(o.id)}
              shortcut={`${i + 1} ${LETTERS[i]}`}
            />
          ))}
        </div>

        {quizConfig.hintsEnabled && question.hasHint && !answered && (
          <div className="mt-4">
            {hintText ? (
              <p role="note" className="rounded-btn bg-sky-50 p-3 text-sky-950 dark:bg-slate-700 dark:text-sky-100">
                <strong>{t('play.hintLabel')}: </strong>{hintText}
              </p>
            ) : (
              <button type="button" className="btn-secondary" disabled={hintMutation.isPending} onClick={() => hintMutation.mutate({ questionId: question.id })}>
                {t('play.hint', { cost: quizConfig.hintCost })}
              </button>
            )}
          </div>
        )}
      </QuestionCard>

      {answerMutation.isError && (
        <div role="alert" className="card border-2 border-red-700 text-red-950 dark:text-red-50">
          <p className="font-semibold">{t('play.submitError')}</p>
          <button type="button" className="btn-primary mt-3" onClick={() => answerMutation.mutate(answerMutation.variables)}>
            {t('retry', { ns: 'common' })}
          </button>
        </div>
      )}

      <div aria-live="polite" role="status">
        {answered && (
          <div className={`card border-l-8 ${answered.correct ? 'border-green-700' : 'border-red-700'}`}>
            <p className="flex items-center gap-2 text-lg font-bold">
              <Icon name={answered.correct ? 'check' : 'x'} className="h-6 w-6" />
              {answered.correct ? t('play.correct') : t('play.incorrect')}
            </p>
            {!answered.correct && <p className="mt-1 font-medium">{t('play.correctAnswerIs', { answer: correctText })}</p>}
            <p className="mt-2">{answered.explanation}</p>
          </div>
        )}
        {answered && isBattle && (
          <div className="card mt-3 flex items-center gap-2">
            {botRevealed ? (
              <>
                <Icon name={answered.bot.correct ? 'check' : 'x'} className="h-5 w-5 shrink-0" />
                <span>{t(answered.bot.correct ? 'battle.botCorrect' : 'battle.botWrong', { answer: botText })}</span>
              </>
            ) : (
              <span className="text-subtle">{t('battle.botThinking')}</span>
            )}
          </div>
        )}
      </div>

      {answered && botRevealed && (
        <button ref={nextRef} type="button" className="btn-primary w-full sm:w-auto" onClick={next}>
          {isLast ? t('play.finish') : t('play.next')}
          <Icon name="arrowRight" />
        </button>
      )}
    </div>
  );
}
