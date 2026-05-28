import { describe, it, expect } from 'vitest';
import { evaluateProgression } from '../../logic/beltProgression';
import { Belt } from '../../types';
import type { PlayerProgress, SessionResult } from '../../types';

describe('evaluateProgression', () => {
  const baseProgress: PlayerProgress = {
    currentBelt: Belt.White,
    currentStripes: 0,
    totalSessions: 5,
    totalCorrect: 40,
    totalProblems: 50,
  };

  describe('score below 75% - no advancement', () => {
    it('does not award stripe when score is below 75%', () => {
      const session: SessionResult = { correctCount: 7, totalCount: 10, score: 70 };
      const result = evaluateProgression(baseProgress, session);

      expect(result.stripeAwarded).toBe(false);
      expect(result.beltPromotion).toBe(false);
      expect(result.newProgress.currentBelt).toBe(Belt.White);
      expect(result.newProgress.currentStripes).toBe(0);
    });

    it('does not award stripe when score is exactly 74%', () => {
      const session: SessionResult = { correctCount: 74, totalCount: 100, score: 74 };
      const result = evaluateProgression(baseProgress, session);

      expect(result.stripeAwarded).toBe(false);
      expect(result.beltPromotion).toBe(false);
    });

    it('does not award stripe when score is 0%', () => {
      const session: SessionResult = { correctCount: 0, totalCount: 10, score: 0 };
      const result = evaluateProgression(baseProgress, session);

      expect(result.stripeAwarded).toBe(false);
      expect(result.beltPromotion).toBe(false);
    });

    it('still updates session totals when score is below threshold', () => {
      const session: SessionResult = { correctCount: 5, totalCount: 10, score: 50 };
      const result = evaluateProgression(baseProgress, session);

      expect(result.newProgress.totalSessions).toBe(6);
      expect(result.newProgress.totalCorrect).toBe(45);
      expect(result.newProgress.totalProblems).toBe(60);
    });
  });

  describe('score >= 75% - stripe awarded', () => {
    it('awards stripe when score is exactly 75%', () => {
      const session: SessionResult = { correctCount: 75, totalCount: 100, score: 75 };
      const result = evaluateProgression(baseProgress, session);

      expect(result.stripeAwarded).toBe(true);
      expect(result.beltPromotion).toBe(false);
      expect(result.newProgress.currentStripes).toBe(1);
    });

    it('awards stripe when score is 100%', () => {
      const session: SessionResult = { correctCount: 10, totalCount: 10, score: 100 };
      const result = evaluateProgression(baseProgress, session);

      expect(result.stripeAwarded).toBe(true);
      expect(result.newProgress.currentStripes).toBe(1);
    });

    it('increments stripes from 0 to 1', () => {
      const progress: PlayerProgress = { ...baseProgress, currentStripes: 0 };
      const session: SessionResult = { correctCount: 8, totalCount: 10, score: 80 };
      const result = evaluateProgression(progress, session);

      expect(result.newProgress.currentStripes).toBe(1);
      expect(result.stripeAwarded).toBe(true);
      expect(result.beltPromotion).toBe(false);
    });

    it('increments stripes from 1 to 2', () => {
      const progress: PlayerProgress = { ...baseProgress, currentStripes: 1 };
      const session: SessionResult = { correctCount: 8, totalCount: 10, score: 80 };
      const result = evaluateProgression(progress, session);

      expect(result.newProgress.currentStripes).toBe(2);
      expect(result.stripeAwarded).toBe(true);
      expect(result.beltPromotion).toBe(false);
    });

    it('updates session totals when stripe is awarded', () => {
      const session: SessionResult = { correctCount: 8, totalCount: 10, score: 80 };
      const result = evaluateProgression(baseProgress, session);

      expect(result.newProgress.totalSessions).toBe(6);
      expect(result.newProgress.totalCorrect).toBe(48);
      expect(result.newProgress.totalProblems).toBe(60);
    });
  });

  describe('belt promotion - 3rd stripe triggers advancement', () => {
    it('promotes from White to Yellow when earning 3rd stripe', () => {
      const progress: PlayerProgress = { ...baseProgress, currentBelt: Belt.White, currentStripes: 2 };
      const session: SessionResult = { correctCount: 8, totalCount: 10, score: 80 };
      const result = evaluateProgression(progress, session);

      expect(result.stripeAwarded).toBe(true);
      expect(result.beltPromotion).toBe(true);
      expect(result.newBelt).toBe(Belt.Yellow);
      expect(result.newProgress.currentBelt).toBe(Belt.Yellow);
      expect(result.newProgress.currentStripes).toBe(0);
    });

    it('promotes from Brown to Black when earning 3rd stripe', () => {
      const progress: PlayerProgress = { ...baseProgress, currentBelt: Belt.Brown, currentStripes: 2 };
      const session: SessionResult = { correctCount: 9, totalCount: 10, score: 90 };
      const result = evaluateProgression(progress, session);

      expect(result.stripeAwarded).toBe(true);
      expect(result.beltPromotion).toBe(true);
      expect(result.newBelt).toBe(Belt.Black);
      expect(result.newProgress.currentBelt).toBe(Belt.Black);
      expect(result.newProgress.currentStripes).toBe(0);
    });

    it('promotes through all belt levels correctly', () => {
      const belts = [Belt.White, Belt.Yellow, Belt.Orange, Belt.Green, Belt.Blue, Belt.Brown];
      const expectedNext = [Belt.Yellow, Belt.Orange, Belt.Green, Belt.Blue, Belt.Brown, Belt.Black];

      belts.forEach((belt, index) => {
        const progress: PlayerProgress = { ...baseProgress, currentBelt: belt, currentStripes: 2 };
        const session: SessionResult = { correctCount: 8, totalCount: 10, score: 80 };
        const result = evaluateProgression(progress, session);

        expect(result.beltPromotion).toBe(true);
        expect(result.newBelt).toBe(expectedNext[index]);
        expect(result.newProgress.currentStripes).toBe(0);
      });
    });
  });

  describe('Black belt - no promotion beyond Black', () => {
    it('does not promote beyond Black belt', () => {
      const progress: PlayerProgress = { ...baseProgress, currentBelt: Belt.Black, currentStripes: 0 };
      const session: SessionResult = { correctCount: 10, totalCount: 10, score: 100 };
      const result = evaluateProgression(progress, session);

      expect(result.beltPromotion).toBe(false);
      expect(result.newBelt).toBeUndefined();
      expect(result.newProgress.currentBelt).toBe(Belt.Black);
    });

    it('awards stripe to Black belt player (up to max)', () => {
      const progress: PlayerProgress = { ...baseProgress, currentBelt: Belt.Black, currentStripes: 0 };
      const session: SessionResult = { correctCount: 8, totalCount: 10, score: 80 };
      const result = evaluateProgression(progress, session);

      expect(result.stripeAwarded).toBe(true);
      expect(result.newProgress.currentStripes).toBe(1);
    });

    it('does not exceed max stripes for Black belt', () => {
      const progress: PlayerProgress = { ...baseProgress, currentBelt: Belt.Black, currentStripes: 2 };
      const session: SessionResult = { correctCount: 10, totalCount: 10, score: 100 };
      const result = evaluateProgression(progress, session);

      expect(result.stripeAwarded).toBe(false);
      expect(result.newProgress.currentStripes).toBe(2);
      expect(result.beltPromotion).toBe(false);
    });

    it('increments Black belt stripes from 1 to 2', () => {
      const progress: PlayerProgress = { ...baseProgress, currentBelt: Belt.Black, currentStripes: 1 };
      const session: SessionResult = { correctCount: 9, totalCount: 10, score: 90 };
      const result = evaluateProgression(progress, session);

      expect(result.stripeAwarded).toBe(true);
      expect(result.newProgress.currentStripes).toBe(2);
    });
  });
});
