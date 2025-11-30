import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Flag,
  BarChart3,
  Settings,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

const AdminSidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: ROUTES.admin.dashboard,
    },
    {
      name: 'Usuarios',
      icon: Users,
      path: ROUTES.admin.usuarios,
    },

    {
      name: 'Sedes',
      icon: Building2,
      path: ROUTES.admin.sedes,
    },
    {
      name: 'Reportes',
      icon: Flag,
      path: ROUTES.admin.reportes,
      badge: 5, // Número de reportes pendientes
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      path: ROUTES.admin.analytics,
    },
    {
      name: 'Moderación',
      icon: FileText,
      path: ROUTES.admin.moderacion,
    },
    {
      name: 'Configuración',
      icon: Settings,
      path: ROUTES.admin.configuracion,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
        } flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold">Panel Admin</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
                }`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="flex-1">{item.name}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-400">
            Sesión: Admin
          </p>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
