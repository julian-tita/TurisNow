import { useState, useEffect } from 'react';
import { userService, type UserDTO } from '../../services/userService';

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Helper para obtener el nombre completo
  const getFullName = (user: UserDTO): string => {
    if (user.nombreCompleto) return user.nombreCompleto;
    if (user.nombre && user.apellido) return `${user.nombre} ${user.apellido}`;
    if (user.nombre) return user.nombre;
    if (user.apellido) return user.apellido;
    return user.username;
  };

  // Cargar usuarios desde el backend
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getAllUsers({
        page: currentPage,
        size: pageSize,
        sort: 'id',
        direction: 'ASC',
        rol: filterRole,
        search: searchTerm.trim() || undefined
      });
      
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Error cargando usuarios:', err);
      setError(err.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al montar y cuando cambien los filtros
  useEffect(() => {
    loadUsers();
  }, [currentPage, filterRole]);

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 0) {
        loadUsers();
      } else {
        setCurrentPage(0); // Trigger loadUsers via page change
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggleStatus = async (userId: number) => {
    try {
      const updatedUser = await userService.toggleUserStatus(userId);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (err: any) {
      alert(err.message || 'Error al cambiar el estado del usuario');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }
    
    try {
      await userService.deleteUser(userId);
      // Recargar la lista
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el usuario');
    }
  };

  const handleChangeRole = async (userId: number, newRole: 'USER' | 'ADMIN') => {
    try {
      const updatedUser = await userService.changeUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (err: any) {
      alert(err.message || 'Error al cambiar el rol del usuario');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="alert alert-danger m-4">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadUsers}>
          <i className="fas fa-redo me-1"></i> Reintentar
        </button>
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

          <button className="btn btn-primary" disabled>
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
            <span className="stat-value">{totalElements}</span>
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
        {loading && (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
          </div>
        )}
        
        {!loading && (
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    <div className="no-results">
                      <i className="fas fa-search fa-3x text-muted mb-3"></i>
                      <p>No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user: UserDTO) => {
                  const fullName = getFullName(user);
                  const fechaRegistro = user.fechaCreacion 
                    ? new Date(user.fechaCreacion).toLocaleDateString('es-AR')
                    : 'N/A';
                    
                  return (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <span className="user-name">{fullName}</span>
                          <span className="user-username">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className={`role-badge ${user.rol?.toLowerCase()}`}
                        value={user.rol}
                        onChange={(e) => handleChangeRole(user.id, e.target.value as 'USER' | 'ADMIN')}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>{fechaRegistro}</td>
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
                          disabled
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          title="Editar"
                          disabled
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
                );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación funcional */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
            if (pageNum >= totalPages) return null;
            
            return (
              <button
                key={pageNum}
                className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum + 1}
              </button>
            );
          })}
          
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
