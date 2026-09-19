import { Link } from 'react-router-dom';

/**
 * Rivalries from either shape in the content: a league's `clubs` array, or a culture
 * card's single `opponent` (optionally linking to that club's card).
 */
export default function RivalryList({ rivalries, title, titleId }) {
  return (
    <section aria-labelledby={titleId}>
      <h3 id={titleId} className="font-display text-lg">
        {title}
      </h3>
      <ul className="mt-3 space-y-3">
        {rivalries.map((rivalry) => {
          const against = rivalry.clubs ? rivalry.clubs.join(' vs. ') : rivalry.opponent;
          return (
            <li key={rivalry.name} className="border-l-4 border-primary-dark pl-3 dark:border-green-400">
              <p className="font-semibold">
                {rivalry.name}
                <span className="ml-2 font-normal text-subtle">{against}</span>
              </p>
              <p className="text-sm text-pretty">{rivalry.description}</p>
              {rivalry.opponentCultureId && (
                <Link to={`/culture/${rivalry.opponentCultureId}`} className="text-sm font-semibold text-primary-dark underline dark:text-green-300">
                  {rivalry.opponent} →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
