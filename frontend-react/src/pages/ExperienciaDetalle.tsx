import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Experience } from '../types/experience';
import { getExperienceById, mockExperiences } from '../data/experiences';
import ExperienceCard from '../components/ExperienceCard';

const ExperienciaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedExperiences, setRelatedExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    const fetchExperience = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await getExperienceById(id);
        setExperience(data);
        
        if (data) {
          // Obtener experiencias relacionadas (misma categoría, excluyendo la actual)
          const related = mockExperiences
            .filter(exp => exp.category === data.category && exp.id !== data.id)
            .slice(0, 3);
          setRelatedExperiences(related);
        }
      } catch (error) {
        console.error('Error fetching experience:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperience();
  }, [id]);

  const formatPrice = (price: number, currency: 'ARS' | 'USD') => {
    if (currency === 'USD') {
      return `US$ ${price.toLocaleString()}`;
    }
    return `$ ${price.toLocaleString()} ARS`;
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (isLoading) {
    return (
      <div className="container-fluid" style={{ paddingTop: '120px' }}>
        <div className="container my-5">
          <div className="row">
            <div className="col-12">
              {/* Skeleton del hero */}
              <div className="bg-light rounded-4 mb-4" style={{ height: '400px' }}></div>
              <div className="bg-light rounded mb-3" style={{ height: '32px', width: '70%' }}></div>
              <div className="bg-light rounded mb-4" style={{ height: '24px', width: '40%' }}></div>
              <div className="bg-light rounded mb-2" style={{ height: '20px' }}></div>
              <div className="bg-light rounded mb-2" style={{ height: '20px' }}></div>
              <div className="bg-light rounded" style={{ height: '20px', width: '80%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="container-fluid" style={{ paddingTop: '120px' }}>
        <div className="container my-5">
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
            </div>
            <h2 className="text-muted mb-3">Experiencia no encontrada</h2>
            <p className="text-muted mb-4">
              La experiencia que buscas no existe o ha sido removida.
            </p>
            <Link to="/experiencias" className="btn btn-primary">
              <i className="fas fa-arrow-left me-2"></i>
              Volver a experiencias
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ paddingTop: '120px' }}>
      <div className="container my-5">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">Inicio</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/experiencias" className="text-decoration-none">Experiencias</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {experience.title}
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="row mb-5">
          <div className="col-lg-8">
            <div className="position-relative mb-4">
              <img 
                src={experience.mainImageUrl} 
                alt={experience.title}
                className="img-fluid w-100 rounded-4"
                style={{ height: '400px', objectFit: 'cover' }}
              />
              <div className="position-absolute top-0 end-0 m-3">
                <span className={getCategoryBadgeClass(experience.category)}>
                  {experience.category}
                </span>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 sticky-top" style={{ top: '120px' }}>
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="display-4 fw-bold text-primary mb-2">
                    {formatPrice(experience.price, experience.currency)}
                  </div>
                  <small className="text-muted">por persona</small>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-semibold mb-2">
                    <i className="fas fa-map-marker-alt text-primary me-2"></i>
                    Ubicación
                  </h6>
                  <p className="mb-0 text-muted">
                    {experience.location.city}
                    {experience.location.region && `, ${experience.location.region}`}, {experience.location.country}
                  </p>
                </div>
                
                <div className="mb-4">
                  <h6 className="fw-semibold mb-2">
                    <i className="fas fa-tags text-primary me-2"></i>
                    Etiquetas
                  </h6>
                  <div className="d-flex flex-wrap gap-1">
                    {experience.tags.map((tag, index) => (
                      <span key={index} className="badge bg-light text-dark">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="row">
          <div className="col-lg-8">
            {/* Título y descripción */}
            <h1 className="display-6 fw-bold mb-3">{experience.title}</h1>
            <p className="lead text-muted mb-4">{experience.description}</p>

            {/* Salidas próximas */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-header bg-transparent border-0 pb-0">
                <h4 className="mb-3">
                  <i className="fas fa-calendar-alt text-primary me-2"></i>
                  Salidas próximas
                </h4>
              </div>
              <div className="card-body pt-0">
                {experience.departures.length === 0 ? (
                  <p className="text-muted">No hay salidas programadas en este momento.</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {experience.departures.map((departure) => (
                      <div key={departure.id} className="list-group-item border-0 px-0 py-3">
                        <div className="row align-items-center">
                          <div className="col-md-6">
                            <div className="mb-1">
                              <strong>{formatDateTime(departure.startAt)}</strong>
                            </div>
                            {departure.endAt && (
                              <small className="text-muted">
                                Hasta: {formatDateTime(departure.endAt)}
                              </small>
                            )}
                          </div>
                          
                          <div className="col-md-3">
                            <div className="text-center">
                              {departure.capacityLeft > 0 ? (
                                <>
                                  <div className="fw-semibold text-success">
                                    {departure.capacityLeft} lugares
                                  </div>
                                  <small className="text-muted">
                                    de {departure.capacityTotal}
                                  </small>
                                </>
                              ) : (
                                <span className="badge bg-danger">Sin cupo</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="col-md-3">
                            <Link
                              to={`/reservar/${experience.id}?departure=${departure.id}`}
                              className={`btn w-100 ${departure.capacityLeft > 0 ? 'btn-primary' : 'btn-secondary disabled'}`}
                            >
                              {departure.capacityLeft > 0 ? 'Reservar' : 'Completo'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Experiencias relacionadas */}
        {relatedExperiences.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-4">También te puede interesar</h3>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {relatedExperiences.map(relatedExp => (
                <ExperienceCard key={relatedExp.id} experience={relatedExp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienciaDetalle;