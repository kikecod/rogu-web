import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, AlertCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchReservasByFecha, fetchCanchaById, updateReserva } from '@/core/lib/helpers';
import type { UpdateReservaRequest } from '../types/booking.types';
import CustomCalendar from './CustomCalendar';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price: number;
}

interface EditBookingModalProps {
  booking: {
    id: string;
    fieldId: string;
    fieldName: string;
    date: string;
    timeSlot: string;
    participants: number;
    price: number;
    totalPaid: number;
  };
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  booking,
  onClose,
  onSuccess,
  userId
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [participants, setParticipants] = useState(booking.participants);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldCapacity, setFieldCapacity] = useState<number>(22);
  const [pricePerHour, setPricePerHour] = useState(booking.price);

  // Parse original booking date
  useEffect(() => {
    const parseBookingDate = () => {
      try {
        const months: { [key: string]: number } = {
          'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
          'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
        };

        const parts = booking.date.toLowerCase().split(' de ');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = months[parts[1]];
          const year = parseInt(parts[2]);
          setSelectedDate(new Date(year, month, day));
        }
      } catch (err) {
        console.error('Error parsing date:', err);
      }
    };

    parseBookingDate();

    // Parse original slots
    const [start, end] = booking.timeSlot.split(' - ');
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    const slots: string[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    setSelectedSlots(slots);
  }, [booking]);

  // Load field info
  useEffect(() => {
    const loadFieldInfo = async () => {
      try {
        const field = await fetchCanchaById(booking.fieldId);
        setFieldCapacity(field.capacity || 22);
        setPricePerHour(field.price);
      } catch (err) {
        console.error('Error loading field info:', err);
      }
    };

    loadFieldInfo();
  }, [booking.fieldId]);

  // Load available slots
  useEffect(() => {
    const loadAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const field = await fetchCanchaById(booking.fieldId);
        const reservas = await fetchReservasByFecha(booking.fieldId, selectedDate);

        const reservasSinActual = reservas.filter(r => r.idReserva.toString() !== booking.id);

        const slots: TimeSlot[] = [];
        const openHour = parseInt(field.openingHours?.open.split(':')[0] || '8');
        const closeHour = parseInt(field.openingHours?.close.split(':')[0] || '22');

        for (let hour = openHour; hour < closeHour; hour++) {
          const startTime = `${hour.toString().padStart(2, '0')}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

          const isReserved = reservasSinActual.some(reserva => {
            if (reserva.estado === 'Cancelada') return false;
            const reservaStart = reserva.horaInicio.substring(0, 5);
            const reservaEnd = reserva.horaFin.substring(0, 5);
            return startTime >= reservaStart && startTime < reservaEnd;
          });

          slots.push({
            startTime,
            endTime,
            available: !isReserved,
            price: field.price
          });
        }

        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error loading slots:', err);
        setError('Error al cargar horarios disponibles');
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [selectedDate, booking.fieldId, booking.id]);

  const validateChanges = (): string | null => {
    const now = new Date();
    const bookingDate = new Date(selectedDate);

    if (selectedSlots.length > 0) {
      const [hour, minute] = selectedSlots[0].split(':').map(Number);
      bookingDate.setHours(hour, minute, 0, 0);
    }

    if (bookingDate < now) return 'No se pueden modificar reservas pasadas';

    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilBooking < 24) return 'Las modificaciones deben hacerse con al menos 24 horas de anticipación';

    if (selectedSlots.length === 0) return 'Debes seleccionar al menos un horario';
    if (participants < 1) return 'Debe haber al menos 1 participante';
    if (participants > fieldCapacity) return `La capacidad máxima es de ${fieldCapacity} personas`;

    const sortedSlots = [...selectedSlots].sort();
    for (let i = 1; i < sortedSlots.length; i++) {
      const prevHour = parseInt(sortedSlots[i - 1].split(':')[0]);
      const currHour = parseInt(sortedSlots[i].split(':')[0]);
      if (currHour - prevHour !== 1) return 'Los horarios deben ser consecutivos';
    }

    return null;
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;
    const slotTime = slot.startTime;
    if (selectedSlots.includes(slotTime)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slotTime));
    } else {
      setSelectedSlots([...selectedSlots, slotTime].sort());
    }
  };

  const handleSubmit = async () => {
    const validationError = validateChanges();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sortedSlots = [...selectedSlots].sort();
      const startTime = sortedSlots[0];
      const endHour = parseInt(sortedSlots[sortedSlots.length - 1].split(':')[0]) + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;

      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');

      const iniciaEn = `${year}-${month}-${day}T${startTime}:00.000Z`;
      const terminaEn = `${year}-${month}-${day}T${endTime}:00.000Z`;

      const hours = selectedSlots.length;
      const montoBase = pricePerHour * hours;
      const montoExtra = montoBase * 0.10;
      const montoTotal = montoBase + montoExtra;

      const updateData: UpdateReservaRequest = {
        idCliente: userId,
        idCancha: parseInt(booking.fieldId),
        iniciaEn,
        terminaEn,
        cantidadPersonas: participants,
        requiereAprobacion: false,
        montoBase,
        montoExtra,
        montoTotal
      };

      await updateReserva(parseInt(booking.id), updateData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const totalHours = selectedSlots.length;
  const newTotal = pricePerHour * totalHours * 1.10;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Modificar Reserva</h2>
            <p className="text-gray-500 text-sm mt-1">Ajusta los detalles de tu partido</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Info Card */}
          <div className="bg-gray-50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{booking.fieldName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Actual: {booking.date} • {booking.timeSlot}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-bold block mb-1">Total Pagado</span>
              <span className="text-lg font-extrabold text-gray-900">Bs {booking.totalPaid}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Calendar & Participants */}
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Selecciona la fecha
                </label>
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <CustomCalendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Participantes
                </label>
                <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <button
                    onClick={() => setParticipants(Math.max(1, participants - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition shadow-sm flex items-center justify-center font-bold text-lg"
                  >
                    -
                  </button>
                  <div className="text-center">
                    <span className="text-2xl font-extrabold text-gray-900 block">{participants}</span>
                    <span className="text-xs text-gray-500 font-medium">de {fieldCapacity} máx</span>
                  </div>
                  <button
                    onClick={() => setParticipants(Math.min(fieldCapacity, participants + 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition shadow-sm flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Slots & Summary */}
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Selecciona el horario
                </label>

                {loadingSlots ? (
                  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-2xl border border-gray-100">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlots.includes(slot.startTime);
                      return (
                        <button
                          key={slot.startTime}
                          onClick={() => handleSlotClick(slot)}
                          disabled={!slot.available && !isSelected}
                          className={`
                                            relative p-3 rounded-xl border-2 text-left transition-all duration-200
                                            ${isSelected
                              ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                              : slot.available
                                ? 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-md'
                                : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            }
                                        `}
                        >
                          <span className={`block font-bold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                            {slot.startTime}
                          </span>
                          <span className="text-xs text-gray-500">a {slot.endTime}</span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 text-blue-600">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary Card */}
              {selectedSlots.length > 0 && (
                <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    Resumen de cambios
                  </h4>
                  <div className="space-y-3 text-gray-300 text-sm">
                    <div className="flex justify-between">
                      <span>Duración</span>
                      <span className="font-medium text-white">{totalHours} horas</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precio base</span>
                      <span className="font-medium text-white">Bs {(pricePerHour * totalHours).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cargo extra (10%)</span>
                      <span className="font-medium text-white">Bs {(pricePerHour * totalHours * 0.10).toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-700 mt-3">
                      <div className="flex justify-between items-end">
                        <span className="text-gray-400">Nuevo Total</span>
                        <span className="text-2xl font-extrabold text-white">Bs {newTotal.toFixed(2)}</span>
                      </div>
                      {newTotal !== booking.totalPaid && (
                        <div className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-lg inline-block ${newTotal > booking.totalPaid ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                          {newTotal > booking.totalPaid
                            ? `Pagar diferencia: Bs ${(newTotal - booking.totalPaid).toFixed(2)}`
                            : `Reembolso: Bs ${(booking.totalPaid - newTotal).toFixed(2)}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedSlots.length === 0}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Confirmar Cambios
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;
