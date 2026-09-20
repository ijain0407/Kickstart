import { query } from '../db/pool.js';
import { hashPassword, verifyPassword } from './passwords.js';

/* ============================================================
   ACCOUNTS
   Everything that touches the users table lives here, so the
   routes stay about HTTP and the SQL stays in one place.
   ============================================================ */

/** What the client is allowed to see about an account. Never the hash. */
export const publicUser = (row) =>
  row && {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    favouriteClubId: row.favourite_club_id ?? null,
    favouriteLeagueId: row.favourite_league_id ?? null,
    createdAt: row.created_at,
  };

export const normaliseEmail = (email) => String(email).trim().toLowerCase();

export async function findByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE lower(email) = lower($1)', [normaliseEmail(email)]);
  return rows[0] ?? null;
}

export async function findById(id) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}

/**
 * Creates an account. Returns { user } or { error: 'EMAIL_TAKEN' } — the
 * unique index is what actually decides, so two simultaneous signups with the
 * same address can't both win.
 */
export async function createUser({ email, password, displayName }) {
  const passwordHash = await hashPassword(password);
  try {
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [normaliseEmail(email), passwordHash, displayName],
    );
    return { user: rows[0] };
  } catch (err) {
    if (err.code === '23505') return { error: 'EMAIL_TAKEN' };
    throw err;
  }
}

/** Email + password check. Returns the row, or null for either mistake. */
export async function authenticate({ email, password }) {
  const user = await findByEmail(email);
  if (!user) {
    // Hash anyway so a missing account and a wrong password take the same
    // time — otherwise the response time tells an attacker which is which.
    await verifyPassword(password, 'scrypt$16384$8$1$AAAA$AAAA');
    return null;
  }
  const ok = await verifyPassword(password, user.password_hash);
  return ok ? user : null;
}

export async function updateProfile(userId, { displayName, favouriteClubId, favouriteLeagueId }) {
  const { rows } = await query(
    `UPDATE users SET
       display_name        = COALESCE($2, display_name),
       favourite_club_id   = CASE WHEN $3::text IS NULL THEN favourite_club_id ELSE NULLIF($3, '') END,
       favourite_league_id = CASE WHEN $4::text IS NULL THEN favourite_league_id ELSE NULLIF($4, '') END,
       updated_at          = now()
     WHERE id = $1
     RETURNING *`,
    [userId, displayName ?? null, favouriteClubId ?? null, favouriteLeagueId ?? null],
  );
  return rows[0] ?? null;
}

/**
 * Moves progress earned before signing in onto the new account.
 *
 * Only ever copies into an empty slot: if the account already has progress,
 * the anonymous record is left alone rather than overwriting a real history.
 */
export async function adoptAnonymousProgress(anonymousId, userId) {
  if (!anonymousId || anonymousId === userId) return false;
  const { rowCount } = await query(
    `INSERT INTO app_store (namespace, key, value, updated_at)
     SELECT namespace, $2, value, now() FROM app_store
     WHERE namespace = 'progress' AND key = $1
     ON CONFLICT (namespace, key) DO NOTHING`,
    [anonymousId, userId],
  );
  return rowCount > 0;
}
