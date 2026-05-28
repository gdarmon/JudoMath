import { describe, it, expect } from 'vitest';
import { calculateScore } from '../../logic/scoring';

describe('calculateScore', () => {
  it('returns 100 when all answers are correct', () => {
    expect(calculateScore(10, 10)).toBe(100);
  });

  it('returns 0 when no answers are correct', () => {
    expect(calculateScore(0, 10)).toBe(0);
  });

  it('returns rounded percentage for partial scores', () => {
    expect(calculateScore(7, 10)).toBe(70);
    expect(calculateScore(3, 10)).toBe(30);
  });

  it('rounds correctly for non-integer percentages', () => {
    // 1/3 = 33.333... → rounds to 33
    expect(calculateScore(1, 3)).toBe(33);
    // 2/3 = 66.666... → rounds to 67
    expect(calculateScore(2, 3)).toBe(67);
  });

  it('handles single problem session', () => {
    expect(calculateScore(1, 1)).toBe(100);
    expect(calculateScore(0, 1)).toBe(0);
  });
});
