// filepath: frontend-vite/src/components/profile/ProfileSidebar.tsx
import React from 'react';

type Tab = 'datos' | 'reservas' | 'favoritos';

interface ProfileSidebarProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, onChange }) => {
  const menuItems = [
    {
      key: 'datos' as Tab,
      label: 'Datos Personales',
      icon: '👤'
    },
    {
      key: 'reservas' as Tab,
      label: 'Mis Reservas',
      icon: '📋'
    },
    {
      key: 'favoritos' as Tab,
      label: 'Favoritos',
      icon: '❤️'
    }
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h6 className="mb-0">
          <i className="fas fa-user-circle me-2"></i>
          Mi Perfil
        </h6>
      </div>
      <div className="list-group list-group-flush">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`list-group-item list-group-item-action d-flex align-items-center ${
              activeTab === item.key ? 'active' : ''
            }`}
            onClick={() => onChange(item.key)}
          >
            <span className="me-3" style={{ fontSize: '1.2rem' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
            {activeTab === item.key && (
              <i className="fas fa-chevron-right ms-auto"></i>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileSidebar;