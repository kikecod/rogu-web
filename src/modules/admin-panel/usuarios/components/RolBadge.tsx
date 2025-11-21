import { User, Shield, UserX, UserCheck } from 'lucide-react';
import type { TipoRol } from '../../types';

interface RolBadgeProps {
  rol: TipoRol;
  size?: 'sm' | 'md' | 'lg';
}

const rolConfig = {
  ADMIN: {
    label: 'Admin',
    icon: Shield,
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  CLIENTE: {
    label: 'Cliente',
    icon: User,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  DUENIO: {
    label: 'Dueño',
    icon: UserCheck,
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  CONTROLADOR: {
    label: 'Controlador',
    icon: UserX,
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
};

export const RolBadge = ({ rol, size = 'md' }: RolBadgeProps) => {
  const config = rolConfig[rol];
  const Icon = config?.icon || User;

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
