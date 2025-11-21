// src/modules/analytics/pages/CalendarioReservasPage.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import type { SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarIcon, List } from 'lucide-react';
import { getCalendario } from '../services/analyticsService';
import type { CalendarioData, ReservaCalendario } from '../types/analytics.types';
import ReservationManagement from '../../fields/components/ReservationManagement';

// Configurar moment en español
moment.locale('es', {
  months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
  monthsShort: 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_'),
  weekdays: 'domingo_lunes_martes_miércoles_jueves_viernes_sábado'.split('_'),
  weekdaysShort: 'dom._lun._mar._mié._jue._vie._sáb.'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_')
});

const localizer = momentLocalizer(moment);

interface CalendarioReservasPageProps {
  cancha: {
    idCancha: number;
    nombre: string;
  };
  onBack: () => void;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: ReservaCalendario;
}

const CalendarioReservasPage: React.FC<CalendarioReservasPageProps> = ({ cancha, onBack }) => {
  const [calendarioData, setCalendarioData] = useState<CalendarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showReservationList, setShowReservationList] = useState(false);

  useEffect(() => {
    loadCalendario();
  }, [currentDate, cancha.idCancha]);

  const loadCalendario = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Formato YYYY-MM para el mes actual
      const mesString = moment(currentDate).format('YYYY-MM');
      
      const data = await getCalendario(mesString, { idCancha: cancha.idCancha });
      setCalendarioData(data);
      
      // Para cada reserva, cargar los datos completos del usuario
      const reservasConUsuario = await Promise.all(
        data.reservas.map(async (reserva: ReservaCalendario) => {
          try {
            // Intentar obtener datos del usuario/cliente
            const usuarioResponse = await fetch(
              `http://localhost:3000/api/usuarios/persona/${reserva.cliente.idCliente}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );

            if (usuarioResponse.ok) {
              const usuarioData = await usuarioResponse.json();
              
              // Enriquecer los datos del cliente con la información del usuario
              return {
                ...reserva,
                cliente: {
                  ...reserva.cliente,
                  telefono: usuarioData.persona?.telefono || '',
                  correo: usuarioData.correo || '',
                  usuario: usuarioData.usuario || ''
                }
              };
            }
            
            return reserva;
          } catch (error) {
            console.error('Error loading user data for reservation:', reserva.idReserva, error);
            return reserva;
          }
        })
      );
      
      // Convertir reservas a eventos del calendario
      const calendarEvents: CalendarEvent[] = reservasConUsuario.map((reserva: ReservaCalendario) => ({
        id: reserva.idReserva,
        title: `${reserva.cliente.nombre} ${reserva.cliente.apellido}`,
        start: new Date(reserva.iniciaEn),
        end: new Date(reserva.terminaEn),
        resource: reserva
      }));
      
      setEvents(calendarEvents);
    } catch (err) {
      setError('Error al cargar el calendario de reservas');
      console.error('Error loading calendario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // Aquí podrías agregar funcionalidad para crear nuevas reservas
    console.log('Slot seleccionado:', slotInfo);
  };

  // Personalizar el color del evento según el estado
  const eventStyleGetter = (event: CalendarEvent) => {
    const estado = event.resource.estado;
    let backgroundColor = '#3174ad';
    
    switch (estado) {
      case 'Confirmada':
        backgroundColor = '#10B981'; // Verde
        break;
      case 'Pendiente':
        backgroundColor = '#F59E0B'; // Amarillo/naranja
        break;
      case 'Cancelada':
        backgroundColor = '#EF4444'; // Rojo
        break;
      case 'Completada':
        backgroundColor = '#6B7280'; // Gris
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '3px 6px'
      }
    };
  };

  // Funciones helper para convertir y formatear fechas
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Calcular duración de la reserva
  const calcularDuracion = (inicio: string, fin: string) => {
    const inicioDate = new Date(inicio);
    const finDate = new Date(fin);
    const diffMs = finDate.getTime() - inicioDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes > 0 ? diffMinutes + 'm' : ''}`;
    }
    return `${diffMinutes}m`;
  };

  // Mensajes personalizados en español
  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Reserva',
    noEventsInRange: 'No hay reservas en este rango.',
    showMore: (total: number) => `+ Ver más (${total})`
  };

  // Formatear el título del modal
  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'Confirmada':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      case 'Completada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Si se está mostrando la lista de reservas
  if (showReservationList) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 rounded-2xl min-h-full">
        <ReservationManagement
          cancha={cancha}
          onBack={() => setShowReservationList(false)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 bg-slate-50 rounded-2xl min-h-[260px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600"></div>
          <p className="text-sm text-slate-500">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
          <p className="text-red-800 text-lg font-semibold">Ups, algo salió mal</p>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={loadCalendario}
            className="mt-5 px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-slate-50 rounded-2xl min-h-full">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4 sm:px-7 sm:py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-1 text-gray-500 hover:text-gray-800 inline-flex items-center justify-center rounded-full border border-slate-200 w-9 h-9 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Calendario de Reservas
            </h1>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{cancha.nombre}</span>{' '}
              • {calendarioData?.reservas.length || 0} reservas
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
          <button
            onClick={() => handleNavigate(moment(currentDate).subtract(1, 'week').toDate())}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center justify-center"
            title="Semana anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleNavigate(new Date())}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            Hoy
          </button>
          <button
            onClick={() => handleNavigate(moment(currentDate).add(1, 'week').toDate())}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center justify-center"
            title="Semana siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="hidden sm:block border-l border-gray-200 h-7 mx-1" />
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm bg-white"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Mes
          </button>
          <button
            onClick={() => setShowReservationList(true)}
            className="inline-flex items-center px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm bg-white"
          >
            <List className="h-4 w-4 mr-2" />
            Agenda
          </button>
        </div>
      </div>

      {/* Selector de Mes */}
      {showMonthPicker && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Seleccionar Mes y Año
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const monthDate = moment().month(i).year(moment(currentDate).year());
              const isActive = moment(currentDate).month() === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    handleNavigate(monthDate.toDate());
                    setShowMonthPicker(false);
                  }}
                  className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {monthDate.format('MMM')}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleNavigate(moment(currentDate).subtract(1, 'year').toDate())}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              ← {moment(currentDate).subtract(1, 'year').year()}
            </button>
            <span className="text-lg font-semibold text-gray-900">
              {moment(currentDate).year()}
            </span>
            <button
              onClick={() => handleNavigate(moment(currentDate).add(1, 'year').toDate())}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {moment(currentDate).add(1, 'year').year()} →
            </button>
          </div>
        </div>
      )}

      {/* Leyenda de estados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Estados de Reserva
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-sm text-gray-700">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-sm text-gray-700">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-gray-700">Cancelada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded" />
            <span className="text-sm text-gray-700">Completada</span>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header con el mes */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">
            {moment(currentDate).format('MMMM YYYY')}
          </h2>
        </div>
        
        {/* Calendario */}
        <div className="p-4 sm:p-6" style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            messages={messages}
            eventPropGetter={eventStyleGetter}
            views={['week']}
            defaultView="week"
            step={60}
            timeslots={1}
            showMultiDayTimes
            date={currentDate}
            onNavigate={handleNavigate}
            toolbar={false}
            min={new Date(2024, 0, 1, 6, 0, 0)} // 6:00 AM
            max={new Date(2024, 0, 1, 23, 0, 0)} // 11:00 PM
            formats={{
              timeGutterFormat: (date, culture, localizerArg) => {
                const startTime = localizerArg?.format(date, 'HH:mm', culture) || '';
                const endDate = moment(date).add(1, 'hour').toDate();
                const endTime = localizerArg?.format(endDate, 'HH:mm', culture) || '';
                return `${startTime}-${endTime}`;
              },
              eventTimeRangeFormat: ({ start, end }, culture, localizerArg) =>
                `${localizerArg?.format(start, 'HH:mm', culture)} - ${localizerArg?.format(end, 'HH:mm', culture)}`,
              agendaTimeRangeFormat: ({ start, end }, culture, localizerArg) =>
                `${localizerArg?.format(start, 'HH:mm', culture)} - ${localizerArg?.format(end, 'HH:mm', culture)}`,
              dayHeaderFormat: (date, culture, localizerArg) =>
                localizerArg?.format(date, 'ddd DD/MM', culture) || '',
            }}
          />
        </div>
      </div>

      {/* Modal de detalles de reserva */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-700/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-16 sm:top-20 mx-auto p-4 sm:p-6 w-full max-w-3xl">
            <div className="border border-slate-200 shadow-xl rounded-2xl bg-white p-5 sm:p-6">
              <div className="flex justify-between items-start gap-3 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Detalles de Reserva #{selectedEvent.resource.idReserva}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {cancha.nombre}
                  </p>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del cliente */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Información del Cliente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Nombre Completo
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedEvent.resource.cliente.nombre}{' '}
                        {selectedEvent.resource.cliente.apellido}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Teléfono
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedEvent.resource.cliente.telefono || 'No disponible'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Correo Electrónico
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedEvent.resource.cliente.correo || 'No disponible'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Nombre de Usuario
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedEvent.resource.cliente.usuario || 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de la reserva */}
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Información de la Reserva
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fecha y hora de inicio
                      </label>
                      <p className="text-sm text-gray-900">
                        {(() => {
                          const formatted = formatDateTime(selectedEvent.resource.iniciaEn);
                          return `${formatted.date} a las ${formatted.time}`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fecha y hora de fin
                      </label>
                      <p className="text-sm text-gray-900">
                        {(() => {
                          const formatted = formatDateTime(selectedEvent.resource.terminaEn);
                          return `${formatted.date} a las ${formatted.time}`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Duración
                      </label>
                      <p className="text-sm text-gray-900">
                        {calcularDuracion(
                          selectedEvent.resource.iniciaEn,
                          selectedEvent.resource.terminaEn
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Cantidad de personas
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedEvent.resource.cantidadPersonas || 'No especificada'}
                        {selectedEvent.resource.cantidadPersonas && ' personas'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de pagos */}
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Información de Pago
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Monto base
                      </label>
                      <p className="text-sm text-gray-900">
                        Bs. {selectedEvent.resource.montoBase || 0}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Monto extra
                      </label>
                      <p className="text-sm text-gray-900">
                        Bs. {selectedEvent.resource.montoExtra || 0}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Monto total
                      </label>
                      <p className="text-lg font-semibold text-green-600">
                        Bs. {selectedEvent.resource.montoTotal || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Información Adicional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Requiere aprobación
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedEvent.resource.requiereAprobacion ? 'Sí' : 'No'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Estado
                      </label>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadgeColor(
                          selectedEvent.resource.estado
                        )}`}
                      >
                        {selectedEvent.resource.estado}
                      </span>
                    </div>
                    {selectedEvent.resource.creadoEn && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Creado el
                        </label>
                        <p className="text-sm text-gray-900">
                          {(() => {
                            const formatted = formatDateTime(selectedEvent.resource.creadoEn);
                            return `${formatted.date} a las ${formatted.time}`;
                          })()}
                        </p>
                      </div>
                    )}
                    {selectedEvent.resource.actualizadoEn && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Última actualización
                        </label>
                        <p className="text-sm text-gray-900">
                          {(() => {
                            const formatted = formatDateTime(selectedEvent.resource.actualizadoEn);
                            return `${formatted.date} a las ${formatted.time}`;
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioReservasPage;
