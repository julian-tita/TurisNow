import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

export interface FavoritoDTO {
  id: number;
  experienciaId: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  ciudad: string;
  precioDesde: number;
  moneda: string;
  imagenPrincipal?: string;
  calificacionPromedio?: number;
  fechaAgregado: string;
}

export interface AddFavoritoRequest {
  experienciaId: number;
}

class FavoritosService {
  private getAuthHeaders() {
    const token = localStorage.getItem('turisnow_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Obtener todos los favoritos del usuario autenticado
   */
  async obtenerFavoritos(): Promise<FavoritoDTO[]> {
    try {
      console.log('🔍 Obteniendo favoritos del usuario');
      const response = await axios.get(`${API_URL}/favoritos`, {
        headers: this.getAuthHeaders()
      });
      console.log('✅ Favoritos obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener favoritos:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al obtener favoritos');
    }
  }

  /**
   * Agregar una experiencia a favoritos
   */
  async agregarFavorito(experienciaId: number): Promise<FavoritoDTO> {
    try {
      console.log('➕ Agregando a favoritos:', experienciaId);
      const response = await axios.post(
        `${API_URL}/favoritos`,
        { experienciaId },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Favorito agregado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al agregar favorito:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al agregar a favoritos');
    }
  }

  /**
   * Eliminar una experiencia de favoritos
   */
  async eliminarFavorito(experienciaId: number): Promise<void> {
    try {
      console.log('➖ Eliminando de favoritos:', experienciaId);
      await axios.delete(`${API_URL}/favoritos/${experienciaId}`, {
        headers: this.getAuthHeaders()
      });
      console.log('✅ Favorito eliminado');
    } catch (error: any) {
      console.error('❌ Error al eliminar favorito:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al eliminar de favoritos');
    }
  }

  /**
   * Verificar si una experiencia está en favoritos
   */
  async verificarFavorito(experienciaId: number): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/favoritos/check/${experienciaId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data.esFavorito || false;
    } catch (error: any) {
      console.error('❌ Error al verificar favorito:', error.response?.data);
      return false;
    }
  }

  /**
   * Toggle favorito (agregar si no existe, eliminar si existe)
   */
  async toggleFavorito(experienciaId: number): Promise<boolean> {
    try {
      const esFavorito = await this.verificarFavorito(experienciaId);
      
      if (esFavorito) {
        await this.eliminarFavorito(experienciaId);
        return false;
      } else {
        await this.agregarFavorito(experienciaId);
        return true;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener IDs de experiencias favoritas
   */
  async obtenerIdsFavoritos(): Promise<number[]> {
    try {
      const favoritos = await this.obtenerFavoritos();
      return favoritos.map(f => f.experienciaId);
    } catch (error) {
      return [];
    }
  }
}

export default new FavoritosService();
