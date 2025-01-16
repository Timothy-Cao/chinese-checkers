import { getLegalMoves } from './legalMoves';

function hexDistance(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const diagonalMoves = Math.min(dx, dy);
  const remainingMoves = Math.abs(dx - dy);
  return diagonalMoves + remainingMoves;
}

export const RedAI = (occupantGrid) => {
  const legalMoves = [];
  
  for (let row = 0; row < occupantGrid.length; row++) {
    for (let col = 0; col < occupantGrid[row].length; col++) {
      if (occupantGrid[row][col] === 1) { // Red player's pieces are marked as 1
        const possibleMoves = getLegalMoves(row, col, 1, occupantGrid);
        if (possibleMoves.length > 0) {
          legalMoves.push({
            selectedCircle: { row, col, occupant: 1 },
            possibleMoves
          });
        }
      }
    }
  }

  if (legalMoves.length === 0) return null;

  let bestMove = null;
  let bestRowDiff = -Infinity; // To pick the largest rowDiff
  const targetRow = 4; // Red AI target row
  const targetCol = 6; // Red AI target column

  // Step 1: Hardcode special priority moves for (3,5) -> (3,4) and (3,6) -> (3,7)
  for (const { selectedCircle, possibleMoves } of legalMoves) {
    for (const move of possibleMoves) {
      // Check for specific hardcoded moves first
      if ((selectedCircle.row === 3 && selectedCircle.col === 5 && move.row === 3 && move.col === 4) || 
          (selectedCircle.row === 3 && selectedCircle.col === 6 && move.row === 3 && move.col === 7)) {
        // Ensure it's a legal move before giving it priority
        bestMove = { selectedCircle, moveTo: { row: move.row, col: move.col } };
        return bestMove; // Immediately return this best move
      }
    }
  }

  // Step 2: Find the best move based on row difference
  for (const { selectedCircle, possibleMoves } of legalMoves) {
    for (const move of possibleMoves) {
      const rowDiff = - (move.row - selectedCircle.row);

      // Step 1: Prioritize best row difference
      if (rowDiff > bestRowDiff) {
        bestRowDiff = rowDiff;
        bestMove = { selectedCircle, moveTo: { row: move.row, col: move.col } };
      } 
      // Step 2: If rowDiff is tied, choose the one with the highest starting row and closest to target
      else if (rowDiff === bestRowDiff) {
        // Select the highest starting row among the contenders
        if (selectedCircle.row > bestMove.selectedCircle.row) {
          bestMove = { selectedCircle, moveTo: { row: move.row, col: move.col } };
        } 
        // If the starting row is tied, prioritize the move closest to the target
        else if (selectedCircle.row === bestMove.selectedCircle.row) {
          const currentBestDistance = hexDistance(bestMove.moveTo.row, bestMove.moveTo.col, targetRow, targetCol);
          const newDistance = hexDistance(move.row, move.col, targetRow, targetCol);

          if (newDistance < currentBestDistance) {
            bestMove = { selectedCircle, moveTo: { row: move.row, col: move.col } };
          }
        }
      }
    }
  }

  // Step 3: If no valid move has been selected, return the first move
  if (!bestMove) {
    const { selectedCircle, possibleMoves } = legalMoves[0];
    bestMove = { selectedCircle, moveTo: possibleMoves[0] };
  }

  return bestMove;
};
