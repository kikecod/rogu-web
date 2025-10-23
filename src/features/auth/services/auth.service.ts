import { httpClient } from '../../../lib/api/http-client';

export interface LoginResult {
  token: string;
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
  const res = await httpClient.post<LoginResult>(`${API_PREFIX}/login`, { correo, contrasena });
  return res.data;
}

export async function register(data: RegisterData): Promise<any> {
  const res = await httpClient.post(`${API_PREFIX}/register`, data);
  return res.data;
}

export async function refresh(): Promise<{ token: string } | null> {
  try {
    const res = await httpClient.post<any>(`${API_PREFIX}/refresh`);
    return res.data as { token: string };
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
