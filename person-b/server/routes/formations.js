import { Router } from "express";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { localize, isSupportedLang } from "../lib/localize.js";

const dataPath = fileURLToPath(new URL("../data/formations.json", import.meta.url));

async function loadFormations() {
  const raw = await readFile(dataPath, "utf-8");
  return JSON.parse(raw);
}

export const formationsRouter = Router();

formationsRouter.get("/", async (req, res, next) => {
  try {
    const { lang } = req.query;

    if (lang && !isSupportedLang(lang)) {
      return res
        .status(400)
        .json({ error: { code: "BAD_REQUEST", message: `Unsupported lang '${lang}'` } });
    }

    const formations = await loadFormations();
    res.json({ data: localize(formations, lang) });
  } catch (err) {
    next(err);
  }
});

formationsRouter.get("/:id", async (req, res, next) => {
  try {
    const { lang } = req.query;

    if (lang && !isSupportedLang(lang)) {
      return res
        .status(400)
        .json({ error: { code: "BAD_REQUEST", message: `Unsupported lang '${lang}'` } });
    }

    const formations = await loadFormations();
    const formation = formations.find((item) => item.id === req.params.id);

    if (!formation) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: `No formation with id '${req.params.id}'` },
      });
    }

    res.json({ data: localize(formation, lang) });
  } catch (err) {
    next(err);
  }
});
