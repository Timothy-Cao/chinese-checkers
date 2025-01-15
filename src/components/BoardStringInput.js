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
        <button onClick={getBoardStringValue}>Get Board String</button>
        <button onClick={loadBoardFromString}>Load Board</button>
        <button onClick={resetBoard} className="reset-button">Reset</button> 
      </div>
    </div>
  );
};

export default BoardStringInput;
