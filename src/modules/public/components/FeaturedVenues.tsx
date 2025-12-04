import { Flame } from 'lucide-react';
import type { SedeCard as SedeCardType } from '@/venues/types/venue-search.types';
import PublicVenueGrid from './PublicVenueGrid';

interface FeaturedVenuesProps {
  venues: SedeCardType[];
  loading: boolean;
  onSelect?: (sede: SedeCardType) => void;
}

const FeaturedVenues = ({ venues, loading, onSelect }: FeaturedVenuesProps) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#3A6FF8] to-[#6C63FF] flex items-center justify-center text-white shadow-md">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Sedes destacadas</h2>
          <p className="text-sm text-[#0F172A]/70">Visibles sin login, con estilo glass responsive.</p>
        </div>
      </div>

      <PublicVenueGrid
        venues={venues}
        loading={loading}
        onSelect={onSelect}
        emptyMessage="Aún no hay sedes destacadas disponibles."
      />
    </section>
  );
};

export default FeaturedVenues;
