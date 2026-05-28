import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { evaluateProgression } from '../../logic/beltProgression';
import { Belt } from '../../types';
import type { PlayerProgress, SessionResult } from '../../types';

describe('Feature: judo-math-game, Property 3: Stripe award threshold', () => {
  /**
   * **Validates: Requirements 3.3, 3.4**
   *
   * For any valid PlayerProgress and SessionResult, a stripe is awarded
   * if and only if the session score is 75% or higher.
   * When score < 75%, the player's progress (belt and stripes) must remain unchanged.
   */

  // Generator for a valid Belt value (0-6)
  const beltArb = fc.integer({ min: 0, max: 6 }) as fc.Arbitrary<Belt>;

  // Generator for valid PlayerProgress
  const playerProgressArb = fc.record({
    currentBelt: beltArb,
    currentStripes: fc.integer({ min: 0, max: 2 }),
    totalSessions: fc.integer({ min: 0, max: 1000 }),
    totalCorrect: fc.integer({ min: 0, max: 10000 }),
    totalProblems: fc.integer({ min: 1, max: 10000 }),
  }) as fc.Arbitrary<PlayerProgress>;

  it('stripe is awarded if and only if score >= 75 (with special case: Black belt with 2 stripes)', () => {
    fc.assert(
      fc.property(
        playerProgressArb,
        fc.integer({ min: 0, max: 100 }),
        (progress, score) => {
          const sessionResult: SessionResult = {
            correctCount: score,
            totalCount: 100,
            score,
          };

          const result = evaluateProgression(progress, sessionResult);

          if (score >= 75) {
            // Special case: Black belt with max stripes won't award
            if (progress.currentBelt === Belt.Black && progress.currentStripes >= 2) {
              expect(result.stripeAwarded).toBe(false);
            } else {
              expect(result.stripeAwarded).toBe(true);
            }
          } else {
            // Score < 75: no stripe awarded
            expect(result.stripeAwarded).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when score < 75, belt and stripes remain unchanged', () => {
    fc.assert(
      fc.property(
        playerProgressArb,
        fc.integer({ min: 0, max: 74 }),
        (progress, score) => {
          const sessionResult: SessionResult = {
            correctCount: score,
            totalCount: 100,
            score,
          };

          const result = evaluateProgression(progress, sessionResult);

          // Belt and stripes must remain unchanged
          expect(result.newProgress.currentBelt).toBe(progress.currentBelt);
          expect(result.newProgress.currentStripes).toBe(progress.currentStripes);
          expect(result.stripeAwarded).toBe(false);
          expect(result.beltPromotion).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: judo-math-game, Property 4: Belt promotion mechanics', () => {
  /**
   * **Validates: Requirements 3.5, 3.6**
   *
   * For any PlayerProgress where currentStripes equals 2 and the player is not
   * already at Black belt, if a stripe is awarded (score >= 75%), the player's
   * belt must advance to the next color in the sequence and the stripe count
   * must reset to 0.
   */
  it('when stripes=2 and score>=75% and belt is not Black, belt advances and stripes reset to 0', () => {
    fc.assert(
      fc.property(
        // Generate a random belt value from 0-5 (not Black=6)
        fc.integer({ min: 0, max: 5 }),
        // Generate a score >= 75 (up to 100)
        fc.integer({ min: 75, max: 100 }),
        // Generate random session totals for realistic PlayerProgress
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        (beltValue, score, totalSessions, totalCorrect, totalProblems) => {
          const currentProgress: PlayerProgress = {
            currentBelt: beltValue as Belt,
            currentStripes: 2,
            totalSessions,
            totalCorrect,
            totalProblems,
          };

          const sessionResult: SessionResult = {
            correctCount: score,
            totalCount: 100,
            score,
          };

          const result = evaluateProgression(currentProgress, sessionResult);

          // Belt must advance to the next color
          expect(result.beltPromotion).toBe(true);
          expect(result.newBelt).toBe(beltValue + 1);
          expect(result.newProgress.currentBelt).toBe(beltValue + 1);

          // Stripes must reset to 0
          expect(result.newProgress.currentStripes).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
