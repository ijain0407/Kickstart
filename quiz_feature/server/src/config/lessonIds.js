// Derived from the cross-team map in shared/lessons.js, which also records
// Person B's canonical lesson ids and Person A's path nodes for each slug.
// The slugs below are unchanged — this file just no longer owns them alone.
import { CULTURE_QUIZ_SLUG, quizSlugs } from '../../../../shared/lessons.js';

export const lessonIds = quizSlugs;
// Culture/league questions live outside the five lessons; they only appear in quick quizzes.
export const cultureLessonId = CULTURE_QUIZ_SLUG;
export const allQuestionLessonIds = [...lessonIds, cultureLessonId];
