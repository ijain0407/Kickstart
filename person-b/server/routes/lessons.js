import { Router } from "express";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { localize, isSupportedLang } from "../lib/localize.js";

const dataPath = fileURLToPath(new URL("../data/lessons.json", import.meta.url));

async function loadLessons() {
  const raw = await readFile(dataPath, "utf-8");
  return JSON.parse(raw);
}

export const lessonsRouter = Router();

lessonsRouter.get("/", async (req, res, next) => {
  try {
    const { category, lang } = req.query;

    if (lang && !isSupportedLang(lang)) {
      return res
        .status(400)
        .json({ error: { code: "BAD_REQUEST", message: `Unsupported lang '${lang}'` } });
    }

    let lessons = await loadLessons();
    if (category) {
      lessons = lessons.filter((lesson) => lesson.category === category);
    }

    res.json({ data: localize(lessons, lang) });
  } catch (err) {
    next(err);
  }
});

lessonsRouter.get("/:id", async (req, res, next) => {
  try {
    const { lang } = req.query;

    if (lang && !isSupportedLang(lang)) {
      return res
        .status(400)
        .json({ error: { code: "BAD_REQUEST", message: `Unsupported lang '${lang}'` } });
    }

    const lessons = await loadLessons();
    const lesson = lessons.find((item) => item.id === req.params.id);

    if (!lesson) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: `No lesson with id '${req.params.id}'` },
      });
    }

    res.json({ data: localize(lesson, lang) });
  } catch (err) {
    next(err);
  }
});
