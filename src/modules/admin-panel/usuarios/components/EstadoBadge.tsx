import { CheckCircle, XCircle, Ban, AlertCircle, Trash2, Clock3 } from 'lucide-react';
import type { EstadoUsuario } from '../../types';

const estadoStyles: Record<
  EstadoUsuario,
  { label: string; bg: string; text: string; icon: any }
> = {
  ACTIVO: { label: 'Activo', bg: 'bg-success/15', text: 'text-success', icon: CheckCircle },
  INACTIVO: { label: 'Inactivo', bg: 'bg-muted/10', text: 'text-muted', icon: Clock3 },
  BLOQUEADO: { label: 'Bloqueado', bg: 'bg-danger/15', text: 'text-danger', icon: Ban },
  PENDIENTE: { label: 'Pendiente', bg: 'bg-warning/15', text: 'text-warning', icon: AlertCircle },
  DESACTIVADO: { label: 'Desactivado', bg: 'bg-warning/15', text: 'text-warning', icon: XCircle },
  ELIMINADO: { label: 'Eliminado', bg: 'bg-danger/15', text: 'text-danger', icon: Trash2 },
};

interface EstadoBadgeProps {
  estado: EstadoUsuario;
  size?: 'sm' | 'md' | 'lg';
}

export const EstadoBadge = ({ estado, size = 'md' }: EstadoBadgeProps) => {
  const config = estadoStyles[estado];
  const Icon = config?.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border border-border ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
      {config.label}
    </span>
  );
};
