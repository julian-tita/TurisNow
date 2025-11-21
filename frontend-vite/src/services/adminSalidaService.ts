/**
 * Servicio para gestión administrativa de salidas
 * Consume endpoints /api/admin/salidas
 */

import httpClient from './httpClient';
import type { PaginatedResponse } from './adminExperienciaService';

// ============= TIPOS =============

export interface SalidaAdminRequest {
  experienciaId: number;
  fechaInicio: string; // ISO 8601 format
  fechaFin?: string;   // ISO 8601 format (opcional)
  capacidadTotal: number;
}

export interface SalidaAdminResponse {
  id: number;
  experienciaId: number;
  experienciaTitulo: string;
  fechaInicio: string;
  fechaFin?: string;
  capacidadTotal: number;
  capacidadDisponible: number;
  reservasActivas: number;
  estado: 'DISPONIBLE' | 'COMPLETA' | 'PASADA';
  createdAt: string;
  updatedAt: string;
}

export interface SalidaFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  experienciaId?: number;
}

// ============= SERVICIO =============

class AdminSalidaService {
  private readonly BASE_URL = '/api/admin/salidas';

  /**
   * Listar salidas con paginación y filtros
   */
  async listarSalidas(
    filters: SalidaFilters = {}
  ): Promise<PaginatedResponse<SalidaAdminResponse>> {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    if (filters.experienciaId) params.append('experienciaId', filters.experienciaId.toString());

    const url = `${this.BASE_URL}?${params.toString()}`;
    const response = await httpClient.get<PaginatedResponse<SalidaAdminResponse>>(url);
    return response.data;
  }

  /**
   * Obtener salida por ID
   */
  async obtenerSalida(id: number): Promise<SalidaAdminResponse> {
    const response = await httpClient.get<SalidaAdminResponse>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Crear nueva salida
   */
  async crearSalida(request: SalidaAdminRequest): Promise<SalidaAdminResponse> {
    const response = await httpClient.post<SalidaAdminResponse>(this.BASE_URL, request);
    return response.data;
  }

  /**
   * Actualizar salida existente
   */
  async actualizarSalida(
    id: number,
    request: SalidaAdminRequest
  ): Promise<SalidaAdminResponse> {
    const response = await httpClient.put<SalidaAdminResponse>(
      `${this.BASE_URL}/${id}`,
      request
    );
    return response.data;
  }

  /**
   * Eliminar salida
   */
  async eliminarSalida(id: number): Promise<void> {
    await httpClient.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Validar formulario de salida
   */
  validarFormulario(data: SalidaAdminRequest): string[] {
    const errores: string[] = [];

    if (!data.experienciaId || data.experienciaId <= 0) {
      errores.push('Debe seleccionar una experiencia');
    }

    if (!data.fechaInicio) {
      errores.push('La fecha de inicio es obligatoria');
    } else {
      const fechaInicio = new Date(data.fechaInicio);
      const ahora = new Date();
      
      if (fechaInicio <= ahora) {
        errores.push('La fecha de inicio debe ser futura');
      }
    }

    if (data.fechaFin) {
      const fechaInicio = new Date(data.fechaInicio);
      const fechaFin = new Date(data.fechaFin);
      
      if (fechaFin <= fechaInicio) {
        errores.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    if (!data.capacidadTotal || data.capacidadTotal < 1) {
      errores.push('La capacidad debe ser al menos 1');
    }

    if (data.capacidadTotal > 1000) {
      errores.push('La capacidad no puede superar 1000 personas');
    }

    return errores;
  }

  /**
   * Formatear fecha para input datetime-local
   */
  formatearFechaInput(fecha: string | Date): string {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return d.toISOString().slice(0, 16); // "2025-12-15T08:00"
  }

  /**
   * Calcular porcentaje de ocupación
   */
  calcularOcupacion(salida: SalidaAdminResponse): number {
    if (salida.capacidadTotal === 0) return 0;
    const ocupadas = salida.capacidadTotal - salida.capacidadDisponible;
    return Math.round((ocupadas / salida.capacidadTotal) * 100);
  }
}

export default new AdminSalidaService();
