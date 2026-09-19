export function createAttemptRepo(store) {
  return {
    get: (id) => store.get(id),
    save: (attempt) => store.set(attempt.id, attempt),
  };
}
