import { httpClient } from '../../../lib/api/http-client';

// Lo que expone nuestro servicio al resto de la app
export interface LoginResult {
  token: string; // accessToken del backend
  usuario: any;
}

export interface RegisterData {
  id_persona: number;
  usuario: string;
  correo: string;
  contrasena: string;
}

const API_PREFIX = '/auth';

export async function login(correo: string, contrasena: string): Promise<LoginResult> {
  // El backend responde { accessToken, usuario }
  const res = await httpClient.post<any>(`${API_PREFIX}/login`, { correo, contrasena });
  const data = res.data as { accessToken?: string; usuario?: any };
  return { token: data.accessToken ?? '', usuario: data.usuario } as LoginResult;
}

export async function register(data: RegisterData): Promise<any> {
  const res = await httpClient.post(`${API_PREFIX}/register`, data);
  return res.data;
}

export async function refresh(): Promise<{ token: string } | null> {
  try {
    // El backend responde { accessToken, usuario }
    const res = await httpClient.post<any>(`${API_PREFIX}/refresh`);
    const data = res.data as { accessToken?: string };
    if (!data?.accessToken) return null;
    return { token: data.accessToken };
  } catch (err) {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await httpClient.post(`${API_PREFIX}/logout`);
  } catch (err) {
    // ignore errors on logout
  }
}

export async function profile(): Promise<any> {
  const res = await httpClient.get<any>(`${API_PREFIX}/profile`);
  return res.data;
}

export default {
  login,
  register,
  refresh,
  logout,
  profile,
};
