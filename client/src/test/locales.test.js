import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../locales');
const namespaces = fs.readdirSync(path.join(root, 'en')).filter((f) => f.endsWith('.json'));

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]],
  );
}
const load = (lng, file) => Object.fromEntries(flatten(JSON.parse(fs.readFileSync(path.join(root, lng, file), 'utf8'))));

describe('locale parity', () => {
  it('has the same namespaces in en and es', () => {
    expect(fs.readdirSync(path.join(root, 'es')).sort()).toEqual(fs.readdirSync(path.join(root, 'en')).sort());
  });

  it.each(namespaces)('%s: every en key exists in es (and vice versa) with no empty values', (file) => {
    const en = load('en', file);
    const es = load('es', file);
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    for (const [key, value] of [...Object.entries(en), ...Object.entries(es)]) {
      expect(String(value).trim(), key).not.toBe('');
    }
  });

  it.each(namespaces)('%s: es keeps the same {{placeholders}} as en', (file) => {
    const en = load('en', file);
    const es = load('es', file);
    const vars = (s) => (String(s).match(/{{\s*\w+\s*}}/g) ?? []).sort();
    for (const key of Object.keys(en)) expect(vars(es[key]), key).toEqual(vars(en[key]));
  });
});
