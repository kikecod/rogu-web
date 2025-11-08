// File: components/FavoriteCard.tsx
import React from 'react';
import type { FavoriteRecord } from '../types/favorite.types';
import FavoriteButton from './FavoriteButton';
import { getImageUrl } from '@/core/config/api';

interface Props {
  favorite: FavoriteRecord;
  onRemove: (idCancha: number) => void;
  onReserve?: (idCancha: number) => void;
}

const FavoriteCard: React.FC<Props> = ({ favorite, onRemove, onReserve }) => {
  const c = favorite.cancha;

  return (
    <div className="rounded-2xl bg-gradient-to-tr from-rose-500/30 via-fuchsia-500/30 to-indigo-500/30 p-[1.2px] transition hover:from-rose-500/50 hover:to-indigo-500/50">
      <div className="group relative h-full overflow-hidden rounded-[14px] bg-white shadow-sm transition hover:shadow-xl">
        {/* Imagen */}
        {c?.fotos?.[0] && (
          <div className="relative h-44 w-full overflow-hidden bg-gray-100 sm:h-48">
            <img
              src={getImageUrl((c.fotos[0] as any).urlFoto || (c.fotos[0] as any).url || '')}
              alt={c?.nombre || `Cancha ${favorite.idCancha}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getImageUrl('/uploads/placeholder.png');
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-60 transition group-hover:opacity-70" />
            <div className="absolute right-2 top-2">
              <FavoriteButton idCancha={favorite.idCancha} className="bg-white/70 backdrop-blur hover:bg-white" />
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-gray-900 line-clamp-1">
                {c?.nombre || `Cancha ${favorite.idCancha}`}
              </h3>

              {c?.superficie && (
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-rose-50 text-rose-600 border border-rose-100">
                    {c.superficie}
                  </span>
                  {typeof c?.aforoMax === 'number' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Aforo {c.aforoMax}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-gray-700">
              {c?.precio !== undefined && (
                <span className="font-bold text-gray-900">
                  <span className="text-xs align-super mr-0.5">Bs</span>
                  <span className="text-lg">{c.precio}</span>
                </span>
              )}
              {c?.rating !== undefined && (
                <span
                  className="inline-flex items-center gap-1 text-amber-600 font-medium"
                  aria-label={`Calificación ${c.rating?.toFixed(1)} de 5`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.57a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.507a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.57a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  {c.rating?.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Favorito desde {new Date(favorite.creadoEn).toLocaleDateString()}
          </div>

          <div className="mt-1 flex gap-2">
            <button
              onClick={() => onRemove(favorite.idCancha)}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-gray-200 text-red-600 hover:border-red-200 hover:bg-red-50 transition shadow-sm"
            >
              Remover
            </button>
            {onReserve && (
              <button
                onClick={() => onReserve(favorite.idCancha)}
                className="text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition shadow-sm"
              >
                Reservar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteCard;
