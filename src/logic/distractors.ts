import type { MathProblem } from '../types'

const MAX_OPTION_VALUE = 20
const MIN_OPTION_VALUE = 0
const TOTAL_OPTIONS = 6

/**
 * Simple deterministic seeded RNG (mulberry32).
 * We seed from the problem id so the same problem always produces
 * the same set of distractors, which prevents UI flicker on re-render.
 */
function seededRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Hash a problem id into a 32-bit integer seed. */
function hashSeed(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Build a pool of plausible candidate answers, ordered by how likely they
 * are to feel like real distractors (close to the correct answer first).
 */
function candidatePool(problem: MathProblem): number[] {
  const { operand1, operand2, operator, correctAnswer } = problem
  const seen = new Set<number>([correctAnswer])
  const ordered: number[] = []
  const push = (n: number) => {
    if (
      Number.isInteger(n) &&
      n >= MIN_OPTION_VALUE &&
      n <= MAX_OPTION_VALUE &&
      !seen.has(n)
    ) {
      seen.add(n)
      ordered.push(n)
    }
  }

  // Off-by-one and off-by-two — the most common arithmetic mistakes.
  push(correctAnswer + 1)
  push(correctAnswer - 1)
  push(correctAnswer + 2)
  push(correctAnswer - 2)

  // Operator-confusion mistakes (kids sometimes add when asked to subtract).
  if (operator === '+') {
    push(Math.abs(operand1 - operand2))
  } else {
    push(operand1 + operand2)
  }

  // Operand-echo mistakes (kids pick one of the operands by accident).
  push(operand1)
  push(operand2)

  // Wider neighbourhood as a fallback.
  for (let delta = 3; delta <= MAX_OPTION_VALUE; delta++) {
    push(correctAnswer + delta)
    push(correctAnswer - delta)
  }

  return ordered
}

/**
 * Returns 6 answer choices for a given problem: the correct answer plus
 * 5 plausible distractors, all in [0, 20] and unique. Order is shuffled
 * but deterministic for a given problem id.
 */
export function generateChoices(problem: MathProblem): number[] {
  const pool = candidatePool(problem)
  const distractorCount = TOTAL_OPTIONS - 1
  const distractors = pool.slice(0, distractorCount)

  // If the bounded range was too narrow to produce 5 distractors,
  // pad with any remaining valid integers in [0, 20].
  if (distractors.length < distractorCount) {
    const used = new Set<number>([problem.correctAnswer, ...distractors])
    for (let n = MIN_OPTION_VALUE; n <= MAX_OPTION_VALUE && distractors.length < distractorCount; n++) {
      if (!used.has(n)) {
        used.add(n)
        distractors.push(n)
      }
    }
  }

  const all = [problem.correctAnswer, ...distractors]
  return shuffle(all, seededRng(hashSeed(problem.id)))
}

/** Fisher-Yates shuffle using the provided RNG. */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
