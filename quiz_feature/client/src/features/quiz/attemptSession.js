// Persists just enough to resume an in-progress attempt after a reload. The server holds the answers.
const KEY = 'kickstart.quiz.active';

export function saveActiveAttempt(value) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable: reload simply starts a new attempt */
  }
}

export function loadActiveAttempt(mode, lesson) {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(KEY));
    if (v && v.mode === mode && (v.lesson ?? null) === (lesson ?? null) && v.attemptId) return v.attemptId;
  } catch {
    /* ignore */
  }
  return null;
}

export function clearActiveAttempt() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
