import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/RecuentoVotos.css";

const RecuentoVotos = () => {
    const navigate = useNavigate();
    const [recuento, setRecuento] = useState(null);
    const [recuentoCircuitos, setRecuentoCircuitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [circuitosAbiertos, setCircuitosAbiertos] = useState([]);
    const [votosObservados, setVotosObservados] = useState(null);
    const [recuentoDepartamentos, setRecuentoDepartamentos] = useState([]);
    const [departamentosAbiertos, setDepartamentosAbiertos] = useState([]);
    const [todosDepartamentos, setTodosDepartamentos] = useState([]);

    useEffect(() => {
        cargarRecuento();
    }, []);

    const cargarRecuento = async () => {
        try {
            setLoading(true);
            setError("");

            const [resTotal, resCircuitos, resObservados, resDepartamentos, resTodosDepartamentos] = await Promise.all([
                fetch("http://localhost:5001/api/recuento-votos"),
                fetch("http://localhost:5001/api/recuento-votos-circuito"),
                fetch("http://localhost:5001/api/votos-observados"),
                fetch("http://localhost:5001/api/recuento-votos-departamento"),
                fetch("http://localhost:5001/api/departamentos")
            ]);
            const dataTotal = await resTotal.json();
            const dataCircuitos = await resCircuitos.json();
            const dataObservados = await resObservados.json();
            const dataDepartamentos = await resDepartamentos.json();
            const dataTodosDepartamentos = await resTodosDepartamentos.json();

            if (dataTotal.success) {
                setRecuento(dataTotal.data);
            } else {
                setError(dataTotal.error || "Error al cargar el recuento");
            }
            if (dataCircuitos.success) {
                setRecuentoCircuitos(dataCircuitos.data);
            } else {
                setError(dataCircuitos.error || "Error al cargar recuento por circuito");
            }
            if (dataObservados.success) {
                setVotosObservados(dataObservados.totalVotosObservados);
            } else {
                setError(dataObservados.error || "Error al cargar votos observados");
            }
            if (dataDepartamentos.success) {
                setRecuentoDepartamentos(dataDepartamentos.data);
            } else {
                setError(dataDepartamentos.error || "Error al cargar recuento por departamento");
            }
            if (dataTodosDepartamentos.success) {
                setTodosDepartamentos(dataTodosDepartamentos.data.map(dep => dep.Nombre));
            } else {
                setError(dataTodosDepartamentos.error || "Error al cargar lista de departamentos");
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

    const toggleCircuito = (circuitoId) => {
        setCircuitosAbiertos((prev) =>
            prev.includes(circuitoId)
                ? prev.filter((id) => id !== circuitoId)
                : [...prev, circuitoId]
        );
    };

    const toggleDepartamento = (nombre) => {
        setDepartamentosAbiertos((prev) =>
            prev.includes(nombre)
                ? prev.filter((dep) => dep !== nombre)
                : [...prev, nombre]
        );
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
                    <div className="recuento-stat-card">
                        <h3>Votos Observados</h3>
                        <span className="recuento-stat-numero">
                            {votosObservados !== null ? votosObservados.toLocaleString() : "-"}
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
                                        {lista.numeroLista !== null ? lista.nombrePartido : lista.nombrePartido}
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

                {/* Recuento por Circuito - Lista Expandible */}
                <div className="recuento-circuitos">
                    <h2 className="recuento-seccion-titulo">
                        Recuento por Circuito
                    </h2>
                    {recuentoCircuitos.length === 0 && (
                        <p>No hay datos de circuitos.</p>
                    )}
                    {recuentoCircuitos.map((circuito) => (
                        <div key={circuito.circuito} className="recuento-circuito-item">
                            <button
                                className="recuento-circuito-btn"
                                onClick={() => toggleCircuito(circuito.circuito)}
                            >
                                Circuito {circuito.circuito} - Votos Totales: {circuito.votosTotales}
                                <span style={{ marginLeft: 24, fontWeight: 500, color: '#165bbd' }}>
                                    Observados: {circuito.votosObservados}
                                </span>
                                <span style={{ marginLeft: 8 }}>
                                    {circuitosAbiertos.includes(circuito.circuito) ? "▲" : "▼"}
                                </span>
                            </button>
                            {circuitosAbiertos.includes(circuito.circuito) && (
                                <div className="recuento-circuito-detalle">
                                    {circuito.votosPorLista.length === 0 && (
                                        <p>No hay votos registrados en este circuito.</p>
                                    )}
                                    {circuito.votosPorLista.map((lista) => (
                                        <div key={lista.numeroLista ?? 'blanco'} className="recuento-partido-card circuito">
                                            <div className="recuento-partido-info" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h4 className="recuento-partido-nombre" style={{ margin: 0 }}>
                                                    {lista.numeroLista !== null ? lista.nombrePartido : lista.nombrePartido}
                                                </h4>
                                                <span className="recuento-votos-numero" style={{ marginLeft: '24px', minWidth: '32px', textAlign: 'right' }}>
                                                    {lista.votos.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Recuento por Departamento - Lista Expandible */}
                <div className="recuento-circuitos">
                    <h2 className="recuento-seccion-titulo">
                        Recuento por Departamento
                    </h2>
                    {todosDepartamentos.length === 0 && <p>No hay datos de departamentos.</p>}
                    {todosDepartamentos.map((nombreDep) => {
                        const dep = recuentoDepartamentos.find(d => d.departamento === nombreDep);
                        const totalVotos = dep
                            ? dep.votosPorLista.reduce((acc, l) => acc + l.votos, 0) + (dep.votosEnBlanco || 0)
                            : 0;
                        return (
                            <div key={nombreDep} className="recuento-circuito-item">
                                <button
                                    className="recuento-circuito-btn"
                                    onClick={() => toggleDepartamento(nombreDep)}
                                >
                                    {nombreDep} - Total: {totalVotos}
                                    <span style={{ marginLeft: 8 }}>
                                        {departamentosAbiertos.includes(nombreDep) ? "▲" : "▼"}
                                    </span>
                                </button>
                                {departamentosAbiertos.includes(nombreDep) && (
                                    <div className="recuento-circuito-detalle">
                                        {(!dep || dep.votosPorLista.length === 0) && (
                                            <p>Sin votos registrados en este departamento.</p>
                                        )}
                                        {dep && dep.votosPorLista.map((lista) => (
                                            <div key={lista.numeroLista} className="recuento-partido-card circuito">
                                                <div className="recuento-partido-info" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <h4 className="recuento-partido-nombre" style={{ margin: 0 }}>
                                                        {lista.nombreLista}
                                                    </h4>
                                                    <span className="recuento-votos-numero" style={{ marginLeft: '24px', minWidth: '32px', textAlign: 'right' }}>
                                                        {lista.votos.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="recuento-partido-card circuito" style={{ background: '#fffbe6', border: '1.5px solid #ffe082' }}>
                                            <div className="recuento-partido-info" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h4 className="recuento-partido-nombre" style={{ margin: 0, color: '#b8860b' }}>
                                                    VOTOS EN BLANCO
                                                </h4>
                                                <span className="recuento-votos-numero" style={{ marginLeft: '24px', minWidth: '32px', textAlign: 'right' }}>
                                                    {dep ? (dep.votosEnBlanco?.toLocaleString() || 0) : 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
