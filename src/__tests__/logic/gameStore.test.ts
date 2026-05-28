import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { Belt } from '../../types';
import type { PlayerProgress } from '../../types';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('initial state', () => {
    it('should have null player', () => {
      expect(useGameStore.getState().player).toBeNull();
    });

    it('should have null playerId', () => {
      expect(useGameStore.getState().playerId).toBeNull();
    });

    it('should have null currentSession', () => {
      expect(useGameStore.getState().currentSession).toBeNull();
    });

    it('should have null tournament', () => {
      expect(useGameStore.getState().tournament).toBeNull();
    });

    it('should not be loading', () => {
      expect(useGameStore.getState().isLoading).toBe(false);
    });

    it('should have menu as active screen', () => {
      expect(useGameStore.getState().activeScreen).toBe('menu');
    });

    it('should not have animation playing', () => {
      expect(useGameStore.getState().animationPlaying).toBe(false);
    });
  });

  describe('startGame', () => {
    it('should create a session with 10 problems', () => {
      useGameStore.getState().startGame();
      const { currentSession } = useGameStore.getState();
      expect(currentSession).not.toBeNull();
      expect(currentSession!.problems).toHaveLength(10);
    });

    it('should set currentIndex to 0', () => {
      useGameStore.getState().startGame();
      expect(useGameStore.getState().currentSession!.currentIndex).toBe(0);
    });

    it('should initialize answers array with nulls', () => {
      useGameStore.getState().startGame();
      const { answers } = useGameStore.getState().currentSession!;
      expect(answers).toHaveLength(10);
      expect(answers.every((a) => a === null)).toBe(true);
    });

    it('should set activeScreen to game', () => {
      useGameStore.getState().startGame();
      expect(useGameStore.getState().activeScreen).toBe('game');
    });

    it('should set a startTime', () => {
      const before = Date.now();
      useGameStore.getState().startGame();
      const after = Date.now();
      const { startTime } = useGameStore.getState().currentSession!;
      expect(startTime).toBeGreaterThanOrEqual(before);
      expect(startTime).toBeLessThanOrEqual(after);
    });
  });

  describe('submitAnswer', () => {
    beforeEach(() => {
      useGameStore.getState().startGame();
    });

    it('should record the answer at the current index', () => {
      useGameStore.getState().submitAnswer(5);
      const { answers } = useGameStore.getState().currentSession!;
      expect(answers[0]).toBe(5);
    });

    it('should advance currentIndex', () => {
      useGameStore.getState().submitAnswer(5);
      expect(useGameStore.getState().currentSession!.currentIndex).toBe(1);
    });

    it('should not modify session if no current session', () => {
      useGameStore.getState().resetGame();
      useGameStore.getState().submitAnswer(5);
      expect(useGameStore.getState().currentSession).toBeNull();
    });

    it('should not advance past the last problem', () => {
      // Submit all 10 answers
      for (let i = 0; i < 10; i++) {
        useGameStore.getState().submitAnswer(i);
      }
      // Try to submit one more
      useGameStore.getState().submitAnswer(99);
      expect(useGameStore.getState().currentSession!.currentIndex).toBe(10);
    });
  });

  describe('endSession', () => {
    it('should update player progress when player exists', () => {
      const player: PlayerProgress = {
        currentBelt: Belt.White,
        currentStripes: 0,
        totalSessions: 0,
        totalCorrect: 0,
        totalProblems: 0,
      };
      useGameStore.getState().setPlayer(player);
      useGameStore.getState().startGame();

      // Submit all correct answers
      const { problems } = useGameStore.getState().currentSession!;
      for (const problem of problems) {
        useGameStore.getState().submitAnswer(problem.correctAnswer);
      }

      useGameStore.getState().endSession();

      const updatedPlayer = useGameStore.getState().player!;
      expect(updatedPlayer.totalSessions).toBe(1);
      expect(updatedPlayer.totalCorrect).toBe(10);
      expect(updatedPlayer.totalProblems).toBe(10);
      expect(updatedPlayer.currentStripes).toBe(1); // 100% score earns a stripe
    });

    it('should not award stripe when score is below 75%', () => {
      const player: PlayerProgress = {
        currentBelt: Belt.White,
        currentStripes: 0,
        totalSessions: 0,
        totalCorrect: 0,
        totalProblems: 0,
      };
      useGameStore.getState().setPlayer(player);
      useGameStore.getState().startGame();

      // Submit all wrong answers (answer 99 which can't be correct for 0-20 range)
      for (let i = 0; i < 10; i++) {
        useGameStore.getState().submitAnswer(99);
      }

      useGameStore.getState().endSession();

      const updatedPlayer = useGameStore.getState().player!;
      expect(updatedPlayer.totalSessions).toBe(1);
      expect(updatedPlayer.currentStripes).toBe(0);
    });

    it('should do nothing if no current session', () => {
      useGameStore.getState().endSession();
      expect(useGameStore.getState().player).toBeNull();
    });
  });

  describe('startTournamentMode', () => {
    it('should create a tournament state', () => {
      useGameStore.getState().startTournamentMode();
      const { tournament } = useGameStore.getState();
      expect(tournament).not.toBeNull();
      expect(tournament!.isActive).toBe(true);
      expect(tournament!.currentSessionIndex).toBe(0);
      expect(tournament!.sessions).toHaveLength(0);
    });

    it('should set activeScreen to tournament', () => {
      useGameStore.getState().startTournamentMode();
      expect(useGameStore.getState().activeScreen).toBe('tournament');
    });
  });

  describe('setActiveScreen', () => {
    it('should update the active screen', () => {
      useGameStore.getState().setActiveScreen('profile');
      expect(useGameStore.getState().activeScreen).toBe('profile');
    });
  });

  describe('setPlayer', () => {
    it('should set the player progress', () => {
      const player: PlayerProgress = {
        currentBelt: Belt.Green,
        currentStripes: 2,
        totalSessions: 15,
        totalCorrect: 120,
        totalProblems: 150,
      };
      useGameStore.getState().setPlayer(player);
      expect(useGameStore.getState().player).toEqual(player);
    });
  });

  describe('resetGame', () => {
    it('should reset all state to initial values', () => {
      // Set up some state
      useGameStore.getState().setPlayer({
        currentBelt: Belt.Blue,
        currentStripes: 1,
        totalSessions: 5,
        totalCorrect: 40,
        totalProblems: 50,
      });
      useGameStore.getState().startGame();
      useGameStore.getState().setActiveScreen('game');

      // Reset
      useGameStore.getState().resetGame();

      const state = useGameStore.getState();
      expect(state.player).toBeNull();
      expect(state.playerId).toBeNull();
      expect(state.currentSession).toBeNull();
      expect(state.tournament).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.activeScreen).toBe('menu');
      expect(state.animationPlaying).toBe(false);
    });
  });
});
