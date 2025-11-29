import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Star, ChevronLeft, Shield,
  Clock, Users, Building2, AlertCircle, Loader2,
  Share2, Navigation
} from 'lucide-react';
import Footer from '@/components/Footer';
import MapView from '@/components/MapView';
import { venueService } from '../services/venueService';
import type { SedeDetalle, CanchaResumen, CalificacionSede } from '../types/venue-search.types';
import { ROUTES } from '@/config/routes';
import FavoriteButton from '@/favorites/components/FavoriteButton';


const VenueDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { idSede } = useParams<{ idSede: string }>();

  const [venue, setVenue] = useState<SedeDetalle | null>(null);
  const [fields, setFields] = useState<CanchaResumen[]>([]);
  const [reviews, setReviews] = useState<CalificacionSede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadVenueData = async () => {
      if (!idSede) {
        setError('ID de sede no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Cargar datos en paralelo
        const [venueResponse, fieldsResponse, reviewsResponse] = await Promise.all([
          venueService.getVenueById(Number(idSede)),
          venueService.getVenueFields(Number(idSede)),
          venueService.getVenueReviews(Number(idSede)).catch(() => ({ resenas: [], total: 0, promedios: {} }))
        ]);

        setVenue(venueResponse.sede);
        setFields(fieldsResponse.canchas);
        setReviews(reviewsResponse.resenas || []);
      } catch (err) {
        console.error('Error cargando datos de sede:', err);
        setError('No se pudo cargar la información de la sede');
      } finally {
        setLoading(false);
      }
    };

    loadVenueData();
  }, [idSede]);

  const handleFieldClick = (field: CanchaResumen) => {
    navigate(`/venues/${idSede}/fields/${field.idCancha}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Cargando experiencia...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
          <p className="text-gray-600 mb-6">{error || 'No pudimos encontrar la sede que buscas.'}</p>
          <button
            onClick={() => navigate(ROUTES.home)}
            className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section Immersivo */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        {/* Local Navigation Controls (Absolute) */}
        <div className="absolute top-4 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate(ROUTES.home)}
              className="p-2 rounded-full bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3">
              <FavoriteButton idSede={venue.idSede} size="md" />
              <button className="p-2 rounded-full bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gray-900">
          <img
            src={venue.fotos?.[0]?.urlFoto || '/placeholder-venue.jpg'}
            alt={venue.nombre}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 pb-12 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  Sede Deportiva
                </span>
                {venue.verificada && (
                  <span className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                    <Shield className="h-3 w-3" /> Verificado
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                {venue.nombre}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">{venue.estadisticas.ratingFinal.toFixed(1)}</span>
                  <span className="text-sm text-white/70">({venue.estadisticas.totalResenasSede + venue.estadisticas.totalResenasCanchas} reseñas)</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm md:text-base">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span>{venue.addressLine}, {venue.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Columna Principal (Izquierda) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Descripción */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre este lugar</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {venue.descripcion || "Disfruta de las mejores instalaciones deportivas. Este espacio está diseñado para brindarte la mejor experiencia en cada partido."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                  <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{venue.estadisticas.totalCanchas}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Canchas</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                  <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900 mt-1">Abierto</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Hoy</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                  <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900 mt-1">Social</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ambiente</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                  <Shield className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900 mt-1">Seguro</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Zona</p>
                </div>
              </div>
            </div>

            {/* Canchas Disponibles */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Elige tu cancha</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  {fields.length} disponibles
                </span>
              </div>

              {fields.length > 0 ? (
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div
                      key={field.idCancha}
                      onClick={() => handleFieldClick(field)}
                      className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex flex-col sm:flex-row gap-5"
                    >
                      <div className="w-full sm:w-48 h-48 sm:h-40 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <img
                          src={field.fotos?.[0]?.urlFoto || '/placeholder-field.jpg'}
                          alt={field.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                          {field.disciplinas[0]?.nombre || 'Deporte'}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {field.nombre}
                            </h3>
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-bold text-gray-900">{field.ratingPromedio.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                            {field.superficie} • {field.dimensiones}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {field.cubierta && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Techada</span>
                            )}
                            {field.iluminacion && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Iluminación</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Precio por hora</p>
                            <p className="text-2xl font-extrabold text-gray-900">
                              Bs {field.precio}
                            </p>
                          </div>
                          <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm group-hover:bg-blue-600 transition-colors shadow-lg shadow-gray-200 group-hover:shadow-blue-200">
                            Reservar ahora
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No hay canchas disponibles</h3>
                  <p className="text-gray-500">Esta sede aún no ha registrado sus canchas.</p>
                </div>
              )}
            </div>

            {/* Ubicación */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Ubicación
                </h2>
                <p className="text-gray-600 mt-2">
                  {venue.addressLine}, {venue.district}, {venue.city}
                </p>
              </div>
              <div className="h-[400px] w-full bg-gray-100 relative">
                {venue.latitude && venue.longitude ? (
                  <MapView
                    lat={venue.latitude}
                    lng={venue.longitude}
                    title={venue.nombre}
                    height="100%"
                    zoom={15}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Mapa no disponible</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 flex justify-end">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
                >
                  <Navigation className="h-4 w-4" />
                  Abrir en Google Maps
                </a>
              </div>
            </div>

            {/* Reseñas */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Lo que dicen los usuarios</h2>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-yellow-700">{venue.estadisticas.ratingFinal.toFixed(1)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.slice(0, 4).map((review) => (
                    <div key={review.idCalificacionSede} className="bg-gray-50 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < review.puntajeGeneral ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(review.fechaCreacion).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        "{review.comentario || "Excelente lugar, muy recomendado."}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna Lateral (Derecha) - Sticky */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {venue.duenio.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Gestionado por</p>
                    <p className="text-lg font-bold text-gray-900">{venue.duenio.nombre}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={`tel:${venue.telefono}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                      <Phone className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">{venue.telefono}</span>
                  </a>

                  <a
                    href={`mailto:${venue.email}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all group"
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                      <Mail className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-blue-700 truncate">{venue.email}</span>
                  </a>
                </div>

                {venue.horarioApertura && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="font-bold text-gray-900">Horario de atención</span>
                    </div>
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl border border-green-100">
                      <span className="text-sm font-medium text-green-800">Lunes - Domingo</span>
                      <span className="text-sm font-bold text-green-900">{venue.horarioApertura} - {venue.horarioCierre}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/10 rounded-full blur-xl" />

                <h3 className="text-xl font-bold mb-2 relative z-10">¿Listo para jugar?</h3>
                <p className="text-blue-100 text-sm mb-6 relative z-10">
                  Reserva tu cancha en segundos y asegura tu partido.
                </p>

                <button
                  onClick={() => {
                    const element = document.querySelector('.lg\\:col-span-8 > div:nth-child(2)');
                    if (element) {
                      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                      const offsetPosition = elementPosition - 100; // 80px navbar + 20px padding
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="w-full bg-white text-blue-600 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg relative z-10"
                >
                  Ver canchas disponibles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VenueDetailPage;
