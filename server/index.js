import { fileURLToPath } from 'node:url';
import { createGateway } from './gateway.js';

const port = Number(process.env.PORT ?? 4000);
const quizDataDir = process.env.QUIZ_DATA_DIR ?? fileURLToPath(new URL('../quiz_feature/server/data', import.meta.url));

createGateway({ quizDataDir }).listen(port, () => {
  console.log(`Kickstart API listening on http://localhost:${port}`);
  console.log('  lessons/formations/glossary · leagues/culture/league-quiz · quiz/progress/explain');
});
