import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
  ExperienciaListadoDTO,
  ExperienciaDetalleDTO,
  ExperienciasResponse,
  ExperienciaFilters,
  ExperienciaRequest,
  PageResponse,
  Categoria
} from '../types/experiencia.types';
import { normalizeCategoria } from '../types/experiencia.types';

// Base URL del backend
// Usar proxy de Vite en desarrollo (/api se redirige a http://localhost:9090/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const EXPERIENCIAS_ENDPOINT = `${API_BASE_URL}/api/experiencias`;

// Helper para headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper para normalizar categorías en las respuestas de la API
const normalizeExperiencia = (exp: any): ExperienciaListadoDTO => {
  const categoriaNormalizada = normalizeCategoria(exp.categoria);
  return {
    ...exp,
    categoria: categoriaNormalizada || exp.categoria
  };
};

const normalizeExperienciaDetalle = (exp: any): ExperienciaDetalleDTO => {
  const categoriaNormalizada = normalizeCategoria(exp.categoria);
  return {
    ...exp,
    categoria: categoriaNormalizada || exp.categoria
  };
};

// Helper para construir query parameters
const buildQueryParams = (filters: ExperienciaFilters): URLSearchParams => {
  const params = new URLSearchParams();
  
  if (filters.categoria) params.append('categoria', filters.categoria);
  if (filters.ubicacion) params.append('ubicacion', filters.ubicacion);
  if (filters.page !== undefined) params.append('page', filters.page.toString());
  if (filters.size !== undefined) params.append('size', filters.size.toString());
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.direction) params.append('direction', filters.direction);
  if (filters.random) params.append('random', 'true');
  
  return params;
};

export const experienciaService = {
  /**
   * GET /api/experiencias - Obtener lista paginada de experiencias
   * @param filters - Filtros opcionales para la búsqueda
   * @returns Promise con la respuesta paginada
   */
  async getAllExperiencias(filters: ExperienciaFilters = {}): Promise<ExperienciasResponse> {
    try {
      const queryParams = buildQueryParams(filters);
      const url = `${EXPERIENCIAS_ENDPOINT}?${queryParams.toString()}`;
      
      console.log('🔍 Fetching experiencias from:', url);
      
      const response: AxiosResponse<ExperienciasResponse> = await axios.get(url);
      
      // Normalizar categorías en todas las experiencias
      const normalizedData = {
        ...response.data,
        content: response.data.content.map(normalizeExperiencia)
      };
      
      console.log('✅ Experiencias fetched successfully:', normalizedData);
      return normalizedData;
    } catch (error) {
      console.error('❌ Error fetching experiencias:', error);
      throw error;
    }
  },

  /**
   * GET /api/experiencias/{id} - Obtener detalle de una experiencia específica
   * @param id - ID de la experiencia
   * @returns Promise con el detalle completo de la experiencia
   */
  async getExperienciaById(id: number): Promise<ExperienciaDetalleDTO> {
    try {
      console.log(`🔍 Fetching experiencia detail for ID: ${id}`);
      
      const response: AxiosResponse<ExperienciaDetalleDTO> = await axios.get(
        `${EXPERIENCIAS_ENDPOINT}/${id}`
      );
      
      const normalizedData = normalizeExperienciaDetalle(response.data);
      
      console.log('✅ Experiencia detail fetched successfully:', normalizedData);
      return normalizedData;
    } catch (error) {
      console.error(`❌ Error fetching experiencia ${id}:`, error);
      throw error;
    }
  },

  /**
   * POST /api/experiencias - Crear nueva experiencia (ADMIN only)
   * @param experiencia - Datos de la nueva experiencia
   * @returns Promise con la experiencia creada
   */
  async createExperiencia(experiencia: ExperienciaRequest): Promise<ExperienciaDetalleDTO> {
    try {
      console.log('🆕 Creating new experiencia:', experiencia);
      
      const response: AxiosResponse<ExperienciaDetalleDTO> = await axios.post(
        EXPERIENCIAS_ENDPOINT,
        experiencia,
        { headers: getAuthHeaders() }
      );
      
      console.log('✅ Experiencia created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating experiencia:', error);
      throw error;
    }
  },

  /**
   * PUT /api/experiencias/{id} - Actualizar experiencia existente (ADMIN only)
   * @param id - ID de la experiencia a actualizar
   * @param experiencia - Nuevos datos de la experiencia
   * @returns Promise con la experiencia actualizada
   */
  async updateExperiencia(id: number, experiencia: ExperienciaRequest): Promise<ExperienciaDetalleDTO> {
    try {
      console.log(`🔄 Updating experiencia ${id}:`, experiencia);
      
      const response: AxiosResponse<ExperienciaDetalleDTO> = await axios.put(
        `${EXPERIENCIAS_ENDPOINT}/${id}`,
        experiencia,
        { headers: getAuthHeaders() }
      );
      
      console.log('✅ Experiencia updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating experiencia ${id}:`, error);
      throw error;
    }
  },

  /**
   * DELETE /api/experiencias/{id} - Eliminar experiencia (ADMIN only)
   * @param id - ID de la experiencia a eliminar
   * @returns Promise<void>
   */
  async deleteExperiencia(id: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting experiencia ${id}`);
      
      await axios.delete(
        `${EXPERIENCIAS_ENDPOINT}/${id}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('✅ Experiencia deleted successfully');
    } catch (error) {
      console.error(`❌ Error deleting experiencia ${id}:`, error);
      throw error;
    }
  },

  /**
   * PATCH /api/admin/experiencias/{id}/toggle-status - Cambiar estado activo/inactivo (ADMIN only)
   * @param id - ID de la experiencia
   * @returns Promise con la experiencia actualizada
   */
  async toggleExperienciaStatus(id: number): Promise<ExperienciaListadoDTO> {
    try {
      console.log(`🔄 Toggling status for experiencia ${id}`);
      
      const response: AxiosResponse<ExperienciaListadoDTO> = await axios.patch(
        `${API_BASE_URL}/admin/experiencias/${id}/toggle-status`,
        {},
        { headers: getAuthHeaders() }
      );
      
      console.log('✅ Status toggled successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error toggling experiencia status ${id}:`, error);
      throw error;
    }
  },

  /**
   * GET /api/admin/experiencias - Obtener todas las experiencias para admin (incluye inactivas)
   * @param filters - Filtros de búsqueda y paginación
   * @returns Promise con la página de experiencias
   */
  async getAllExperienciasAdmin(filters?: ExperienciaFilters): Promise<PageResponse<ExperienciaListadoDTO>> {
    try {
      console.log('🔍 Fetching all experiencias for admin with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters?.categoria) params.append('categoria', filters.categoria);
      if (filters?.ubicacion) params.append('ubicacion', filters.ubicacion);
      if (filters?.page !== undefined) params.append('page', filters.page.toString());
      if (filters?.size !== undefined) params.append('size', filters.size.toString());
      if (filters?.sort) params.append('sort', filters.sort);
      if (filters?.direction) params.append('direction', filters.direction);
      
      const response: AxiosResponse<PageResponse<ExperienciaListadoDTO>> = await axios.get(
        `${API_BASE_URL}/admin/experiencias?${params.toString()}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('✅ Admin experiencias loaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error loading admin experiencias:', error);
      throw error;
    }
  },

  // Helper methods for common use cases
  
  /**
   * Obtener experiencias por categoría
   * @param categoria - Categoría a filtrar
   * @param page - Página (opcional)
   * @param size - Tamaño de página (opcional)
   */
  async getExperienciasByCategoria(
    categoria: string, 
    page = 0, 
    size = 6
  ): Promise<ExperienciasResponse> {
    return this.getAllExperiencias({ categoria: categoria as any, page, size });
  },

  /**
   * Obtener experiencias por ubicación
   * @param ubicacion - Ubicación a filtrar
   * @param page - Página (opcional)
   * @param size - Tamaño de página (opcional)
   */
  async getExperienciasByUbicacion(
    ubicacion: string, 
    page = 0, 
    size = 6
  ): Promise<ExperienciasResponse> {
    return this.getAllExperiencias({ ubicacion, page, size });
  },

  /**
   * Test de conexión con el backend
   * @returns Promise<boolean> - true si la conexión es exitosa
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔌 Testing connection to backend...');
      
      await this.getAllExperiencias({ size: 1 });
      
      console.log('✅ Backend connection successful');
      return true;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return false;
    }
  },

  /**
   * GET /api/experiencias/destacadas - Obtener experiencias destacadas
   * @param size - Cantidad de experiencias (default: 4)
   * @returns Promise con array de experiencias destacadas
   */
  async getExperienciasDestacadas(size = 4): Promise<ExperienciaListadoDTO[]> {
    try {
      console.log(`🔍 Fetching ${size} destacadas...`);
      
      const response: AxiosResponse<ExperienciaListadoDTO[]> = await axios.get(
        `${EXPERIENCIAS_ENDPOINT}/destacadas`,
        { 
          params: { size },
          headers: {} // Endpoint público - no enviar Authorization
        }
      );
      
      console.log('✅ Destacadas fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching destacadas:', error);
      // Fallback: obtener primeras experiencias de la lista general
      const { content } = await this.getAllExperiencias({ size, page: 0 });
      return content;
    }
  },

  /**
   * GET /api/experiencias/categorias - Obtener categorías disponibles
   * Si el endpoint no existe, deriva las categorías de todas las experiencias
   * @returns Promise con array de categorías
   */
  async getCategorias(): Promise<Categoria[]> {
    try {
      console.log('🔍 Fetching categorias...');
      
      // Intentar obtener categorías del endpoint específico (público - sin auth)
      try {
        const response: AxiosResponse<Categoria[]> = await axios.get(
          `${EXPERIENCIAS_ENDPOINT}/categorias`,
          { headers: {} } // Endpoint público - no enviar Authorization
        );
        console.log('✅ Categorias fetched from endpoint:', response.data);
        return response.data;
      } catch (endpointError) {
        // Si no existe el endpoint, derivar de todas las experiencias
        console.log('ℹ️ Endpoint /categorias no disponible, derivando de experiencias...');
        const { content } = await this.getAllExperiencias({ size: 1000 });
        const categoriasSet = new Set<Categoria>(content.map(exp => exp.categoria));
        const categorias = Array.from(categoriasSet);
        console.log('✅ Categorias derivadas:', categorias);
        return categorias;
      }
    } catch (error) {
      console.error('❌ Error fetching categorias:', error);
      // Retornar categorías por defecto en caso de error
      return ['PLAYA', 'MONTANA', 'AVENTURA', 'GASTRONOMIA', 'CULTURA'];
    }
  },

  /**
   * GET /api/experiencias/categorias/conteo - Obtener conteo por categoría
   * Si el endpoint no existe, cuenta manualmente desde todas las experiencias
   * @returns Promise con array de {categoria, cantidad}
   */
  async getCategoriasConConteo(): Promise<Array<{ categoria: Categoria; cantidad: number }>> {
    try {
      console.log('🔍 Fetching categorias con conteo...');
      
      // Intentar obtener conteo del endpoint específico (público - sin auth)
      try {
        const response: AxiosResponse<Array<{ categoria: string; cantidad: number }>> = await axios.get(
          `${EXPERIENCIAS_ENDPOINT}/categorias/conteo`,
          { headers: {} } // Endpoint público - no enviar Authorization
        );
        
        // Convertir strings del backend a tipo Categoria
        const resultado = response.data.map(item => ({
          categoria: item.categoria as Categoria,
          cantidad: item.cantidad
        }));
        
        console.log('✅ Categorias con conteo fetched from endpoint:', resultado);
        return resultado;
      } catch (endpointError) {
        // Si no existe el endpoint, contar manualmente
        console.log('ℹ️ Endpoint /categorias/conteo no disponible, contando manualmente...');
        
        const { content } = await this.getAllExperiencias({ size: 1000 });
        const conteo = new Map<Categoria, number>();
        
        content.forEach(exp => {
          // Normalizar categoría de la BD (minúsculas con tildes) a TypeScript (MAYÚSCULAS sin tildes)
          const categoriaNormalizada = normalizeCategoria(exp.categoria);
          if (categoriaNormalizada) {
            conteo.set(categoriaNormalizada, (conteo.get(categoriaNormalizada) || 0) + 1);
          }
        });
        
        const resultado = Array.from(conteo.entries()).map(([categoria, cantidad]) => ({
          categoria,
          cantidad
        }));
        
        console.log('✅ Categorias con conteo calculadas:', resultado);
        return resultado;
      }
    } catch (error) {
      console.error('❌ Error fetching categorias con conteo:', error);
      // Retornar array vacío en caso de error
      return [];
    }
  }
};

export default experienciaService;