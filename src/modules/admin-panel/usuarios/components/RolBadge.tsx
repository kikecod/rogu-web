import { Shield, User, UserCheck, UserX } from 'lucide-react';
import type { TipoRol } from '../../types';

const roleStyles: Record<
  TipoRol,
  { label: string; bg: string; text: string; icon: any }
> = {
  ADMIN: { label: 'Admin', bg: 'bg-secondary/15', text: 'text-secondary', icon: Shield },
  CLIENTE: { label: 'Cliente', bg: 'bg-primary/15', text: 'text-primary', icon: User },
  DUENIO: { label: 'Dueno', bg: 'bg-secondary/15', text: 'text-secondary', icon: UserCheck },
  CONTROLADOR: { label: 'Controlador', bg: 'bg-warning/20', text: 'text-warning', icon: UserX },
};

interface RolBadgeProps {
  rol: TipoRol;
  size?: 'sm' | 'md' | 'lg';
}

export const RolBadge = ({ rol, size = 'md' }: RolBadgeProps) => {
  const config = roleStyles[rol];
  const Icon = config?.icon || User;

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
      <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
      {config.label}
    </span>
  );
};
