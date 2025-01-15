const boundarySet = new Set([
  '0,3', '0,5', '1,3', '1,6', '2,3', '2,7', '3,3', '3,8',
  '4,-1', '4,13', '5,0', '5,13', '6,1', '6,13', '7,2', '7,13',
  '8,3', '8,13', '9,3', '9,14', '10,3', '10,15', '11,3', '11,16',
  '12,3', '12,17', '13,8', '13,18', '14,9', '14,13', '15,10', '15,13',
  '16,11', '16,13'
]);

export function getLegalMoves(row, col, occupant, grid) {
  const legalMoves = [];
  const directions = [
    { row: -1, col: 0 }, 
    { row: 1, col: 0 }, 
    { row: 0, col: -1 },
    { row: 0, col: 1 },  
    { row: -1, col: -1 }, 
    { row: 1, col: 1 },  
  ];

  // Helper function to perform BFS for multi-jumping
  const bfsJump = (startRow, startCol, occupant) => {
    const queue = [{ row: startRow, col: startCol }];
    const visited = new Set([`${startRow},${startCol}`]);
    const validJumps = [];

    while (queue.length > 0) {
      const { row, col } = queue.shift();

      directions.forEach((direction) => {
        let currentRow = row + direction.row;
        let currentCol = col + direction.col;
        const occupancyArray = [{ occupant, row, col }];

        while (currentRow >= 0 && currentRow < grid.length && currentCol >= 0 && currentCol < grid[0].length) {
          const occupantAtCurrent = grid[currentRow][currentCol];
          if (boundarySet.has(`${currentRow},${currentCol}`)) break;
          occupancyArray.push({ occupant: occupantAtCurrent, row: currentRow, col: currentCol });
          currentRow += direction.row;
          currentCol += direction.col;
        }

        let secondNonZeroIndex = -1;
        for (let i = 1; i < occupancyArray.length; i++) {
          if (occupancyArray[i].occupant !== 0) {
            secondNonZeroIndex = i;
            break;
          }
        }

        if (secondNonZeroIndex !== -1) {
          const mirroredIndex = secondNonZeroIndex * 2;
          if (mirroredIndex < occupancyArray.length) {
            const mirroredRow = occupancyArray[mirroredIndex].row;
            const mirroredCol = occupancyArray[mirroredIndex].col;
            if (mirroredRow >= 0 && mirroredRow < grid.length && mirroredCol >= 0 && mirroredCol < grid[0].length &&
                !boundarySet.has(`${mirroredRow},${mirroredCol}`) && grid[mirroredRow][mirroredCol] === 0) {
              let isValidJump = true;
              for (let i = secondNonZeroIndex + 1; i < mirroredIndex; i++) {
                if (occupancyArray[i].occupant !== 0) {
                  isValidJump = false;
                  break;
                }
              }
              if (isValidJump && !visited.has(`${mirroredRow},${mirroredCol}`)) {
                validJumps.push({ row: mirroredRow, col: mirroredCol });
                visited.add(`${mirroredRow},${mirroredCol}`);
                queue.push({ row: mirroredRow, col: mirroredCol });
              }
            }
          }
        }
      });
    }

    return validJumps;
  };

  // Add adjacent moves (normal moves)
  directions.forEach((direction) => {
    const adjacentRow = row + direction.row;
    const adjacentCol = col + direction.col;
    if (adjacentRow >= 0 && adjacentRow < grid.length && adjacentCol >= 0 && adjacentCol < grid[0].length &&
        grid[adjacentRow][adjacentCol] === 0 && !boundarySet.has(`${adjacentRow},${adjacentCol}`)) {
      legalMoves.push({ row: adjacentRow, col: adjacentCol });
    }
  });

  // Get multi-jump legal moves
  const multiJumpMoves = bfsJump(row, col, occupant);
  legalMoves.push(...multiJumpMoves);

  return legalMoves;
}
