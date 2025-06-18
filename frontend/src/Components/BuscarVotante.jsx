import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/BuscarVotante.css';

const BuscarVotante = () => {
  const navigate = useNavigate();
  const [cc, setCc] = useState('');
  const [votante, setVotante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estadoVoto, setEstadoVoto] = useState(null);

  const handleCerrarSesion = () => {
    navigate('/');
  };

  const handleBuscarVotante = async () => {
    if (!cc.trim()) {
      setError('Por favor, ingrese una CC válida');
      return;
    }

    setLoading(true);
    setError('');
    setVotante(null);
    setEstadoVoto(null);

    try {
      // Buscar votante por CC
      const response = await fetch(`http://localhost:5001/api/votantes/${cc.trim()}`);
      const data = await response.json();

      if (data.success) {
        setVotante(data.data);
        
        // Verificar estado de voto
        const estadoResponse = await fetch(`http://localhost:5001/api/votantes/${cc.trim()}/estado-voto`);
        const estadoData = await estadoResponse.json();
        
        if (estadoData.success) {
          setEstadoVoto(estadoData.data);
        }
      } else {
        setError(data.message || 'Votante no encontrado');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleIngresar = () => {
    if (votante && !estadoVoto?.yaVoto) {
      // Navegar a la página de votación con los datos del votante
      navigate('/votar', { 
        state: { 
          votante: votante,
          cc: votante.CC 
        } 
      });
    } else if (estadoVoto?.yaVoto) {
      setError('Este votante ya ha votado anteriormente');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBuscarVotante();
    }
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
          value={cc}
          onChange={(e) => setCc(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button 
          className="buscarvotante-btn" 
          onClick={handleBuscarVotante}
          disabled={loading || !cc.trim()}
        >
          {loading ? 'Buscando...' : 'Buscar Votante'}
        </button>

        {error && (
          <div className="buscarvotante-error">
            {error}
          </div>
        )}

        {votante && (
          <div className="buscarvotante-resultado">
            <h3>Datos del Votante:</h3>
            <p><strong>CC:</strong> {votante.CC}</p>
            <p><strong>Nombre:</strong> {votante.Nombre}</p>
            <p><strong>Fecha de Nacimiento:</strong> {new Date(votante.Fecha_Nacimiento).toLocaleDateString()}</p>
            
            {estadoVoto && (
              <div className="buscarvotante-estado">
                <p><strong>Estado de Voto:</strong> 
                  <span className={estadoVoto.yaVoto ? 'ya-voto' : 'no-voto'}>
                    {estadoVoto.yaVoto ? ' Ya votó' : ' No ha votado'}
                  </span>
                </p>
                {estadoVoto.fechaVoto && (
                  <p><strong>Fecha de Voto:</strong> {new Date(estadoVoto.fechaVoto).toLocaleString()}</p>
                )}
              </div>
            )}

            <button 
              className="buscarvotante-ingresar-btn"
              onClick={handleIngresar}
              disabled={estadoVoto?.yaVoto}
            >
              {estadoVoto?.yaVoto ? 'Ya Votó' : 'Ingresar a Votar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuscarVotante;
