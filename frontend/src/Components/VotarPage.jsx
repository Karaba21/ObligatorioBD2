import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoNacional from '../assets/logoNacional.jpg';
import logoFA from '../assets/logoFA.jpg';
import logoCabildo from '../assets/logoCabildo.jpg';
import "../Styles/VotarPage.css";

const logosPartidos = {
    "Nacional": logoNacional,
    "FA": logoFA,
    "Cabildo": logoCabildo,
};

const VotarPage = () => {
    const [seleccion, setSeleccion] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [votante, setVotante] = useState(null);
    const [listas, setListas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Obtener datos del votante desde el estado de navegación
        if (location.state?.votante) {
            setVotante(location.state.votante);
        } else {
            // Si no hay datos del votante, redirigir a buscar votante
            navigate("/buscar-votante");
        }

        // Cargar listas desde la base de datos
        const cargarListas = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/listas');
                const data = await response.json();
                
                if (data.success) {
                    // Transformar los datos para incluir el logo del partido
                    const listasConLogos = data.data.map(lista => ({
                        id: lista.Numero_Lista,
                        nombre: lista.NombrePartido,
                        imagen: logosPartidos[lista.NombrePartido] || "",
                        numeroLista: lista.Numero_Lista,
                        partido: lista.NombrePartido
                    }));
                    setListas(listasConLogos);
                }
            } catch (error) {
                console.error('Error al cargar listas:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarListas();
    }, [location.state, navigate]);

    const handleSeleccion = (id) => {
        setSeleccion(id);
        setMensaje("");
    };

    const handleVotoBlanco = () => {
        setSeleccion("blanco");
        setMensaje("");
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
            // Determinar el número de lista basado en la selección
            let numeroLista;
            let tipoVoto = 1; // Voto normal por defecto
            
            if (seleccion === 'blanco') {
                numeroLista = null;
                tipoVoto = 2; // Asumiendo que tipo 2 es voto en blanco
            } else {
                numeroLista = seleccion; // El ID de la lista seleccionada
            }

            // Registrar el voto
            const response = await fetch('http://localhost:5001/api/registrar-voto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ccVotante: votante.CC,
                    numeroLista: numeroLista,
                    idCircuito: 1, // Por ahora hardcodeado, debería venir del contexto
                    tipoVoto: tipoVoto
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Navegar a la página de éxito SIN información del voto
                navigate('/voto-exito', { 
                    state: { 
                        votante: votante,
                        // NO incluir la selección para mantener el secreto del voto
                        votoRegistrado: true
                    } 
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
                                seleccion === lista.id ? "seleccionado" : ""
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
                                    seleccion === lista.id ? "checked" : ""
                                }`}
                            ></div>
                        </div>
                    ))}
                    <div
                        className={`votar-blanco-card ${
                            seleccion === "blanco" ? "seleccionado" : ""
                        }`}
                        onClick={handleVotoBlanco}
                    >
                        <div className="votar-blanco-text">Voto en Blanco</div>
                        <div
                            className={`votar-checkbox ${
                                seleccion === "blanco" ? "checked" : ""
                            }`}
                        ></div>
                    </div>
                </div>
                {seleccion !== null && (
                    <button
                        className="votar-deseleccionar-btn"
                        onClick={() => setSeleccion(null)}
                    >
                        Deseleccionar
                    </button>
                )}
                <button
                    className="votar-btn"
                    onClick={handleIngresarVoto}
                    disabled={seleccion === null}
                >
                    Ingresar Voto
                </button>
                {mensaje && <div className="votar-mensaje">{mensaje}</div>}
            </div>
        </div>
    );
};

export default VotarPage;
