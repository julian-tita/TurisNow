// Types based on backend DTOs and Models
export type Moneda = 'ARS' | 'USD';

export const CATEGORIAS = ['PLAYA', 'MONTANA', 'AVENTURA', 'GASTRONOMIA', 'CULTURA'] as const;
export type Categoria = typeof CATEGORIAS[number];

// Metadatos de categorías para UI
export const CategoriaMeta: Record<Categoria, { label: string; icon: string; color: string; description: string }> = {
  PLAYA: { 
    label: 'Playa', 
    icon: 'fa-umbrella-beach',
    color: 'bg-info',
    description: 'Relájate en las mejores costas y disfruta del sol'
  },
  MONTANA: { 
    label: 'Montaña', 
    icon: 'fa-mountain',
    color: 'bg-success',
    description: 'Aventuras en las cimas más espectaculares'
  },
  AVENTURA: { 
    label: 'Aventura', 
    icon: 'fa-hiking',
    color: 'bg-danger',
    description: 'Experiencias llenas de adrenalina y emoción'
  },
  GASTRONOMIA: { 
    label: 'Gastronomía', 
    icon: 'fa-utensils',
    color: 'bg-warning',
    description: 'Descubre sabores únicos y tradiciones culinarias'
  },
  CULTURA: { 
    label: 'Cultura', 
    icon: 'fa-landmark',
    color: 'bg-secondary',
    description: 'Sumérgete en la historia y las tradiciones locales'
  },
};

/**
 * Normaliza nombres de categorías desde la base de datos al formato TypeScript
 * BD: 'playa', 'montaña', 'gastronomía' → TS: 'PLAYA', 'MONTANA', 'GASTRONOMIA'
 */
export function normalizeCategoria(categoriaDB: string): Categoria | null {
  const normalized = categoriaDB
    .toUpperCase()
    .normalize('NFD') // Descompone caracteres con tildes
    .replace(/[\u0300-\u036f]/g, ''); // Elimina las tildes
  
  return CATEGORIAS.includes(normalized as Categoria) ? (normalized as Categoria) : null;
}

export interface UbicacionDTO {
  ciudad: string;
  region?: string;
  pais: string;
}

export interface SalidaDTO {
  id: number;
  fechaInicio: string; // ISO date string
  fechaFin?: string;   // ISO date string
  capacidadTotal: number;
  capacidadDisponible: number;
}

export interface ExperienciaListadoDTO {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: Moneda;
  ubicacion: UbicacionDTO;
  categoria: Categoria;
  imagenUrl?: string;
  tags: string[];
  proximasSalidas?: number;
}

export interface ExperienciaDetalleDTO {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: Moneda;
  ubicacion: UbicacionDTO;
  categoria: Categoria;
  imagenUrl?: string;
  tags: string[];
  salidas: SalidaDTO[];
}

// Pagination response from Spring Boot
export interface PageResponse<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  number: number;
  size: number;
  numberOfElements: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

// Request parameters for filtering
export interface ExperienciaFilters {
  categoria?: Categoria;
  ubicacion?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

// Create/Update experiencia (for admin)
export interface ExperienciaRequest {
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: Moneda;
  ubicacion: UbicacionDTO;
  categoria: Categoria;
  imagenUrl?: string;
  tags: string[];
}

// Response types
export type ExperienciasResponse = PageResponse<ExperienciaListadoDTO>;

// Aliases para compatibilidad con código existente
export type Experience = ExperienciaListadoDTO;
export type Departure = SalidaDTO;
export type Category = Categoria;