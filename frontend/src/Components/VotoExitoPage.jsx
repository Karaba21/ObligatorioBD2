import React from 'react';
import '../Styles/VotoExitoPage.css';

const VotoExitoPage = () => {
  return (
    <div className="exito-container">
      <div className="exito-header">
        <span className="exito-cc">CC: AKA - 150</span>
      </div>
      <div className="exito-card">
        <span className="exito-mensaje">Tu voto ha sido registrado con exito</span>
      </div>
      <button className="exito-btn">Finalizar</button>
    </div>
  );
};

export default VotoExitoPage; 