import { describe, it, expect } from 'vitest';
import { generateSession, validateAnswer } from '../../logic/problemGenerator';

describe('generateSession', () => {
  it('generates exactly 10 problems with default config', () => {
    const problems = generateSession();
    expect(problems).toHaveLength(10);
  });

  it('generates the specified number of problems', () => {
    const problems = generateSession({ count: 5 });
    expect(problems).toHaveLength(5);
  });

  it('generates problems with valid operators', () => {
    const problems = generateSession();
    for (const problem of problems) {
      expect(['+', '-']).toContain(problem.operator);
    }
  });

  it('generates problems with operands in [0, 20]', () => {
    const problems = generateSession();
    for (const problem of problems) {
      expect(problem.operand1).toBeGreaterThanOrEqual(0);
      expect(problem.operand1).toBeLessThanOrEqual(20);
      expect(problem.operand2).toBeGreaterThanOrEqual(0);
      expect(problem.operand2).toBeLessThanOrEqual(20);
    }
  });

  it('generates problems with results in [0, 20]', () => {
    const problems = generateSession();
    for (const problem of problems) {
      expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(problem.correctAnswer).toBeLessThanOrEqual(20);
    }
  });

  it('generates addition problems with correct answers', () => {
    const problems = generateSession({ count: 100 });
    const additionProblems = problems.filter(p => p.operator === '+');
    for (const problem of additionProblems) {
      expect(problem.correctAnswer).toBe(problem.operand1 + problem.operand2);
    }
  });

  it('generates subtraction problems with non-negative results', () => {
    const problems = generateSession({ count: 100 });
    const subtractionProblems = problems.filter(p => p.operator === '-');
    for (const problem of subtractionProblems) {
      expect(problem.correctAnswer).toBe(problem.operand1 - problem.operand2);
      expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
    }
  });

  it('generates problems with unique IDs', () => {
    const problems = generateSession();
    const ids = problems.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('respects custom maxOperand', () => {
    const problems = generateSession({ count: 50, maxOperand: 10, maxResult: 20 });
    for (const problem of problems) {
      expect(problem.operand1).toBeLessThanOrEqual(10);
      expect(problem.operand2).toBeLessThanOrEqual(10);
    }
  });

  it('respects custom maxResult', () => {
    const problems = generateSession({ count: 50, maxOperand: 20, maxResult: 10 });
    for (const problem of problems) {
      expect(problem.correctAnswer).toBeLessThanOrEqual(10);
    }
  });
});

describe('validateAnswer', () => {
  it('returns true for correct answer', () => {
    const problem = {
      id: 'test-1',
      operand1: 5,
      operand2: 3,
      operator: '+' as const,
      correctAnswer: 8,
    };
    expect(validateAnswer(problem, 8)).toBe(true);
  });

  it('returns false for incorrect answer', () => {
    const problem = {
      id: 'test-2',
      operand1: 10,
      operand2: 4,
      operator: '-' as const,
      correctAnswer: 6,
    };
    expect(validateAnswer(problem, 7)).toBe(false);
  });

  it('returns false for answer of 0 when correct answer is not 0', () => {
    const problem = {
      id: 'test-3',
      operand1: 3,
      operand2: 2,
      operator: '+' as const,
      correctAnswer: 5,
    };
    expect(validateAnswer(problem, 0)).toBe(false);
  });

  it('returns true for answer of 0 when correct answer is 0', () => {
    const problem = {
      id: 'test-4',
      operand1: 5,
      operand2: 5,
      operator: '-' as const,
      correctAnswer: 0,
    };
    expect(validateAnswer(problem, 0)).toBe(true);
  });
});
