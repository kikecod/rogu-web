import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import type { SportField } from '../types/field.types';

interface SportFieldCardProps {
  field: SportField;
  onClick: (field: SportField) => void;
}

const SportFieldCard: React.FC<SportFieldCardProps> = ({ field, onClick }) => {
  const disciplinaNombres: string[] = Array.isArray((field as any).disciplinas)
    ? ((field as any).disciplinas as string[])
    : [];

  const hasImages = Array.isArray(field.images) && field.images.length > 0 && !!field.images[0];
  const mainImage = hasImages ? field.images[0] : '';

  return (
    <div
      className="bg-white rounded-xl border border-neutral-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group w-full h-full"
      onClick={() => onClick(field)}
    >
      <div className="relative h-48 overflow-hidden bg-black flex items-center justify-center text-white">
        {hasImages ? (
          <img
            src={mainImage}
            alt={field.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-semibold text-sm uppercase tracking-wide">
            Sin foto
          </div>
        )}

        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1 flex-wrap max-w-[80%]">
          {disciplinaNombres.slice(0, 2).map((name, idx) => (
            <span
              key={name + idx}
              className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs sm:text-sm font-medium shadow-sm border border-neutral-200"
            >
              {name}
            </span>
          ))}
          {disciplinaNombres.length > 2 && (
            <span className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs sm:text-sm font-medium shadow-sm border border-neutral-200">
              +{disciplinaNombres.length - 2}
            </span>
          )}
          {disciplinaNombres.length === 0 && (
            <span className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs sm:text-sm font-medium shadow-sm border border-neutral-200">
              Sin disciplina
            </span>
          )}
        </div>
        {hasImages && field.images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-neutral-900/70 text-white text-xs px-2 py-1 rounded-full">
            1/{field.images.length}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-center text-neutral-600 text-xs sm:text-sm mb-2">
          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{field.location?.city || 'Ubicación no especificada'}</span>
        </div>

        <h3 className="font-semibold text-base sm:text-lg text-neutral-900 mb-1 line-clamp-1">
          {field.name}
        </h3>

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
            <span className="xs:hidden">✓</span>
          </div>
        </div>

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
