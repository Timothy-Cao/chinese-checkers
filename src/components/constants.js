// constants.js — Shared game configuration

export const ROWS = 17;
export const COLS = 24;

export const ROW_PATTERN = [1, 2, 3, 4, 13, 12, 11, 10, 9, 10, 11, 12, 13, 4, 3, 2, 1];
export const START_COLUMNS = [4, 4, 4, 4, 0, 1, 2, 3, 4, 4, 4, 4, 4, 9, 10, 11, 12];

export const PLAYER_RED = 1;
export const PLAYER_BLUE = 2;

// Starting/goal positions for each player
// Red starts bottom-right, Blue starts top-left
export const RED_HOME = [
  { row: 13, cols: [9, 10, 11, 12] },
  { row: 14, cols: [10, 11, 12] },
  { row: 15, cols: [11, 12] },
  { row: 16, cols: [12] },
];

export const BLUE_HOME = [
  { row: 0, cols: [4] },
  { row: 1, cols: [4, 5] },
  { row: 2, cols: [4, 5, 6] },
  { row: 3, cols: [4, 5, 6, 7] },
];

// Red's goal is Blue's home, Blue's goal is Red's home
export const RED_GOAL = BLUE_HOME;
export const BLUE_GOAL = RED_HOME;

// Grid display
export const GRID_WIDTH = 42;
export const GRID_HEIGHT = 0.9 * GRID_WIDTH;
export const CIRCLE_DIAMETER = 0.78 * GRID_WIDTH;

// 6 movement directions on hex-like grid
export const DIRECTIONS = [
  { row: -1, col: 0 },   // up
  { row: 1, col: 0 },    // down
  { row: 0, col: -1 },   // left
  { row: 0, col: 1 },    // right
  { row: -1, col: -1 },  // diagonal up-left
  { row: 1, col: 1 },    // diagonal down-right
];
