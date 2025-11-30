import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, CheckCircle, CalendarClock } from 'lucide-react';
import { ROUTES } from '@/config/routes';

interface AdminTab {
  label: string;
  route: string;
  icon: React.ElementType;
}

const adminTabs: AdminTab[] = [
  { label: 'Dashboard', route: ROUTES.admin.dashboard, icon: LayoutDashboard },
  { label: 'Usuarios', route: ROUTES.admin.usuarios, icon: Users },
  { label: 'Sedes', route: ROUTES.admin.sedes, icon: Building2 },
  { label: 'Calendario', route: ROUTES.admin.reservas, icon: CalendarClock },
  { label: 'Verificaciones', route: ROUTES.admin.verificaciones, icon: CheckCircle },
];

export const AdminTabBar = () => {
  const location = useLocation();

  return (
    <div className="admin-surface rounded-xl px-2 py-2 shadow-lg">
      <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            location.pathname === tab.route ||
            (tab.route !== ROUTES.admin.dashboard && location.pathname.startsWith(tab.route));

          return (
            <Link
              key={tab.route}
              to={tab.route}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--primary)]/16 to-[var(--secondary)]/18 text-[var(--text-main)] shadow-sm'
                  : 'text-[var(--muted)] hover:bg-white/80'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
