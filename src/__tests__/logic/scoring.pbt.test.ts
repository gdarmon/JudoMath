import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateScore } from '../../logic/scoring';

describe('Feature: judo-math-game, Property 2: Score calculation correctness', () => {
  /**
   * **Validates: Requirements 6.2**
   *
   * For any correctCount ≤ totalCount where totalCount > 0,
   * calculateScore(correctCount, totalCount) must equal
   * Math.round(correctCount / totalCount * 100).
   */
  it('calculateScore returns Math.round(correctCount / totalCount * 100) for all valid inputs', () => {
    fc.assert(
      fc.property(
        fc
          .integer({ min: 1, max: 1000 })
          .chain((totalCount) =>
            fc.integer({ min: 0, max: totalCount }).map((correctCount) => ({
              correctCount,
              totalCount,
            }))
          ),
        ({ correctCount, totalCount }) => {
          const result = calculateScore(correctCount, totalCount);
          const expected = Math.round((correctCount / totalCount) * 100);
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});
