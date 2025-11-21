import httpClient from './httpClient';
import { getToken } from '../utils/authStorage';

export interface ItinerarioRequest {
  experienciaId: number;
  fechaInicio?: string;
  fechaFin?: string;
  intereses?: string[];
  presupuesto?: 'bajo' | 'medio' | 'alto';
  nivelActividad?: 'bajo' | 'moderado' | 'alto';
  horaInicio?: string;
  horaFin?: string;
  puntoPartida?: string;
  transporte?: 'a pie' | 'transporte publico' | 'transporte_publico' | 'mixto' | string;
}

export interface ItinerarioResponse {
  destino: string;
  resumen: {
    dias: number;
    perfil: {
      intereses: string[];
      nivel_actividad: string;
      presupuesto: string;
      transporte: string;
    };
    idea_general: string;
    consejos: string[];
  };
  itinerario: Array<{
    dia: number;
    rango_horario: string;
    bloques: Array<{
      inicio: string;
      fin: string;
      titulo: string;
      tipo: string;
      zona: string;
      descripcion_corta: string;
      duracion_min: number | null;
      traslado_prev?: {
        modo?: string;
        distancia_km_aprox?: number | null;
        duracion_min_aprox?: number | null;
        nota?: string | null;
      } | null;
      costo_estimado_ars?: number | null;
      reserva_recomendada?: boolean | null;
      enlaces?: {
        sitio_oficial?: string | null;
        mapa?: string | null;
      } | null;
      notas?: string | null;
    }>;
  }>;
  alternativas: Array<{
    motivo: string;
    sustituto: string;
  }>;
  suposiciones: string[];
  fuenteModelo: string;
}

const BASE_URL = '/api/itinerario';

export const itinerarioService = {
  /** Genera un itinerario personalizado usando IA */
  async generar(request: ItinerarioRequest): Promise<ItinerarioResponse> {
    const token = getToken();
    const response = await httpClient.post<ItinerarioResponse>(
      `${BASE_URL}/generar`,
      request,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        : undefined
    );
    return response.data;
  }
};
