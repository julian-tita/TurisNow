import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <div className="loading-text">Cargando dashboard...</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
