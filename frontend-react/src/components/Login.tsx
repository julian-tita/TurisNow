import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthComponents.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    // Validaciones básicas
    if (!username.trim() || !password) {
      setLocalError('Por favor, completa todos los campos');
      return;
    }

    if (username.length < 3) {
      setLocalError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    try {
      const success = await login(username.trim(), password);
      
      if (success) {
        setLocalSuccess('¡Inicio de sesión exitoso!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setLocalError('Credenciales inválidas. Verifica tu usuario y contraseña');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Error al iniciar sesión');
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
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
          <p className="subtitle">Descubre el mundo con nosotros</p>
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
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearMessages();
              }}
              placeholder="Ingresa tu nombre de usuario"
              autoComplete="username"
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
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearMessages();
                }}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePassword}
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              Recordarme
            </label>
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>
          
          <button
            type="submit"
            className={`auth-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            <span className="btn-text">Iniciar Sesión</span>
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
          <p>¿No tienes una cuenta? <Link to="/register" className="auth-link">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
