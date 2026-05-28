import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { generateChoices } from '../../logic/distractors'
import type { MathProblem } from '../../types'

/** Build a syntactically valid MathProblem from operands + operator. */
function makeProblem(op1: number, op2: number, operator: '+' | '-'): MathProblem {
  const correctAnswer = operator === '+' ? op1 + op2 : op1 - op2
  return {
    id: `${op1}${operator}${op2}`,
    operand1: op1,
    operand2: op2,
    operator,
    correctAnswer,
  }
}

describe('generateChoices', () => {
  it('always returns exactly 6 unique integer choices in [0, 20] including the correct answer', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        fc.constantFrom<'+' | '-'>('+', '-'),
        (a, b, op) => {
          // Pre-condition: result must be in [0, 20].
          const result = op === '+' ? a + b : a - b
          fc.pre(result >= 0 && result <= 20)

          const problem = makeProblem(a, b, op)
          const choices = generateChoices(problem)

          expect(choices).toHaveLength(6)
          expect(new Set(choices).size).toBe(6)
          expect(choices).toContain(problem.correctAnswer)
          for (const c of choices) {
            expect(Number.isInteger(c)).toBe(true)
            expect(c).toBeGreaterThanOrEqual(0)
            expect(c).toBeLessThanOrEqual(20)
          }
        },
      ),
      { numRuns: 200 },
    )
  })

  it('is deterministic for the same problem id', () => {
    const problem = makeProblem(7, 5, '+')
    const a = generateChoices(problem)
    const b = generateChoices(problem)
    expect(a).toEqual(b)
  })

  it('includes plausible operator-confusion distractors (kid mistakes addition for subtraction)', () => {
    // 3 + 4 = 7. A kid might subtract: |3 - 4| = 1.
    const problem = makeProblem(3, 4, '+')
    const choices = generateChoices(problem)
    expect(choices).toContain(7)
    expect(choices).toContain(1)
  })

  it('handles edge case at the upper bound (correctAnswer near 20)', () => {
    // 18 + 2 = 20.
    const problem = makeProblem(18, 2, '+')
    const choices = generateChoices(problem)
    expect(choices).toHaveLength(6)
    expect(choices).toContain(20)
    // No values above 20.
    for (const c of choices) expect(c).toBeLessThanOrEqual(20)
  })

  it('handles edge case at the lower bound (correctAnswer = 0)', () => {
    // 5 - 5 = 0.
    const problem = makeProblem(5, 5, '-')
    const choices = generateChoices(problem)
    expect(choices).toHaveLength(6)
    expect(choices).toContain(0)
    // No negative values.
    for (const c of choices) expect(c).toBeGreaterThanOrEqual(0)
  })
})
