import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/VotarPage.css';

const listas = [
  {
    id: 1,
    nombre: 'PARTIDO NACIONAL',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Logo_Partido_Nacional.png',
  },
  {
    id: 2,
    nombre: 'CABILDO ABIERTO',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Logo_Cabildo_Abierto_Uruguay.png',
  },
  {
    id: 3,
    nombre: 'FRENTE AMPLIO',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Logo_Frente_Amplio.png',
  },
];

const VotarPage = () => {
  const [seleccion, setSeleccion] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSeleccion = (id) => {
    setSeleccion(id);
    setMensaje('');
  };

  const handleVotoBlanco = () => {
    setSeleccion('blanco');
    setMensaje('');
  };

  const handleIngresarVoto = () => {
    if (seleccion === null) {
      setMensaje('Por favor, seleccione una opción.');
      return;
    }
    navigate('/voto-exito');
  };

  return (
    <div className="votar-container">
      <div className="votar-header">
        <h1>Seleccionar Voto</h1>
        <span className="votar-cc">CC: AKA - 150</span>
      </div>
      <div className="votar-listas">
        {listas.map((lista) => (
          <div
            key={lista.id}
            className={`votar-lista-card ${seleccion === lista.id ? 'seleccionado' : ''}`}
            onClick={() => handleSeleccion(lista.id)}
          >
            <img src={lista.imagen} alt={lista.nombre} className="votar-lista-img" />
            <div className="votar-lista-nombre">{lista.nombre}</div>
            <div className={`votar-checkbox ${seleccion === lista.id ? 'checked' : ''}`}></div>
          </div>
        ))}
        <div
          className={`votar-blanco-card ${seleccion === 'blanco' ? 'seleccionado' : ''}`}
          onClick={handleVotoBlanco}
        >
          <div className="votar-blanco-text">Voto en Blanco</div>
          <div className={`votar-checkbox ${seleccion === 'blanco' ? 'checked' : ''}`}></div>
        </div>
      </div>
      <button className="votar-btn" onClick={handleIngresarVoto}>
        Ingresar Voto
      </button>
      {mensaje && <div className="votar-mensaje">{mensaje}</div>}
    </div>
  );
};

export default VotarPage; 