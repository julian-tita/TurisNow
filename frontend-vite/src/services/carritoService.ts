import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

export interface CarritoItemDTO {
  id: number;
  experienciaId: number;
  salidaId: number;
  tituloExperiencia: string;
  fechaSalida: string;
  cantidad: number;
  precioUnitario: number;
  moneda: string;
  subtotal: number;
  imagenUrl?: string;
  ciudadExperiencia?: string;
  duracionDias?: number;
}

export interface CarritoDTO {
  id: number;
  items: CarritoItemDTO[];
  cantidadTotal: number;
  total: number;
  moneda: string;
}

export interface AddCarritoItemRequest {
  experienciaId: number;
  salidaId: number;
  cantidad: number;
}

export interface UpdateCarritoItemRequest {
  cantidad: number;
}

export interface CheckoutResponse {
  success: boolean;
  reservas: Array<{
    id: number;
    experienciaId: number;
    salidaId: number;
    cantidadPersonas: number;
    precioTotal: number;
    estado: string;
  }>;
  errores: string[];
  message: string;
}

class CarritoService {
  private getAuthHeaders() {
    const token = localStorage.getItem('turisnow_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Obtener el carrito actual del usuario
   */
  async obtenerCarrito(): Promise<CarritoDTO> {
    try {
      console.log('🛒 Obteniendo carrito del usuario');
      const response = await axios.get(`${API_URL}/cart`, {
        headers: this.getAuthHeaders()
      });
      console.log('✅ Carrito obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener carrito:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al obtener el carrito');
    }
  }

  /**
   * Agregar un item al carrito
   */
  async agregarItem(request: AddCarritoItemRequest): Promise<CarritoItemDTO> {
    try {
      console.log('➕ Agregando item al carrito:', request);
      const response = await axios.post(
        `${API_URL}/cart/items`,
        request,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Item agregado al carrito:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al agregar item:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al agregar al carrito');
    }
  }

  /**
   * Actualizar la cantidad de un item
   */
  async actualizarCantidad(itemId: number, cantidad: number): Promise<CarritoItemDTO> {
    try {
      console.log('🔄 Actualizando cantidad del item:', itemId, 'a', cantidad);
      const response = await axios.put(
        `${API_URL}/cart/items/${itemId}`,
        { cantidad },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Cantidad actualizada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al actualizar cantidad:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al actualizar cantidad');
    }
  }

  /**
   * Eliminar un item del carrito
   */
  async eliminarItem(itemId: number): Promise<void> {
    try {
      console.log('🗑️ Eliminando item del carrito:', itemId);
      await axios.delete(`${API_URL}/cart/items/${itemId}`, {
        headers: this.getAuthHeaders()
      });
      console.log('✅ Item eliminado del carrito');
    } catch (error: any) {
      console.error('❌ Error al eliminar item:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al eliminar del carrito');
    }
  }

  /**
   * Vaciar el carrito completamente
   */
  async vaciarCarrito(): Promise<void> {
    try {
      console.log('🗑️ Vaciando carrito completo');
      await axios.delete(`${API_URL}/cart/clear`, {
        headers: this.getAuthHeaders()
      });
      console.log('✅ Carrito vaciado');
    } catch (error: any) {
      console.error('❌ Error al vaciar carrito:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al vaciar el carrito');
    }
  }

  /**
   * Procesar checkout (crear reservas desde el carrito)
   */
  async procesarCheckout(): Promise<CheckoutResponse> {
    try {
      console.log('💳 Procesando checkout del carrito');
      const response = await axios.post(
        `${API_URL}/cart/checkout`,
        {},
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Checkout procesado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al procesar checkout:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al procesar el checkout');
    }
  }

  /**
   * Contar items en el carrito
   */
  async contarItems(): Promise<number> {
    try {
      const carrito = await this.obtenerCarrito();
      return carrito.cantidadTotal || carrito.items.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Verificar si el carrito está vacío
   */
  async estaVacio(): Promise<boolean> {
    try {
      const carrito = await this.obtenerCarrito();
      return carrito.items.length === 0;
    } catch (error) {
      return true;
    }
  }

  /**
   * Formatear precio
   */
  formatearPrecio(precio: number, moneda: string = 'ARS'): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  }
}

export default new CarritoService();
