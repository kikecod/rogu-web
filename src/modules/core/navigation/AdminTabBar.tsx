import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, CheckCircle, CalendarClock } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import {
  LayoutDashboard,
  Users,
  Building2,

  FileText,
  BarChart3
} from 'lucide-react';

interface AdminTab {
  label: string;
  route: string;
  icon: React.ElementType;
}

const adminTabs: AdminTab[] = [
  {
    label: 'Dashboard',
    route: ROUTES.admin.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: 'Usuarios',
    route: ROUTES.admin.usuarios,
    icon: Users,
  },
  {
    label: 'Sedes',
    route: ROUTES.admin.sedes,
    icon: Building2,
  },

  {
    label: 'Reportes',
    route: ROUTES.admin.reportes,
    icon: FileText,
  },
  {
    label: 'Analytics',
    route: ROUTES.admin.analytics,
    icon: BarChart3,
  },
];

export const AdminTabBar = () => {
  const location = useLocation();

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.route ||
              (tab.route !== ROUTES.admin.dashboard && location.pathname.startsWith(tab.route));

            return (
              <Link
                key={tab.route}
                to={tab.route}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                  ${isActive
                    ? 'border-purple-600 text-purple-700 bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
