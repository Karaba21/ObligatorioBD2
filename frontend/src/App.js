import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Components/LoginPage';
import RegisterPage from './Components/RegisterPage';
import VotarPage from './Components/VotarPage';
import VotoExitoPage from './Components/VotoExitoPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/votar" element={<VotarPage />} />
                <Route path="/voto-exito" element={<VotoExitoPage />} />
            </Routes>
        </Router>
    );
}

export default App; 