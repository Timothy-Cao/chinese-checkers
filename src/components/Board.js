import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Switch, FormControlLabel, Slider, Select, MenuItem, Typography } from '@mui/material';
import './board.css';
import { generateOccupantGrid, generateBoard, generateBoardFromString, getBoardString, handleMoveOnGrid, checkWinner } from './boardUtils';
import { getLegalMoves } from './legalMoves';
import BoardStringInput from './BoardStringInput';
import Grid from './Grid';
import CongratulationsPopup from './CongratulationsPopup';
import { getAIMove, AI_LEVELS, AI_LEVEL_NAMES } from './AI';
import {
  ROWS, COLS, ROW_PATTERN, START_COLUMNS,
  GRID_WIDTH, GRID_HEIGHT, CIRCLE_DIAMETER,
  PLAYER_RED, PLAYER_BLUE,
} from './constants';

// Create audio objects once, outside component
const goodSound = new Audio('/media/good.mp3');
const badSound = new Audio('/media/bad.mp3');

const Board = () => {
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [occupantGrid, setOccupantGrid] = useState(() => generateOccupantGrid(ROWS, COLS));
  const [legalMoves, setLegalMoves] = useState([]);
  const [turn, setTurn] = useState(PLAYER_RED);
  const [boardString, setBoardString] = useState('');
  const [winner, setWinner] = useState(null);
  const [blueAIEnabled, setBlueAIEnabled] = useState(true);
  const [redAIEnabled, setRedAIEnabled] = useState(false);
  const [blueAILevel, setBlueAILevel] = useState('greedy');
  const [redAILevel, setRedAILevel] = useState('greedy');
  const [aiSpeed, setAiSpeed] = useState(200);

  const turnRef = useRef(turn);
  turnRef.current = turn;

  const grid = generateBoard(ROW_PATTERN, START_COLUMNS);

  const handleCircleSelect = useCallback((rowIndex, colIndex) => {
    const occupant = occupantGrid[rowIndex][colIndex];

    if (selectedCircle && selectedCircle.row === rowIndex && selectedCircle.col === colIndex) {
      setSelectedCircle(null);
      setLegalMoves([]);
      return;
    }

    if (occupant === 0 || occupant !== turnRef.current) {
      badSound.play().catch(() => {});
      setSelectedCircle({ row: rowIndex, col: colIndex, occupant });
      setLegalMoves([]);
      return;
    }

    goodSound.play().catch(() => {});
    setSelectedCircle({ row: rowIndex, col: colIndex, occupant });
    const moves = getLegalMoves(rowIndex, colIndex, occupant, occupantGrid);
    setLegalMoves(moves);
  }, [occupantGrid, selectedCircle]);

  const handleMove = useCallback((rowIndex, colIndex) => {
    if (!legalMoves.some((move) => move.row === rowIndex && move.col === colIndex)) return;

    const newGrid = handleMoveOnGrid(occupantGrid, selectedCircle, rowIndex, colIndex);

    goodSound.play().catch(() => {});
    setOccupantGrid(newGrid);
    setSelectedCircle(null);
    setLegalMoves([]);
    setTurn((prev) => (prev === PLAYER_RED ? PLAYER_BLUE : PLAYER_RED));

    if (checkWinner(newGrid, turnRef.current)) {
      setWinner(turnRef.current);
      setBlueAIEnabled(false);
      setRedAIEnabled(false);
    }
  }, [legalMoves, occupantGrid, selectedCircle]);

  // AI execution
  useEffect(() => {
    if (winner) return;

    const isAITurn =
      (blueAIEnabled && turn === PLAYER_BLUE) ||
      (redAIEnabled && turn === PLAYER_RED);

    if (!isAITurn) return;

    const timer = setTimeout(() => {
      const level = turn === PLAYER_BLUE ? blueAILevel : redAILevel;
      const aiMove = getAIMove(occupantGrid, turn, level);

      if (aiMove) {
        const newGrid = handleMoveOnGrid(occupantGrid, aiMove.selectedCircle, aiMove.moveTo.row, aiMove.moveTo.col);
        goodSound.play().catch(() => {});
        setOccupantGrid(newGrid);
        setSelectedCircle(aiMove.selectedCircle);
        setLegalMoves([]);

        if (checkWinner(newGrid, turn)) {
          setWinner(turn);
          setBlueAIEnabled(false);
          setRedAIEnabled(false);
        } else {
          setTurn((prev) => (prev === PLAYER_RED ? PLAYER_BLUE : PLAYER_RED));
        }
      } else {
        // No legal moves — skip turn
        setTurn((prev) => (prev === PLAYER_RED ? PLAYER_BLUE : PLAYER_RED));
      }
    }, aiSpeed);

    return () => clearTimeout(timer);
  }, [blueAIEnabled, redAIEnabled, blueAILevel, redAILevel, turn, occupantGrid, winner, aiSpeed]);

  const resetBoard = useCallback(() => {
    setOccupantGrid(generateOccupantGrid(ROWS, COLS));
    setSelectedCircle(null);
    setLegalMoves([]);
    setTurn(PLAYER_RED);
    setWinner(null);
  }, []);

  const backgroundColor = turn === PLAYER_RED ? '#600000' : '#000d2b';

  const handleBoardStringChange = (event) => {
    setBoardString(event.target.value);
  };

  const getBoardStringValue = () => {
    setBoardString(getBoardString(occupantGrid));
  };

  const loadBoardFromString = () => {
    const loadedGrid = generateBoardFromString(boardString);
    if (loadedGrid === null) {
      alert('Invalid board string');
      return;
    }
    setOccupantGrid(loadedGrid);
  };

  const selectSx = {
    color: 'white',
    '.MuiSelect-icon': { color: 'white' },
    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
    fontSize: '0.8rem',
    height: 32,
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
            gridWidth={GRID_WIDTH}
            gridHeight={GRID_HEIGHT}
            circleDiameter={CIRCLE_DIAMETER}
            occupantGrid={occupantGrid}
          />
        </div>
        <BoardStringInput
          boardString={boardString}
          handleBoardStringChange={handleBoardStringChange}
          getBoardStringValue={getBoardStringValue}
          loadBoardFromString={loadBoardFromString}
          resetBoard={resetBoard}
        />
      </div>

      {/* AI Control Panel */}
      <div className="ai-controls">
        {/* Blue AI */}
        <div className="ai-player-row">
          <FormControlLabel
            control={
              <Switch
                checked={blueAIEnabled}
                onChange={() => setBlueAIEnabled((prev) => !prev)}
                size="small"
                sx={{ '& .MuiSwitch-track': { backgroundColor: 'white' } }}
                color="primary"
              />
            }
            label={<Typography sx={{ color: 'white', fontSize: '0.85rem' }}>Blue AI</Typography>}
            sx={{ mr: 0 }}
          />
          {blueAIEnabled && (
            <Select
              value={blueAILevel}
              onChange={(e) => setBlueAILevel(e.target.value)}
              size="small"
              sx={selectSx}
            >
              {AI_LEVELS.map((lvl) => (
                <MenuItem key={lvl} value={lvl}>{AI_LEVEL_NAMES[lvl]}</MenuItem>
              ))}
            </Select>
          )}
        </div>

        {/* Red AI */}
        <div className="ai-player-row">
          <FormControlLabel
            control={
              <Switch
                checked={redAIEnabled}
                onChange={() => setRedAIEnabled((prev) => !prev)}
                size="small"
                sx={{ '& .MuiSwitch-track': { backgroundColor: 'white' } }}
                color="primary"
              />
            }
            label={<Typography sx={{ color: 'white', fontSize: '0.85rem' }}>Red AI</Typography>}
            sx={{ mr: 0 }}
          />
          {redAIEnabled && (
            <Select
              value={redAILevel}
              onChange={(e) => setRedAILevel(e.target.value)}
              size="small"
              sx={selectSx}
            >
              {AI_LEVELS.map((lvl) => (
                <MenuItem key={lvl} value={lvl}>{AI_LEVEL_NAMES[lvl]}</MenuItem>
              ))}
            </Select>
          )}
        </div>

        {/* Speed slider — only when at least one AI enabled */}
        {(blueAIEnabled || redAIEnabled) && (
          <div className="ai-speed-control">
            <Typography sx={{ color: 'white', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              Speed
            </Typography>
            <Slider
              value={aiSpeed}
              onChange={(_, val) => setAiSpeed(val)}
              min={100}
              max={1000}
              step={50}
              size="small"
              sx={{
                width: 100,
                color: 'white',
                '& .MuiSlider-thumb': { width: 12, height: 12 },
              }}
            />
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
              {aiSpeed}ms
            </Typography>
          </div>
        )}
      </div>

      <CongratulationsPopup
        open={winner !== null}
        winner={winner}
        onClose={() => setWinner(null)}
        onReset={resetBoard}
      />
      {selectedCircle && (
        <div className="selection-info">
          Row: {selectedCircle.row} Col: {selectedCircle.col}
        </div>
      )}
    </div>
  );
};

export default Board;
