/**
 * Labelled 0-100 bars. Used for a league's trait ratings, for the quiz's answer
 * profile, and for the ranking on the result screen — so it takes plain
 * { id, label, percent, caption } items rather than anything league-shaped.
 */
export default function TraitBars({ items, title, titleId, highlightIds = [] }) {
  return (
    <section aria-labelledby={titleId}>
      {title && (
        <h3 id={titleId} className="font-display text-lg">
          {title}
        </h3>
      )}
      <dl className="mt-3 space-y-2">
        {items.map((item) => {
          const highlighted = highlightIds.includes(item.id);
          return (
            <div key={item.id} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-3 text-sm">
              <dt className={highlighted ? 'font-semibold' : undefined}>{item.label}</dt>
              <dd
                className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700"
                role="meter"
                aria-valuenow={item.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={item.label}
              >
                <div
                  className={`h-full rounded-full ${highlighted ? 'bg-amber' : 'bg-primary-dark dark:bg-green-400'}`}
                  style={{ width: `${item.percent}%` }}
                />
              </dd>
              <dd className="score-num text-right text-subtle">{item.caption ?? `${item.percent}%`}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

/** League traits are rated 1-5; the bars want 0-100. */
export function traitsToItems(traits, definitions) {
  return definitions.map((definition) => ({
    id: definition.id,
    label: definition.label,
    percent: Math.round(((traits[definition.id] ?? 0) / 5) * 100),
    caption: `${traits[definition.id] ?? 0}/5`,
  }));
}
