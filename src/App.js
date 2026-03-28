import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Board from './components/Board';
import StrategyPage from './components/StrategyPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Board />} />
        <Route path="/strategy" element={<StrategyPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
