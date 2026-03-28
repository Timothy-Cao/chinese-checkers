import React, { useState } from 'react';
import Board from './components/Board';
import StrategyPage from './components/StrategyPage';

const App = () => {
  const [view, setView] = useState('game');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      {view === 'game' ? (
        <Board onShowStrategy={() => setView('strategy')} />
      ) : (
        <StrategyPage onBackToGame={() => setView('game')} />
      )}
    </div>
  );
};

export default App;
