import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MAPTILER_STYLE_URL } from '../config/map.config';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
  readonly?: boolean;
}

// Componente para manejar clicks en el mapa
function LocationMarker({
  position,
  setPosition,
  readonly
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  readonly: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!readonly) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return position ? <Marker position={position} /> : null;
}

const MapPicker: React.FC<MapPickerProps> = ({
  initialLat = -16.4897, // La Paz, Bolivia por defecto
  initialLng = -68.1193,
  onLocationSelect,
  height = '400px',
  zoom = 13,
  readonly = false,
}) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [centerMap, setCenterMap] = useState<[number, number]>([initialLat, initialLng]);

  // Intentar obtener la ubicación actual del dispositivo
  useEffect(() => {
    // Solo intentar obtener ubicación si no hay una posición inicial específica
    if (!initialLat || (initialLat === -16.4897 && initialLng === -68.1193)) {
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

  useEffect(() => {
    if (position) {
      onLocationSelect(position[0], position[1]);
    }
  }, [position, onLocationSelect]);

  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-gray-300" style={{ height }}>
      <MapContainer
        center={centerMap}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={MAPTILER_STYLE_URL}
        />
        <LocationMarker position={position} setPosition={setPosition} readonly={readonly} />
      </MapContainer>

      {!readonly && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm text-gray-700 font-medium">
            📍 {position ? 'Haz clic para cambiar la ubicación' : 'Haz clic en el mapa para seleccionar ubicación'}
          </p>
          {position && (
            <p className="text-xs text-gray-500 mt-1">
              Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapPicker;
