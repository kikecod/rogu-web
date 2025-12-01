import { Image } from 'lucide-react';
import type { FotoCanchaAdmin } from '../types';
import { generatePlaceholderImage } from '@/core/lib/helpers';

const PhotoGallery = ({ fotos = [] }: { fotos?: FotoCanchaAdmin[] }) => {
  const visibles = fotos.slice(0, 3);
  const tieneFotos = fotos.length > 0;
  const placeholder = generatePlaceholderImage(600, 400, 'Sin foto');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {!tieneFotos && (
        <div className="col-span-full border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
          <Image size={32} className="mx-auto mb-2" />
          <p className="text-sm">No hay fotos registradas para esta cancha</p>
        </div>
      )}
      {visibles.map((foto, index) => (
        <div
          key={`${foto.idFoto}-${index}`}
          className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
        >
          <img
            className="h-48 w-full object-cover"
            src={foto.urlFoto || placeholder}
            alt={`Foto ${index + 1}`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholder;
            }}
          />
          {index === visibles.length - 1 && fotos.length > visibles.length && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold">
              +{fotos.length - visibles.length} fotos más
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PhotoGallery;
