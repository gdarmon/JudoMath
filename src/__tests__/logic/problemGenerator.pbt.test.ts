import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateSession } from '../../logic/problemGenerator';

describe('Feature: judo-math-game, Property 1: Problem generation invariants', () => {
  /**
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
   *
   * For any generated session, every MathProblem must have:
   * - operator is '+' or '-'
   * - operands are integers in [0, 20]
   * - correctAnswer is an integer in [0, 20]
   */
  it('every problem in a generated session has valid operator, operands in [0,20], and correctAnswer in [0,20]', () => {
    fc.assert(
      fc.property(
        fc.record({
          count: fc.integer({ min: 1, max: 50 }),
          maxOperand: fc.constant(20),
          maxResult: fc.constant(20),
        }),
        (config) => {
          const problems = generateSession(config);

          for (const problem of problems) {
            // Requirement 1.1: operator is '+' or '-'
            expect(problem.operator === '+' || problem.operator === '-').toBe(true);

            // Requirement 1.2: operands are whole numbers in [0, 20]
            expect(Number.isInteger(problem.operand1)).toBe(true);
            expect(problem.operand1).toBeGreaterThanOrEqual(0);
            expect(problem.operand1).toBeLessThanOrEqual(20);

            expect(Number.isInteger(problem.operand2)).toBe(true);
            expect(problem.operand2).toBeGreaterThanOrEqual(0);
            expect(problem.operand2).toBeLessThanOrEqual(20);

            // Requirement 1.3 & 1.4: correctAnswer is a whole number in [0, 20]
            expect(Number.isInteger(problem.correctAnswer)).toBe(true);
            expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
            expect(problem.correctAnswer).toBeLessThanOrEqual(20);

            // Verify the answer is actually correct for the given operation
            if (problem.operator === '+') {
              expect(problem.correctAnswer).toBe(problem.operand1 + problem.operand2);
            } else {
              expect(problem.correctAnswer).toBe(problem.operand1 - problem.operand2);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
