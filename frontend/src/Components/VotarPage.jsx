import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoNacional from "../assets/logoNacional.jpg";
import logoFA from "../assets/logoFA.jpg";
import logoCabildo from "../assets/logoCabildo.jpg";
import "../Styles/VotarPage.css";

const logosPartidos = {
    Nacional: logoNacional,
    FA: logoFA,
    Cabildo: logoCabildo,
};

const VotarPage = () => {
    const [seleccion, setSeleccion] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [votante, setVotante] = useState(null);
    const [listas, setListas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const votoObservado = location.state?.votoObservado ? 1 : 0;

    useEffect(() => {
        // Obtener datos del votante desde el estado de navegación
        if (location.state?.votante) {
            setVotante(location.state.votante); // <--- ¡Esto es clave!
            setSeleccion([]); // o [] si quieres limpiar la selección al entrar
        } else {
            navigate("/buscar-votante");
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
                        imagen: logosPartidos[lista.NombrePartido] || "",
                        numeroLista: lista.Numero_Lista,
                        partido: lista.NombrePartido,
                    }));
                    setListas(listasConLogos);
                }
            } catch (error) {
                console.error("Error al cargar listas:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarListas();
    }, [location.state, navigate]);

    const handleSeleccion = (id) => {
        setMensaje("");
        setSeleccion((prev) => {
            // Si ya está seleccionada, la deselecciona
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            } else {
                // Si estaba blanco, lo saca y pone la nueva
                if (prev.includes("blanco")) {
                    return [id];
                }
                // Si no había nada, selecciona solo esa
                if (prev.length === 0) {
                    return [id];
                }
                // Si ya había una, permite seleccionar más (anulado)
                return [...prev, id];
            }
        });
    };

    const handleVotoBlanco = () => {
        setMensaje("");
        setSeleccion((prev) => {
            if (prev.includes("blanco")) {
                return [];
            } else {
                return ["blanco"];
            }
        });
    };

    const handleIngresarVoto = async () => {
        if (seleccion.length === 0) {
            setMensaje("Por favor, seleccione al menos una opción.");
            return;
        }

        if (!votante) {
            setMensaje('Error: No se encontraron datos del votante.');
            return;
        }

        // Determinar tipo de voto y número de lista
        let tipoVoto, numeroLista;
        if (seleccion.length > 1) {
            tipoVoto = 3; // Anulado
            numeroLista = null;
        } else if (seleccion[0] === "blanco") {
            tipoVoto = 2; // Blanco
            numeroLista = null;
        } else {
            tipoVoto = 1; // Válido
            numeroLista = seleccion[0];
        }

        const circuito = Number(localStorage.getItem("circuito"));

        try {
            const response = await fetch(
                `http://localhost:5001/api/votantes/${votante.CC}/marcar-votado`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        idEleccion: 1,
                        votoObservado: votoObservado,
                        tipoVoto: tipoVoto,
                        numeroLista: numeroLista,
                        circuito: circuito,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                // Obtener la hora real de la base de datos
                const estadoResponse = await fetch(
                    `http://localhost:5001/api/votantes/${votante.CC}/estado-voto`
                );
                const estadoData = await estadoResponse.json();

                navigate("/voto-exito", {
                    state: {
                        votante: {
                            ...votante,
                            fechaVoto: estadoData.data?.fechaVoto || null,
                        },
                        seleccion: seleccion,
                        tipoVoto: tipoVoto,
                    },
                });
            } else {
                setMensaje(data.message || 'Error al registrar el voto.');
            }
        } catch (error) {
            setMensaje('Error de conexión con el servidor.');
        }
    };

    if (!votante || loading) {
        return (
            <div className="votar-container">
                <div className="votar-card">
                    <h1>Cargando...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="votar-container">
            <div className="votar-card">
                <div className="votar-header">
                    <h1>Seleccionar Voto</h1>
                    <span className="votar-cc">CC: {votante.CC}</span>
                </div>
                <div className="votar-listas">
                    {listas.map((lista) => (
                        <div
                            key={lista.id}
                            className={`votar-lista-card ${
                                seleccion.includes(lista.id)
                                    ? "seleccionado"
                                    : ""
                            }`}
                            onClick={() => handleSeleccion(lista.id)}
                        >
                            <img
                                src={lista.imagen}
                                alt={lista.nombre}
                                className="votar-lista-img"
                            />
                            <div className="votar-lista-nombre">
                                {lista.nombre}
                            </div>
                            <div className="votar-lista-numero">
                                Lista {lista.numeroLista}
                            </div>
                            <div
                                className={`votar-checkbox ${
                                    seleccion.includes(lista.id)
                                        ? "checked"
                                        : ""
                                }`}
                            ></div>
                        </div>
                    ))}
                    <div
                        className={`votar-blanco-card ${
                            seleccion.includes("blanco") ? "seleccionado" : ""
                        }`}
                        onClick={handleVotoBlanco}
                    >
                        <div className="votar-blanco-text">Voto en Blanco</div>
                        <div
                            className={`votar-checkbox ${
                                seleccion.includes("blanco") ? "checked" : ""
                            }`}
                        ></div>
                    </div>
                </div>
                {seleccion.length > 0 && (
                    <button
                        className="votar-deseleccionar-btn"
                        onClick={() => setSeleccion([])}
                    >
                        Deseleccionar
                    </button>
                )}
                <button
                    className="votar-btn"
                    onClick={handleIngresarVoto}
                    disabled={seleccion.length === 0}
                >
                    Ingresar Voto
                </button>
                {mensaje && <div className="votar-mensaje">{mensaje}</div>}
            </div>
        </div>
    );
};

export default VotarPage;
