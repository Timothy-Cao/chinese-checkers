import React, { useState, useEffect } from 'react';
import './board.css';
import { generateOccupantGrid, generateBoard, generateBoardFromString, getBoardString, handleMoveOnGrid } from './boardUtils';
import { getLegalMoves } from './legalMoves';
import BoardStringInput from './BoardStringInput'; 
import Grid from './Grid'; 

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

  const handleCircleSelect = (rowIndex, colIndex) => {
    const occupant = occupantGrid[rowIndex][colIndex];
  
    if (selectedCircle && selectedCircle.row === rowIndex && selectedCircle.col === colIndex) {
      setSelectedCircle(null);
      setLegalMoves([]);
      return;
    }
  
    if (occupant === 0 || occupant !== turn) { 
      setSelectedCircle({ row: rowIndex, col: colIndex, occupant });
      setLegalMoves([]); 
      return;
    }
  
    setSelectedCircle({ row: rowIndex, col: colIndex, occupant });
    const moves = getLegalMoves(rowIndex, colIndex, occupant, occupantGrid, setMoveHistory);
    setLegalMoves(moves);
  };
  

  const handleMove = (rowIndex, colIndex) => {
    if (!legalMoves.some((move) => move.row === rowIndex && move.col === colIndex)) return;

    const newGrid = handleMoveOnGrid(occupantGrid, selectedCircle, rowIndex, colIndex);

    setOccupantGrid(newGrid);
    setSelectedCircle(null);
    setLegalMoves([]);
    setTurn(turn === 1 ? 2 : 1); 
  };

  const backgroundColor = turn === 1 ? 'lightcoral' : 'lightblue';

  useEffect(() => {
    console.log("Current Occupant Grid:", occupantGrid);
  }, [occupantGrid]);

  const handleBoardStringChange = (event) => {
    setBoardString(event.target.value);
  };

  const generatedBoard = generateBoardFromString(boardString);

  const getBoardStringValue = () => {
    const gridString = getBoardString(occupantGrid);
    setBoardString(gridString); 
  };

  const loadBoardFromString = () => {
    const loadedGrid = generateBoardFromString(boardString);
    setOccupantGrid(loadedGrid);
  };

  return (
    <div>
      <div className="board" style={{ backgroundColor }}>
        <Grid
          grid={grid}
          selectedCircle={selectedCircle}
          legalMoves={legalMoves}
          handleCircleSelect={handleCircleSelect}
          handleMove={handleMove}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          circleDiameter={circleDiameter}
          occupantGrid={occupantGrid}
        />
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

      {/* Use the new BoardStringInput component */}
      <BoardStringInput
        boardString={boardString}
        handleBoardStringChange={handleBoardStringChange}
        getBoardStringValue={getBoardStringValue}
        loadBoardFromString={loadBoardFromString}
      />
      
    </div>
  );
};

export default Board;
