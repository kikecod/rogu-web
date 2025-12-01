// File: components/FavoriteCard.tsx
import React, { useEffect, useState } from 'react';
import type { FavoriteRecord } from '../types/favorite.types';
import FavoriteButton from './FavoriteButton';
import { getImageUrl } from '@/core/config/api';
import { Star, Building2 } from 'lucide-react';


interface Props {
  favorite: FavoriteRecord;
  onRemove: (idSede: number) => void;
  onViewDetails?: (idSede: number) => void;
}

const FavoriteCard: React.FC<Props> = ({ favorite, onRemove, onViewDetails }) => {
  const sede = favorite.sede;
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    // Resolver foto de la sede
    if (sede?.fotos && sede.fotos.length > 0) {
      const fotoUrl = sede.fotos[0].url;
      if (fotoUrl) {
        const url = fotoUrl.startsWith('http') ? fotoUrl : getImageUrl(fotoUrl);
        setImgSrc(url);
      }
    }
  }, [sede?.fotos]);


  // Renderizar estrellas de rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return stars;
  };

  return (
    <div className="rounded-2xl bg-gradient-to-tr from-rose-500/30 via-fuchsia-500/30 to-indigo-500/30 p-[1.2px] transition hover:from-rose-500/50 hover:to-indigo-500/50">
      <div className="group relative h-full overflow-hidden rounded-[14px] bg-white shadow-sm transition hover:shadow-xl">
        {/* Imagen principal */}
        <div className="relative h-44 w-full overflow-hidden bg-gray-100 sm:h-48">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={sede?.nombre || `Sede ${favorite.idSede}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={() => setImgSrc('')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-16 h-16 text-gray-300" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-60 transition group-hover:opacity-70" />
          <div className="absolute right-2 top-2">
            <FavoriteButton idSede={favorite.idSede} className="bg-white/70 backdrop-blur hover:bg-white" />
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold tracking-tight text-gray-900 line-clamp-1">
                {sede?.nombre || `Sede ${favorite.idSede}`}
              </h3>

              {sede?.descripcion && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {sede.descripcion}
                </p>
              )}

              {/* Rating */}
              {sede?.ratingFinal !== undefined && Number(sede.ratingFinal) > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <div className="flex">
                    {renderStars(Number(sede.ratingFinal))}
                  </div>
                  <span className="text-sm text-gray-600 ml-1">
                    {Number(sede.ratingFinal).toFixed(1)}
                  </span>
                </div>
              )}

              {/* Canchas disponibles */}
              {sede?.canchas && sede.canchas.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">
                    {sede.canchas.length} {sede.canchas.length === 1 ? 'cancha' : 'canchas'} disponibles:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sede.canchas.slice(0, 3).map((cancha) => (
                      <span
                        key={cancha.idCancha}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {cancha.nombre}
                      </span>
                    ))}
                    {sede.canchas.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-600">
                        +{sede.canchas.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Favorito desde {new Date(favorite.creadoEn).toLocaleDateString()}
          </div>

          <div className="mt-1 flex gap-2">
            <button
              onClick={() => onRemove(favorite.idSede)}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-gray-200 text-red-600 hover:border-red-200 hover:bg-red-50 transition shadow-sm"
            >
              Remover
            </button>
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(favorite.idSede)}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition shadow-sm"
              >
                Ver detalles
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteCard;