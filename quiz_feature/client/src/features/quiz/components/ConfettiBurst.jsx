const COLORS = ['bg-primary', 'bg-amber', 'bg-sky', 'bg-coral'];
const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  return { dx: `${Math.round(Math.cos(angle) * 48)}px`, dy: `${Math.round(Math.sin(angle) * 48)}px`, color: COLORS[i % COLORS.length] };
});

/** Small celebratory pulse. Hidden entirely when the user prefers reduced motion. */
export default function ConfettiBurst() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute right-6 top-1/2 h-0 w-0 motion-reduce:hidden">
      {PARTICLES.map((p, i) => (
        <span key={i} className={`absolute h-2 w-2 animate-burst rounded-full ${p.color}`} style={{ '--dx': p.dx, '--dy': p.dy }} />
      ))}
    </span>
  );
}
