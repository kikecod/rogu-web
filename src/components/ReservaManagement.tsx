import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, DollarSign, ArrowLeft, Eye, AlertCircle } from 'lucide-react';

interface Reserva {
  idReserva: number;
  idCliente: number;
  idCancha: number;
  iniciaEn: string;
  terminaEn: string;
  cantidadPersonas: number;
  requiereAprobacion: boolean;
  montoBase: number;
  montoExtra: number;
  montoTotal: number;
  creadoEn: string;
  actualizadoEn: string;
  usuario?: {
    idUsuario: number;
    usuario: string;
    correo: string;
    estado: string;
    persona: {
      idPersona: number;
      nombres: string;
      paterno: string;
      materno: string;
      telefono: string;
      documentoTipo: string;
      documentoNumero: string;
    };
  };
  cancha?: {
    idCancha: number;
    nombre: string;
  };
}

interface ReservaManagementProps {
  cancha: {
    idCancha: number;
    nombre: string;
  };
  onBack: () => void;
}

const ReservaManagement: React.FC<ReservaManagementProps> = ({ cancha, onBack }) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Cargar reservas de la cancha
  const loadReservas = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/reservas/cancha/${cancha.idCancha}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const reservasData = await response.json();
        
        // Para cada reserva, intentar cargar los datos del usuario y persona
        const reservasConUsuario = await Promise.all(
          reservasData.map(async (reserva: Reserva) => {
            try {
              console.log('Cargando usuario:', reserva.idCliente);
              const usuarioResponse = await fetch(`http://localhost:3000/api/usuarios/persona/${reserva.idCliente}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (usuarioResponse.ok) {
                const usuarioData = await usuarioResponse.json();
                return { ...reserva, usuario: usuarioData };
              }
              return reserva;
            } catch (error) {
              return reserva;
            }
          })
        );
        
        setReservas(reservasConUsuario);
      } else {
        console.error('Error al cargar reservas');
      }
    } catch (error) {
      console.error('Error loading reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservas();
  }, [cancha.idCancha]);

  // Formatear fecha y hora
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

  // Determinar el estado de la reserva
  const getEstadoReserva = (iniciaEn: string, terminaEn: string) => {
    const ahora = new Date();
    const inicio = new Date(iniciaEn);
    const fin = new Date(terminaEn);

    if (ahora < inicio) {
      return { estado: 'Programada', color: 'bg-blue-100 text-blue-800' };
    } else if (ahora >= inicio && ahora <= fin) {
      return { estado: 'En curso', color: 'bg-green-100 text-green-800' };
    } else {
      return { estado: 'Finalizada', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const openDetailModal = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Reservas de {cancha.nombre}
            </h2>
            <p className="text-gray-600">
              Gestiona las reservas de esta cancha
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total de reservas</p>
          <p className="text-2xl font-bold text-blue-600">{reservas.length}</p>
        </div>
      </div>

      {/* Lista de reservas */}
      {reservas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reservas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Esta cancha no tiene reservas registradas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservas.map((reserva) => {
            const inicioFormat = formatDateTime(reserva.iniciaEn);
            const finFormat = formatDateTime(reserva.terminaEn);
            const duracion = calcularDuracion(reserva.iniciaEn, reserva.terminaEn);
            const estadoInfo = getEstadoReserva(reserva.iniciaEn, reserva.terminaEn);

            return (
              <div
                key={reserva.idReserva}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Reserva #{reserva.idReserva}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {reserva.usuario?.persona 
                          ? `${reserva.usuario.persona.nombres} ${reserva.usuario.persona.paterno} ${reserva.usuario.persona.materno}`
                          : `Cliente ID: ${reserva.idCliente}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                      {estadoInfo.estado}
                    </span>
                    {reserva.requiereAprobacion && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Requiere Aprobación
                      </span>
                    )}
                    <button
                      onClick={() => openDetailModal(reserva)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {inicioFormat.date}
                      </p>
                      <p className="text-xs text-gray-500">Fecha</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {inicioFormat.time} - {finFormat.time}
                      </p>
                      <p className="text-xs text-gray-500">{duracion}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reserva.cantidadPersonas} personas
                      </p>
                      <p className="text-xs text-gray-500">Asistentes</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Bs. {reserva.montoTotal}
                      </p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>

                {reserva.usuario?.persona && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Contacto:</span>
                      <div className="text-right">
                        {reserva.usuario.persona.telefono && (
                          <p className="text-gray-900">{reserva.usuario.persona.telefono}</p>
                        )}
                        {reserva.usuario.correo && (
                          <p className="text-gray-600">{reserva.usuario.correo}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedReserva && showDetailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-gray-900">
                Detalles de Reserva #{selectedReserva.idReserva}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Información del cliente */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Información del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
                    <p className="text-sm text-gray-900">
                      {selectedReserva.usuario?.persona 
                        ? `${selectedReserva.usuario.persona.nombres} ${selectedReserva.usuario.persona.paterno} ${selectedReserva.usuario.persona.materno}`
                        : `Cliente ID: ${selectedReserva.idCliente}`
                      }
                    </p>
                  </div>
                  {selectedReserva.usuario?.persona && (
                    <>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                        <p className="text-sm text-gray-900">{selectedReserva.usuario.persona.telefono || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Correo Electrónico</label>
                        <p className="text-sm text-gray-900">{selectedReserva.usuario.correo || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Nombre de Usuario</label>
                        <p className="text-sm text-gray-900">{selectedReserva.usuario.usuario || 'No disponible'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Información de la reserva */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Información de la Reserva</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha y hora de inicio</label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(selectedReserva.iniciaEn).date} a las {formatDateTime(selectedReserva.iniciaEn).time}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha y hora de fin</label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(selectedReserva.terminaEn).date} a las {formatDateTime(selectedReserva.terminaEn).time}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Duración</label>
                    <p className="text-sm text-gray-900">
                      {calcularDuracion(selectedReserva.iniciaEn, selectedReserva.terminaEn)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Cantidad de personas</label>
                    <p className="text-sm text-gray-900">{selectedReserva.cantidadPersonas} personas</p>
                  </div>
                </div>
              </div>

              {/* Información de pagos */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Información de Pago</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Monto base</label>
                    <p className="text-sm text-gray-900">Bs. {selectedReserva.montoBase}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Monto extra</label>
                    <p className="text-sm text-gray-900">Bs. {selectedReserva.montoExtra}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Monto total</label>
                    <p className="text-lg font-semibold text-green-600">Bs. {selectedReserva.montoTotal}</p>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Información Adicional</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Requiere aprobación</label>
                    <p className="text-sm text-gray-900">
                      {selectedReserva.requiereAprobacion ? 'Sí' : 'No'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Estado</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoReserva(selectedReserva.iniciaEn, selectedReserva.terminaEn).color}`}>
                      {getEstadoReserva(selectedReserva.iniciaEn, selectedReserva.terminaEn).estado}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Creado el</label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(selectedReserva.creadoEn).date} a las {formatDateTime(selectedReserva.creadoEn).time}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Última actualización</label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(selectedReserva.actualizadoEn).date} a las {formatDateTime(selectedReserva.actualizadoEn).time}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservaManagement;