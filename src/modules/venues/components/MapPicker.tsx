import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
  readOnly?: boolean; // Nueva prop para modo solo lectura
  className?: string; // Nueva prop para clases CSS personalizadas
}

// Componente interno para manejar clicks en el mapa
function LocationMarker({
  position,
  onLocationSelect,
  readOnly = false
}: {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) {
  if (!readOnly) {
    useMapEvents({
      click(e) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
  }

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({
  latitude,
  longitude,
  onLocationSelect,
  height = '400px',
  readOnly = false,
  className = ''
}: MapPickerProps) {
  // Centro por defecto: La Paz, Bolivia
  const defaultCenter: [number, number] = [-16.4897, -68.1193];

  // Validar y convertir coordenadas a números
  const getValidPosition = (lat: number | null, lng: number | null): [number, number] | null => {
    if (lat === null || lng === null) return null;
    const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    const numLng = typeof lng === 'string' ? parseFloat(lng) : lng;
    if (isNaN(numLat) || isNaN(numLng)) return null;
    return [numLat, numLng];
  };

  const [position, setPosition] = useState<[number, number] | null>(
    getValidPosition(latitude, longitude)
  );
  const [centerMap, setCenterMap] = useState<[number, number]>(defaultCenter);

  // Intentar obtener la ubicación actual del dispositivo
  useEffect(() => {
    // Solo intentar obtener ubicación si no hay una posición inicial específica
    if (!latitude && !longitude) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLocation: [number, number] = [
              pos.coords.latitude,
              pos.coords.longitude
            ];
            setCenterMap(userLocation);
            // Si no hay posición seleccionada, usar la ubicación del usuario
            if (!position) {
              setPosition(userLocation);
              onLocationSelect(userLocation[0], userLocation[1]);
            }
          },
          (error) => {
            console.log('No se pudo obtener la ubicación:', error.message);
            // Mantener La Paz, Bolivia como predeterminado
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
          }
        );
      }
    }
  }, []);

  const [position, setPosition] = useState<[number, number] | null>(getValidPosition(latitude, longitude));

  useEffect(() => {
    const validPos = getValidPosition(latitude, longitude);
    if (validPos) {
      setPosition(validPos);
      setCenterMap(validPos);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (readOnly || position || hasRequestedLocation.current) return;
    if (!navigator?.geolocation) return;

    hasRequestedLocation.current = true;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const userCoords: [number, number] = [coords.latitude, coords.longitude];
        setPosition(userCoords);
        onLocationSelect(userCoords[0], userCoords[1]);
      },
      (error) => {
        console.warn('No se pudo obtener la ubicacion del usuario', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationSelect, position, readOnly]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  // Centro del mapa: usar centerMap que puede ser la ubicación del usuario o La Paz
  const mapCenter = centerMap;

  // Clave única para forzar re-render cuando cambia la posición inicial
  const mapKey = position ? `${position[0]}-${position[1]}` : 'default';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Ubicación de la sede</label>
        {position && (
          <span className="text-xs text-gray-500">
            Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
          </span>
        )}
      </div>

      <div
        className={`rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm ${className}`}
        style={{ height: className ? undefined : height }}
      >
        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={position ? 15 : 12}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            onLocationSelect={handleLocationSelect}
            readOnly={readOnly}
          />
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500 italic">
        {readOnly
          ? '📍 Ubicación de la sede'
          : '💡 Haz clic en el mapa para seleccionar la ubicación exacta de la sede'
        }
      </p>
    </div>
  );
}
