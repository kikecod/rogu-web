import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  BarChart3, 
  Star
} from 'lucide-react';

interface OwnerNavItemsProps {
  onItemClick: () => void;
}

export const OwnerNavItems = ({ onItemClick }: OwnerNavItemsProps) => {
  return (
    <>
      <div className="px-4 py-2 border-t border-b border-gray-200 bg-green-50">
        <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">
          Panel de Dueño
        </p>
      </div>
      
      <Link
        to={ROUTES.owner.adminSpaces}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
        onClick={onItemClick}
      >
        <LayoutDashboard className="h-4 w-4" />
        Mis Espacios
      </Link>

      <Link
        to={ROUTES.owner.adminSpaces}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
        onClick={onItemClick}
      >
        <Building2 className="h-4 w-4" />
        Gestión de Sedes
      </Link>

      <Link
        to={ROUTES.owner.adminSpaces}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
        onClick={onItemClick}
      >
        <Calendar className="h-4 w-4" />
        Reservas
      </Link>

      <Link
        to={ROUTES.owner.adminSpaces}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
        onClick={onItemClick}
      >
        <BarChart3 className="h-4 w-4" />
        Analytics
      </Link>

      <Link
        to={ROUTES.owner.adminSpaces}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
        onClick={onItemClick}
      >
        <Star className="h-4 w-4" />
        Reseñas
      </Link>
    </>
  );
};
