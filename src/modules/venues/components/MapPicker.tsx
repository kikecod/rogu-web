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
  readOnly?: boolean;
}

function LocationMarker({
  position,
  onLocationSelect,
  readOnly = false,
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
}: MapPickerProps) {
  const defaultCenter: [number, number] = [-16.290154, -63.588653];
  const hasRequestedLocation = useRef(false);

  const getValidPosition = (lat: number | null, lng: number | null): [number, number] | null => {
    if (lat === null || lng === null) return null;
    const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    const numLng = typeof lng === 'string' ? parseFloat(lng) : lng;
    if (isNaN(numLat) || isNaN(numLng)) return null;
    return [numLat, numLng];
  };

  const [position, setPosition] = useState<[number, number] | null>(getValidPosition(latitude, longitude));

  useEffect(() => {
    const validPos = getValidPosition(latitude, longitude);
    if (validPos) {
      setPosition(validPos);
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

  const mapCenter = position || defaultCenter;
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
        className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        style={{ height, minHeight: height }}
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
          <LocationMarker position={position} onLocationSelect={handleLocationSelect} readOnly={readOnly} />
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500 italic">
        {readOnly
          ? 'Vista solo lectura de la ubicación de la sede'
          : 'Haz clic en el mapa para seleccionar la ubicación exacta de la sede'}
      </p>
    </div>
  );
}
