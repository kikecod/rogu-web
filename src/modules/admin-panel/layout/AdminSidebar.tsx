import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckCircle,
  // Flag,
  // BarChart3,
  // Settings,
  // FileText,
  Menu,
  X,
  // CalendarClock,
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

  const menuItems = useMemo<MenuItem[]>(
    () => [
      { name: 'Dashboard', icon: LayoutDashboard, path: ROUTES.admin.dashboard },
      { name: 'Usuarios', icon: Users, path: ROUTES.admin.usuarios },
      { name: 'Sedes', icon: Building2, path: ROUTES.admin.sedes },
      // { name: 'Calendario', icon: CalendarClock, path: ROUTES.admin.reservas },
      { name: 'Verificaciones', icon: CheckCircle, path: ROUTES.admin.verificaciones },
      // { name: 'Reportes', icon: Flag, path: ROUTES.admin.reportes, badge: 5 },
      // { name: 'Analytics', icon: BarChart3, path: ROUTES.admin.analytics },
      // { name: 'Moderacion', icon: FileText, path: ROUTES.admin.moderacion },
      // { name: 'Configuracion', icon: Settings, path: ROUTES.admin.configuracion },
    ],
    []
  );

  const isActive = (path: string) =>
    location.pathname === path || (path !== ROUTES.admin.dashboard && location.pathname.startsWith(path));

  return (
    <aside
      className={`hidden md:flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      } sticky top-0 h-screen p-3 z-20 bg-surface/90 backdrop-blur-xl border border-border shadow-soft`}
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
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                active
                  ? 'bg-gradient-to-r from-primary/15 to-secondary/10 text-text-main shadow-soft'
                  : 'text-muted hover:bg-white/70'
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
