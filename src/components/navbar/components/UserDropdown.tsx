import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  commonNavigation, 
  adminTabsNavigation,
  ownerTabsNavigation,
  filterNavigationByRole 
} from '../config/navigation-items';

interface UserDropdownProps {
  user: any;
  onLogout: () => void;
  onClose: () => void;
}

const UserDropdown = ({ user, onLogout, onClose }: UserDropdownProps) => {
  const userRoles = user?.roles || [];

  // Filtrar navegación según roles del usuario
  const commonItems = filterNavigationByRole(commonNavigation, userRoles, user);
  const adminTabs = filterNavigationByRole(adminTabsNavigation, userRoles, user);
  const ownerTabs = filterNavigationByRole(ownerTabsNavigation, userRoles, user);

  const isAdmin = userRoles.includes('ADMIN');
  const isDuenio = userRoles.includes('DUENIO');

  return (
    <>
      {/* Información del usuario */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user?.correo}
        </p>
        {userRoles.length > 0 && (
          <p className="text-xs text-blue-600 mt-1">
            Roles: {userRoles.join(', ')}
          </p>
        )}
      </div>

      {/* Navegación común (Perfil, Reservas, Favoritos) - Solo si NO es Admin */}
      {commonItems.map((item) => {
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

      {/* Pestañas de ADMIN */}
      {isAdmin && adminTabs.length > 0 && (
        <>
          <div className="border-t border-gray-200 mt-1 pt-1"></div>
          <div className="px-4 py-2 bg-purple-50">
            <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">
              Panel de Administración
            </p>
          </div>
          {adminTabs.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.route}
                className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                onClick={onClose}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </>
      )}

      {/* Pestañas de DUEÑO (solo si NO es Admin) */}
      {isDuenio && !isAdmin && ownerTabs.length > 0 && (
        <>
          <div className="border-t border-gray-200 mt-1 pt-1"></div>
          <div className="px-4 py-2 bg-green-50">
            <p className="text-xs font-semibold text-green-900 uppercase tracking-wide">
              Panel de Propietario
            </p>
          </div>
          {ownerTabs.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.route}
                className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                onClick={onClose}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </>
      )}

      {/* Separador y Logout */}
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


