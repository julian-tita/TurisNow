import { useState, useEffect } from 'react';
import { userService, type UsuarioAdminResponse } from '../../services/userService';
import toast from 'react-hot-toast';

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UsuarioAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const getFullName = (user: UsuarioAdminResponse): string => {
    if (user.nombre && user.apellido) return `${user.nombre} ${user.apellido}`;
    if (user.nombre) return user.nombre;
    if (user.apellido) return user.apellido;
    return user.username;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({
        page: currentPage,
        size: pageSize,
        rol: filterRole,
        search: searchTerm.trim() || undefined
      });
      
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Error cargando usuarios:', err);
      toast.error(err.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, filterRole]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 0) {
        loadUsers();
      } else {
        setCurrentPage(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggleStatus = async (userId: number) => {
    try {
      const updatedUser = await userService.toggleUserStatus(userId);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      toast.success(`Usuario ${updatedUser.activo ? 'activado' : 'desactivado'} correctamente`);
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar el estado del usuario');
    }
  };

  const handleChangeRole = async (userId: number, newRole: 'USER' | 'ADMIN') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (!window.confirm(`¿Cambiar rol de ${getFullName(user)} a ${newRole}?`)) return;

    try {
      const updatedUser = await userService.changeUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      toast.success(`Rol actualizado a ${newRole}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar el rol del usuario');
      loadUsers();
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

  return (
    <div className="management-container">
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
        </div>
      </div>

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
                users.map(user => {
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
                            {user.totalReservas > 0 && (
                              <span className="user-stats">
                                {user.totalReservas} reservas • {user.reservasActivas} activas
                              </span>
                            )}
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
                            className={`btn-icon ${user.activo ? 'btn-pause' : 'btn-play'}`}
                            title={user.activo ? 'Desactivar' : 'Activar'}
                            onClick={() => handleToggleStatus(user.id)}
                          >
                            <i className={`fas fa-${user.activo ? 'pause' : 'play'}`}></i>
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
          
          <span className="pagination-info">
            Página {currentPage + 1} de {totalPages} ({totalElements} usuarios)
          </span>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
