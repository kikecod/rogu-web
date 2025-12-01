import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PublicHeroProps {
  onExplore?: () => void;
}

const PublicHero = ({ onExplore }: PublicHeroProps) => {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#3A6FF8] via-[#6C63FF] to-[#8BD3FF] text-white shadow-lg shadow-black/10">
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-24 -right-16 w-96 h-96 bg-white/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-20 w-[28rem] h-[28rem] bg-black/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-14 md:py-18 lg:py-22 flex flex-col lg:flex-row lg:items-center gap-10 min-h-[440px]">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-sm font-semibold shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Espacios verificados y listos para reservar
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white drop-shadow-sm">
            Encuentra tu próxima cancha en minutos
          </h1>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl">
            Explora sedes deportivas públicas con filtros por ciudad, deporte y fecha. Sin registro para ver;
            inicia sesión solo cuando quieras reservar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onExplore}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0F172A] font-semibold shadow-md hover:-translate-y-0.5 transition"
            >
              Explorar sedes
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/venues/featured"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10 transition"
            >
              Ver destacadas
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/85">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Experiencia glass + responsive
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/70" />
              Sin login para explorar
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-end">
          <div className="bg-white/65 backdrop-blur rounded-3xl shadow-xl shadow-black/10 border border-white/50 p-6 sm:p-7 lg:p-8 w-full max-w-md space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#3A6FF8] to-[#6C63FF] flex items-center justify-center text-white font-bold shadow-md">
                GO
              </div>
              <div>
                <p className="text-[#0F172A] font-semibold text-lg">Reserva inteligente</p>
                <p className="text-sm text-[#0F172A]/70">Filtros rápidos y resultados en vivo</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-[#0F172A]">
              <div className="p-4 rounded-2xl bg-white/85 shadow-sm border border-[#8BD3FF]/50">
                <p className="text-xs text-[#0F172A]/70">Ciudades activas</p>
                <p className="text-2xl font-bold">+25</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/85 shadow-sm border border-[#B5A5FF]/50">
                <p className="text-xs text-[#0F172A]/70">Sedes verificadas</p>
                <p className="text-2xl font-bold">+320</p>
              </div>
              <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-r from-white/85 to-white/70 shadow-sm border border-white/60">
                <p className="text-xs text-[#0F172A]/70">Reserva sin fricción</p>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Explora libremente y pide login solo al confirmar tu reserva.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicHero;
