// File: pages/FavoritesPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import FavoriteCard from '../components/FavoriteCard';
import EmptyFavorites from '../components/EmptyFavorites';
import { ROUTES } from '@/config/routes';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, loading, sortBy, setSortBy, removeFavorite } = useFavorites();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6">
            <div className="mb-2 h-7 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="h-40 animate-pulse bg-gray-100" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="h-8 w-full animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!favorites.length) return <EmptyFavorites />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-10">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Mis Sedes Favoritas
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-red-500 text-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {favorites.length} {favorites.length === 1 ? 'sede' : 'sedes'} guardadas
            </p>
          </div>

          {/* Ordenar */}
          <div>
            <label className="mb-1 block text-[11px] text-gray-500">Ordenar por</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'reciente' | 'rating')}
                className="h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
              >
                <option value="reciente">Más recientes</option>
                <option value="rating">Mejor calificados</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
            </div>
          </div>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <FavoriteCard
              key={`${fav.idCliente}-${fav.idSede}-${fav.creadoEn}`}
              favorite={fav}
              onRemove={removeFavorite}
              onViewDetails={(idSede) => navigate(ROUTES.venue(idSede), { state: { fromFavorites: true } })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
