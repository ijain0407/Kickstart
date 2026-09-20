import { fileURLToPath } from 'node:url';
import { createGateway } from './gateway.js';
import { isDbConfigured, ping } from './db/pool.js';
import { createPgStore } from './db/appStore.js';
import { migrate } from './db/migrate.js';
import { purgeExpiredSessions } from './auth/sessions.js';

const port = Number(process.env.PORT ?? 4000);
const quizDataDir = process.env.QUIZ_DATA_DIR ?? fileURLToPath(new URL('../quiz_feature/server/data', import.meta.url));

/**
 * With DATABASE_URL set, progress and attempts live in Postgres and accounts
 * are available. Without it the app still runs on JSON files — a teammate
 * without a database can work on everything except signing in.
 */
async function storage() {
  if (!isDbConfigured()) {
    console.log('  Accounts: off (set DATABASE_URL in .env to enable sign-in)');
    return { stores: undefined };
  }

  if (!(await ping())) {
    console.error('  Database: UNREACHABLE — falling back to JSON storage, sign-in disabled');
    return { stores: undefined };
  }

  // Schema first: the stores below read tables this creates.
  await migrate();
  const [progress, attempts] = await Promise.all([createPgStore('progress'), createPgStore('attempts')]);
  const purged = await purgeExpiredSessions();

  console.log(`  Database: connected · ${progress.size()} progress records, ${attempts.size()} attempts` +
    (purged ? ` · ${purged} expired sessions cleared` : ''));
  return { stores: { progress, attempts } };
}

const { stores } = await storage();

createGateway({ quizDataDir, stores }).listen(port, () => {
  console.log(`Kickstart API listening on http://localhost:${port}`);
  console.log('  lessons/formations/glossary · leagues/culture/league-quiz · quiz/progress/explain · auth');
});
