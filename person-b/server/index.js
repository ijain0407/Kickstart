import express from "express";
import cors from "cors";
import { lessonsRouter } from "./routes/lessons.js";
import { pathLessonsRouter } from "./routes/pathLessons.js";
import { formationsRouter } from "./routes/formations.js";
import { glossaryRouter } from "./routes/glossary.js";

const app = express();
// 4010, not 4000: Person D's quiz/progress API also defaults to 4000 and their
// frontend proxy hardcodes that port, so this API uses a different default to
// avoid a collision when both run at once.
const PORT = process.env.PORT || 4010;

// Wide-open CORS for the hackathon demo — any frontend origin can call this API.
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/lessons", lessonsRouter);
app.use("/path-lessons", pathLessonsRouter);
app.use("/formations", formationsRouter);
app.use("/glossary", glossaryRouter);

app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `No route for ${req.method} ${req.path}` } });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
});

app.listen(PORT, () => {
  console.log(`Soccer Learn API listening on http://localhost:${PORT}`);
});
