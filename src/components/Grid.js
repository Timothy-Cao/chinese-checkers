import React, { useCallback } from 'react';
import { getCircleColor } from './boardUtils';

// Single shared hover sound instance
const hoverSound = new Audio('/media/hover.mp3');

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
}) => {
  const handleHover = useCallback(() => {
    hoverSound.currentTime = 0;
    hoverSound.play().catch(() => {});
  }, []);

  const isLegalMove = (row, col) =>
    legalMoves.some((move) => move.row === row && move.col === col);

  const handleClick = (rowIndex, colIndex) => {
    if (selectedCircle && isLegalMove(rowIndex, colIndex)) {
      handleMove(rowIndex, colIndex);
    } else {
      handleCircleSelect(rowIndex, colIndex);
    }
  };

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
              onMouseEnter={handleHover}
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
