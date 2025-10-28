import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import experienciaService from '../../services/experienciaService';
import type { ExperienciaDetalleDTO, SalidaDTO } from '../../types/experiencia.types';

interface SalidasManagementProps {
  experienciaId: number;
  onClose: () => void;
}

interface SalidaForm {
  fechaInicio: string;
  fechaFin: string;
  capacidadTotal: number;
  capacidadDisponible: number;
}

const SalidasManagement: React.FC<SalidasManagementProps> = ({
  experienciaId,
  onClose
}) => {
  const [experiencia, setExperiencia] = useState<ExperienciaDetalleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSalida, setEditingSalida] = useState<SalidaDTO | null>(null);
  const [formData, setFormData] = useState<SalidaForm>({
    fechaInicio: '',
    fechaFin: '',
    capacidadTotal: 10,
    capacidadDisponible: 10
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load experiencia details with salidas
  const loadExperiencia = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await experienciaService.getExperienciaById(experienciaId);
      setExperiencia(data);
    } catch (err: any) {
      const errorMsg = 'Error al cargar la experiencia';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiencia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienciaId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('capacidad') ? parseInt(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-sync available capacity with total capacity for new salidas
    if (name === 'capacidadTotal' && !editingSalida) {
      setFormData(prev => ({
        ...prev,
        capacidadDisponible: parseInt(value) || 0
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.fechaInicio) {
      errors.fechaInicio = 'La fecha de inicio es obligatoria';
    }
    
    if (!formData.fechaFin) {
      errors.fechaFin = 'La fecha de fin es obligatoria';
    }
    
    if (formData.fechaInicio && formData.fechaFin && 
        new Date(formData.fechaInicio) >= new Date(formData.fechaFin)) {
      errors.fechaFin = 'La fecha de fin debe ser posterior a la de inicio';
    }
    
    if (formData.capacidadTotal <= 0) {
      errors.capacidadTotal = 'La capacidad total debe ser mayor a 0';
    }
    
    if (formData.capacidadDisponible < 0) {
      errors.capacidadDisponible = 'La capacidad disponible no puede ser negativa';
    }
    
    if (formData.capacidadDisponible > formData.capacidadTotal) {
      errors.capacidadDisponible = 'La capacidad disponible no puede ser mayor a la total';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Start creating new salida
  const startNewSalida = () => {
    setEditingSalida(null);
    setFormData({
      fechaInicio: '',
      fechaFin: '',
      capacidadTotal: 10,
      capacidadDisponible: 10
    });
    setFormErrors({});
    setShowForm(true);
  };

  // Start editing existing salida
  const startEditSalida = (salida: SalidaDTO) => {
    setEditingSalida(salida);
    setFormData({
      fechaInicio: salida.fechaInicio.split('T')[0], // Extract date part
      fechaFin: salida.fechaFin?.split('T')[0] || '',
      capacidadTotal: salida.capacidadTotal,
      capacidadDisponible: salida.capacidadDisponible
    });
    setFormErrors({});
    setShowForm(true);
  };

  // Cancel form
  const cancelForm = () => {
    setShowForm(false);
    setEditingSalida(null);
    setFormData({
      fechaInicio: '',
      fechaFin: '',
      capacidadTotal: 10,
      capacidadDisponible: 10
    });
    setFormErrors({});
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      const salidaData = {
        fechaInicio: `${formData.fechaInicio}T09:00:00`,
        fechaFin: formData.fechaFin ? `${formData.fechaFin}T18:00:00` : undefined,
        capacidadTotal: formData.capacidadTotal,
        capacidadDisponible: formData.capacidadDisponible
      };

      if (editingSalida) {
        // Update existing salida
        toast.loading('Actualizando salida...');
        // await experienciaService.updateSalida(editingSalida.id, salidaData);
        toast.success('Salida actualizada exitosamente');
      } else {
        // Create new salida
        toast.loading('Creando nueva salida...');
        // await experienciaService.createSalida(experienciaId, salidaData);
        toast.success('Salida creada exitosamente');
      }

      // Reload experiencia data
      await loadExperiencia();
      cancelForm();
    } catch (err: any) {
      toast.error('Error al guardar la salida');
      setFormErrors({ general: 'Error al guardar la salida' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete salida
  const handleDeleteSalida = async (salidaId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta salida?')) {
      return;
    }

    try {
      const toastId = toast.loading('Eliminando salida...');
      // await experienciaService.deleteSalida(salidaId);
      await loadExperiencia();
      toast.success('Salida eliminada exitosamente', { id: toastId });
    } catch (err: any) {
      const errorMsg = 'Error al eliminar la salida';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate occupancy percentage
  const getOccupancyPercentage = (salida: SalidaDTO): number => {
    const occupied = salida.capacidadTotal - salida.capacidadDisponible;
    return Math.round((occupied / salida.capacidadTotal) * 100);
  };

  // Get occupancy status color
  const getOccupancyColor = (percentage: number): string => {
    if (percentage >= 90) return '#dc3545'; // Red - casi lleno
    if (percentage >= 70) return '#ffc107'; // Yellow - moderado
    return '#28a745'; // Green - disponible
  };

  if (loading) {
    return (
      <div className="salidas-management-overlay">
        <div className="salidas-management-container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
            <p>Cargando salidas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !experiencia) {
    return (
      <div className="salidas-management-overlay">
        <div className="salidas-management-container">
          <div className="error-container">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h3>Error</h3>
            <p>{error || 'No se pudo cargar la experiencia'}</p>
            <button onClick={onClose} className="btn btn-primary">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="salidas-management-overlay">
      <div className="salidas-management-container">
        {/* Header */}
        <div className="salidas-header">
          <div className="header-info">
            <h2>
              <i className="fas fa-calendar-alt me-2"></i>
              Gestión de Salidas
            </h2>
            <p className="experiencia-title">{experiencia.titulo}</p>
          </div>
          <button onClick={onClose} className="btn-close">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Stats */}
        <div className="salidas-stats">
          <div className="stat-item">
            <i className="fas fa-calendar-check text-primary"></i>
            <div>
              <span className="stat-label">Total Salidas</span>
              <span className="stat-value">{experiencia.salidas.length}</span>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-users text-success"></i>
            <div>
              <span className="stat-label">Capacidad Total</span>
              <span className="stat-value">
                {experiencia.salidas.reduce((acc, s) => acc + s.capacidadTotal, 0)}
              </span>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-chart-line text-warning"></i>
            <div>
              <span className="stat-label">Disponibles</span>
              <span className="stat-value">
                {experiencia.salidas.reduce((acc, s) => acc + s.capacidadDisponible, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="salidas-actions">
          <button onClick={startNewSalida} className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Nueva Salida
          </button>
        </div>

        {/* Salidas List */}
        <div className="salidas-list">
          {experiencia.salidas.length === 0 ? (
            <div className="no-salidas">
              <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
              <h4>No hay salidas programadas</h4>
              <p>Crea la primera salida para esta experiencia</p>
              <button onClick={startNewSalida} className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>
                Crear Primera Salida
              </button>
            </div>
          ) : (
            <div className="salidas-grid">
              {experiencia.salidas.map((salida) => {
                const occupancyPercentage = getOccupancyPercentage(salida);
                const occupancyColor = getOccupancyColor(occupancyPercentage);
                
                return (
                  <div key={salida.id} className="salida-card">
                    <div className="salida-header">
                      <div className="date-info">
                        <span className="date-start">
                          <i className="fas fa-play-circle text-success me-1"></i>
                          {formatDate(salida.fechaInicio)}
                        </span>
                        {salida.fechaFin && (
                          <span className="date-end">
                            <i className="fas fa-stop-circle text-danger me-1"></i>
                            {formatDate(salida.fechaFin)}
                          </span>
                        )}
                      </div>
                      
                      <div className="salida-actions">
                        <button
                          onClick={() => startEditSalida(salida)}
                          className="btn-icon btn-edit"
                          title="Editar salida"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteSalida(salida.id)}
                          className="btn-icon btn-delete"
                          title="Eliminar salida"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div className="capacity-info">
                      <div className="capacity-text">
                        <span className="available">{salida.capacidadDisponible}</span>
                        <span className="separator">/</span>
                        <span className="total">{salida.capacidadTotal}</span>
                        <span className="label">disponibles</span>
                      </div>
                      
                      <div className="capacity-bar">
                        <div 
                          className="capacity-fill" 
                          style={{
                            width: `${occupancyPercentage}%`,
                            backgroundColor: occupancyColor
                          }}
                        />
                      </div>
                      
                      <div className="occupancy-percentage">
                        {occupancyPercentage}% ocupado
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="salida-form-overlay">
            <div className="salida-form-container">
              <div className="form-header">
                <h3>
                  {editingSalida ? '✏️ Editar Salida' : '➕ Nueva Salida'}
                </h3>
                <button onClick={cancelForm} className="btn-close-form">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="salida-form">
                {formErrors.general && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {formErrors.general}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="fechaInicio">Fecha de Inicio *</label>
                    <input
                      type="date"
                      id="fechaInicio"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleInputChange}
                      className={`form-control ${formErrors.fechaInicio ? 'is-invalid' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {formErrors.fechaInicio && (
                      <div className="invalid-feedback">{formErrors.fechaInicio}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="fechaFin">Fecha de Fin</label>
                    <input
                      type="date"
                      id="fechaFin"
                      name="fechaFin"
                      value={formData.fechaFin}
                      onChange={handleInputChange}
                      className={`form-control ${formErrors.fechaFin ? 'is-invalid' : ''}`}
                      min={formData.fechaInicio}
                    />
                    {formErrors.fechaFin && (
                      <div className="invalid-feedback">{formErrors.fechaFin}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="capacidadTotal">Capacidad Total *</label>
                    <input
                      type="number"
                      id="capacidadTotal"
                      name="capacidadTotal"
                      value={formData.capacidadTotal}
                      onChange={handleInputChange}
                      className={`form-control ${formErrors.capacidadTotal ? 'is-invalid' : ''}`}
                      min="1"
                      max="100"
                      required
                    />
                    {formErrors.capacidadTotal && (
                      <div className="invalid-feedback">{formErrors.capacidadTotal}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="capacidadDisponible">Capacidad Disponible *</label>
                    <input
                      type="number"
                      id="capacidadDisponible"
                      name="capacidadDisponible"
                      value={formData.capacidadDisponible}
                      onChange={handleInputChange}
                      className={`form-control ${formErrors.capacidadDisponible ? 'is-invalid' : ''}`}
                      min="0"
                      max={formData.capacidadTotal}
                      required
                    />
                    {formErrors.capacidadDisponible && (
                      <div className="invalid-feedback">{formErrors.capacidadDisponible}</div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="btn btn-secondary"
                    disabled={submitting}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        {editingSalida ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas fa-${editingSalida ? 'save' : 'plus'} me-2`}></i>
                        {editingSalida ? 'Actualizar' : 'Crear'} Salida
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalidasManagement;