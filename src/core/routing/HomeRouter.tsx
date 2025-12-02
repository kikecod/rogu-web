import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { useMode } from '../hooks/useMode';
import HomePage from '@/search/pages/HomePage';
import { ROUTES } from '@/config/routes';

/**
 * Componente que decide qué página mostrar en la ruta raíz "/"
 * según el modo actual (cliente/dueño) y los permisos del usuario
 */
const HomeRouter: React.FC = () => {
  const { isDuenio, isAdmin } = useAuth();
  const { mode } = useMode();

  // IMPORTANTE: Solo DUENIO puede ir a owner dashboard
  // ADMIN nunca debe ser redirigido a owner, tiene su propio panel
  if (mode === 'duenio' && isDuenio() && !isAdmin()) {
    return <Navigate to={ROUTES.owner.dashboard} replace />;
  }

  // En cualquier otro caso, mostrar la página de cliente
  return <HomePage />;
};

export default HomeRouter;
