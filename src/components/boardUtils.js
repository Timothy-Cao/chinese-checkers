// boardUtils.js
import { RED_HOME, BLUE_HOME, RED_GOAL, BLUE_GOAL, PLAYER_RED } from './constants';

export const generateOccupantGrid = (rows, cols) => {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

  RED_HOME.forEach(({ row, cols: colList }) => {
    colList.forEach((col) => { grid[row][col] = 1; });
  });

  BLUE_HOME.forEach(({ row, cols: colList }) => {
    colList.forEach((col) => { grid[row][col] = 2; });
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
    case 1: return 'red';
    case 2: return 'blue';
    default: return '#222222';
  }
};

export const generateBoardFromString = (boardString) => {
  if (boardString.length !== 815) return null;
  const rows = boardString.split(';');
  return rows.map((rowStr) => rowStr.split(',').map((s) => parseInt(s, 10)));
};

export const getBoardString = (occupantGrid) => {
  return occupantGrid.map((row) => row.join(',')).join(';');
};

export const handleMoveOnGrid = (occupantGrid, selectedCircle, rowIndex, colIndex) => {
  const newGrid = occupantGrid.map((row) => [...row]);
  newGrid[rowIndex][colIndex] = selectedCircle.occupant;
  newGrid[selectedCircle.row][selectedCircle.col] = 0;
  return newGrid;
};

// Build fast lookup sets for goal triangles
const redGoalSet = new Set();
for (const { row, cols } of RED_GOAL) {
  for (const col of cols) redGoalSet.add(`${row},${col}`);
}
const blueGoalSet = new Set();
for (const { row, cols } of BLUE_GOAL) {
  for (const col of cols) blueGoalSet.add(`${row},${col}`);
}

// Is this position inside the player's goal triangle?
export const isInGoalTriangle = (row, col, player) => {
  const goalSet = player === PLAYER_RED ? redGoalSet : blueGoalSet;
  return goalSet.has(`${row},${col}`);
};

export const checkWinner = (occupantGrid, currentPlayer) => {
  // Player's goal is the opponent's home
  const goalPositions = currentPlayer === PLAYER_RED ? BLUE_HOME : RED_HOME;

  for (const { row, cols } of goalPositions) {
    for (const col of cols) {
      if (occupantGrid[row][col] !== currentPlayer) {
        return false;
      }
    }
  }
  return true;
};
