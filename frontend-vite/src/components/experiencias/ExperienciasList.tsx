import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import experienciaService from '../../services/experienciaService';
import type { ExperienciaListadoDTO, ExperienciasResponse, Categoria } from '../../types/experiencia.types';
import SkeletonCard from '../common/SkeletonCard';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [experiencias, setExperiencias] = useState<ExperienciaListadoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros básicos
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | ''>(
    (searchParams.get('categoria') as Categoria) || ''
  );
  const [filtroUbicacion, setFiltroUbicacion] = useState(
    searchParams.get('ubicacion') || ''
  );
  
  // Filtros avanzados
  const [busquedaTitulo, setBusquedaTitulo] = useState(
    searchParams.get('titulo') || ''
  );
  const [precioMin, setPrecioMin] = useState(
    searchParams.get('precioMin') || ''
  );
  const [precioMax, setPrecioMax] = useState(
    searchParams.get('precioMax') || ''
  );
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
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
  }, [currentPage, filtroCategoria, filtroUbicacion, busquedaTitulo, precioMin, precioMax]);

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
      
      let experienciasFiltradas = response.content;

      // Aplicar filtros avanzados en client-side
      experienciasFiltradas = aplicarFiltrosAvanzados(experienciasFiltradas);

      setExperiencias(experienciasFiltradas);
      setTotalPages(Math.ceil(experienciasFiltradas.length / pageSize));
      setTotalElements(experienciasFiltradas.length);
      
    } catch (error: any) {
      const errorMsg = 'Error al cargar las experiencias. Por favor, intenta nuevamente.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros avanzados
  const aplicarFiltrosAvanzados = (experiencias: ExperienciaListadoDTO[]): ExperienciaListadoDTO[] => {
    let resultado = [...experiencias];

    // Filtro por título
    if (busquedaTitulo.trim()) {
      const busqueda = busquedaTitulo.toLowerCase().trim();
      resultado = resultado.filter(exp => 
        exp.titulo.toLowerCase().includes(busqueda) ||
        exp.descripcion?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por precio mínimo
    if (precioMin) {
      const min = parseFloat(precioMin);
      resultado = resultado.filter(exp => exp.precio >= min);
    }

    // Filtro por precio máximo
    if (precioMax) {
      const max = parseFloat(precioMax);
      resultado = resultado.filter(exp => exp.precio <= max);
    }

    return resultado;
  };

  // Actualizar URL con query params
  const actualizarFiltrosEnURL = () => {
    const params = new URLSearchParams();
    
    if (filtroCategoria) params.set('categoria', filtroCategoria);
    if (filtroUbicacion) params.set('ubicacion', filtroUbicacion);
    if (busquedaTitulo) params.set('titulo', busquedaTitulo);
    if (precioMin) params.set('precioMin', precioMin);
    if (precioMax) params.set('precioMax', precioMax);

    setSearchParams(params);
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusquedaTitulo('');
    setPrecioMin('');
    setPrecioMax('');
    setFiltroCategoria('');
    setFiltroUbicacion('');
    setCurrentPage(0);
    setSearchParams(new URLSearchParams());
  };

  // Aplicar filtros y actualizar URL
  const aplicarFiltros = () => {
    setCurrentPage(0);
    actualizarFiltrosEnURL();
    loadExperiencias();
  };

  const handleCategoriaChange = (nuevaCategoria: Categoria | '') => {
    setFiltroCategoria(nuevaCategoria);
    setCurrentPage(0);
    actualizarFiltrosEnURL();
  };

  const handleUbicacionChange = (nuevaUbicacion: string) => {
    setFiltroUbicacion(nuevaUbicacion);
    setCurrentPage(0);
  };

  const clearFilters = () => {
    limpiarFiltros();
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

  // Removed: showing skeletons inline instead of separate loading state

  return (
    <div className={`experiencias-list-container ${className}`}>
      {showFilters && (
        <div className="experiencias-filters">
          <div className="filters-header">
            <h3>🔍 Filtrar Experiencias</h3>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <i className="fas fa-sliders-h me-1"></i>
                Filtros Avanzados
              </button>
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={clearFilters}
                disabled={!filtroCategoria && !filtroUbicacion && !busquedaTitulo && !precioMin && !precioMax}
              >
                <i className="fas fa-times me-1"></i>
                Limpiar
              </button>
            </div>
          </div>

          <div className="filters-row">
            {/* Filtro por categoría */}
            <div className="filter-group">
              <label htmlFor="categoria-filter">Categoría:</label>
              <select
                id="categoria-filter"
                value={filtroCategoria}
                onChange={(e) => handleCategoriaChange(e.target.value as Categoria | '')}
                className="filter-select form-select"
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
                className="filter-input form-control"
              />
            </div>
          </div>

          {/* Panel de Filtros Avanzados */}
          {mostrarFiltros && (
            <div className="advanced-filters mt-3 pt-3 border-top">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small mb-1">
                    <i className="fas fa-search me-1"></i>
                    Buscar por título
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Nombre de la experiencia..."
                    value={busquedaTitulo}
                    onChange={(e) => setBusquedaTitulo(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small mb-1">
                    <i className="fas fa-dollar-sign me-1"></i>
                    Precio mínimo
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="0"
                    value={precioMin}
                    onChange={(e) => setPrecioMin(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small mb-1">
                    <i className="fas fa-dollar-sign me-1"></i>
                    Precio máximo
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="999999"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                  />
                </div>

                <div className="col-md-2 d-flex align-items-end">
                  <button
                    className="btn btn-sm btn-primary w-100"
                    onClick={aplicarFiltros}
                  >
                    <i className="fas fa-check me-1"></i>
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Indicador de filtros activos */}
              {(busquedaTitulo || precioMin || precioMax) && (
                <div className="mt-2">
                  <small className="text-primary">
                    <i className="fas fa-info-circle me-1"></i>
                    Filtros activos: 
                    {busquedaTitulo && ` Título`}
                    {precioMin && ` Precio ≥ $${precioMin}`}
                    {precioMax && ` Precio ≤ $${precioMax}`}
                  </small>
                </div>
              )}
            </div>
          )}

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

      {loading ? (
        /* Skeleton Loaders mientras carga */
        <div className="experiencias-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} variant="experiencia" />
          ))}
        </div>
      ) : experiencias.length > 0 ? (
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
      ) : null}
    </div>
  );
};

export default ExperienciasList;