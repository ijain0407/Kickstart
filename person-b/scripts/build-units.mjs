/**
 * Regenerates the unit 2+ nodes in server/data/path-lessons.json from the
 * frontend's data/units.js, so the API and the offline fallback teach the
 * same lessons. Unit 1 nodes (ids starting "1.") are left untouched.
 *
 *   node person-b/scripts/build-units.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const jsonPath = fileURLToPath(new URL("../server/data/path-lessons.json", import.meta.url));
const unitsPath = fileURLToPath(new URL("../../frontend/src/data/units.js", import.meta.url));

const { UNIT_LESSONS } = await import(pathToFileURL(unitsPath).href);
const existing = JSON.parse(await readFile(jsonPath, "utf-8"));
const unitOne = existing.filter((lesson) => lesson.id.startsWith("1."));

const generated = UNIT_LESSONS.map((lesson, i) => ({
  id: lesson.id,
  order: unitOne.length + i + 1,
  unit: Number(lesson.id.split(".")[0]),
  lessonId: lesson.lessonId,
  quizSlug: lesson.quizSlug,
  category: lesson.category,
  align: lesson.align,
  icon: lesson.icon,
  xp: lesson.xp,
  minutes: lesson.minutes,
  glossaryIds: lesson.glossaryIds,
  title: lesson.title,
  detailTitle: lesson.detailTitle,
  summary: lesson.desc,
  bounty: lesson.bounty,
  unlocks: lesson.unlocks,
  steps: lesson.steps.map((step, s) => ({ id: `${lesson.id}-s${s + 1}`, ...step, scene: null })),
  check: lesson.check,
}));

const all = [...unitOne.map((l) => ({ unit: 1, ...l })), ...generated];
await writeFile(jsonPath, JSON.stringify(all, null, 2) + "\n");
console.log(`wrote ${all.length} path lessons (${generated.length} generated)`);
