import { flagSrc } from '../data/fifa.js'

/**
 * A team flag in a square box. The flag files come in different aspect ratios,
 * so the image is contained (never stretched or cropped) inside the square.
 */
export default function Flag({ code, label, size = 'md', className = '' }) {
  return (
    <span className={`fifa-flag fifa-flag--${size} ${className}`.trim()}>
      <img src={flagSrc(code)} alt={label} loading="lazy" decoding="async" />
    </span>
  )
}
