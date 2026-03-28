#!/usr/bin/env node
// debug-game.mjs — Run a single game with move-by-move output

import { generateOccupantGrid, handleMoveOnGrid, checkWinner } from '../src/components/boardUtils.js';
import { getAIMove } from '../src/components/AI.js';
import { ROWS, COLS, PLAYER_RED, PLAYER_BLUE } from '../src/components/constants.js';
import { isInGoalTriangle } from '../src/components/boardUtils.js';

function countInGoal(grid, player) {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === player && isInGoalTriangle(r, c, player)) {
        count++;
      }
    }
  }
  return count;
}

const redLevel = process.argv[2] || 'greedy';
const blueLevel = process.argv[3] || 'greedy';
const maxMoves = parseInt(process.argv[4]) || 100;

let grid = generateOccupantGrid(ROWS, COLS);
let turn = PLAYER_RED;

for (let i = 0; i < maxMoves; i++) {
  const level = turn === PLAYER_RED ? redLevel : blueLevel;
  const aiMove = getAIMove(grid, turn, level);
  const name = turn === PLAYER_RED ? 'Red' : 'Blue';

  if (!aiMove) {
    console.log(`Move ${i + 1}: ${name} (${level}) — NO MOVES, skip`);
    turn = turn === PLAYER_RED ? PLAYER_BLUE : PLAYER_RED;
    continue;
  }

  const { selectedCircle: from, moveTo: to } = aiMove;
  grid = handleMoveOnGrid(grid, from, to.row, to.col);

  const redInGoal = countInGoal(grid, PLAYER_RED);
  const blueInGoal = countInGoal(grid, PLAYER_BLUE);

  console.log(`Move ${i + 1}: ${name} (${level}) (${from.row},${from.col})→(${to.row},${to.col}) | Red in goal: ${redInGoal}/10, Blue in goal: ${blueInGoal}/10`);

  if (checkWinner(grid, turn)) {
    console.log(`\n${name} wins in ${i + 1} moves!`);
    process.exit(0);
  }

  turn = turn === PLAYER_RED ? PLAYER_BLUE : PLAYER_RED;
}

console.log(`\nNo winner after ${maxMoves} moves.`);
