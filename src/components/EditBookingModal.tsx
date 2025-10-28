import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, AlertCircle, Loader } from 'lucide-react';
import { fetchReservasByFecha, fetchCanchaById, updateReserva } from '../utils/helpers';
import type { UpdateReservaRequest } from '../types';
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

  // Parsear la fecha original de la reserva
  useEffect(() => {
    const parseBookingDate = () => {
      try {
        // La fecha viene en formato "15 de octubre de 2025"
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
        console.error('Error parseando fecha:', err);
      }
    };

    parseBookingDate();
    
    // Parsear slots seleccionados originales
    const [start, end] = booking.timeSlot.split(' - ');
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    const slots: string[] = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    setSelectedSlots(slots);
  }, [booking]);

  // Cargar información de la cancha
  useEffect(() => {
    const loadFieldInfo = async () => {
      try {
        const field = await fetchCanchaById(booking.fieldId);
        setFieldCapacity(field.capacity || 22);
        setPricePerHour(field.price);
      } catch (err) {
        console.error('Error cargando info de la cancha:', err);
      }
    };

    loadFieldInfo();
  }, [booking.fieldId]);

  // Cargar slots disponibles cuando cambia la fecha
  useEffect(() => {
    const loadAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const field = await fetchCanchaById(booking.fieldId);
        const reservas = await fetchReservasByFecha(booking.fieldId, selectedDate);
        
        // Filtrar la reserva actual de las reservas ocupadas
        const reservasSinActual = reservas.filter(r => r.idReserva.toString() !== booking.id);
        
        // Generar slots excluyendo la reserva actual
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
        console.error('Error cargando slots:', err);
        setError('Error al cargar horarios disponibles');
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [selectedDate, booking.fieldId, booking.id]);

  // Validar restricciones
  const validateChanges = (): string | null => {
    const now = new Date();
    const bookingDate = new Date(selectedDate);
    
    // Combinar fecha con primera hora seleccionada
    if (selectedSlots.length > 0) {
      const [hour, minute] = selectedSlots[0].split(':').map(Number);
      bookingDate.setHours(hour, minute, 0, 0);
    }
    
    // 1. No modificar reservas pasadas
    if (bookingDate < now) {
      return 'No se pueden modificar reservas pasadas';
    }
    
    // 2. Modificaciones con 24 horas de anticipación
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilBooking < 24) {
      return 'Las modificaciones deben hacerse con al menos 24 horas de anticipación';
    }
    
    // 3. Debe tener al menos un slot seleccionado
    if (selectedSlots.length === 0) {
      return 'Debes seleccionar al menos un horario';
    }
    
    // 4. Validar participantes
    if (participants < 1) {
      return 'Debe haber al menos 1 participante';
    }
    
    if (participants > fieldCapacity) {
      return `La capacidad máxima es de ${fieldCapacity} personas`;
    }
    
    // 5. Validar que los slots sean consecutivos
    const sortedSlots = [...selectedSlots].sort();
    for (let i = 1; i < sortedSlots.length; i++) {
      const prevHour = parseInt(sortedSlots[i - 1].split(':')[0]);
      const currHour = parseInt(sortedSlots[i].split(':')[0]);
      if (currHour - prevHour !== 1) {
        return 'Los horarios deben ser consecutivos';
      }
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
      // Ordenar slots para obtener inicio y fin
      const sortedSlots = [...selectedSlots].sort();
      const startTime = sortedSlots[0];
      const endHour = parseInt(sortedSlots[sortedSlots.length - 1].split(':')[0]) + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;

      // Crear fecha y hora en formato ISO
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      
      const iniciaEn = `${year}-${month}-${day}T${startTime}:00.000Z`;
      const terminaEn = `${year}-${month}-${day}T${endTime}:00.000Z`;

      // Calcular montos
      const hours = selectedSlots.length;
      const montoBase = pricePerHour * hours;
      const montoExtra = montoBase * 0.10; // 10% extra
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Modificar Reserva</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info de la cancha */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">{booking.fieldName}</h3>
            <p className="text-sm text-green-700">
              Reserva actual: {booking.date} • {booking.timeSlot} • {booking.participants} personas
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Restricciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Restricciones importantes
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 ml-7">
              <li>• Las modificaciones deben hacerse con al menos 24 horas de anticipación</li>
              <li>• No se pueden modificar reservas pasadas</li>
              <li>• Los horarios deben ser consecutivos</li>
              <li>• Capacidad máxima: {fieldCapacity} personas</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Nueva fecha
              </label>
              <CustomCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>

            {/* Horarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Nuevo horario
              </label>
              
              {loadingSlots ? (
                <div className="flex items-center justify-center h-64">
                  <Loader className="w-8 h-8 text-green-600 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.startTime);
                    
                    return (
                      <button
                        key={slot.startTime}
                        onClick={() => handleSlotClick(slot)}
                        disabled={!slot.available && !isSelected}
                        className={`
                          w-full p-3 rounded-lg border-2 text-left transition
                          ${isSelected
                            ? 'border-green-600 bg-green-50'
                            : slot.available
                            ? 'border-gray-200 hover:border-green-300 bg-white'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                          }
                        `}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          {!slot.available && !isSelected && (
                            <span className="text-xs text-red-600 font-medium">Ocupado</span>
                          )}
                          {isSelected && (
                            <span className="text-xs text-green-600 font-medium">Seleccionado</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Participantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Número de participantes
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setParticipants(Math.max(1, participants - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-green-600 transition"
              >
                -
              </button>
              <span className="text-xl font-semibold text-gray-900 min-w-[60px] text-center">
                {participants} de {fieldCapacity}
              </span>
              <button
                onClick={() => setParticipants(Math.min(fieldCapacity, participants + 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-green-600 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Resumen */}
          {selectedSlots.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium">{totalHours} {totalHours === 1 ? 'hora' : 'horas'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Precio base:</span>
                <span className="font-medium">${(pricePerHour * totalHours).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cargo extra (10%):</span>
                <span className="font-medium">${(pricePerHour * totalHours * 0.10).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Nuevo total:</span>
                <span className="font-bold text-green-600 text-lg">${newTotal.toFixed(2)}</span>
              </div>
              {newTotal !== booking.totalPaid && (
                <p className="text-xs text-gray-500 text-center">
                  {newTotal > booking.totalPaid 
                    ? `Se cobrará la diferencia de $${(newTotal - booking.totalPaid).toFixed(2)}`
                    : `Se reembolsará la diferencia de $${(booking.totalPaid - newTotal).toFixed(2)}`
                  }
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedSlots.length === 0}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Actualizando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;
