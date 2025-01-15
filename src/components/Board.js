import React, { useState } from 'react';
import './board.css';
import { getLegalMoves } from './legalMoves'; // Import the legal moves logic

const Board = () => {
  const gridWidth = 50;
  const gridHeight = 0.9 * gridWidth;
  const circleDiameter = 0.8 * gridWidth;
  const rows = 17;
  const cols = 24;

  const rowPattern = [1, 2, 3, 4, 13, 12, 11, 10, 9, 10, 11, 12, 13, 4, 3, 2, 1];
  const startColumns = [4, 4, 4, 4, 0, 1, 2, 3, 4, 4, 4, 4, 4, 9, 10, 11, 12];

  const [selectedCircle, setSelectedCircle] = useState(null);
  const [occupantGrid, setOccupantGrid] = useState(generateOccupantGrid());
  const [legalMoves, setLegalMoves] = useState([]);
  const [turn, setTurn] = useState(1); // 1 = Red, 2 = Blue

  function generateOccupantGrid() {
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
  }

  const generateBoard = () => {
    const board = [];

    for (let row = 0; row < rows; row++) {
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

  const grid = generateBoard();

  const handleCircleSelect = (rowIndex, colIndex) => {
    const occupant = occupantGrid[rowIndex][colIndex];

    if (occupant === 0 || occupant !== turn) return; // Only selectable if it has an occupant and it's the player's turn

    setSelectedCircle({ row: rowIndex, col: colIndex, occupant });
    const moves = getLegalMoves(rowIndex, colIndex, occupant, occupantGrid);
    setLegalMoves(moves);
  };

  const handleMove = (rowIndex, colIndex) => {
    if (!legalMoves.some((move) => move.row === rowIndex && move.col === colIndex)) return;

    const newGrid = occupantGrid.map((row) => [...row]); // Clone the grid
    newGrid[rowIndex][colIndex] = selectedCircle.occupant; // Move occupant
    newGrid[selectedCircle.row][selectedCircle.col] = 0; // Clear previous position

    setOccupantGrid(newGrid);
    setSelectedCircle(null);
    setLegalMoves([]);

    // Switch turns after the move
    setTurn(turn === 1 ? 2 : 1);
  };

  const getCircleColor = (occupant) => {
    switch (occupant) {
      case 1:
        return 'red';
      case 2:
        return 'blue';
      default:
        return 'gray';
    }
  };

  const isLegalMove = (row, col) =>
    legalMoves.some((move) => move.row === row && move.col === col);

  // Set background color based on whose turn it is
  const backgroundColor = turn === 1 ? 'lightcoral' : 'lightblue';

  return (
    <div className="board" style={{ backgroundColor }}>
      {grid.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((colIndex) => (
            <div
              className="cell"
              key={colIndex}
              style={{ width: gridWidth, height: gridHeight }}
              onClick={() =>
                selectedCircle && isLegalMove(rowIndex, colIndex)
                  ? handleMove(rowIndex, colIndex)
                  : handleCircleSelect(rowIndex, colIndex)
              }
            >
              <div
                className={`circle ${
                  isLegalMove(rowIndex, colIndex) ? 'legal-move' : ''
                } ${
                  selectedCircle &&
                  selectedCircle.row === rowIndex &&
                  selectedCircle.col === colIndex
                    ? 'glow'
                    : ''
                }`}
                style={{
                  width: circleDiameter,
                  height: circleDiameter,
                  backgroundColor: getCircleColor(occupantGrid[rowIndex][colIndex]),
                }}
              />
            </div>
          ))}
        </div>
      ))}
      {selectedCircle && (
        <div className="selection-info">
          Row: {selectedCircle.row} Col: {selectedCircle.col}
        </div>
      )}
    </div>
  );
};

export default Board;
