// AIUtils.js — Distance metrics for AI evaluation

// Chebyshev distance on the hex-like grid.
// On this slanted grid with 6 directions (not 8), max(|dr|, |dc|) gives
// the minimum number of steps between two positions.
export function hexDistance(r1, c1, r2, c2) {
  return Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
}
