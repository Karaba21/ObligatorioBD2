import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/VotoExitoPage.css";

const VotoExitoPage = () => {
    const [votante, setVotante] = useState(null);
    const [seleccion, setSeleccion] = useState(null);
    const [listas, setListas] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [tipoVoto, setTipoVoto] = useState(null);

    useEffect(() => {
        // Obtener datos del votante y selección desde el estado de navegación
        if (location.state?.votante) {
            setVotante(location.state.votante);
            setSeleccion(location.state.seleccion);
            setTipoVoto(location.state.tipoVoto);
        }

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
    }, [location.state]);

    const handleFinalizar = () => {
        // Volver a la página de buscar votante para el siguiente votante
        navigate("/buscar-votante");
    };

    const getNombreSeleccion = () => {
        if (tipoVoto === 3) return "Voto anulado";
        if (seleccion.length === 1 && seleccion[0] === "blanco") return "Voto en Blanco";
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
                        {seleccion && (
                            <p>
                                <strong>Opción seleccionada:</strong>{" "}
                                {getNombreSeleccion()}
                            </p>
                        )}
                        <p>
                            <strong>Hora de voto:</strong>{" "}
                            {votante?.fechaVoto || "No disponible"}
                        </p>
                    </div>
                </div>
                <button className="exito-btn" onClick={handleFinalizar}>
                    Finalizar
                </button>
            </div>
        </div>
    );
};

export default VotoExitoPage;
