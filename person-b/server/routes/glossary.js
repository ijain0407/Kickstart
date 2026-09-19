import { Router } from "express";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { localize, isSupportedLang } from "../lib/localize.js";

const dataPath = fileURLToPath(new URL("../data/glossary.json", import.meta.url));

async function loadGlossary() {
  const raw = await readFile(dataPath, "utf-8");
  return JSON.parse(raw);
}

function matchesSearch(term, query) {
  const needle = query.toLowerCase();
  return (
    term.term.en.toLowerCase().includes(needle) ||
    (term.term.es && term.term.es.toLowerCase().includes(needle))
  );
}

export const glossaryRouter = Router();

glossaryRouter.get("/", async (req, res, next) => {
  try {
    const { search, lang } = req.query;

    if (lang && !isSupportedLang(lang)) {
      return res
        .status(400)
        .json({ error: { code: "BAD_REQUEST", message: `Unsupported lang '${lang}'` } });
    }

    let terms = await loadGlossary();
    if (search) {
      terms = terms.filter((term) => matchesSearch(term, search));
    }

    res.json({ data: localize(terms, lang) });
  } catch (err) {
    next(err);
  }
});

glossaryRouter.get("/:id", async (req, res, next) => {
  try {
    const { lang } = req.query;

    if (lang && !isSupportedLang(lang)) {
      return res
        .status(400)
        .json({ error: { code: "BAD_REQUEST", message: `Unsupported lang '${lang}'` } });
    }

    const terms = await loadGlossary();
    const term = terms.find((item) => item.id === req.params.id);

    if (!term) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: `No glossary term with id '${req.params.id}'` },
      });
    }

    res.json({ data: localize(term, lang) });
  } catch (err) {
    next(err);
  }
});
