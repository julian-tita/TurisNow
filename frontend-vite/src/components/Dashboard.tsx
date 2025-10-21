import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showComingSoon = (feature: string) => {
    alert(`¡${feature} estará disponible próximamente!\n\nEstamos trabajando para brindarte la mejor experiencia de viaje.`);
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div className="loading-text">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  // Componente local para las tarjetas de features
  const FeatureCard: React.FC<{
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
  }> = ({ icon, title, description, onClick }) => (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm border-0 rounded-4">
        <div className="card-body text-center p-4">
          <div className="mb-3">
            <i className={`${icon} text-primary`} style={{ fontSize: '3rem' }}></i>
          </div>
          <h5 className="card-title mb-3">{title}</h5>
          <p className="card-text text-muted mb-4">{description}</p>
          <button 
            className="btn btn-primary btn-lg w-100"
            onClick={onClick}
          >
            {title === 'Explorar Destinos' ? 'Explorar Ahora' : 
             title === 'Mis Viajes' ? 'Ver Mis Viajes' : 'Configurar'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-container" style={{ paddingTop: '120px' }}>
      <div className="container-fluid">
        <div className="container my-5">
          {/* Hero Card */}
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-body p-4 p-lg-5">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h2 className="text-primary mb-3">
                    <i className="fa fa-map-marker-alt me-2"></i>
                    {getGreeting()}, {user?.nombreCompleto.split(' ')[0]}!
                  </h2>
                  <p className="text-muted lead mb-3">¿Listo para tu próxima aventura?</p>
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <span className="badge bg-light text-dark px-3 py-2">
                      <i className="fas fa-envelope me-2"></i>
                      {user?.email}
                    </span>
                    <span className="badge bg-primary px-3 py-2">
                      <i className="fas fa-user me-2"></i>
                      {user?.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                </div>
                <div className="col-lg-4 text-center mt-3 mt-lg-0">
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" 
                         style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                      {getInitials(user?.nombreCompleto || '')}
                    </div>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="row g-4">
            <FeatureCard
              icon="fas fa-map-marked-alt"
              title="Explorar Destinos"
              description="Descubre nuevos lugares y planifica tu próxima aventura con nuestras recomendaciones personalizadas."
              onClick={() => showComingSoon('Explorar Destinos')}
            />
            <FeatureCard
              icon="fas fa-calendar-alt"
              title="Mis Viajes"
              description="Gestiona tus viajes, reservas y itinerarios en un solo lugar."
              onClick={() => showComingSoon('Mis Viajes')}
            />
            <FeatureCard
              icon="fas fa-cog"
              title="Configuración"
              description="Personaliza tu experiencia y gestiona la configuración de tu cuenta."
              onClick={() => showComingSoon('Configuración')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
