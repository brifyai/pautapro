import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="loading-text">Cargando...</div>
        <img src="/loading.svg" alt="Cargando..." />
      </div>
    </div>
  );
};

export default Loading;