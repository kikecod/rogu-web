import { AlertCircle, Loader2 } from 'lucide-react';
import type { SedeCard as SedeCardType } from '@/venues/types/venue-search.types';
import SedeCard from '@/venues/components/SedeCard';

interface PublicVenueGridProps {
  venues: SedeCardType[];
  loading: boolean;
  error?: string | null;
  onSelect?: (sede: SedeCardType) => void;
  emptyMessage?: string;
}

const PublicVenueGrid = ({ venues, loading, error, onSelect, emptyMessage }: PublicVenueGridProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#0F172A]/70">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A6FF8]" />
        <p className="mt-2 text-sm">Cargando sedes públicas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
        <AlertCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="py-10 text-center bg-white/65 backdrop-blur rounded-2xl border border-[#E9ECF5] shadow-inner text-[#0F172A]/70">
        <p className="text-base font-semibold mb-1">Sin resultados</p>
        <p className="text-sm">{emptyMessage || 'Intenta con otros filtros públicos.'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {venues.map((sede) => (
        <SedeCard key={sede.idSede} sede={sede} onClick={(selected: SedeCardType) => onSelect?.(selected)} />
      ))}
    </div>
  );
};

export default PublicVenueGrid;
