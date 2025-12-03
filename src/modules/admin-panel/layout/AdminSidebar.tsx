import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
  User as UserIcon,
  ChevronRight,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/auth/hooks/useAuth';
import { getImageUrl } from '@/core/config/api';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.home);
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

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
      badge: 5,
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
      className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'
        } flex flex-col`}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/rogu_logo.png"
              alt="ROGU Logo"
              className="h-10 w-auto"
            />
            <div>
              <span className="text-xs font-medium text-primary-600 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </div>
        ) : (
          <img
            src="/src/assets/rogu_logo.png"
            alt="ROGU"
            className="h-8 w-auto mx-auto"
          />
        )}
      </div>

      {/* Toggle Button */}
      <div className="px-4 py-2 border-b border-gray-100">
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="w-full p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-sm transition-colors flex items-center justify-center"
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="mb-4 px-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Menu Principal
            </p>
          </div>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${active
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              title={isCollapsed ? item.name : undefined}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!isCollapsed && (
                <>
                  <div className="flex-1">
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <ChevronRight className="w-4 h-4 text-primary-500" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        {!isCollapsed && (
          <>
            {/* User Profile - Clickable */}
            <button
              onClick={handleGoToProfile}
              className="flex items-center gap-3 mb-3 px-2 w-full hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt={user?.usuario || 'Admin'}
                  className="w-10 h-10 rounded-full object-cover shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold shadow-md ${user?.avatar ? 'hidden' : ''}`}>
                {user?.usuario?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.usuario || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.correo || 'admin@rogu.com'}
                </p>
              </div>
              <UserIcon className="w-4 h-4 text-gray-400" />
            </button>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 w-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </>
        )}
        {isCollapsed && (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleGoToProfile}
              className="mx-auto rounded-full shadow-md hover:shadow-lg transition-shadow"
              title="Ver Perfil"
            >
              {user?.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt={user?.usuario || 'Admin'}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold ${user?.avatar ? 'hidden' : ''}`}>
                {user?.usuario?.charAt(0).toUpperCase() || 'A'}
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mx-auto"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
