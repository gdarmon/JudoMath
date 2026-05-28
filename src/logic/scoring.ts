/**
 * Calculates the score as a percentage of correct answers.
 *
 * @param correctCount - Number of correct answers
 * @param totalCount - Total number of problems
 * @returns Score as a rounded percentage (0-100)
 */
export function calculateScore(correctCount: number, totalCount: number): number {
  return Math.round((correctCount / totalCount) * 100);
}
