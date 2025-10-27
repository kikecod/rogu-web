import futbolImg from '../../assets/img/futbol.jpg';
import basquetbolImg from '../../assets/img/basquetbol.jpeg';
import tenisImg from '../../assets/img/tenis.jpg';
import voleibolImg from '../../assets/img/voleibol.png';
import padelImg from '../../assets/img/padel.jpeg';
import hockeyImg from '../../assets/img/hockey.webp';
import type { SportType } from '../../domain';

export const generatePlaceholderImage = (
  width: number,
  height: number,
  rawText?: string,
): string => {
  const clampedWidth = Number.isFinite(width) && width > 0 ? Math.floor(width) : 400;
  const clampedHeight = Number.isFinite(height) && height > 0 ? Math.floor(height) : 300;
  const text = (rawText ?? 'Espacio Deportivo').trim() || 'Espacio Deportivo';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${clampedWidth}" height="${clampedHeight}" viewBox="0 0 ${clampedWidth} ${clampedHeight}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="100%" stop-color="#16a34a"/>
        </linearGradient>
      </defs>
      <rect width="${clampedWidth}" height="${clampedHeight}" fill="url(#grad)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="${Math.max(
        14,
        Math.min(clampedWidth, clampedHeight) * 0.12,
      )}" fill="#ffffff" opacity="0.9">
        ${text.replace(/&/g, '&amp;')}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const SPORT_IMAGES: Record<string, string[]> = {
  football: [futbolImg, futbolImg],
  basketball: [basquetbolImg, basquetbolImg],
  tennis: [tenisImg, tenisImg],
  volleyball: [voleibolImg, voleibolImg],
  paddle: [padelImg, padelImg],
  hockey: [hockeyImg, hockeyImg],
};

export const getSportFieldImages = (sport: string): string[] => {
  return SPORT_IMAGES[sport] ?? [generatePlaceholderImage(600, 400, 'Espacio Deportivo')];
};

export const generateAvatarUrl = (name: string): string => {
  return generatePlaceholderImage(100, 100, name.charAt(0).toUpperCase());
};

export const mapSportToCoverImage = (sport: SportType): string => {
  const images = getSportFieldImages(sport);
  return images[0];
};
