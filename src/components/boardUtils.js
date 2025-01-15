// boardUtils.js

export const generateOccupantGrid = (rows, cols) => {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

  const occupant1Positions = [
    { row: 13, cols: [9, 10, 11, 12] },
    { row: 14, cols: [10, 11, 12] },
    { row: 15, cols: [11, 12] },
    { row: 16, cols: [12] },
  ];
  const occupant2Positions = [
    { row: 0, cols: [4] },
    { row: 1, cols: [4, 5] },
    { row: 2, cols: [4, 5, 6] },
    { row: 3, cols: [4, 5, 6, 7] },
  ];

  occupant1Positions.forEach(({ row, cols }) => {
    cols.forEach((col) => {
      grid[row][col] = 1; // Red player
    });
  });

  occupant2Positions.forEach(({ row, cols }) => {
    cols.forEach((col) => {
      grid[row][col] = 2; // Blue player
    });
  });

  return grid;
};

export const generateBoard = (rowPattern, startColumns) => {
  const board = [];

  for (let row = 0; row < rowPattern.length; row++) {
    const circleCount = rowPattern[row];
    const startCol = startColumns[row];
    const rowCells = [];

    for (let i = 0; i < circleCount; i++) {
      rowCells.push(startCol + i);
    }

    board.push(rowCells);
  }

  return board;
};

export const getCircleColor = (occupant) => {
  switch (occupant) {
    case 1:
      return 'red';
    case 2:
      return 'blue';
    default:
      return '#222222';
  }
};

export const generateBoardFromString = (boardString) => {
  const grid = [];
  const rows = boardString.split(';');
  rows.forEach((rowStr, rowIndex) => {
    grid.push(rowStr.split(',').map((colStr) => parseInt(colStr, 10)));
  });
  return grid;
};

export const getBoardString = (occupantGrid) => {
  return occupantGrid.map(row => row.join(',')).join(';');
};

export const handleMoveOnGrid = (occupantGrid, selectedCircle, rowIndex, colIndex) => {
  const newGrid = occupantGrid.map((row) => [...row]); 
  newGrid[rowIndex][colIndex] = selectedCircle.occupant; 
  newGrid[selectedCircle.row][selectedCircle.col] = 0; 

  return newGrid;
};

export const checkWinner = (occupantGrid, currentPlayer) => {
  const occupant1Positions = [
    { row: 13, cols: [9, 10, 11, 12] },
    { row: 14, cols: [10, 11, 12] },
    { row: 15, cols: [11, 12] },
    { row: 16, cols: [12] },
  ];
  const occupant2Positions = [
    { row: 0, cols: [4] },
    { row: 1, cols: [4, 5] },
    { row: 2, cols: [4, 5, 6] },
    { row: 3, cols: [4, 5, 6, 7] },
  ];
  const positionsToCheck = currentPlayer === 1 ? occupant2Positions : occupant1Positions;

  for (const position of positionsToCheck) {
    for (const col of position.cols) {
      if (occupantGrid[position.row][col] !== currentPlayer) {
        return false; 
      }
    }
  }

  return true;  
};