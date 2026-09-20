import pg from 'pg';

/* ============================================================
   POSTGRES CONNECTION

   One pool for the process, created lazily from DATABASE_URL.
   With no DATABASE_URL set the app still runs: accounts are
   unavailable and progress falls back to the JSON store, so a
   teammate without Postgres can work on everything else.
   ============================================================ */

let pool = null;

export const isDbConfigured = () => Boolean(process.env.DATABASE_URL);

/**
 * Hosted Postgres (Render, Heroku, Supabase…) terminates TLS with certificates
 * that don't chain to a root Node ships with, so verification is relaxed for
 * remote hosts. A local database needs no TLS at all.
 */
function sslFor(connectionString) {
  if (process.env.PGSSLMODE === 'disable') return false;
  try {
    const { hostname } = new URL(connectionString);
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    return isLocal ? false : { rejectUnauthorized: false };
  } catch {
    return false;
  }
}

export function getPool() {
  if (!isDbConfigured()) return null;
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  pool = new pg.Pool({
    connectionString,
    ssl: sslFor(connectionString),
    max: Number(process.env.PGPOOL_MAX ?? 10),
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 30000,
  });

  // A pool error (server restart, dropped connection) must not take the
  // process down — the next query opens a fresh connection.
  pool.on('error', (err) => console.error('[db] idle client error:', err.message));

  return pool;
}

export async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error('DATABASE_URL is not set');
  return p.query(text, params);
}

/** True when the database is reachable — used by /api/health. */
export async function ping() {
  if (!isDbConfigured()) return false;
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export async function closePool() {
  if (!pool) return;
  await pool.end();
  pool = null;
}
