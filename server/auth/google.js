import { OAuth2Client } from 'google-auth-library';

/* ============================================================
   GOOGLE IDENTITY — verifying the ID token.

   The browser uses Google Identity Services, which hands the page
   a signed ID token (a JWT) rather than an authorization code.
   That means no client secret and no redirect dance: the token
   comes here, is verified against Google's public keys, and the
   claims inside it become the account.

   Verification is not optional. An ID token is attacker-supplied
   input until `verifyIdToken` has checked its signature, issuer,
   expiry and — crucially — that its `aud` is our own client id.
   Without the audience check any valid Google token from any app
   would sign someone in here.
   ============================================================ */

const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

/** No client id configured means the whole feature stays switched off. */
export const isConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID);

export const clientId = () => process.env.GOOGLE_CLIENT_ID ?? null;

let client = null;
const getClient = () => {
  client ??= new OAuth2Client(clientId());
  return client;
};

/**
 * Verifies a Google ID token and returns the profile claims.
 * Throws on anything unverifiable — callers turn that into a 401.
 */
export async function verifyIdToken(credential, { verifier = getClient } = {}) {
  const ticket = await verifier().verifyIdToken({
    idToken: credential,
    audience: clientId(),
  });

  const payload = ticket.getPayload();
  if (!payload?.sub) throw new Error('Token carried no subject');
  if (!GOOGLE_ISSUERS.includes(payload.iss)) throw new Error(`Unexpected issuer '${payload.iss}'`);

  return {
    sub: payload.sub,
    email: payload.email ?? null,
    // An unverified address must not be treated as proof of anything, so it is
    // recorded but flagged. Nothing here grants access on the strength of it.
    emailVerified: Boolean(payload.email_verified),
    name: payload.name ?? payload.given_name ?? null,
    picture: payload.picture ?? null,
  };
}
