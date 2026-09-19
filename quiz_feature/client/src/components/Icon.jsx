// Generic rounded line icons only (no crests, logos or likenesses).
const PATHS = {
  check: 'M5 13l4 4L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  flame: 'M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-6 1-9z',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z',
  lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z',
  whistle: 'M4 10h9a4 4 0 110 8 4 4 0 01-4-4M13 10l7-3',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  flag: 'M6 21V4M6 5h11l-2 4 2 4H6',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  megaphone: 'M4 10v4l10 4V6L4 10zM14 9c3 0 4 1.5 4 3s-1 3-4 3',
  calendar: 'M5 6h14v14H5zM5 10h14M9 3v4M15 3v4',
  brain: 'M9 5a3 3 0 00-3 3 3 3 0 00-1 5 3 3 0 004 3 3 3 0 006 0 3 3 0 004-3 3 3 0 00-1-5 3 3 0 00-3-3 3 3 0 00-3-1 3 3 0 00-3 1z',
  globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  shield: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
  book: 'M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h10',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  swords: 'M5 5l9 9M19 5l-9 9M4 20l4-4M20 20l-4-4',
};

export default function Icon({ name, className = 'h-5 w-5', title }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d={PATHS[name] ?? PATHS.star} />
    </svg>
  );
}
