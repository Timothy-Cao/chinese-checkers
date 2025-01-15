import React from 'react';
import './Title.css';

const Title = () => {
  return (
    <div className="title-container">
      <div className="title-box">
        <h1 className="main-title">Chinese Checkers</h1>
        <p className="subtitle">Long Jump Variation</p>
        <p className="text">By Tim Cao</p>
      </div>

      <div className="rules-box">
        <h2 className="rules-title">How to Play</h2>
        <p><strong>Goal:</strong> The objective is to move all of your pieces across the board to the opposite side, forming the triangle your opponent started with.</p>
        <p><strong>Turn:</strong> On each turn, you can move a single one of your pieces. You can either: </p>
          <ul>
            <li>A move to an adjacent open spot.</li>
            <li>Jump to an empty spot in a straight line, <em>only</em> if there is a pawn at the midpoint. There cannot be any other pawns in between the starting and landing points.</li>
            <li>A jump may be followed with any number of jumps.</li>
          </ul>
          <p><strong>Winner: </strong> Victory goes to the first player to reach their goal. </p>
      </div>
    </div>
  );
};

export default Title;