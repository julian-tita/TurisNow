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

class UserService {
  private readonly baseURL = '/api/auth';

  private getAuthHeaders() {
    const token = localStorage.getItem('turisnow_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
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
}

// Export singleton instance
export const userService = new UserService();
export default userService;