import { Belt } from '../types';

/** Maps Belt enum values to CSS color strings */
const BELT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#f5f5f5',
  [Belt.Yellow]: '#fdd835',
  [Belt.Orange]: '#ff9800',
  [Belt.Green]: '#4caf50',
  [Belt.Blue]: '#2196f3',
  [Belt.Brown]: '#795548',
  [Belt.Black]: '#212121',
};

/** Maps Belt enum values to display names */
const BELT_NAMES: Record<Belt, string> = {
  [Belt.White]: 'White',
  [Belt.Yellow]: 'Yellow',
  [Belt.Orange]: 'Orange',
  [Belt.Green]: 'Green',
  [Belt.Blue]: 'Blue',
  [Belt.Brown]: 'Brown',
  [Belt.Black]: 'Black',
};

/**
 * Returns the CSS color string for a given Belt value.
 * The mapping is bijective: each belt maps to a unique color.
 */
export function getBeltColor(belt: Belt): string {
  return BELT_COLORS[belt];
}

/**
 * Returns the display name for a given Belt value.
 */
export function getBeltName(belt: Belt): string {
  return BELT_NAMES[belt];
}
