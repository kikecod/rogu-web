import { Bell, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { AdminTabBar } from '@/core/navigation/AdminTabBar';

const AdminNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      {/* Header superior con búsqueda y usuario */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar usuarios, sedes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-4">
            {/* Notificaciones */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Usuario */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.usuario || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <User size={20} />
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs de navegación */}
      <AdminTabBar />
    </div>
  );
};

export default AdminNavbar;
