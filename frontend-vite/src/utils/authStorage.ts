/**
 * Módulo de gestión de persistencia de autenticación en localStorage
 * Centraliza el acceso a token y datos de usuario
 */

const TOKEN_KEY = 'turisnow_token';
const USER_KEY = 'turisnow_user';

export interface StoredUser {
  id?: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  nombreCompleto?: string;
  rol: 'USER' | 'ADMIN';
}

/**
 * Guarda el token de autenticación en localStorage
 * @param token - JWT token
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Obtiene el token de autenticación desde localStorage
 * @returns Token o null si no existe
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Elimina el token de autenticación de localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Guarda los datos del usuario en localStorage
 * @param user - Datos del usuario
 */
export const saveUser = (user: StoredUser): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Obtiene los datos del usuario desde localStorage
 * @returns Usuario parseado o null si no existe o hay error
 */
export const getUser = (): StoredUser | null => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    // Si hay error al parsear, eliminar datos corruptos
    removeUser();
    return null;
  }
};

/**
 * Elimina los datos del usuario de localStorage
 */
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Guarda tanto el token como los datos del usuario
 * @param token - JWT token
 * @param user - Datos del usuario
 */
export const saveAuth = (token: string, user: StoredUser): void => {
  saveToken(token);
  saveUser(user);
};

/**
 * Elimina tanto el token como los datos del usuario
 */
export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

/**
 * Verifica si existe una sesión guardada
 * @returns true si existen token y usuario
 */
export const hasStoredAuth = (): boolean => {
  return getToken() !== null && getUser() !== null;
};
