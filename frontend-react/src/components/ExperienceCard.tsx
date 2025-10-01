import React from 'react';
import { Link } from 'react-router-dom';
import { Experience } from '../types/experience';

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

  const getCategoryBadgeClass = (category: string) => {
    const baseClass = 'badge ';
    switch (category) {
      case 'playa': return baseClass + 'bg-info';
      case 'montaña': return baseClass + 'bg-success';
      case 'aventura': return baseClass + 'bg-danger';
      case 'gastronomía': return baseClass + 'bg-warning text-dark';
      case 'cultura': return baseClass + 'bg-secondary';
      default: return baseClass + 'bg-primary';
    }
  };

  const availableSlots = experience.departures.reduce((total, dep) => total + dep.capacityLeft, 0);

  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0 rounded-4">
        <div className="position-relative">
          <img 
            src={experience.mainImageUrl} 
            alt={experience.title}
            className="card-img-top rounded-top-4"
            style={{ height: '200px', objectFit: 'cover' }}
          />
          <div className="position-absolute top-0 end-0 m-3">
            <span className={getCategoryBadgeClass(experience.category)}>
              {experience.category}
            </span>
          </div>
          {availableSlots === 0 && (
            <div className="position-absolute top-0 start-0 m-3">
              <span className="badge bg-dark">Sin cupo</span>
            </div>
          )}
        </div>
        
        <div className="card-body d-flex flex-column">
          <h5 className="card-title mb-2">{experience.title}</h5>
          
          <div className="mb-2">
            <small className="text-muted">
              <i className="fas fa-map-marker-alt me-1"></i>
              {experience.location.city}, {experience.location.country}
            </small>
          </div>
          
          <p className="card-text text-muted flex-grow-1">
            {experience.description.length > 100 
              ? experience.description.substring(0, 100) + '...' 
              : experience.description}
          </p>
          
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="fw-bold text-primary fs-5">
                {formatPrice(experience.price, experience.currency)}
              </div>
              <small className="text-muted">
                {availableSlots > 0 ? `${availableSlots} lugares` : 'Completo'}
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