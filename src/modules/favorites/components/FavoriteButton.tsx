// File: components/FavoriteButton.tsx
import React, { useEffect, useRef } from 'react';
import { useFavoriteToggle } from '../hooks/useFavoriteToggle';

type Size = 'sm' | 'md' | 'lg';

interface Props {
  idCancha: number;
  size?: Size;
  className?: string;
}

const FavoriteButton: React.FC<Props> = ({ idCancha, size = 'md', className = '' }) => {
  const { isFavorite, loading, toggle } = useFavoriteToggle(idCancha);
  const prev = useRef<boolean>(isFavorite);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (prev.current !== isFavorite && buttonRef.current) {
      // pequeña animación cuando cambia el estado
      buttonRef.current.classList.add('animate-[pulse_0.5s_ease-in-out]');
      t = setTimeout(() => {
        buttonRef.current?.classList.remove('animate-[pulse_0.5s_ease-in-out]');
      }, 550);
    }
    prev.current = isFavorite;
    return () => {
      if (t) clearTimeout(t);
    };
  }, [isFavorite]);

  const sizeClass: Record<Size, string> = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={isFavorite}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={loading}
      className={[
        'relative inline-flex items-center justify-center rounded-full p-2 transition duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 focus-visible:ring-offset-2',
        isFavorite ? 'hover:bg-rose-50' : 'hover:bg-gray-100',
        loading ? 'cursor-not-allowed opacity-90' : '',
        className,
      ].join(' ')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={[
          sizeClass[size],
          'drop-shadow-sm transition-transform',
          isFavorite ? 'text-rose-500 scale-105' : 'text-gray-400 scale-100',
        ].join(' ')}
        aria-hidden
      >
        <defs>
          <linearGradient id="favHeartGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <path
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          fill={isFavorite ? 'url(#favHeartGradient)' : 'none'}
          stroke="currentColor"
          strokeWidth={isFavorite ? 0 : 1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {loading && (
        <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 animate-pulse">
          …
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
