/* ============================================================
   LESSON IDS — the cross-team source of truth.

   Three workstreams name the same lessons differently:

     lessonId   Person B's content API, the canonical id  (lesson-rules-basics)
     quizSlug   Person D's quiz/progress API              (rules-basics)
     pathIds    Person A's nodes on the learning path     (1.1, 1.2, …)

   Rather than let three lists drift apart silently, every side reads this
   file: Person D's config derives its slugs from it, and the frontend maps
   path nodes through it. `npm run smoke` checks the ids still resolve
   against the live APIs.
   ============================================================ */

export const LESSONS = [
  {
    lessonId: 'lesson-rules-basics',
    quizSlug: 'rules-basics',
    // 1.1 the pitch and basics, 1.2 offside, 1.6 VAR and the referee.
    pathIds: ['1.1', '1.2', '1.6', '2.3'],
  },
  {
    lessonId: 'lesson-positions-overview',
    quizSlug: 'positions',
    pathIds: ['1.3', '2.2', '2.4'],
  },
  {
    lessonId: 'lesson-formations-overview',
    quizSlug: 'formations',
    pathIds: ['1.4', '2.1'],
  },
  {
    lessonId: 'lesson-how-to-watch',
    quizSlug: 'how-to-watch',
    // 1.5 culture and chants — the closest fit until it has its own lesson.
    pathIds: ['1.5', '3.1', '3.2', '3.3', '3.4'],
  },
  {
    // Person D has questions for this; Person B hasn't written the lesson yet,
    // so there's no canonical lesson id to point at. The glossary covers it.
    lessonId: null,
    quizSlug: 'terms-slang',
    pathIds: [],
  },
];

/** Quiz questions about leagues and culture sit outside the lesson list. */
export const CULTURE_QUIZ_SLUG = 'leagues-culture';

export const quizSlugs = LESSONS.map((l) => l.quizSlug);
export const canonicalLessonIds = LESSONS.map((l) => l.lessonId).filter(Boolean);

const byPathId = new Map(LESSONS.flatMap((l) => l.pathIds.map((id) => [id, l])));

/** A node on Person A's path -> the slug Person D's progress API expects. */
export const quizSlugForPathId = (pathId) => byPathId.get(pathId)?.quizSlug ?? null;

/** A node on Person A's path -> Person B's canonical lesson id. */
export const lessonIdForPathId = (pathId) => byPathId.get(pathId)?.lessonId ?? null;

export const lessonIdForQuizSlug = (slug) => LESSONS.find((l) => l.quizSlug === slug)?.lessonId ?? null;
