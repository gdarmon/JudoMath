import { describe, it, expect } from 'vitest';
import {
  startTournament,
  completeSession,
  calculateTournamentResult,
} from '../../logic/tournament';
import type { TournamentState, TournamentSession, MathProblem } from '../../types';

// Helper to create a MathProblem
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

// Helper to create a TournamentSession with a given number of correct answers
function makeSession(correctCount: number, totalCount: number = 10): TournamentSession {
  const problems: MathProblem[] = [];
  const answers: number[] = [];
  const timePerProblem: number[] = [];

  for (let i = 0; i < totalCount; i++) {
    const problem = makeProblem(5, 3, '+'); // 5+3=8
    problems.push(problem);
    // First `correctCount` answers are correct, rest are wrong
    answers.push(i < correctCount ? 8 : 99);
    timePerProblem.push(2000); // 2 seconds per problem
  }

  const score = Math.round((correctCount / totalCount) * 100);
  return { problems, answers, score, timePerProblem };
}

describe('startTournament', () => {
  it('creates initial state with isActive=true', () => {
    const state = startTournament();
    expect(state.isActive).toBe(true);
  });

  it('creates initial state with currentSessionIndex=0', () => {
    const state = startTournament();
    expect(state.currentSessionIndex).toBe(0);
  });

  it('creates initial state with empty sessions array', () => {
    const state = startTournament();
    expect(state.sessions).toEqual([]);
  });

  it('sets startTime to approximately current time', () => {
    const before = Date.now();
    const state = startTournament();
    const after = Date.now();
    expect(state.startTime).toBeGreaterThanOrEqual(before);
    expect(state.startTime).toBeLessThanOrEqual(after);
  });
});

describe('completeSession', () => {
  it('adds session to the sessions array', () => {
    const state = startTournament();
    const session = makeSession(8);
    const updated = completeSession(state, session);
    expect(updated.sessions).toHaveLength(1);
    expect(updated.sessions[0]).toBe(session);
  });

  it('increments currentSessionIndex', () => {
    const state = startTournament();
    const session = makeSession(8);
    const updated = completeSession(state, session);
    expect(updated.currentSessionIndex).toBe(1);
  });

  it('keeps isActive=true after 1 session', () => {
    const state = startTournament();
    const updated = completeSession(state, makeSession(8));
    expect(updated.isActive).toBe(true);
  });

  it('keeps isActive=true after 2 sessions', () => {
    let state = startTournament();
    state = completeSession(state, makeSession(8));
    state = completeSession(state, makeSession(7));
    expect(state.isActive).toBe(true);
  });

  it('sets isActive=false after 3 sessions (tournament complete)', () => {
    let state = startTournament();
    state = completeSession(state, makeSession(8));
    state = completeSession(state, makeSession(7));
    state = completeSession(state, makeSession(9));
    expect(state.isActive).toBe(false);
  });

  it('does not mutate the original state', () => {
    const state = startTournament();
    const session = makeSession(8);
    const updated = completeSession(state, session);
    expect(state.sessions).toHaveLength(0);
    expect(updated.sessions).toHaveLength(1);
  });
});

describe('calculateTournamentResult', () => {
  it('returns zero values for empty tournament', () => {
    const state: TournamentState = {
      currentSessionIndex: 0,
      sessions: [],
      startTime: Date.now(),
      isActive: true,
    };
    const result = calculateTournamentResult(state);
    expect(result.totalScore).toBe(0);
    expect(result.totalTime).toBe(0);
    expect(result.sessionsCompleted).toBe(0);
  });

  it('calculates correct totalScore across all sessions', () => {
    // 8/10 + 7/10 + 9/10 = 24/30 = 80%
    let state = startTournament();
    state = completeSession(state, makeSession(8));
    state = completeSession(state, makeSession(7));
    state = completeSession(state, makeSession(9));

    const result = calculateTournamentResult(state);
    expect(result.totalScore).toBe(80); // 24/30 * 100 = 80
  });

  it('calculates correct totalTime as sum of all timePerProblem values', () => {
    // Each session has 10 problems at 2000ms each = 20000ms per session
    // 3 sessions = 60000ms total
    let state = startTournament();
    state = completeSession(state, makeSession(8));
    state = completeSession(state, makeSession(7));
    state = completeSession(state, makeSession(9));

    const result = calculateTournamentResult(state);
    expect(result.totalTime).toBe(60000);
  });

  it('reports correct sessionsCompleted count', () => {
    let state = startTournament();
    state = completeSession(state, makeSession(8));
    state = completeSession(state, makeSession(7));

    const result = calculateTournamentResult(state);
    expect(result.sessionsCompleted).toBe(2);
  });

  it('rounds totalScore correctly for non-integer percentages', () => {
    // 3/10 + 3/10 + 3/10 = 9/30 = 30%
    let state = startTournament();
    state = completeSession(state, makeSession(3));
    state = completeSession(state, makeSession(3));
    state = completeSession(state, makeSession(3));

    const result = calculateTournamentResult(state);
    expect(result.totalScore).toBe(30);
  });

  it('handles perfect score tournament', () => {
    let state = startTournament();
    state = completeSession(state, makeSession(10));
    state = completeSession(state, makeSession(10));
    state = completeSession(state, makeSession(10));

    const result = calculateTournamentResult(state);
    expect(result.totalScore).toBe(100);
  });

  it('handles zero score tournament', () => {
    let state = startTournament();
    state = completeSession(state, makeSession(0));
    state = completeSession(state, makeSession(0));
    state = completeSession(state, makeSession(0));

    const result = calculateTournamentResult(state);
    expect(result.totalScore).toBe(0);
  });
});
