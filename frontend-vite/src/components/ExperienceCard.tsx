import React from 'react';
import { Link } from 'react-router-dom';
import type { Experience } from '../types/experiencia.types';

interface ExperienceCardProps {
  experience: Experience;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience }) => {
  const formatPrice = (price: number, currency: 'ARS' | 'USD') => {
    if (currency === 'USD') {
      return `US$ ${price.toLocaleString()}`;
    }
    return `$ ${price.toLocaleString()} ARS`;
  };

  const getCategoryBadgeClass = (categoryKey: string) => {
    const baseClass = 'badge ';
    switch (categoryKey) {
      case 'playa': return baseClass + 'bg-info';
      case 'montaña': return baseClass + 'bg-success';
      case 'aventura': return baseClass + 'bg-danger';
      case 'gastronomía': return baseClass + 'bg-warning text-dark';
      case 'cultura': return baseClass + 'bg-secondary';
      default: return baseClass + 'bg-primary';
    }
  };

  // `ExperienciaListadoDTO` mockado no expone salidas en detalle (esas están en ExperienciaDetalleDTO).
  // Usamos `proximasSalidas` como indicador simplificado para cards y evitamos leer propiedades inexistentes.
  const availableSlots = (experience.proximasSalidas && experience.proximasSalidas > 0) ? experience.proximasSalidas : 0;

  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0 rounded-4">
        <div className="position-relative">
          <img 
            src={experience.imagenUrl || '/assets/img/placeholder-experiencia.jpg'} 
            alt={experience.titulo || 'Experiencia'}
            className="card-img-top rounded-top-4"
            style={{ height: '200px', objectFit: 'cover' }}
          />
          <div className="position-absolute top-0 end-0 m-3">
            {(() => {
              const catKey = (String(experience.categoria || '')).toLowerCase();
              return (
                <span className={getCategoryBadgeClass(catKey)}>
                  {catKey || experience.categoria || 'Categoría'}
                </span>
              );
            })()}
          </div>
          {availableSlots === 0 && (
            <div className="position-absolute top-0 start-0 m-3">
              <span className="badge bg-dark">Sin cupo</span>
            </div>
          )}
        </div>
        
        <div className="card-body d-flex flex-column">
          <h5 className="card-title mb-2">{experience.titulo}</h5>
          
          <div className="mb-2">
            <small className="text-muted">
              <i className="fas fa-map-marker-alt me-1"></i>
              {experience.ubicacion?.ciudad || '—'}, {experience.ubicacion?.pais || '—'}
            </small>
          </div>
          
          <p className="card-text text-muted flex-grow-1">
            {experience.descripcion && experience.descripcion.length > 100 
              ? experience.descripcion.substring(0, 100) + '...' 
              : (experience.descripcion || '')}
          </p>
          
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="fw-bold text-primary fs-5">
                {formatPrice(experience.precio ?? 0, (experience.moneda as 'ARS' | 'USD') || 'ARS')}
              </div>
              <small className="text-muted">
                {availableSlots > 0 ? `${availableSlots} salida(s)` : 'Sin salidas'}
              </small>
            </div>
            
            <Link 
              to={`/experiencias/${experience.id}`} 
              className="btn btn-primary w-100"
            >
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;