import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../../lib/api.js';
import Icon from '../../../components/Icon.jsx';

export const MAX_BYTES = 25 * 1024 * 1024;
export const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'image/gif'];
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function BouncingBall({ label }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-8">
      <span className="h-10 w-10 rounded-full border-4 border-ink bg-white motion-safe:animate-bounce dark:border-white" aria-hidden="true" />
      <p className="font-semibold">{label}</p>
    </div>
  );
}

/**
 * Rules-based DEMO. The clip is never uploaded or analyzed: only its name/type/size (or a link)
 * is sent so the server can pick a pre-written scenario.
 */
export default function ExplainPlay() {
  const { t, i18n } = useTranslation('explain');
  const lang = i18n.resolvedLanguage;
  const [request, setRequest] = useState(null);
  const [localError, setLocalError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewKind, setPreviewKind] = useState(null);
  const [link, setLink] = useState('');
  const videoRef = useRef(null);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const samples = useQuery({ queryKey: ['explain', 'samples', lang], queryFn: () => api('/explain/scenarios'), staleTime: Infinity });
  // The language is part of the key so switching language re-explains the same clip in the new language.
  const analysis = useQuery({
    queryKey: ['explain', 'analyze', request, lang],
    queryFn: () => api('/explain/analyze', { method: 'POST', body: request }),
    enabled: Boolean(request),
    retry: false,
  });

  const showPreview = (file) => {
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    setPreviewKind(file ? (file.type.startsWith('video/') ? 'video' : 'gif') : null);
  };

  const handleFile = (file) => {
    setLocalError('');
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return setLocalError(t('errors.type'));
    if (file.size > MAX_BYTES) return setLocalError(t('errors.size'));
    showPreview(file);
    setRequest({ source: 'file', filename: file.name, mimeType: file.type, size: file.size });
  };

  const handleLink = (e) => {
    e.preventDefault();
    setLocalError('');
    let url;
    try {
      url = new URL(link.trim());
    } catch {
      return setLocalError(t('errors.url'));
    }
    if (!['http:', 'https:'].includes(url.protocol)) return setLocalError(t('errors.url'));
    showPreview(null);
    setRequest({ source: 'url', url: url.toString() });
  };

  const runSample = (id) => {
    setLocalError('');
    showPreview(null);
    setRequest({ source: 'scenario', scenarioId: id });
  };

  const seek = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.focus();
    }
  };

  const data = analysis.data;
  const serverError = analysis.isError ? t(`errors.${{ UNSUPPORTED_TYPE: 'type', FILE_TOO_LARGE: 'size', INVALID_URL: 'url' }[analysis.error.code] ?? 'generic'}`) : '';
  const errorText = localError || serverError;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="flex flex-wrap items-center gap-3 text-2xl">
          {t('title')}
          <span className="chip">{t('demoBadge')}</span>
        </h1>
        <p className="card border-l-8 border-amber">{t('disclaimer')}</p>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
        className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-6 text-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky ${dragging ? 'border-primary-dark bg-green-50 dark:bg-slate-700' : 'border-gray-400 bg-white dark:border-slate-500 dark:bg-slate-800'}`}
      >
        <Icon name="bolt" className="h-8 w-8 text-primary-dark dark:text-green-300" />
        <span className="font-display text-lg font-bold">{dragging ? t('drop.dragging') : t('drop.label')}</span>
        <span className="text-sm text-subtle">{t('drop.hint')}</span>
        <input type="file" accept={ALLOWED_TYPES.join(',')} className="sr-only" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
      </label>

      <form onSubmit={handleLink} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="clip-url" className="mb-1 block font-semibold">{t('url.label')}</label>
          <input
            id="clip-url"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder={t('url.placeholder')}
            className="min-h-[44px] w-full rounded-btn border-2 border-gray-300 bg-white px-3 text-ink dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={!link.trim()}>{t('url.submit')}</button>
      </form>

      <section aria-labelledby="samples-title">
        <h2 id="samples-title" className="mb-2 text-lg">{t('samples.title')}</h2>
        <div className="flex flex-wrap gap-3">
          {samples.data?.scenarios.map((s) => (
            <button key={s.id} type="button" className="btn-secondary" onClick={() => runSample(s.id)}>
              {t('samples.play', { title: s.title })}
            </button>
          ))}
        </div>
      </section>

      {errorText && <p role="alert" className="card border-2 border-red-700 font-semibold text-red-950 dark:text-red-50">{errorText}</p>}

      {previewUrl && (
        <section className="card">
          {previewKind === 'video' ? (
            <video ref={videoRef} src={previewUrl} controls muted playsInline aria-label={t('preview.video')} className="max-h-72 w-full rounded-btn bg-black" />
          ) : (
            <img src={previewUrl} alt={t('preview.gif')} className="max-h-72 w-full rounded-btn object-contain" />
          )}
        </section>
      )}

      {analysis.isFetching && <BouncingBall label={t('loading')} />}

      {data && !analysis.isFetching && (
        <section aria-labelledby="timeline-title" className="space-y-3">
          <h2 id="timeline-title" className="text-xl">{t('results.title', { title: data.title })}</h2>
          {data.source === 'url' && <p className="text-subtle">{t('preview.link', { label: data.sourceLabel })}</p>}
          <p className={`card ${data.matched ? '' : 'border-l-8 border-sky'}`}>{data.matched ? t('results.matched') : t('results.unmatched')}</p>
          <ol className="space-y-3">
            {data.annotations.map((a) => (
              <li key={`${a.timestamp}-${a.title}`} className="card flex gap-4">
                {previewKind === 'video' ? (
                  <button type="button" onClick={() => seek(a.timestamp)} aria-label={t('results.jump', { time: fmtTime(a.timestamp) })} className="btn-secondary h-11 shrink-0 self-start px-3 score-num text-lg">
                    {fmtTime(a.timestamp)}
                  </button>
                ) : (
                  <span className="chip h-8 shrink-0 self-start score-num text-base">{fmtTime(a.timestamp)}</span>
                )}
                <div>
                  <h3 className="text-lg">{a.title}</h3>
                  <p>{a.explanation}</p>
                  {/* TODO(A): confirm the /learn/:lessonId route. */}
                  <Link to={`/learn/${a.lessonId}`} className="mt-1 inline-flex min-h-[44px] items-center gap-1 font-semibold text-primary-dark underline dark:text-green-300">
                    <Icon name="book" className="h-4 w-4" />
                    {t('results.openLesson', { lesson: t(`lesson.${a.lessonId}`, { ns: 'common' }) })}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
