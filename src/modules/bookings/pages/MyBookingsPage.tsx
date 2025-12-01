import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, Edit, Trash2,
  CheckCircle, XCircle, AlertCircle, ChevronRight, Star,
  Download, Share2, Search, CreditCard,
  ArrowUpRight, History, Wallet
} from 'lucide-react';
import Footer from '@/components/Footer';
import EditBookingModal from '../components/EditBookingModal';
import CancelBookingModal from '../components/CancelBookingModal';
import CreateReviewModal from '@/reviews/components/CreateReviewModal';
import { fetchReservasByUserId, fetchCanchaImage } from '@/core/lib/helpers';
import { useAuth } from '@/auth/hooks/useAuth';
import { reviewService } from '@/reviews/services/reviewService';
import { useAccessPass } from '../hooks/useAccessPass';
import { ROUTES } from '@/config/routes';
import type { ApiReservaUsuario, Booking } from '../types/booking.types';

// Helper functions
const parseDateAsLocal = (dateString: string): Date => {
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateLocal = (dateString: string): string => {
  const date = parseDateAsLocal(dateString);
  return date.toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/La_Paz'
  });
};

type TabId = 'all' | 'upcoming' | 'completed' | 'cancelled';

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
  const [pendingReviews, setPendingReviews] = useState<Set<string>>(new Set());

  // Initial Load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

        const reservasData = await fetchReservasByUserId(user.idUsuario);

        const imagePromises = reservasData.map(reserva =>
          fetchCanchaImage(reserva.cancha.idCancha)
        );
        const images = await Promise.all(imagePromises);

        const bookingsConverted: Booking[] = reservasData.map((reserva: ApiReservaUsuario, index: number) => {
          let status: 'active' | 'completed' | 'cancelled' | 'pending' = 'active';

          if (reserva.estado === 'Cancelada') {
            status = 'cancelled';
          } else if (reserva.completadaEn) {
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

        // Sort by date (newest first)
        bookingsConverted.sort((a, b) => {
          // Simple string comparison for now as date format is localized
          // Ideally we should keep the raw date for sorting
          return b.id.localeCompare(a.id);
        });

        setBookings(bookingsConverted);
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar las reservas');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user?.idUsuario]);

  // Load Pending Reviews
  useEffect(() => {
    const loadPendingReviews = async () => {
      if (user) {
        try {
          const pending = await reviewService.getPendingBookingsToReview();
          const pendingIds = new Set(pending.map(p => p.idReserva.toString()));
          setPendingReviews(pendingIds);
        } catch (err) {
          console.error('Error loading pending reviews:', err);
        }
      }
    };
    loadPendingReviews();
  }, [user, bookings]);

  // Filtering
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.sedeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeTab) {
      case 'upcoming':
        return booking.status === 'active' || booking.status === 'pending';
      case 'completed':
        return booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  // Actions
  const handleEditBooking = (booking: Booking) => {
    setBookingToEdit(booking);
    setSelectedBooking(null);
    setShowEditModal(true);
  };

  const handleDeleteBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setShowDeleteModal(true);
    }
  };

  const handlePayPending = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const bookingDetails = {
      fieldName: booking.fieldName,
      fieldImage: booking.fieldImage,
      sedeName: booking.sedeName,
      address: '',
      date: booking.date,
      participants: booking.participants,
      timeSlot: booking.timeSlot,
      price: booking.price,
      rating: booking.rating || 0,
      reviews: booking.reviews || 0
    };

    const selectedTimeSlots = [booking.timeSlot];
    const dateParts = booking.date.split(' de ');
    const months: { [key: string]: number } = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
      'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };

    let selectedDate = new Date();
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0]);
      const month = months[dateParts[1].toLowerCase()];
      const year = parseInt(dateParts[2]);
      selectedDate = new Date(year, month, day);
    }

    navigate(ROUTES.checkout, {
      state: {
        bookingDetails,
        idReserva: parseInt(booking.id),
        fieldId: booking.fieldId,
        selectedDate,
        selectedTimeSlots,
        participants: booking.participants,
        totalPrice: booking.price
      }
    });
  };

  const handleLeaveReview = (booking: Booking) => {
    setBookingToReview(booking);
    setShowReviewModal(true);
  };

  const canLeaveReview = (booking: Booking): boolean => {
    return booking.status === 'completed' && pendingReviews.has(booking.id);
  };

  // Callbacks
  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setBookingToEdit(null);
    // Reload logic would go here (simplified to just reload page or trigger re-fetch)
    window.location.reload();
  };

  const handleCancelSuccess = async () => {
    setShowDeleteModal(false);
    setSelectedBooking(null);
    window.location.reload();
  };

  const handleReviewSuccess = async () => {
    setShowReviewModal(false);
    setBookingToReview(null);
    window.location.reload();
  };

  // UI Components
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">
            <AlertCircle className="h-3.5 w-3.5" />
            Pendiente de pago
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
            <CheckCircle className="h-3.5 w-3.5" />
            Confirmada
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
            <History className="h-3.5 w-3.5" />
            Completada
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
            <XCircle className="h-3.5 w-3.5" />
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  const QRSection: React.FC<{ booking: Booking }> = ({ booking }) => {
    const { loading, qrImageUrl, downloadQR, shareQR } = useAccessPass(
      booking.status === 'active' ? parseInt(booking.id) : null
    );

    if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>;
    if (!qrImageUrl) return <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center text-sm">No se pudo cargar el código QR</div>;

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Código de Acceso</h3>
        <div className="bg-white p-4 rounded-xl inline-block shadow-md border border-gray-100 mb-4">
          <img src={qrImageUrl} alt="QR" className="w-48 h-48" />
        </div>
        <p className="text-2xl font-mono font-bold text-gray-900 mb-6">{booking.bookingCode}</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={downloadQR} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <Download className="h-4 w-4" /> Descargar
          </button>
          <button onClick={() => shareQR(booking.fieldName)} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <Share2 className="h-4 w-4" /> Compartir
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Mis Reservas</h1>
              <p className="text-gray-500 text-sm mt-1">Gestiona tus partidos y actividades deportivas</p>
            </div>
            <button
              onClick={() => navigate(ROUTES.home)}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <ArrowUpRight className="h-4 w-4" />
              Reservar nueva cancha
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-8 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'upcoming', label: 'Próximas' },
              { id: 'completed', label: 'Completadas' },
              { id: 'cancelled', label: 'Canceladas' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`
                            px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                            ${activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                        `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de cancha, sede o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron reservas</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm
                ? 'No hay resultados para tu búsqueda. Intenta con otros términos.'
                : 'Aún no tienes reservas en esta categoría. ¡Explora las canchas y reserva tu próximo partido!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="group bg-white rounded-2xl p-2 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer flex flex-col md:flex-row gap-4 md:items-center"
              >
                {/* Image */}
                <div className="relative w-full md:w-48 h-48 md:h-32 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={booking.fieldImage}
                    alt={booking.fieldName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={booking.status} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-2 md:p-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">
                        {booking.sedeName}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {booking.fieldName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {booking.timeSlot}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          {booking.participants} pers.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-1">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total pagado</p>
                        <p className="text-xl font-extrabold text-gray-900">Bs {booking.totalPaid}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-2 md:pr-4 flex md:flex-col justify-center">
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 group-hover:text-blue-600 transition-colors">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBooking && !showDeleteModal && !showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative h-48 bg-gray-900">
              <img src={selectedBooking.fieldImage} alt={selectedBooking.fieldName} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <div className="absolute bottom-6 left-6 right-6">
                <StatusBadge status={selectedBooking.status} />
                <h2 className="text-3xl font-bold text-white mt-2">{selectedBooking.fieldName}</h2>
                <p className="text-gray-200">{selectedBooking.sedeName}</p>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* QR Section for Active Bookings */}
              {selectedBooking.status === 'active' && (
                <QRSection booking={selectedBooking} />
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Detalles</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha</p>
                        <p className="font-semibold text-gray-900">{selectedBooking.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Horario</p>
                        <p className="font-semibold text-gray-900">{selectedBooking.timeSlot}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Participantes</p>
                        <p className="font-semibold text-gray-900">{selectedBooking.participants} personas</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Pago</h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 text-sm">Monto total</span>
                      <span className="text-xl font-extrabold text-gray-900">Bs {selectedBooking.totalPaid}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CreditCard className="h-4 w-4" />
                      <span>Pagado con {selectedBooking.paymentMethod === 'card' ? 'Tarjeta' : 'QR'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={() => handlePayPending(selectedBooking.id)}
                    className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-200"
                  >
                    <Wallet className="h-5 w-5" />
                    Completar Pago
                  </button>
                )}

                {selectedBooking.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleEditBooking(selectedBooking)}
                      className="flex-1 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="h-5 w-5" />
                      Modificar
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(selectedBooking.id)}
                      className="flex-1 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-5 w-5" />
                      Cancelar
                    </button>
                  </>
                )}

                {canLeaveReview(selectedBooking) && (
                  <button
                    onClick={() => handleLeaveReview(selectedBooking)}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  >
                    <Star className="h-5 w-5" />
                    Dejar Reseña
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
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
