import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api.js';

export const progressKey = ['progress'];

/** Fetches and caches the user's progress. Call `refresh()` after anything that awards XP. */
export function useProgress() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: progressKey, queryFn: () => api('/progress'), staleTime: 30_000 });
  return { ...query, refresh: () => client.invalidateQueries({ queryKey: progressKey }) };
}
