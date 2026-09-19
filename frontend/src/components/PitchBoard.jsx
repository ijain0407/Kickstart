/**
 * The pitch surface: mowing stripes, chalk markings, an optional zone
 * grid and offside line. Everything is percentage-based so the same
 * component renders the hero preview and the full Tactical Lab board.
 */
export default function PitchBoard({
  className = '',
  markings = 'full',
  showZones = false,
  offside = null,
  offsideLabel,
  hint,
  children,
  ...rest
}) {
  return (
    <div className={`pitch ${className}`.trim()} {...rest}>
      <div className="pitch__turf" aria-hidden="true" />

      <div className="pitch__lines" aria-hidden="true">
        <span className="chalk chalk--outer" />
        <span className="chalk chalk--halfway" />
        <span className="chalk chalk--circle" />
        <span className="chalk chalk--spot" />
        {markings === 'full' ? (
          <>
            <span className="chalk chalk--pen-top" />
            <span className="chalk chalk--pen-bottom" />
            <span className="chalk chalk--six-top" />
            <span className="chalk chalk--six-bottom" />
            <span className="chalk chalk--arc-top" />
            <span className="chalk chalk--arc-bottom" />
          </>
        ) : null}
      </div>

      <div className={`pitch__zones ${showZones ? 'is-on' : ''}`.trim()} aria-hidden="true">
        {Array.from({ length: 15 }, (_, i) => (
          <span key={i} />
        ))}
      </div>

      {offside != null ? (
        <div className="offside" style={{ top: `${offside}%` }} aria-hidden="true">
          {offsideLabel ? <span className="offside__flag">● {offsideLabel}</span> : null}
        </div>
      ) : null}

      {children}

      {hint ? <span className="pitch__hint">{hint}</span> : null}
    </div>
  )
}
