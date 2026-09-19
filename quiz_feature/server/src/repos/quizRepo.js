import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const defaultFile = fileURLToPath(new URL('../../data/questions.json', import.meta.url));

export function createQuizRepo(file = defaultFile) {
  const questions = JSON.parse(fs.readFileSync(file, 'utf8'));
  const byId = new Map(questions.map((q) => [q.id, q]));
  return { all: () => questions, byId: (id) => byId.get(id) ?? null };
}
