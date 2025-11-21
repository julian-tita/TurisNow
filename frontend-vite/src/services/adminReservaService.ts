/**
 * Servicio para gestión administrativa de reservas
 * Consume endpoints /api/admin/reservas
 */

import httpClient from './httpClient';
import type { PaginatedResponse } from './adminExperienciaService';

// ============= TIPOS =============

export interface PagoInfoDTO {
  preferenceId?: string;
  paymentId?: string;
  estado: string;
  metodoPago?: string;
  montoTotal: number;
  fechaCreacion: string;
  fechaAprobacion?: string;
}

export interface ReservaAdminResponse {
  id: number;
  codigoReserva: string;
  
  // Usuario
  usuarioId: number;
  usuarioNombre: string;
  usuarioEmail: string;
  
  // Salida
  salidaId: number;
  experienciaTitulo: string;
  salidaFecha: string;
  
  // Detalles
  cantidadPersonas: number;
  precioTotal: number;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
  
  // Check-in
  tokenQr: string;
  checkinRealizado: boolean;
  fechaCheckin?: string;
  checkinPor?: string;
  
  // Cancelación
  motivoCancelacion?: string;
  
  // Pago
  pago?: PagoInfoDTO;
  
  // Fechas
  fechaReserva: string;
  fechaCancelacion?: string;
}

export interface ReservaFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  estado?: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
}

export interface CancelarReservaRequest {
  motivo: string;
}

export interface CheckinRequest {
  checkinPor: string;
}

// ============= SERVICIO =============

class AdminReservaService {
  private readonly BASE_URL = '/api/admin/reservas';

  /**
   * Listar reservas con paginación y filtros
   */
  async listarReservas(
    filters: ReservaFilters = {}
  ): Promise<PaginatedResponse<ReservaAdminResponse>> {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    if (filters.estado) params.append('estado', filters.estado);

    const url = `${this.BASE_URL}?${params.toString()}`;
    const response = await httpClient.get<PaginatedResponse<ReservaAdminResponse>>(url);
    return response.data;
  }

  /**
   * Obtener reserva por ID con detalles completos
   */
  async obtenerReserva(id: number): Promise<ReservaAdminResponse> {
    const response = await httpClient.get<ReservaAdminResponse>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Cancelar reserva
   */
  async cancelarReserva(id: number, motivo: string): Promise<ReservaAdminResponse> {
    const request: CancelarReservaRequest = { motivo };
    const response = await httpClient.post<ReservaAdminResponse>(
      `${this.BASE_URL}/${id}/cancelar`,
      request
    );
    return response.data;
  }

  /**
   * Completar reserva
   */
  async completarReserva(id: number): Promise<ReservaAdminResponse> {
    const response = await httpClient.post<ReservaAdminResponse>(
      `${this.BASE_URL}/${id}/completar`
    );
    return response.data;
  }

  /**
   * Realizar check-in
   */
  async realizarCheckin(id: number, checkinPor: string): Promise<ReservaAdminResponse> {
    const request: CheckinRequest = { checkinPor };
    const response = await httpClient.post<ReservaAdminResponse>(
      `${this.BASE_URL}/${id}/checkin`,
      request
    );
    return response.data;
  }

  /**
   * Obtener badge class según estado
   */
  getBadgeClass(estado: string): string {
    const badgeMap: Record<string, string> = {
      PENDIENTE: 'warning',
      CONFIRMADA: 'success',
      CANCELADA: 'danger',
      COMPLETADA: 'info',
    };
    return `badge bg-${badgeMap[estado] || 'secondary'}`;
  }

  /**
   * Obtener badge class para estado de pago
   */
  getPagoBadgeClass(estado: string): string {
    const badgeMap: Record<string, string> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
      cancelled: 'secondary',
      refunded: 'info',
    };
    return `badge bg-${badgeMap[estado] || 'secondary'}`;
  }

  /**
   * Formatear fecha legible
   */
  formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Verificar si puede cancelarse
   */
  puedeCancelar(reserva: ReservaAdminResponse): boolean {
    return reserva.estado === 'CONFIRMADA' || reserva.estado === 'PENDIENTE';
  }

  /**
   * Verificar si puede completarse
   */
  puedeCompletar(reserva: ReservaAdminResponse): boolean {
    return reserva.estado === 'CONFIRMADA' && reserva.checkinRealizado;
  }

  /**
   * Verificar si puede hacer check-in
   */
  puedeCheckin(reserva: ReservaAdminResponse): boolean {
    return reserva.estado === 'CONFIRMADA' && !reserva.checkinRealizado;
  }
}

export default new AdminReservaService();
