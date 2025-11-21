// TurisNow: KPI Service - Service for fetching dashboard KPIs
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export type Period = 'day' | 'week' | 'month' | 'year';

// Interfaz para un punto de datos en el gráfico
export interface KpiDataPoint {
  fecha: string;
  valor: number;
}

// Interfaz para una métrica individual
export interface KpiMetrica {
  nombre: string;
  valor: number;
  variacion: number;
  tendencia: 'up' | 'down' | 'stable';
  datos: KpiDataPoint[];
}

// Respuesta del backend
export interface KpiBackendResponse {
  periodo: string;
  metricas: {
    ingresosTotales: KpiMetrica;
    reservasActivas: KpiMetrica;
    nuevosUsuarios: KpiMetrica;
    tasaConversion: KpiMetrica;
  };
}

// DEPRECATED: Interfaces legacy para compatibilidad
export interface SerieIngresos {
  fecha: string;
  valor: number;
}

export interface KpiVariaciones {
  ingresos: number;
  reservas: number;
  ticketPromedio: number;
  conversionCheckout: number;
  experienciasActivas: number;
}

export interface KpiResponse {
  period: Period;
  ingresos: number;
  reservas: number;
  ticketPromedio: number;
  conversionCheckout: number | null;
  experienciasActivas: number;
  variaciones: KpiVariaciones;
  serieIngresos: SerieIngresos[];
}

class KpiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('turisnow_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Mapea el periodo del frontend al formato del backend
   */
  private mapPeriodoFrontendABackend(period: Period): string {
    const mapping: Record<Period, string> = {
      'day': 'dia',
      'week': 'semana',
      'month': 'mes',
      'year': 'año'
    };
    return mapping[period];
  }

  /**
   * Obtener KPIs por período desde el backend
   */
  async fetchKpis(period: Period): Promise<KpiBackendResponse> {
    const periodoBackend = this.mapPeriodoFrontendABackend(period);
    
    try {
      const response = await axios.get<KpiBackendResponse>(
        `${API_URL}/admin/kpis`,
        { 
          params: { periodo: periodoBackend },
          headers: this.getAuthHeaders() 
        }
      );
      
      console.log('✅ KPIs obtenidos desde backend:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.warn('⚠️ Error al obtener KPIs del backend, usando datos simulados:', error.message);
      
      // Fallback a datos simulados solo en desarrollo o si hay error
      return this.getSimulatedKpis(period);
    }
  }

  /**
   * Datos simulados para desarrollo/fallback
   */
  private async getSimulatedKpis(period: Period): Promise<KpiBackendResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const periodoBackend = this.mapPeriodoFrontendABackend(period);
    const now = new Date();
    let datosIngresos: KpiDataPoint[] = [];
    let datosReservas: KpiDataPoint[] = [];
    let datosUsuarios: KpiDataPoint[] = [];
    let datosTasa: KpiDataPoint[] = [];

    switch (period) {
      case 'day':
        // Últimas 24 horas
        for (let i = 23; i >= 0; i--) {
          const hora = new Date(now);
          hora.setHours(now.getHours() - i);
          const horaStr = `${hora.getHours()}:00`;
          datosIngresos.push({ fecha: horaStr, valor: Math.random() * 2000 + 500 });
          datosReservas.push({ fecha: horaStr, valor: Math.floor(Math.random() * 10) });
          datosUsuarios.push({ fecha: horaStr, valor: Math.floor(Math.random() * 5) });
          datosTasa.push({ fecha: horaStr, valor: Math.random() * 40 + 30 });
        }
        break;

      case 'week':
        // Últimos 7 días
        const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        for (let i = 0; i < 7; i++) {
          datosIngresos.push({ fecha: dias[i], valor: Math.random() * 8000 + 2000 });
          datosReservas.push({ fecha: dias[i], valor: Math.floor(Math.random() * 50 + 10) });
          datosUsuarios.push({ fecha: dias[i], valor: Math.floor(Math.random() * 20 + 5) });
          datosTasa.push({ fecha: dias[i], valor: Math.random() * 30 + 40 });
        }
        break;

      case 'month':
        // Últimos 30 días
        for (let i = 29; i >= 0; i--) {
          const dia = new Date(now);
          dia.setDate(now.getDate() - i);
          const diaStr = `${dia.getDate()}/${dia.getMonth() + 1}`;
          datosIngresos.push({ fecha: diaStr, valor: Math.random() * 5000 + 1500 });
          datosReservas.push({ fecha: diaStr, valor: Math.floor(Math.random() * 30 + 5) });
          datosUsuarios.push({ fecha: diaStr, valor: Math.floor(Math.random() * 15 + 2) });
          datosTasa.push({ fecha: diaStr, valor: Math.random() * 35 + 35 });
        }
        break;

      case 'year':
        // 12 meses
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        for (let i = 0; i < 12; i++) {
          datosIngresos.push({ fecha: meses[i], valor: Math.random() * 80000 + 40000 });
          datosReservas.push({ fecha: meses[i], valor: Math.floor(Math.random() * 500 + 200) });
          datosUsuarios.push({ fecha: meses[i], valor: Math.floor(Math.random() * 100 + 50) });
          datosTasa.push({ fecha: meses[i], valor: Math.random() * 20 + 50 });
        }
        break;
    }

    return {
      periodo: periodoBackend,
      metricas: {
        ingresosTotales: {
          nombre: 'Ingresos Totales',
          valor: datosIngresos.reduce((sum, d) => sum + d.valor, 0),
          variacion: 5.1,
          tendencia: 'up',
          datos: datosIngresos
        },
        reservasActivas: {
          nombre: 'Reservas Activas',
          valor: datosReservas.reduce((sum, d) => sum + d.valor, 0),
          variacion: 8.0,
          tendencia: 'up',
          datos: datosReservas
        },
        nuevosUsuarios: {
          nombre: 'Nuevos Usuarios',
          valor: datosUsuarios.reduce((sum, d) => sum + d.valor, 0),
          variacion: -2.0,
          tendencia: 'down',
          datos: datosUsuarios
        },
        tasaConversion: {
          nombre: 'Tasa de Conversión',
          valor: datosTasa.reduce((sum, d) => sum + d.valor, 0) / datosTasa.length,
          variacion: 1.0,
          tendencia: 'stable',
          datos: datosTasa
        }
      }
    };
  }

  /**
   * Formatear precio
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
   * Mapear variación a clase CSS y texto
   */
  mapVariacion(pct: number | null): { className: string; icon: string; text: string } {
    if (pct === null || pct === undefined) {
      return { className: 'neutral', icon: '', text: '' };
    }

    const absValue = Math.abs(pct * 100).toFixed(1);
    
    if (pct > 0) {
      return {
        className: 'positive',
        icon: 'fa-arrow-up',
        text: `${absValue}% vs período anterior`
      };
    } else if (pct < 0) {
      return {
        className: 'negative',
        icon: 'fa-arrow-down',
        text: `${absValue}% vs período anterior`
      };
    } else {
      return {
        className: 'neutral',
        icon: '',
        text: 'Sin cambios'
      };
    }
  }
}

const kpiService = new KpiService();
export default kpiService;
