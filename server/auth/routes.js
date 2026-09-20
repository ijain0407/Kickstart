import { Router } from 'express';
import { z } from 'zod';
import { clientId, isConfigured, verifyIdToken } from './google.js';
import { SESSION_TTL_MS } from './store.js';
import {
  clearSessionCookie,
  newSessionId,
  newUserId,
  sanitizeUserId,
  setSessionCookie,
} from './session.js';

/* ============================================================
   AUTH ROUTES

     GET  /api/auth/config   is sign-in available, and with which client id
     GET  /api/auth/me       the current session, or { user: null }
     POST /api/auth/google   exchange a Google ID token for a session
     POST /api/auth/logout   destroy the session

   Signing in is optional throughout. A signed-out visitor keeps
   the anonymous id their browser generated and the whole app
   works; signing in binds that id to the account so progress
   follows the person to their next device.
   ============================================================ */

const signInBody = z.object({
  credential: z.string().min(1, 'A Google credential is required'),
  // What this browser has been using while signed out. Only honoured on the
  // very first sign-in for an account — see the store for why.
  anonymousId: z.string().optional(),
});

/** Only ever the fields the client needs to render — never the raw claims. */
const publicUser = (account) => ({
  name: account.name,
  email: account.email,
  picture: account.picture,
});

export function authRoutes({ store, verify }) {
  const verifyToken = verify ?? verifyIdToken;
  const router = Router();

  router.get('/config', (req, res) => {
    res.json({ enabled: isConfigured(), clientId: clientId() });
  });

  router.get('/me', (req, res) => {
    if (!req.auth) return res.json({ user: null, userId: null });
    const account = store.getAccount(req.auth.sub);
    if (!account) return res.json({ user: null, userId: null });
    res.json({ user: publicUser(account), userId: account.userId });
  });

  router.post('/google', async (req, res, next) => {
    try {
      if (!isConfigured()) {
        return res.status(503).json({
          error: { code: 'AUTH_DISABLED', message: 'Google sign-in is not configured on this server' },
        });
      }

      const { credential, anonymousId } = signInBody.parse(req.body ?? {});

      let claims;
      try {
        claims = await verifyToken(credential);
      } catch (err) {
        // Never echo the verifier's message back: it can describe the token.
        console.warn('[auth] rejected a Google credential:', err.message);
        return res.status(401).json({
          error: { code: 'INVALID_CREDENTIAL', message: 'That Google sign-in could not be verified' },
        });
      }

      const account = store.upsertAccount({
        sub: claims.sub,
        email: claims.email,
        name: claims.name,
        picture: claims.picture,
        // First sign-in adopts this browser's anonymous id, so the XP earned
        // before signing in is the account's XP. Later sign-ins ignore it.
        userId: sanitizeUserId(anonymousId),
      });

      const sessionId = newSessionId();
      store.createSession(sessionId, { sub: account.sub, userId: account.userId });
      setSessionCookie(res, sessionId, SESSION_TTL_MS);

      res.json({ user: publicUser(account), userId: account.userId });
    } catch (err) {
      next(err);
    }
  });

  router.post('/logout', (req, res) => {
    if (req.auth) store.destroySession(req.auth.sessionId);
    clearSessionCookie(res);
    // A fresh anonymous id rather than the account's: on a shared computer,
    // signing out must not leave the next person holding someone's progress.
    res.json({ user: null, userId: newUserId() });
  });

  return router;
}
