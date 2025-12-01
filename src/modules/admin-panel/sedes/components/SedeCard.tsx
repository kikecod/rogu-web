import { Building2, MapPin, Star, Calendar, Check, AlertCircle, User } from 'lucide-react';
import type { Sede } from '../types';

interface SedeCardProps {
  sede: Sede;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SedeCard = ({ sede, onClick, onEdit, onDelete }: SedeCardProps) => {
  const estadoLabel = () => {
    if (!sede.activa) return { text: 'Inactiva', color: 'bg-danger/15 text-danger' };
    if (!sede.verificada) return { text: 'Pendiente', color: 'bg-warning/15 text-warning' };
    return { text: 'Activa', color: 'bg-success/15 text-success' };
  };

  const estado = estadoLabel();
  const hasOcupacion = !!sede.totalReservas;

  return (
    <div
      onClick={onClick}
      className="bg-surface backdrop-blur-xl border border-border rounded-card shadow-soft p-4 cursor-pointer hover:-translate-y-0.5 transition-all"
    >
      <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-primary to-secondary mb-3" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-soft">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-main leading-tight">{sede.nombre}</h3>
            <div className="flex items-center gap-1 text-sm text-muted">
              <MapPin size={14} />
              <span>{sede.ciudad || sede.city || 'Ciudad no especificada'}</span>
            </div>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-input px-3 py-1 text-xs font-semibold border border-border ${estado.color}`}
        >
          {estado.text}
        </span>
      </div>

      {sede.descripcion && <p className="text-sm text-muted mt-2 line-clamp-2">{sede.descripcion}</p>}

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-[11px] text-muted">Canchas</p>
          <p className="text-xl font-semibold text-text-main">{sede.totalCanchas || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-muted">Reservas</p>
          <p className="text-xl font-semibold text-text-main">{sede.totalReservas || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-muted">Rating</p>
          <div className="flex items-center justify-center gap-1">
            <Star className="text-yellow-500 fill-yellow-500" size={14} />
            <p className="text-xl font-semibold text-text-main">
              {sede.promedioCalificacion ? sede.promedioCalificacion.toFixed(1) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm flex-wrap">
        {sede.verificada ? (
          <span className="inline-flex items-center gap-1 rounded-input px-2 py-1 text-[12px] bg-success/15 text-success border border-success/30">
            <Check size={14} />
            Verificada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-input px-2 py-1 text-[12px] bg-warning/15 text-warning border border-warning/30">
            <AlertCircle size={14} />
            Pendiente
          </span>
        )}
        {sede.duenio && (
          <span className="inline-flex items-center gap-1 rounded-input px-2 py-1 text-[12px] border border-border bg-white/80 text-text-main">
            <User size={14} />
            Dueno: {sede.duenio.persona.nombre}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-[11px] text-muted mb-1">Ocupacion semanal</p>
        {hasOcupacion ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, idx) => (
              <span
                key={idx}
                className="block rounded-full bg-primary/25"
                style={{ height: `${Math.min(((sede.totalReservas || 0) / 7) + idx * 2, 100)}%` }}
                title={`${Math.min(((sede.totalReservas || 0) / 7) + idx * 2, 100)}%`}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">Sin datos de ocupacion</p>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted mt-3">
        <Calendar size={12} />
        <span>
          Creado:{' '}
          {new Date(sede.creadoEn).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 px-3 py-2 rounded-input border border-border bg-white/80 text-text-main hover:bg-white transition"
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
              className="flex-1 px-3 py-2 rounded-input border border-border bg-white/80 text-danger hover:bg-danger/10 transition"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
