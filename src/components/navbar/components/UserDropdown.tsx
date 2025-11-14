import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { 
  commonNavigation, 
  panelNavigation, 
  filterNavigationByRole 
} from '../config/navigation-items';

interface UserDropdownProps {
  user: any;
  onLogout: () => void;
  onClose: () => void;
}

const UserDropdown = ({ user, onLogout, onClose }: UserDropdownProps) => {
  const userRoles = user?.roles || [];

  // Filtrar navegación común
  const commonItems = filterNavigationByRole(commonNavigation, userRoles, user);
  
  // Filtrar navegación de paneles
  const panelItems = filterNavigationByRole(panelNavigation, userRoles, user);

  const getStyleByRole = (roles: string[]) => {
    if (roles.includes('ADMIN')) {
      return 'text-purple-700 hover:bg-purple-50';
    }
    if (roles.includes('DUENIO')) {
      return 'text-green-700 hover:bg-green-50';
    }
    return 'text-gray-700 hover:bg-gray-50';
  };

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

      {/* Navegación común */}
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

      {/* Acceso rápido a paneles */}
      {panelItems.length > 0 && (
        <>
          <div className="border-t border-gray-200 mt-1"></div>
          {panelItems.map((item) => {
            const Icon = item.icon;
            const styleClass = getStyleByRole(item.roles || []);
            return (
              <Link
                key={item.id}
                to={item.route}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm ${styleClass} transition-colors font-medium`}
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
