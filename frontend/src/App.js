import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Components/LoginPage';
<<<<<<< HEAD
import RegisterPage from './Components/RegisterPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Routes>
        </Router>
    );
=======
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
>>>>>>> main
}

export default App; 