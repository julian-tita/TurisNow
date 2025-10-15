import React, { useState, useEffect } from 'react';
import { experienciaService } from '../../services/experienciaService';
import { 
  ExperienciaRequest, 
  ExperienciaDetalleDTO, 
  Categoria, 
  Moneda, 
  UbicacionDTO 
} from '../../types/experiencia.types';

interface ExperienciaFormProps {
  experiencia?: ExperienciaDetalleDTO | null;
  onSave: () => void;
  onCancel: () => void;
}

const ExperienciaForm: React.FC<ExperienciaFormProps> = ({
  experiencia,
  onSave,
  onCancel
}) => {
  // Form state
  const [formData, setFormData] = useState<ExperienciaRequest>({
    titulo: '',
    descripcion: '',
    precio: 0,
    moneda: 'ARS',
    ubicacion: {
      ciudad: '',
      region: '',
      pais: ''
    },
    categoria: 'AVENTURA',
    imagenUrl: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with existing data if editing
  useEffect(() => {
    if (experiencia) {
      setFormData({
        titulo: experiencia.titulo,
        descripcion: experiencia.descripcion,
        precio: experiencia.precio,
        moneda: experiencia.moneda,
        ubicacion: experiencia.ubicacion,
        categoria: experiencia.categoria,
        imagenUrl: experiencia.imagenUrl || '',
        tags: experiencia.tags
      });
    }
  }, [experiencia]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ExperienciaRequest] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'precio' ? parseFloat(value) || 0 : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle tag management
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) newErrors.titulo = 'El título es obligatorio';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
    if (formData.precio <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
    if (!formData.ubicacion.ciudad.trim()) newErrors['ubicacion.ciudad'] = 'La ciudad es obligatoria';
    if (!formData.ubicacion.pais.trim()) newErrors['ubicacion.pais'] = 'El país es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      if (experiencia?.id) {
        // Update existing
        await experienciaService.updateExperiencia(experiencia.id, formData);
      } else {
        // Create new
        await experienciaService.createExperiencia(formData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving experiencia:', error);
      setErrors({ general: 'Error al guardar la experiencia. Por favor intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const categorias: { value: Categoria; label: string }[] = [
    { value: 'AVENTURA', label: '🏔️ Aventura' },
    { value: 'CULTURA', label: '🏛️ Cultura' },
    { value: 'GASTRONOMIA', label: '🍽️ Gastronomía' },
    { value: 'PLAYA', label: '🏖️ Playa' },
    { value: 'MONTANA', label: '⛰️ Montaña' }
  ];

  const monedas: { value: Moneda; label: string }[] = [
    { value: 'ARS', label: '🇦🇷 Pesos Argentinos (ARS)' },
    { value: 'USD', label: '🇺🇸 Dólares Americanos (USD)' }
  ];

  return (
    <div className="experiencia-form-overlay">
      <div className="experiencia-form-container">
        <div className="form-header">
          <h2>
            {experiencia?.id ? '✏️ Editar Experiencia' : '➕ Nueva Experiencia'}
          </h2>
          <button type="button" className="btn-close" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="experiencia-form">
          {errors.general && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {errors.general}
            </div>
          )}

          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>📋 Información Básica</h3>
              
              <div className="form-group">
                <label htmlFor="titulo">Título *</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                  placeholder="Ej: Tour por Machu Picchu"
                  maxLength={100}
                />
                {errors.titulo && <div className="invalid-feedback">{errors.titulo}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                  placeholder="Describe la experiencia en detalle..."
                  rows={4}
                  maxLength={1000}
                />
                {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
                <small className="text-muted">
                  {formData.descripcion.length}/1000 caracteres
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoría *</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="imagenUrl">URL de Imagen</label>
                <input
                  type="url"
                  id="imagenUrl"
                  name="imagenUrl"
                  value={formData.imagenUrl}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {formData.imagenUrl && (
                  <div className="image-preview">
                    <img 
                      src={formData.imagenUrl} 
                      alt="Vista previa" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Price and Currency */}
            <div className="form-section">
              <h3>💰 Precio</h3>
              
              <div className="form-row">
                <div className="form-group flex-2">
                  <label htmlFor="precio">Precio *</label>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {errors.precio && <div className="invalid-feedback">{errors.precio}</div>}
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="moneda">Moneda *</label>
                  <select
                    id="moneda"
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    {monedas.map(mon => (
                      <option key={mon.value} value={mon.value}>
                        {mon.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="form-section">
              <h3>📍 Ubicación</h3>
              
              <div className="form-group">
                <label htmlFor="ubicacion.ciudad">Ciudad *</label>
                <input
                  type="text"
                  id="ubicacion.ciudad"
                  name="ubicacion.ciudad"
                  value={formData.ubicacion.ciudad}
                  onChange={handleInputChange}
                  className={`form-control ${errors['ubicacion.ciudad'] ? 'is-invalid' : ''}`}
                  placeholder="Ej: Buenos Aires"
                />
                {errors['ubicacion.ciudad'] && (
                  <div className="invalid-feedback">{errors['ubicacion.ciudad']}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ubicacion.region">Región/Provincia</label>
                <input
                  type="text"
                  id="ubicacion.region"
                  name="ubicacion.region"
                  value={formData.ubicacion.region || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Ej: Buenos Aires"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ubicacion.pais">País *</label>
                <input
                  type="text"
                  id="ubicacion.pais"
                  name="ubicacion.pais"
                  value={formData.ubicacion.pais}
                  onChange={handleInputChange}
                  className={`form-control ${errors['ubicacion.pais'] ? 'is-invalid' : ''}`}
                  placeholder="Ej: Argentina"
                />
                {errors['ubicacion.pais'] && (
                  <div className="invalid-feedback">{errors['ubicacion.pais']}</div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="form-section">
              <h3>🏷️ Etiquetas</h3>
              
              <div className="form-group">
                <label htmlFor="tagInput">Agregar Etiquetas</label>
                <div className="tag-input-container">
                  <input
                    type="text"
                    id="tagInput"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="form-control"
                    placeholder="Escribe una etiqueta y presiona Enter"
                    maxLength={30}
                  />
                  <button type="button" onClick={addTag} className="btn-add-tag">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <div className="tags-container">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="tag-remove"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              <i className="fas fa-times me-2"></i>
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  {experiencia?.id ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <i className={`fas fa-${experiencia?.id ? 'save' : 'plus'} me-2`}></i>
                  {experiencia?.id ? 'Actualizar' : 'Crear'} Experiencia
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExperienciaForm;