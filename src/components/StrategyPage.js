import React from 'react';
import './strategy.css';

const benchmarks = [
  { red: 'Random', blue: 'Greedy', rw: 0, bw: 100, ties: 0, avg: 120 },
  { red: 'Random', blue: 'Positional', rw: 0, bw: 18, ties: 82, avg: 182 },
  { red: 'Greedy', blue: 'Greedy', rw: 100, bw: 0, ties: 0, avg: 64 },
  { red: 'Greedy', blue: 'Positional', rw: 50, bw: 47, ties: 3, avg: 72 },
  { red: 'Greedy', blue: 'Pathfinder', rw: 2, bw: 98, ties: 0, avg: 73 },
  { red: 'Greedy', blue: 'Minimax', rw: 0, bw: 100, ties: 0, avg: 53 },
  { red: 'Positional', blue: 'Pathfinder', rw: 52, bw: 47, ties: 1, avg: 63 },
  { red: 'Positional', blue: 'Minimax', rw: 33, bw: 66, ties: 1, avg: 63 },
  { red: 'Pathfinder', blue: 'Minimax', rw: 28, bw: 72, ties: 0, avg: 61 },
];

const BarChart = ({ data }) => (
  <div className="bar-chart">
    {data.map((row, i) => (
      <div className="bar-row" key={i}>
        <div className="bar-label">{row.red} vs {row.blue}</div>
        <div className="bar-track">
          {row.rw > 0 && <div className="bar-fill-red" style={{ width: `${row.rw}%` }}>{row.rw}%</div>}
          {row.bw > 0 && <div className="bar-fill-blue" style={{ width: `${row.bw}%` }}>{row.bw}%</div>}
          {row.ties > 0 && <div className="bar-fill-gray" style={{ width: `${row.ties}%` }}>{row.ties}%</div>}
        </div>
      </div>
    ))}
  </div>
);

const StrategyPage = ({ onBackToGame }) => {
  return (
    <div className="strategy-page">
      <div className="strategy-content">
        <button onClick={onBackToGame} className="back-link">← Back to Game</button>

        {/* Hero */}
        <div className="strategy-hero">
          <h1>AI Strategy Analysis</h1>
          <p className="subtitle">How five algorithms compete at Chinese Checkers — Long Jump Variation</p>
        </div>

        {/* Overview */}
        <div className="strategy-section">
          <h2>The Five Strategies</h2>
          <p>
            We built five AI strategies of increasing sophistication, from purely random play to
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
              <tr><td><strong>Minimax</strong></td><td>2-ply adversarial search</td><td>~90ms</td><td><span className="strategy-badge badge-best">Best</span></td></tr>
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
              <span className="strategy-badge badge-best">Best</span>
            </div>
            <p>
              The only strategy that considers the <strong>opponent's response</strong>. Uses depth-2 adversarial
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
            100 games per matchup, 200 move limit. Red always moves first.
            Bar chart shows win rate distribution (red = Red wins, blue = Blue wins, gray = ties).
          </p>

          <BarChart data={benchmarks} />

          <table className="data-table">
            <thead>
              <tr>
                <th>Red</th>
                <th>Blue</th>
                <th>Red Wins</th>
                <th>Blue Wins</th>
                <th>Ties</th>
                <th>Avg Moves</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((row, i) => (
                <tr key={i}>
                  <td><strong>{row.red}</strong></td>
                  <td><strong>{row.blue}</strong></td>
                  <td className={row.rw >= 50 ? 'win-red' : ''}>{row.rw}%</td>
                  <td className={row.bw >= 50 ? 'win-blue' : ''}>{row.bw}%</td>
                  <td className={row.ties > 0 ? 'win-tie' : ''}>{row.ties}%</td>
                  <td>{row.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr className="section-divider" />

        {/* Key Insights */}
        <div className="strategy-section">
          <h2>Key Insights</h2>

          <div className="insight-box">
            <p><strong>Minimax dominates everything.</strong> 100% vs Greedy, 66% vs Positional, 72% vs Pathfinder.
            The only strategy that considers what the opponent will do — and it matters enormously.</p>
          </div>

          <div className="insight-box">
            <p><strong>Positional ≈ Pathfinder.</strong> Despite being 50× slower, Pathfinder barely edges out Positional
            (52-47). The board is open enough that hexDistance closely approximates actual shortest paths.
            Blocking is less impactful than intuition suggests.</p>
          </div>

          <div className="insight-box">
            <p><strong>Greedy + fallback is surprisingly competitive.</strong> With the positional fallback for stuck states,
            Greedy matches Positional at 50-47. The fast forward-rush strategy is effective because
            it creates jump chains that Positional's evaluation doesn't fully capture.</p>
          </div>

          <div className="insight-box">
            <p><strong>First-mover advantage exists.</strong> Red (first mover) wins ~5-10% more often across matchups.
            In Greedy vs Greedy, Red wins 100% — identical strategies, but going first is enough to always
            stay one step ahead.</p>
          </div>

          <div className="insight-box">
            <p><strong>Speed vs strength tradeoff.</strong> Minimax at 90ms/move delivers the best results.
            Pathfinder at 700ms/move delivers marginal improvement over Positional at 15ms/move.
            The lesson: thinking about the opponent (Minimax) beats thinking harder about yourself (Pathfinder).</p>
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
