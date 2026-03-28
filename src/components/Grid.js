import React, { useCallback } from 'react';

const hoverSound = new Audio('/media/hover.mp3');

function pieceClass(occupant) {
  if (occupant === 1) return 'piece-red';
  if (occupant === 2) return 'piece-blue';
  return 'piece-empty';
}

const Grid = ({
  grid,
  selectedCircle,
  legalMoves,
  handleCircleSelect,
  handleMove,
  occupantGrid,
  turnColor,
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
    <div className={`board-grid ${turnColor === 'red' ? 'turn-red' : 'turn-blue'}`}>
      {grid.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((colIndex) => {
            const occupant = occupantGrid[rowIndex][colIndex];
            const isSelected = selectedCircle && selectedCircle.row === rowIndex && selectedCircle.col === colIndex;
            const legal = isLegalMove(rowIndex, colIndex);

            return (
              <div
                className="cell"
                key={colIndex}
                onClick={() => handleClick(rowIndex, colIndex)}
                onMouseEnter={handleHover}
              >
                <div
                  className={`circle ${pieceClass(occupant)} ${legal ? 'legal-move' : ''} ${isSelected ? 'selected' : ''}`}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Grid;
