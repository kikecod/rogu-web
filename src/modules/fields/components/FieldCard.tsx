import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import type { SportField } from '../types/field.types';

interface SportFieldCardProps {
  field: SportField;
  onClick: (field: SportField) => void;
}

const SportFieldCard: React.FC<SportFieldCardProps> = ({ field, onClick }) => {
  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      football: '⚽',
      basketball: '🏀',
      tennis: '🎾',
      volleyball: '🏐',
      paddle: '🏓',
      hockey: '🏒',
    };
    return icons[sport] || '⚽';
  };

  const getSportLabel = (sport: string) => {
    const labels: { [key: string]: string } = {
      football: 'Fútbol',
      basketball: 'Básquetbol',
      tennis: 'Tenis',
      volleyball: 'Voleibol',
      paddle: 'Paddle',
      hockey: 'Hockey',
    };
    return labels[sport] || sport.charAt(0).toUpperCase() + sport.slice(1);
  };

  return (
    <div
      className="bg-white rounded-xl border border-neutral-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group w-full h-full"
      onClick={() => onClick(field)}
    >
      {/* Image carousel */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={field.images[0] || '/api/placeholder/400/300'}
          alt={field.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Si la imagen falla al cargar, usar un placeholder
            console.error('❌ Error al cargar imagen:', field.images[0]);
            e.currentTarget.src = 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Cancha';
          }}
        />
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs sm:text-sm font-medium shadow-sm">
          <span className="mr-1">{getSportIcon(field.sport)}</span>
          <span className="hidden xs:inline">{getSportLabel(field.sport)}</span>
        </div>
        {field.images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-neutral-900/70 text-white text-xs px-2 py-1 rounded-full">
            1/{field.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Location */}
        <div className="flex items-center text-neutral-600 text-xs sm:text-sm mb-2">
          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{field.location?.city || 'Ubicación no especificada'}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base sm:text-lg text-neutral-900 mb-1 line-clamp-1">
          {field.name}
        </h3>

        {/* Rating and availability */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center min-w-0 flex-1">
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 fill-current flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium ml-1 text-neutral-900">{field.rating}</span>
            {field.reviews > 0 && (
              <span className="text-neutral-500 text-xs sm:text-sm ml-1 truncate">({field.reviews})</span>
            )}
          </div>
          <div className="flex items-center text-blue-600 text-xs sm:text-sm ml-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            <span className="hidden xs:inline">Disponible</span>
            <span className="xs:hidden">•</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3 min-h-[24px]">
          {field.amenities.slice(0, 2).map((amenity, index) => (
            <span
              key={index}
              className="bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded-full whitespace-nowrap"
            >
              {amenity}
            </span>
          ))}
          {field.amenities.length > 2 && (
            <span className="bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded-full">
              +{field.amenities.length - 2}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-base sm:text-lg font-bold text-neutral-900">Bs {field.price}</span>
            <span className="text-neutral-600 text-xs sm:text-sm ml-1">/ hora</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportFieldCard;