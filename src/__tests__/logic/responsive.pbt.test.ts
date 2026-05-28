import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getLayoutMode } from '../../logic/responsive';

describe('Feature: judo-math-game, Property 11: Responsive layout breakpoint behavior', () => {
  /**
   * **Validates: Requirements 11.4, 11.5**
   *
   * For any viewport width in [320, 1920], the layout system must apply
   * single-column layout when width < 768px and multi-column layout when width ≥ 768px.
   */
  it('returns single-column when width < 768px and multi-column when width >= 768px', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        (viewportWidth) => {
          const result = getLayoutMode(viewportWidth);

          if (viewportWidth < 768) {
            expect(result).toBe('single-column');
          } else {
            expect(result).toBe('multi-column');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
