import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthComponents.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nombreCompleto: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    // Validaciones
    if (!formData.username || !formData.email || !formData.nombreCompleto || !formData.password) {
      setLocalError('Por favor, completa todos los campos');
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 50) {
      setLocalError('El nombre de usuario debe tener entre 3 y 50 caracteres');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError('Por favor, ingresa un email válido');
      return;
    }

    if (formData.nombreCompleto.length < 2 || formData.nombreCompleto.length > 100) {
      setLocalError('El nombre completo debe tener entre 2 y 100 caracteres');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    if (!acceptTerms) {
      setLocalError('Debes aceptar los términos y condiciones');
      return;
    }

    try {
      const success = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        nombreCompleto: formData.nombreCompleto.trim(),
        password: formData.password
      });
      
      if (success) {
        setLocalSuccess('¡Cuenta creada exitosamente!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setLocalError('Error al crear la cuenta');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Error al registrar usuario');
    }
  };

  const togglePassword = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const clearMessages = () => {
    setLocalError(null);
    setLocalSuccess(null);
  };

  return (
    <div className="auth-container">
      <div className="background-decoration">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <i className="fas fa-map-marked-alt"></i>
            <h1>TurisNow</h1>
          </div>
          <p className="subtitle">Únete a nuestra comunidad de viajeros</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">
              <i className="fas fa-user"></i>
              Nombre de usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Elige un nombre de usuario"
              autoComplete="username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i>
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="nombreCompleto">
              <i className="fas fa-id-card"></i>
              Nombre completo
            </label>
            <input
              type="text"
              id="nombreCompleto"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleInputChange}
              placeholder="Tu nombre completo"
              autoComplete="name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i>
              Contraseña
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Crea una contraseña segura"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePassword('password')}
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <i className="fas fa-lock"></i>
              Confirmar contraseña
            </label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirma tu contraseña"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePassword('confirmPassword')}
              >
                <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              Acepto los <a href="#" className="terms-link">términos y condiciones</a>
            </label>
          </div>
          
          <button
            type="submit"
            className={`auth-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            <span className="btn-text">Crear Cuenta</span>
            <div className="spinner"></div>
          </button>
          
          {(localError || error) && (
            <div className="error-message" style={{ display: 'block' }}>
              {localError || error}
            </div>
          )}
          
          {localSuccess && (
            <div className="success-message" style={{ display: 'block' }}>
              {localSuccess}
            </div>
          )}
        </form>
        
        <div className="auth-footer">
          <p>¿Ya tienes una cuenta? <Link to="/login" className="auth-link">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
