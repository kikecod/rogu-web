import React, { useState } from 'react';
import { X, Mail, Lock, Trophy, Users, Zap } from 'lucide-react';
import { useAuth, type User } from '../contexts/AuthContext';

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

  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'signup') {
        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmPassword) {
          alert('Las contraseñas no coinciden');
          setIsLoading(false);
          return;
        }

        // Validar datos antes de enviar
        if (!formData.nombres || !formData.paterno || !formData.materno) {
          alert('Por favor completa todos los campos de nombre');
          setIsLoading(false);
          return;
        }
        
        if (!formData.telefono || !formData.fechaNacimiento) {
          alert('Por favor completa el teléfono y fecha de nacimiento');
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

        const personaResponse = await fetch('http://localhost:3000/api/personas', {
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

        const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
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

        alert('Registro exitoso! Tu cuenta ha sido creada con rol de cliente. Ahora puedes iniciar sesión');
        onSwitchMode(); // Cambiar a modo login
      } else {
        // Validar campos de login
        if (!formData.email || !formData.password) {
          alert('Por favor completa el correo y la contraseña');
          setIsLoading(false);
          return;
        }

        // Lógica de login
        const loginData = {
          correo: formData.email,
          contrasena: formData.password
        };

        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });

        if (!loginResponse.ok) {
          const errorText = await loginResponse.text();
          throw new Error(`Error en el login: ${errorText}`);
        }

        const loginResult = await loginResponse.json();
        
        // Usar el hook de auth para manejar el login
        login(loginResult.usuario, loginResult.token);
        
        alert(`¡Bienvenido ${loginResult.usuario.correo}!`);
        
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
      alert(`Error en el proceso: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      <div className="flex items-center justify-center min-h-screen px-3 py-4 text-center sm:px-4 sm:py-8">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-neutral-900 bg-opacity-75 backdrop-blur-sm" onClick={onClose}></div>
        </div>

        {/* Modal content */}
        <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-sm sm:max-w-md mx-auto">
          
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-6 pt-8 pb-12">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full mb-4 p-3 sm:p-4">
                <img 
                  src="/logo_rogu-blanco.png" 
                  alt="ROGU" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {mode === 'login' ? '¡Bienvenido de vuelta!' : '¡Únete a ROGU!'}
              </h2>
              <p className="text-blue-100 text-sm">
                {mode === 'login' 
                  ? 'Accede a tu cuenta y reserva tu cancha favorita'
                  : 'Crea tu cuenta y descubre miles de espacios deportivos'
                }
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-6 py-8">
            {mode === 'signup' && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-xs text-neutral-600">Reserva instantánea</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-neutral-600">Mejores canchas</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <p className="text-xs text-neutral-600">Comunidad activa</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  {/* Nombres */}
                  <div>
                    <label htmlFor="nombres" className="block text-sm font-medium text-neutral-700 mb-1">
                      Nombres
                    </label>
                    <input
                      type="text"
                      id="nombres"
                      name="nombres"
                      required
                      value={formData.nombres}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej: Juan Carlos"
                    />
                  </div>

                  {/* Apellidos */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="paterno" className="block text-sm font-medium text-neutral-700 mb-1">
                        Apellido Paterno
                      </label>
                      <input
                        type="text"
                        id="paterno"
                        name="paterno"
                        required
                        value={formData.paterno}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Pérez"
                      />
                    </div>
                    <div>
                      <label htmlFor="materno" className="block text-sm font-medium text-neutral-700 mb-1">
                        Apellido Materno
                      </label>
                      <input
                        type="text"
                        id="materno"
                        name="materno"
                        required
                        value={formData.materno}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="López"
                      />
                    </div>
                  </div>

                  {/* Usuario */}
                  <div>
                    <label htmlFor="usuario" className="block text-sm font-medium text-neutral-700 mb-1">
                      Nombre de usuario
                    </label>
                    <input
                      type="text"
                      id="usuario"
                      name="usuario"
                      required
                      value={formData.usuario}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="juan.perez"
                    />
                  </div>

                  {/* Teléfono y Fecha */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-neutral-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        required
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="5512345678"
                      />
                    </div>
                    <div>
                      <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-neutral-700 mb-1">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        id="fechaNacimiento"
                        name="fechaNacimiento"
                        required
                        value={formData.fechaNacimiento}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Género */}
                  <div>
                    <label htmlFor="genero" className="block text-sm font-medium text-neutral-700 mb-1">
                      Género
                    </label>
                    <select
                      id="genero"
                      name="genero"
                      required
                      value={formData.genero}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-xl leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-xl leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-xl leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
                )}
              </button>
          </form>

            {/* Switch mode */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button
                  onClick={onSwitchMode}
                  className="ml-1 font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
                </button>
              </p>
            </div>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">O continúa con</span>
                </div>
              </div>
            </div>

            {/* Social login options */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center items-center py-3 px-4 border border-neutral-300 rounded-xl shadow-sm bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <button className="w-full inline-flex justify-center items-center py-3 px-4 border border-neutral-300 rounded-xl shadow-sm bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Terms */}
            {mode === 'signup' && (
              <p className="mt-6 text-xs text-center text-neutral-500">
                Al crear una cuenta, aceptas nuestros{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Términos de servicio
                </a>{' '}
                y{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Política de privacidad
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;