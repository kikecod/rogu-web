import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Star, MapPin, Share2, ChevronLeft, ChevronRight,
  Calendar, Shield, Sparkles, Check, X,
  MessageCircle, Phone, Plus, Minus,
  AlertCircle, Loader2
} from 'lucide-react';
import Footer from '@/components/Footer';
import CustomCalendar from '@/bookings/components/CustomCalendar';
import ReviewList from '@/reviews/components/ReviewList';
import type { SportField } from '../types/field.types';
import { fetchCanchaById, fetchReservasByFecha, generateAvailabilitySlots, formatDateLocal } from '@/core/lib/helpers';
import { useAuth } from '@/auth/hooks/useAuth';

import { ROUTES } from '@/config/routes';

const SportFieldDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id, idCancha } = useParams<{ id?: string; idCancha?: string; idSede?: string }>();
  const { user, isLoggedIn } = useAuth();

  // Usar idCancha si está disponible, sino usar id (para rutas legacy)
  const canchaId = idCancha || id;

  // Estados
  const [field, setField] = useState<SportField | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Cargar datos de la cancha
  useEffect(() => {
    const loadField = async () => {
      if (!canchaId) {
        setError('ID de cancha no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Cargando cancha con ID:', canchaId);

        const fieldData = await fetchCanchaById(canchaId);
        setField(fieldData);
        console.log('✅ Cancha cargada:', fieldData);
      } catch (err) {
        console.error('❌ Error al cargar cancha:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar la cancha');
      } finally {
        setLoading(false);
      }
    };

    loadField();
  }, [canchaId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Actualizar horarios disponibles cuando cambie la fecha seleccionada
  useEffect(() => {
    const updateAvailability = async () => {
      if (!field || !canchaId) return;

      try {
        setLoadingSlots(true);
        console.log('🔄 Actualizando horarios para fecha:', formatDateLocal(selectedDate), '(hora local Bolivia)');

        // Obtener reservas para la fecha seleccionada
        const reservasPorFecha = await fetchReservasByFecha(canchaId, selectedDate);

        // Generar nuevos slots de disponibilidad
        const newAvailability = generateAvailabilitySlots(
          field.openingHours?.open || '06:00',
          field.openingHours?.close || '23:00',
          reservasPorFecha,
          field.price,
          selectedDate
        );

        // Actualizar el field con los nuevos slots
        setField(prev => prev ? { ...prev, availability: newAvailability } : null);

        // Limpiar horarios seleccionados al cambiar de fecha
        setSelectedTimeSlots([]);

        console.log('✅ Horarios actualizados:', newAvailability);
      } catch (error) {
        console.error('❌ Error al actualizar horarios:', error);
      } finally {
        setLoadingSlots(false);
      }
    };

    updateAvailability();
  }, [selectedDate, field?.id, canchaId]); // Se ejecuta cuando cambia la fecha o el ID de la cancha

  // Handlers
  const nextImage = () => {
    if (!field || !field.images || field.images.length === 0) return;
    setImageError(false);
    setCurrentImageIndex((prev) =>
      prev === field.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!field || !field.images || field.images.length === 0) return;
    setImageError(false);
    setCurrentImageIndex((prev) =>
      prev === 0 ? field.images.length - 1 : prev - 1
    );
  };

  const handleReservation = () => {
    if (selectedTimeSlots.length === 0) {
      alert('Por favor selecciona al menos un horario');
      return;
    }
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (!selectedDate || selectedTimeSlots.length === 0 || !field) return;

    // Verificar autenticación
    if (!isLoggedIn || !user) {
      alert('Debes iniciar sesión para hacer una reserva');
      return;
    }

    // Calcular precio total sumando todos los horarios seleccionados
    const totalPrice = selectedTimeSlots.reduce((sum, timeSlot) => {
      const slot = field.availability.find(s => `${s.startTime} - ${s.endTime}` === timeSlot);
      return sum + (slot?.price || field.price);
    }, 0);

    // Navegar al checkout con los detalles de la reserva
    navigate(ROUTES.checkout, {
      state: {
        fieldId: canchaId,
        fieldData: field,
        selectedDate: selectedDate,
        selectedTimeSlots: selectedTimeSlots,
        participants: participants,
        totalPrice: totalPrice,
        bookingDetails: {
          fieldName: field.name,
          fieldImage: field.images[0],
          sedeName: field.owner?.name || 'Sede',
          address: `${field.location?.address || ''}, ${field.location?.city || ''}`,
          date: selectedDate.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          participants: participants,
          timeSlot: selectedTimeSlots.join(', '),
          price: totalPrice,
          rating: field.rating,
          reviews: field.reviews
        }
      }
    });
  };

  // Calcular precio total de todos los horarios seleccionados
  const totalPrice = field ? selectedTimeSlots.reduce((sum, timeSlot) => {
    const slot = field.availability.find(s => `${s.startTime} - ${s.endTime}` === timeSlot);
    return sum + (slot?.price || field.price);
  }, 0) : 0;

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Cargando cancha...</p>
        </div>
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancha no encontrada</h2>
          <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la información de esta cancha'}</p>
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

  const hasImages = Array.isArray(field.images) && field.images.length > 0;
  const currentImage = hasImages ? field.images[currentImageIndex] : '';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Gallery */}
      <div className="relative h-[50vh] min-h-[400px] lg:h-[60vh] bg-gray-900 group">
        {/* Local Navigation Controls (Absolute) */}
        <div className="absolute top-4 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate(`/venues/${field.id}`)}
              className="p-2 rounded-full bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <img
          src={field.images[currentImageIndex]}
          alt={field.name}
          className="w-full h-full object-cover opacity-90 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
          {currentImageIndex + 1} / {field.images.length}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Array.isArray(field.disciplinas) && field.disciplinas.map((disc, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        {disc}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                    {field.name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{field.location?.address || "Ubicación no disponible"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl self-start">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p className="text-lg font-bold text-gray-900 leading-none">{field.rating}</p>
                    <p className="text-xs text-gray-500">{field.reviews} reseñas</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <img
                    src={field.owner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(field.owner?.name || 'Sede')}&background=3b82f6&color=fff`}
                    alt={field.owner?.name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Anfitrión</p>
                    <p className="text-sm font-bold text-gray-900">{field.owner?.name || "Sede Deportiva"}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200 mx-2" />
                <div className="flex gap-2">
                  <button className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition-colors">
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition-colors">
                    <Phone className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Experiencia
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {field.description || "Disfruta de una experiencia deportiva única en nuestras instalaciones de primer nivel."}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-600" />
                Lo que ofrece este lugar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-gray-700 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100" id="reviews">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas</h2>
              {canchaId && <ReviewList idCancha={parseInt(canchaId)} />}
            </div>
          </div>

          {/* Booking Panel (Right - Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gray-900 text-white">
                <p className="text-sm text-gray-400 mb-1">Precio por hora</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">Bs {field.price}</span>
                  <span className="text-gray-400">/ hora</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">
                    Fecha
                  </label>
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all group"
                  >
                    <span className="font-medium text-gray-900">
                      {selectedDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <Calendar className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                  </button>

                  {showCalendar && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                      <CustomCalendar
                        selectedDate={selectedDate}
                        onDateSelect={(date) => {
                          setSelectedDate(date);
                          setShowCalendar(false);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Participants */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">
                    Jugadores
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-200">
                    <button
                      onClick={() => setParticipants(Math.max(1, participants - 1))}
                      disabled={participants <= 1}
                      className="p-3 rounded-lg bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="font-bold text-gray-900 text-lg">{participants}</span>
                    <button
                      onClick={() => setParticipants(Math.min(field.capacity || 22, participants + 1))}
                      disabled={participants >= (field.capacity || 22)}
                      className="p-3 rounded-lg bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2 flex justify-between">
                    <span>Horarios Disponibles</span>
                    {selectedTimeSlots.length > 0 && (
                      <span className="text-blue-600">{selectedTimeSlots.length} seleccionados</span>
                    )}
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8 bg-gray-50 rounded-xl">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {field.availability.map((slot) => {
                        const timeSlot = `${slot.startTime} - ${slot.endTime}`;
                        const isSelected = selectedTimeSlots.includes(timeSlot);

                        return (
                          <button
                            key={timeSlot}
                            onClick={() => {
                              if (!slot.available) return;
                              setSelectedTimeSlots(prev =>
                                isSelected
                                  ? prev.filter(t => t !== timeSlot)
                                  : [...prev, timeSlot]
                              );
                            }}
                            disabled={!slot.available}
                            className={`
                              relative p-3 rounded-xl text-sm font-medium transition-all border
                              ${isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]'
                                : slot.available
                                  ? 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                  : 'bg-gray-50 text-gray-400 border-transparent cursor-not-allowed'
                              }
                            `}
                          >
                            <span className={!slot.available ? 'line-through' : ''}>{timeSlot}</span>
                            {isSelected && (
                              <div className="absolute top-1 right-1">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Summary & Action */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium">Total estimado</span>
                    <span className="text-2xl font-extrabold text-gray-900">
                      Bs {totalPrice + Math.round(totalPrice * 0.1)}
                    </span>
                  </div>

                  <button
                    onClick={handleReservation}
                    disabled={selectedTimeSlots.length === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${selectedTimeSlots.length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 hover:-translate-y-0.5'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {selectedTimeSlots.length > 0 ? 'Reservar ahora' : 'Selecciona horario'}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    Reserva segura y garantizada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>

            <div className="text-center mb-8">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Confirmar Reserva
              </h3>
              <p className="text-gray-500 mt-1">Revisa los detalles antes de continuar</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-gray-600">Cancha</span>
                <span className="font-bold text-gray-900">{field.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Fecha</p>
                  <p className="font-bold text-gray-900">
                    {selectedDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Horarios</p>
                  <p className="font-bold text-gray-900">{selectedTimeSlots.length} horas</p>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-800 font-medium">Total a pagar</span>
                  <span className="text-2xl font-extrabold text-blue-900">
                    Bs {totalPrice + Math.round(totalPrice * 0.1)}
                  </span>
                </div>
                <p className="text-xs text-blue-600/80">Incluye tarifa de servicio</p>
              </div>
            </div>

            <button
              onClick={confirmBooking}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg"
            >
              Ir a pagar
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SportFieldDetailPage;
