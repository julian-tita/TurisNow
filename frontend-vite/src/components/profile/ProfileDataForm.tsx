// filepath: frontend-vite/src/components/profile/ProfileDataForm.tsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { UserDTO, UpdateUserRequest } from '../../services/userService';

interface ProfileDataFormProps {
  user: UserDTO;
  onSubmit: (data: UpdateUserRequest) => Promise<void>;
}

const ProfileDataForm: React.FC<ProfileDataFormProps> = ({ user, onSubmit }) => {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    nombre: user.nombre || '',
    apellido: user.apellido || '',
    telefono: user.telefono || '',
    documento: user.documento || '',
    fechaNacimiento: user.fechaNacimiento || '',
    direccion: user.direccion || '',
  });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.apellido?.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }

    if (formData.telefono && !/^\+?[\d\s-()]+$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }

    if (formData.fechaNacimiento) {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento debe ser anterior a hoy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card shadow-sm p-4" onSubmit={handleSubmit}>
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
             style={{ width: '50px', height: '50px' }}>
          <i className="fas fa-user text-white" style={{ fontSize: '1.5rem' }}></i>
        </div>
        <div>
          <h5 className="mb-1">Datos Personales</h5>
          <p className="text-muted mb-0">Administra tu información personal</p>
        </div>
      </div>

      <div className="row g-3">
        {/* Nombre y Apellido */}
        <div className="col-md-6">
          <label htmlFor="nombre" className="form-label">
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingresa tu nombre"
            disabled={saving}
          />
          {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="apellido" className="form-label">
            Apellido <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.apellido ? 'is-invalid' : ''}`}
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ingresa tu apellido"
            disabled={saving}
          />
          {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
        </div>

        {/* Email (solo lectura) */}
        <div className="col-md-6">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={user.email}
            disabled
            style={{ backgroundColor: '#f8f9fa' }}
          />
          <small className="text-muted">El email no se puede modificar</small>
        </div>

        {/* Username (solo lectura) */}
        <div className="col-md-6">
          <label htmlFor="username" className="form-label">Nombre de usuario</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={user.username}
            disabled
            style={{ backgroundColor: '#f8f9fa' }}
          />
          <small className="text-muted">El nombre de usuario no se puede modificar</small>
        </div>

        {/* Teléfono */}
        <div className="col-md-6">
          <label htmlFor="telefono" className="form-label">Teléfono</label>
          <input
            type="tel"
            className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+54 11 1234-5678"
            disabled={saving}
          />
          {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
        </div>

        {/* Documento */}
        <div className="col-md-6">
          <label htmlFor="documento" className="form-label">Documento</label>
          <input
            type="text"
            className="form-control"
            id="documento"
            name="documento"
            value={formData.documento}
            onChange={handleChange}
            placeholder="DNI, Pasaporte, etc."
            disabled={saving}
          />
        </div>

        {/* Fecha de Nacimiento */}
        <div className="col-md-6">
          <label htmlFor="fechaNacimiento" className="form-label">Fecha de Nacimiento</label>
          <input
            type="date"
            className={`form-control ${errors.fechaNacimiento ? 'is-invalid' : ''}`}
            id="fechaNacimiento"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            disabled={saving}
          />
          {errors.fechaNacimiento && <div className="invalid-feedback">{errors.fechaNacimiento}</div>}
        </div>

        {/* Dirección */}
        <div className="col-12">
          <label htmlFor="direccion" className="form-label">Dirección</label>
          <textarea
            className="form-control"
            id="direccion"
            name="direccion"
            rows={3}
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Calle, número, ciudad, provincia..."
            disabled={saving}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="mt-4 d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Guardando...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>
              Guardar cambios
            </>
          )}
        </button>
        
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => {
            setFormData({
              nombre: user.nombre || '',
              apellido: user.apellido || '',
              telefono: user.telefono || '',
              documento: user.documento || '',
              fechaNacimiento: user.fechaNacimiento || '',
              direccion: user.direccion || '',
            });
            setErrors({});
          }}
          disabled={saving}
        >
          <i className="fas fa-undo me-2"></i>
          Restablecer
        </button>
      </div>
    </form>
  );
};

export default ProfileDataForm;