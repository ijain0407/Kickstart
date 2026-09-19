/** Material Symbols Outlined glyph. `fill` switches to the filled axis. */
export default function Icon({ name, fill = false, className = '', style, ...rest }) {
  return (
    <span
      className={`msym ${className}`.trim()}
      data-fill={fill ? '1' : '0'}
      style={style}
      aria-hidden="true"
      translate="no"
      {...rest}
    >
      {name}
    </span>
  )
}
