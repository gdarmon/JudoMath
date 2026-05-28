/**
 * Responsive layout utility functions.
 * Determines layout mode based on viewport width breakpoints.
 */

export type LayoutMode = 'single-column' | 'multi-column';

/**
 * Returns the layout mode for a given viewport width.
 * - Single-column layout for viewport widths below 768px
 * - Multi-column layout for viewport widths of 768px or above
 *
 * Supports viewport widths in the range [320, 1920].
 */
export function getLayoutMode(viewportWidth: number): LayoutMode {
  return viewportWidth < 768 ? 'single-column' : 'multi-column';
}
