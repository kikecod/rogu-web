import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Shield, Users, MapPin, FileCheck, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/config/routes';

interface VerificationStatus {
  hasVerification: boolean;
  inquiryId?: string;
  status?: string;
  aprobada?: boolean;
  verificado?: boolean;
}

const HostSpacePage: React.FC = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [isLoadingVerification, setIsLoadingVerification] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn, isDuenio, logout } = useAuth();

  // Verificar si el usuario ya tiene un proceso de verificación en Persona
  useEffect(() => {
    if (isLoggedIn && user?.idPersona) {
      checkVerificationStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user]);

  // Polling para verificar el estado de verificación cada 5 segundos
  useEffect(() => {
    if (!isLoggedIn || !user?.idPersona || !verificationStatus?.hasVerification) {
      return;
    }

    // Si ya está verificado, no hace falta seguir haciendo polling
    if (verificationStatus?.verificado) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const estadoResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/duenio/${user?.idPersona}/verificacion/estado`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (estadoResponse.ok) {
          const estadoData = await estadoResponse.json();

          // Si la verificación fue aprobada, actualizar estado para mostrar pantalla de éxito
          if (estadoData.verificado === true) {
            setVerificationStatus(prev => prev ? { ...prev, verificado: true } : null);
          }
        }
      } catch (error) {
        console.error('Error en polling de verificación:', error);
      }
    }, 2500); // Verificar cada 2.5 segundos

    return () => clearInterval(interval);
  }, [isLoggedIn, user?.idPersona, verificationStatus?.hasVerification, verificationStatus?.verificado]);

  const checkVerificationStatus = async () => {
    try {
      // Verificar si ya es dueño usando el idPersona como PK
      const duenioResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/duenio/${user?.idPersona}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (duenioResponse.ok) {
        const duenioData = await duenioResponse.json();

        setVerificationStatus({
          hasVerification: !!duenioData.inquiryId,
          inquiryId: duenioData.inquiryId,
          status: duenioData.personaStatus,
          aprobada: duenioData.personaStatus === 'approved' || duenioData.personaStatus === "completed",
          verificado: duenioData.verificado,
        });
      }
    } catch (error) {
      console.error('Error al verificar estado:', error);
    }
  };

  const iniciarVerificacionIdentidad = async () => {
    setIsLoadingVerification(true);
    setErrorMessage('');

    try {

      // Usar el endpoint de dueño para iniciar verificación
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/duenio/${user?.idPersona}/verificacion/iniciar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al iniciar verificación de identidad');
      }

      const data = await response.json();

      return {
        inquiryId: data.inquiryId,
        verificationUrl: data.verificationUrl,
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsLoadingVerification(false);
    }
  };

  const createDuenio = async (idPersona: number) => {
    const duenioData = {
      idPersonaD: idPersona,
      verificado: false,
      imagenCI: 'pending_verification',
      imagenFacial: 'pending_verification',
    };

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/duenio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

    // Verificar si ya es dueño verificado
    if (isDuenio() && verificationStatus?.verificado === true) {
      setErrorMessage('Ya eres dueño verificado de espacios deportivos');
      setTimeout(() => {
        navigate('/admin-spaces');
      }, 2000);
      return;
    }

    // Si ya es dueño pero no verificado, mostrar mensaje diferente
    if (isDuenio() && !verificationStatus?.verificado) {
      setErrorMessage('Ya tienes un registro de dueño. Por favor, completa tu verificación de identidad.');
      return;
    }

    setIsConfirming(true);
    setConfirmationStatus('idle');
    setErrorMessage('');

    try {
      const idPersona = user.idPersona;

      if (!idPersona) {
        throw new Error('No se encontró el ID de persona del usuario');
      }

      // PASO 1: Crear el registro de dueño PRIMERO (con verificado: false)
      await createDuenio(idPersona);


      // PASO 2: Iniciar proceso de verificación de identidad
      const verificationData = await iniciarVerificacionIdentidad();

      // PASO 3: Abrir la URL de verificación en una ventana emergente centrada
      const width = 600;
      const height = 800;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);
      window.open(
        verificationData.verificationUrl,
        'Verificación de Identidad',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      setConfirmationStatus('success');

      // Actualizar el estado de verificación
      await checkVerificationStatus();

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
              onClick={() => navigate(ROUTES.home)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ir al inicio e iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si ya es dueño Y está verificado, mostrar mensaje y redirigir
  if (isDuenio() && verificationStatus?.verificado === true) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Ya eres dueño verificado!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu identidad ha sido verificada y ya tienes permisos completos. Te llevaremos a tu panel de administración.
            </p>
            <button
              onClick={() => navigate(ROUTES.owner.mode)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ir al Modo Dueño
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si ya confirmó, mostrar estado de verificación en proceso o completado
  if (confirmationStatus === 'success') {
    // Si ya está verificado, mostrar pantalla de éxito con logout
    if (verificationStatus?.verificado === true) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6 animate-bounce" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Ya eres dueño!
              </h2>
              <p className="text-gray-600 mb-2">
                Tu identidad ha sido verificada exitosamente.
              </p>
              <p className="text-gray-600 mb-8">
                Por favor, vuelve a iniciar sesión para acceder a tus nuevos permisos de dueño.
              </p>
              <button
                onClick={() => {
                  logout();
                  navigate(ROUTES.home);
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white text-lg rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all shadow-lg"
              >
                Volver a iniciar sesión
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Si aún está en proceso, mostrar pantalla de verificación
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Estamos verificando tu identidad...
              </h2>
              <p className="text-gray-600">
                Por favor espera mientras revisamos tu información. Esto normalmente toma unos minutos.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FileCheck className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">Estado de la verificación</h3>
                    <p className="text-sm text-blue-800 mb-2">
                      Estamos procesando tu verificación de identidad con Persona.
                    </p>
                    <div className="flex items-center text-sm text-blue-700">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Verificación en proceso...</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Mientras esperas:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>No cierres esta ventana</li>
                      <li>La página se actualizará automáticamente cuando se complete</li>
                      <li>Si completaste la verificación en la ventana emergente, solo espera</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => navigate(ROUTES.home)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
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

            {/* Estado de verificación si existe */}
            {verificationStatus?.hasVerification && (
              <div className="mb-6">
                {verificationStatus.aprobada ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-medium text-green-900">Identidad verificada ✓</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Tu identidad ha sido verificada exitosamente. Ya puedes gestionar tus espacios.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : verificationStatus.status === 'pending' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Loader2 className="h-6 w-6 text-yellow-600 mr-3 animate-spin" />
                      <div>
                        <h3 className="font-medium text-yellow-900">Verificación en proceso</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          Tu verificación de identidad está siendo revisada. Te notificaremos cuando esté lista.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : verificationStatus.status === 'created' ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-6 w-6 text-orange-600 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium text-orange-900">Verificación pendiente</h3>
                        <p className="text-sm text-orange-700 mt-1 mb-3">
                          Necesitas completar tu verificación de identidad para poder gestionar espacios.
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                `${import.meta.env.VITE_API_BASE_URL}/duenio/${user?.idPersona}/verificacion/iniciar`,
                                {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                  },
                                }
                              );
                              const data = await response.json();

                              // Abrir ventana emergente centrada
                              const width = 600;
                              const height = 800;
                              const left = (window.screen.width / 2) - (width / 2);
                              const top = (window.screen.height / 2) - (height / 2);
                              window.open(
                                data.verificationUrl,
                                'Verificación de Identidad',
                                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                              );
                            } catch (error) {
                              console.error('Error al abrir verificación:', error);
                            }
                          }}
                          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Completar verificación ahora
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                      <div>
                        <h3 className="font-medium text-red-900">Verificación rechazada</h3>
                        <p className="text-sm text-red-700 mt-1">
                          Tu verificación no fue aprobada. Contacta con soporte para más información.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Beneficios */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Beneficios de ser dueño verificado en ROGU:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileCheck className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Identidad verificada</h4>
                  <p className="text-sm text-gray-600">
                    Verificación de identidad que genera confianza en tus clientes
                  </p>
                </div>
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Proceso de registro como dueño:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Iniciarás tu registro como dueño en el sistema</li>
                    <li>Deberás completar la <strong>verificación de identidad con Persona</strong></li>
                    <li>El proceso incluye tomar fotos de tu documento de identidad y una selfie</li>
                    <li>La verificación es segura y cumple con estándares internacionales</li>
                    <li>Una vez aprobada tu identidad, podrás gestionar tus espacios</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Requisitos de verificación */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FileCheck className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                <div className="text-sm text-purple-800">
                  <p className="font-medium mb-2">Requisitos para la verificación de identidad:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="font-medium mb-1">📄 Documentos aceptados:</p>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        <li>Cédula de Ciudadanía (CC)</li>
                        <li>Cédula de Extranjería (CE)</li>
                        <li>Pasaporte (PP)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">📱 Necesitarás:</p>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        <li>Cámara web o smartphone</li>
                        <li>Buena iluminación</li>
                        <li>Documento físico a la mano</li>
                      </ul>
                    </div>
                  </div>
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
                onClick={() => navigate(ROUTES.home)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={isConfirming || isLoadingVerification || verificationStatus?.hasVerification}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmOwnership}
                disabled={isConfirming || isLoadingVerification || verificationStatus?.hasVerification}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isConfirming || isLoadingVerification ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Iniciando proceso...
                  </>
                ) : verificationStatus?.hasVerification ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Registro ya iniciado
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Iniciar registro y verificación
                  </>
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