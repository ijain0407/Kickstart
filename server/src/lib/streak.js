import { gamificationConfig as cfg } from '../config/gamificationConfig.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function daysBetween(fromDate, toDate) {
  return Math.round((Date.parse(`${toDate}T00:00:00Z`) - Date.parse(`${fromDate}T00:00:00Z`)) / 86400000);
}

/** Resolve the user's local date from X-Client-Date, then X-Timezone, then server UTC. */
export function resolveClientDate({ clientDate, timezone, now = new Date() } = {}) {
  if (isValidDateString(clientDate)) return clientDate;
  if (timezone) {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    } catch {
      /* invalid timezone, fall through */
    }
  }
  return now.toISOString().slice(0, 10);
}

/**
 * Pure streak update. Returns the new streak and whether this is the first activity of `today`.
 * A gap of more than one day resets to 1; a clock that went backwards leaves the streak untouched.
 */
export function updateStreak(streak, today) {
  const last = streak.lastActiveDate;
  if (last && daysBetween(last, today) <= 0) {
    return { streak: { ...streak }, firstActivityToday: false };
  }
  const current = last && daysBetween(last, today) === 1 ? streak.current + 1 : 1;
  return {
    streak: { current, best: Math.max(streak.best, current), lastActiveDate: today },
    firstActivityToday: true,
  };
}

export function streakBonusXp(currentStreak) {
  return cfg.xp.streakBonusPerDay * Math.min(currentStreak, cfg.xp.streakBonusMaxDays);
}
