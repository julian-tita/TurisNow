// filepath: frontend-vite/src/pages/PerfilUsuario.tsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import type { UserDTO, UpdateUserRequest } from '../services/userService';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileDataForm from '../components/profile/ProfileDataForm';
import ProfileReservas from '../components/profile/ProfileReservas';
import ProfileFavoritos from '../components/profile/ProfileFavoritos';

type Tab = 'datos' | 'reservas' | 'favoritos';

const PerfilUsuario: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('datos');
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await userService.getMe();
        setUser(userData);
      } catch (error: any) {
        console.error('Error loading user profile:', error);
        toast.error('No se pudo cargar el perfil del usuario');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleUpdateProfile = async (updateData: UpdateUserRequest) => {
    try {
      const updatedUser = await userService.updateMe(updateData);
      setUser(updatedUser);
      toast.success('Datos actualizados correctamente');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error al actualizar los datos');
      throw error; // Re-throw to let the form handle the error state
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getInitials = (nombre?: string, apellido?: string) => {
    if (!nombre || !apellido) return 'U';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const renderSkeleton = () => (
    <div className="card shadow-sm p-4">
      <div className="d-flex align-items-center mb-4">
        <div className="placeholder-glow">
          <div className="placeholder rounded-circle me-3" style={{ width: '50px', height: '50px' }}></div>
        </div>
        <div className="flex-grow-1">
          <div className="placeholder-glow">
            <span className="placeholder col-4 mb-2"></span>
            <span className="placeholder col-6"></span>
          </div>
        </div>
      </div>
      
      <div className="row g-3">
        <div className="col-md-6">
          <div className="placeholder-glow">
            <span className="placeholder col-3 mb-2"></span>
            <span className="placeholder col-12" style={{ height: '38px' }}></span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="placeholder-glow">
            <span className="placeholder col-3 mb-2"></span>
            <span className="placeholder col-12" style={{ height: '38px' }}></span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="placeholder-glow">
            <span className="placeholder col-3 mb-2"></span>
            <span className="placeholder col-12" style={{ height: '38px' }}></span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="placeholder-glow">
            <span className="placeholder col-3 mb-2"></span>
            <span className="placeholder col-12" style={{ height: '38px' }}></span>
          </div>
        </div>
        <div className="col-12">
          <div className="placeholder-glow">
            <span className="placeholder col-3 mb-2"></span>
            <span className="placeholder col-12" style={{ height: '80px' }}></span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="placeholder-glow">
          <span className="placeholder col-2" style={{ height: '38px' }}></span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid" style={{ paddingTop: '120px', minHeight: '100vh' }}>
      <div className="container">
        {/* Hero Card */}
        {!loading && user && (
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-body p-4 p-lg-5">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h2 className="text-primary mb-3">
                    <i className="fa fa-map-marker-alt me-2"></i>
                    {getGreeting()}, {user.nombre}!
                  </h2>
                  <p className="text-muted lead mb-3">¿Listo para tu próxima aventura?</p>
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <span className="badge bg-light text-dark px-3 py-2">
                      <i className="fas fa-envelope me-2"></i>
                      {authUser?.email}
                    </span>
                    <span className="badge bg-primary px-3 py-2">
                      <i className="fas fa-user me-2"></i>
                      {authUser?.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                </div>
                <div className="col-lg-4 text-center mt-3 mt-lg-0">
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <div 
                      className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" 
                      style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}
                    >
                      {getInitials(user.nombre, user.apellido)}
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
        )}

        <div className="row">
          {/* Sidebar */}
          <div className="col-12 col-lg-3 mb-4">
            <ProfileSidebar activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* Main Content */}
          <div className="col-12 col-lg-9">
            {loading ? (
              renderSkeleton()
            ) : user ? (
              <>
                {activeTab === 'datos' && (
                  <ProfileDataForm user={user} onSubmit={handleUpdateProfile} />
                )}
                {activeTab === 'reservas' && <ProfileReservas />}
                {activeTab === 'favoritos' && <ProfileFavoritos />}
              </>
            ) : (
              <div className="card shadow-sm p-4 text-center">
                <div className="text-muted">
                  <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
                  <h5>No se pudo cargar el perfil</h5>
                  <p>Inténtalo de nuevo más tarde</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;