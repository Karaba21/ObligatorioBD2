import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/BuscarVotante.css";

const BuscarVotante = () => {
    const navigate = useNavigate();
    const [cc, setCc] = useState("");
    const [votante, setVotante] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [estadoVoto, setEstadoVoto] = useState(null);
    const [circuito, setCircuito] = useState(null);
    const [verificacionCircuito, setVerificacionCircuito] = useState(null);

    useEffect(() => {
        const ciPresidente = localStorage.getItem("ciPresidente");
        if (ciPresidente) {
            fetch(`http://localhost:5001/api/presidente/${ciPresidente}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setCircuito(data.data.Circuito);
                    }
                });
        }
    }, []);

    const handleCerrarSesion = () => {
        localStorage.removeItem("sesionIniciada");
        navigate("/");
    };

    const handleVerRecuento = () => {
        navigate('/recuento-votos');
    };

    const handleBuscarVotante = async () => {
        if (!cc.trim()) {
            setError("Por favor, ingrese una CC válida");
            return;
        }

        setLoading(true);
        setError("");
        setVotante(null);
        setEstadoVoto(null);
        setVerificacionCircuito(null);

        try {
            // Buscar votante por CC
            const response = await fetch(
                `http://localhost:5001/api/votantes/${cc.trim()}`
            );
            const data = await response.json();

            if (data.success) {
                setVotante(data.data);

                // Verificar estado de voto
                const estadoResponse = await fetch(
                    `http://localhost:5001/api/votantes/${cc.trim()}/estado-voto`
                );
                const estadoData = await estadoResponse.json();

                if (estadoData.success) {
                    setEstadoVoto(estadoData.data);
                }

                // Verificar si el votante está en el circuito correcto
                if (circuito !== null) {
                    const circuitoResponse = await fetch(
                        `http://localhost:5001/api/votantes/${cc.trim()}/verificar-circuito?circuitoPresidente=${circuito}`
                    );
                    const circuitoData = await circuitoResponse.json();

                    if (circuitoData.success) {
                        setVerificacionCircuito(circuitoData.data);
                    }
                }
            } else {
                setError(data.message || "Votante no encontrado");
            }
        } catch (error) {
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleIngresar = () => {
        if (votante && !estadoVoto?.yaVoto) {
            // Navegar a la página de votación con los datos del votante
            navigate("/votar", {
                state: {
                    votante: votante,
                    cc: votante.CC,
                },
            });
        } else if (estadoVoto?.yaVoto) {
            setError("Este votante ya ha votado anteriormente");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleBuscarVotante();
        }
    };

    return (
        <div className="buscarvotante-bg">
            <div className="buscarvotante-barra">
                <button
                    className="buscarvotante-cerrar"
                    onClick={handleCerrarSesion}
                >
                    Cerrar Sesion
                </button>
                <button
                    className="buscarvotante-recuento"
                    onClick={handleVerRecuento}
                >
                    Ver Recuento
                </button>
            </div>
            <div className="buscarvotante-card">
                {circuito !== null && circuito !== undefined && (
                    <div className="buscarvotante-circuito">
                        Circuito: <strong>{circuito}</strong>
                    </div>
                )}
                <h1 className="buscarvotante-titulo">
                    Ingresar Credencial del Votante
                </h1>
                <label className="buscarvotante-label">
                    Ingresar Credencial del Votante
                </label>
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
                    {loading ? "Buscando..." : "Buscar Votante"}
                </button>

                {error && <div className="buscarvotante-error">{error}</div>}

                {votante && (
                    <div className="buscarvotante-resultado">
                        <h3>Datos del Votante:</h3>
                        <p>
                            <strong>CC:</strong> {votante.CC}
                        </p>
                        <p>
                            <strong>Nombre:</strong> {votante.Nombre}
                        </p>
                        <p>
                            <strong>Fecha de Nacimiento:</strong>{" "}
                            {new Date(
                                votante.Fecha_Nacimiento
                            ).toLocaleDateString()}
                        </p>

                        {estadoVoto && (
                            <div className="buscarvotante-estado">
                                <p>
                                    <strong>Estado de Voto:</strong>
                                    <span
                                        className={
                                            estadoVoto.yaVoto
                                                ? "ya-voto"
                                                : "no-voto"
                                        }
                                    >
                                        {estadoVoto.yaVoto
                                            ? " Ya votó"
                                            : " No ha votado"}
                                    </span>
                                </p>
                                {estadoVoto.fechaVoto && (
                                    <p>
                                        <strong>Hora de Voto:</strong>{" "}
                                        {estadoVoto.fechaVoto}
                                    </p>
                                )}
                            </div>
                        )}

                        {verificacionCircuito && (
                            <div className="buscarvotante-verificacion">
                                <p>
                                    <strong>Verificación de Circuito:</strong>
                                    <span
                                        className={
                                            verificacionCircuito.circuitoCorrecto
                                                ? "circuito-correcto"
                                                : "circuito-incorrecto"
                                        }
                                    >
                                        {verificacionCircuito.circuitoCorrecto
                                            ? " ✓ Circuito correcto"
                                            : " ✗ Circuito incorrecto"}
                                    </span>
                                </p>
                                <p>
                                    <strong>Circuito Asignado:</strong>{" "}
                                    {verificacionCircuito.circuitoAsignado}
                                </p>
                                <p>
                                    <strong>Circuito Actual:</strong>{" "}
                                    {verificacionCircuito.circuitoActual}
                                </p>
                            </div>
                        )}

                        <button
                            className="buscarvotante-ingresar-btn"
                            onClick={handleIngresar}
                            disabled={
                                estadoVoto?.yaVoto ||
                                (verificacionCircuito &&
                                    !verificacionCircuito.circuitoCorrecto)
                            }
                        >
                            {estadoVoto?.yaVoto
                                ? "Ya Votó"
                                : verificacionCircuito &&
                                  !verificacionCircuito.circuitoCorrecto
                                ? "Circuito Incorrecto"
                                : "Ingresar a Votar"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuscarVotante;
