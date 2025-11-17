import { CheckCircle, XCircle, Ban, AlertCircle, Trash2 } from 'lucide-react';
import type { EstadoUsuario } from '../../types';

interface EstadoBadgeProps {
  estado: EstadoUsuario;
  size?: 'sm' | 'md' | 'lg';
}

const estadoConfig = {
  ACTIVO: {
    label: 'Activo',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  INACTIVO: {
    label: 'Inactivo',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  BLOQUEADO: {
    label: 'Bloqueado',
    icon: Ban,
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  PENDIENTE: {
    label: 'Pendiente',
    icon: AlertCircle,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  DESACTIVADO: {
    label: 'Desactivado',
    icon: XCircle,
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  ELIMINADO: {
    label: 'Eliminado',
    icon: Trash2,
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export const EstadoBadge = ({ estado, size = 'md' }: EstadoBadgeProps) => {
  const config = estadoConfig[estado];
  const Icon = config?.icon || AlertCircle;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.className} ${sizeClasses[size]}`}
    >
      <Icon size={iconSizes[size]} />
      {config.label}
    </span>
  );
};
