/**
 * Cliente HTTP centralizado con Axios
 * - Configuración base con URL y timeout
 * - Interceptor de request: inyecta token JWT automáticamente
 * - Interceptor de response: normaliza errores
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getToken } from '../utils/authStorage';

// Base URL del backend
// Usar proxy de Vite en desarrollo (/api se redirige a http://localhost:9090/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Crear instancia de Axios
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Request
 * Inyecta automáticamente el token JWT si existe en localStorage
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Response
 * Normaliza errores para manejo consistente en toda la aplicación
 */
httpClient.interceptors.response.use(
  (response) => {
    // Respuesta exitosa - pasar sin modificar
    return response;
  },
  (error: AxiosError) => {
    // Normalizar estructura de error
    let errorMessage = 'Error de conexión con el servidor';
    
    if (error.response) {
      // El servidor respondió con un código de error
      const data = error.response.data as any;
      errorMessage = data?.message || data?.error || `Error ${error.response.status}`;
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en el puerto 9090';
    } else {
      // Error al configurar la petición
      errorMessage = error.message || 'Error al realizar la petición';
    }
    
    // Crear un Error estándar con el mensaje normalizado
    const normalizedError = new Error(errorMessage);
    
    // Preservar información adicional para debugging
    (normalizedError as any).originalError = error;
    (normalizedError as any).statusCode = error.response?.status;
    
    return Promise.reject(normalizedError);
  }
);

export default httpClient;
