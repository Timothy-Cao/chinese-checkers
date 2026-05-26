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
      <nav
        aria-label="Legal links"
        style={{
          position: 'fixed',
          right: 12,
          bottom: 8,
          zIndex: 1000,
          display: 'flex',
          gap: 8,
          fontSize: 11,
          opacity: 0.72,
        }}
      >
        <a href="/privacy.html" style={{ color: '#cbd5e1' }}>Privacy</a>
        <a href="mailto:timcao.support@gmail.com" style={{ color: '#cbd5e1' }}>Contact</a>
      </nav>
    </div>
  );
};

export default App;
