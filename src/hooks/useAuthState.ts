import { useEffect, useState } from 'react';
// Ejemplo mínimo de hook que expone estado de autenticación basado en localStorage
export function useAuthState() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    const handler = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return {
    token,
    isAuthenticated: Boolean(token),
    logout,
  };
}
