import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateSession } from '../../logic/problemGenerator';

/**
 * Property-based tests for the Math Problem Generator
 * Feature: judo-math-game
 */

describe('Feature: judo-math-game, Property 5: Session contains exactly 10 problems', () => {
  /**
   * **Validates: Requirements 6.1**
   *
   * For any call to generateSession with default config (count=10),
   * the returned array must contain exactly 10 problems.
   * Additionally, for any arbitrary count, the session has exactly that many problems.
   */

  it('generateSession with default config always returns exactly 10 problems', () => {
    fc.assert(
      fc.property(fc.constant(undefined), () => {
        const session = generateSession();
        expect(session).toHaveLength(10);
      }),
      { numRuns: 100 }
    );
  });

  it('generateSession with explicit count=10 always returns exactly 10 problems', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const session = generateSession({ count: 10 });
        expect(session).toHaveLength(10);
      }),
      { numRuns: 100 }
    );
  });

  it('generateSession returns exactly the specified number of problems for any valid count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (count) => {
          const session = generateSession({ count });
          expect(session).toHaveLength(count);
        }
      ),
      { numRuns: 100 }
    );
  });
});
