import Icon from './Icon.jsx'

/**
 * The "Field Press" button. `variant` picks the face; the 4px bottom
 * rim and the press-down travel live in CSS so every instance behaves
 * identically.
 */
export default function FieldPressButton({
  variant = 'primary',
  block = false,
  size,
  icon,
  iconAfter,
  iconFill = false,
  children,
  className = '',
  ...rest
}) {
  return (
    <button
      type="button"
      className={[
        'fp',
        `fp--${variant}`,
        block ? 'fp--block' : '',
        size === 'sm' ? 'fp--sm' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon ? <Icon name={icon} fill={iconFill} /> : null}
      {children ? <span>{children}</span> : null}
      {iconAfter ? <Icon name={iconAfter} fill={iconFill} /> : null}
    </button>
  )
}
