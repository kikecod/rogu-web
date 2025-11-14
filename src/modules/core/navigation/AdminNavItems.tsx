import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CheckCircle, 
  BarChart3, 
  Settings,
  FileText
} from 'lucide-react';

interface AdminNavItemsProps {
  onItemClick: () => void;
}

export const AdminNavItems = ({ onItemClick }: AdminNavItemsProps) => {
  return (
    <>
      <div className="px-4 py-2 border-t border-b border-gray-200 bg-purple-50">
        <p className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
          Panel de Administrador
        </p>
      </div>
      
      <Link
        to={ROUTES.admin.dashboard}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        onClick={onItemClick}
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>

      <Link
        to={ROUTES.admin.usuarios}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        onClick={onItemClick}
      >
        <Users className="h-4 w-4" />
        Gestión de Usuarios
      </Link>

      <Link
        to={ROUTES.admin.sedes}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        onClick={onItemClick}
      >
        <Building2 className="h-4 w-4" />
        Gestión de Sedes
      </Link>

      <Link
        to={ROUTES.admin.verificaciones}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        onClick={onItemClick}
      >
        <CheckCircle className="h-4 w-4" />
        Verificaciones
      </Link>

      <Link
        to={ROUTES.admin.reportes}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        onClick={onItemClick}
      >
        <FileText className="h-4 w-4" />
        Reportes
      </Link>

      <Link
        to={ROUTES.admin.analytics}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        onClick={onItemClick}
      >
        <BarChart3 className="h-4 w-4" />
        Analytics
      </Link>

      <Link
        to={ROUTES.admin.configuracion}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        onClick={onItemClick}
      >
        <Settings className="h-4 w-4" />
        Configuración
      </Link>
    </>
  );
};
