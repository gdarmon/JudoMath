import { Belt } from '../types';
import type { PlayerProgress, SessionResult, ProgressionResult } from '../types';

/**
 * Advancement threshold: minimum score percentage required for stripe progression.
 */
const ADVANCEMENT_THRESHOLD = 75;

/**
 * Number of stripes required to advance to the next belt.
 */
const STRIPES_FOR_PROMOTION = 3;

/**
 * Maximum stripe count (0-indexed, so max is STRIPES_FOR_PROMOTION - 1 = 2).
 */
const MAX_STRIPES = STRIPES_FOR_PROMOTION - 1;

/**
 * Evaluates belt progression after a game session.
 *
 * Logic:
 * 1. If score < 75%: return unchanged progress (only update session totals)
 * 2. If score >= 75%:
 *    - If currentBelt is Black (6): award stripe up to max (2), no promotion possible
 *    - If currentStripes is 2: promote to next belt, reset stripes to 0
 *    - Otherwise: increment stripes by 1
 * 3. Always update totalSessions, totalCorrect, totalProblems
 *
 * @param currentProgress - The player's current progress state
 * @param sessionResult - The result of the completed session
 * @returns ProgressionResult with updated progress and flags
 */
export function evaluateProgression(
  currentProgress: PlayerProgress,
  sessionResult: SessionResult
): ProgressionResult {
  // Always update session totals
  const updatedTotals: Pick<PlayerProgress, 'totalSessions' | 'totalCorrect' | 'totalProblems'> = {
    totalSessions: currentProgress.totalSessions + 1,
    totalCorrect: currentProgress.totalCorrect + sessionResult.correctCount,
    totalProblems: currentProgress.totalProblems + sessionResult.totalCount,
  };

  // If score is below threshold, no stripe or promotion
  if (sessionResult.score < ADVANCEMENT_THRESHOLD) {
    return {
      newProgress: {
        ...currentProgress,
        ...updatedTotals,
      },
      stripeAwarded: false,
      beltPromotion: false,
    };
  }

  // Score >= 75%: award a stripe
  const { currentBelt, currentStripes } = currentProgress;

  // If already at Black belt, award stripe up to max but no promotion
  if (currentBelt === Belt.Black) {
    return {
      newProgress: {
        ...currentProgress,
        ...updatedTotals,
        currentStripes: Math.min(currentStripes + 1, MAX_STRIPES),
      },
      stripeAwarded: currentStripes < MAX_STRIPES,
      beltPromotion: false,
    };
  }

  // If at 2 stripes, promote to next belt
  if (currentStripes === MAX_STRIPES) {
    const newBelt = (currentBelt + 1) as Belt;
    return {
      newProgress: {
        ...currentProgress,
        ...updatedTotals,
        currentBelt: newBelt,
        currentStripes: 0,
      },
      stripeAwarded: true,
      beltPromotion: true,
      newBelt,
    };
  }

  // Otherwise, just increment stripes
  return {
    newProgress: {
      ...currentProgress,
      ...updatedTotals,
      currentStripes: currentStripes + 1,
    },
    stripeAwarded: true,
    beltPromotion: false,
  };
}
