import { fileURLToPath } from 'node:url';
import { createGateway } from './gateway.js';

// GOOGLE_CLIENT_ID and friends live in a gitignored .env at the repo root.
// Node reads it natively, so there is no dotenv dependency; a missing file is
// the normal case (sign-in is optional) and must not stop the server.
try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
} catch {
  /* no .env — Google sign-in stays off */
}

const port = Number(process.env.PORT ?? 4000);
const quizDataDir = process.env.QUIZ_DATA_DIR ?? fileURLToPath(new URL('../quiz_feature/server/data', import.meta.url));
// Accounts and sessions. Kept out of any workstream's folder because auth is
// shared, and gitignored because sessions are live credentials.
const authDataDir = process.env.AUTH_DATA_DIR ?? fileURLToPath(new URL('../server/data', import.meta.url));

createGateway({ quizDataDir, authDataDir }).listen(port, () => {
  console.log(`Kickstart API listening on http://localhost:${port}`);
  console.log('  lessons/formations/glossary · leagues/culture/league-quiz · quiz/progress/explain');
  console.log(
    process.env.GOOGLE_CLIENT_ID
      ? '  Google sign-in: on'
      : '  Google sign-in: off (set GOOGLE_CLIENT_ID in .env to enable)',
  );
});
