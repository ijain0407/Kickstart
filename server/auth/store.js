import { createJsonStore } from '../../quiz_feature/server/src/repos/jsonStore.js';

/* ============================================================
   AUTH STORE — accounts and sessions.

   Two records, both on the same tiny JSON store the rest of the
   project uses (`file = null` keeps it in memory, which is what
   the tests get).

     account   one per Google user, keyed by their `sub`
     session   one per sign-in, keyed by an opaque random token

   The important field is `account.userId`. It is NOT the Google
   id: it is whatever anonymous id the browser was already using
   when the account first signed in. Binding the account to that
   id means progress is never migrated — Person D's store keeps
   the same key it always had, and signing in on a second device
   simply hands that device the same id. No PII reaches the
   progress store either.
   ============================================================ */

const DAY = 24 * 60 * 60 * 1000;
export const SESSION_TTL_MS = 30 * DAY;

export function createAuthStore({ dataDir = null, now = () => Date.now() } = {}) {
  const accounts = createJsonStore(dataDir ? `${dataDir}/accounts.json` : null);
  const sessions = createJsonStore(dataDir ? `${dataDir}/sessions.json` : null);

  return {
    getAccount: (sub) => accounts.get(sub),

    /**
     * First sign-in binds the account to `userId` and keeps it forever. Later
     * sign-ins only refresh the profile — never the id, or the account would
     * lose its progress every time it signed in from a new browser.
     */
    upsertAccount: ({ sub, email, name, picture, userId }) => {
      const existing = accounts.get(sub);
      const account = existing
        ? { ...existing, email, name, picture, lastLoginAt: now() }
        : { sub, email, name, picture, userId, createdAt: now(), lastLoginAt: now() };
      accounts.set(sub, account);
      return account;
    },

    createSession: (id, { sub, userId }) => {
      const session = { id, sub, userId, createdAt: now(), expiresAt: now() + SESSION_TTL_MS };
      sessions.set(id, session);
      return session;
    },

    /** Returns null for an unknown or expired session, dropping it on the way out. */
    getSession: (id) => {
      const session = sessions.get(id);
      if (!session) return null;
      if (session.expiresAt <= now()) {
        sessions.set(id, null);
        return null;
      }
      return session;
    },

    destroySession: (id) => sessions.set(id, null),
  };
}
