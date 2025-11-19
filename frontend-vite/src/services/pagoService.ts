import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090';

interface CheckoutResponse {
  success: boolean;
  message: string;
  pagoId?: number;
  preferenceId?: string;
  initPoint?: string;
  montoTotal?: number;
}

interface CheckoutDirectoRequest {
  salidaId: number;
  cantidad: number;
  observaciones?: string;
}

class PagoService {
  private getAuthHeaders() {
    const token = localStorage.getItem('turisnow_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Procesar checkout desde el carrito
   */
  async procesarCheckoutCarrito(): Promise<CheckoutResponse> {
    try {
      console.log('🛒 Procesando checkout desde carrito...');
      
      const response = await axios.post(
        `${API_URL}/api/pagos/checkout`,
        {},
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Checkout response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en checkout:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al procesar el pago'
      );
    }
  }

  /**
   * Procesar checkout directo (sin carrito)
   */
  async procesarCheckoutDirecto(data: CheckoutDirectoRequest): Promise<CheckoutResponse> {
    try {
      console.log('💳 Procesando checkout directo:', data);
      
      const response = await axios.post(
        `${API_URL}/api/pagos/checkout-directo`,
        data,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Checkout directo response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en checkout directo:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al procesar el pago'
      );
    }
  }

  /**
   * Obtener estado de un pago
   */
  async obtenerEstadoPago(pagoId: number) {
    try {
      const response = await axios.get(
        `${API_URL}/api/pagos/${pagoId}/status`,
        { headers: this.getAuthHeaders() }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo estado del pago:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener el estado del pago'
      );
    }
  }
}

export default new PagoService();



