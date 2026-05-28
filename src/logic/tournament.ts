import type { TournamentState, TournamentResult, TournamentSession } from '../types';

/**
 * Creates an initial tournament state.
 *
 * @returns A new TournamentState with isActive=true, currentSessionIndex=0,
 *          empty sessions array, and startTime set to current time.
 */
export function startTournament(): TournamentState {
  return {
    isActive: true,
    currentSessionIndex: 0,
    sessions: [],
    startTime: Date.now(),
  };
}

/**
 * Adds a completed session to the tournament state and advances to the next session.
 * Sets isActive to false if all 3 sessions have been completed.
 *
 * @param state - Current tournament state
 * @param session - The completed tournament session to add
 * @returns Updated tournament state with the session added
 */
export function completeSession(
  state: TournamentState,
  session: TournamentSession
): TournamentState {
  const updatedSessions = [...state.sessions, session];
  const nextIndex = state.currentSessionIndex + 1;
  const isComplete = updatedSessions.length >= 3;

  return {
    ...state,
    sessions: updatedSessions,
    currentSessionIndex: nextIndex,
    isActive: !isComplete,
  };
}

/**
 * Calculates the final tournament result from a tournament state.
 *
 * - totalScore = total correct across all sessions / total problems across all sessions * 100 (rounded)
 * - totalTime = sum of all timePerProblem values across all sessions
 * - sessionsCompleted = number of sessions in state.sessions
 *
 * @param state - The tournament state to calculate results for
 * @returns The computed tournament result
 */
export function calculateTournamentResult(state: TournamentState): TournamentResult {
  const sessionsCompleted = state.sessions.length;

  if (sessionsCompleted === 0) {
    return {
      totalScore: 0,
      totalTime: 0,
      sessionsCompleted: 0,
    };
  }

  let totalCorrect = 0;
  let totalProblems = 0;
  let totalTime = 0;

  for (const session of state.sessions) {
    // Count correct answers by comparing player answers to correct answers
    for (let i = 0; i < session.problems.length; i++) {
      totalProblems++;
      if (session.answers[i] === session.problems[i].correctAnswer) {
        totalCorrect++;
      }
    }

    // Sum all time per problem values
    for (const time of session.timePerProblem) {
      totalTime += time;
    }
  }

  const totalScore = totalProblems > 0
    ? Math.round((totalCorrect / totalProblems) * 100)
    : 0;

  return {
    totalScore,
    totalTime,
    sessionsCompleted,
  };
}
