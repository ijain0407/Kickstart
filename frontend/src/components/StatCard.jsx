/** One cell of the country stat grid. Callers pass the localized N/A for unknown values. */
export default function StatCard({ label, value, hint, wide = false }) {
  return (
    <div className={`card card--pad fifa-stat ${wide ? 'fifa-stat--wide' : ''}`.trim()}>
      <dt className="t-label-meta text-secondary">{label}</dt>
      <dd className="fifa-stat__value">{value}</dd>
      {hint ? <dd className="fifa-stat__hint">{hint}</dd> : null}
    </div>
  )
}
