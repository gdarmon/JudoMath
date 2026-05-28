import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  startTournament,
  completeSession,
  calculateTournamentResult,
} from '../../logic/tournament';
import type { MathProblem, TournamentSession } from '../../types';

/**
 * Helper to create a MathProblem with a known correct answer.
 */
function makeProblem(operand1: number, operand2: number, operator: '+' | '-'): MathProblem {
  const correctAnswer = operator === '+' ? operand1 + operand2 : operand1 - operand2;
  return {
    id: `${operand1}${operator}${operand2}`,
    operand1,
    operand2,
    operator,
    correctAnswer,
  };
}

/**
 * Helper to build a TournamentSession with a specified number of correct answers.
 * The first `correctCount` answers match the problem's correctAnswer;
 * the remaining answers are incorrect.
 */
function makeSession(correctCount: number, totalCount: number = 10): TournamentSession {
  const problems: MathProblem[] = [];
  const answers: number[] = [];
  const timePerProblem: number[] = [];

  for (let i = 0; i < totalCount; i++) {
    const problem = makeProblem(5, 3, '+'); // 5+3=8
    problems.push(problem);
    // First `correctCount` answers are correct (8), rest are wrong (99)
    answers.push(i < correctCount ? problem.correctAnswer : 99);
    timePerProblem.push(2000);
  }

  const score = Math.round((correctCount / totalCount) * 100);
  return { problems, answers, score, timePerProblem };
}

describe('Feature: judo-math-game, Property 7: Tournament score aggregation', () => {
  /**
   * **Validates: Requirements 7.4**
   *
   * For any completed tournament with 3 session results,
   * the total tournament score must equal the total correct answers
   * across all sessions divided by the total problems across all sessions,
   * expressed as a percentage (rounded).
   */
  it('totalScore equals Math.round(totalCorrectAcrossAllSessions / 30 * 100)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 10 }),
        (correct1, correct2, correct3) => {
          // Build a tournament with 3 sessions of 10 problems each
          let state = startTournament();
          state = completeSession(state, makeSession(correct1));
          state = completeSession(state, makeSession(correct2));
          state = completeSession(state, makeSession(correct3));

          const result = calculateTournamentResult(state);

          // Total correct across all sessions / total problems (30) as percentage
          const totalCorrect = correct1 + correct2 + correct3;
          const expectedScore = Math.round((totalCorrect / 30) * 100);

          expect(result.totalScore).toBe(expectedScore);
        }
      ),
      { numRuns: 100 }
    );
  });
});
