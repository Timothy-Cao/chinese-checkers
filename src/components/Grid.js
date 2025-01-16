import React, { useRef } from 'react';
import { getCircleColor } from './boardUtils';

const Grid = ({ 
  grid, 
  selectedCircle, 
  legalMoves, 
  handleCircleSelect, 
  handleMove, 
  gridWidth, 
  gridHeight, 
  circleDiameter, 
  occupantGrid, 
  aiMove 
}) => {
  const handleHover = (rowIndex, colIndex) => {
    const hoverSound = new Audio('/media/hover.mp3');  
    hoverSound.play().catch((err) => console.error("Hover sound error:", err));
  };

  const isLegalMove = (row, col) =>
    legalMoves.some((move) => move.row === row && move.col === col);

  const handleClick = (rowIndex, colIndex) => {
    if (selectedCircle && isLegalMove(rowIndex, colIndex)) {
      handleMove(rowIndex, colIndex);
    } else {
      handleCircleSelect(rowIndex, colIndex);
    }
  };

  React.useEffect(() => {
    if (aiMove) {
      handleMove(aiMove.row, aiMove.col); 
    }
  }, [aiMove, handleMove]);

  return (
    <div className="board-grid">
      {grid.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((colIndex) => (
            <div
              className="cell"
              key={colIndex}
              style={{ width: gridWidth, height: gridHeight }}
              onClick={() => handleClick(rowIndex, colIndex)} 
              onMouseEnter={() => handleHover(rowIndex, colIndex)} 
            >
              <div
                className={`circle ${isLegalMove(rowIndex, colIndex) ? 'legal-move' : ''} ${
                  selectedCircle && selectedCircle.row === rowIndex && selectedCircle.col === colIndex
                    ? 'glow'
                    : ''
                }`}
                style={{
                  width: circleDiameter,
                  height: circleDiameter,
                  backgroundColor: getCircleColor(occupantGrid[rowIndex][colIndex]),
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
