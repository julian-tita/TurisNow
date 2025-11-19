import React from 'react';

interface User {
  nombre: string;
  apellido: string;
  rol: 'USER' | 'ADMIN';
}

type MenuOption = 'overview' | 'users' | 'experiences';

interface SidebarAdminProps {
  user: User;
  activeMenu: MenuOption;
  onMenuChange: (menu: MenuOption) => void;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ user, activeMenu, onMenuChange }) => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>
          <i className="fas fa-crown" style={{ color: '#ffd700' }}></i>
          Admin Panel
        </h2>
        <p className="text-muted small">Bienvenido, {user.nombre} {user.apellido}</p>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeMenu === 'overview' ? 'active' : ''}`}
          onClick={() => onMenuChange('overview')}
        >
          <i className="fas fa-chart-line"></i>
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${activeMenu === 'users' ? 'active' : ''}`}
          onClick={() => onMenuChange('users')}
        >
          <i className="fas fa-users"></i>
          <span>Usuarios</span>
        </button>

        <button
          className={`nav-item ${activeMenu === 'experiences' ? 'active' : ''}`}
          onClick={() => onMenuChange('experiences')}
        >
          <i className="fas fa-map-marked-alt"></i>
          <span>Experiencias</span>
        </button>

        <div className="sidebar-divider"></div>

        <button className="nav-item">
          <i className="fas fa-cog"></i>
          <span>Configuración</span>
        </button>
      </nav>
    </aside>
  );
};

export default SidebarAdmin;
