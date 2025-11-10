import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id?: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  nombreCompleto?: string;
  rol: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>; // any para aceptar diferentes formatos
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const storedToken = localStorage.getItem('turisnow_token');
    const storedUser = localStorage.getItem('turisnow_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(username, password);
      
      if (response.token) {
        setToken(response.token);
        setUser({
          id: response.id,
          username: response.username,
          email: response.email,
          nombre: response.nombre,
          apellido: response.apellido,
          nombreCompleto: response.nombreCompleto,
          rol: response.rol
        });
        
        // Guardar en localStorage
        localStorage.setItem('turisnow_token', response.token);
        localStorage.setItem('turisnow_user', JSON.stringify({
          id: response.id,
          username: response.username,
          email: response.email,
          nombre: response.nombre,
          apellido: response.apellido,
          nombreCompleto: response.nombreCompleto,
          rol: response.rol
        }));
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.token) {
        setToken(response.token);
        setUser({
          id: response.id,
          username: response.username,
          email: response.email,
          nombre: response.nombre,
          apellido: response.apellido,
          nombreCompleto: response.nombreCompleto,
          rol: response.rol
        });
        
        // Guardar en localStorage
        localStorage.setItem('turisnow_token', response.token);
        localStorage.setItem('turisnow_user', JSON.stringify({
          id: response.id,
          username: response.username,
          email: response.email,
          nombre: response.nombre,
          apellido: response.apellido,
          nombreCompleto: response.nombreCompleto,
          rol: response.rol
        }));
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.loginWithGoogle(credential);
      
      if (response.token) {
        setToken(response.token);
        setUser({
          id: response.id,
          username: response.username,
          email: response.email,
          nombre: response.nombre,
          apellido: response.apellido,
          nombreCompleto: response.nombreCompleto,
          rol: response.rol
        });
        
        // Guardar en localStorage
        localStorage.setItem('turisnow_token', response.token);
        localStorage.setItem('turisnow_user', JSON.stringify({
          id: response.id,
          username: response.username,
          email: response.email,
          nombre: response.nombre,
          apellido: response.apellido,
          nombreCompleto: response.nombreCompleto,
          rol: response.rol
        }));
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('turisnow_token');
    localStorage.removeItem('turisnow_user');
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    loginWithGoogle,
    logout,
    isLoading,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
