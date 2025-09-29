const API_BASE_URL = 'http://localhost:8080/api/auth';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  nombreCompleto: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  nombreCompleto: string;
  rol: 'USER' | 'ADMIN';
  message?: string;
}

class AuthService {
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      if (!data.token) {
        throw new Error('Token no recibido del servidor');
      }

      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en el puerto 8080');
      }
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      if (!data.token) {
        throw new Error('Token no recibido del servidor');
      }

      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en el puerto 8080');
      }
      throw error;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
