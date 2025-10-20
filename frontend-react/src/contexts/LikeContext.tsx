import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Types
export interface LikeItem {
  id: number;
  titulo: string;
  precio: number;
  imagenUrl?: string;
  categoria?: string;
}

interface LikeContextType {
  items: LikeItem[];
  count: number;
  add: (id: number, item: LikeItem) => void;
  remove: (id: number) => void;
  toggle: (item: LikeItem) => void;
  has: (id: number) => boolean;
  clear: () => void;
}

// Context
const LikeContext = createContext<LikeContextType | undefined>(undefined);

// Local storage key
const STORAGE_KEY = 'tn_likes';

// Provider
export const LikeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<LikeItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedItems = JSON.parse(stored);
        setItems(Array.isArray(parsedItems) ? parsedItems : []);
      }
    } catch (error) {
      console.error('Error loading likes from localStorage:', error);
      setItems([]);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving likes to localStorage:', error);
    }
  }, [items]);

  const add = useCallback((id: number, item: LikeItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === id);
      if (exists) return prev;
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggle = useCallback((item: LikeItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const has = useCallback((id: number) => {
    return items.some(item => item.id === id);
  }, [items]);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const value: LikeContextType = {
    items,
    count: items.length,
    add,
    remove,
    toggle,
    has,
    clear
  };

  return (
    <LikeContext.Provider value={value}>
      {children}
    </LikeContext.Provider>
  );
};

// Hook
export const useLikes = (): LikeContextType => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikeProvider');
  }
  return context;
};