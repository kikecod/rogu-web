// Utility functions for the ROGU app

// Import real sport field images
import futbolImg from '../assets/futbol.jpg';
import basquetbolImg from '../assets/basquetbol.jpeg';
import tenisImg from '../assets/tenis.jpg';
import voleibolImg from '../assets/voleibol.png';
import padelImg from '../assets/padel.jpeg';
import hockeyImg from '../assets/hockey.webp';

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