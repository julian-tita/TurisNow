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

  return (
    <div className="dashboard-container">
      <div className="background-decoration">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{getGreeting()}, {user?.nombreCompleto.split(' ')[0]}!</h1>
          <p>¿Listo para tu próxima aventura?</p>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {getInitials(user?.nombreCompleto || '')}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.nombreCompleto}</div>
            <div className="user-email">{user?.email}</div>
            <div className="user-role">
              {user?.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-map-marked-alt"></i>
          </div>
          <h3 className="card-title">Explorar Destinos</h3>
          <p className="card-description">
            Descubre nuevos lugares y planifica tu próxima aventura con nuestras recomendaciones personalizadas.
          </p>
          <button 
            className="card-btn" 
            onClick={() => showComingSoon('Explorar Destinos')}
          >
            Explorar Ahora
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <h3 className="card-title">Mis Viajes</h3>
          <p className="card-description">
            Gestiona tus viajes, reservas y itinerarios en un solo lugar.
          </p>
          <button 
            className="card-btn" 
            onClick={() => showComingSoon('Mis Viajes')}
          >
            Ver Mis Viajes
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-cog"></i>
          </div>
          <h3 className="card-title">Configuración</h3>
          <p className="card-description">
            Personaliza tu experiencia y gestiona la configuración de tu cuenta.
          </p>
          <button 
            className="card-btn" 
            onClick={() => showComingSoon('Configuración')}
          >
            Configurar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
