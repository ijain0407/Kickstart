import { useMemo } from 'react'

const COLORS = ['#f59e0b', '#ef4444', '#16a34a', '#fbbf24', '#22c55e']

/** Gold / coral / green burst. Respects prefers-reduced-motion via CSS. */
export default function Confetti({ count = 70 }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.8 + Math.random() * 1.4,
        color: COLORS[i % COLORS.length],
        tilt: Math.random() * 40 - 20,
      })),
    [count],
  )

  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((bit) => (
        <span
          key={bit.id}
          className="confetti__bit"
          style={{
            left: `${bit.left}%`,
            background: bit.color,
            animationDelay: `${bit.delay}s`,
            animationDuration: `${bit.duration}s`,
            rotate: `${bit.tilt}deg`,
          }}
        />
      ))}
    </div>
  )
}
