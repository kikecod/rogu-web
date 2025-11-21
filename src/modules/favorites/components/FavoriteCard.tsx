// File: components/FavoriteCard.tsx
import React, { useEffect, useState } from 'react';
import type { FavoriteRecord } from '../types/favorite.types';
import FavoriteButton from './FavoriteButton';
import { getImageUrl } from '@/core/config/api';
import type { FavoriteFoto } from '../types/favorite.types';
import { fetchCanchaImage } from '@/core/lib/helpers';

interface Props {
  favorite: FavoriteRecord;
  onRemove: (idCancha: number) => void;
  onReserve?: (idCancha: number) => void;
}

const FavoriteCard: React.FC<Props> = ({ favorite, onRemove, onReserve }) => {
  const c = favorite.cancha;

  // Resolver foto: primero usar la que venga en favorite.cancha; si no hay, llamar API /cancha/:id para obtenerla
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const resolveCanchaFotoPath = (f: any): string => {
      if (!f) return '';
      return (
        f.urlFoto?.trim?.() || f.url?.trim?.() || f.path?.trim?.() || f.ruta?.trim?.() || ''
      );
    };

    const init = async () => {
      const rawFoto: FavoriteFoto | undefined = c?.fotos?.[0];
      const fotoPath = resolveCanchaFotoPath(rawFoto);
      if (fotoPath) {
        const url = fotoPath.startsWith('http') ? fotoPath : getImageUrl(fotoPath);
        if (mounted) setImgSrc(url);
        return;
      }
      // No vino foto en el favorito: traerla desde el backend
      try {
        const url = await fetchCanchaImage(favorite.idCancha);
        if (mounted) setImgSrc(url);
      } catch {
        if (mounted) setImgSrc('');
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [favorite.idCancha, c?.fotos]);

  return (
    <div className="rounded-2xl bg-gradient-to-tr from-rose-500/30 via-fuchsia-500/30 to-indigo-500/30 p-[1.2px] transition hover:from-rose-500/50 hover:to-indigo-500/50">
      <div className="group relative h-full overflow-hidden rounded-[14px] bg-white shadow-sm transition hover:shadow-xl">
        {/* Imagen principal (sólo desde backend); si no llega, se mantiene el fondo gris */}
        <div className="relative h-44 w-full overflow-hidden bg-gray-100 sm:h-48">
          {imgSrc && (
            <img
              src={imgSrc}
              alt={c?.nombre || `Cancha ${favorite.idCancha}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={() => setImgSrc('')}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-60 transition group-hover:opacity-70" />
          <div className="absolute right-2 top-2">
            <FavoriteButton idCancha={favorite.idCancha} className="bg-white/70 backdrop-blur hover:bg-white" />
          </div>
        </div>

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
              {/* Disciplinas chips si vienen en cancha.parte.disciplina */}
              {Array.isArray((c as any)?.parte) && (c as any).parte.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 max-h-12 overflow-hidden">
                  {(c as any).parte.slice(0,3).map((p: any, idx: number) => (
                    <span
                      key={p.idDisciplina + '-' + idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm"
                    >
                      {p?.disciplina?.nombre || 'Disciplina'}
                    </span>
                  ))}
                  {(c as any).parte.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-white border border-gray-200 text-gray-600">
                      +{(c as any).parte.length - 3}
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
 