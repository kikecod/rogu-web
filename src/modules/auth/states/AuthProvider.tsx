import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types/auth.types';

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

export const useAuthContext = () => {
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

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
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

    initAuth();
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
