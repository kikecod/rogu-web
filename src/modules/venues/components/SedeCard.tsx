import React from 'react';
import { MapPin, Star, Building2, CheckCircle } from 'lucide-react';
import { getImageUrl } from '@/core/config/api';
import type { SedeCard as SedeCardType } from '../types/venue-search.types';
import FavoriteButton from '@/favorites/components/FavoriteButton';


interface Props {
  sede: SedeCardType;
  onClick: (sede: SedeCardType) => void;
}

const SedeCard: React.FC<Props> = ({ sede, onClick }) => {
  const {
    nombre,
    city,
    stateProvince,
    fotoPrincipal,
    fotos,
    estadisticas,
    verificada
  } = sede;

  // Usar la foto principal o la primera foto disponible
  // Procesar la URL de la imagen para manejar rutas relativas del backend
  const imagenPath = fotoPrincipal || fotos?.[0]?.urlFoto;
  const imagenPrincipal = imagenPath
    ? (imagenPath.startsWith('http') ? imagenPath : getImageUrl(imagenPath))
    : '/placeholder-venue.jpg';

  return (
    <div
      onClick={() => onClick(sede)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-blue-500"
    >
      {/* Imagen */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={imagenPrincipal}
          alt={nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-venue.jpg';
          }}
        />

        {/* Badge de verificación */}
        {verificada && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <CheckCircle className="h-3 w-3" />
            Verificada
          </div>
        )}

        {/* Botón de favorito */}
        <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton idSede={sede.idSede} size="md" className="bg-white/80 backdrop-blur hover:bg-white shadow-lg" />
        </div>

        {/* Número de canchas */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-900 shadow-md flex items-center gap-1">
          <Building2 className="h-4 w-4 text-blue-600" />
          {estadisticas.totalCanchas} {estadisticas.totalCanchas === 1 ? 'cancha' : 'canchas'}
        </div>

      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Nombre y ubicación */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {nombre}
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{city}, {stateProvince}</span>
          </div>
        </div>

        {/* Deportes disponibles */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {estadisticas.deportesDisponibles.slice(0, 3).map((deporte, index) => (
              <span
                key={index}
                className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium"
              >
                {deporte}
              </span>
            ))}
            {estadisticas.deportesDisponibles.length > 3 && (
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                +{estadisticas.deportesDisponibles.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Rating y precio */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">
              {estadisticas.ratingFinal.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({estadisticas.totalResenasSede + estadisticas.totalResenasCanchas})
            </span>
          </div>

          {/* Precio */}
          <div className="flex items-center gap-1 text-gray-900">
            <span className="text-s text-black-500">Bs</span>
            <span className="text-sm font-medium">
              {estadisticas.precioDesde}
              {estadisticas.precioDesde !== estadisticas.precioHasta &&
                `${estadisticas.precioHasta}`
              }
            </span>
            <span className="text-s text-gray-500">/ hora</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SedeCard;
