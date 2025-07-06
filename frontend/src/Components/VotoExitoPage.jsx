import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/VotoExitoPage.css";

const VotoExitoPage = () => {
    const [votante, setVotante] = useState(null);
    const [seleccion, setSeleccion] = useState([]); // <-- Agregado
    const [listas, setListas] = useState([]); // <-- Agregado
    const [tipoVoto, setTipoVoto] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [votoObservado, setVotoObservado] = useState(false);

    useEffect(() => {
        if (!location.state?.votante) {
            navigate("/buscar-votante");
            return;
        }
        setVotante(location.state.votante);
        setSeleccion(location.state.seleccion || []);
        setTipoVoto(location.state.tipoVoto);
        setVotoObservado(location.state.votoObservado || false);

        // Cargar listas desde la base de datos
        const cargarListas = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5001/api/listas"
                );
                const data = await response.json();

                if (data.success) {
                    const listasConLogos = data.data.map((lista) => ({
                        id: lista.Numero_Lista,
                        nombre: lista.NombrePartido,
                        numeroLista: lista.Numero_Lista,
                        partido: lista.NombrePartido,
                    }));
                    setListas(listasConLogos);
                }
            } catch (error) {
                console.error("Error al cargar listas:", error);
            }
        };

        cargarListas();
    }, [location.state, navigate]);

    const handleFinalizar = () => {
        navigate("/buscar-votante");
    };

    const getNombreSeleccion = () => {
        if (tipoVoto === 3) return "Voto anulado";
        if (seleccion.length === 1 && seleccion[0] === "blanco")
            return "Voto en Blanco";
        if (seleccion.length === 1) {
            const lista = listas.find((l) => l.id === seleccion[0]);
            return lista
                ? `${lista.nombre} - Lista ${lista.numeroLista}`
                : "Opción seleccionada";
        }
        return "Opción seleccionada";
    };

    return (
        <div className="exito-container">
            <div className="exito-card">
                <div className="exito-mensaje">
                    <h2>¡Tu voto ha sido registrado con éxito!</h2>
                    <span className="exito-cc">CC: {votante?.CC || "N/A"}</span>
                </div>
                <div className="exito-info-card">
                    {votante && (
                        <>
                            <p>
                                <strong>Votante:</strong> {votante.Nombre}
                            </p>
                            <p>
                                <strong>CC:</strong> {votante.CC}
                            </p>
                        </>
                    )}
                    <p>
                        <strong>Opción seleccionada:</strong>{" "}
                        {getNombreSeleccion()}
                    </p>
                    <p>
                        <strong>Hora de voto:</strong>{" "}
                        {votante?.fechaVoto || "No disponible"}
                    </p>
                </div>
                {votoObservado && (
                    <p style={{ color: "#c0392b", fontWeight: 700 }}>
                        Voto Observado
                    </p>
                )}
                <button className="exito-btn" onClick={handleFinalizar}>
                    Finalizar
                </button>
            </div>
        </div>
    );
};

export default VotoExitoPage;
