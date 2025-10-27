import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Users, QrCode, Edit, Trash2, 
  CheckCircle, XCircle, AlertCircle, ChevronRight, Star,
  Download, Share2, Filter, Search
} from 'lucide-react';
import Footer from '../../../../shared/components/layout/Footer';
import { ROUTE_PATHS } from '../../../../constants';
import { getSportFieldImages } from '../../../../shared/utils/media';
import { formatPrice } from '../../../../shared/utils/format';
import reservaService, { cancelReserva } from '../../../../features/reservas/services/reserva.service';
import type { GetReservasUsuarioResponse } from '../../../../features/reservas/services/reserva.service';
import { registrarDeuda } from '../../../../features/pagos/services/pagos.service';
import { useAuth } from '../../../../features/auth/context/AuthContext';

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
  status: 'active' | 'completed' | 'cancelled';
  bookingCode: string;
  rating?: number;
  reviews?: number;
  paymentMethod: string;
  paymentStatus: string;
  qrCode?: string | null;
  pasarelaUrl?: string | null;
  transaccionId?: string | null;
}

type RawReservaUsuario = GetReservasUsuarioResponse['reservas'][number];

// No hay mocks: eliminados para evitar mostrar reservas de ejemplo en cualquier entorno

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    total: 0,
    activas: 0,
    completadas: 0,
    canceladas: 0,
  });

  const formatBolivianos = (value: number) =>
    formatPrice(Number.isFinite(value) ? value : 0);

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = booking.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.sedeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
            <CheckCircle className="h-3.5 w-3.5" />
            Activa
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

  const renderPaymentBadge = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === 'PAGADO') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle className="h-3.5 w-3.5" />
          Pagado
        </span>
      );
    }
    if (normalized === 'PENDIENTE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          <AlertCircle className="h-3.5 w-3.5" />
          Pendiente
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
        <AlertCircle className="h-3.5 w-3.5" />
        {normalized}
      </span>
    );
  };

  const handleEditBooking = (booking: Booking) => {
    navigate(`/field/${booking.fieldId}`, {
      state: {
        editMode: true,
        bookingData: booking
      }
    });
  };

  const handleDeleteBooking = (bookingId: string) => {
    setBookingToDelete(bookingId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;
    try {
      await cancelReserva(Number(bookingToDelete));
      setBookings(prev => prev.map(b => 
        b.id === bookingToDelete 
          ? { ...b, status: 'cancelled' as const }
          : b
      ));
    } catch (err) {
      console.error('Error al cancelar la reserva:', err);
      alert('No se pudo cancelar la reserva. Intenta nuevamente.');
    } finally {
      setShowDeleteModal(false);
      setBookingToDelete(null);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handlePayNow = async (booking: Booking) => {
    try {
      const descripcion = `${booking.fieldName} - ${booking.sedeName} - ${booking.date} ${booking.timeSlot}`;
      const resp = await registrarDeuda({ reserva_id: Number(booking.id), descripcion });
      const transaccion = resp?.transaccion;
      const pasarelaUrl = transaccion?.url_pasarela_pagos;
      const qrUrl = transaccion?.qr_simple_url;
      const nuevoEstadoPago = transaccion?.estado_pago
        ? String(transaccion.estado_pago).toUpperCase()
        : booking.paymentStatus;

      if (transaccion) {
        setBookings(prev =>
          prev.map(item =>
            item.id === booking.id
              ? {
                  ...item,
                  paymentStatus: nuevoEstadoPago,
                  pasarelaUrl: pasarelaUrl ?? item.pasarelaUrl ?? null,
                  transaccionId: transaccion.id_transaccion_libelula ?? item.transaccionId ?? null,
                  qrCode: qrUrl ?? item.qrCode ?? null,
                }
              : item,
          ),
        );
      }

      if (pasarelaUrl) {
        window.location.href = pasarelaUrl;
        return;
      }

      if (qrUrl) {
        window.open(qrUrl, '_blank', 'noopener');
      } else {
        alert('Se registro el pago, revisa el estado de tu reserva.');
      }
    } catch (err) {
      console.error('No se pudo iniciar el pago:', err);
      alert('No se pudo iniciar el pago. Intenta nuevamente.');
    }
  };

  const handleDownloadQR = (booking: Booking) => {
    if (booking.qrCode) {
      const link = document.createElement('a');
      link.href = booking.qrCode;
      link.download = `${booking.bookingCode || 'reserva'}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('El QR estara disponible cuando el pago se confirme.');
    }
  };

  const handleShareBooking = async (booking: Booking) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reserva ROGU - ${booking.fieldName}`,
          text: `Reserva confirmada: ${booking.fieldName}\nFecha: ${booking.date}\nCodigo: ${booking.bookingCode}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      alert('Funcion de compartir no disponible en este navegador');
    }
  };

  // Cargar reservas reales del backend (si hay token), si falla usar mocks
  const personaId = user?.id_persona;

  React.useEffect(() => {
    const load = async () => {
      if (!isLoggedIn || !personaId) { setLoading(false); return; }

      try {
        const resp = await reservaService.getReservasPorUsuario(personaId);
        const reservas = Array.isArray(resp?.reservas) ? resp.reservas : [];
        // Transformar reservas al shape de UI (simple mapping)
        const mapped: Booking[] = reservas.map((r: RawReservaUsuario) => {
          const estadoReserva = String(r.estado || '').toUpperCase();
          const estadoPago = String(r.estadoPago || r.pago?.estado || 'PENDIENTE').toUpperCase();
          const ultimaTransaccion = Array.isArray(r.transacciones) && r.transacciones.length > 0
            ? r.transacciones[0]
            : null;
          const qrFromPases = Array.isArray(r.pasesAcceso) && r.pasesAcceso.length > 0
            ? r.pasesAcceso[0]?.qr ?? null
            : null;

          let status: Booking['status'] = 'active';
          if (estadoReserva === 'CANCELADA') {
            status = 'cancelled';
          } else if (estadoReserva === 'COMPLETADA') {
            status = 'completed';
          }

          return {
            id: String(r.id_reserva),
            fieldId: String(r.id_cancha ?? r.cancha?.id_cancha ?? ''),
            fieldName: r.cancha?.nombre || `Cancha ${r.id_cancha}`,
            fieldImage:
              r.cancha?.fotos?.[0]?.url_foto || getSportFieldImages('football')[0],
            sedeName: r.cancha?.sede?.nombre || 'Sede desconocida',
            address: r.cancha?.sede?.direccion || 'Direccion no disponible',
            date: new Date(r.inicia_en).toLocaleDateString('es-ES'),
            timeSlot: `${new Date(r.inicia_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(r.termina_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            participants: Number(r.cantidad_personas || 1),
            price: Number(r.monto_base || 0),
            totalPaid: Number(r.monto_total || 0),
            status,
            bookingCode: ultimaTransaccion?.id_transaccion_libelula || `R-${r.id_reserva}`,
            rating: undefined,
            reviews: undefined,
            paymentMethod: r.metodoPago || 'LIBELULA',
            paymentStatus: estadoPago,
            qrCode: r.codigoQR || qrFromPases,
            pasarelaUrl:
              r.pago?.url_pasarela_pagos ||
              ultimaTransaccion?.url_pasarela_pagos ||
              null,
            transaccionId: ultimaTransaccion?.id_transaccion_libelula || null,
          };
        });

        setSummary({
          total: Number(resp?.total ?? mapped.length),
          activas:
            resp?.activas !== undefined
              ? Number(resp.activas)
              : mapped.filter((b) => b.status === 'active').length,
          completadas:
            resp?.completadas !== undefined
              ? Number(resp.completadas)
              : mapped.filter((b) => b.status === 'completed').length,
          canceladas:
            resp?.canceladas !== undefined
              ? Number(resp.canceladas)
              : mapped.filter((b) => b.status === 'cancelled').length,
        });

        setBookings(mapped);
      } catch (err) {
        console.warn('No se pudieron cargar reservas reales:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoggedIn, personaId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Mis Reservas </h1>
          <p className="text-xl text-blue-50">
            Gestiona todas tus reservas en un solo lugar
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Activas</p>
                <p className="text-3xl font-extrabold text-green-600">{summary.activas}</p>
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
                <p className="text-3xl font-extrabold text-blue-600">{summary.completadas}</p>
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
                <p className="text-3xl font-extrabold text-red-600">{summary.canceladas}</p>
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
                placeholder="Buscar por nombre, sede o codigo..."
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
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === 'active'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Activas
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron reservas</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Intenta con otros terminos de busqueda'
                : 'Aun no tienes reservas. Haz tu primera reserva ahora!'}
            </p>
            <button
              onClick={() => navigate(ROUTE_PATHS.HOME)}
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
                            <span className="text-xs text-gray-600">({booking.reviews} resenas)</span>
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
          <p className="text-2xl font-extrabold text-blue-600">{formatBolivianos(booking.totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Estado de pago:{' '}
            {renderPaymentBadge(booking.paymentStatus)}
          </p>
        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                          >
                            Ver detalles
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          {booking.status === 'active' && (
                            <>
                              {booking.paymentStatus !== 'PAGADO' && (
                                <button
                                  onClick={() => handlePayNow(booking)}
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-all"
                                  title="Pagar ahora"
                                >
                                  Pagar ahora
                                </button>
                              )}
                              <button
                                onClick={() => handleEditBooking(booking)}
                                className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-all"
                                title="Modificar reserva"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
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
      {selectedBooking && (
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
                    Codigo QR de acceso
                  </h3>
                  <div className="bg-white p-6 rounded-xl inline-block mx-auto shadow-lg w-full flex justify-center">
                    <QrCode className="h-48 w-48 text-gray-800" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Codigo de reserva</p>
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
                      <p className="text-xs text-gray-600">Ubicacion</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{selectedBooking.address}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                <h4 className="font-bold text-gray-900 mb-3">Informacion de pago</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Estado</span>
                  {renderPaymentBadge(selectedBooking.paymentStatus)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Costo de reserva</span>
                    <span className="font-semibold">{formatBolivianos(selectedBooking.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tarifa de servicio</span>
                    <span className="font-semibold">{formatBolivianos(Math.max(selectedBooking.totalPaid - selectedBooking.price, 0))}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-extrabold text-green-600 text-lg">{formatBolivianos(selectedBooking.totalPaid)}</span>
                  </div>
                  <p className="text-xs text-green-700 flex items-center gap-1 mt-2">
                    <CheckCircle className="h-3 w-3" />
                    Pagado via {selectedBooking.paymentMethod === 'card' ? 'Tarjeta' : 'QR'}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancelar reserva?</h3>
              <p className="text-gray-600">
                Esta accion cancelara tu reserva. De acuerdo a la politica de cancelacion, 
                {' '}si cancelas con menos de 24 horas de anticipacion, se aplicara un cargo del 50%.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
              >
                No, mantener
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all"
              >
                Si, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyBookingsPage;





