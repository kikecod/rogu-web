import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Star, MapPin, Share2, ChevronLeft, ChevronRight,
  Clock, Calendar, Shield, Sparkles, Check, X,
  MessageCircle, Phone, Users, Plus, Minus
} from 'lucide-react';
import Footer from '@/components/Footer';
import CustomCalendar from '@/bookings/components/CustomCalendar';
import ReviewList from '@/reviews/components/ReviewList';
import type { SportField } from '../types/field.types';
import { fetchCanchaById, fetchReservasByFecha, generateAvailabilitySlots, formatDateLocal } from '@/core/lib/helpers';
import { useAuth } from '@/auth/hooks/useAuth';
import FavoriteButton from '../../favorites/components/FavoriteButton';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [loadingSlots, setLoadingSlots] = useState(false);

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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    if (!field) return;
    setCurrentImageIndex((prev) => 
      prev === field.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!field) return;
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

  // Sport icon ya no se usa en el badge; mantenido si se requiere en otro lugar

  // Calcular precio total de todos los horarios seleccionados
  const totalPrice = field ? selectedTimeSlots.reduce((sum, timeSlot) => {
    const slot = field.availability.find(s => `${s.startTime} - ${s.endTime}` === timeSlot);
    return sum + (slot?.price || field.price);
  }, 0) : 0;

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando cancha...</p>
        </div>
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancha no encontrada</h2>
          <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la información de esta cancha'}</p>
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
      {/* Sticky Header */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate(`/venues/${field.id}`)}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Volver</span>
          </button>
          
          <div className="flex items-center gap-3">
            {/* Botón de favoritos funcional */}
            {id && <FavoriteButton idCancha={Number(id)} size="sm" />}
            <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Main Image */}
            <div className="lg:col-span-3 relative rounded-2xl overflow-hidden group h-[400px] lg:h-[500px]">
              <img
                src={field.images[currentImageIndex]}
                alt={field.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                {currentImageIndex + 1} / {field.images.length}
              </div>

              {/* Disciplinas Badge (dinámicas) */}
              {Array.isArray(field.disciplinas) && field.disciplinas.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[70%] z-10">
                  {field.disciplinas.slice(0, 3).map((disc, idx) => (
                    <span
                      key={disc + idx}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                    >
                      {disc}
                    </span>
                  ))}
                  {field.disciplinas.length > 3 && (
                    <span className="bg-white/80 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium shadow border border-gray-200">
                      +{field.disciplinas.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            <div className="hidden lg:flex flex-col gap-3">
              {field.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer transition-all h-[118px] ${
                    currentImageIndex === idx 
                      ? 'ring-4 ring-blue-500 scale-105' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Vista ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title and Rating */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {field.name}
                </h1>
                <FavoriteButton idCancha={Number(field.id)} size="md" />
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-5">
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
                  <span className="font-bold text-blue-900 text-sm">{field.rating}</span>
                  <span className="text-xs">({field.reviews} reseñas)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-xs">{field.location?.address || ""}</span>
                </div>
              </div>

              {/* Price Section - Movido aquí */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 mb-5">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {selectedTimeSlots.length > 0 ? `Bs ${totalPrice}` : `Bs ${field.price}`}
                  </span>
                  <span className="text-base text-gray-600">
                    {selectedTimeSlots.length > 0 ? 'total' : '/ hora'}
                  </span>
                </div>
                {selectedTimeSlots.length > 0 && (
                  <p className="text-xs text-blue-600 font-medium flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    {selectedTimeSlots.length} horario{selectedTimeSlots.length > 1 ? 's' : ''} seleccionado{selectedTimeSlots.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={field.owner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(field.owner?.name || 'Sede')}&background=3b82f6&color=fff&size=128`}
                    alt={field.owner?.name || "Sede"}
                    className="w-14 h-14 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <p className="text-xs text-gray-600">Anfitrión</p>
                    <p className="text-lg font-bold text-gray-900">{field.owner?.name || "Sede"}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Shield className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">Verificado</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button className="p-2 bg-white hover:bg-blue-50 rounded-lg transition-colors border border-blue-200">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </button>
                  <button className="p-2 bg-white hover:bg-blue-50 rounded-lg transition-colors border border-blue-200">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Descripción
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {field.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-600" />
                Lo que ofrece este espacio
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-gray-800 font-medium text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm" id="reviews">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                Reseñas y Calificaciones
              </h2>
              
              {canchaId && <ReviewList idCancha={parseInt(canchaId)} />}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-5 shadow-xl border-2 border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Reserva tu espacio
              </h3>

              {/* Date Picker */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-900 mb-2">
                  📅 Fecha
                </label>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full px-3 py-2.5 text-sm font-medium border-2 border-blue-200 rounded-lg hover:border-blue-400 focus:border-blue-500 transition-all bg-white flex items-center justify-between group"
                >
                  <span className="text-gray-900">
                    {selectedDate.toLocaleDateString('es-MX', { 
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </button>
                
                {/* Inline Calendar */}
                {showCalendar && (
                  <div className="mt-3">
                    <CustomCalendar
                      selectedDate={selectedDate}
                      onDateSelect={(date) => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                        // Scroll suave hacia la sección de horarios disponibles
                        setTimeout(() => {
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }, 100);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Participants Selector - Más compacto */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-900 mb-2">
                  👥 Participantes
                </label>
                <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 rounded-lg p-2.5">
                  <button
                    onClick={() => setParticipants(Math.max(1, participants - 1))}
                    disabled={participants <= 1}
                    className={`p-1.5 rounded-lg transition-all ${
                      participants <= 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <div className="text-center">
                    <div className="text-xl font-extrabold text-gray-900">{participants}</div>
                    <div className="text-xs text-gray-500">de {field.capacity || 22}</div>
                  </div>
                  
                  <button
                    onClick={() => setParticipants(Math.min(field.capacity || 22, participants + 1))}
                    disabled={participants >= (field.capacity || 22)}
                    className={`p-1.5 rounded-lg transition-all ${
                      participants >= (field.capacity || 22)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Time Slots - Más compacto */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Horarios (puedes seleccionar múltiples)
                </label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8 text-blue-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-sm">Actualizando horarios...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 scrollbar-hide">
                    {field.availability.length > 0 ? (
                    field.availability.map((slot) => {
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
                          className={`p-2.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105 ring-2 ring-blue-400'
                              : slot.available
                              ? 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className={`font-bold ${!slot.available ? 'line-through' : ''}`}>
                            {timeSlot}
                          </div>
                          {slot.available && slot.price && (
                            <div className={`text-xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                              Bs {slot.price}
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-4 text-gray-500">
                      ✅ Todos los horarios disponibles
                    </div>
                  )}
                  </div>
                )}
              </div>

              {/* Summary - Solo si hay horarios seleccionados */}
              {selectedTimeSlots.length > 0 && (
                <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Subtotal ({selectedTimeSlots.length} hora{selectedTimeSlots.length > 1 ? 's' : ''})</span>
                    <span className="font-bold text-gray-900">Bs {totalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-600">Comisión (10%)</span>
                    <span className="font-bold text-gray-900">Bs {Math.round(totalPrice * 0.1)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <span className="font-bold text-sm text-gray-900">Total</span>
                    <span className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Bs {totalPrice + Math.round(totalPrice * 0.1)}
                    </span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleReservation}
                disabled={selectedTimeSlots.length === 0}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                  selectedTimeSlots.length > 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedTimeSlots.length > 0 ? '✨ Reservar ahora' : '⏰ Selecciona horario(s)'}
              </button>

              <p className="text-center text-xs text-gray-500 mt-2">
                🔒 No se realizará ningún cargo aún
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-in zoom-in duration-200">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">
                Confirmar Reserva
              </h3>
              <p className="text-gray-600">Revisa los detalles de tu reserva</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Cancha</p>
                <p className="font-bold text-gray-900">{field.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-bold text-gray-900">
                    {selectedDate.toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Participantes</p>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    {participants}
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Horarios seleccionados ({selectedTimeSlots.length})</p>
                <div className="space-y-1">
                  {selectedTimeSlots.map((timeSlot) => (
                    <p key={timeSlot} className="font-bold text-gray-900 text-sm">• {timeSlot}</p>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl text-white">
                <p className="text-sm text-blue-100">Total a pagar</p>
                <p className="font-extrabold text-3xl">
                  Bs {totalPrice + Math.round(totalPrice * 0.1)}
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  Incluye comisión de servicio (10%)
                </p>
              </div>
            </div>

            <button
              onClick={confirmBooking}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Confirmar y Pagar
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SportFieldDetailPage;
