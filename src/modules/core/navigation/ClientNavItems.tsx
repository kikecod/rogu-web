import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { 
  User, 
  Calendar, 
  Heart,
  Store
} from 'lucide-react';

interface ClientNavItemsProps {
  onItemClick: () => void;
  isDuenio: boolean;
}

export const ClientNavItems = ({ onItemClick, isDuenio }: ClientNavItemsProps) => {
  return (
    <>
      <Link
        to={ROUTES.profile}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={onItemClick}
      >
        <User className="h-4 w-4" />
        Mi perfil
      </Link>

      <Link
        to={ROUTES.bookings}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={onItemClick}
      >
        <Calendar className="h-4 w-4" />
        Mis reservas
      </Link>

      <Link
        to={ROUTES.favoritos}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={onItemClick}
      >
        <Heart className="h-4 w-4" />
        Mis favoritos
      </Link>

      {/* Solo mostrar "Ofrece tu espacio" si NO es dueño */}
      {!isDuenio && (
        <Link
          to={ROUTES.owner.hostSpace}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 transition-colors font-medium"
          onClick={onItemClick}
        >
          <Store className="h-4 w-4" />
          Ofrece tu espacio
        </Link>
      )}
    </>
  );
};
