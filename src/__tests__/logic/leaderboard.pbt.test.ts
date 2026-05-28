import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getLeaderboard } from '../../logic/leaderboard';
import type { LeaderboardEntry } from '../../types';

/**
 * Arbitrary for generating a random LeaderboardEntry.
 */
const leaderboardEntryArb: fc.Arbitrary<LeaderboardEntry> = fc.record({
  playerId: fc.string({ minLength: 1, maxLength: 10 }),
  playerName: fc.string({ minLength: 1, maxLength: 20 }),
  totalScore: fc.integer({ min: 0, max: 300 }),
  totalTime: fc.integer({ min: 1000, max: 600000 }),
  // Use a stable timestamp range to avoid fc.date edge values that fail toISOString().
  date: fc
    .integer({ min: 1577836800000, max: 1767139200000 }) // 2020-01-01 .. 2025-12-31
    .map((ms) => new Date(ms).toISOString().split('T')[0]),
});

describe('Feature: judo-math-game, Property 8: Leaderboard ordering and size', () => {
  /**
   * **Validates: Requirements 7.6**
   *
   * For any set of leaderboard entries (size 0-20), getLeaderboard(entries, 10)
   * must return at most 10 entries sorted by totalScore descending,
   * with ties broken by lowest totalTime (ascending).
   */
  it('getLeaderboard(entries, 10) returns at most 10 entries sorted by totalScore desc, ties by lowest totalTime', () => {
    fc.assert(
      fc.property(
        fc.array(leaderboardEntryArb, { minLength: 0, maxLength: 20 }),
        (entries) => {
          const result = getLeaderboard(entries, 10);

          // Assert: result length is at most 10
          expect(result.length).toBeLessThanOrEqual(10);

          // Assert: result length is at most the input length
          expect(result.length).toBeLessThanOrEqual(entries.length);

          // Assert: result is sorted by totalScore descending
          for (let i = 1; i < result.length; i++) {
            expect(result[i - 1].totalScore).toBeGreaterThanOrEqual(result[i].totalScore);
          }

          // Assert: for entries with equal totalScore, sorted by totalTime ascending
          for (let i = 1; i < result.length; i++) {
            if (result[i - 1].totalScore === result[i].totalScore) {
              expect(result[i - 1].totalTime).toBeLessThanOrEqual(result[i].totalTime);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
