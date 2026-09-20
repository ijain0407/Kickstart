import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { closePool, isDbConfigured, query } from './pool.js';

/**
 * Applies server/db/schema.sql. Every statement is IF NOT EXISTS, so this is
 * safe to run against a live database and safe to run twice.
 *
 *   npm run db:migrate
 */
export async function migrate() {
  const sql = readFileSync(fileURLToPath(new URL('./schema.sql', import.meta.url)), 'utf-8');
  await query(sql);
}

const runningDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (runningDirectly) {
  if (!isDbConfigured()) {
    console.error('DATABASE_URL is not set. Add it to .env, then run this again.');
    process.exit(1);
  }
  try {
    await migrate();
    const { rows } = await query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log('Schema applied. Tables:', rows.map((r) => r.table_name).join(', '));
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}
