import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Star, ChevronLeft, Shield,
  Clock, Users, Building2, AlertCircle, Loader2
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando información de la sede...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'No se encontró la sede'}</p>
          <button
            onClick={() => navigate(ROUTES.home)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(ROUTES.home)}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Volver</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Image */}
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden h-[400px]">
            <img
              src={venue.fotos?.[0]?.urlFoto || '/placeholder-venue.jpg'}
              alt={venue.nombre}
              className="w-full h-full object-cover"
            />

            {/* Sede Badge y Verificación */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Sede Deportiva
              </div>
              {venue.verificada && (
                <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Verificado
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sede Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title and Rating */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {venue.nombre}
                </h1>
                <FavoriteButton idSede={venue.idSede} size="md" />
              </div>


              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
                  <span className="font-bold text-blue-900 text-sm">
                    {venue.estadisticas.ratingFinal.toFixed(1)}
                  </span>
                  <span className="text-xs">
                    ({venue.estadisticas.totalResenasSede + venue.estadisticas.totalResenasCanchas} reseñas)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-xs">
                    {venue.addressLine}, {venue.district}, {venue.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {venue.descripcion && (
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Sobre esta sede</h2>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {venue.descripcion}
                </p>
              </div>
            )}

            {/* Sports */}
            {venue.estadisticas.totalCanchas > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Información general</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total canchas</p>
                      <p className="text-lg font-bold text-gray-900">
                        {venue.estadisticas.totalCanchas}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Star className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Precio desde</p>
                      <p className="text-lg font-bold text-gray-900">
                        Bs {venue.estadisticas.precioDesde}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Available Fields */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Canchas disponibles ({fields.length})
              </h2>
              {fields.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div
                      key={field.idCancha}
                      onClick={() => handleFieldClick(field)}
                      className="cursor-pointer transform transition-transform hover:scale-105"
                    >
                      <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                        <div className="h-48 overflow-hidden">
                          <img
                            src={field.fotos?.[0]?.urlFoto || '/placeholder-field.jpg'}
                            alt={field.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 text-base mb-2">{field.nombre}</h3>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {field.disciplinas.slice(0, 2).map((disciplina) => (
                              <span
                                key={disciplina.idDisciplina}
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                              >
                                {disciplina.nombre}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
                              <span className="font-bold text-sm">
                                {field.ratingPromedio.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-600">
                                ({field.totalResenas})
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-extrabold text-blue-600">
                                Bs {field.precio}
                              </span>
                              <span className="text-xs text-gray-600">/hora</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay canchas disponibles en esta sede
                </p>
              )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Ubicación
              </h2>

              {/* Mapa */}
              {venue.latitude && venue.longitude ? (
                <div className="mb-4">
                  <MapView
                    lat={venue.latitude}
                    lng={venue.longitude}
                    title={venue.nombre}
                    height="400px"
                    zoom={15}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 h-64 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center p-4">
                    <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium text-base">Ubicación no disponible</p>
                    <p className="text-gray-600 text-sm">Coordenadas no configuradas</p>
                  </div>
                </div>
              )}

              {/* Información de dirección */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">{venue.addressLine}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {venue.district}, {venue.city}, {venue.stateProvince}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{venue.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Reseñas ({reviews.length})
                </h2>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.idCalificacionSede} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-sm">{review.puntajeGeneral}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.fechaCreacion).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comentario && (
                        <p className="text-sm text-gray-700">{review.comentario}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-5 shadow-xl border-2 border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Información de contacto
              </h3>

              {/* Owner Info */}
              <div className="mb-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-2">Propietario</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {venue.duenio.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{venue.duenio.nombre}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Shield className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">Verificado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <a
                  href={`tel:${venue.telefono}`}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Teléfono</p>
                    <p className="font-bold text-gray-900 text-sm">{venue.telefono}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${venue.email}`}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-bold text-gray-900 text-sm break-all">{venue.email}</p>
                  </div>
                </a>
              </div>

              {/* Quick Stats */}
              <div className="mt-5 pt-5 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-extrabold text-blue-600">
                      {venue.estadisticas.totalCanchas}
                    </div>
                    <div className="text-xs text-gray-600">Canchas</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-extrabold text-blue-600">
                      {venue.estadisticas.ratingFinal.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>
              </div>

              {/* Hours */}
              {venue.horarioApertura && venue.horarioCierre && (
                <div className="mt-5 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <p className="font-bold text-gray-900 text-sm">Horario de atención</p>
                  </div>
                  <p className="text-xs text-gray-700">
                    {venue.horarioApertura} - {venue.horarioCierre}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VenueDetailPage;
