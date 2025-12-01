import { useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MapPin, Star, Phone, Mail, ShieldCheck, Calendar, ArrowLeft } from 'lucide-react';
import MapPicker from '@/venues/components/MapPicker';
import { useAuth } from '@/auth/hooks/useAuth';
import { usePublicVenueDetail } from '../hooks/usePublicVenueDetail';

const PublicVenueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const { data, loading, error } = usePublicVenueDetail(id ? Number(id) : undefined);

  const sede = data?.sede;

  const mainImage = useMemo(() => {
    if (!sede) return '/placeholder-venue.jpg';
    return (
      sede.fotoPrincipal ||
      sede.fotos?.[0]?.urlFoto ||
      '/placeholder-venue.jpg'
    );
  }, [sede]);

  const handleReserve = () => {
    if (!id) return;
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para reservar esta sede.');
      navigate('/', { state: { from: location } });
      return;
    }
    navigate(`/venues/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-[#0F172A]/70">
        <div className="h-10 w-10 border-2 border-[#3A6FF8] border-t-transparent rounded-full animate-spin" />
        <p className="ml-3 text-sm">Cargando sede pública...</p>
      </div>
    );
  }

  if (error || !sede) {
    return (
      <div className="max-w-4xl mx-auto bg-white/65 backdrop-blur rounded-2xl border border-[#E9ECF5] shadow-lg shadow-black/5 p-6">
        <p className="text-[#0F172A] font-semibold">No pudimos cargar esta sede.</p>
        <p className="text-sm text-[#0F172A]/70">{error || 'Intenta nuevamente más tarde.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#3A6FF8] to-[#6C63FF] text-white font-semibold shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-white/65 backdrop-blur border border-[#E9ECF5] shadow-lg shadow-black/5">
        <div className="aspect-[16/7] w-full overflow-hidden">
          <img src={mainImage} alt={sede.nombre} className="h-full w-full object-cover" />
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3A6FF8]/10 text-[#3A6FF8] text-xs font-semibold">
                Pública
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2">{sede.nombre}</h1>
              <div className="flex items-center gap-2 text-[#0F172A]/70 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{sede.city}, {sede.stateProvince}</span>
              </div>
            </div>
            <button
              onClick={handleReserve}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#3A6FF8] to-[#6C63FF] text-white font-semibold shadow-md hover:-translate-y-0.5 transition"
            >
              Reservar
            </button>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            {sede.verificada && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                <ShieldCheck className="h-4 w-4" />
                Verificada
              </span>
            )}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#E9ECF5] text-[#0F172A]/80">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              {sede.estadisticas?.ratingFinal?.toFixed(1) || 'N/A'}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#E9ECF5] text-[#0F172A]/80">
              <Calendar className="h-4 w-4" />
              {sede.estadisticas?.totalCanchas || 0} canchas
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/65 backdrop-blur rounded-2xl border border-[#E9ECF5] shadow-lg shadow-black/5 p-5 space-y-3">
            <h2 className="text-lg font-semibold text-[#0F172A]">Descripción</h2>
            <p className="text-sm text-[#0F172A]/80">
              {sede.descripcion || 'Esta sede aún no tiene descripción pública.'}
            </p>
            <div className="text-sm text-[#0F172A]/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{sede.addressLine || `${sede.city}, ${sede.stateProvince}`}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4" />
                <span>{sede.telefono || 'Teléfono no disponible'}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                <span>{sede.email || 'Correo no disponible'}</span>
              </div>
            </div>
          </div>

          {sede.latitude && sede.longitude && (
            <div className="bg-white/65 backdrop-blur rounded-2xl border border-[#E9ECF5] shadow-lg shadow-black/5 p-4">
              <h2 className="text-lg font-semibold text-[#0F172A] mb-3">Ubicación</h2>
              <div className="rounded-2xl border border-[#E9ECF5] overflow-hidden">
                <MapPicker
                  latitude={Number(sede.latitude)}
                  longitude={Number(sede.longitude)}
                  onLocationSelect={() => {}}
                  height="320px"
                  readOnly
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white/65 backdrop-blur rounded-2xl border border-[#E9ECF5] shadow-lg shadow-black/5 p-5">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-3">Resumen rápido</h3>
            <div className="space-y-2 text-sm text-[#0F172A]/80">
              <div className="flex items-center justify-between">
                <span>Precio desde</span>
                <span className="font-semibold text-[#0F172A]">
                  Bs {sede.estadisticas?.precioDesde ?? '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Deportes</span>
                <span>{sede.estadisticas?.deportesDisponibles.slice(0, 3).join(', ') || 'N/D'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reseñas</span>
                <span>{sede.estadisticas?.totalResenasSede ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicVenueDetailPage;
