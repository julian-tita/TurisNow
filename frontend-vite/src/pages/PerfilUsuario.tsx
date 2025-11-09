// filepath: frontend-vite/src/pages/PerfilUsuario.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import userService from '../services/userService';
import type { UserDTO, UpdateUserRequest } from '../services/userService';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileDataForm from '../components/profile/ProfileDataForm';

type Tab = 'datos' | 'reservas';

const PerfilUsuario: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('datos');
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // Navigate to reservations when tab changes
  useEffect(() => {
    if (activeTab === 'reservas') {
      navigate('/mis-reservas');
    }
  }, [activeTab, navigate]);

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
              activeTab === 'datos' ? (
                <ProfileDataForm user={user} onSubmit={handleUpdateProfile} />
              ) : null
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