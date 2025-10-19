import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Shield, Users, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';

const HostSpacePage: React.FC = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { user, isLoggedIn, isDuenio, updateUser } = useAuth();

  const createDuenio = async (id_persona: number) => {
    const duenioData = {
      id_personaD: id_persona,
      verificado: false,
      imagenCI: 'pending_upload', // Placeholder hasta que implementes la subida
      imagenFacial: 'pending_upload', // Placeholder hasta que implementes la subida
    };

    const response = await fetch('http://localhost:3000/api/duenio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Agregar autorización
      },
      body: JSON.stringify(duenioData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el dueño');
    }

    return await response.json();
  };

  const handleConfirmOwnership = async () => {
    if (!isLoggedIn || !user) {
      setErrorMessage('Debes iniciar sesión para continuar');
      return;
    }

    // Verificar si ya es dueño
    if (isDuenio()) {
      setErrorMessage('Ya eres dueño de espacios deportivos');
      setTimeout(() => {
        navigate('/admin-spaces');
      }, 2000);
      return;
    }

    setIsConfirming(true);
    setConfirmationStatus('idle');
    setErrorMessage('');

    try {
      // Usar el id_persona del usuario loggeado
      const id_persona = user.id_persona;
      
      if (!id_persona) {
        throw new Error('No se encontró el ID de persona del usuario');
      }

      await createDuenio(id_persona);
      
      // Actualizar el usuario con el nuevo rol de DUENIO
      const updatedUser = {
        ...user,
        roles: [...(user.roles || []), 'DUENIO']
      };
      updateUser(updatedUser);
      
      setConfirmationStatus('success');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/admin-spaces');
      }, 2000);
      
    } catch (error) {
      console.error('Error en el proceso:', error);
      setConfirmationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsConfirming(false);
    }
  };

  // Si no está loggeado, mostrar mensaje para iniciar sesión
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Inicia sesión requerido
            </h2>
            <p className="text-gray-600 mb-6">
              Para ofrecer tu espacio deportivo, necesitas tener una cuenta en ROGU.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ir al inicio e iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si ya es dueño, mostrar mensaje y redirigir
  if (isDuenio()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Ya eres dueño!
            </h2>
            <p className="text-gray-600 mb-6">
              Ya tienes permisos de dueño de espacios deportivos. Te llevaremos a tu panel de administración.
            </p>
            <button
              onClick={() => navigate('/admin-spaces')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ir al Panel de Administración
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si ya confirmó, mostrar estado de éxito
  if (confirmationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Bienvenido como dueño!
            </h2>
            <p className="text-gray-600 mb-6">
              Te has convertido exitosamente en dueño de espacios deportivos. 
              Serás redirigido a tu panel de administración...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Página principal de confirmación
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">
              Ofrece tu espacio deportivo
            </h1>
            <p className="text-blue-100 mt-2">
              Únete a nuestra red de propietarios de espacios deportivos
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Error Message */}
            {confirmationStatus === 'error' && (
              <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-lg mb-6">
                <AlertCircle className="h-5 w-5 mr-3" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Usuario actual */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Cuenta actual:</h3>
              <p className="text-blue-800">Usuario: {user?.usuario}</p>
              <p className="text-blue-800">Correo: {user?.correo}</p>
            </div>

            {/* Beneficios */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Beneficios de ser dueño en ROGU:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Gestiona tus espacios</h4>
                  <p className="text-sm text-gray-600">
                    Administra múltiples canchas y espacios deportivos desde un solo lugar
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Conecta con clientes</h4>
                  <p className="text-sm text-gray-600">
                    Accede a miles de usuarios que buscan espacios deportivos
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Pagos seguros</h4>
                  <p className="text-sm text-gray-600">
                    Sistema de pagos protegido y gestión automática de reservas
                  </p>
                </div>
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">¿Qué sucede después?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Tu cuenta será marcada como "dueño" en el sistema</li>
                    <li>Podrás acceder al panel de administración de espacios</li>
                    <li>Más adelante implementaremos la verificación con documentos</li>
                    <li>Podrás empezar a agregar y gestionar tus espacios deportivos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Términos y condiciones */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Términos para dueños:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Comprometes a mantener tus espacios en buen estado</li>
                <li>• Proporcionarás información veraz sobre tus instalaciones</li>
                <li>• Respetarás los horarios de reserva de los usuarios</li>
                <li>• Cumplirás con las políticas de ROGU</li>
              </ul>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmOwnership}
                disabled={isConfirming}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isConfirming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirmando...
                  </>
                ) : (
                  'Confirmar y convertirme en dueño'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostSpacePage;
