import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styles/VotoExitoPage.css';

const VotoExitoPage = () => {
  const [votante, setVotante] = useState(null);
  const [seleccion, setSeleccion] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Obtener datos del votante y selección desde el estado de navegación
    if (location.state?.votante) {
      setVotante(location.state.votante);
      setSeleccion(location.state.seleccion);
    }
  }, [location.state]);

  const handleFinalizar = () => {
    // Volver a la página de buscar votante para el siguiente votante
    navigate('/buscar-votante');
  };

  const getNombreSeleccion = () => {
    if (seleccion === 'blanco') return 'Voto en Blanco';
    
    const listas = [
      { id: 1, nombre: 'PARTIDO NACIONAL' },
      { id: 2, nombre: 'CABILDO ABIERTO' },
      { id: 3, nombre: 'FRENTE AMPLIO' },
    ];
    
    const lista = listas.find(l => l.id === seleccion);
    return lista ? lista.nombre : 'Opción seleccionada';
  };

  return (
    <div className="exito-container">
      <div className="exito-header">
        <span className="exito-cc">CC: {votante?.CC || 'N/A'}</span>
      </div>
      <div className="exito-card">
        <div className="exito-mensaje">
          <h2>¡Tu voto ha sido registrado con éxito!</h2>
          {votante && (
            <div className="exito-datos">
              <p><strong>Votante:</strong> {votante.Nombre}</p>
              <p><strong>CC:</strong> {votante.CC}</p>
            </div>
          )}
          {seleccion && (
            <div className="exito-seleccion">
              <p><strong>Opción seleccionada:</strong> {getNombreSeleccion()}</p>
            </div>
          )}
          <div className="exito-fecha">
            <p><strong>Fecha y hora:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
      <button className="exito-btn" onClick={handleFinalizar}>
        Finalizar
      </button>
    </div>
  );
};

export default VotoExitoPage; 