import { describe, it, expect } from 'vitest';
import { getLeaderboard } from '../../logic/leaderboard';
import type { LeaderboardEntry } from '../../types';

function makeEntry(
  playerId: string,
  totalScore: number,
  totalTime: number
): LeaderboardEntry {
  return {
    playerId,
    playerName: `Player ${playerId}`,
    totalScore,
    totalTime,
    date: '2024-01-01',
  };
}

describe('getLeaderboard', () => {
  it('returns entries sorted by totalScore descending', () => {
    const entries = [
      makeEntry('1', 50, 1000),
      makeEntry('2', 90, 1000),
      makeEntry('3', 70, 1000),
    ];

    const result = getLeaderboard(entries);

    expect(result[0].totalScore).toBe(90);
    expect(result[1].totalScore).toBe(70);
    expect(result[2].totalScore).toBe(50);
  });

  it('breaks ties by lowest totalTime (ascending)', () => {
    const entries = [
      makeEntry('1', 80, 5000),
      makeEntry('2', 80, 3000),
      makeEntry('3', 80, 4000),
    ];

    const result = getLeaderboard(entries);

    expect(result[0].playerId).toBe('2'); // 3000ms
    expect(result[1].playerId).toBe('3'); // 4000ms
    expect(result[2].playerId).toBe('1'); // 5000ms
  });

  it('limits results to 10 entries by default', () => {
    const entries = Array.from({ length: 15 }, (_, i) =>
      makeEntry(String(i), 100 - i, 1000)
    );

    const result = getLeaderboard(entries);

    expect(result).toHaveLength(10);
  });

  it('limits results to custom limit', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry(String(i), 100 - i, 1000)
    );

    const result = getLeaderboard(entries, 5);

    expect(result).toHaveLength(5);
    expect(result[0].totalScore).toBe(100);
    expect(result[4].totalScore).toBe(96);
  });

  it('returns all entries when fewer than limit', () => {
    const entries = [makeEntry('1', 90, 1000), makeEntry('2', 80, 2000)];

    const result = getLeaderboard(entries, 10);

    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    const result = getLeaderboard([]);

    expect(result).toHaveLength(0);
  });

  it('does not mutate the original array', () => {
    const entries = [
      makeEntry('1', 50, 1000),
      makeEntry('2', 90, 1000),
    ];
    const originalFirst = entries[0];

    getLeaderboard(entries);

    expect(entries[0]).toBe(originalFirst);
  });
});
