import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Belt } from '../../types';
import { getBeltColor } from '../../logic/beltColors';

describe('Feature: judo-math-game, Property 9: Avatar belt color mapping', () => {
  /**
   * **Validates: Requirements 8.4**
   *
   * For any Belt enum value, the color mapping returns a distinct valid color string
   * (bijective mapping — no two belts map to the same color).
   */

  const allBeltValues: Belt[] = [
    Belt.White,
    Belt.Yellow,
    Belt.Orange,
    Belt.Green,
    Belt.Blue,
    Belt.Brown,
    Belt.Black,
  ];

  const beltArbitrary = fc.constantFrom(...allBeltValues);

  it('getBeltColor returns a non-empty string for every Belt value', () => {
    fc.assert(
      fc.property(beltArbitrary, (belt) => {
        const color = getBeltColor(belt);
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('all belt colors are distinct (bijective mapping)', () => {
    fc.assert(
      fc.property(
        beltArbitrary,
        beltArbitrary,
        (belt1, belt2) => {
          if (belt1 !== belt2) {
            expect(getBeltColor(belt1)).not.toBe(getBeltColor(belt2));
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the color mapping is bijective — all 7 belts produce 7 unique colors', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const colors = allBeltValues.map((belt) => getBeltColor(belt));
        const uniqueColors = new Set(colors);
        expect(uniqueColors.size).toBe(allBeltValues.length);
      }),
      { numRuns: 100 }
    );
  });
});
