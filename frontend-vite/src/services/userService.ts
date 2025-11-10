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

class UserService {
  private readonly baseURL = '/api/auth';
  private readonly usersAdminURL = '/api/users';

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
   * GET /api/users - Obtener lista paginada de usuarios (solo ADMIN)
   */
  async getAllUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    try {
      const queryParams = this.buildQueryParams(filters);
      const url = `${this.usersAdminURL}?${queryParams.toString()}`;
      
      console.log('🔍 Fetching users from:', url);
      
      const { data } = await axios.get(url, {
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
   * PUT /api/users/{id} - Actualizar usuario (solo ADMIN)
   */
  async updateUser(id: number, userData: Partial<UserDTO>): Promise<UserDTO> {
    try {
      const { data } = await axios.put(
        `${this.usersAdminURL}/${id}`,
        userData,
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
   * DELETE /api/users/{id} - Eliminar usuario (solo ADMIN)
   */
  async deleteUser(id: number): Promise<void> {
    try {
      await axios.delete(`${this.usersAdminURL}/${id}`, {
        headers: this.getAuthHeaders()
      });
      
      console.log('✅ User deleted successfully:', id);
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  }

  /**
   * PUT /api/users/{id}/toggle-status - Activar/Desactivar usuario (solo ADMIN)
   */
  async toggleUserStatus(id: number): Promise<UserDTO> {
    try {
      const { data } = await axios.put(
        `${this.usersAdminURL}/${id}/toggle-status`,
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
   * PUT /api/users/{id}/change-role - Cambiar rol de usuario (solo ADMIN)
   */
  async changeUserRole(id: number, newRole: 'USER' | 'ADMIN'): Promise<UserDTO> {
    try {
      const { data } = await axios.put(
        `${this.usersAdminURL}/${id}/change-role`,
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
}

// Export singleton instance
export const userService = new UserService();
export default userService;