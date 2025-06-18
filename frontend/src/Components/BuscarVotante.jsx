import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/BuscarVotante.css';

const BuscarVotante = () => {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    navigate('/');
  };

  return (
    <div className="buscarvotante-bg">
      <div className="buscarvotante-barra">
        <span className="buscarvotante-sesion">Sesion Iniciada</span>
        <button className="buscarvotante-cerrar" onClick={handleCerrarSesion}>
          Cerrar Sesion
        </button>
      </div>
      <div className="buscarvotante-card">
        <h1 className="buscarvotante-titulo">Ingresar Credencial del Votante</h1>
        <label className="buscarvotante-label">Ingresar Credencial del Votante</label>
        <input
          className="buscarvotante-input"
          type="text"
          placeholder="Ingresar CC"
          disabled
        />
        <button className="buscarvotante-btn" disabled>Ingresar</button>
      </div>
    </div>
  );
};

export default BuscarVotante;
