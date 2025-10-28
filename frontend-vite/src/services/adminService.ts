// TurisNow: Admin Service - Frontend API client for admin operations
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// Interfaces para estadísticas de admin
export interface AdminEstadisticas {
  totalUsuarios: number;
  totalExperiencias: number;
  totalReservas: number;
  reservasPendientes: number;
  reservasConfirmadas: number;
  reservasCanceladas: number;
  reservasCompletadas: number;
  ingresosTotales: number;
  ingresosHoy: number;
  ingresosMesActual: number;
  reservasHoy: number;
  reservasMesActual: number;
  experienciasActivas: number;
  usuariosActivos: number;
}

export interface ReservaEstadistica {
  mes: string;
  cantidad: number;
  ingresos: number;
}

export interface ExperienciaPopular {
  id: number;
  titulo: string;
  categoria: string;
  totalReservas: number;
  ingresosTotales: number;
}

class AdminService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Obtener headers de autorización
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Obtener estadísticas generales del sistema
   */
  async obtenerEstadisticas(): Promise<AdminEstadisticas> {
    try {
      const response = await axios.get<AdminEstadisticas>(
        `${this.baseURL}/admin/estadisticas`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      // Si el endpoint no existe, devolver datos simulados
      console.warn('Endpoint de estadísticas de admin no disponible, usando datos simulados');
      return this.obtenerEstadisticasSimuladas();
    }
  }

  /**
   * Obtener estadísticas simuladas (mientras no esté el endpoint)
   */
  private async obtenerEstadisticasSimuladas(): Promise<AdminEstadisticas> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      totalUsuarios: 1247,
      totalExperiencias: 85,
      totalReservas: 3421,
      reservasPendientes: 12,
      reservasConfirmadas: 45,
      reservasCanceladas: 8,
      reservasCompletadas: 156,
      ingresosTotales: 2450000,
      ingresosHoy: 45000,
      ingresosMesActual: 890000,
      reservasHoy: 8,
      reservasMesActual: 234,
      experienciasActivas: 78,
      usuariosActivos: 1089
    };
  }

  /**
   * Obtener reservas por mes (últimos 6 meses)
   */
  async obtenerReservasPorMes(): Promise<ReservaEstadistica[]> {
    try {
      const response = await axios.get<ReservaEstadistica[]>(
        `${this.baseURL}/admin/estadisticas/reservas-por-mes`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      // Datos simulados
      return [
        { mes: 'Enero', cantidad: 280, ingresos: 420000 },
        { mes: 'Febrero', cantidad: 310, ingresos: 465000 },
        { mes: 'Marzo', cantidad: 340, ingresos: 510000 },
        { mes: 'Abril', cantidad: 390, ingresos: 585000 },
        { mes: 'Mayo', cantidad: 420, ingresos: 630000 },
        { mes: 'Junio', cantidad: 380, ingresos: 570000 },
      ];
    }
  }

  /**
   * Obtener experiencias más populares
   */
  async obtenerExperienciasPopulares(limit = 5): Promise<ExperienciaPopular[]> {
    try {
      const response = await axios.get<ExperienciaPopular[]>(
        `${this.baseURL}/admin/estadisticas/experiencias-populares?limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      // Datos simulados
      return [
        { id: 1, titulo: 'Tour por Cataratas del Iguazú', categoria: 'AVENTURA', totalReservas: 156, ingresosTotales: 468000 },
        { id: 2, titulo: 'Trekking en Bariloche', categoria: 'MONTANA', totalReservas: 134, ingresosTotales: 402000 },
        { id: 3, titulo: 'Buceo en Mar del Plata', categoria: 'PLAYA', totalReservas: 98, ingresosTotales: 294000 },
        { id: 4, titulo: 'City Tour Buenos Aires', categoria: 'CULTURA', totalReservas: 87, ingresosTotales: 174000 },
        { id: 5, titulo: 'Degustación de Vinos Mendoza', categoria: 'GASTRONOMIA', totalReservas: 76, ingresosTotales: 228000 },
      ];
    }
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
}

// Instancia singleton del servicio
const adminService = new AdminService();
export default adminService;
