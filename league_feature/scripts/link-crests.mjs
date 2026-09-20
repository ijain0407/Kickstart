/**
 * Points each culture card at its crest image, for the files that are actually
 * present in frontend/public/crests/.
 *
 * Drop your licensed files in that folder named after the card id — for
 * example `culture-juventus.svg` — and run `npm run crests`. Cards without a
 * matching file keep `crestUrl: null` and fall back to the kit motif, so the
 * app never requests an image that isn't there.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../../', import.meta.url);
const cardsPath = fileURLToPath(new URL('league_feature/server/data/culture.json', root));
const crestsDir = fileURLToPath(new URL('frontend/public/crests/', root));

const IMAGE = /\.(svg|png|webp|jpg|jpeg|avif)$/i;

let files = [];
try {
  files = readdirSync(crestsDir).filter((f) => IMAGE.test(f));
} catch {
  console.error(`No crest folder yet — create ${crestsDir} and add your files.`);
  process.exit(1);
}

const byId = new Map(files.map((f) => [f.replace(IMAGE, ''), f]));
const cards = JSON.parse(readFileSync(cardsPath, 'utf-8'));

const linked = [];
const cleared = [];

for (const card of cards) {
  const file = byId.get(card.id);
  const next = file ? `/crests/${file}` : null;
  if (card.crestUrl !== next) (next ? linked : cleared).push(card.id);
  card.crestUrl = next;
}

writeFileSync(cardsPath, `${JSON.stringify(cards, null, 2)}\n`, 'utf-8');

console.log(`${cards.filter((c) => c.crestUrl).length} of ${cards.length} cards have a crest.`);
if (linked.length) console.log('  linked: ', linked.join(', '));
if (cleared.length) console.log('  cleared:', cleared.join(', '));

const missing = cards.filter((c) => !c.crestUrl).map((c) => c.id);
if (missing.length) console.log('  still using the kit motif:', missing.join(', '));

const unused = [...byId.keys()].filter((id) => !cards.some((c) => c.id === id));
if (unused.length) console.log(`  unmatched files (rename to a card id): ${unused.join(', ')}`);
