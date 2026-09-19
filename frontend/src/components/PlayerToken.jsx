import Icon from './Icon.jsx'

/**
 * A single shirt on the pitch: Barlow Condensed number in a white disc,
 * position code beneath, optional surname. Position comes from the
 * formation as top/left percentages, so a formation change animates
 * the token along both axes.
 */
export default function PlayerToken({
  player,
  name,
  showName = false,
  selected = false,
  highlight = false,
  onSelect,
  label,
  gold = false,
}) {
  const isKeeper = gold || player.code === 'GK'
  const interactive = typeof onSelect === 'function'

  const classes = [
    'ptoken',
    isKeeper ? 'ptoken--gk' : '',
    selected ? 'ptoken--selected' : '',
    highlight ? 'ptoken--highlight' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {selected ? <span className="heatblob" aria-hidden="true" /> : null}
      <span className="ptoken__disc">
        {player.num}
        {selected ? (
          <span className="ptoken__star">
            <Icon name="star" fill />
          </span>
        ) : null}
      </span>
      <span className="ptoken__code">{player.code}</span>
      {showName && name ? <span className="ptoken__name">{name}</span> : null}
    </>
  )

  const style = { top: `${player.top}%`, left: `${player.left}%` }

  if (!interactive) {
    return (
      <span className={classes} style={style} aria-hidden="true">
        {content}
      </span>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      style={style}
      onClick={() => onSelect(player)}
      aria-pressed={selected}
      aria-label={label}
    >
      {content}
    </button>
  )
}
