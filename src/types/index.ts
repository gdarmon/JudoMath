/**
 * Core TypeScript interfaces and types for Judo Math Game
 */

// Belt progression enum following Judo order
export const Belt = {
  White: 0,
  Yellow: 1,
  Orange: 2,
  Green: 3,
  Blue: 4,
  Brown: 5,
  Black: 6,
} as const;

export type Belt = (typeof Belt)[keyof typeof Belt];

// Math problem representation
export interface MathProblem {
  id: string;
  operand1: number;       // 0-20
  operand2: number;       // 0-20
  operator: '+' | '-';
  correctAnswer: number;  // 0-20
}

// Configuration for problem generation
export interface ProblemGeneratorConfig {
  count: number;          // problems per session (default: 10)
  maxOperand: number;     // maximum operand value (default: 20)
  maxResult: number;      // maximum result value (default: 20)
}

// Player's overall progress
export interface PlayerProgress {
  currentBelt: Belt;
  currentStripes: number;  // 0-2 (3 stripes triggers promotion)
  totalSessions: number;
  totalCorrect: number;
  totalProblems: number;
}

// Result of a single game session
export interface SessionResult {
  correctCount: number;
  totalCount: number;
  score: number;           // percentage (0-100)
}

// Result of evaluating progression after a session
export interface ProgressionResult {
  newProgress: PlayerProgress;
  stripeAwarded: boolean;
  beltPromotion: boolean;
  newBelt?: Belt;
}

// Tournament state tracking
export interface TournamentState {
  currentSessionIndex: number;  // 0-2 (3 sessions total)
  sessions: TournamentSession[];
  startTime: number;
  isActive: boolean;
}

// Individual tournament session data
export interface TournamentSession {
  problems: MathProblem[];
  answers: number[];
  score: number;
  timePerProblem: number[];  // milliseconds per problem
}

// Final tournament result
export interface TournamentResult {
  totalScore: number;
  totalTime: number;         // milliseconds
  sessionsCompleted: number;
}

// Leaderboard entry
export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalScore: number;
  totalTime: number;
  date: string;
}

// Animation configuration
export interface AnimationConfig {
  type: 'correct' | 'incorrect' | 'stripe' | 'belt_ceremony' | 'idle_reminder';
  duration: number;        // milliseconds
  beltColor?: Belt;        // for belt_ceremony type
}

// Main game store interface
export interface GameStore {
  // Player
  player: PlayerProgress | null;
  playerId: string | null;

  // Current session
  currentSession: {
    problems: MathProblem[];
    currentIndex: number;
    answers: (number | null)[];
    startTime: number;
  } | null;

  // Tournament
  tournament: TournamentState | null;

  // UI state
  isLoading: boolean;
  activeScreen: 'menu' | 'game' | 'tournament' | 'profile';
  animationPlaying: boolean;
}
