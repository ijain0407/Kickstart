import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);

/* ============================================================
   PASSWORD HASHING

   scrypt from Node's own crypto — deliberately slow and memory-
   hard, so a stolen table is expensive to attack, and no extra
   dependency to install or keep patched.

   Stored as: scrypt$N$r$p$<salt base64>$<hash base64>
   The parameters travel with the hash, so they can be raised
   later without invalidating existing passwords.
   ============================================================ */

const PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };
export const MIN_PASSWORD_LENGTH = 8;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, PARAMS.keylen, {
    N: PARAMS.N,
    r: PARAMS.r,
    p: PARAMS.p,
    // scrypt needs roughly 128 * N * r bytes; Node's default cap is lower.
    maxmem: 256 * PARAMS.N * PARAMS.r,
  });
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

/**
 * Constant-time check. Returns false for a malformed or unknown hash format
 * rather than throwing, so a bad row can't crash a login attempt.
 */
export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const [scheme, N, r, p, saltB64, hashB64] = stored.split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;

  try {
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const derived = await scrypt(password, salt, expected.length, {
      N: Number(N),
      r: Number(r),
      p: Number(p),
      maxmem: 256 * Number(N) * Number(r),
    });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
