import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Experience, Category } from '../types/experience';
import { getExperiences } from '../data/experiences';
import ExperienceCard from '../components/ExperienceCard';

const ExperienciasListado: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('categoria') || '');
  const [locationFilter, setLocationFilter] = useState<string>('');
  
  const experiencesPerPage = 6;

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      try {
        const data = await getExperiences();
        setExperiences(data);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  useEffect(() => {
    let filtered = experiences;

    // Filtrar por categoría
    if (categoryFilter) {
      filtered = filtered.filter(exp => exp.category === categoryFilter);
    }

    // Filtrar por ubicación
    if (locationFilter.trim()) {
      filtered = filtered.filter(exp => 
        exp.location.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        exp.location.region?.toLowerCase().includes(locationFilter.toLowerCase()) ||
        exp.location.country.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredExperiences(filtered);
    setCurrentPage(1); // Resetear página al filtrar
  }, [experiences, categoryFilter, locationFilter]);

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    if (category) {
      setSearchParams({ categoria: category });
    } else {
      setSearchParams({});
    }
  };

  const categories: { value: Category; label: string }[] = [
    { value: 'playa', label: 'Playa' },
    { value: 'montaña', label: 'Montaña' },
    { value: 'aventura', label: 'Aventura' },
    { value: 'gastronomía', label: 'Gastronomía' },
    { value: 'cultura', label: 'Cultura' }
  ];

  // Paginación
  const indexOfLastExperience = currentPage * experiencesPerPage;
  const indexOfFirstExperience = indexOfLastExperience - experiencesPerPage;
  const currentExperiences = filteredExperiences.slice(indexOfFirstExperience, indexOfLastExperience);
  const totalPages = Math.ceil(filteredExperiences.length / experiencesPerPage);

  // Componente Skeleton
  const SkeletonCard = () => (
    <div className="col">
      <div className="card h-100 border-0">
        <div className="bg-light rounded-top-4" style={{ height: '200px' }}></div>
        <div className="card-body">
          <div className="bg-light rounded mb-2" style={{ height: '24px' }}></div>
          <div className="bg-light rounded mb-3" style={{ height: '16px', width: '60%' }}></div>
          <div className="bg-light rounded mb-2" style={{ height: '16px' }}></div>
          <div className="bg-light rounded mb-3" style={{ height: '16px', width: '80%' }}></div>
          <div className="bg-light rounded" style={{ height: '38px' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid" style={{ paddingTop: '120px' }}>
      <div className="container my-5">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="display-5 fw-bold text-primary mb-3">
              <i className="fas fa-list me-3"></i>
              Experiencias
            </h1>
            <p className="lead text-muted">
              Descubre todas nuestras experiencias disponibles
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="categorySelect" className="form-label fw-semibold">
                  <i className="fas fa-filter me-2"></i>Categoría
                </label>
                <select
                  id="categorySelect"
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="locationInput" className="form-label fw-semibold">
                  <i className="fas fa-map-marker-alt me-2"></i>Ubicación
                </label>
                <input
                  id="locationInput"
                  type="text"
                  className="form-control"
                  placeholder="Buscar por ciudad..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>
            
            {(categoryFilter || locationFilter) && (
              <div className="mt-3">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setCategoryFilter('');
                    setLocationFilter('');
                    setSearchParams({});
                  }}
                >
                  <i className="fas fa-times me-2"></i>Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        {isLoading ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredExperiences.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="fas fa-search text-muted" style={{ fontSize: '4rem' }}></i>
            </div>
            <h3 className="text-muted mb-3">No se encontraron experiencias</h3>
            <p className="text-muted mb-4">
              Intenta ajustar los filtros para obtener más resultados
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setCategoryFilter('');
                setLocationFilter('');
                setSearchParams({});
              }}
            >
              Ver todas las experiencias
            </button>
          </div>
        ) : (
          <>
            {/* Grid de experiencias */}
            <div className="mb-4">
              <small className="text-muted">
                Mostrando {indexOfFirstExperience + 1} - {Math.min(indexOfLastExperience, filteredExperiences.length)} de {filteredExperiences.length} experiencias
              </small>
            </div>
            
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
              {currentExperiences.map(experience => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <nav aria-label="Paginación de experiencias">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  </li>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExperienciasListado;