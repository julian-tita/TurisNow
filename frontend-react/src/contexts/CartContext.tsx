import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Types
export interface CartItem {
  id: number;
  titulo: string;
  precio: number;
  imagenUrl?: string;
  fechaSalida?: string;
  cantidad: number;
}

export interface CartTotals {
  subtotal: number;
  impuestos: number;
  envio: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  totals: CartTotals;
  add: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  remove: (id: number) => void;
  setCantidad: (id: number, cantidad: number) => void;
  setFecha: (id: number, fechaISO: string) => void;
  clear: () => void;
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage key
const STORAGE_KEY = 'tn_cart';

// Constants
const TAX_RATE = 0.21; // 21% impuestos
const SHIPPING_COST = 0; // Envío fijo 0 por ahora

// Provider
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedItems = JSON.parse(stored);
        setItems(Array.isArray(parsedItems) ? parsedItems : []);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setItems([]);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  // Calculate totals
  const totals = useMemo((): CartTotals => {
    const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const impuestos = subtotal * TAX_RATE;
    const envio = SHIPPING_COST;
    const total = subtotal + impuestos + envio;

    return {
      subtotal,
      impuestos,
      envio,
      total
    };
  }, [items]);

  const add = useCallback((item: Omit<CartItem, 'cantidad'>, cantidad: number = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        // Update existing item quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: updated[existingIndex].cantidad + cantidad
        };
        return updated;
      } else {
        // Add new item
        return [...prev, { ...item, cantidad }];
      }
    });
  }, []);

  const remove = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const setCantidad = useCallback((id: number, cantidad: number) => {
    if (cantidad < 1) return;
    
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, cantidad } : item
    ));
  }, []);

  const setFecha = useCallback((id: number, fechaISO: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, fechaSalida: fechaISO } : item
    ));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const value: CartContextType = {
    items,
    totals,
    add,
    remove,
    setCantidad,
    setFecha,
    clear
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};