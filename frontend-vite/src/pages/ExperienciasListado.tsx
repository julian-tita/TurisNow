import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ExperienciasList from '../components/experiencias/ExperienciasList';
import type { Categoria } from '../types/experiencia.types';

const ExperienciasListado: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoria = searchParams.get('categoria') as Categoria | null;

  return (
    <div className="experiencias-listado-page">
      {/* Hero Section */}
      <div className="experiencias-hero">
        <div className="hero-content">
          <h1>🌟 Experiencias Únicas</h1>
          <p>Descubre aventuras increíbles y crea recuerdos inolvidables</p>
          {categoria && (
            <div className="hero-filter-info">
              <span className="filter-badge">
                Mostrando experiencias de: {categoria}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="experiencias-container">
        <ExperienciasList 
          showFilters={true}
          categoria={categoria || undefined}
          className="main-experiences-list"
        />
      </div>
    </div>
  );
};

export default ExperienciasListado;