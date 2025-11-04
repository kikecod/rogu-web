import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

interface MapViewProps {
  lat: number;
  lng: number;
  title?: string;
  height?: string;
  zoom?: number;
}

const MapView: React.FC<MapViewProps> = ({
  lat,
  lng,
  title = 'Ubicación',
  height = '300px',
  zoom = 15,
}) => {
  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200" style={{ height }}>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={MAPTILER_STYLE_URL}
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-gray-900">{title}</p>
              <p className="text-xs text-gray-600 mt-1">
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs mt-2 inline-block"
              >
                Abrir en Google Maps →
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;
