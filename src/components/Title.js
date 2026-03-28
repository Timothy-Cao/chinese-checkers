import React, { useState } from 'react';
import './Title.css';

const Title = () => {
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      {showRules && (
        <div className="rules-modal" onClick={() => setShowRules(false)}>
          <div className="rules-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowRules(false)}>
              ✕
            </button>
            <h2>How to Play</h2>
            <p>
              <strong>Goal:</strong> Move all of your pieces across the board to the opposite
              triangle — the one your opponent started in.
            </p>
            <p>
              <strong>On each turn</strong>, move one piece:
            </p>
            <ul>
              <li>Step to an adjacent empty spot.</li>
              <li>
                Jump over a pawn in a straight line if there is a piece at the midpoint
                and the landing spot is empty.
              </li>
              <li>Chain any number of jumps in a single turn.</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Title;
