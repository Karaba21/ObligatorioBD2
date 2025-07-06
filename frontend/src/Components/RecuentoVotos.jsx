import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/RecuentoVotos.css";

const RecuentoVotos = () => {
    const navigate = useNavigate();
    const [recuento, setRecuento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarRecuento();
    }, []);

    const cargarRecuento = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5001/api/recuento-votos"
            );
            const data = await response.json();

            if (data.success) {
                setRecuento(data.data);
            } else {
                setError(data.error || "Error al cargar el recuento");
            }
        } catch (error) {
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleCerrarSesion = () => {
        navigate("/");
    };

    const handleVolver = () => {
        navigate("/buscar-votante");
    };

    if (loading) {
        return (
            <div className="recuento-bg">
                <div className="recuento-loading">
                    <h2>Cargando recuento de votos...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recuento-bg">
                <div className="recuento-error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={cargarRecuento}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="recuento-bg">
            <div className="recuento-barra">
                <button
                    className="recuento-cerrar"
                    onClick={handleCerrarSesion}
                >
                    Cerrar Sesion
                </button>
            </div>

            <div className="recuento-container">
                <div className="recuento-header">
                    <h1 className="recuento-titulo">Recuento Total de Votos</h1>
                    <p className="recuento-subtitulo">
                        Elecciones Generales 2024
                    </p>
                </div>

                <div className="recuento-stats">
                    <div className="recuento-stat-card">
                        <h3>Total de Votantes</h3>
                        <span className="recuento-stat-numero">
                            {recuento?.totalVotantes?.toLocaleString()}
                        </span>
                    </div>
                    <div className="recuento-stat-card">
                        <h3>Votos Emitidos</h3>
                        <span className="recuento-stat-numero">
                            {recuento?.totalVotos?.toLocaleString()}
                        </span>
                    </div>
                    <div className="recuento-stat-card">
                        <h3>Participación</h3>
                        <span className="recuento-stat-numero">
                            {recuento?.participacion}%
                        </span>
                    </div>
                </div>

                <div className="recuento-resultados">
                    <h2 className="recuento-seccion-titulo">
                        Resultados por Lista
                    </h2>
                    <div className="recuento-partidos">
                        {recuento?.votosPorLista?.map((lista) => (
                            <div
                                key={lista.numeroLista}
                                className="recuento-partido-card"
                            >
                                <div className="recuento-partido-info">
                                    <h3 className="recuento-partido-nombre">
                                        Lista {lista.numeroLista} -{" "}
                                        {lista.nombrePartido}
                                    </h3>
                                    <div className="recuento-partido-votos">
                                        <span className="recuento-votos-numero">
                                            {lista.votos.toLocaleString()}
                                        </span>
                                        <span className="recuento-votos-porcentaje">
                                            ({lista.porcentaje}%)
                                        </span>
                                    </div>
                                </div>
                                <div className="recuento-barra-progreso">
                                    <div
                                        className="recuento-progreso-fill"
                                        style={{
                                            width: `${lista.porcentaje}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="recuento-footer">
                    <p className="recuento-actualizacion">
                        Última actualización: {recuento?.ultimaActualizacion}
                    </p>
                    <button
                        className="recuento-btn-volver"
                        onClick={handleVolver}
                    >
                        Volver a Buscar Votante
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecuentoVotos;
