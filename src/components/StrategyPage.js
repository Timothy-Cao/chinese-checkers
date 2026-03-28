import React from 'react';
import './strategy.css';

// Win rate matrix: each cell shows row-strategy's win % against column-strategy.
// 100 games per matchup (50 as Red + 50 as Blue) to normalize first-mover advantage.
const strategies = ['Random', 'Greedy', 'Positional', 'Pathfinder', 'Minimax', 'Beam'];
// Lower triangle only (row > col). Value = row-strategy's win%.
const winMatrix = {
  '1,0': 21,  // Greedy vs Random
  '2,0': 13,  // Positional vs Random
  '2,1': 62,  // Positional vs Greedy
  '3,0': 37,  // Pathfinder vs Random
  '3,1': 51,  // Pathfinder vs Greedy
  '3,2': 43,  // Pathfinder vs Positional
  '4,0': 10,  // Minimax vs Random
  '4,1': 88,  // Minimax vs Greedy
  '4,2': 68,  // Minimax vs Positional
  '4,3': 74,  // Minimax vs Pathfinder
  '5,0': 13,  // Beam vs Random
  '5,1': 91,  // Beam vs Greedy
  '5,2': 87,  // Beam vs Positional
  '5,3': 83,  // Beam vs Pathfinder
  '5,4': 50,  // Beam vs Minimax
};

function cellColor(val) {
  if (val === null) return {};
  if (val >= 75) return { color: '#4ade80', fontWeight: 500 };
  if (val >= 60) return { color: '#86efac' };
  if (val >= 40) return { color: 'rgba(255,255,255,0.5)' };
  if (val >= 25) return { color: '#fca5a5' };
  return { color: '#ef4444', fontWeight: 500 };
}

const StrategyPage = ({ onBackToGame }) => {
  return (
    <div className="strategy-page">
      <div className="strategy-content">
        <button onClick={onBackToGame} className="back-link">← Back to Game</button>

        {/* Hero */}
        <div className="strategy-hero">
          <h1>AI Strategy Analysis</h1>
          <p className="subtitle">How six algorithms compete at Chinese Checkers — Long Jump Variation</p>
        </div>

        {/* Overview */}
        <div className="strategy-section">
          <h2>The Six Strategies</h2>
          <p>
            We built six AI strategies of increasing sophistication, from purely random play to
            adversarial search. Each makes fundamentally different assumptions about what constitutes
            a "good" move. The results reveal surprising insights about when complexity helps — and
            when it doesn't.
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Approach</th>
                <th>Speed</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Random</strong></td><td>Uniform random legal move</td><td>Instant</td><td><span className="strategy-badge badge-weak">Baseline</span></td></tr>
              <tr><td><strong>Greedy</strong></td><td>Max forward row progress</td><td>{'<'}1ms</td><td><span className="strategy-badge badge-medium">Medium</span></td></tr>
              <tr><td><strong>Positional</strong></td><td>Minimize total piece-to-goal distance</td><td>~15ms</td><td><span className="strategy-badge badge-strong">Strong</span></td></tr>
              <tr><td><strong>Pathfinder</strong></td><td>BFS real shortest paths</td><td>~700ms</td><td><span className="strategy-badge badge-strong">Strong</span></td></tr>
              <tr><td><strong>Minimax</strong></td><td>2-ply adversarial search</td><td>~90ms</td><td><span className="strategy-badge badge-strong">Strong</span></td></tr>
              <tr><td><strong>Beam Search</strong></td><td>3-round lookahead with opponent sim</td><td>~1s</td><td><span className="strategy-badge badge-best">Best</span></td></tr>
            </tbody>
          </table>
        </div>

        <hr className="section-divider" />

        {/* Strategy Deep Dives */}
        <div className="strategy-section">
          <h2>Strategy Deep Dives</h2>

          {/* Random */}
          <div className="strategy-card">
            <div className="strategy-card-header">
              <h3>Random</h3>
              <span className="strategy-badge badge-weak">Baseline</span>
            </div>
            <p>
              Picks a uniformly random legal move. No evaluation, no heuristics. This establishes
              the absolute floor — any strategy that can't consistently beat random is fundamentally broken.
            </p>
            <p>
              Random almost never wins because it makes no progress toward the goal. Most games against
              better opponents time out as draws, since random pieces wander aimlessly while the opponent
              struggles to navigate around them.
            </p>
            <div className="complexity">Complexity: O(1) decision time</div>
          </div>

          {/* Greedy */}
          <div className="strategy-card">
            <div className="strategy-card-header">
              <h3>Greedy</h3>
              <span className="strategy-badge badge-medium">Medium</span>
            </div>
            <p>
              Evaluates each move by how many rows it advances toward the goal. Red wants decreasing
              rows (moving up), Blue wants increasing rows (moving down). For each candidate move,
              compute <code>rowDiff = (destination.row - source.row) × direction</code> and pick the maximum.
            </p>
            <p>
              Tiebreakers when multiple moves have equal row progress:
            </p>
            <ul>
              <li><strong>Move the straggler</strong> — prefer moving the piece furthest from the goal, preventing bottlenecks</li>
              <li><strong>Land closer to center</strong> — among equal-distance pieces, prefer the destination with the smallest hexDistance to the goal center</li>
            </ul>
            <p>
              When no forward progress exists (<code>bestRowDiff ≤ 0</code>), Greedy falls back to the Positional
              strategy to avoid oscillation (see below).
            </p>
            <div className="complexity">Complexity: O(M) where M = total legal moves (~50-200)</div>
          </div>

          {/* Positional */}
          <div className="strategy-card">
            <div className="strategy-card-header">
              <h3>Positional</h3>
              <span className="strategy-badge badge-strong">Strong</span>
            </div>
            <p>
              The key insight: evaluate the <strong>entire board</strong>, not just one piece. For each candidate move,
              simulate the resulting board state and compute a score: the total distance from all 10 pieces
              to their optimal goal positions.
            </p>
            <p>
              The assignment problem — which piece goes to which goal slot — is solved with greedy matching:
              repeatedly assign the cheapest (piece, goal) pair until all are matched. This prevents multiple
              pieces from "competing" for the same goal position in the evaluation.
            </p>
            <p>
              Distance metric: <strong>hexDistance</strong> (Chebyshev distance on the hex grid) = <code>max(|Δrow|, |Δcol|)</code>.
              A small random jitter (0.01) breaks ties to prevent oscillation between equal-scored states.
            </p>
            <div className="complexity">Complexity: O(M × P × G) ≈ 20,000 operations per move</div>
          </div>

          {/* Pathfinder */}
          <div className="strategy-card">
            <div className="strategy-card-header">
              <h3>Pathfinder</h3>
              <span className="strategy-badge badge-strong">Strong</span>
            </div>
            <p>
              Like Positional, but replaces hexDistance with <strong>BFS shortest-path distance</strong> that respects
              actual board occupancy. A piece behind a cluster of blocking pieces will show a much higher
              cost than hexDistance alone suggests.
            </p>
            <p>
              To keep performance tractable, Pathfinder pre-filters to the <strong>top 15 candidates</strong> by
              positional (hex) score, then evaluates only those with the expensive BFS computation.
              Each BFS traverses up to 121 valid board positions.
            </p>
            <div className="insight-box">
              <p>
                <strong>Surprising result:</strong> Pathfinder barely outperforms Positional (52-47 head-to-head)
                despite being 50× slower. The Chinese Checkers board is open enough that hexDistance
                closely approximates real path distance. Blocking matters less than we expected.
              </p>
            </div>
            <div className="complexity">Complexity: O(K × P × G × V) where K=15 candidates, V=121 positions</div>
          </div>

          {/* Minimax */}
          <div className="strategy-card">
            <div className="strategy-card-header">
              <h3>Minimax</h3>
              <span className="strategy-badge badge-strong">Strong</span>
            </div>
            <p>
              The only single-move strategy that considers the <strong>opponent's response</strong>. Uses depth-2 adversarial
              search: for each of my candidate moves, simulate the board, then for each of the opponent's
              best responses, evaluate the resulting position.
            </p>
            <p>
              The algorithm picks the move that maximizes our position <em>after the opponent makes their
              best counter-move</em>. This avoids moves that look great locally but leave the opponent
              a devastating jump chain.
            </p>
            <p>
              Performance is managed with <strong>top-K pruning</strong>: only the 8 best moves (by positional score) are
              expanded at each depth. This limits the search to 8 × 6 = 48 leaf evaluations — fast enough
              for real-time play at ~90ms per decision.
            </p>
            <p>
              Evaluation at leaf nodes uses the Positional scoring function (greedy piece-to-goal assignment).
              The net score is <code>myDistance - opponentDistance</code>, capturing both offense and defense.
            </p>
            <div className="complexity">Complexity: O(K₁ × K₂ × eval) ≈ 48 board evaluations per move</div>
          </div>

          {/* Beam Search */}
          <div className="strategy-card">
            <div className="strategy-card-header">
              <h3>Beam Search</h3>
              <span className="strategy-badge badge-best">Best</span>
            </div>
            <p>
              The strongest strategy. Combines <strong>multi-turn lookahead</strong> with adversarial awareness.
              For each candidate first move, simulates 3 rounds of alternating play: our move, opponent's
              best response, our next move, opponent's response, our third move.
            </p>
            <p>
              This discovers <strong>chain-jump setups</strong> that single-move evaluation completely misses.
              For example: "move piece A sideways now (looks worse), then next turn jump piece B
              over A to leap multiple rows forward."
            </p>
            <p>
              The final score combines <strong>immediate position (70%)</strong> with <strong>best achievable future (30%)</strong>.
              This prevents sacrificing the present for speculative multi-turn plans while still rewarding
              moves that create future opportunities.
            </p>
            <p>
              Top-10 first moves are expanded, with top-5 continuations at each depth. The opponent
              simulation uses positional evaluation for speed.
            </p>
            <div className="insight-box">
              <p>
                <strong>Result:</strong> Beam Search beats every other strategy. 100% vs Greedy, 100% vs Positional,
                and ~58% vs Minimax overall. The multi-turn vision is decisive.
              </p>
            </div>
            <div className="complexity">Complexity: O(10 × 5 × 2 × eval) ≈ 100+ board evaluations per move, ~1s</div>
          </div>
        </div>

        <hr className="section-divider" />

        {/* Hex Distance Math */}
        <div className="strategy-section">
          <h2>The Distance Metric</h2>
          <p>
            The board uses a <strong>slanted Cartesian coordinate system</strong> to represent a hexagonal grid.
            Each cell has 6 neighbors — not the 4 of a standard grid or the 8 of a chess board.
          </p>

          <div className="hex-grid-visual">
            <div className="hex-cell active">↖ (-1,-1)</div>
            <div className="hex-cell active">↑ (-1, 0)</div>
            <div className="hex-cell disabled">✕</div>
            <div className="hex-cell active">← (0,-1)</div>
            <div className="hex-cell center">●</div>
            <div className="hex-cell active">→ (0,+1)</div>
            <div className="hex-cell disabled">✕</div>
            <div className="hex-cell active">↓ (+1, 0)</div>
            <div className="hex-cell active">↘ (+1,+1)</div>
          </div>

          <p>
            The critical asymmetry: <code>(-1, +1)</code> and <code>(+1, -1)</code> are <strong>not</strong> valid
            moves. This means the shortest path between two points isn't always Euclidean — it depends
            on the relative direction.
          </p>
          <p>
            The correct distance formula is <strong>Chebyshev distance</strong>:
          </p>
          <p>
            <code>hexDistance(r₁, c₁, r₂, c₂) = max(|r₂ - r₁|, |c₂ - c₁|)</code>
          </p>
          <p>
            This works because a single diagonal step <code>(-1, -1)</code> covers one unit in both row and
            column simultaneously. The number of steps needed is determined by whichever axis requires
            more travel — diagonal steps handle the shared component, and straight steps cover the remainder.
          </p>

          <div className="insight-box">
            <p>
              An equivalent formulation: <code>diag + straight</code> where <code>diag = min(|Δr|, |Δc|)</code> and <code>straight = ||Δr| - |Δc||</code>.
              The sum always equals <code>max(|Δr|, |Δc|)</code>.
            </p>
          </div>
        </div>

        <hr className="section-divider" />

        {/* The Oscillation Problem */}
        <div className="strategy-section">
          <h2>The Oscillation Problem</h2>
          <p>
            The original Greedy AI had a fatal flaw: once most pieces reached the goal triangle,
            it would bounce a single piece back and forth forever. Here's an actual game trace
            where Red has 9/10 pieces in goal:
          </p>

          <div className="trace-box">
            Move 63: Red <span className="highlight">(3,5) → (3,4)</span> | Red in goal: 9/10<br/>
            Move 65: Red <span className="highlight">(3,4) → (3,5)</span> | Red in goal: 9/10<br/>
            Move 67: Red <span className="highlight">(3,5) → (3,4)</span> | Red in goal: 9/10<br/>
            Move 69: Red <span className="highlight">(3,4) → (3,5)</span> | Red in goal: 9/10<br/>
            ... forever
          </div>

          <h3>Why it happens</h3>
          <p>
            Greedy evaluates moves by <strong>row progress only</strong>. When all pieces are near the goal,
            every candidate move has <code>rowDiff ≈ 0</code>. The tiebreakers (furthest piece, closest to center)
            are <em>symmetric</em> — moving from (3,5) to (3,4) scores identically to moving from (3,4) to (3,5)
            on the next turn. The AI is blind to the fact that it needs to arrange pieces into specific
            column positions.
          </p>

          <h3>The fix</h3>
          <p>
            When Greedy finds no forward progress (<code>bestRowDiff ≤ 0</code>), it delegates to
            the <strong>Positional strategy</strong> instead. Positional evaluates the entire board state and can
            distinguish between two arrangements that Greedy considers equal. This hybrid approach
            means Greedy plays aggressively forward when possible, then switches to intelligent
            piece-arrangement when stuck.
          </p>

          <div className="insight-box">
            <p>
              <strong>Result:</strong> Greedy went from 4% win rate vs Positional (96% ties) to 50% win rate
              with zero ties. Games that previously stalled forever now complete in ~64 moves.
            </p>
          </div>

          <h3>Do other strategies oscillate?</h3>
          <p>
            <strong>Positional</strong> — rarely. It evaluates full board state, so most lateral moves produce different
            scores. Random jitter breaks exact ties. Occasional ties (~1-3%) in benchmarks.
          </p>
          <p>
            <strong>Pathfinder</strong> — essentially never. BFS distances change when any piece moves, making symmetric
            states extremely unlikely. Zero ties in all benchmarks.
          </p>
          <p>
            <strong>Minimax</strong> — never. The opponent's response differs between states, breaking any potential
            symmetry. Zero ties in all benchmarks.
          </p>
        </div>

        <hr className="section-divider" />

        {/* Benchmark Results */}
        <div className="strategy-section">
          <h2>Benchmark Results</h2>
          <p>
            100 games per matchup (50 as each color), 200 move limit.
            Each cell shows the <strong>row strategy's win rate</strong> against the column strategy.
            Remaining percentage is ties (mostly Random matchups timing out).
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table matrix-table">
              <thead>
                <tr>
                  <th></th>
                  {strategies.map((s) => <th key={s}>{s.slice(0, 4)}</th>)}
                </tr>
              </thead>
              <tbody>
                {strategies.map((rowS, r) => (
                  <tr key={rowS}>
                    <td><strong>{rowS}</strong></td>
                    {strategies.map((colS, c) => {
                      if (r === c) return <td key={c} className="matrix-diagonal">--</td>;
                      const key = r > c ? `${r},${c}` : `${c},${r}`;
                      const raw = winMatrix[key];
                      // If row > col, raw is row's win%. If row < col, raw is col's win%, so row's is (100-raw) adjusted for ties.
                      const val = r > c ? raw : (raw !== undefined ? 100 - raw : null);
                      if (val === null) return <td key={c}>-</td>;
                      return <td key={c} style={cellColor(val)}>{val}%</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
            Read across: row beats column at the shown rate. Green = dominant, red = weak.
          </p>
        </div>

        <hr className="section-divider" />

        {/* Key Insights */}
        <div className="strategy-section">
          <h2>Key Insights</h2>

          <div className="insight-box">
            <p><strong>Beam Search and Minimax are co-champions.</strong> Beam dominates Greedy (91%), Positional (87%),
            and Pathfinder (83%), but ties Minimax at 50-50. Both are the strongest, with different strengths:
            Beam sees multi-turn setups, Minimax reacts to opponent threats.</p>
          </div>

          <div className="insight-box">
            <p><strong>Minimax is the best value.</strong> At ~90ms/move it beats Positional (68%), Pathfinder (74%),
            and ties Beam — which takes ~1s/move. Considering the opponent's response is the single
            highest-impact improvement over pure position evaluation.</p>
          </div>

          <div className="insight-box">
            <p><strong>Positional ≈ Pathfinder.</strong> Despite being 50× slower, Pathfinder loses to Positional 43-56.
            The board is open enough that hexDistance closely approximates real shortest paths.
            BFS blocking detection doesn't justify the computational cost.</p>
          </div>

          <div className="insight-box">
            <p><strong>Random is a chaos agent.</strong> It never wins but creates massive tie rates (63-90%) by
            scattering pieces unpredictably. Even Minimax only beats Random 10% of the time — the rest
            are 200-move timeouts where the AI can't navigate around random obstacles.</p>
          </div>

          <div className="insight-box">
            <p><strong>Thinking ahead &gt; thinking harder &gt; thinking about yourself.</strong> Beam (multi-turn planning)
            and Minimax (adversarial) dominate. Pathfinder (better distance metric) barely helps.
            Greedy (simple heuristic) is surprisingly competitive at 49% vs Pathfinder.</p>
          </div>
        </div>

        <hr className="section-divider" />

        <div className="strategy-section" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>
          <p>By Tim Cao</p>
          <button onClick={onBackToGame} className="back-link" style={{ justifyContent: 'center' }}>← Play the Game</button>
        </div>
      </div>
    </div>
  );
};

export default StrategyPage;
