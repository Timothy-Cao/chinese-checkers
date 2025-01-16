import { getLegalMoves } from './legalMoves'; // Import the getLegalMoves function

// Function to calculate distance between two coordinates
function hexDistance(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const diagonalMoves = Math.min(dx, dy);
    const remainingMoves = Math.abs(dx - dy);
    return diagonalMoves + remainingMoves;
}

export const BlueAI = (occupantGrid) => {
    const legalMoves = [];
  
    // Loop through the grid to find blue pieces (represented by '2')
    for (let row = 0; row < occupantGrid.length; row++) {
      for (let col = 0; col < occupantGrid[row].length; col++) {
        if (occupantGrid[row][col] === 2) { // Blue player's piece
          // Get the legal moves for this blue piece
          const possibleMoves = getLegalMoves(row, col, 2, occupantGrid); // 2 represents the blue player
          if (possibleMoves.length > 0) { // Only add if there are valid moves
            legalMoves.push({
              selectedCircle: { row, col, occupant: 2 }, // Original position of the piece
              possibleMoves
            });
          }
        }
      }
    }
  
    // If no valid moves for any blue piece, return null
    if (legalMoves.length === 0) return null;
  
    let bestMove = null;
    let maxRowDiff = -1;
    let minDistanceToTarget = Infinity; // Initialize the minimum distance

    // Target position for tiebreaking
    const targetRow = 12;
    const targetCol = 10;

    // Iterate over the valid pieces
    for (const { selectedCircle, possibleMoves } of legalMoves) {
      // Iterate over the possible moves for each piece
      for (const move of possibleMoves) {
        const rowDiff = move.row - selectedCircle.row;

        // Check for the largest row difference or a tie-break on distance
        if (rowDiff > maxRowDiff || (rowDiff === maxRowDiff && hexDistance(move.row, move.col, targetRow, targetCol) < minDistanceToTarget)) {
          maxRowDiff = rowDiff;
          minDistanceToTarget = hexDistance(move.row, move.col, targetRow, targetCol);
          bestMove = { selectedCircle, moveTo: { row: move.row, col: move.col } };
        }
      }
    }

    return bestMove;
};
