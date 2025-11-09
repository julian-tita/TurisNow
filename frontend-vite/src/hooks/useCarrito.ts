import { useState, useEffect, useCallback } from 'react';
import carritoService from '../services/carritoService';
import type { 
  CarritoDTO, 
  CarritoItemDTO, 
  AddCarritoItemRequest,
  CheckoutResponse 
} from '../services/carritoService';
import toast from 'react-hot-toast';

interface UseCarritoReturn {
  carrito: CarritoDTO | null;
  items: CarritoItemDTO[];
  loading: boolean;
  error: string | null;
  cantidadTotal: number;
  total: number;
  moneda: string;
  agregarItem: (request: AddCarritoItemRequest, tituloExperiencia?: string) => Promise<void>;
  actualizarCantidad: (itemId: number, cantidad: number) => Promise<void>;
  eliminarItem: (itemId: number, tituloExperiencia?: string) => Promise<void>;
  vaciarCarrito: () => Promise<void>;
  procesarCheckout: () => Promise<CheckoutResponse | null>;
  recargarCarrito: () => Promise<void>;
  estaVacio: boolean;
  formatearPrecio: (precio: number) => string;
}

/**
 * Hook personalizado para gestionar el carrito de compras
 * Proporciona estado y operaciones para manejar el carrito del usuario
 */
export const useCarrito = (): UseCarritoReturn => {
  const [carrito, setCarrito] = useState<CarritoDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar carrito del usuario
   */
  const cargarCarrito = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carritoService.obtenerCarrito();
      setCarrito(data);
    } catch (err: any) {
      console.error('Error al cargar carrito:', err);
      setError(err.message || 'Error al cargar carrito');
      setCarrito(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recargar carrito (función pública)
   */
  const recargarCarrito = useCallback(async () => {
    await cargarCarrito();
  }, [cargarCarrito]);

  /**
   * Agregar item al carrito
   */
  const agregarItem = useCallback(async (
    request: AddCarritoItemRequest, 
    tituloExperiencia?: string
  ) => {
    try {
      await carritoService.agregarItem(request);
      toast.success(
        tituloExperiencia 
          ? `${tituloExperiencia} agregado al carrito` 
          : 'Experiencia agregada al carrito',
        { icon: '🛒' }
      );
      
      // Recargar carrito para obtener datos actualizados
      await cargarCarrito();
    } catch (err: any) {
      console.error('Error al agregar item:', err);
      toast.error(err.message || 'Error al agregar al carrito');
    }
  }, [cargarCarrito]);

  /**
   * Actualizar cantidad de un item
   */
  const actualizarCantidad = useCallback(async (itemId: number, cantidad: number) => {
    if (cantidad < 1) {
      toast.error('La cantidad debe ser al menos 1');
      return;
    }

    // Optimistic update
    if (carrito) {
      setCarrito(prev => {
        if (!prev) return prev;
        
        const updatedItems = prev.items.map(item => 
          item.id === itemId 
            ? { ...item, cantidad, subtotal: item.precioUnitario * cantidad }
            : item
        );
        
        const nuevoTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const nuevaCantidadTotal = updatedItems.reduce((sum, item) => sum + item.cantidad, 0);
        
        return {
          ...prev,
          items: updatedItems,
          total: nuevoTotal,
          cantidadTotal: nuevaCantidadTotal
        };
      });
    }

    try {
      await carritoService.actualizarCantidad(itemId, cantidad);
      toast.success('Cantidad actualizada', { icon: '✅' });
      
      // Recargar para sincronizar con el servidor
      await cargarCarrito();
    } catch (err: any) {
      console.error('Error al actualizar cantidad:', err);
      toast.error(err.message || 'Error al actualizar cantidad');
      
      // Revertir optimistic update
      await cargarCarrito();
    }
  }, [carrito, cargarCarrito]);

  /**
   * Eliminar item del carrito
   */
  const eliminarItem = useCallback(async (itemId: number, tituloExperiencia?: string) => {
    // Optimistic update
    if (carrito) {
      setCarrito(prev => {
        if (!prev) return prev;
        
        const updatedItems = prev.items.filter(item => item.id !== itemId);
        const nuevoTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const nuevaCantidadTotal = updatedItems.reduce((sum, item) => sum + item.cantidad, 0);
        
        return {
          ...prev,
          items: updatedItems,
          total: nuevoTotal,
          cantidadTotal: nuevaCantidadTotal
        };
      });
    }

    try {
      await carritoService.eliminarItem(itemId);
      toast.success(
        tituloExperiencia 
          ? `${tituloExperiencia} eliminado del carrito` 
          : 'Eliminado del carrito',
        { icon: '🗑️' }
      );
      
      // Recargar para sincronizar
      await cargarCarrito();
    } catch (err: any) {
      console.error('Error al eliminar item:', err);
      toast.error(err.message || 'Error al eliminar del carrito');
      
      // Revertir optimistic update
      await cargarCarrito();
    }
  }, [carrito, cargarCarrito]);

  /**
   * Vaciar carrito completamente
   */
  const vaciarCarrito = useCallback(async () => {
    if (!carrito || carrito.items.length === 0) {
      toast.error('El carrito ya está vacío');
      return;
    }

    // Optimistic update
    setCarrito(prev => prev ? { ...prev, items: [], total: 0, cantidadTotal: 0 } : prev);

    try {
      await carritoService.vaciarCarrito();
      toast.success('Carrito vaciado', { icon: '🗑️' });
      
      await cargarCarrito();
    } catch (err: any) {
      console.error('Error al vaciar carrito:', err);
      toast.error(err.message || 'Error al vaciar el carrito');
      
      // Revertir optimistic update
      await cargarCarrito();
    }
  }, [carrito, cargarCarrito]);

  /**
   * Procesar checkout
   */
  const procesarCheckout = useCallback(async (): Promise<CheckoutResponse | null> => {
    if (!carrito || carrito.items.length === 0) {
      toast.error('El carrito está vacío');
      return null;
    }

    try {
      const loadingToast = toast.loading('Procesando checkout...');
      
      const response = await carritoService.procesarCheckout();
      
      toast.dismiss(loadingToast);
      
      if (response.success) {
        toast.success(response.message || 'Checkout completado exitosamente', {
          icon: '🎉',
          duration: 5000
        });
        
        // Recargar carrito (debería estar vacío)
        await cargarCarrito();
        
        return response;
      } else {
        // Mostrar errores si los hay
        if (response.errores && response.errores.length > 0) {
          response.errores.forEach(error => {
            toast.error(error, { duration: 6000 });
          });
        } else {
          toast.error(response.message || 'Error al procesar checkout');
        }
        
        return response;
      }
    } catch (err: any) {
      console.error('Error al procesar checkout:', err);
      toast.error(err.message || 'Error al procesar el checkout');
      return null;
    }
  }, [carrito, cargarCarrito]);

  /**
   * Formatear precio
   */
  const formatearPrecio = useCallback((precio: number): string => {
    const monedaActual = carrito?.moneda || 'ARS';
    return carritoService.formatearPrecio(precio, monedaActual);
  }, [carrito?.moneda]);

  /**
   * Cargar carrito al montar el componente
   */
  useEffect(() => {
    cargarCarrito();
  }, [cargarCarrito]);

  return {
    carrito,
    items: carrito?.items || [],
    loading,
    error,
    cantidadTotal: carrito?.cantidadTotal || 0,
    total: carrito?.total || 0,
    moneda: carrito?.moneda || 'ARS',
    agregarItem,
    actualizarCantidad,
    eliminarItem,
    vaciarCarrito,
    procesarCheckout,
    recargarCarrito,
    estaVacio: !carrito || carrito.items.length === 0,
    formatearPrecio,
  };
};
