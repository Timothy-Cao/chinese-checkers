import { DIRECTIONS } from './constants';

const boundarySet = new Set([
  '0,3', '0,5', '1,3', '1,6', '2,3', '2,7', '3,3', '3,8',
  '4,-1', '4,13', '5,0', '5,13', '6,1', '6,13', '7,2', '7,13',
  '8,3', '8,13', '9,3', '9,14', '10,3', '10,15', '11,3', '11,16',
  '12,3', '12,17', '13,8', '13,13', '14,9', '14,13', '15,10', '15,13',
  '16,11', '16,13',
  '13,14', '13,15', '13,16', '13,17', '13,4', '13,5', '13,6', '13,7',
  '3,-1', '3,0', '3,1', '3,2', '3,9', '3,10', '3,11', '3,12',
]);

function isInBounds(row, col, grid) {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

function isBlocked(row, col) {
  return boundarySet.has(`${row},${col}`);
}

export function getLegalMoves(row, col, occupant, grid) {
  const legalMoves = [];

  // Adjacent moves
  for (const dir of DIRECTIONS) {
    const nr = row + dir.row;
    const nc = col + dir.col;
    if (isInBounds(nr, nc, grid) && grid[nr][nc] === 0 && !isBlocked(nr, nc)) {
      legalMoves.push({ row: nr, col: nc });
    }
  }

  // BFS for multi-jump moves
  const queue = [{ row, col }];
  const visited = new Set([`${row},${col}`]);

  while (queue.length > 0) {
    const current = queue.shift();

    for (const dir of DIRECTIONS) {
      let cr = current.row + dir.row;
      let cc = current.col + dir.col;
      const line = [{ row: current.row, col: current.col, occupant: grid[current.row]?.[current.col] ?? occupant }];

      // Walk along this direction, collecting cells
      while (isInBounds(cr, cc, grid) && !isBlocked(cr, cc)) {
        line.push({ row: cr, col: cc, occupant: grid[cr][cc] });
        cr += dir.row;
        cc += dir.col;
      }

      // Find first occupied cell in the line (skip index 0, that's the current piece)
      let pivotIndex = -1;
      for (let i = 1; i < line.length; i++) {
        if (line[i].occupant !== 0) {
          pivotIndex = i;
          break;
        }
      }

      if (pivotIndex === -1) continue;

      // Mirror: landing spot is at 2x the pivot distance
      const mirrorIndex = pivotIndex * 2;
      if (mirrorIndex >= line.length) continue;

      const landing = line[mirrorIndex];
      if (landing.occupant !== 0) continue;

      // Verify all cells between pivot and landing are empty
      let clear = true;
      for (let i = pivotIndex + 1; i < mirrorIndex; i++) {
        if (line[i].occupant !== 0) {
          clear = false;
          break;
        }
      }

      if (clear && !visited.has(`${landing.row},${landing.col}`)) {
        visited.add(`${landing.row},${landing.col}`);
        legalMoves.push({ row: landing.row, col: landing.col });
        queue.push({ row: landing.row, col: landing.col });
      }
    }
  }

  return legalMoves;
}
