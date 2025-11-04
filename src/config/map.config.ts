/**
 * Configuración de MapTiler
 * 
 * Para obtener tu API key:
 * 1. Ve a https://www.maptiler.com/
 * 2. Crea una cuenta gratuita
 * 3. Ve a "Account" → "Keys"
 * 4. Copia tu API key
 * 5. Pégala aquí abajo
 */

export const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_KEY || 'YOUR_MAPTILER_KEY_HERE';

export const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`;

// Coordenadas por defecto (Bolivia)
export const DEFAULT_COORDINATES = {
  LA_PAZ: { lat: -16.5000, lng: -68.1500 },
  SANTA_CRUZ: { lat: -17.7833, lng: -63.1821 },
  COCHABAMBA: { lat: -17.3935, lng: -66.1570 },
};
