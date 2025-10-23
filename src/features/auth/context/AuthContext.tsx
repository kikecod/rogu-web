import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import authService from '../services/auth.service';

export interface User {
  correo: string;
  usuario: string;
  id_persona: number;
  id_usuario: number;
  roles: string[]; // Array de roles como 'CLIENTE', 'DUENIO', 'ADMIN', etc.
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isDuenio: () => boolean;
  isCliente: () => boolean;
  isControlador: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } else if (!token) {
          const refreshOnStart = import.meta.env.VITE_AUTH_REFRESH_ON_START !== 'false';
          if (!refreshOnStart) {
            setUser(null);
            setIsLoggedIn(false);
            setIsLoading(false);
            return;
          }
          // Intentar refrescar sesión si existe refresh cookie httpOnly
          const refreshed = await authService.refresh();
          if (refreshed?.token) {
            // Guardar nuevo access token y obtener perfil del usuario
            localStorage.setItem('token', refreshed.token);
            try {
              const currentUser = await authService.profile();
              // Asegurar forma User según nuestro contexto
              const normalizedUser: User = {
                correo: currentUser?.correo,
                usuario: currentUser?.usuario,
                id_persona: currentUser?.id_persona,
                id_usuario: currentUser?.id_usuario,
                roles: currentUser?.roles || [],
                avatar: currentUser?.avatar,
              };
              localStorage.setItem('user', JSON.stringify(normalizedUser));
              setUser(normalizedUser);
              setIsLoggedIn(true);
            } catch {
              // Si falla obtener perfil, limpiar estado
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setIsLoggedIn(false);
            }
          } else {
            setUser(null);
            setIsLoggedIn(false);
          }
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  // Verificar si el usuario tiene alguno de los roles especificados
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  // Verificar si el usuario tiene todos los roles especificados
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => hasRole(role));
  };

  // Verificar si es administrador
  const isAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  // Verificar si es dueño
  const isDuenio = (): boolean => {
    return hasRole('DUENIO');
  };

  // Verificar si es cliente
  const isCliente = (): boolean => {
    return hasRole('CLIENTE');
  };

  // Verificar si es controlador
  const isControlador = (): boolean => {
    return hasRole('CONTROLADOR');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isDuenio,
    isCliente,
    isControlador,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;