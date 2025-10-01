import React from 'react';

const HowItWorks: React.FC = () => (
  <div className="container py-5">
    <h2 className="h4 mb-4 text-primary">Cómo funciona</h2>
    <div className="row g-4">
      <div className="col-6 col-md-3">
        <div className="p-3 bg-white shadow-sm h-100 rounded text-center">
          <div className="display-6">🔍</div>
          <p className="small mt-2 mb-0">Explorá categorías y filtrá por destino.</p>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="p-3 bg-white shadow-sm h-100 rounded text-center">
          <div className="display-6">📅</div>
          <p className="small mt-2 mb-0">Elegí una fecha con cupos disponibles.</p>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="p-3 bg-white shadow-sm h-100 rounded text-center">
          <div className="display-6">💳</div>
          <p className="small mt-2 mb-0">Reservá y pagá de forma segura.</p>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="p-3 bg-white shadow-sm h-100 rounded text-center">
          <div className="display-6">🎟️</div>
          <p className="small mt-2 mb-0">Recibí tu ticket digital.</p>
        </div>
      </div>
    </div>
  </div>
);

export default HowItWorks;
