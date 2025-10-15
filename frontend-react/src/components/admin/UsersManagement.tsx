import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  nombreCompleto: string;
  rol: 'USER' | 'ADMIN';
  fechaRegistro?: string;
  activo?: boolean;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');

  // Simular carga de usuarios (sustituir por llamada API real)
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@turisnow.com',
        nombreCompleto: 'Administrador Principal',
        rol: 'ADMIN',
        fechaRegistro: '2024-01-15',
        activo: true
      },
      {
        id: 2,
        username: 'juan.perez',
        email: 'juan.perez@email.com',
        nombreCompleto: 'Juan Pérez',
        rol: 'USER',
        fechaRegistro: '2024-03-20',
        activo: true
      },
      {
        id: 3,
        username: 'maria.garcia',
        email: 'maria.garcia@email.com',
        nombreCompleto: 'María García',
        rol: 'USER',
        fechaRegistro: '2024-05-10',
        activo: true
      },
      {
        id: 4,
        username: 'carlos.lopez',
        email: 'carlos.lopez@email.com',
        nombreCompleto: 'Carlos López',
        rol: 'USER',
        fechaRegistro: '2024-06-15',
        activo: false
      },
      {
        id: 5,
        username: 'ana.martinez',
        email: 'ana.martinez@email.com',
        nombreCompleto: 'Ana Martínez',
        rol: 'USER',
        fechaRegistro: '2024-07-22',
        activo: true
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'ALL' || user.rol === filterRole;

    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, activo: !user.activo } : user
    ));
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleChangeRole = (userId: number, newRole: 'USER' | 'ADMIN') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, rol: newRole } : user
    ));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="management-container">
      {/* Header con búsqueda y filtros */}
      <div className="management-header">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar por nombre, email o username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            className="form-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
          >
            <option value="ALL">Todos los roles</option>
            <option value="USER">Usuarios</option>
            <option value="ADMIN">Administradores</option>
          </select>

          <button className="btn btn-primary">
            <i className="fas fa-user-plus me-2"></i>
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Usuarios</span>
            <span className="stat-value">{users.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Activos</span>
            <span className="stat-value">{users.filter(u => u.activo).length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon admins">
            <i className="fas fa-user-shield"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Administradores</span>
            <span className="stat-value">{users.filter(u => u.rol === 'ADMIN').length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon inactive">
            <i className="fas fa-user-times"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Inactivos</span>
            <span className="stat-value">{users.filter(u => !u.activo).length}</span>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="management-table-container">
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha Registro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  <div className="no-results">
                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                    <p>No se encontraron usuarios</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.nombreCompleto.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.nombreCompleto}</span>
                        <span className="user-username">@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className={`role-badge ${user.rol.toLowerCase()}`}
                      value={user.rol}
                      onChange={(e) => handleChangeRole(user.id, e.target.value as 'USER' | 'ADMIN')}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>{user.fechaRegistro || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${user.activo ? 'active' : 'inactive'}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-view"
                        title="Ver detalles"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className={`btn-icon ${user.activo ? 'btn-pause' : 'btn-play'}`}
                        title={user.activo ? 'Desactivar' : 'Activar'}
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        <i className={`fas fa-${user.activo ? 'pause' : 'play'}`}></i>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        title="Eliminar"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button className="btn btn-sm btn-outline-primary">
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="btn btn-sm btn-primary">1</button>
        <button className="btn btn-sm btn-outline-primary">2</button>
        <button className="btn btn-sm btn-outline-primary">3</button>
        <button className="btn btn-sm btn-outline-primary">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default UsersManagement;
