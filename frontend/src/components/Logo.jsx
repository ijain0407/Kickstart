/**
 * SoccerTeaching mark: rounded square with the pitch gradient, a white
 * speech bubble, and a dark-green ball pentagon with five seam lines.
 * ids are suffixed so multiple instances never collide in one document.
 */
export default function Logo({ size = 32, className = '', id = 'app' }) {
  const grad = `pitchGrad-${id}`
  const shadow = `subtleShadow-${id}`
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="SoccerTeaching"
    >
      <defs>
        <linearGradient id={grad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <filter id={shadow} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
        </filter>
      </defs>
      <rect width="120" height="120" rx="30" fill={`url(#${grad})`} />
      <path
        d="M60 22 C38 22 22 36 22 54 C22 65 29 74 41 80 L36 96 L53 87 C55.3 87.5 57.6 88 60 88 C82 88 98 74 98 54 C98 36 82 22 60 22 Z"
        fill="#fff"
        filter={`url(#${shadow})`}
      />
      <polygon points="60,42 70,49 66,61 54,61 50,49" fill="#15803d" />
      <g stroke="#15803d" strokeWidth="2.5" strokeLinecap="round">
        <line x1="60" y1="42" x2="60" y2="31" />
        <line x1="70" y1="49" x2="79" y2="44" />
        <line x1="66" y1="61" x2="75" y2="70" />
        <line x1="54" y1="61" x2="45" y2="70" />
        <line x1="50" y1="49" x2="41" y2="44" />
      </g>
    </svg>
  )
}
