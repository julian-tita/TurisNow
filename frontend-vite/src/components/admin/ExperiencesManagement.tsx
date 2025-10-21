import React, { useState, useEffect, useCallback } from 'react';
import { experienciaService } from '../../services/experienciaService';
import type { 
  ExperienciaListadoDTO, 
  ExperienciaDetalleDTO,
  Categoria, 
  PageResponse 
} from '../../types/experiencia.types';
import ExperienciaForm from './ExperienciaForm';
import SalidasManagement from './SalidasManagement';

const ExperiencesManagement: React.FC = () => {
  // Estados principales
  const [experiences, setExperiences] = useState<ExperienciaListadoDTO[]>([]);
  const [pageResponse, setPageResponse] = useState<PageResponse<ExperienciaListadoDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Categoria | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  
  // Estados de modales
  const [showForm, setShowForm] = useState(false);
  const [showSalidas, setShowSalidas] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienciaDetalleDTO | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);

  // Cargar experiencias desde el backend
  const loadExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        categoria: filterCategory !== 'ALL' ? filterCategory : undefined,
        ubicacion: searchTerm.trim() || undefined
      };
      
      const response = await experienciaService.getAllExperiencias(filters);
      
      setPageResponse(response);
      setExperiences(response.content);
    } catch (err) {
      console.error('Error loading experiences:', err);
      setError('Error al cargar las experiencias. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchTerm]);

  // Efecto para cargar datos iniciales y cuando cambien los filtros
  useEffect(() => {
    loadExperiences();
  }, [currentPage, filterCategory, loadExperiences]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0); // Reset a primera página
      loadExperiences();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, loadExperiences]);

  // Available categories for filter
  const categories: Array<{ value: Categoria | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'Todas las categorías' },
    { value: 'AVENTURA', label: '🏔️ Aventura' },
    { value: 'CULTURA', label: '🏛️ Cultura' },
    { value: 'GASTRONOMIA', label: '🍽️ Gastronomía' },
    { value: 'PLAYA', label: '🏖️ Playa' },
    { value: 'MONTANA', label: '⛰️ Montaña' }
  ];

  // Handlers for CRUD operations
  const handleNewExperience = () => {
    setEditingExperience(null);
    setShowForm(true);
  };

  const handleEditExperience = async (experiencia: ExperienciaListadoDTO) => {
    try {
      setLoading(true);
      const detail = await experienciaService.getExperienciaById(experiencia.id);
      setEditingExperience(detail);
      setShowForm(true);
    } catch (err) {
      console.error('Error loading experiencia detail:', err);
      setError('Error al cargar los detalles de la experiencia');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (experienceId: number) => {
    try {
      await experienciaService.toggleExperienciaStatus(experienceId);
      await loadExperiences(); // Reload to get updated data
    } catch (err) {
      console.error('Error toggling experiencia status:', err);
      setError('Error al cambiar el estado de la experiencia');
    }
  };

  const handleDeleteExperience = async (experienceId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta experiencia? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await experienciaService.deleteExperiencia(experienceId);
      await loadExperiences(); // Reload data after deletion
    } catch (err) {
      console.error('Error deleting experiencia:', err);
      setError('Error al eliminar la experiencia');
    }
  };

  const handleManageSalidas = (experienciaId: number) => {
    setSelectedExperienceId(experienciaId);
    setShowSalidas(true);
  };

  const handleFormSave = async () => {
    setShowForm(false);
    setEditingExperience(null);
    await loadExperiences(); // Reload data after save
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingExperience(null);
  };

  const handleSalidasClose = () => {
    setShowSalidas(false);
    setSelectedExperienceId(null);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && pageResponse && newPage < pageResponse.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(e.target.value as Categoria | 'ALL');
    setCurrentPage(0); // Reset to first page
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
        <p>Cargando experiencias...</p>
      </div>
    );
  }

  return (
    <div className="management-container">
      {/* Header con búsqueda y filtros */}
      <div className="management-header">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar por título, destino o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            className="form-select"
            value={filterCategory}
            onChange={handleCategoryChange}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <button onClick={handleNewExperience} className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Nueva Experiencia
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon experiences">
            <i className="fas fa-map-marked-alt"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Experiencias</span>
            <span className="stat-value">{experiences.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">En esta página</span>
            <span className="stat-value">{experiences.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon categories">
            <i className="fas fa-tags"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total</span>
            <span className="stat-value">{pageResponse?.totalElements || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Precio Promedio</span>
            <span className="stat-value">
              {experiences.length > 0 
                ? `$${Math.round(experiences.reduce((acc, e) => acc + e.precio, 0) / experiences.length)}`
                : '$0'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de experiencias */}
      <div className="management-table-container">
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Experiencia</th>
              <th>Ubicación</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Salidas</th>
              <th>Tags</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center">
                  <div className="loading-container">
                    <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                    <p>Cargando experiencias...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center">
                  <div className="error-container">
                    <i className="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
                    <p className="text-danger">{error}</p>
                    <button onClick={loadExperiences} className="btn btn-sm btn-primary">
                      <i className="fas fa-redo me-1"></i>
                      Reintentar
                    </button>
                  </div>
                </td>
              </tr>
            ) : experiences.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  <div className="no-results">
                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                    <p>No se encontraron experiencias</p>
                    <button onClick={handleNewExperience} className="btn btn-primary">
                      <i className="fas fa-plus me-2"></i>
                      Crear Primera Experiencia
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              experiences.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.id}</td>
                  <td>
                    <div className="experience-cell">
                      <div className="experience-image">
                        {exp.imagenUrl ? (
                          <img src={exp.imagenUrl} alt={exp.titulo} />
                        ) : (
                          <i className="fas fa-image"></i>
                        )}
                      </div>
                      <div className="experience-info">
                        <span className="experience-title">{exp.titulo}</span>
                        <span className="experience-description">
                          {exp.descripcion.length > 80 
                            ? `${exp.descripcion.substring(0, 80)}...` 
                            : exp.descripcion
                          }
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <i className="fas fa-map-marker-alt text-danger me-2"></i>
                    {exp.ubicacion.ciudad}, {exp.ubicacion.pais}
                  </td>
                  <td>
                    <span className="category-badge">{exp.categoria}</span>
                  </td>
                  <td className="price-cell">
                    {exp.precio.toLocaleString()} {exp.moneda}
                  </td>
                  <td>
                    <i className="fas fa-calendar-alt me-2 text-primary"></i>
                    {exp.proximasSalidas || 0} salidas
                  </td>
                  <td>
                    <span className="tags-preview">
                      {exp.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="tag-small">{tag}</span>
                      ))}
                      {exp.tags.length > 2 && (
                        <span className="tag-small more">+{exp.tags.length - 2}</span>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-calendar"
                        title="Gestionar salidas"
                        onClick={() => handleManageSalidas(exp.id)}
                      >
                        <i className="fas fa-calendar-alt"></i>
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        title="Editar experiencia"
                        onClick={() => handleEditExperience(exp)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-icon btn-toggle"
                        title="Activar/Desactivar"
                        onClick={() => handleToggleStatus(exp.id)}
                      >
                        <i className="fas fa-toggle-on"></i>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        title="Eliminar experiencia"
                        onClick={() => handleDeleteExperience(exp.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pageResponse && pageResponse.totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={pageResponse.first}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="pagination-info">
            Página {currentPage + 1} de {pageResponse.totalPages}
            <span className="total-info">
              ({pageResponse.totalElements} experiencias en total)
            </span>
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={pageResponse.last}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modales */}
      {showForm && (
        <ExperienciaForm
          experiencia={editingExperience}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}

      {showSalidas && selectedExperienceId && (
        <SalidasManagement
          experienciaId={selectedExperienceId}
          onClose={handleSalidasClose}
        />
      )}
    </div>
  );
};

export default ExperiencesManagement;
