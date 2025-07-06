import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "./Components/ProtectedRoute";
import LoginPage from './Components/LoginPage';
import RegisterPage from './Components/RegisterPage';
import VotarPage from './Components/VotarPage';
import VotoExitoPage from './Components/VotoExitoPage';
import BuscarVotante from './Components/BuscarVotante';
import RecuentoVotos from './Components/RecuentoVotos';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/votar" element={<ProtectedRoute><VotarPage /></ProtectedRoute>} />
                <Route path="/voto-exito" element={<ProtectedRoute><VotoExitoPage /></ProtectedRoute>} />
                <Route path="/buscar-votante" element={<ProtectedRoute><BuscarVotante /></ProtectedRoute>} />
                <Route path="/recuento-votos" element={<ProtectedRoute><RecuentoVotos /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App; 