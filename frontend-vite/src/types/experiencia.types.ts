// Types based on backend DTOs and Models
export type Moneda = 'ARS' | 'USD';

export const CATEGORIAS = ['PLAYA', 'MONTANA', 'AVENTURA', 'GASTRONOMIA', 'CULTURA'] as const;
export type Categoria = typeof CATEGORIAS[number];

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