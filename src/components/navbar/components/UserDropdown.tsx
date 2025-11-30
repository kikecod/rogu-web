import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMode } from '../../../core/hooks/useMode';
import { commonNavigation, filterNavigationByRole } from '../config/navigation-items';

interface UserDropdownProps {
  user: any;
  onLogout: () => void;
  onClose: () => void;
}

const UserDropdown = ({ user, onLogout, onClose }: UserDropdownProps) => {
  const userRoles = user?.roles || [];
  const { mode } = useMode();

  const commonItems = filterNavigationByRole(commonNavigation, userRoles, user);
  const isDuenio = userRoles.includes('DUENIO');
  const isAdmin = userRoles.includes('ADMIN');

  const filteredCommonItems =
    mode === 'duenio' && isDuenio && !isAdmin ? commonItems.filter((item) => item.id === 'profile') : commonItems;

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-sm font-medium text-gray-900 truncate">{user?.correo}</p>
        {userRoles.length > 0 && (
          <p className="text-xs text-blue-600 mt-1">Roles: {userRoles.join(', ')}</p>
        )}
      </div>

      {filteredCommonItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            to={item.route}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}

      <div className="border-t border-gray-200 mt-1"></div>
      <button
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
        onClick={() => {
          onClose();
          onLogout();
        }}
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </>
  );
};

export default UserDropdown;
