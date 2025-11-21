// filepath: frontend-vite/src/services/userService.ts
import axios from 'axios';

export interface UserDTO {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  nombreCompleto?: string; // Por compatibilidad
  telefono?: string;
  documento?: string;
  fechaNacimiento?: string;
  direccion?: string;
  rol?: 'USER' | 'ADMIN';
  activo?: boolean;
  fechaCreacion?: string;
  fechaRegistro?: string; // Alias para compatibilidad con UsersManagement
  ultimoAcceso?: string;
}

export interface UpdateUserRequest {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  documento?: string;
  fechaNacimiento?: string;
  direccion?: string;
}

// Types para administración de usuarios
export interface UsersResponse {
  content: UserDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserFilters {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  rol?: 'USER' | 'ADMIN' | 'ALL';
  search?: string;
}

export interface UsuarioAdminRequest {
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  documento?: string;
  fechaNacimiento?: string;
  direccion?: string;
  rol: 'USER' | 'ADMIN';
  activo: boolean;
}

export interface UsuarioAdminResponse {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  documento?: string;
  fechaNacimiento?: string;
  direccion?: string;
  rol: 'USER' | 'ADMIN';
  activo: boolean;
  googleId?: string;
  fechaCreacion: string;
  ultimoAcceso?: string;
  totalReservas: number;
  reservasActivas: number;
}

export interface PaginatedUsersResponse {
  content: UsuarioAdminResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class UserService {
  private readonly baseURL = '/api/auth';
  private readonly adminUsersURL = '/api/admin/usuarios';

  private getAuthHeaders() {
    const token = localStorage.getItem('turisnow_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Helper para construir query parameters
  private buildQueryParams(filters: UserFilters): URLSearchParams {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.direction) params.append('direction', filters.direction);
    if (filters.rol && filters.rol !== 'ALL') params.append('rol', filters.rol);
    if (filters.search) params.append('search', filters.search);
    
    return params;
  }

  async getMe(): Promise<UserDTO> {
    try {
      const { data } = await axios.get(`${this.baseURL}/me`, {
        headers: this.getAuthHeaders()
      });
      return data;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar el perfil');
    }
  }

  async updateMe(payload: UpdateUserRequest): Promise<UserDTO> {
    try {
      const { data } = await axios.put(`${this.baseURL}/me`, payload, {
        headers: this.getAuthHeaders()
      });
      return data;
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar los datos');
    }
  }

  // ========== MÉTODOS DE ADMINISTRACIÓN ==========

  /**
   * GET /api/admin/usuarios - Obtener lista paginada de usuarios (solo ADMIN)
   */
  async getAllUsers(filters: UserFilters = {}): Promise<PaginatedUsersResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.search) params.append('q', filters.search);
      if (filters.rol && filters.rol !== 'ALL') params.append('rol', filters.rol);
      
      const url = `${this.adminUsersURL}?${params.toString()}`;
      console.log('🔍 Fetching users from:', url);
      
      const { data } = await axios.get<PaginatedUsersResponse>(url, {
        headers: this.getAuthHeaders()
      });
      
      console.log('✅ Users fetched successfully:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar usuarios');
    }
  }

  /**
   * GET /api/admin/usuarios/{id} - Obtener usuario por ID
   */
  async getUserById(id: number): Promise<UsuarioAdminResponse> {
    try {
      const { data } = await axios.get<UsuarioAdminResponse>(
        `${this.adminUsersURL}/${id}`,
        { headers: this.getAuthHeaders() }
      );
      return data;
    } catch (error: any) {
      console.error('❌ Error fetching user:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar usuario');
    }
  }

  /**
   * PUT /api/admin/usuarios/{id} - Actualizar usuario (solo ADMIN)
   */
  async updateUser(id: number, request: UsuarioAdminRequest): Promise<UsuarioAdminResponse> {
    try {
      const { data } = await axios.put<UsuarioAdminResponse>(
        `${this.adminUsersURL}/${id}`,
        request,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ User updated successfully:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  }

  /**
   * PATCH /api/admin/usuarios/{id}/toggle-activo - Activar/Desactivar usuario (solo ADMIN)
   */
  async toggleUserStatus(id: number): Promise<UsuarioAdminResponse> {
    try {
      const { data } = await axios.patch<UsuarioAdminResponse>(
        `${this.adminUsersURL}/${id}/toggle-activo`,
        {},
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ User status toggled successfully:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Error toggling user status:', error);
      throw new Error(error.response?.data?.message || 'Error al cambiar estado');
    }
  }

  /**
   * PATCH /api/admin/usuarios/{id}/rol - Cambiar rol de usuario (solo ADMIN)
   */
  async changeUserRole(id: number, newRole: 'USER' | 'ADMIN'): Promise<UsuarioAdminResponse> {
    try {
      const { data } = await axios.patch<UsuarioAdminResponse>(
        `${this.adminUsersURL}/${id}/rol`,
        { rol: newRole },
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ User role changed successfully:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Error changing user role:', error);
      throw new Error(error.response?.data?.message || 'Error al cambiar rol');
    }
  }

  /**
   * Validar datos de usuario admin
   */
  validarUsuarioAdmin(data: UsuarioAdminRequest): string[] {
    const errores: string[] = [];

    if (!data.username || data.username.trim().length < 3 || data.username.length > 50) {
      errores.push('El username debe tener entre 3 y 50 caracteres');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errores.push('Debe ingresar un email válido');
    }

    if (!data.nombre || data.nombre.trim().length < 2 || data.nombre.length > 100) {
      errores.push('El nombre debe tener entre 2 y 100 caracteres');
    }

    if (!data.apellido || data.apellido.trim().length < 2 || data.apellido.length > 100) {
      errores.push('El apellido debe tener entre 2 y 100 caracteres');
    }

    if (!data.rol) {
      errores.push('Debe seleccionar un rol');
    }

    return errores;
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;