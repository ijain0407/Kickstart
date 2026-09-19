import fs from 'node:fs';
import path from 'node:path';

/** Tiny key/value JSON store. Pass `file = null` for an in-memory store (tests). Swap for a real DB later. */
export function createJsonStore(file = null) {
  let data = null;
  const load = () => {
    if (data) return data;
    data = {};
    if (file && fs.existsSync(file)) {
      try {
        data = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch {
        data = {};
      }
    }
    return data;
  };
  const flush = () => {
    if (!file) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
  };
  return {
    get: (key) => structuredClone(load()[key] ?? null),
    set: (key, value) => {
      load()[key] = structuredClone(value);
      flush();
    },
    clear: () => {
      data = {};
      flush();
    },
  };
}
