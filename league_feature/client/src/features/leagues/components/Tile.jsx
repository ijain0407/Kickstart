import { Link } from 'react-router-dom';

/**
 * One browsable item: a league on the hub, a club on a league profile.
 * Deliberately content-agnostic — pass strings and it lays them out; pass `to` and the
 * whole tile becomes a link. TODO(A): swap the `card` class for the design system's Card.
 */
export default function Tile({ eyebrow, title, description, meta = [], badge, to, cta, children }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{eyebrow}</p>}
          <h3 className="font-display text-xl">{title}</h3>
        </div>
        {badge && <span className="chip shrink-0">{badge}</span>}
      </div>
      {description && <p className="mt-2 text-pretty">{description}</p>}
      {children}
      {meta.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2 text-sm text-subtle">
          {meta.map((item) => (
            <li key={item} className="after:ml-2 after:content-['·'] last:after:content-['']">
              {item}
            </li>
          ))}
        </ul>
      )}
      {cta && <p className="mt-3 font-semibold text-primary-dark dark:text-green-300">{cta} →</p>}
    </>
  );

  if (!to) return <article className="card">{body}</article>;

  return (
    <Link to={to} className="card block transition-shadow hover:shadow-lg focus-visible:shadow-lg">
      {body}
    </Link>
  );
}
