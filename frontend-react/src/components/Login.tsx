import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar errores del contexto cuando se monte el componente Login
    clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('');
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setError('');
    setIsLoading(true);

    // Validaciones
    const newErrors: string[] = [];
    if (!formData.email.trim() || !formData.password) {
      newErrors.push('Por favor, completa todos los campos');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.push('Por favor, ingresa un correo electrónico válido');
    }

    if (formData.password.length < 6) {
      newErrors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Mapear email a username para mantener compatibilidad con backend
      const success = await login(formData.email.trim(), formData.password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError(authError || 'Credenciales inválidas. Verifica tu correo y contraseña');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ paddingTop: '120px' }}>
      <div className="container-fluid">
        <div className="row min-vh-100">
          {/* Columna izquierda - Formulario */}
          <div className="col-lg-6 d-flex align-items-center justify-content-center p-4">
            <div className="auth-form w-100">
              <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none">
                  <h2 className="text-primary mb-3">
                    <i className="fa fa-map-marker-alt me-2"></i>
                    TurisNow
                  </h2>
                </Link>
                <p className="text-muted">Bienvenido de vuelta</p>
              </div>

              {/* Pop-up de error */}
              {error && (
                <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#f8d7da', 
                    color: '#721c24', 
                    border: '1px solid #f5c6cb', 
                    borderRadius: '5px', 
                    marginBottom: '15px' 
                }}>
                    {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Correo electrónico */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope me-2 text-primary"></i>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Contraseña */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <i className="fas fa-lock me-2 text-primary"></i>
                    Contraseña
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control form-control-lg"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Opciones adicionales */}
                <div className="row mb-3">
                  <div className="col-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Recordarme
                      </label>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <button 
                      type="button" 
                      className="btn btn-link p-0 text-primary text-decoration-none"
                      onClick={() => {
                        // TODO: Implementar funcionalidad de recuperación de contraseña
                        alert('Funcionalidad de recuperación de contraseña próximamente');
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>

                {/* Errores */}
                {errors.length > 0 && (
                  <div className="alert alert-danger">
                    <ul className="mb-0">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Botón de inicio de sesión */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Iniciar Sesión
                    </>
                  )}
                </button>

                {/* Link a registro */}
                <div className="text-center">
                  <p className="mb-0">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Columna derecha - Imagen/Branding */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-light">
            <div className="text-center p-5">
              <img
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1170&auto=format&fit=crop"
                alt="Viajes"
                className="img-fluid rounded-3 mb-4"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
              <h3 className="text-primary mb-3">¡Bienvenido de vuelta!</h3>
              <p className="text-muted lead">
                Continúa explorando destinos increíbles y vive nuevas aventuras con TurisNow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
