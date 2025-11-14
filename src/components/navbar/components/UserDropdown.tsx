import { LogOut } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { ClientNavItems, OwnerNavItems, AdminNavItems } from '@/core/navigation';

interface UserDropdownProps {
  user: any;
  onLogout: () => void;
  onClose: () => void;
}

const UserDropdown = ({ user, onLogout, onClose }: UserDropdownProps) => {
  const { isAdmin, isDuenio } = useAuth();
  const userRoles = user?.roles || [];

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

      {/* Navegación de ADMIN */}
      {isAdmin() && (
        <AdminNavItems onItemClick={onClose} />
      )}

      {/* Navegación de DUEÑO */}
      {isDuenio() && !isAdmin() && (
        <OwnerNavItems onItemClick={onClose} />
      )}

      {/* Navegación de CLIENTE (si no es Admin) */}
      {!isAdmin() && (
        <ClientNavItems onItemClick={onClose} isDuenio={isDuenio()} />
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
