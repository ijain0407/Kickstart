import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const dataDir = process.env.DATA_DIR ?? fileURLToPath(new URL('../data', import.meta.url));
const port = Number(process.env.PORT ?? 4000);

createApp({ dataDir }).listen(port, () => {
  console.log(`Quiz/progress API listening on http://localhost:${port}`);
});
