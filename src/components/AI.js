// AI.js — Unified AI module with pluggable strategies
//
// Usage:
//   import { getAIMove, AI_LEVELS, AI_LEVEL_NAMES } from './AI';
//   const move = getAIMove(occupantGrid, PLAYER_RED, 'greedy');

import { getLegalMoves } from './legalMoves';
import { hexDistance } from './AIUtils';
import { handleMoveOnGrid } from './boardUtils';
import {
  PLAYER_RED, PLAYER_BLUE,
  RED_GOAL, BLUE_GOAL,
  DIRECTIONS,
  ROW_PATTERN, START_COLUMNS,
} from './constants';

// ========== Helpers ==========

export function getAllMoves(occupantGrid, player) {
  const moves = [];
  for (let row = 0; row < occupantGrid.length; row++) {
    for (let col = 0; col < occupantGrid[row].length; col++) {
      if (occupantGrid[row][col] === player) {
        const possibleMoves = getLegalMoves(row, col, player, occupantGrid);
        if (possibleMoves.length > 0) {
          moves.push({
            from: { row, col, occupant: player },
            possibleMoves,
          });
        }
      }
    }
  }
  return moves;
}

export function getGoalPositions(player) {
  const goalDef = player === PLAYER_RED ? RED_GOAL : BLUE_GOAL;
  const positions = [];
  for (const { row, cols } of goalDef) {
    for (const col of cols) {
      positions.push({ row, col });
    }
  }
  return positions;
}

function getGoalCenter(player) {
  const positions = getGoalPositions(player);
  const avgRow = positions.reduce((s, p) => s + p.row, 0) / positions.length;
  const avgCol = positions.reduce((s, p) => s + p.col, 0) / positions.length;
  return { row: Math.round(avgRow), col: Math.round(avgCol) };
}

function forwardDirection(player) {
  return player === PLAYER_RED ? -1 : 1;
}

function flattenMoves(allMoves) {
  const flat = [];
  for (const { from, possibleMoves } of allMoves) {
    for (const move of possibleMoves) {
      flat.push({ selectedCircle: from, moveTo: { row: move.row, col: move.col } });
    }
  }
  return flat;
}

function opponent(player) {
  return player === PLAYER_RED ? PLAYER_BLUE : PLAYER_RED;
}

// ========== Valid position set (precomputed) ==========
// Used by BFS pathfinding to know which cells are walkable on the board.

const validPositionSet = new Set();
for (let r = 0; r < ROW_PATTERN.length; r++) {
  const start = START_COLUMNS[r];
  for (let i = 0; i < ROW_PATTERN[r]; i++) {
    validPositionSet.add(`${r},${start + i}`);
  }
}

function isValidPosition(row, col) {
  return validPositionSet.has(`${row},${col}`);
}

// ========== Board Evaluation ==========

// Greedy matching: assign each piece to a unique goal position minimizing total distance.
function evaluateBoard(occupantGrid, player) {
  const goalPositions = getGoalPositions(player);
  const pieces = [];

  for (let row = 0; row < occupantGrid.length; row++) {
    for (let col = 0; col < occupantGrid[row].length; col++) {
      if (occupantGrid[row][col] === player) {
        pieces.push({ row, col });
      }
    }
  }

  return greedyAssign(pieces, goalPositions);
}

// Greedy assignment: repeatedly pick the cheapest (piece, goal) pair.
// Returns total hex distance.
function greedyAssign(pieces, goalPositions) {
  const n = pieces.length;
  const costs = [];
  for (let i = 0; i < n; i++) {
    costs[i] = [];
    for (let j = 0; j < goalPositions.length; j++) {
      costs[i][j] = hexDistance(pieces[i].row, pieces[i].col, goalPositions[j].row, goalPositions[j].col);
    }
  }

  const usedGoals = new Set();
  const usedPieces = new Set();
  let totalDist = 0;

  for (let iter = 0; iter < n; iter++) {
    let bestCost = Infinity;
    let bestI = -1;
    let bestJ = -1;

    for (let i = 0; i < n; i++) {
      if (usedPieces.has(i)) continue;
      for (let j = 0; j < goalPositions.length; j++) {
        if (usedGoals.has(j)) continue;
        if (costs[i][j] < bestCost) {
          bestCost = costs[i][j];
          bestI = i;
          bestJ = j;
        }
      }
    }

    if (bestI >= 0) {
      usedPieces.add(bestI);
      usedGoals.add(bestJ);
      totalDist += bestCost;
    }
  }

  return totalDist;
}

// ========== BFS Pathfinding (for Pathfinder) ==========

// BFS shortest path from (sr, sc) to (tr, tc) on the board, treating occupied
// cells as impassable (except the source itself). Returns step count or Infinity.
function bfsDistance(sr, sc, tr, tc, occupantGrid) {
  if (sr === tr && sc === tc) return 0;

  const queue = [[sr, sc, 0]];
  const visited = new Set([`${sr},${sc}`]);

  while (queue.length > 0) {
    const [r, c, dist] = queue.shift();

    for (const dir of DIRECTIONS) {
      const nr = r + dir.row;
      const nc = c + dir.col;
      const key = `${nr},${nc}`;

      if (!isValidPosition(nr, nc)) continue;
      if (visited.has(key)) continue;

      // Can walk through empty cells only (or the target itself)
      if (occupantGrid[nr][nc] !== 0 && !(nr === tr && nc === tc)) continue;

      if (nr === tr && nc === tc) return dist + 1;

      visited.add(key);
      queue.push([nr, nc, dist + 1]);
    }
  }

  return Infinity; // unreachable
}

// Evaluate board using BFS real distances (accounts for blocking).
// Falls back to hexDistance when BFS would be too slow or position unreachable.
function evaluateBoardBFS(occupantGrid, player) {
  const goalPositions = getGoalPositions(player);
  const pieces = [];

  for (let row = 0; row < occupantGrid.length; row++) {
    for (let col = 0; col < occupantGrid[row].length; col++) {
      if (occupantGrid[row][col] === player) {
        pieces.push({ row, col });
      }
    }
  }

  // Build cost matrix using BFS distances
  const n = pieces.length;
  const costs = [];
  for (let i = 0; i < n; i++) {
    costs[i] = [];
    for (let j = 0; j < goalPositions.length; j++) {
      const bfs = bfsDistance(pieces[i].row, pieces[i].col, goalPositions[j].row, goalPositions[j].col, occupantGrid);
      // Use BFS if reachable, otherwise fallback to hex * penalty
      costs[i][j] = bfs < Infinity ? bfs : hexDistance(pieces[i].row, pieces[i].col, goalPositions[j].row, goalPositions[j].col) * 3;
    }
  }

  // Greedy assignment on BFS costs
  const usedGoals = new Set();
  const usedPieces = new Set();
  let totalDist = 0;

  for (let iter = 0; iter < n; iter++) {
    let bestCost = Infinity;
    let bestI = -1;
    let bestJ = -1;

    for (let i = 0; i < n; i++) {
      if (usedPieces.has(i)) continue;
      for (let j = 0; j < goalPositions.length; j++) {
        if (usedGoals.has(j)) continue;
        if (costs[i][j] < bestCost) {
          bestCost = costs[i][j];
          bestI = i;
          bestJ = j;
        }
      }
    }

    if (bestI >= 0) {
      usedPieces.add(bestI);
      usedGoals.add(bestJ);
      totalDist += bestCost;
    }
  }

  return totalDist;
}

// ========== Strategies ==========

// --- Random ---
function randomStrategy(occupantGrid, player) {
  const allMoves = getAllMoves(occupantGrid, player);
  if (allMoves.length === 0) return null;
  const flat = flattenMoves(allMoves);
  return flat[Math.floor(Math.random() * flat.length)];
}

// --- Greedy ---
// When no forward row progress is available, falls back to positional evaluation
// to avoid oscillation between equally-scored lateral moves.
function greedyStrategy(occupantGrid, player) {
  const allMoves = getAllMoves(occupantGrid, player);
  if (allMoves.length === 0) return null;

  const dir = forwardDirection(player);
  const goalCenter = getGoalCenter(player);

  let bestMove = null;
  let bestRowDiff = -Infinity;

  for (const { from, possibleMoves } of allMoves) {
    for (const move of possibleMoves) {
      const rowDiff = (move.row - from.row) * dir;

      if (rowDiff > bestRowDiff) {
        bestRowDiff = rowDiff;
        bestMove = { selectedCircle: from, moveTo: { row: move.row, col: move.col } };
      } else if (rowDiff === bestRowDiff && bestMove) {
        const fromDistToGoal = (from.row - goalCenter.row) * dir;
        const bestFromDistToGoal = (bestMove.selectedCircle.row - goalCenter.row) * dir;

        if (fromDistToGoal > bestFromDistToGoal) {
          bestMove = { selectedCircle: from, moveTo: { row: move.row, col: move.col } };
        } else if (fromDistToGoal === bestFromDistToGoal) {
          const currentDist = hexDistance(bestMove.moveTo.row, bestMove.moveTo.col, goalCenter.row, goalCenter.col);
          const newDist = hexDistance(move.row, move.col, goalCenter.row, goalCenter.col);
          if (newDist < currentDist) {
            bestMove = { selectedCircle: from, moveTo: { row: move.row, col: move.col } };
          }
        }
      }
    }
  }

  // Anti-oscillation: if no forward progress found, fall back to positional eval
  // so the AI makes meaningful arrangement moves instead of bouncing laterally.
  if (bestRowDiff <= 0) {
    return positionalStrategy(occupantGrid, player);
  }

  if (!bestMove) {
    const { from, possibleMoves } = allMoves[0];
    bestMove = { selectedCircle: from, moveTo: possibleMoves[0] };
  }

  return bestMove;
}

// --- Positional ---
function positionalStrategy(occupantGrid, player) {
  const allMoves = getAllMoves(occupantGrid, player);
  if (allMoves.length === 0) return null;

  const flat = flattenMoves(allMoves);
  let bestMove = null;
  let bestScore = Infinity;

  for (const move of flat) {
    const newGrid = handleMoveOnGrid(occupantGrid, move.selectedCircle, move.moveTo.row, move.moveTo.col);
    const score = evaluateBoard(newGrid, player);
    const jitter = Math.random() * 0.01;

    if (score + jitter < bestScore) {
      bestScore = score + jitter;
      bestMove = move;
    }
  }

  return bestMove;
}

// --- Pathfinder ---
// Like positional but uses BFS real distances that account for blocking.
function pathfinderStrategy(occupantGrid, player) {
  const allMoves = getAllMoves(occupantGrid, player);
  if (allMoves.length === 0) return null;

  const flat = flattenMoves(allMoves);

  // Pre-filter: only evaluate the top candidates by positional score to keep BFS tractable.
  // Score all moves with cheap hex evaluation first.
  const scored = flat.map((move) => {
    const newGrid = handleMoveOnGrid(occupantGrid, move.selectedCircle, move.moveTo.row, move.moveTo.col);
    return { move, hexScore: evaluateBoard(newGrid, player) };
  });
  scored.sort((a, b) => a.hexScore - b.hexScore);

  // Take top 15 candidates (or all if fewer) for expensive BFS evaluation
  const topK = Math.min(15, scored.length);
  let bestMove = null;
  let bestScore = Infinity;

  for (let i = 0; i < topK; i++) {
    const { move } = scored[i];
    const newGrid = handleMoveOnGrid(occupantGrid, move.selectedCircle, move.moveTo.row, move.moveTo.col);
    const score = evaluateBoardBFS(newGrid, player);
    const jitter = Math.random() * 0.001;

    if (score + jitter < bestScore) {
      bestScore = score + jitter;
      bestMove = move;
    }
  }

  return bestMove;
}

// --- Minimax ---
// Depth-2 search with top-K move pruning and alpha-beta.
// Looks at: my move → opponent's best response → evaluate.
function minimaxStrategy(occupantGrid, player) {
  const allMoves = getAllMoves(occupantGrid, player);
  if (allMoves.length === 0) return null;

  const flat = flattenMoves(allMoves);
  const opp = opponent(player);

  // Pre-score with positional eval, take top-K for deeper search
  const scored = flat.map((move) => {
    const newGrid = handleMoveOnGrid(occupantGrid, move.selectedCircle, move.moveTo.row, move.moveTo.col);
    return { move, hexScore: evaluateBoard(newGrid, player) };
  });
  scored.sort((a, b) => a.hexScore - b.hexScore);

  const topK = Math.min(8, scored.length);
  let bestMove = null;
  let alpha = -Infinity; // best score we can guarantee (we want to MINIMIZE our distance, MAXIMIZE opponent's)

  for (let i = 0; i < topK; i++) {
    const { move } = scored[i];
    const afterMyMove = handleMoveOnGrid(occupantGrid, move.selectedCircle, move.moveTo.row, move.moveTo.col);

    // Opponent's turn: they try to minimize THEIR distance (= hurt us)
    // We evaluate from our perspective: myScore - oppScore (higher = better for us)
    const oppMoves = getAllMoves(afterMyMove, opp);
    const oppFlat = flattenMoves(oppMoves);

    // Opponent picks their best move (minimizes their distance)
    let worstCaseForUs = Infinity; // net eval after opponent's best reply

    if (oppFlat.length === 0) {
      // Opponent has no moves — great for us
      const myDist = evaluateBoard(afterMyMove, player);
      const oppDist = evaluateBoard(afterMyMove, opp);
      worstCaseForUs = myDist - oppDist;
    } else {
      // Evaluate top opponent responses
      const oppScored = oppFlat.map((oppMove) => {
        const afterOppMove = handleMoveOnGrid(afterMyMove, oppMove.selectedCircle, oppMove.moveTo.row, oppMove.moveTo.col);
        return { oppMove, oppHexScore: evaluateBoard(afterOppMove, opp) };
      });
      oppScored.sort((a, b) => a.oppHexScore - b.oppHexScore);

      const oppTopK = Math.min(6, oppScored.length);

      for (let j = 0; j < oppTopK; j++) {
        const afterOppMove = handleMoveOnGrid(afterMyMove, oppScored[j].oppMove.selectedCircle, oppScored[j].oppMove.moveTo.row, oppScored[j].oppMove.moveTo.col);
        const myDist = evaluateBoard(afterOppMove, player);
        const oppDist = evaluateBoard(afterOppMove, opp);
        const netEval = myDist - oppDist; // lower = better for us

        if (netEval < worstCaseForUs) {
          worstCaseForUs = netEval;
        }

        // Alpha-beta: if opponent already found a response that's worse for us
        // than our current best option, stop searching this branch
        if (worstCaseForUs <= alpha) break;
      }
    }

    // We want to MAXIMIZE our worst-case net eval
    // (i.e., minimize the gap where net = myDist - oppDist, lower is better for us,
    //  so we want the move where the opponent's best reply still leaves us best off)
    // Actually: we want min(myDist) relative to opponent. Since lower myDist is better,
    // and worstCaseForUs = myDist - oppDist, we want to MINIMIZE worstCaseForUs.
    // But wait — opponent picks THEIR best move which hurts us most.
    // So for each of our moves, worstCaseForUs is the NET score after opponent's best response.
    // We pick OUR move that minimizes this worst case.

    const jitter = Math.random() * 0.001;
    if (worstCaseForUs + jitter < alpha || bestMove === null) {
      alpha = worstCaseForUs;
      bestMove = move;
    }
  }

  return bestMove;
}

// --- Beam Search ---
// Combines multi-turn lookahead with adversarial awareness.
//
// Strategy: For each candidate first move, simulate a short sequence of
// alternating (our move, opponent response) pairs. Aggregate the best
// achievable score across all continuations for each first move.
// Pick the first move with the best worst-case future.
//
// This discovers chain-jump setups that single-move evaluation misses:
// "move A sideways now → opponent moves → jump B over A next turn"
function beamSearchStrategy(occupantGrid, player) {
  const allMoves = getAllMoves(occupantGrid, player);
  if (allMoves.length === 0) return null;

  const opp = opponent(player);
  const flat = flattenMoves(allMoves);

  // Phase 1: Score all first moves with positional eval
  const firstMoveScored = flat.map((move) => {
    const newGrid = handleMoveOnGrid(occupantGrid, move.selectedCircle, move.moveTo.row, move.moveTo.col);
    const myDist = evaluateBoard(newGrid, player);
    const oppDist = evaluateBoard(newGrid, opp);
    return { move, grid: newGrid, score: myDist - oppDist, myDist };
  });
  firstMoveScored.sort((a, b) => a.score - b.score);

  // Take top 10 first moves for deeper search
  const topFirst = firstMoveScored.slice(0, Math.min(10, firstMoveScored.length));

  // Phase 2: For each first move, simulate 2 more rounds (our move + opp response)
  // and find the best achievable score after 3 of our moves
  let bestMove = null;
  let bestScore = Infinity;

  for (const first of topFirst) {
    // Round 1: opponent responds to our first move
    const oppReply1 = quickOppResponse(first.grid, opp);
    const afterOpp1 = oppReply1
      ? handleMoveOnGrid(first.grid, oppReply1.selectedCircle, oppReply1.moveTo.row, oppReply1.moveTo.col)
      : first.grid;

    // Round 2: our second move (pick top 5)
    const round2Moves = getAllMoves(afterOpp1, player);
    const round2Flat = flattenMoves(round2Moves);
    const round2Scored = round2Flat.map((m) => {
      const g = handleMoveOnGrid(afterOpp1, m.selectedCircle, m.moveTo.row, m.moveTo.col);
      return { grid: g, myDist: evaluateBoard(g, player) };
    });
    round2Scored.sort((a, b) => a.myDist - b.myDist);
    const topRound2 = round2Scored.slice(0, Math.min(5, round2Scored.length));

    // Round 2: opponent responds, then our third move
    let bestFuture = Infinity;
    for (const r2 of topRound2) {
      const oppReply2 = quickOppResponse(r2.grid, opp);
      const afterOpp2 = oppReply2
        ? handleMoveOnGrid(r2.grid, oppReply2.selectedCircle, oppReply2.moveTo.row, oppReply2.moveTo.col)
        : r2.grid;

      // Round 3: our third move (just pick the best one)
      const round3Moves = getAllMoves(afterOpp2, player);
      const round3Flat = flattenMoves(round3Moves);
      let bestR3 = Infinity;
      for (const m of round3Flat) {
        const g = handleMoveOnGrid(afterOpp2, m.selectedCircle, m.moveTo.row, m.moveTo.col);
        const dist = evaluateBoard(g, player);
        if (dist < bestR3) bestR3 = dist;
      }
      if (round3Flat.length === 0) bestR3 = evaluateBoard(afterOpp2, player);

      if (bestR3 < bestFuture) bestFuture = bestR3;
    }

    // Combine: weight immediate score (70%) + future potential (30%)
    // This prevents sacrificing the present for a speculative future
    const combinedScore = 0.7 * first.myDist + 0.3 * bestFuture;
    const jitter = Math.random() * 0.01;

    if (combinedScore + jitter < bestScore) {
      bestScore = combinedScore + jitter;
      bestMove = first.move;
    }
  }

  return bestMove || flat[0];
}

// Quick opponent response for beam search simulation.
// Uses positional eval to pick opponent's best single move.
function quickOppResponse(occupantGrid, oppPlayer) {
  const moves = getAllMoves(occupantGrid, oppPlayer);
  if (moves.length === 0) return null;

  const flat = flattenMoves(moves);
  let bestMove = null;
  let bestScore = Infinity;

  for (const move of flat) {
    const newGrid = handleMoveOnGrid(occupantGrid, move.selectedCircle, move.moveTo.row, move.moveTo.col);
    const score = evaluateBoard(newGrid, oppPlayer);
    if (score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// ========== Registry ==========

const strategies = {
  random: randomStrategy,
  greedy: greedyStrategy,
  positional: positionalStrategy,
  pathfinder: pathfinderStrategy,
  minimax: minimaxStrategy,
  beam: beamSearchStrategy,
};

export const AI_LEVELS = Object.keys(strategies);

export const AI_LEVEL_NAMES = {
  random: 'Random',
  greedy: 'Greedy',
  positional: 'Positional',
  pathfinder: 'Pathfinder',
  minimax: 'Minimax',
  beam: 'Beam Search',
};

// Main entry point
export function getAIMove(occupantGrid, player, level = 'greedy') {
  const strategy = strategies[level];
  if (!strategy) {
    console.error(`Unknown AI level: ${level}. Available: ${AI_LEVELS.join(', ')}`);
    return null;
  }
  return strategy(occupantGrid, player);
}
