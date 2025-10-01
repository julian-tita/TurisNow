import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nombreCompleto: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // Estado para el mensaje de error

  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar errores del contexto cuando se monte el componente Register
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
    setError(''); // Limpiar errores previos
    setIsLoading(true);

    // Validaciones
    const newErrors: string[] = [];
    if (!formData.username || !formData.email || !formData.nombreCompleto || !formData.password) {
      newErrors.push('Por favor, completa todos los campos');
    }

    if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.push('El nombre de usuario debe tener entre 3 y 50 caracteres');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.push('Por favor, ingresa un email válido');
    }

    if (formData.nombreCompleto.length < 2 || formData.nombreCompleto.length > 100) {
      newErrors.push('El nombre completo debe tener entre 2 y 100 caracteres');
    }

    if (formData.password.length < 6) {
      newErrors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Las contraseñas no coinciden');
    }

    if (!acceptTerms) {
      newErrors.push('Debes aceptar los términos y condiciones');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Llama a la función de registro del contexto de autenticación
      const success = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        nombreCompleto: formData.nombreCompleto.trim(),
        password: formData.password
      });
      
      // Solo redirige al login si el registro fue exitoso
      if (success) {
        navigate('/login');
      } else {
        // Si hay un error, obtiene el mensaje del contexto de autenticación
        setError(authError || 'Ocurrió un error al registrarse. Por favor, intenta nuevamente.');
      }

    } catch (err: any) {
      // Si hay un error, lo muestra en la misma página
      const errorMessage = err.response?.data?.message || err.message || 'Ocurrió un error al registrarse.';
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
                <p className="text-muted">Únete a nuestra comunidad de viajeros</p>
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
                {/* Nombre de usuario */}
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    <i className="fas fa-user me-2 text-primary"></i>
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Elige un nombre de usuario"
                    required
                  />
                </div>

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
                    required
                  />
                </div>

                {/* Nombre completo */}
                <div className="mb-3">
                  <label htmlFor="nombreCompleto" className="form-label">
                    <i className="fas fa-id-card me-2 text-primary"></i>
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="nombreCompleto"
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
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
                      placeholder="Crea una contraseña segura"
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

                {/* Confirmar contraseña */}
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    <i className="fas fa-lock me-2 text-primary"></i>
                    Confirmar contraseña
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control form-control-lg"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirma tu contraseña"
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Términos y condiciones */}
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      required
                    />
                    <label className="form-check-label" htmlFor="acceptTerms">
                      Acepto los{' '}
                      <Link to="/terms" className="text-primary text-decoration-none">
                        términos y condiciones
                      </Link>
                    </label>
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

                {/* Botón de registro */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={isLoading || !acceptTerms}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Creando Cuenta...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>
                      Crear Cuenta
                    </>
                  )}
                </button>

                {/* Link a login */}
                <div className="text-center">
                  <p className="mb-0">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                      Inicia sesión aquí
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
              <h3 className="text-primary mb-3">¡Comienza tu aventura!</h3>
              <p className="text-muted lead">
                Únete a miles de viajeros que ya descubrieron experiencias increíbles con TurisNow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
