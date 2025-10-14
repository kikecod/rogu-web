import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Share2, Heart, ChevronLeft, ChevronRight,
  Clock, Calendar, Shield, Sparkles, Check, X,
  MessageCircle, Phone, Users, Plus, Minus
} from 'lucide-react';
import Footer from '../components/Footer';
import CustomCalendar from '../components/CustomCalendar';
import type { SportField } from '../types';
import { getSportFieldImages, generateAvatarUrl } from '../utils/helpers';

// Mock data temporales - agregar estos datos adicionales
const mockLocation = {
  address: 'Av. Revolución 1234, Col. San Ángel',
  city: 'Ciudad de México',
  coordinates: { lat: 19.4326, lng: -99.1332 }
};

const mockOwner = {
  id: '1',
  name: 'Centro Deportivo Elite',
  avatar: generateAvatarUrl('Centro Deportivo Elite')
};

// Mock data - En producción vendría de una API
const mockField: SportField = {
  id: '1',
  sedeId: '1',
  name: 'Cancha de Fútbol Premium Elite',
  description: 'Cancha de fútbol profesional con césped sintético de última generación. Perfecta para partidos competitivos o recreativos. Cuenta con iluminación LED de alta calidad para juegos nocturnos y un sistema de drenaje excepcional que permite jugar incluso en días lluviosos.',
  images: getSportFieldImages('football'),
  price: 150,
  sport: 'football',
  amenities: [
    'Estacionamiento gratuito',
    'Vestidores equipados',
    'Duchas con agua caliente',
    'Iluminación LED profesional',
    'Árbitro disponible',
    'WiFi gratuito',
    'Cafetería',
    'Tienda deportiva',
    'Área de espera',
    'Seguridad 24/7'
  ],
  availability: [],
  rating: 4.9,
  reviews: 127
};

// Horarios disponibles
const availableTimeSlots = [
  { time: '06:00 - 08:00', available: true, price: 120 },
  { time: '08:00 - 10:00', available: true, price: 130 },
  { time: '10:00 - 12:00', available: false, price: 140 },
  { time: '12:00 - 14:00', available: true, price: 140 },
  { time: '14:00 - 16:00', available: true, price: 150 },
  { time: '16:00 - 18:00', available: false, price: 160 },
  { time: '18:00 - 20:00', available: true, price: 180 },
  { time: '20:00 - 22:00', available: true, price: 200 },
];

const SportFieldDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [participants, setParticipants] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === mockField.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? mockField.images.length - 1 : prev - 1
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
    if (!selectedDate || selectedTimeSlots.length === 0) return;
    
    // Calcular precio total sumando todos los horarios seleccionados
    const totalPrice = selectedTimeSlots.reduce((sum, timeSlot) => {
      const slot = availableTimeSlots.find(s => s.time === timeSlot);
      return sum + (slot?.price || mockField.price);
    }, 0);
    
    // Navegar al checkout con los detalles de la reserva
    navigate('/checkout', {
      state: {
        bookingDetails: {
          fieldName: mockField.name,
          fieldImage: mockField.images[0],
          sedeName: mockOwner.name,
          address: mockLocation.address + ', ' + mockLocation.city,
          date: selectedDate.toLocaleDateString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          participants: participants,
          timeSlot: selectedTimeSlots.join(', '),
          price: totalPrice,
          rating: mockField.rating,
          reviews: mockField.reviews
        }
      }
    });
  };

  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      football: '⚽',
      basketball: '🏀',
      tennis: '🎾',
      volleyball: '🏐',
      paddle: '🏓',
      hockey: '🏒',
    };
    return icons[sport] || '⚽';
  };

  // Calcular precio total de todos los horarios seleccionados
  const totalPrice = selectedTimeSlots.reduce((sum, timeSlot) => {
    const slot = availableTimeSlots.find(s => s.time === timeSlot);
    return sum + (slot?.price || mockField.price);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Sticky Header */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Volver</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-all ${
                isFavorite 
                  ? 'bg-red-50 text-red-500' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
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
                src={mockField.images[currentImageIndex]}
                alt={mockField.name}
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
                {currentImageIndex + 1} / {mockField.images.length}
              </div>

              {/* Sport Badge */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                {getSportIcon(mockField.sport)} {mockField.sport.charAt(0).toUpperCase() + mockField.sport.slice(1)}
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="hidden lg:flex flex-col gap-3">
              {mockField.images.slice(0, 4).map((img, idx) => (
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                {mockField.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-5">
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
                  <span className="font-bold text-blue-900 text-sm">{mockField.rating}</span>
                  <span className="text-xs">({mockField.reviews} reseñas)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-xs">{mockLocation.address}</span>
                </div>
              </div>

              {/* Price Section - Movido aquí */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 mb-5">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {selectedTimeSlots.length > 0 ? `$${totalPrice}` : `$${mockField.price}`}
                  </span>
                  <span className="text-base text-gray-600">
                    {selectedTimeSlots.length > 0 ? 'MXN total' : 'MXN / hora'}
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
                    src={mockOwner.avatar}
                    alt={mockOwner.name}
                    className="w-14 h-14 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <p className="text-xs text-gray-600">Anfitrión</p>
                    <p className="text-lg font-bold text-gray-900">{mockOwner.name}</p>
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
                {mockField.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-600" />
                Lo que ofrece este espacio
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockField.amenities.map((amenity, idx) => (
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
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  {mockField.rating} · {mockField.reviews} reseñas
                </h2>
              </div>
              
              {/* Sample Reviews */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-100 last:border-0 pb-3">
                    <div className="flex items-center gap-2.5 mb-2">
                      <img
                        src={generateAvatarUrl(`Usuario ${i}`)}
                        alt={`Usuario ${i}`}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Usuario {i}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">Hace {i} semana(s)</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Excelente cancha, muy bien mantenida. Las instalaciones están impecables y el personal es muy amable.
                    </p>
                  </div>
                ))}
              </div>
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
                  </div>
                  
                  <button
                    onClick={() => setParticipants(Math.min(22, participants + 1))}
                    disabled={participants >= 22}
                    className={`p-1.5 rounded-lg transition-all ${
                      participants >= 22
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
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 scrollbar-hide">
                  {availableTimeSlots.map((slot) => {
                    const isSelected = selectedTimeSlots.includes(slot.time);
                    return (
                      <button
                        key={slot.time}
                        onClick={() => {
                          if (!slot.available) return;
                          setSelectedTimeSlots(prev => 
                            isSelected 
                              ? prev.filter(t => t !== slot.time)
                              : [...prev, slot.time]
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
                          {slot.time}
                        </div>
                        {slot.available && (
                          <div className={`text-xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                            ${slot.price}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary - Solo si hay horarios seleccionados */}
              {selectedTimeSlots.length > 0 && (
                <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Subtotal ({selectedTimeSlots.length} hora{selectedTimeSlots.length > 1 ? 's' : ''})</span>
                    <span className="font-bold text-gray-900">${totalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-600">Comisión (10%)</span>
                    <span className="font-bold text-gray-900">${Math.round(totalPrice * 0.1)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <span className="font-bold text-sm text-gray-900">Total</span>
                    <span className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ${totalPrice + Math.round(totalPrice * 0.1)}
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

        {/* Location Map Placeholder */}
        <div className="mt-10 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Ubicación
          </h2>
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 h-64 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-700 font-medium text-base">{mockLocation.address}</p>
              <p className="text-gray-600 text-sm">{mockLocation.city}</p>
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
                <p className="font-bold text-gray-900">{mockField.name}</p>
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
                  ${totalPrice + Math.round(totalPrice * 0.1)} MXN
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
