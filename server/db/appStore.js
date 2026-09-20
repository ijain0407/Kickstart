import { query } from './pool.js';

/* ============================================================
   POSTGRES-BACKED KEY/VALUE STORE

   Person D's repositories call a synchronous store: get(key),
   set(key, value), clear(). Postgres is asynchronous, so rather
   than rewriting their repos, services and tests, this store
   keeps the same shape:

     - every row in the namespace is loaded once at startup
     - reads are served from that cache, synchronously
     - writes update the cache immediately and are queued to
       Postgres in order, so a crash loses at most the last
       in-flight write rather than the whole file

   Durable across restarts and shared with anything else reading
   the table, which is what the JSON file could never do. It does
   assume a single server process: two instances would each hold
   their own cache. Scaling past one means making those repos
   async, and this is the seam where that happens.
   ============================================================ */

export async function createPgStore(namespace) {
  const cache = new Map();

  const { rows } = await query('SELECT key, value FROM app_store WHERE namespace = $1', [namespace]);
  for (const row of rows) cache.set(row.key, row.value);

  // Writes are chained so they reach Postgres in the order they were made.
  let queue = Promise.resolve();
  let pending = 0;

  const enqueue = (work) => {
    pending += 1;
    queue = queue
      .then(work)
      .catch((err) => console.error(`[db] ${namespace} write failed:`, err.message))
      .finally(() => {
        pending -= 1;
      });
    return queue;
  };

  return {
    get: (key) => structuredClone(cache.get(key) ?? null),

    set: (key, value) => {
      const stored = structuredClone(value);
      cache.set(key, stored);
      enqueue(() =>
        query(
          `INSERT INTO app_store (namespace, key, value, updated_at)
           VALUES ($1, $2, $3, now())
           ON CONFLICT (namespace, key)
           DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
          [namespace, key, JSON.stringify(stored)],
        ),
      );
    },

    clear: () => {
      cache.clear();
      enqueue(() => query('DELETE FROM app_store WHERE namespace = $1', [namespace]));
    },

    /** Waits for queued writes — used by tests and graceful shutdown. */
    flush: () => queue,
    pendingWrites: () => pending,
    size: () => cache.size,
  };
}
