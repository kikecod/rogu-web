import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { ROUTE_PATHS } from '../../../constants';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goHome = () => navigate(ROUTE_PATHS.HOME);
  const goBack = () => window.history.back();

  const goDashboard = () => {
    // Prefer owner dashboard if duenio, else admin, else user home
    const roles = user?.roles || [];
    if (roles.includes('DUENIO')) return navigate(ROUTE_PATHS.OWNER_DASHBOARD);
    if (roles.includes('ADMIN')) return navigate(ROUTE_PATHS.ADMIN_HOME);
    if (roles.includes('CLIENTE')) return navigate(ROUTE_PATHS.USER_HOME);
    return navigate(ROUTE_PATHS.HOME);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-6">La página que buscas no existe o fue movida.</p>
        <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
          <button onClick={goHome} className="px-4 py-2 bg-blue-600 text-white rounded-md">Ir al inicio</button>
          <button onClick={goDashboard} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md">Ir al dashboard</button>
          <button onClick={goBack} className="px-4 py-2 bg-transparent text-gray-600 rounded-md border border-gray-200">Volver</button>
        </div>
        <p className="text-sm text-gray-500 mt-6">Si crees que esto es un error, contacta con soporte.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
