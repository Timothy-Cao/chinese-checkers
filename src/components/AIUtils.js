// AIUtils.js — Distance metrics for AI evaluation

// Chebyshev distance on the hex-like grid (accounts for diagonal movement)
export function hexDistance(r1, c1, r2, c2) {
  const dr = Math.abs(r2 - r1);
  const dc = Math.abs(c2 - c1);
  const diag = Math.min(dr, dc);
  const straight = Math.abs(dr - dc);
  return diag + straight;
}

// Manhattan distance (simple row + col difference)
export function manhattanDistance(r1, c1, r2, c2) {
  return Math.abs(r2 - r1) + Math.abs(c2 - c1);
}
