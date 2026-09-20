import { createHash, randomBytes } from 'node:crypto';
import { query } from '../db/pool.js';

/* ============================================================
   SESSIONS

   The browser gets an httpOnly cookie holding a random token.
   Only the token's SHA-256 hash is stored, so the sessions table
   is useless to anyone who reads it: it can identify a session
   but not forge the cookie that opens it.
   ============================================================ */

export const COOKIE_NAME = 'kickstart_session';
const TTL_DAYS = 30;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export async function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + TTL_MS);
  await query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)', [
    hashToken(token),
    userId,
    expiresAt,
  ]);
  return { token, expiresAt };
}

/** The account behind a cookie, or null when it's missing, unknown or expired. */
export async function userForToken(token) {
  if (!token) return null;
  const { rows } = await query(
    `SELECT u.id, u.email, u.display_name, u.favourite_club_id, u.favourite_league_id, u.created_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)],
  );
  return rows[0] ?? null;
}

export async function destroySession(token) {
  if (!token) return;
  await query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
}

/** Housekeeping: drop rows that expired. Called on boot. */
export async function purgeExpiredSessions() {
  const { rowCount } = await query('DELETE FROM sessions WHERE expires_at <= now()');
  return rowCount;
}

/** Minimal cookie parsing — one header, no dependency. */
export function readCookie(req, name = COOKIE_NAME) {
  const header = req.headers?.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return null;
}

export function setSessionCookie(res, token, expiresAt) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${expiresAt.toUTCString()}`,
  ];
  // Secure needs HTTPS; setting it on plain-HTTP localhost would stop the
  // cookie being stored at all.
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res) {
  const parts = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}
