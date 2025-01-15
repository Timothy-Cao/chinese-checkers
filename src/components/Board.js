import React, { useState, useEffect } from 'react';
import './board.css';
import { generateOccupantGrid, generateBoard, getCircleColor } from './boardUtils';
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
  const [occupantGrid, setOccupantGrid] = useState(generateOccupantGrid(rows, cols));
  const [legalMoves, setLegalMoves] = useState([]);
  const [turn, setTurn] = useState(1); // 1 = Red, 2 = Blue
  const [moveHistory, setMoveHistory] = useState([]); // Track move history
  const [boardString, setBoardString] = useState(''); // State for the board string input
  const grid = generateBoard(rowPattern, startColumns);

  // Handle circle selection
  const handleCircleSelect = (rowIndex, colIndex) => {
    const occupant = occupantGrid[rowIndex][colIndex];
    if (occupant === 0 || occupant !== turn) return; // Only selectable if it has an occupant and it's the player's turn
    setSelectedCircle({ row: rowIndex, col: colIndex, occupant });
    const moves = getLegalMoves(rowIndex, colIndex, occupant, occupantGrid, setMoveHistory);
    setLegalMoves(moves);
  };

  // Handle moving a circle
  const handleMove = (rowIndex, colIndex) => {
    if (!legalMoves.some((move) => move.row === rowIndex && move.col === colIndex)) return;

    const newGrid = occupantGrid.map((row) => [...row]); // Clone the grid
    newGrid[rowIndex][colIndex] = selectedCircle.occupant; // Move occupant
    newGrid[selectedCircle.row][selectedCircle.col] = 0; // Clear previous position

    setOccupantGrid(newGrid);
    setSelectedCircle(null);
    setLegalMoves([]);
    setTurn(turn === 1 ? 2 : 1); // Switch turns after the move
  };

  // Get the color of a circle based on its occupant
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

  // String to grid conversion function
  const generateBoardFromString = (boardString) => {
    const grid = [];
    const rows = boardString.split(';');
    rows.forEach((rowStr, rowIndex) => {
      grid.push(rowStr.split(',').map((colStr) => parseInt(colStr, 10)));
    });
    return grid;
  };

  // Log the occupant grid on every update
  useEffect(() => {
    console.log("Current Occupant Grid:", occupantGrid);
  }, [occupantGrid]);

  // Handle board string changes from the text field
  const handleBoardStringChange = (event) => {
    setBoardString(event.target.value);
  };

  // Example usage of string-to-grid
  const generatedBoard = generateBoardFromString(boardString);

  // Add function to log the string representation of the grid
  const logBoardString = () => {
    const gridString = occupantGrid.map(row => row.join(',')).join(';');
    console.log("Board String:", gridString);
  };

  // Add function to load the board from a string
  const loadBoardFromString = () => {
    const loadedGrid = generateBoardFromString(boardString);
    setOccupantGrid(loadedGrid);
  };

  return (
    <div>
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
        <div className="move-history">
          <h3>Move History</h3>
          <ul>
            {moveHistory.map((move, index) => (
              <li key={index}>
                {move.map((step, stepIndex) => (
                  <span key={stepIndex}>
                    [{step.row}, {step.col}]{" "}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
        {selectedCircle && (
          <div className="selection-info">
            Row: {selectedCircle.row} Col: {selectedCircle.col}
          </div>
        )}
      </div>

      {/* Bottom-left fixed text field and buttons */}
      <div className="input-box">
        <textarea
          value={boardString}
          onChange={handleBoardStringChange}
          placeholder="Enter board string"
        />
        <div className="buttons">
          <button onClick={logBoardString}>Log Board String</button>
          <button onClick={loadBoardFromString}>Load Board</button>
        </div>
      </div>
    </div>
  );
};

export default Board;
