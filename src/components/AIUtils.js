
// Calculate the hex distance between two points (x1, y1) and (x2, y2)
export function hexDistance(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const diagonalMoves = Math.min(dx, dy);
  const remainingMoves = Math.abs(dx - dy);
  return diagonalMoves + remainingMoves;
}

// Scoring function that calculates the "distance" between a given point and an expected line
export function scoringFunction(x, y) {
  const expectedY = 0.5 * x + 4;  // Example linear equation y = 0.5 * x + 4
  const distance = Math.abs(y - expectedY);
  return distance;
}

// Calculate the position score based on the difference between the current and target positions
export function positionScore(x1, y1, x2, y2) {
  const horizontalDistance = Math.abs(x2 - x1);
  const verticalDistance = Math.abs(y2 - y1);
  return horizontalDistance + verticalDistance;
}

// Calculate the cartesian distance between two points (x1, y1) and (x2, y2)
export function cartDistance(x1, y1, x2, y2) {
  const horizontalDistance = Math.abs(x2 - x1);
  const verticalDistance = scoringFunction(x1, y1) - scoringFunction(x2, y2);
  const totalDistance = Math.sqrt(Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2));
  return totalDistance;
}
