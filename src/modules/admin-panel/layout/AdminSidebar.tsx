import { useMemo, useState } from 'react';
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
  ShieldCheck,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

type MenuItem = {
  name: string;
  icon: typeof LayoutDashboard;
  path: string;
  badge?: number;
};

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
      name: 'Verificaciones',
      icon: ShieldCheck,
      path: ROUTES.admin.verificaciones,
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

  const isActive = (path: string) =>
    location.pathname === path || (path !== ROUTES.admin.dashboard && location.pathname.startsWith(path));

  return (
    <aside
      className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
        } flex flex-col`}
    >
      <div className="flex items-center justify-between px-2 py-3">
        {!isCollapsed && (
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Admin</p>
            <p className="text-lg font-semibold text-text-main">Panel ROGU</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="p-2 rounded-input bg-white/70 border border-border text-text-main shadow-soft"
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      <nav className="mt-2 space-y-1 flex-1 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
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
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/80 ${
                  active ? 'shadow-soft' : ''
                }`}
              >
                <Icon size={18} />
              </span>
              {!isCollapsed && (
                <div className="flex-1 flex items-center">
                  <span className="text-sm font-semibold text-text-main">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="mt-3 px-3 py-4 rounded-card border border-border bg-white/80 shadow-soft">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">Sesion</p>
          <p className="text-sm font-semibold text-text-main mt-1">Administrador</p>
          <p className="text-xs text-muted">Acceso completo</p>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
