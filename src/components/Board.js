import React, { useState, useEffect } from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import './board.css';
import { generateOccupantGrid, generateBoard, generateBoardFromString, getBoardString, handleMoveOnGrid, checkWinner } from './boardUtils';
import { getLegalMoves } from './legalMoves';
import BoardStringInput from './BoardStringInput'; 
import Grid from './Grid';
import CongratulationsPopup from './CongratulationsPopup';
import { BlueAI } from './BlueAI'; 
 
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
  const [turn, setTurn] = useState(1); 
  const [boardString, setBoardString] = useState(''); 
  const [openDialog, setOpenDialog] = useState(false); 
  const [winner, setWinner] = useState(null); 
  const [blueAIEnabled, setBlueAIEnabled] = useState(false); // State for Blue-AI toggle

  const grid = generateBoard(rowPattern, startColumns);

  const goodSound = new Audio('/media/good.mp3');
  const badSound = new Audio('/media/bad.mp3');

  const handleCircleSelect = (rowIndex, colIndex) => {
    const occupant = occupantGrid[rowIndex][colIndex];
  
    if (selectedCircle && selectedCircle.row === rowIndex && selectedCircle.col === colIndex) {
      setSelectedCircle(null);
      setLegalMoves([]);
      return;
    }
  
    if (occupant === 0 || occupant !== turn) { 
      badSound.play();
      setSelectedCircle({ row: rowIndex, col: colIndex, occupant });
      setLegalMoves([]); 
      return;
    }

    goodSound.play();
    setSelectedCircle({ row: rowIndex, col: colIndex, occupant });
    const moves = getLegalMoves(rowIndex, colIndex, occupant, occupantGrid);
    setLegalMoves(moves);
  };
  
  const resetBoard = () => {
    const initialGrid = generateOccupantGrid(rows, cols); 
    setOccupantGrid(initialGrid);
    setSelectedCircle(null);
    setLegalMoves([]);
    setTurn(1); 
    setWinner(null); 
  };

  const handleMove = (rowIndex, colIndex) => {
    if (!legalMoves.some((move) => move.row === rowIndex && move.col === colIndex)) return;

    const newGrid = handleMoveOnGrid(occupantGrid, selectedCircle, rowIndex, colIndex);

    goodSound.play();
    setOccupantGrid(newGrid);
    setSelectedCircle(null);
    setLegalMoves([]);
    setTurn(turn === 1 ? 2 : 1); 

    if (checkWinner(newGrid, turn)) {
      setWinner(turn); 
      setOpenDialog(true); 
    }
  };


  useEffect(() => {
    if (blueAIEnabled && turn === 2) { // Blue-AI only plays on the blue player's turn
      const aiMove = BlueAI(occupantGrid); // Get AI move
      if (aiMove) {
        // Log the AI move
        console.log("AI move selected:", aiMove);
  
        // Pass the selectedCircle and the destination row and col
        const newGrid = handleMoveOnGrid(occupantGrid, aiMove.selectedCircle, aiMove.moveTo.row, aiMove.moveTo.col);
  
        goodSound.play();
        setOccupantGrid(newGrid); // Update the grid
        setSelectedCircle(aiMove.selectedCircle); // Set the selected circle to the AI's selected circle
        setLegalMoves([]); // Clear legal moves
        setTurn(1); // Switch turn to player 1
  
        if (checkWinner(newGrid, 2)) { // Check if Blue wins
          setWinner(2);
          setOpenDialog(true);
        }
      }
    }
  }, [blueAIEnabled, turn, occupantGrid]);
  
  
  

  const backgroundColor = turn === 1 ? '#600000' : '#000d2b';

  const handleBoardStringChange = (event) => {
    setBoardString(event.target.value);
  };

  const getBoardStringValue = () => {
    const gridString = getBoardString(occupantGrid);
    setBoardString(gridString); 
  };

  const loadBoardFromString = () => {
    const loadedGrid = generateBoardFromString(boardString);
    setOccupantGrid(loadedGrid);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div className="background-layer" style={{ backgroundColor }}></div>
      <div className="board-layer">
        <div className="board">
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
            aiMove={blueAIEnabled && turn === 2 ? BlueAI(occupantGrid) : null}
          />
          {selectedCircle && (
            <div className="selection-info">
              Row: {selectedCircle.row} Col: {selectedCircle.col}
            </div>
          )}
        </div>
        <BoardStringInput
          boardString={boardString}
          handleBoardStringChange={handleBoardStringChange}
          getBoardStringValue={getBoardStringValue}
          loadBoardFromString={loadBoardFromString}
          resetBoard={resetBoard}
        />
      </div>

      <FormControlLabel
        control={
          <Switch
            checked={blueAIEnabled}
            onChange={() => setBlueAIEnabled((prev) => !prev)}
            name="BlueAI"
            color="primary"
          />
        }
        label="Blue-AI"
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
        }}
      />

      <CongratulationsPopup 
        open={winner !== null} 
        winner={winner} 
        onClose={() => setWinner(null)} 
        onReset={resetBoard} 
      />
    </div>
  );
};

export default Board;
