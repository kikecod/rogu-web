import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAvailability } from '../hooks';
import type { CheckAvailabilityParams, Cancha } from '../types';

interface AvailabilityCheckerProps {
  cancha: Cancha;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  onAvailabilityChange?: (available: boolean) => void;
  className?: string;
  autoCheck?: boolean;
}

const AvailabilityChecker: React.FC<AvailabilityCheckerProps> = ({
  cancha,
  initialDate = '',
  initialStartTime = '',
  initialEndTime = '',
  onAvailabilityChange,
  className = '',
  autoCheck = false
}) => {
  const [checkParams, setCheckParams] = useState<CheckAvailabilityParams>({
    idCancha: cancha.idCancha,
    fecha: initialDate || new Date().toISOString().split('T')[0],
    horaInicio: initialStartTime || '09:00',
    horaFin: initialEndTime || '11:00'
  });

  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const { 
    availability, 
    loading, 
    error, 
    checkAvailability, 
    clearAvailability,
    isAvailable,
    hasConflicts,
    availableSlots,
    conflicts
  } = useAvailability();

  // Notificar cambios de disponibilidad
  useEffect(() => {
    if (availability && onAvailabilityChange) {
      onAvailabilityChange(isAvailable);
    }
  }, [availability, isAvailable, onAvailabilityChange]);

  // Auto-check cuando cambian los parámetros
  useEffect(() => {
    if (autoCheck && checkParams.fecha && checkParams.horaInicio && checkParams.horaFin) {
      const timer = setTimeout(() => {
        handleCheck();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [checkParams, autoCheck]);

  // Manejar verificación
  const handleCheck = async () => {
    try {
      await checkAvailability(checkParams);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
    }
  };

  // Actualizar parámetro específico
  const updateParam = <K extends keyof CheckAvailabilityParams>(
    key: K, 
    value: CheckAvailabilityParams[K]
  ) => {
    setCheckParams(prev => ({ ...prev, [key]: value }));
  };

  // Generar opciones de horarios
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 23; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return times;
  };

  // Validar horarios
  const isValidTimeRange = () => {
    if (!checkParams.horaInicio || !checkParams.horaFin) return false;
    
    const start = new Date(`2000-01-01T${checkParams.horaInicio}`);
    const end = new Date(`2000-01-01T${checkParams.horaFin}`);
    
    return end > start;
  };

  // Formatear tiempo relativo
  const formatLastChecked = () => {
    if (!lastChecked) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - lastChecked.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'hace unos segundos';
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    return `hace ${diffHours}h ${diffMinutes % 60}min`;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Verificar disponibilidad
        </h3>
        {lastChecked && (
          <span className="text-xs text-gray-500">
            Último check: {formatLastChecked()}
          </span>
        )}
      </div>

      {/* INFORMACIÓN DE LA CANCHA */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">{cancha.nombre}</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>📍 {cancha.sede.nombre}</div>
          <div>⏰ Horario: {cancha.horaApertura.slice(0, 5)} - {cancha.horaCierre.slice(0, 5)}</div>
          <div>💰 Precio: Bs{cancha.precio}/hora</div>
        </div>
      </div>

      {/* FORMULARIO DE VERIFICACIÓN */}
      <div className="space-y-4 mb-6">
        {/* FECHA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Fecha
          </label>
          <input
            type="date"
            value={checkParams.fecha}
            onChange={(e) => updateParam('fecha', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* HORARIOS */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Hora de inicio
            </label>
            <select
              value={checkParams.horaInicio}
              onChange={(e) => updateParam('horaInicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar hora</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Hora de fin
            </label>
            <select
              value={checkParams.horaFin}
              onChange={(e) => updateParam('horaFin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar hora</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* VALIDACIÓN DE HORARIOS */}
        {checkParams.horaInicio && checkParams.horaFin && !isValidTimeRange() && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              La hora de fin debe ser posterior a la hora de inicio
            </div>
          </div>
        )}
      </div>

      {/* BOTÓN DE VERIFICACIÓN */}
      <div className="mb-6">
        <button
          onClick={handleCheck}
          disabled={loading || !isValidTimeRange() || !checkParams.fecha}
          className={`
            w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md font-medium
            ${loading || !isValidTimeRange() || !checkParams.fecha
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }
            transition-colors duration-200
          `}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Verificando disponibilidad...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar disponibilidad
            </>
          )}
        </button>
      </div>

      {/* RESULTADOS */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <div className="flex items-center text-sm text-red-700">
            <XCircle className="w-4 h-4 mr-2" />
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {availability && (
        <div className="space-y-4">
          {/* ESTADO DE DISPONIBILIDAD */}
          <div className={`
            p-4 border rounded-md
            ${isAvailable 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
            }
          `}>
            <div className="flex items-center">
              {isAvailable ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">
                    ¡Cancha disponible!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">
                    Cancha no disponible
                  </span>
                </>
              )}
            </div>
            
            <div className="mt-2 text-sm">
              {isAvailable ? (
                <div className="text-green-700">
                  La cancha está libre en el horario solicitado: {checkParams.horaInicio} - {checkParams.horaFin}
                </div>
              ) : (
                <div className="text-red-700">
                  La cancha no está disponible en el horario solicitado
                </div>
              )}
            </div>
          </div>

          {/* CONFLICTOS */}
          {hasConflicts && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-medium text-yellow-800 mb-2">
                Conflictos encontrados:
              </h4>
              <div className="space-y-2">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    • {conflict.horaInicio} - {conflict.horaFin}: {conflict.motivo}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HORARIOS ALTERNATIVOS */}
          {availableSlots.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">
                Horarios disponibles alternativos:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      updateParam('horaInicio', slot.horaInicio);
                      updateParam('horaFin', slot.horaFin);
                    }}
                    className="p-2 bg-white border border-blue-300 rounded text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {slot.horaInicio} - {slot.horaFin}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIMPIAR RESULTADOS */}
      {availability && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={clearAvailability}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Limpiar resultados
          </button>
        </div>
      )}
    </div>
  );
};

export default AvailabilityChecker;