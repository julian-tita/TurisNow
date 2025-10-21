import { Experience, Departure } from '../types/experience';

// Función para generar fechas futuras
const generateFutureDates = (count: number = 3): string[] => {
  const dates: string[] = [];
  const now = new Date();
  
  for (let i = 1; i <= count; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + (i * 7)); // Cada semana
    dates.push(date.toISOString());
  }
  
  return dates;
};

// Pools por categoría (lugares, imágenes y tags)
const POOLS = {
  playa: {
    places: [
      { city: 'Mar del Plata', region: 'Buenos Aires', country: 'Argentina' },
      { city: 'Pinamar', region: 'Buenos Aires', country: 'Argentina' },
      { city: 'Puerto Madryn', region: 'Chubut', country: 'Argentina' },
      { city: 'Las Grutas', region: 'Río Negro', country: 'Argentina' },
      { city: 'Monte Hermoso', region: 'Buenos Aires', country: 'Argentina' },
      { city: 'San Bernardo', region: 'Buenos Aires', country: 'Argentina' },
      { city: 'Cariló', region: 'Buenos Aires', country: 'Argentina' },
      { city: 'Necochea', region: 'Buenos Aires', country: 'Argentina' },
      { city: 'Claromecó', region: 'Buenos Aires', country: 'Argentina' },
      { city: 'Villa Gesell', region: 'Buenos Aires', country: 'Argentina' },
      { city: 'Punta del Este', region: 'Maldonado', country: 'Uruguay' },
    ],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['playa', 'mar', 'relax', 'sol', 'arena']
  },
  montaña: {
    places: [
      { city: 'Bariloche', region: 'Río Negro', country: 'Argentina' },
      { city: 'El Chaltén', region: 'Santa Cruz', country: 'Argentina' },
      { city: 'San Martín de los Andes', region: 'Neuquén', country: 'Argentina' },
      { city: 'Mendoza', region: 'Mendoza', country: 'Argentina' },
      { city: 'Uspallata', region: 'Mendoza', country: 'Argentina' },
      { city: 'La Cumbrecita', region: 'Córdoba', country: 'Argentina' },
      { city: 'Merlo', region: 'San Luis', country: 'Argentina' },
      { city: 'Tafí del Valle', region: 'Tucumán', country: 'Argentina' },
      { city: 'Tilcara', region: 'Jujuy', country: 'Argentina' },
      { city: 'Humahuaca', region: 'Jujuy', country: 'Argentina' }
    ],
    images: [
      'https://images.unsplash.com/photo-1464822759844-d150baec0d56?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['montaña', 'trekking', 'senderismo', 'lagos', 'paisaje']
  },
  aventura: {
    places: [
      { city: 'Ushuaia', region: 'Tierra del Fuego', country: 'Argentina' },
      { city: 'El Calafate', region: 'Santa Cruz', country: 'Argentina' },
      { city: 'Puerto Iguazú', region: 'Misiones', country: 'Argentina' },
      { city: 'Mendoza', region: 'Mendoza', country: 'Argentina' },
      { city: 'Bariloche', region: 'Río Negro', country: 'Argentina' },
      { city: 'San Rafael', region: 'Mendoza', country: 'Argentina' },
      { city: 'Villa Pehuenia', region: 'Neuquén', country: 'Argentina' },
      { city: 'Tandil', region: 'Buenos Aires', country: 'Argentina' },
      { city: 'Cafayate', region: 'Salta', country: 'Argentina' },
      { city: 'Gualeguaychú', region: 'Entre Ríos', country: 'Argentina' }
    ],
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['aventura', 'agua', 'rafting', 'escalada', 'adrenalina']
  },
  gastronomía: {
    places: [
      { city: 'Buenos Aires', region: 'CABA', country: 'Argentina' },
      { city: 'Luján de Cuyo', region: 'Mendoza', country: 'Argentina' },
      { city: 'Cafayate', region: 'Salta', country: 'Argentina' },
      { city: 'San Juan', region: 'San Juan', country: 'Argentina' },
      { city: 'Colonia', region: 'Colonia', country: 'Uruguay' },
      { city: 'Rosario', region: 'Santa Fe', country: 'Argentina' },
      { city: 'La Plata', region: 'Buenos Aires', country: 'Argentina' },
      { city: 'San Martín de los Andes', region: 'Neuquén', country: 'Argentina' },
      { city: 'Tilcara', region: 'Jujuy', country: 'Argentina' },
      { city: 'Salta', region: 'Salta', country: 'Argentina' }
    ],
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506377247377-4bc850c93a5c?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['gastronomía', 'vino', 'degustación', 'asado', 'bodega']
  },
  cultura: {
    places: [
      { city: 'Córdoba', region: 'Córdoba', country: 'Argentina' },
      { city: 'Salta', region: 'Salta', country: 'Argentina' },
      { city: 'San Miguel de Tucumán', region: 'Tucumán', country: 'Argentina' },
      { city: 'Santiago del Estero', region: 'Santiago del Estero', country: 'Argentina' },
      { city: 'Corrientes', region: 'Corrientes', country: 'Argentina' },
      { city: 'Resistencia', region: 'Chaco', country: 'Argentina' },
      { city: 'La Rioja', region: 'La Rioja', country: 'Argentina' },
      { city: 'San Salvador de Jujuy', region: 'Jujuy', country: 'Argentina' },
      { city: 'Gualeguaychú', region: 'Entre Ríos', country: 'Argentina' },
      { city: 'Colonia', region: 'Colonia', country: 'Uruguay' }
    ],
    images: [
      'https://images.unsplash.com/photo-1555880307-3c6280cac0a5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['cultura', 'historia', 'museos', 'arquitectura', 'colonial']
  }
} as const;

// Generador de experiencias por categoría
const makeExperiences = (category: keyof typeof POOLS, count = 10): Experience[] => {
  const pool = POOLS[category];
  const out: Experience[] = [];
  for (let i = 0; i < count; i++) {
    const place = pool.places[i % pool.places.length];
    const img = pool.images[i % pool.images.length];
    const dates = generateFutureDates(2 + (i % 2)); // 2 o 3 salidas
    const currency = i % 3 === 0 ? 'USD' : 'ARS';
    const base = category === 'gastronomía' ? 22000 : category === 'playa' ? 12000 : 14000;
    const usdBase = category === 'montaña' || category === 'aventura' ? 140 : 95;

    const price = currency === 'USD'
      ? Math.round(usdBase + (i * 7) % 60)
      : Math.round(base + (i * 1500) % 9000);

    const deps = dates.map((d, idx) => {
      const total = 8 + ((i + idx) % 18);             // 8..25
      const left  = Math.max(0, (total - ((i * 3 + idx * 2) % total))); // variedad
      const dep: Departure = {
        id: `dep-${category}-${i + 1}-${idx + 1}`,
        startAt: d,
        endAt: new Date(new Date(d).getTime() + (6 + (i % 4)) * 3600_000).toISOString(),
        capacityTotal: total,
        capacityLeft: left
      };
      return dep;
    });

    out.push({
      id: `exp-${category}-${String(i + 1).padStart(3, '0')}`,
      title:
        category === 'playa' ? `Día de playa en ${place.city}` :
        category === 'montaña' ? `Senderismo en ${place.city}` :
        category === 'aventura' ? `Aventura en ${place.city}` :
        category === 'gastronomía' ? `Tour gastronómico en ${place.city}` :
        `City tour cultural en ${place.city}`,
      description:
        category === 'playa'
          ? 'Sombrilla, reposeras y actividades acuáticas para un día de relax junto al mar.'
          : category === 'montaña'
          ? 'Caminata guiada con vistas a lagos y bosques andinos. Incluye equipo básico.'
          : category === 'aventura'
          ? 'Actividad outdoor con dosis justa de adrenalina. Guías certificados y seguros incluidos.'
          : category === 'gastronomía'
          ? 'Degustaciones, maridajes y secretos culinarios locales en un recorrido sabroso.'
          : 'Recorrido por hitos históricos, museos y arquitectura destacada.',
      price,
      currency,
      location: place,
      category: category as any,
      mainImageUrl: img,
      tags: pool.tags.slice(0, 3),
      departures: deps
    });
  }
  return out;
};

// 👉 Reemplazo del array completo:
export const mockExperiences: Experience[] = [
  ...makeExperiences('playa', 10),
  ...makeExperiences('montaña', 10),
  ...makeExperiences('aventura', 10),
  ...makeExperiences('gastronomía', 10),
  ...makeExperiences('cultura', 10),
];

// Función helper para obtener experiencias con delay simulado
export const getExperiences = async (delay: number = 400): Promise<Experience[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockExperiences);
    }, delay);
  });
};

// Función para obtener una experiencia por ID
export const getExperienceById = async (id: string, delay: number = 300): Promise<Experience | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const experience = mockExperiences.find(exp => exp.id === id);
      resolve(experience || null);
    }, delay);
  });
};