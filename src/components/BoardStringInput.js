import React from 'react';

const BoardStringInput = ({ boardString, handleBoardStringChange, getBoardStringValue, loadBoardFromString, resetBoard }) => {
  return (
    <div className="input-box">
      <textarea
        value={boardString}
        onChange={handleBoardStringChange}
        placeholder="Enter board string"
      />
      <div className="buttons">
        <button onClick={loadBoardFromString}>Load Board</button>
        <button onClick={getBoardStringValue}>Get String</button>
        <button onClick={resetBoard} className="reset-button">Reset</button> 
      </div>
    </div>
  );
};

export default BoardStringInput;
