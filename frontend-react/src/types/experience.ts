export type Category = 'playa' | 'montaña' | 'aventura' | 'gastronomía' | 'cultura';

export interface Departure {
  id: string;
  startAt: string;    // ISO
  endAt?: string;     // ISO
  capacityTotal: number;
  capacityLeft: number;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'ARS' | 'USD';
  location: { city: string; region?: string; country: string };
  category: Category;
  mainImageUrl: string;
  tags: string[];
  departures: Departure[];
}