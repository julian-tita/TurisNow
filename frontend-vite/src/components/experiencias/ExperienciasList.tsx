import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import experienciaService from '../../services/experienciaService';
import type { ExperienciaListadoDTO, ExperienciasResponse, Categoria } from '../../types/experiencia.types';

interface ExperienciasListProps {
  showFilters?: boolean;
  maxItems?: number;
  categoria?: Categoria;
  className?: string;
}

const ExperienciasList: React.FC<ExperienciasListProps> = ({
  showFilters = true,
  maxItems,
  categoria,
  className = ''
}) => {
  const [experiencias, setExperiencias] = useState<ExperienciaListadoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | ''>('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const pageSize = maxItems || 6;

  // Categorías disponibles
  const categorias: { value: Categoria; label: string }[] = [
    { value: 'PLAYA', label: '🏖️ Playa' },
    { value: 'MONTANA', label: '🏔️ Montaña' },
    { value: 'AVENTURA', label: '🚀 Aventura' },
    { value: 'GASTRONOMIA', label: '🍽️ Gastronomía' },
    { value: 'CULTURA', label: '🎭 Cultura' }
  ];

  useEffect(() => {
    if (categoria) {
      setFiltroCategoria(categoria);
    }
  }, [categoria]);

  useEffect(() => {
    loadExperiencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filtroCategoria, filtroUbicacion]);

  const loadExperiencias = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        categoria: filtroCategoria || undefined,
        ubicacion: filtroUbicacion || undefined,
        page: currentPage,
        size: pageSize,
        sort: 'id',
        direction: 'ASC' as const
      };

      const response: ExperienciasResponse = await experienciaService.getAllExperiencias(filters);
      
      setExperiencias(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      
    } catch (error: any) {
      console.error('Error loading experiencias:', error);
      setError('Error al cargar las experiencias. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaChange = (nuevaCategoria: Categoria | '') => {
    setFiltroCategoria(nuevaCategoria);
    setCurrentPage(0);
  };

  const handleUbicacionChange = (nuevaUbicacion: string) => {
    setFiltroUbicacion(nuevaUbicacion);
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFiltroCategoria('');
    setFiltroUbicacion('');
    setCurrentPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (precio: number, moneda: string) => {
    const formatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda === 'ARS' ? 'ARS' : 'USD',
      minimumFractionDigits: 0
    });
    return formatter.format(precio);
  };

  const getUbicacionCompleta = (ubicacion: any) => {
    if (ubicacion.region) {
      return `${ubicacion.ciudad}, ${ubicacion.region}, ${ubicacion.pais}`;
    }
    return `${ubicacion.ciudad}, ${ubicacion.pais}`;
  };

  if (loading && experiencias.length === 0) {
    return (
      <div className="experiencias-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando experiencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`experiencias-list-container ${className}`}>
      {showFilters && (
        <div className="experiencias-filters">
          <div className="filters-header">
            <h3>🔍 Filtrar Experiencias</h3>
            <button 
              className="btn-clear-filters"
              onClick={clearFilters}
              disabled={!filtroCategoria && !filtroUbicacion}
            >
              🗑️ Limpiar
            </button>
          </div>

          <div className="filters-row">
            {/* Filtro por categoría */}
            <div className="filter-group">
              <label htmlFor="categoria-filter">Categoría:</label>
              <select
                id="categoria-filter"
                value={filtroCategoria}
                onChange={(e) => handleCategoriaChange(e.target.value as Categoria | '')}
                className="filter-select"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por ubicación */}
            <div className="filter-group">
              <label htmlFor="ubicacion-filter">Ubicación:</label>
              <input
                id="ubicacion-filter"
                type="text"
                placeholder="Ej: Buenos Aires, París..."
                value={filtroUbicacion}
                onChange={(e) => handleUbicacionChange(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          {/* Resultados info */}
          <div className="results-info">
            <p>
              {loading ? (
                'Buscando...'
              ) : (
                `Mostrando ${experiencias.length} de ${totalElements} experiencias`
              )}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={loadExperiencias} className="btn-retry">
            🔄 Reintentar
          </button>
        </div>
      )}

      {!loading && experiencias.length === 0 && !error && (
        <div className="no-results">
          <div className="no-results-content">
            <h3>🔍 No se encontraron experiencias</h3>
            <p>Intenta ajustar los filtros o busca algo diferente.</p>
            <button onClick={clearFilters} className="btn-clear-filters">
              Ver todas las experiencias
            </button>
          </div>
        </div>
      )}

      {experiencias.length > 0 && (
        <>
          <div className="experiencias-grid">
            {experiencias.map((experiencia) => (
              <div key={experiencia.id} className="experiencia-card">
                <div className="card-image">
                  {experiencia.imagenUrl ? (
                    <img 
                      src={experiencia.imagenUrl} 
                      alt={experiencia.titulo}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/img/placeholder-experiencia.jpg';
                      }}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <span className="placeholder-icon">🏞️</span>
                      <span className="placeholder-text">Imagen no disponible</span>
                    </div>
                  )}
                  
                  <div className="card-category">
                    {categorias.find(cat => cat.value === experiencia.categoria)?.label || experiencia.categoria}
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="card-title">{experiencia.titulo}</h3>
                  
                  <p className="card-description">
                    {experiencia.descripcion.length > 120 
                      ? `${experiencia.descripcion.substring(0, 120)}...` 
                      : experiencia.descripcion
                    }
                  </p>

                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{getUbicacionCompleta(experiencia.ubicacion)}</span>
                    </div>

                    <div className="detail-item price">
                      <span className="detail-icon">💰</span>
                      <span className="detail-text price-text">
                        {formatPrice(experiencia.precio, experiencia.moneda)}
                      </span>
                    </div>

                    {experiencia.proximasSalidas && experiencia.proximasSalidas > 0 && (
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <span className="detail-text">
                          {experiencia.proximasSalidas} salida{experiencia.proximasSalidas > 1 ? 's' : ''} disponible{experiencia.proximasSalidas > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {experiencia.tags.length > 0 && (
                    <div className="card-tags">
                      {experiencia.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                      {experiencia.tags.length > 3 && (
                        <span className="tag more-tags">
                          +{experiencia.tags.length - 3} más
                        </span>
                      )}
                    </div>
                  )}

                  <div className="card-actions">
                    <Link 
                      to={`/experiencias/${experiencia.id}`}
                      className="btn-ver-detalle"
                    >
                      Ver Detalle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {!maxItems && totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                ← Anterior
              </button>

              <div className="pagination-info">
                <span>
                  Página {currentPage + 1} de {totalPages}
                </span>
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="pagination-btn"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {loading && experiencias.length > 0 && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default ExperienciasList;