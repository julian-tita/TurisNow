import { useState, useEffect, useCallback } from 'react';
import favoritosService from '../services/favoritosService';
import type { FavoritoDTO } from '../services/favoritosService';
import toast from 'react-hot-toast';

interface UseFavoritosReturn {
  favoritos: FavoritoDTO[];
  loading: boolean;
  error: string | null;
  isFavorito: (experienciaId: number) => boolean;
  toggleFavorito: (experienciaId: number, titulo?: string) => Promise<void>;
  eliminarFavorito: (experienciaId: number, titulo?: string) => Promise<void>;
  recargarFavoritos: () => Promise<void>;
  cantidadFavoritos: number;
}

/**
 * Hook personalizado para gestionar favoritos
 * Proporciona estado y operaciones para manejar las experiencias favoritas del usuario
 */
export const useFavoritos = (): UseFavoritosReturn => {
  const [favoritos, setFavoritos] = useState<FavoritoDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar favoritos del usuario
   */
  const cargarFavoritos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoritosService.obtenerFavoritos();
      setFavoritos(data);
    } catch (err: any) {
      console.error('Error al cargar favoritos:', err);
      setError(err.message || 'Error al cargar favoritos');
      setFavoritos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recargar favoritos (función pública)
   */
  const recargarFavoritos = useCallback(async () => {
    await cargarFavoritos();
  }, [cargarFavoritos]);

  /**
   * Verificar si una experiencia es favorita
   */
  const isFavorito = useCallback((experienciaId: number): boolean => {
    return favoritos.some(fav => fav.experienciaId === experienciaId);
  }, [favoritos]);

  /**
   * Toggle favorito (agregar o eliminar)
   */
  const toggleFavorito = useCallback(async (experienciaId: number, titulo?: string) => {
    const esFavorito = isFavorito(experienciaId);
    
    // Optimistic update
    if (esFavorito) {
      setFavoritos(prev => prev.filter(fav => fav.experienciaId !== experienciaId));
    }

    try {
      await favoritosService.toggleFavorito(experienciaId);
      
      if (esFavorito) {
        toast.success(
          titulo 
            ? `${titulo} eliminado de favoritos` 
            : 'Eliminado de favoritos',
          { icon: '💔' }
        );
      } else {
        toast.success(
          titulo 
            ? `${titulo} agregado a favoritos` 
            : 'Agregado a favoritos',
          { icon: '❤️' }
        );
      }
      
      // Recargar para obtener datos actualizados del servidor
      await cargarFavoritos();
    } catch (err: any) {
      console.error('Error al toggle favorito:', err);
      toast.error(err.message || 'Error al actualizar favoritos');
      
      // Revertir optimistic update en caso de error
      await cargarFavoritos();
    }
  }, [isFavorito, cargarFavoritos]);

  /**
   * Eliminar favorito específicamente
   */
  const eliminarFavorito = useCallback(async (experienciaId: number, titulo?: string) => {
    if (!isFavorito(experienciaId)) {
      return; // No es favorito, no hacer nada
    }

    // Optimistic update
    setFavoritos(prev => prev.filter(fav => fav.experienciaId !== experienciaId));

    try {
      await favoritosService.eliminarFavorito(experienciaId);
      toast.success(
        titulo 
          ? `${titulo} eliminado de favoritos` 
          : 'Eliminado de favoritos',
        { icon: '🗑️' }
      );
    } catch (err: any) {
      console.error('Error al eliminar favorito:', err);
      toast.error(err.message || 'Error al eliminar favorito');
      
      // Revertir optimistic update
      await cargarFavoritos();
    }
  }, [isFavorito, cargarFavoritos]);

  /**
   * Cargar favoritos al montar el componente
   */
  useEffect(() => {
    cargarFavoritos();
  }, [cargarFavoritos]);

  return {
    favoritos,
    loading,
    error,
    isFavorito,
    toggleFavorito,
    eliminarFavorito,
    recargarFavoritos,
    cantidadFavoritos: favoritos.length,
  };
};
