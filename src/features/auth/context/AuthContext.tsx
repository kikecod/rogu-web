import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import authService from '../services/auth.service';

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

const TOKEN_REFRESH_BUFFER_MS = 30_000; // Usado solo para planificar logout automático (sin refresh)

const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const segments = token.split('.');
    if (segments.length < 2) return null;
    const payloadBase64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(payloadBase64);
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
};

const getTokenExpiry = (token: string): number | null => {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000;
};

export interface User {
  correo: string;
  usuario: string;
  id_persona: number;
  id_usuario: number;
  roles: string[]; // Array de roles como 'CLIENTE', 'DUENIO', 'ADMIN', etc.
  avatar?: string;
}

const normalizeUser = (raw: any): User => ({
  correo: raw?.correo ?? '',
  usuario: raw?.usuario ?? '',
  id_persona: raw?.id_persona ?? 0,
  id_usuario: raw?.id_usuario ?? 0,
  roles: Array.isArray(raw?.roles) ? raw.roles : [],
  avatar: raw?.avatar ?? undefined,
});

const loadStoredUser = (): User | null => {
  try {
    const data = localStorage.getItem('user');
    if (!data) return null;
    const parsed = JSON.parse(data);
    return normalizeUser(parsed);
  } catch {
    return null;
  }
};

const storeUser = (userData: User) => {
  try {
    localStorage.setItem('user', JSON.stringify(userData));
  } catch {
    // ignore storage errors
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    // ignore storage errors
  }
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (userData: User, token: string) => void;
  logout: () => Promise<void>;
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
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTokenRefreshRef = useRef<(() => Promise<void>) | null>(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current !== null) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const performLocalLogout = () => {
    clearLogoutTimer();
    clearStoredAuth();
    setUser(null);
    setIsLoggedIn(false);
  };

  const hydrateUserProfile = async (): Promise<User | null> => {
    // Ya no llamamos /auth/profile. Si no hay user en storage,
    // intentamos reconstruirlo desde el token JWT (payload).
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = decodeJwt(token) || {};
      const candidate: User = normalizeUser({
        correo: (payload as any)?.correo,
        usuario: (payload as any)?.usuario,
        id_persona: (payload as any)?.id_persona,
        id_usuario: (payload as any)?.id_usuario ?? (payload as any)?.sub,
        roles: Array.isArray((payload as any)?.roles) ? (payload as any).roles : [],
      });
      storeUser(candidate);
      setUser(candidate);
      setIsLoggedIn(true);
      return candidate;
    } catch (error) {
      console.warn('No se pudo hidratar usuario desde token:', error);
      performLocalLogout();
      return null;
    }
  };

  const scheduleTokenCheck = (token: string) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return;
    const msUntilCheck = Math.max(expiry - Date.now() - TOKEN_REFRESH_BUFFER_MS, 0);
    clearLogoutTimer();
    if (msUntilCheck <= 0) {
      const handler = handleTokenRefreshRef.current;
      if (handler) void handler();
      return;
    }
    logoutTimerRef.current = setTimeout(() => {
      const handler = handleTokenRefreshRef.current;
      if (handler) void handler();
    }, msUntilCheck);
  };

  const handleTokenRefresh = async () => {
    clearLogoutTimer();
    let currentToken: string | null = null;
    try {
      currentToken = localStorage.getItem('token');
    } catch {
      currentToken = null;
    }

    if (!currentToken) {
      performLocalLogout();
      return;
    }

    const expiry = getTokenExpiry(currentToken);
    if (expiry && expiry - Date.now() > TOKEN_REFRESH_BUFFER_MS) {
      scheduleTokenCheck(currentToken);
      return;
    }
    // Refresh deshabilitado: al llegar aquí, el token está por expirar o expiró -> cerrar sesión
    performLocalLogout();
  };

  handleTokenRefreshRef.current = handleTokenRefresh;

  useEffect(() => {
    return () => {
      clearLogoutTimer();
    };
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initAuth = async () => {
      let token: string | null = null;
      try {
        token = localStorage.getItem('token');
      } catch {
        token = null;
      }

      let storedUser = loadStoredUser();

      try {
        if (token) {
          const expiry = getTokenExpiry(token);
          if (expiry && expiry <= Date.now()) {
            clearStoredAuth();
            performLocalLogout();
            return;
          }

          if (storedUser) {
            setUser(storedUser);
            setIsLoggedIn(true);
          } else {
            storedUser = await hydrateUserProfile();
            if (!storedUser) {
              return;
            }
          }

          scheduleTokenCheck(token);
          return;
        }

        // Sin token y sin refresh: mantener deslogueado
        performLocalLogout();
      } catch (error) {
        console.error('Error al inicializar autenticacion:', error);
        performLocalLogout();
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, []);

  const login = (userData: User, token: string) => {
    try {
      localStorage.setItem('token', token);
    } catch {
      // ignore
    }
    storeUser(userData);
    setUser(userData);
    setIsLoggedIn(true);
    scheduleTokenCheck(token);
  };

  const logout = async () => {
    try {
      // Invalida la cookie httpOnly de refresh en el backend
      await authService.logout();
    } catch {
      // ignorar errores de red al cerrar sesión
    } finally {
      // Siempre limpiar estado local
      performLocalLogout();
    }
  };

  const updateUser = (userData: User) => {
    storeUser(userData);
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
