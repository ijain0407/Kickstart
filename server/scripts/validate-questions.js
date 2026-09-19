import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { allQuestionLessonIds } from '../src/config/lessonIds.js';

const LOCALES = ['en', 'es'];
const file = process.argv[2] ?? fileURLToPath(new URL('../data/questions.json', import.meta.url));

export function validateQuestions(questions) {
  const errors = [];
  const ids = new Set();
  const checkText = (obj, where) => {
    for (const l of LOCALES) {
      if (typeof obj?.[l] !== 'string' || !obj[l].trim()) errors.push(`${where}: missing or empty "${l}"`);
    }
  };
  for (const q of questions) {
    const where = q.id ?? '(no id)';
    if (!q.id) errors.push('question without id');
    else if (ids.has(q.id)) errors.push(`${where}: duplicate id`);
    else ids.add(q.id);
    if (!allQuestionLessonIds.includes(q.lessonId)) errors.push(`${where}: unknown lessonId "${q.lessonId}"`);
    if (![1, 2, 3].includes(q.difficulty)) errors.push(`${where}: difficulty must be 1-3`);
    checkText(q.prompt, `${where}.prompt`);
    checkText(q.explanation, `${where}.explanation`);
    checkText(q.hint, `${where}.hint`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${where}: needs at least 2 options`);
    else {
      const optionIds = q.options.map((o) => o.id);
      if (new Set(optionIds).size !== optionIds.length) errors.push(`${where}: duplicate option ids`);
      q.options.forEach((o) => checkText(o.text, `${where}.option.${o.id}`));
      const correct = optionIds.filter((id) => id === q.correctOptionId);
      if (correct.length !== 1) errors.push(`${where}: correctOptionId must match exactly one option`);
    }
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const questions = JSON.parse(fs.readFileSync(file, 'utf8'));
  const errors = validateQuestions(questions);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(`OK: ${questions.length} questions validated (${LOCALES.join(', ')})`);
}
