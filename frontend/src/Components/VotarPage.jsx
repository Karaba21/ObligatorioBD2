import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [votante, setVotante] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Obtener datos del votante desde el estado de navegación
    if (location.state?.votante) {
      setVotante(location.state.votante);
    } else {
      // Si no hay datos del votante, redirigir a buscar votante
      navigate('/buscar-votante');
    }
  }, [location.state, navigate]);

  const handleSeleccion = (id) => {
    setSeleccion(id);
    setMensaje('');
  };

  const handleVotoBlanco = () => {
    setSeleccion('blanco');
    setMensaje('');
  };

  const handleIngresarVoto = async () => {
    if (seleccion === null) {
      setMensaje('Por favor, seleccione una opción.');
      return;
    }

    if (!votante) {
      setMensaje('Error: No se encontraron datos del votante.');
      return;
    }

    try {
      // Marcar votante como que ya votó
      const response = await fetch(`http://localhost:5001/api/votantes/${votante.CC}/marcar-votado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idEleccion: 1, // Por ahora hardcodeado, debería venir de la elección activa
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Navegar a la página de éxito
        navigate('/voto-exito', { 
          state: { 
            votante: votante,
            seleccion: seleccion 
          } 
        });
      } else {
        setMensaje(data.message || 'Error al registrar el voto.');
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor.');
    }
  };

  if (!votante) {
    return (
      <div className="votar-container">
        <div className="votar-header">
          <h1>Cargando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="votar-container">
      <div className="votar-header">
        <h1>Seleccionar Voto</h1>
        <span className="votar-cc">CC: {votante.CC}</span>
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