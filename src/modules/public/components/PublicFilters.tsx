import { Calendar, Filter, MapPin, Timer, Dumbbell, RefreshCw } from 'lucide-react';
import type { PublicVenueFilters } from '../hooks/usePublicVenues';

interface PublicFiltersProps {
  values: PublicVenueFilters;
  onChange: (next: Partial<PublicVenueFilters>) => void;
  onSubmit: () => void;
  compact?: boolean;
}

const PublicFilters = ({ values, onChange, onSubmit, compact = false }: PublicFiltersProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const inputBase =
    'w-full rounded-xl border border-white/60 bg-white/80 backdrop-blur px-3 py-2 text-sm text-[#0F172A] shadow-sm placeholder:text-[#0F172A]/60 focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-[#3A6FF8]';

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full bg-white/65 backdrop-blur rounded-2xl border border-[#E9ECF5] shadow-lg shadow-black/5 ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      } space-y-4`}
    >
      <div className="flex items-center gap-2 text-[#0F172A]/70 text-sm font-semibold">
        <Filter className="h-4 w-4" />
        Filtra sin iniciar sesión
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="space-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0F172A]/70">
            <MapPin className="h-4 w-4" />
            Ciudad
          </span>
          <input
            type="text"
            placeholder="La Paz, Santa Cruz..."
            value={values.city || ''}
            onChange={(e) => onChange({ city: e.target.value })}
            className={inputBase}
          />
        </label>

        <label className="space-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0F172A]/70">
            <Calendar className="h-4 w-4" />
            Fecha
          </span>
          <input
            type="date"
            value={values.date || ''}
            onChange={(e) => onChange({ date: e.target.value })}
            className={inputBase}
          />
        </label>

        <label className="space-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0F172A]/70">
            <Timer className="h-4 w-4" />
            Hora inicio
          </span>
          <input
            type="time"
            value={values.startTime || ''}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className={inputBase}
          />
        </label>

        <label className="space-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0F172A]/70">
            <Dumbbell className="h-4 w-4" />
            Deporte
          </span>
          <input
            type="text"
            placeholder="Fútbol, Pádel..."
            value={values.sport || ''}
            onChange={(e) => onChange({ sport: e.target.value })}
            className={inputBase}
          />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="text-xs text-[#0F172A]/70">
          Elige filtros públicos. Para reservar te pediremos iniciar sesión.
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({ city: '', date: '', startTime: '', endTime: '', sport: '', district: '' })
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#E9ECF5] bg-white/70 text-[#0F172A] shadow-sm hover:bg-white transition"
          >
            <RefreshCw className="h-4 w-4" />
            Limpiar filtros
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#3A6FF8] to-[#6C63FF] text-white font-semibold shadow-md hover:-translate-y-0.5 transition"
          >
            Buscar sedes
          </button>
        </div>
      </div>
    </form>
  );
};

export default PublicFilters;
