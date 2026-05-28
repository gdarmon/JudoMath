import type { MathProblem, ProblemGeneratorConfig } from '../types';

const DEFAULT_CONFIG: ProblemGeneratorConfig = {
  count: 10,
  maxOperand: 20,
  maxResult: 20,
};

/**
 * Generates a unique ID for a math problem.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Returns a random integer between min and max (inclusive).
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a single math problem that satisfies all constraints:
 * - Operands are whole numbers in [0, maxOperand]
 * - Result is a whole number in [0, maxResult]
 * - Subtraction never produces negative results
 */
function generateProblem(config: ProblemGeneratorConfig): MathProblem {
  const { maxOperand, maxResult } = config;
  const operator = Math.random() < 0.5 ? '+' : '-';

  let operand1: number;
  let operand2: number;
  let correctAnswer: number;

  if (operator === '+') {
    // For addition: operand1 + operand2 must be <= maxResult
    // Pick operand1 in [0, min(maxOperand, maxResult)]
    const maxFirst = Math.min(maxOperand, maxResult);
    operand1 = randomInt(0, maxFirst);
    // operand2 must satisfy: operand2 <= maxOperand AND operand1 + operand2 <= maxResult
    const maxSecond = Math.min(maxOperand, maxResult - operand1);
    operand2 = randomInt(0, maxSecond);
    correctAnswer = operand1 + operand2;
  } else {
    // For subtraction: operand1 - operand2 >= 0 and result <= maxResult
    // Pick operand1 in [0, min(maxOperand, maxResult)] since result = operand1 - operand2 <= operand1
    // Actually operand1 can be up to maxOperand, and result will be operand1 - operand2 which is <= operand1 <= maxOperand
    // But we also need result <= maxResult, so operand1 - operand2 <= maxResult
    // And operand2 >= 0, so result = operand1 - operand2 <= operand1
    // If operand1 <= maxResult, any operand2 in [0, operand1] gives valid result
    // If operand1 > maxResult, we need operand2 >= operand1 - maxResult
    operand1 = randomInt(0, maxOperand);
    const minSecond = Math.max(0, operand1 - maxResult);
    operand2 = randomInt(minSecond, operand1);
    correctAnswer = operand1 - operand2;
  }

  return {
    id: generateId(),
    operand1,
    operand2,
    operator,
    correctAnswer,
  };
}

/**
 * Generates a session of math problems based on the provided configuration.
 * Each problem satisfies:
 * - Operands are whole numbers in [0, maxOperand]
 * - Results are whole numbers in [0, maxResult]
 * - Subtraction never produces negative results
 */
export function generateSession(config?: Partial<ProblemGeneratorConfig>): MathProblem[] {
  const fullConfig: ProblemGeneratorConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const problems: MathProblem[] = [];
  for (let i = 0; i < fullConfig.count; i++) {
    problems.push(generateProblem(fullConfig));
  }

  return problems;
}

/**
 * Validates whether a player's answer matches the correct answer for a problem.
 */
export function validateAnswer(problem: MathProblem, playerAnswer: number): boolean {
  return problem.correctAnswer === playerAnswer;
}
