import { Router } from 'express';
import { z } from 'zod';
import { isDbConfigured } from '../db/pool.js';
import { MIN_PASSWORD_LENGTH } from './passwords.js';
import {
  adoptAnonymousProgress,
  authenticate,
  createUser,
  findById,
  publicUser,
  updateProfile,
} from './users.js';
import { clearSessionCookie, createSession, destroySession, readCookie, setSessionCookie } from './sessions.js';

/* ============================================================
   AUTH ROUTES

   POST /api/auth/register   { email, password, displayName }
   POST /api/auth/login      { email, password }
   POST /api/auth/logout
   GET  /api/auth/session    -> { user } or { user: null }
   PATCH /api/auth/profile   { displayName?, favouriteClubId?, favouriteLeagueId? }

   Signing in is optional: the app works anonymously, and signing
   in carries whatever progress was earned first onto the account.
   ============================================================ */

const email = z.string().trim().email().max(320);
const password = z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`).max(200);

const registerBody = z.object({
  email,
  password,
  displayName: z.string().trim().min(1, 'Name is required').max(60),
  anonymousId: z.string().trim().max(64).optional(),
});

const loginBody = z.object({ email, password, anonymousId: z.string().trim().max(64).optional() });

const profileBody = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
  favouriteClubId: z.string().trim().max(80).nullable().optional(),
  favouriteLeagueId: z.string().trim().max(80).nullable().optional(),
});

const unavailable = (res) =>
  res.status(503).json({
    error: { code: 'DB_UNAVAILABLE', message: 'Accounts need DATABASE_URL to be set on the server' },
  });

export function authRoutes() {
  const router = Router();

  /** Signs the user in and hands back the cookie plus the public account. */
  async function startSession(res, user, anonymousId) {
    const adopted = await adoptAnonymousProgress(anonymousId, user.id);
    const { token, expiresAt } = await createSession(user.id);
    setSessionCookie(res, token, expiresAt);
    return { user: publicUser(user), adoptedProgress: adopted };
  }

  router.post('/register', async (req, res, next) => {
    if (!isDbConfigured()) return unavailable(res);
    try {
      const body = registerBody.parse(req.body);
      const { user, error } = await createUser(body);
      if (error === 'EMAIL_TAKEN') {
        return res.status(409).json({ error: { code: 'EMAIL_TAKEN', message: 'That email already has an account' } });
      }

      res.status(201).json(await startSession(res, user, body.anonymousId));
    } catch (err) {
      next(err);
    }
  });

  router.post('/login', async (req, res, next) => {
    if (!isDbConfigured()) return unavailable(res);
    try {
      const body = loginBody.parse(req.body);
      const user = await authenticate(body);
      if (!user) {
        // Deliberately vague: saying which half was wrong tells an attacker
        // whether an address has an account.
        return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' } });
      }
      res.json(await startSession(res, user, body.anonymousId));
    } catch (err) {
      next(err);
    }
  });

  router.post('/logout', async (req, res, next) => {
    try {
      if (isDbConfigured()) await destroySession(readCookie(req));
      clearSessionCookie(res);
      res.json({ user: null });
    } catch (err) {
      next(err);
    }
  });

  router.get('/session', (req, res) => {
    // Resolved by the middleware in gateway.js, so this is just a read.
    res.json({ user: req.auth?.user ? publicUser(req.auth.user) : null, accounts: isDbConfigured() });
  });

  router.patch('/profile', async (req, res, next) => {
    if (!isDbConfigured()) return unavailable(res);
    if (!req.auth?.user) {
      return res.status(401).json({ error: { code: 'NOT_SIGNED_IN', message: 'Sign in to change your profile' } });
    }
    try {
      const body = profileBody.parse(req.body);
      const updated = (await updateProfile(req.auth.user.id, body)) ?? (await findById(req.auth.user.id));
      res.json({ user: publicUser(updated) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
