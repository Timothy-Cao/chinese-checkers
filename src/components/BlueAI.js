import { getLegalMoves } from './legalMoves';
import { hexDistance, scoringFunction, positionScore, cartDistance } from './AIUtils';
  
/**
 * BlueAI Differences:
 * 1. Blue prefers lower rows (opposite of red).
 * 2. Blue prefers target position (12, 10) instead of (4, 6).
 * 3. Blue has special hardcoded moves: (13, 10) -> (13, 9) and (13, 11) -> (13, 12).
 * 4. Blue uses player 2 instead of player 1.
 */
export const BlueAI = (occupantGrid) => {
  const legalMoves = [];
  
  // Find all legal moves for Blue (Player 2)
  for (let row = 0; row < occupantGrid.length; row++) {
    for (let col = 0; col < occupantGrid[row].length; col++) {
      if (occupantGrid[row][col] === 2) { // Blue player's pieces are marked as 2
        const possibleMoves = getLegalMoves(row, col, 2, occupantGrid);
        if (possibleMoves.length > 0) {
          legalMoves.push({
            selectedCircle: { row, col, occupant: 2 },
            possibleMoves
          });
        }
      }
    }
  }

  if (legalMoves.length === 0) return null;

  let bestMove = null;
  let bestRowDiff = Infinity; // Blue prefers lower rows, so start with a high value
  const targetRow = 12; // Blue AI target row
  const targetCol = 10; // Blue AI target column

  // Step 1: Hardcode special priority moves for (13,10) -> (13,9) and (13,11) -> (13,12)
  for (const { selectedCircle, possibleMoves } of legalMoves) {
    for (const move of possibleMoves) {
      // Check for specific hardcoded moves first
      if ((selectedCircle.row === 13 && selectedCircle.col === 10 && move.row === 13 && move.col === 9) || 
          (selectedCircle.row === 13 && selectedCircle.col === 11 && move.row === 13 && move.col === 12)) {
        // Ensure it's a legal move before giving it priority
        bestMove = { selectedCircle, moveTo: { row: move.row, col: move.col } };
        return bestMove; // Immediately return this best move
      }
    }
  }

  // Step 2: Find the best move based on row difference
  for (const { selectedCircle, possibleMoves } of legalMoves) {
    for (const move of possibleMoves) {
      const rowDiff = -(move.row - selectedCircle.row); // Positive rowDiff for moving downward

      // Step 1: Prioritize best row difference (blue prefers lower rows)
      if (rowDiff < bestRowDiff) {
        bestRowDiff = rowDiff;
        bestMove = { selectedCircle, moveTo: { row: move.row, col: move.col } };
      } 
      // Step 2: If rowDiff is tied, choose the one with the lowest starting row and closest to target
      else if (rowDiff === bestRowDiff) {
        // Select the lowest starting row among the contenders
        if (selectedCircle.row < bestMove.selectedCircle.row) {
          bestMove = { selectedCircle, moveTo: { row: move.row, col: move.col } };
        } 
        // If the starting row is tied, prioritize the move closest to the target
        else if (selectedCircle.row === bestMove.selectedCircle.row) {
          const currentBestDistance = cartDistance(bestMove.moveTo.row, bestMove.moveTo.col, targetRow, targetCol);
          const newDistance = cartDistance(move.row, move.col, targetRow, targetCol);

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
