import { create } from 'zustand';
import type { GameStore, PlayerProgress, TournamentState } from '../types';
import { generateSession } from '../logic/problemGenerator';
import { calculateScore } from '../logic/scoring';
import { evaluateProgression } from '../logic/beltProgression';
import { startTournament } from '../logic/tournament';

interface GameActions {
  startGame: () => void;
  submitAnswer: (answer: number) => void;
  endSession: () => void;
  startTournamentMode: () => void;
  setActiveScreen: (screen: GameStore['activeScreen']) => void;
  setPlayer: (progress: PlayerProgress) => void;
  setPlayerId: (id: string) => void;
  setAnimationPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
  resetGame: () => void;
}

export type GameStoreWithActions = GameStore & GameActions;

const initialState: GameStore = {
  player: null,
  playerId: null,
  currentSession: null,
  tournament: null,
  isLoading: false,
  activeScreen: 'menu',
  animationPlaying: false,
};

export const useGameStore = create<GameStoreWithActions>((set, get) => ({
  ...initialState,

  startGame: () => {
    const problems = generateSession();
    set({
      currentSession: {
        problems,
        currentIndex: 0,
        answers: new Array(problems.length).fill(null),
        startTime: Date.now(),
      },
      activeScreen: 'game',
    });
  },

  submitAnswer: (answer: number) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const { currentIndex, answers } = currentSession;
    if (currentIndex >= currentSession.problems.length) return;

    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = answer;

    const nextIndex = currentIndex + 1;

    set({
      currentSession: {
        ...currentSession,
        answers: updatedAnswers,
        currentIndex: nextIndex,
      },
    });
  },

  endSession: () => {
    const { currentSession, player } = get();
    if (!currentSession) return;

    const { problems, answers } = currentSession;
    let correctCount = 0;
    for (let i = 0; i < problems.length; i++) {
      if (answers[i] === problems[i].correctAnswer) {
        correctCount++;
      }
    }

    const totalCount = problems.length;
    const score = calculateScore(correctCount, totalCount);

    if (player) {
      const sessionResult = { correctCount, totalCount, score };
      const progressionResult = evaluateProgression(player, sessionResult);
      set({ player: progressionResult.newProgress });
    }
  },

  startTournamentMode: () => {
    const tournamentState: TournamentState = startTournament();
    set({
      tournament: tournamentState,
      activeScreen: 'tournament',
    });
  },

  setActiveScreen: (screen) => {
    set({ activeScreen: screen });
  },

  setPlayer: (progress) => {
    set({ player: progress });
  },

  setPlayerId: (id) => {
    set({ playerId: id });
  },

  setAnimationPlaying: (playing) => {
    set({ animationPlaying: playing });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  resetGame: () => {
    set(initialState);
  },
}));
