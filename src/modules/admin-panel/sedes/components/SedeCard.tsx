import { Building2, MapPin, Star, Calendar, Check, AlertCircle } from 'lucide-react';
import type { Sede } from '../types';

interface SedeCardProps {
  sede: Sede;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SedeCard = ({ sede, onClick, onEdit, onDelete }: SedeCardProps) => {
  const getEstadoBadge = () => {
    if (!sede.activa) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inactiva</span>;
    }
    if (!sede.verificada) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Activa</span>;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="text-blue-600" size={20} />
            <h3 className="font-semibold text-lg text-gray-900">{sede.nombre}</h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin size={14} />
            <span>{sede.ciudad || sede.city || 'Ciudad no especificada'}</span>
          </div>
        </div>
        {getEstadoBadge()}
      </div>

      {/* Descripción */}
      {sede.descripcion && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{sede.descripcion}</p>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-2 mb-3 pt-3 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500">Canchas</p>
          <p className="text-lg font-semibold text-gray-900">{sede.totalCanchas || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Reservas</p>
          <p className="text-lg font-semibold text-gray-900">{sede.totalReservas || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Rating</p>
          <div className="flex items-center justify-center gap-1">
            <Star className="text-yellow-500 fill-yellow-500" size={14} />
            <p className="text-lg font-semibold text-gray-900">
              {sede.promedioCalificacion ? sede.promedioCalificacion.toFixed(1) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Estado de verificación */}
      <div className="flex items-center gap-2 mb-3">
        {sede.verificada ? (
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <Check size={16} />
            <span>Verificada</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-yellow-600 text-sm">
            <AlertCircle size={16} />
            <span>Pendiente de verificación</span>
          </div>
        )}
      </div>

      {/* Información del dueño */}
      {sede.duenio && (
        <div className="text-xs text-gray-500 mb-2">
          <span className="font-medium">Dueño:</span> {sede.duenio.persona.nombre} {sede.duenio.persona.apellidoPaterno}
        </div>
      )}

      {/* Contacto */}
      {(sede.telefono || sede.email) && (
        <div className="text-xs text-gray-500 mb-3 space-y-1">
          {sede.telefono && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Tel:</span> {sede.telefono}
            </div>
          )}
          {sede.email && (
            <div className="flex items-center gap-1 truncate">
              <span className="font-medium">Email:</span> {sede.email}
            </div>
          )}
        </div>
      )}

      {/* Fecha de creación */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Calendar size={12} />
        <span>
          Creado: {new Date(sede.creadoEn).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {/* Acciones */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
