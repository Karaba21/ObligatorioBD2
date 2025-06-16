import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Components/LoginPage';
import VotarPage from './Components/VotarPage';
import VotoExitoPage from './Components/VotoExitoPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/votar" element={<VotarPage />} />
        <Route path="/voto-exito" element={<VotoExitoPage />} />
      </Routes>
    </Router>
  );
}

export default App; 