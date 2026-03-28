#!/usr/bin/env node
// simulator.mjs — Headless AI vs AI battle runner
// Usage: node scripts/simulator.mjs [games] [redLevel] [blueLevel] [maxMoves]
// Example: node scripts/simulator.mjs 1000 random greedy 200

import { generateOccupantGrid, handleMoveOnGrid, checkWinner } from '../src/components/boardUtils.js';
import { getAIMove, AI_LEVELS } from '../src/components/AI.js';
import { ROWS, COLS, PLAYER_RED, PLAYER_BLUE } from '../src/components/constants.js';

function runGame(redLevel, blueLevel, maxMoves) {
  let grid = generateOccupantGrid(ROWS, COLS);
  let turn = PLAYER_RED;
  let moves = 0;
  let skippedInARow = 0;

  while (moves < maxMoves) {
    const level = turn === PLAYER_RED ? redLevel : blueLevel;
    const aiMove = getAIMove(grid, turn, level);

    if (!aiMove) {
      // Skip turn — if both players skip consecutively, it's a stalemate
      skippedInARow++;
      if (skippedInARow >= 2) return { winner: null, moves, reason: 'stalemate' };
      turn = turn === PLAYER_RED ? PLAYER_BLUE : PLAYER_RED;
      moves++;
      continue;
    }

    skippedInARow = 0;
    grid = handleMoveOnGrid(grid, aiMove.selectedCircle, aiMove.moveTo.row, aiMove.moveTo.col);

    if (checkWinner(grid, turn)) {
      return { winner: turn, moves, reason: 'win' };
    }

    turn = turn === PLAYER_RED ? PLAYER_BLUE : PLAYER_RED;
    moves++;
  }

  return { winner: null, moves, reason: 'timeout' };
}

function simulate(n, redLevel, blueLevel, maxMoves) {
  const stats = { redWins: 0, blueWins: 0, ties: 0, totalMoves: 0, stalemates: 0 };
  const startTime = Date.now();

  for (let i = 0; i < n; i++) {
    const result = runGame(redLevel, blueLevel, maxMoves);

    if (result.winner === PLAYER_RED) stats.redWins++;
    else if (result.winner === PLAYER_BLUE) stats.blueWins++;
    else {
      stats.ties++;
      if (result.reason === 'stalemate') stats.stalemates++;
    }
    stats.totalMoves += result.moves;

    if ((i + 1) % 100 === 0 || i === n - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(`\rProgress: ${i + 1}/${n} (${elapsed}s)`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n');
  console.log(`=== ${redLevel.toUpperCase()} (Red) vs ${blueLevel.toUpperCase()} (Blue) ===`);
  console.log(`Games:      ${n}`);
  console.log(`Time:       ${elapsed}s`);
  console.log(`Red wins:   ${stats.redWins} (${(stats.redWins / n * 100).toFixed(1)}%)`);
  console.log(`Blue wins:  ${stats.blueWins} (${(stats.blueWins / n * 100).toFixed(1)}%)`);
  console.log(`Ties:       ${stats.ties} (${(stats.ties / n * 100).toFixed(1)}%)${stats.stalemates > 0 ? ` (${stats.stalemates} stalemates)` : ''}`);
  console.log(`Avg moves:  ${(stats.totalMoves / n).toFixed(1)}`);
}

// --- CLI ---
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node scripts/simulator.mjs [games] [redLevel] [blueLevel] [maxMoves]');
  console.log(`Available AI levels: ${AI_LEVELS.join(', ')}`);
  console.log('Example: node scripts/simulator.mjs 1000 random greedy 200');
  process.exit(0);
}

const n = parseInt(args[0]) || 100;
const redLevel = args[1] || 'greedy';
const blueLevel = args[2] || 'greedy';
const maxMoves = parseInt(args[3]) || 200;

// Validate levels
for (const level of [redLevel, blueLevel]) {
  if (!AI_LEVELS.includes(level)) {
    console.error(`Unknown AI level: "${level}". Available: ${AI_LEVELS.join(', ')}`);
    process.exit(1);
  }
}

console.log(`Running ${n} games: ${redLevel} (Red) vs ${blueLevel} (Blue), max ${maxMoves} moves\n`);
simulate(n, redLevel, blueLevel, maxMoves);
