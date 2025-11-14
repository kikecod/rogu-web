// File: components/EmptyFavorites.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

const EmptyFavorites: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] relative flex items-center justify-center px-4 py-16">
      {/* Fondo suave */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 via-white to-white" />

      {/* Blobs decorativos */}
      <div className="pointer-events-none absolute -z-10 -top-10 -left-10 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -z-10 -bottom-10 -right-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-50 via-pink-50 to-indigo-50 ring-1 ring-white/60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 drop-shadow-sm"
              viewBox="0 0 24 24"
              fill="url(#emptyFavHeart)"
              aria-hidden
            >
              <defs>
                <linearGradient id="emptyFavHeart" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-gray-800 via-gray-900 to-gray-700 bg-clip-text text-transparent text-center">
            No tienes favoritos aún
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-gray-600 text-center">
            Guarda tus canchas favoritas para acceder rápidamente a ellas y
            recibir promociones personalizadas y disponibilidad prioritaria.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate(ROUTES.home)}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm ring-1 ring-black/5 transition hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2"
            >
              <span className="transition group-hover:scale-110">🔍</span>
              <span>Explorar canchas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyFavorites;
