import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/VotoExitoPage.css";

const VotoExitoPage = () => {
    const [votante, setVotante] = useState(null);
    const [votoRegistrado, setVotoRegistrado] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Obtener datos del votante desde el estado de navegación
        if (location.state?.votante) {
            setVotante(location.state.votante);
            setVotoRegistrado(location.state.votoRegistrado || false);
        }
    }, [location.state]);

    const handleFinalizar = () => {
        // Volver a la página de buscar votante para el siguiente votante
        navigate("/buscar-votante");
    };

    return (
        <div className="exito-container">
            <div className="exito-header">
                <span className="exito-cc">CC: {votante?.CC || "N/A"}</span>
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
                    <div className="exito-seleccion">
                        <p><strong>Estado:</strong> Voto registrado correctamente</p>
                        <p><em>Tu voto es secreto y ha sido procesado de forma segura</em></p>
                    </div>
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
