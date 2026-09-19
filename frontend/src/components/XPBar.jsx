/** Gold glossy XP meter. The shimmer sweep is pure decoration. */
export default function XPBar({ value, max, label, className = '' }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
  return (
    <div className={`stack stack-2 ${className}`.trim()}>
      {label ? (
        <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
          <span className="t-body-md text-secondary">{label}</span>
          <span className="t-num" style={{ fontSize: 16 }}>
            {pct}%
          </span>
        </div>
      ) : null}
      <div
        className="xpbar"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className="xpbar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
