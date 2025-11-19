// TurisNow: Reservation Service - Frontend API client
import axios from 'axios';

// Usar proxy de Vite en desarrollo (/api se redirige a http://localhost:9090/api)
// En producción usar la variable de entorno
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'; // Usar proxy de Vite en desarrollo

// Types based on backend DTOs
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  pageable?: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  sort?: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
}

export interface ReservaRequest {
  salidaId: number;
  cantidadPersonas: number;
  precioTotal: number;
  observaciones?: string;
  // Nuevos campos para el pago (futuro)
  metodoPago?: string;
  datosPago?: {
    numeroTarjeta?: string;
    titular?: string;
    cuotas?: number;
  } | null;
}

export interface ReservaResponse {
  id?: number;
  salidaId?: number;
  tituloExperiencia?: string;
  ciudadExperiencia?: string;
  fechaInicio?: string;
  fechaFin?: string;
  cantidadPersonas?: number;
  precioTotal?: number;
  estado?: string;
  fechaReserva?: string;
  fechaConfirmacion?: string;
  observaciones?: string;
  mensaje: string;
}

// QR Data interface - defined before ReservaDetalleDTO to ensure proper export
export type QRData = {
  reservaId: number;
  tokenQr: string;
  qrCodeBase64: string;
  estadoReserva: string;
  checkinRealizado: boolean;
  fechaCheckin?: string;
  tituloExperiencia: string;
  fechaInicio: string;
  cantidadPersonas: number;
};

export interface ReservaDetalleDTO {
  id: number;
  salidaId: number;
  tituloExperiencia: string;
  descripcionExperiencia: string;
  ciudadExperiencia: string;
  paisExperiencia: string;
  fechaInicio: string;
  fechaFin: string;
  cantidadPersonas: number;
  precioTotal: number;
  estado: string;
  fechaReserva: string;
  fechaConfirmacion?: string;
  fechaCancelacion?: string;
  observaciones?: string;
  nombreUsuario: string;
  emailUsuario: string;
  // QR Code y Check-in
  tokenQr?: string;
  checkinRealizado?: boolean;
  fechaCheckin?: string;
  checkinPor?: string;
}

class ReservaService {
  private getAuthHeaders() {
    const token = localStorage.getItem('turisnow_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Crear una nueva reserva
   */
  async crearReserva(reservaData: ReservaRequest): Promise<ReservaResponse> {
    try {
      console.log('🔍 Creating reservation:', reservaData);
      
      const response = await axios.post(
        `${API_URL}/reservas`,
        reservaData,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Reservation created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating reservation:', error);
      throw new Error(
        error.response?.data?.mensaje || 
        error.message || 
        'Error al crear la reserva'
      );
    }
  }

  /**
   * Obtener reservas del usuario con paginación
   */
  async obtenerMisReservas(
    page = 0, 
    size = 10, 
    estado?: string
  ): Promise<PageResponse<ReservaDetalleDTO>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: 'fechaReserva',
        direction: 'DESC'
      });

      let url: string;
      
      if (estado && estado.trim() !== '') {
        // Usar el endpoint específico para filtrar por estado (devuelve Page)
        url = `${API_URL}/reservas/mis-reservas/estado/${estado.toUpperCase()}?${params}`;
        console.log('🔍 Fetching reservations by state:', estado, 'from:', url);
      } else {
        // Usar el endpoint general para todas las reservas (devuelve List)
        url = `${API_URL}/reservas/mis-reservas?${params}`;
        console.log('🔍 Fetching all reservations from:', url);
      }

      const response = await axios.get(url, { 
        headers: this.getAuthHeaders() 
      });

      console.log('✅ Reservations fetched successfully:', response.data);
      
      // Si hay estado específico, la respuesta es una Page
      if (estado && estado.trim() !== '') {
        return response.data; // Es una Page con content, totalElements, etc.
      } else {
        // Si no hay estado, la respuesta es una List, necesitamos convertirla a formato Page
        const reservasList = response.data as ReservaDetalleDTO[];
        const totalPages = Math.ceil(reservasList.length / size);
        return {
          content: reservasList,
          totalElements: reservasList.length,
          totalPages: totalPages,
          number: page,
          size: size,
          first: page === 0,
          last: page === totalPages - 1 || reservasList.length === 0,
          numberOfElements: reservasList.length,
          empty: reservasList.length === 0,
          pageable: {
            pageNumber: page,
            pageSize: size,
            sort: { sorted: false, empty: true, unsorted: true },
            offset: page * size,
            paged: true,
            unpaged: false
          },
          sort: { sorted: false, empty: true, unsorted: true }
        } as PageResponse<ReservaDetalleDTO>;
      }
    } catch (error: any) {
      console.error('❌ Error fetching user reservations:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener las reservas'
      );
    }
  }

  /**
   * Obtener detalle de una reserva específica
   */
  async obtenerReservaPorId(reservaId: number): Promise<ReservaDetalleDTO> {
    try {
      const response = await axios.get(
        `${API_URL}/reservas/${reservaId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching reservation detail:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener el detalle de la reserva'
      );
    }
  }

  /**
   * Confirmar una reserva
   */
  async confirmarReserva(reservaId: number): Promise<ReservaResponse> {
    try {
      console.log('🔍 Confirming reservation:', reservaId);
      
      const response = await axios.put(
        `${API_URL}/reservas/${reservaId}/confirmar`,
        {},
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Reservation confirmed successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error confirming reservation:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al confirmar la reserva'
      );
    }
  }

  /**
   * Cancelar una reserva
   */
  async cancelarReserva(reservaId: number): Promise<ReservaResponse> {
    try {
      const response = await axios.put(
        `${API_URL}/reservas/${reservaId}/cancelar`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error canceling reservation:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al cancelar la reserva'
      );
    }
  }

  /**
   * Validar datos de reserva antes del envío
   */
  validarDatosReserva(reserva: ReservaRequest): { valido: boolean; errores: string[] } {
    const errores: string[] = [];
    
    if (!reserva.salidaId || reserva.salidaId <= 0) {
      errores.push('Debe seleccionar una fecha de salida válida');
    }
    
    if (!reserva.cantidadPersonas || reserva.cantidadPersonas <= 0) {
      errores.push('La cantidad de personas debe ser mayor a 0');
    }
    
    if (!reserva.precioTotal || reserva.precioTotal <= 0) {
      errores.push('El precio total debe ser mayor a 0');
    }
    
    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Formatear precio con moneda
   */
  formatearPrecio(precio: number, moneda = 'ARS'): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  }

  /**
   * Obtener estadísticas de reservas del usuario
   */
  async obtenerEstadisticas(): Promise<any> {
    try {
      const response = await axios.get(
        `${API_URL}/reservas/estadisticas`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching reservation statistics:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener estadísticas'
      );
    }
  }

  /**
   * Obtener código QR de una reserva
   */
  async obtenerQRReserva(reservaId: number): Promise<QRData> {
    try {
      console.log('🔲 Fetching QR code for reservation:', reservaId);
      
      const response = await axios.get(
        `${API_URL}/reservas/${reservaId}/qr`,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ QR code fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching QR code:', error);
      throw new Error(
        error.response?.data?.mensaje || 
        error.message || 
        'Error al obtener el código QR'
      );
    }
  }
}

// Export singleton instance
const reservaService = new ReservaService();
export default reservaService;

// Re-export types for convenience
export type { QRData, ReservaDetalleDTO, ReservaRequest, ReservaResponse };