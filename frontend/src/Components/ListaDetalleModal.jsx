import React from "react";
import "../Styles/ListaDetalleModal.css";

const ListaDetalleModal = ({ abierto, onClose, detalles }) => {
    if (!abierto || !detalles) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <button className="modal-cerrar" onClick={onClose}>X</button>
                <h2>Detalles de la Lista {detalles.numeroLista}</h2>
                <p><strong>Partido:</strong> {detalles.partido.nombre}</p>
                <p><strong>Sede:</strong> {detalles.partido.sede}</p>
                <p style={{marginBottom: 6, fontWeight: 600, color: "#165bbd"}}>Candidatos:</p>
                <ul>
                    {detalles.candidatos.map((c) => (
                        <li key={c.ci}>
                            {c.nombre} - {c.posicion === 1 ? "Presidente" : c.posicion === 2 ? "Vice" : "Miembro de lista"}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ListaDetalleModal;