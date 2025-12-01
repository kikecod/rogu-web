import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User as UserIcon, Calendar, Phone, ChevronRight } from 'lucide-react';
import { useAuth, type User } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: () => void;
  onLoginSuccess?: (userData: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    // Para login
    email: '',
    password: '',
    // Para registro - datos de persona
    nombres: '',
    paterno: '',
    materno: '',
    telefono: '',
    fechaNacimiento: '',
    genero: 'MASCULINO',
    // Para registro - datos de usuario
    usuario: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          setIsLoading(false);
          return;
        }

        // Validar datos antes de enviar
        if (!formData.nombres || !formData.paterno || !formData.materno) {
          setError('Por favor completa todos los campos de nombre');
          setIsLoading(false);
          return;
        }

        if (!formData.telefono || !formData.fechaNacimiento) {
          setError('Por favor completa el teléfono y fecha de nacimiento');
          setIsLoading(false);
          return;
        }

        // Paso 1: Crear persona
        const personaData = {
          nombres: formData.nombres.trim(),
          paterno: formData.paterno.trim(),
          materno: formData.materno.trim(),
          telefono: formData.telefono.trim(),
          fechaNacimiento: formData.fechaNacimiento,
          genero: formData.genero
        };

        const personaResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/personas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(personaData),
        });

        if (!personaResponse.ok) {
          const errorText = await personaResponse.text();
          throw new Error(`Error al crear la persona: ${errorText}`);
        }

        const personaResult = await personaResponse.json();
        const idPersona = personaResult.id || personaResult.idPersona;

        // Paso 2: Registrar usuario con rol CLIENTE automático usando el endpoint de auth
        const registerData = {
          idPersona: idPersona,
          usuario: formData.usuario,
          correo: formData.email,
          contrasena: formData.password
        };

        const registerResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerData),
        });

        if (!registerResponse.ok) {
          const errorText = await registerResponse.text();
          throw new Error(`Error al registrar el usuario: ${errorText}`);
        }

        // alert('Registro exitoso! Tu cuenta ha sido creada con rol de cliente. Ahora puedes iniciar sesión');
        onSwitchMode(); // Cambiar a modo login
        setError(null);
      } else {
        // Validar campos de login
        if (!formData.email || !formData.password) {
          setError('Por favor completa el correo y la contraseña');
          setIsLoading(false);
          return;
        }

        // Lógica de login
        const loginData = {
          correo: formData.email,
          contrasena: formData.password
        };

        const loginResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });

        if (!loginResponse.ok) {
          const errorData = await loginResponse.json().catch(() => ({ message: 'Error desconocido' }));

          if (loginResponse.status === 401) {
            throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
          }

          throw new Error(errorData.message || `Error en el login (${loginResponse.status})`);
        }

        const loginResult = await loginResponse.json();

        // Usar el hook de auth para manejar el login
        login(loginResult.usuario, loginResult.token);

        // alert(`¡Bienvenido ${loginResult.usuario.correo}!`);

        // Cerrar modal inmediatamente después del login exitoso
        onClose();

        // Actualizar estado en App si hay callback
        if (onLoginSuccess) {
          onLoginSuccess(loginResult.usuario);
        }
      }
    } catch (error) {
      console.error('Error completo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error al escribir
    if (error) setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm" onClick={onClose}></div>
        </div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-black/5 rounded-full transition-colors text-neutral-500 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col">
            {/* Header Section */}
            <div className="bg-white px-8 pt-8 pb-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4 shadow-sm">
                  <img
                    src="/logo_rogu.png"
                    alt="ROGU"
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      // Fallback si no carga el logo
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.classList.add('text-blue-600');
                      e.currentTarget.parentElement!.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>';
                    }}
                  />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                </h2>
                <p className="text-neutral-500 mt-2 text-sm">
                  {mode === 'login'
                    ? 'Ingresa a tu cuenta para gestionar tus reservas'
                    : 'Únete a la comunidad deportiva más grande'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-neutral-100 rounded-xl mb-6">
                <button
                  onClick={() => mode !== 'login' && onSwitchMode()}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${mode === 'login'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => mode !== 'signup' && onSwitchMode()}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${mode === 'signup'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                  Registrarse
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <X className="w-3 h-3 text-red-600" />
                  </div>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Nombres */}
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                          type="text"
                          name="nombres"
                          required
                          value={formData.nombres}
                          onChange={handleInputChange}
                          className="block w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                          placeholder="Nombres"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="paterno"
                          required
                          value={formData.paterno}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                          placeholder="Apellido Paterno"
                        />
                        <input
                          type="text"
                          name="materno"
                          required
                          value={formData.materno}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                          placeholder="Apellido Materno"
                        />
                      </div>
                    </div>

                    {/* Contacto */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-neutral-400" />
                        </div>
                        <input
                          type="tel"
                          name="telefono"
                          required
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                          placeholder="Teléfono"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Calendar className="h-4 w-4 text-neutral-400" />
                        </div>
                        <input
                          type="date"
                          name="fechaNacimiento"
                          required
                          value={formData.fechaNacimiento}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-neutral-500"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        type="text"
                        name="usuario"
                        required
                        value={formData.usuario}
                        onChange={handleInputChange}
                        className="block w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                        placeholder="Nombre de usuario"
                      />
                    </div>
                  </div>
                )}

                {/* Email & Password (Common) */}
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      placeholder="Correo electrónico"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      placeholder="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {mode === 'signup' && (
                    <div className="relative animate-fadeIn">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="block w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                        placeholder="Confirmar contraseña"
                      />
                    </div>
                  )}
                </div>

                {mode === 'login' && (
                  <div className="flex items-center justify-end">
                    <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Login */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-neutral-500">O continúa con</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center px-4 py-2.5 border border-neutral-200 rounded-xl shadow-sm bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all">
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  
                </div>
              </div>

              {/* Footer */}
              {mode === 'signup' && (
                <p className="mt-8 text-xs text-center text-neutral-500 px-4">
                  Al crear una cuenta, aceptas nuestros{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Términos de servicio
                  </a>{' '}
                  y{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Política de privacidad
                  </a>
                </p>
              )}
            </div>

            {/* Bottom Banner */}
            <div className="bg-neutral-50 px-8 py-4 text-center border-t border-neutral-100">
              <p className="text-sm text-neutral-600">
                {mode === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                <button
                  onClick={onSwitchMode}
                  className="ml-1.5 font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;