import type { LeaderboardEntry } from '../types';

/**
 * Returns the top leaderboard entries sorted by totalScore descending,
 * with ties broken by lowest totalTime (ascending).
 *
 * @param entries - Array of leaderboard entries to sort and filter
 * @param limit - Maximum number of entries to return (default: 10)
 * @returns Sorted and limited leaderboard entries
 */
export function getLeaderboard(
  entries: LeaderboardEntry[],
  limit: number = 10
): LeaderboardEntry[] {
  return [...entries]
    .sort((a, b) => {
      // Sort by totalScore descending
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      // Break ties by lowest totalTime (ascending)
      return a.totalTime - b.totalTime;
    })
    .slice(0, limit);
}
