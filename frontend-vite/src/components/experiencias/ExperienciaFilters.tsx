import React from 'react';
import type { Categoria } from '../../types/experiencia.types';

interface ExperienciaFiltersProps {
  filtroCategoria: Categoria | '';
  filtroUbicacion: string;
  onCategoriaChange: (categoria: Categoria | '') => void;
  onUbicacionChange: (ubicacion: string) => void;
  onClearFilters: () => void;
  totalResults: number;
  loading?: boolean;
}

const ExperienciaFilters: React.FC<ExperienciaFiltersProps> = ({
  filtroCategoria,
  filtroUbicacion,
  onCategoriaChange,
  onUbicacionChange,
  onClearFilters,
  totalResults,
  loading = false
}) => {
  const categorias: { value: Categoria; label: string; icon: string }[] = [
    { value: 'PLAYA', label: 'Playa', icon: '🏖️' },
    { value: 'MONTANA', label: 'Montaña', icon: '🏔️' },
    { value: 'AVENTURA', label: 'Aventura', icon: '🚀' },
    { value: 'GASTRONOMIA', label: 'Gastronomía', icon: '🍽️' },
    { value: 'CULTURA', label: 'Cultura', icon: '🎭' }
  ];

  const hasActiveFilters = filtroCategoria || filtroUbicacion;

  return (
    <div className="experiencia-filters">
      {/* Header de filtros */}
      <div className="filters-header">
        <div className="filters-title">
          <h3>🔍 Filtrar Experiencias</h3>
          <div className="results-count">
            {loading ? (
              <span className="loading-text">Buscando...</span>
            ) : (
              <span className="count-text">
                {totalResults} experiencia{totalResults !== 1 ? 's' : ''} encontrada{totalResults !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        {hasActiveFilters && (
          <button 
            className="btn-clear-filters"
            onClick={onClearFilters}
            title="Limpiar todos los filtros"
          >
            <span className="clear-icon">🗑️</span>
            <span className="clear-text">Limpiar</span>
          </button>
        )}
      </div>

      {/* Filtros por categoría (chips) */}
      <div className="filter-section">
        <label className="filter-label">Categorías:</label>
        <div className="category-chips">
          <button
            className={`category-chip ${!filtroCategoria ? 'active' : ''}`}
            onClick={() => onCategoriaChange('')}
          >
            <span className="chip-icon">🌟</span>
            <span className="chip-text">Todas</span>
          </button>
          
          {categorias.map((categoria) => (
            <button
              key={categoria.value}
              className={`category-chip ${filtroCategoria === categoria.value ? 'active' : ''}`}
              onClick={() => onCategoriaChange(categoria.value)}
            >
              <span className="chip-icon">{categoria.icon}</span>
              <span className="chip-text">{categoria.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por ubicación */}
      <div className="filter-section">
        <label htmlFor="ubicacion-filter" className="filter-label">
          📍 Ubicación:
        </label>
        <div className="input-wrapper">
          <input
            id="ubicacion-filter"
            type="text"
            placeholder="Ej: Buenos Aires, París, Roma..."
            value={filtroUbicacion}
            onChange={(e) => onUbicacionChange(e.target.value)}
            className="filter-input"
          />
          {filtroUbicacion && (
            <button 
              className="input-clear"
              onClick={() => onUbicacionChange('')}
              title="Limpiar ubicación"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filtros activos (tags) */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Filtros activos:</span>
          <div className="active-filters-tags">
            {filtroCategoria && (
              <span className="active-filter-tag">
                {categorias.find(cat => cat.value === filtroCategoria)?.icon} {categorias.find(cat => cat.value === filtroCategoria)?.label}
                <button 
                  className="remove-filter"
                  onClick={() => onCategoriaChange('')}
                  title="Remover filtro de categoría"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filtroUbicacion && (
              <span className="active-filter-tag">
                📍 {filtroUbicacion}
                <button 
                  className="remove-filter"
                  onClick={() => onUbicacionChange('')}
                  title="Remover filtro de ubicación"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Línea separadora */}
      <div className="filters-divider"></div>
    </div>
  );
};

export default ExperienciaFilters;