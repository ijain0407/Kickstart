import { randomBytes, randomUUID } from 'node:crypto';

/* ============================================================
   SESSIONS — the cookie, and how a request gets its user id.

   The cookie holds nothing but a 256-bit random token; everything
   about the session is looked up server-side. That is why it
   isn't signed — there is no payload to tamper with, and a
   guessed token is the only attack, which the entropy covers.
   ============================================================ */

export const SESSION_COOKIE = 'kickstart.sid';

/** Person D's API validates ids against this, so anything we mint must match. */
export const USER_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

export const newSessionId = () => randomBytes(32).toString('hex');

/** A fresh anonymous id, for a browser that arrives without one. */
export const newUserId = () => randomUUID();

/** Falls back to a fresh id rather than trusting whatever the client sent. */
export const sanitizeUserId = (candidate) =>
  typeof candidate === 'string' && USER_ID_RE.test(candidate) ? candidate : newUserId();

/**
 * Cookie header -> { name: value }. Express only parses cookies with
 * cookie-parser installed; for one opaque hex token that dependency buys
 * nothing, so the header is split here instead.
 */
export function parseCookies(header = '') {
  const jar = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 1) continue;
    const name = part.slice(0, eq).trim();
    if (!name) continue;
    try {
      jar[name] = decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      // A malformed escape is a malformed cookie — ignore that one entry.
    }
  }
  return jar;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};

export const setSessionCookie = (res, id, maxAge) =>
  res.cookie(SESSION_COOKIE, id, { ...cookieOptions, maxAge });

// No maxAge here: Express's clearCookie expires the cookie in 1970, and a
// maxAge in the options would override that with a date it computes itself.
export const clearSessionCookie = (res) => res.clearCookie(SESSION_COOKIE, cookieOptions);

/**
 * Resolves the session cookie and, when it is valid, *overwrites* the
 * X-User-Id header for everything mounted after this.
 *
 * Overwriting rather than defaulting is the point: while a session is live the
 * server decides who the request is from, so a stale or hand-edited header in
 * the client cannot address someone else's progress. Requests without a
 * session keep whatever id they sent, which is what keeps guests working.
 */
export function sessionResolver(store) {
  return (req, res, next) => {
    const jar = parseCookies(req.get('cookie'));
    const id = jar[SESSION_COOKIE];
    const session = id ? store.getSession(id) : null;

    req.auth = session ? { sessionId: id, sub: session.sub, userId: session.userId } : null;
    if (session) req.headers['x-user-id'] = session.userId;

    next();
  };
}
