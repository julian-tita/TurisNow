/**
 * Tipos relacionados con autenticación y usuarios
 */

/**
 * Rol del usuario en el sistema
 */
export type UserRole = 'USER' | 'ADMIN';

/**
 * Datos del usuario autenticado
 */
export interface User {
  id?: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  nombreCompleto?: string;
  rol: UserRole;
}

/**
 * Datos de registro de nuevo usuario
 */
export interface RegisterUserData {
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  password: string;
  // Campos opcionales
  telefono?: string;
  documento?: string;
  fechaNacimiento?: string; // ISO format: YYYY-MM-DD
  direccion?: string;
}

/**
 * Contexto de autenticación
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterUserData) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Tipo para errores de autenticación
 */
export interface AuthError extends Error {
  message: string;
  statusCode?: number;
  originalError?: unknown;
}

/**
 * Type guard para verificar si un error es AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as AuthError).message === 'string'
  );
}

/**
 * Extrae el mensaje de error de cualquier tipo de error
 */
export function getErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Error desconocido';
}
