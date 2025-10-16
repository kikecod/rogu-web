// Utility functions for the ROGU app

// Import real sport field images
import futbolImg from '../assets/futbol.jpg';
import basquetbolImg from '../assets/basquetbol.jpeg';
import tenisImg from '../assets/tenis.jpg';
import voleibolImg from '../assets/voleibol.png';
import padelImg from '../assets/padel.jpeg';
import hockeyImg from '../assets/hockey.webp';
import type { ApiCancha, SportField, SportType } from '../types';
import { getApiUrl, getImageUrl } from '../config/api';

export const generatePlaceholderImage = (width: number, height: number, text?: string) => {
  const baseUrl = 'https://via.placeholder.com';
  const textParam = text ? `?text=${encodeURIComponent(text)}` : '';
  return `${baseUrl}/${width}x${height}/22c55e/ffffff${textParam}`;
};

export const getSportFieldImages = (sport: string): string[] => {
  const sportImages: { [key: string]: string[] } = {
    football: [
      futbolImg,
      futbolImg, // Using same image twice for now, you can add more variants later
    ],
    basketball: [
      basquetbolImg,
      basquetbolImg,
    ],
    tennis: [
      tenisImg,
      tenisImg,
    ],
    volleyball: [
      voleibolImg,
      voleibolImg,
    ],
    paddle: [
      padelImg,
      padelImg,
    ],
    hockey: [
      hockeyImg,
      hockeyImg,
    ],
  };

  return sportImages[sport] || [generatePlaceholderImage(600, 400, 'Espacio Deportivo')];
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const generateAvatarUrl = (name: string): string => {
  return generatePlaceholderImage(100, 100, name.charAt(0).toUpperCase());
};

// Mapear superficie a tipo de deporte
const mapSuperficieToSport = (superficie: string): SportType => {
  const superficieMap: { [key: string]: SportType } = {
    'parquet': 'basketball',
    'césped': 'football',
    'césped sintético': 'football',
    'tierra batida': 'tennis',
    'polvo de ladrillo': 'tennis',
    'arena': 'volleyball',
    'paddle': 'paddle',
    'hielo': 'hockey',
  };

  const superficieLower = superficie.toLowerCase();
  for (const [key, value] of Object.entries(superficieMap)) {
    if (superficieLower.includes(key)) {
      return value;
    }
  }
  return 'football'; // default
};

// Mapear superficie a amenidades
const mapSuperficieToAmenities = (cancha: ApiCancha): string[] => {
  const amenities: string[] = [];
  
  if (cancha.cubierta) {
    amenities.push('Techado');
  }
  
  if (cancha.iluminacion && cancha.iluminacion !== 'No disponible') {
    amenities.push('Iluminación');
  }
  
  // Agregar amenidades basadas en la superficie
  amenities.push(`Superficie: ${cancha.superficie}`);
  
  // Agregar capacidad
  if (cancha.aforoMax > 0) {
    amenities.push(`Capacidad: ${cancha.aforoMax}`);
  }
  
  return amenities;
};

// Convertir ApiCancha a SportField
export const convertApiCanchaToSportField = (apiCancha: ApiCancha): SportField => {
  // Obtener URLs de las fotos o usar imágenes por defecto
  const images = apiCancha.fotos && apiCancha.fotos.length > 0
    ? apiCancha.fotos.map(foto => {
        const imageUrl = getImageUrl(foto.urlFoto);
        console.log('🖼️ Foto URL:', foto.urlFoto, '→', imageUrl);
        return imageUrl;
      })
    : getSportFieldImages(mapSuperficieToSport(apiCancha.superficie));

  // Determinar el tipo de deporte basado en la superficie
  const sport = mapSuperficieToSport(apiCancha.superficie);

  // Convertir precio de string a número
  const price = parseFloat(apiCancha.precio) || 0;

  return {
    id: apiCancha.idCancha.toString(),
    sedeId: apiCancha.id_Sede.toString(),
    name: apiCancha.nombre,
    description: apiCancha.reglasUso || 'Cancha deportiva disponible para reservas',
    images,
    price,
    sport,
    amenities: mapSuperficieToAmenities(apiCancha),
    availability: [],
    rating: 4.5, // Por defecto, ya que la API no devuelve rating
    reviews: 0, // Por defecto, ya que la API no devuelve reviews
    location: {
      address: apiCancha.dimensiones || '',
      city: 'Sede ' + apiCancha.id_Sede,
      coordinates: { lat: 0, lng: 0 }
    },
    owner: {
      id: apiCancha.id_Sede.toString(),
      name: 'Sede ' + apiCancha.id_Sede,
      avatar: generateAvatarUrl('Sede ' + apiCancha.id_Sede)
    }
  };
};

// Obtener todas las canchas desde la API
export const fetchCanchas = async (): Promise<SportField[]> => {
  try {
    const response = await fetch(getApiUrl('/cancha'));
    
    if (!response.ok) {
      throw new Error(`Error al obtener canchas: ${response.statusText}`);
    }
    
    const data: ApiCancha[] = await response.json();
    
    // Filtrar solo canchas disponibles
    const canchasDisponibles = data.filter(cancha => 
      cancha.estado.toLowerCase() === 'disponible' && !cancha.eliminadoEn
    );
    
    return canchasDisponibles.map(convertApiCanchaToSportField);
  } catch (error) {
    console.error('Error fetching canchas:', error);
    return [];
  }
};