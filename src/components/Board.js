import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Switch, FormControlLabel, Slider, Select, MenuItem, Typography } from '@mui/material';
import './board.css';
import './Title.css';
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
  const [showDebug, setShowDebug] = useState(false);
  const [showRules, setShowRules] = useState(false);

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

  const turnColor = turn === PLAYER_RED ? 'red' : 'blue';
  const turnLabel = turn === PLAYER_RED ? "Red's Turn" : "Blue's Turn";

  const selectSx = {
    color: 'rgba(255,255,255,0.8)',
    '.MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
    fontSize: '0.75rem',
    height: 30,
  };

  const switchSx = {
    '& .MuiSwitch-track': { backgroundColor: 'rgba(255,255,255,0.2)' },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: turnColor === 'red' ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)',
    },
  };

  return (
    <div className="page">
      {/* Top Bar: Title left, AI Controls right */}
      <div className="top-bar">
        <div className="title-section">
          <h1 className="main-title">
            Chinese Checkers
            <button className="rules-toggle-button" onClick={() => setShowRules(true)}>?</button>
          </h1>
          <p className="subtitle">Long Jump Variation</p>
          <Link to="/strategy" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', marginTop: 2, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>Strategy Analysis →</Link>
        </div>

        <div className="ai-controls glass-card">
          <div className="ai-player-row">
            <FormControlLabel
              control={
                <Switch
                  checked={blueAIEnabled}
                  onChange={() => setBlueAIEnabled((prev) => !prev)}
                  size="small"
                  sx={switchSx}
                />
              }
              label={<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontFamily: 'inherit' }}>Blue AI</Typography>}
              sx={{ mr: 0 }}
            />
            {blueAIEnabled && (
              <Select value={blueAILevel} onChange={(e) => setBlueAILevel(e.target.value)} size="small" sx={selectSx}>
                {AI_LEVELS.map((lvl) => (
                  <MenuItem key={lvl} value={lvl}>{AI_LEVEL_NAMES[lvl]}</MenuItem>
                ))}
              </Select>
            )}
          </div>

          <div className="ai-player-row">
            <FormControlLabel
              control={
                <Switch
                  checked={redAIEnabled}
                  onChange={() => setRedAIEnabled((prev) => !prev)}
                  size="small"
                  sx={switchSx}
                />
              }
              label={<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontFamily: 'inherit' }}>Red AI</Typography>}
              sx={{ mr: 0 }}
            />
            {redAIEnabled && (
              <Select value={redAILevel} onChange={(e) => setRedAILevel(e.target.value)} size="small" sx={selectSx}>
                {AI_LEVELS.map((lvl) => (
                  <MenuItem key={lvl} value={lvl}>{AI_LEVEL_NAMES[lvl]}</MenuItem>
                ))}
              </Select>
            )}
          </div>

          {(blueAIEnabled || redAIEnabled) && (
            <div className="ai-speed-control">
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
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
                  width: 80,
                  color: 'rgba(255,255,255,0.3)',
                  '& .MuiSlider-thumb': { width: 10, height: 10, backgroundColor: 'rgba(255,255,255,0.6)' },
                  '& .MuiSlider-track': { backgroundColor: 'rgba(255,255,255,0.3)' },
                  '& .MuiSlider-rail': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              />
              <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                {aiSpeed}ms
              </Typography>
            </div>
          )}

          <button
            onClick={resetBoard}
            style={{
              marginTop: 4,
              padding: '5px 0',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: 6,
              color: 'rgba(239, 68, 68, 0.7)',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontFamily: 'inherit',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="board-area">
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
            turnColor={turnColor}
          />
        </div>

        {/* Turn Indicator */}
        <div className="turn-indicator glass-card">
          <div className={`turn-dot ${turnColor}`} />
          {turnLabel}
        </div>
      </div>

      {/* Selection Info */}
      {selectedCircle && (
        <div className="selection-info">
          Row {selectedCircle.row}, Col {selectedCircle.col}
        </div>
      )}

      {/* Debug Toggle */}
      <button className="debug-toggle" onClick={() => setShowDebug((prev) => !prev)}>
        {showDebug ? 'Hide Debug' : 'Debug'}
      </button>

      {/* Debug Panel */}
      {showDebug && (
        <div className="input-box glass-card">
          <BoardStringInput
            boardString={boardString}
            handleBoardStringChange={(e) => setBoardString(e.target.value)}
            getBoardStringValue={() => setBoardString(getBoardString(occupantGrid))}
            loadBoardFromString={() => {
              const loadedGrid = generateBoardFromString(boardString);
              if (loadedGrid === null) { alert('Invalid board string'); return; }
              setOccupantGrid(loadedGrid);
            }}
            resetBoard={resetBoard}
          />
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="rules-modal" onClick={() => setShowRules(false)}>
          <div className="rules-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowRules(false)}>✕</button>
            <h2>How to Play</h2>
            <p><strong>Goal:</strong> Move all of your pieces across the board to the opposite triangle — the one your opponent started in.</p>
            <p><strong>On each turn</strong>, move one piece:</p>
            <ul>
              <li>Step to an adjacent empty spot.</li>
              <li>Jump over a pawn in a straight line if there is a piece at the midpoint and the landing spot is empty.</li>
              <li>Chain any number of jumps in a single turn.</li>
            </ul>
          </div>
        </div>
      )}

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
