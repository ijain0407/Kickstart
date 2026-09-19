import { useMutation, useQuery } from '@tanstack/react-query';
import { api, currentLocale } from '../../lib/api.js';

// The server localizes responses, so the locale belongs in every query key:
// switching language refetches instead of showing stale English.
const key = (...parts) => ['leagues', currentLocale(), ...parts];

export function useLeagues() {
  return useQuery({ queryKey: key('list'), queryFn: () => api('/leagues') });
}

export function useLeague(leagueId) {
  return useQuery({ queryKey: key('league', leagueId), queryFn: () => api(`/leagues/${leagueId}`), enabled: Boolean(leagueId) });
}

export function useCultureCard(cultureId) {
  return useQuery({ queryKey: key('culture', cultureId), queryFn: () => api(`/culture/${cultureId}`), enabled: Boolean(cultureId) });
}

export function useLeagueQuiz() {
  return useQuery({ queryKey: key('quiz'), queryFn: () => api('/league-quiz') });
}

export function useRecommendation() {
  return useMutation({ mutationFn: (answers) => api('/league-quiz/recommend', { method: 'POST', body: { answers } }) });
}
