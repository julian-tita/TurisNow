/**
 * Servicio para gestión administrativa de experiencias
 * Consume endpoints /api/admin/experiencias
 */

import httpClient from './httpClient';

// ============= TIPOS =============

export interface UbicacionRequest {
  ciudad: string;
  region: string;
  pais: string;
}

export interface ExperienciaAdminRequest {
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: string;
  ubicacion: UbicacionRequest;
  categoria: string;
  imagenUrl?: string;
  tags?: string[];
}

export interface ExperienciaAdminResponse {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: string;
  ubicacion: UbicacionRequest;
  categoria: string;
  imagenUrl?: string;
  tags?: string[];
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  // Estadísticas
  totalSalidas: number;
  salidasActivas: number;
  totalReservas: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ExperienciaFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  q?: string; // Búsqueda por texto
}

// ============= SERVICIO =============

class AdminExperienciaService {
  private readonly BASE_URL = '/api/admin/experiencias';

  /**
   * Listar experiencias con paginación
   */
  async listarExperiencias(
    filters: ExperienciaFilters = {}
  ): Promise<PaginatedResponse<ExperienciaAdminResponse>> {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);

    const url = `${this.BASE_URL}?${params.toString()}`;
    const response = await httpClient.get<PaginatedResponse<ExperienciaAdminResponse>>(url);
    return response.data;
  }

  /**
   * Buscar experiencias por texto
   */
  async buscarExperiencias(
    query: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<ExperienciaAdminResponse>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString(),
    });

    const url = `${this.BASE_URL}/buscar?${params.toString()}`;
    const response = await httpClient.get<PaginatedResponse<ExperienciaAdminResponse>>(url);
    return response.data;
  }

  /**
   * Obtener experiencia por ID
   */
  async obtenerExperiencia(id: number): Promise<ExperienciaAdminResponse> {
    const response = await httpClient.get<ExperienciaAdminResponse>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Crear nueva experiencia
   */
  async crearExperiencia(request: ExperienciaAdminRequest): Promise<ExperienciaAdminResponse> {
    const response = await httpClient.post<ExperienciaAdminResponse>(this.BASE_URL, request);
    return response.data;
  }

  /**
   * Actualizar experiencia existente
   */
  async actualizarExperiencia(
    id: number,
    request: ExperienciaAdminRequest
  ): Promise<ExperienciaAdminResponse> {
    const response = await httpClient.put<ExperienciaAdminResponse>(
      `${this.BASE_URL}/${id}`,
      request
    );
    return response.data;
  }

  /**
   * Eliminar experiencia
   */
  async eliminarExperiencia(id: number): Promise<void> {
    await httpClient.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Validar formulario antes de enviar
   */
  validarFormulario(data: ExperienciaAdminRequest): string[] {
    const errores: string[] = [];

    if (!data.titulo || data.titulo.trim().length < 5) {
      errores.push('El título debe tener al menos 5 caracteres');
    }
    if (data.titulo && data.titulo.length > 200) {
      errores.push('El título no puede superar 200 caracteres');
    }

    if (!data.descripcion || data.descripcion.trim().length < 20) {
      errores.push('La descripción debe tener al menos 20 caracteres');
    }

    if (!data.precio || data.precio <= 0) {
      errores.push('El precio debe ser mayor a 0');
    }

    if (!data.moneda) {
      errores.push('Debe seleccionar una moneda');
    }

    if (!data.ubicacion?.ciudad || !data.ubicacion?.region || !data.ubicacion?.pais) {
      errores.push('Debe completar la ubicación completa (ciudad, región, país)');
    }

    if (!data.categoria) {
      errores.push('Debe seleccionar una categoría');
    }

    return errores;
  }
}

export default new AdminExperienciaService();
