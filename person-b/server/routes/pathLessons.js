import { Router } from "express";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { localize, isSupportedLang } from "../lib/localize.js";

/**
 * PATH LESSONS — the teaching body behind each node of the learning path.
 *
 * `/lessons` serves the reference articles: one prose record per topic, keyed
 * by canonical lesson id. This serves the *player*: six ordered nodes, each
 * three teaching steps and a comprehension check, each step carrying an
 * interactive scene the client knows how to draw.
 *
 * Several path nodes map onto the same canonical lesson (1.1, 1.2 and 1.6 are
 * all `lesson-rules-basics`), which is why this is its own collection rather
 * than a field on `/lessons` — see shared/lessons.js for the id scheme.
 *
 * Scene kinds the client renders:
 *   states    N named states on a pitch, driven by a slider or a chip row
 *   hotspots  tappable labelled regions over a pitch or a stadium bowl
 *   squad     tappable groups of shirt numbers
 *   layers    a stack of text layers revealed one at a time
 */

const dataPath = fileURLToPath(new URL("../data/path-lessons.json", import.meta.url));

async function loadPathLessons() {
  const raw = await readFile(dataPath, "utf-8");
  return JSON.parse(raw);
}

/** The path list only needs the node metadata — not 18 scenes' worth of steps. */
function toSummary(lesson) {
  const summary = { ...lesson, stepCount: lesson.steps.length };
  delete summary.steps;
  delete summary.check;
  return summary;
}

function rejectBadLang(req, res) {
  const { lang } = req.query;
  if (lang && !isSupportedLang(lang)) {
    res
      .status(400)
      .json({ error: { code: "BAD_REQUEST", message: `Unsupported lang '${lang}'` } });
    return true;
  }
  return false;
}

export const pathLessonsRouter = Router();

pathLessonsRouter.get("/", async (req, res, next) => {
  try {
    if (rejectBadLang(req, res)) return;

    const { category, full } = req.query;

    let lessons = await loadPathLessons();
    if (category) {
      lessons = lessons.filter((lesson) => lesson.category === category);
    }

    // `?full=1` returns every step and check in one request, which is what the
    // learning path prefetches so opening a lesson is instant.
    const data = full === "1" || full === "true" ? lessons : lessons.map(toSummary);

    res.json({ data: localize(data, req.query.lang) });
  } catch (err) {
    next(err);
  }
});

pathLessonsRouter.get("/:id", async (req, res, next) => {
  try {
    if (rejectBadLang(req, res)) return;

    const lessons = await loadPathLessons();
    const lesson = lessons.find((item) => item.id === req.params.id);

    if (!lesson) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: `No path lesson with id '${req.params.id}'` },
      });
    }

    res.json({ data: localize(lesson, req.query.lang) });
  } catch (err) {
    next(err);
  }
});
