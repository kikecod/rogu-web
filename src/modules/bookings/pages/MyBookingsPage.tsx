import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Users, QrCode, Edit, Trash2, 
  CheckCircle, XCircle, AlertCircle, ChevronRight, Star,
  Download, Share2, Filter, Search
} from 'lucide-react';
import Footer from '@/components/Footer';
import EditBookingModal from '../components/EditBookingModal';
import CancelBookingModal from '../components/CancelBookingModal';
import CreateReviewModal from '@/reviews/components/CreateReviewModal';
import { fetchReservasByUserId, fetchCanchaImage } from '@/core/lib/helpers';
import { useAuth } from '@/auth/hooks/useAuth';
import { reviewService } from '@/reviews/services/reviewService';
import type { ApiReservaUsuario } from '../types/booking.types';


interface Booking {
  id: string;
  fieldId: string;
  fieldName: string;
  fieldImage: string;
  sedeName: string;
  address: string;
  date: string;
  timeSlot: string;
  participants: number;
  price: number;
  totalPaid: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  bookingCode: string;
  rating?: number;
  reviews?: number;
  paymentMethod: 'card' | 'qr';
  completadaEn?: string | null;
}

/**
 * Parsea una fecha en formato ISO sin conversión de zona horaria
 * Asume que la fecha viene en hora de Bolivia (GMT-4)
 */
const parseDateAsLocal = (dateString: string): Date => {
  // Si la fecha viene como "2025-11-03", la parseamos directamente como fecha local
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Formatea una fecha como string legible en español
 */
const formatDateLocal = (dateString: string): string => {
  const date = parseDateAsLocal(dateString);
  return date.toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/La_Paz'
  });
};

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  
  // Estados para sistema de reseñas
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
  const [pendingReviews, setPendingReviews] = useState<Set<string>>(new Set());

  // Scroll hacia arriba al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Cargar reservas del usuario
  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.idUsuario) {
        setError('Debes iniciar sesión para ver tus reservas');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Cargando reservas del usuario:', user.idUsuario);
        console.log('👤 Usuario completo:', user);
        
        const reservasData = await fetchReservasByUserId(user.idUsuario);
        console.log('✅ Reservas obtenidas del API:', reservasData);
        
        // Cargar las imágenes de todas las canchas en paralelo
        console.log('🖼️ Cargando imágenes de las canchas...');
        const imagePromises = reservasData.map(reserva => 
          fetchCanchaImage(reserva.cancha.idCancha)
        );
        const images = await Promise.all(imagePromises);
        console.log('✅ Imágenes cargadas:', images.length);
        
        // Convertir las reservas del API al formato del componente
        const bookingsConverted: Booking[] = reservasData.map((reserva: ApiReservaUsuario, index: number) => {
          // Mapear estados del backend a estados del frontend SIN LÓGICA ADICIONAL
          let status: 'active' | 'completed' | 'cancelled' | 'pending' = 'active';
          
          // Usar DIRECTAMENTE el estado que viene del backend
          if (reserva.estado === 'Cancelada') {
            status = 'cancelled';
          } else if (reserva.completadaEn) {
            status = 'completed';
          } else if (reserva.estado === 'Pendiente') {
            status = 'pending';
          } else if (reserva.estado === 'Confirmada') {
            status = 'active';
          }

          console.log('📊 Reserva ID:', reserva.idReserva, '| Estado Backend:', reserva.estado, '| CompletadaEn:', reserva.completadaEn, '| Estado Frontend:', status);

          return {
            id: reserva.idReserva.toString(),
            fieldId: reserva.cancha.idCancha.toString(),
            fieldName: reserva.cancha.nombre,
            fieldImage: images[index], // Usar la imagen cargada correspondiente
            sedeName: reserva.cancha.sede.nombre,
            address: '', // El API no proporciona dirección
            date: formatDateLocal(reserva.fecha),
            timeSlot: `${reserva.horaInicio.substring(0, 5)} - ${reserva.horaFin.substring(0, 5)}`,
            participants: reserva.cantidadPersonas,
            price: reserva.montoTotal,
            totalPaid: reserva.montoTotal,
            status,
            bookingCode: `ROGU-${reserva.idReserva.toString().padStart(8, '0')}`,
            paymentMethod: 'card' as const,
            completadaEn: reserva.completadaEn
          };
        });
        
        setBookings(bookingsConverted);
        console.log('✅ Reservas cargadas:', bookingsConverted);
      } catch (err) {
        console.error('❌ Error al cargar reservas:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar las reservas');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user?.idUsuario]);

  // Cargar reservas pendientes de reseñar
  useEffect(() => {
    const loadPendingReviews = async () => {
      try {
        const pending = await reviewService.getPendingBookingsToReview();
        const pendingIds = new Set(pending.map(p => p.idReserva.toString()));
        setPendingReviews(pendingIds);
      } catch (err) {
        console.error('Error loading pending reviews:', err);
      }
    };

    if (user) {
      loadPendingReviews();
    }
  }, [user, bookings]); // Recargar cuando cambien las reservas

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = booking.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.sedeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
            <AlertCircle className="h-3.5 w-3.5" />
            Pendiente
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
            <CheckCircle className="h-3.5 w-3.5" />
            Confirmada
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
            <CheckCircle className="h-3.5 w-3.5" />
            Completada
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
            <XCircle className="h-3.5 w-3.5" />
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setBookingToEdit(booking);
    setSelectedBooking(null); // Cerrar modal de detalles
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setBookingToEdit(null);
    // Recargar las reservas
    if (user?.idUsuario) {
      setLoading(true);
      try {
        const reservasData = await fetchReservasByUserId(user.idUsuario);
        
        // Cargar las imágenes de todas las canchas en paralelo
        const imagePromises = reservasData.map(reserva => 
          fetchCanchaImage(reserva.cancha.idCancha)
        );
        const images = await Promise.all(imagePromises);
        
        const bookingsConverted: Booking[] = reservasData.map((reserva: ApiReservaUsuario, index: number) => {
          // Determinar el estado de la reserva basado en el backend
          let status: 'active' | 'completed' | 'cancelled' | 'pending' = 'active';
          
          // Mapear estados del backend a estados del frontend
          if (reserva.estado === 'Cancelada') {
            status = 'cancelled';
          } else if (reserva.completadaEn) {
            // Si tiene completadaEn, está completada (independiente del estado)
            status = 'completed';
          } else if (reserva.estado === 'Pendiente') {
            status = 'pending';
          } else if (reserva.estado === 'Confirmada') {
            status = 'active';
          }

          return {
            id: reserva.idReserva.toString(),
            fieldId: reserva.cancha.idCancha.toString(),
            fieldName: reserva.cancha.nombre,
            fieldImage: images[index],
            sedeName: reserva.cancha.sede.nombre,
            address: '',
            date: formatDateLocal(reserva.fecha),
            timeSlot: `${reserva.horaInicio.substring(0, 5)} - ${reserva.horaFin.substring(0, 5)}`,
            participants: reserva.cantidadPersonas,
            price: reserva.montoTotal,
            totalPaid: reserva.montoTotal,
            status,
            bookingCode: `ROGU-${reserva.idReserva.toString().padStart(8, '0')}`,
            paymentMethod: 'card' as const,
            completadaEn: reserva.completadaEn
          };
        });
        
        setBookings(bookingsConverted);
      } catch (err) {
        console.error('Error recargando reservas:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking); // Actualizar selectedBooking para el modal de cancelación
      setShowDeleteModal(true);
    }
  };

  const handleCancelSuccess = async () => {
    setShowDeleteModal(false);
    setSelectedBooking(null);
    
    // Recargar las reservas
    if (user?.idUsuario) {
      setLoading(true);
      try {
        const reservasData = await fetchReservasByUserId(user.idUsuario);
        
        // Cargar las imágenes de todas las canchas en paralelo
        const imagePromises = reservasData.map(reserva => 
          fetchCanchaImage(reserva.cancha.idCancha)
        );
        const images = await Promise.all(imagePromises);
        
        const bookingsConverted: Booking[] = reservasData.map((reserva: ApiReservaUsuario, index: number) => {
          // Determinar el estado de la reserva basado en el backend
          let status: 'active' | 'completed' | 'cancelled' | 'pending' = 'active';
          
          // Mapear estados del backend a estados del frontend
          if (reserva.estado === 'Cancelada') {
            status = 'cancelled';
          } else if (reserva.completadaEn) {
            // Si tiene completadaEn, está completada (independiente del estado)
            status = 'completed';
          } else if (reserva.estado === 'Pendiente') {
            status = 'pending';
          } else if (reserva.estado === 'Confirmada') {
            status = 'active';
          }

          return {
            id: reserva.idReserva.toString(),
            fieldId: reserva.cancha.idCancha.toString(),
            fieldName: reserva.cancha.nombre,
            fieldImage: images[index],
            sedeName: reserva.cancha.sede.nombre,
            address: '',
            date: formatDateLocal(reserva.fecha),
            timeSlot: `${reserva.horaInicio.substring(0, 5)} - ${reserva.horaFin.substring(0, 5)}`,
            participants: reserva.cantidadPersonas,
            price: reserva.montoTotal,
            totalPaid: reserva.montoTotal,
            status,
            bookingCode: `ROGU-${reserva.idReserva.toString().padStart(8, '0')}`,
            paymentMethod: 'card' as const,
            completadaEn: reserva.completadaEn
          };
        });
        
        setBookings(bookingsConverted);
      } catch (err) {
        console.error('Error recargando reservas:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleDownloadQR = (booking: Booking) => {
    alert(`Descargando QR para: ${booking.bookingCode}`);
  };

  const handleShareBooking = async (booking: Booking) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reserva ROGU - ${booking.fieldName}`,
          text: `Reserva confirmada: ${booking.fieldName}\nFecha: ${booking.date}\nCódigo: ${booking.bookingCode}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      alert('Función de compartir no disponible en este navegador');
    }
  };

  // Funciones para sistema de reseñas
  const handleLeaveReview = (booking: Booking) => {
    setBookingToReview(booking);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = async () => {
    setShowReviewModal(false);
    setBookingToReview(null);
    
    // Recargar reservas pendientes
    try {
      const pending = await reviewService.getPendingBookingsToReview();
      const pendingIds = new Set(pending.map(p => p.idReserva.toString()));
      setPendingReviews(pendingIds);
    } catch (err) {
      console.error('Error reloading pending reviews:', err);
    }
  };

  const canLeaveReview = (booking: Booking): boolean => {
    return booking.status === 'completed' && pendingReviews.has(booking.id);
  };

  // Estados de loading y error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar reservas</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Mis Reservas 🏆</h1>
          <p className="text-xl text-blue-50">
            Gestiona todas tus reservas en un solo lugar
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                <p className="text-3xl font-extrabold text-yellow-600">{pendingBookings}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Confirmadas</p>
                <p className="text-3xl font-extrabold text-green-600">{activeBookings}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completadas</p>
                <p className="text-3xl font-extrabold text-blue-600">{completedBookings}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Canceladas</p>
                <p className="text-3xl font-extrabold text-red-600">{cancelledBookings}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-100 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, sede o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === 'pending'
                      ? 'bg-yellow-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === 'active'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Confirmadas
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === 'completed'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Completadas
                </button>
                <button
                  onClick={() => setFilterStatus('cancelled')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === 'cancelled'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Canceladas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron reservas</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Aún no tienes reservas. ¡Haz tu primera reserva ahora!'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Explorar canchas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image */}
                    <div className="lg:w-48 h-40 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={booking.fieldImage}
                        alt={booking.fieldName}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 truncate">
                              {booking.fieldName}
                            </h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{booking.sedeName}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
                            <span className="font-bold text-sm">{booking.rating}</span>
                            <span className="text-xs text-gray-600">({booking.reviews} reseñas)</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700 font-medium">{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700 font-medium">{booking.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700 font-medium">{booking.participants} personas</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <QrCode className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700 font-medium font-mono">{booking.bookingCode}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="truncate">{booking.address}</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">Total pagado</p>
                          <p className="text-2xl font-extrabold text-blue-600">{booking.totalPaid} BS</p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                          >
                            Ver detalles
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          {/* Botón Dejar Reseña - Solo para reservas completadas pendientes */}
                          {canLeaveReview(booking) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLeaveReview(booking);
                              }}
                              className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold text-sm hover:bg-yellow-600 transition-all flex items-center gap-2"
                              title="Dejar reseña"
                            >
                              <Star className="h-4 w-4 fill-white" />
                              Dejar Reseña
                            </button>
                          )}

                          {/* Botones para reservas activas */}
                          {booking.status === 'active' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditBooking(booking);
                                }}
                                className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-all"
                                title="Modificar reserva"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBooking(booking.id);
                                }}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                                title="Cancelar reserva"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && !showDeleteModal && !showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-extrabold">Detalles de Reserva</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              {getStatusBadge(selectedBooking.status)}
            </div>

            <div className="p-6 space-y-5">
              {/* Field Image */}
              <div className="rounded-xl overflow-hidden">
                <img
                  src={selectedBooking.fieldImage}
                  alt={selectedBooking.fieldName}
                  className="w-full h-48 object-cover"
                />
              </div>

              {/* QR Code for Active Bookings */}
              {selectedBooking.status === 'active' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                    Código QR de acceso
                  </h3>
                  <div className="bg-white p-6 rounded-xl inline-block mx-auto shadow-lg w-full flex justify-center">
                    <QrCode className="h-48 w-48 text-gray-800" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Código de reserva</p>
                    <p className="text-xl font-mono font-bold text-gray-900">{selectedBooking.bookingCode}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => handleDownloadQR(selectedBooking)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      Descargar
                    </button>
                    <button
                      onClick={() => handleShareBooking(selectedBooking)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                    >
                      <Share2 className="h-4 w-4" />
                      Compartir
                    </button>
                  </div>
                </div>
              )}

              {/* Booking Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">{selectedBooking.fieldName}</h3>
                <p className="text-gray-600">{selectedBooking.sedeName}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-gray-600">Fecha</p>
                    </div>
                    <p className="font-bold text-gray-900">{selectedBooking.date}</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-gray-600">Horario</p>
                    </div>
                    <p className="font-bold text-gray-900">{selectedBooking.timeSlot}</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-gray-600">Participantes</p>
                    </div>
                    <p className="font-bold text-gray-900">{selectedBooking.participants} personas</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-gray-600">Ubicación</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{selectedBooking.address}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                <h4 className="font-bold text-gray-900 mb-3">Información de pago</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Costo de reserva</span>
                    <span className="font-semibold">{selectedBooking.price} BS</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tarifa de servicio</span>
                    <span className="font-semibold">{(selectedBooking.totalPaid - selectedBooking.price).toFixed(2)} BS</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-extrabold text-green-600 text-lg">{selectedBooking.totalPaid} BS</span>
                  </div>
                  <p className="text-xs text-green-700 flex items-center gap-1 mt-2">
                    <CheckCircle className="h-3 w-3" />
                    Pagado vía {selectedBooking.paymentMethod === 'card' ? 'Tarjeta' : 'QR'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {selectedBooking.status === 'active' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedBooking(null);
                      handleEditBooking(selectedBooking);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-all"
                  >
                    <Edit className="h-5 w-5" />
                    Modificar reserva
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(null);
                      handleDeleteBooking(selectedBooking.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                    Cancelar reserva
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de cancelación */}
      {showDeleteModal && selectedBooking && (
        <CancelBookingModal
          booking={{
            id: selectedBooking.id,
            fieldName: selectedBooking.fieldName,
            date: selectedBooking.date,
            timeSlot: selectedBooking.timeSlot
          }}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={handleCancelSuccess}
        />
      )}

      {/* Modal de edición */}
      {showEditModal && bookingToEdit && user?.idUsuario && (
        <EditBookingModal
          booking={bookingToEdit}
          onClose={() => {
            setShowEditModal(false);
            setBookingToEdit(null);
          }}
          onSuccess={handleEditSuccess}
          userId={user.idUsuario}
        />
      )}

      {/* Modal de reseña */}
      {showReviewModal && bookingToReview && (
        <CreateReviewModal
          idReserva={parseInt(bookingToReview.id)}
          nombreCancha={bookingToReview.fieldName}
          onSuccess={handleReviewSuccess}
          onClose={() => {
            setShowReviewModal(false);
            setBookingToReview(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default MyBookingsPage;
