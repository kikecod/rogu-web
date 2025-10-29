// Auth Service - Handles authentication API calls
import { getApiUrl } from '@/core/config/api';
import type { LoginCredentials, RegisterData, LoginResponse, RegisterResponse } from '../types/auth.types';

export class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl('/auth');
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo: credentials.email,
        contrasena: credentials.password,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Error al iniciar sesión');
    }

    return await response.json();
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    // Step 1: Create persona
    const personaResponse = await fetch(getApiUrl('/personas'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombres: data.nombres.trim(),
        paterno: data.paterno.trim(),
        materno: data.materno.trim(),
        telefono: data.telefono.trim(),
        fechaNacimiento: data.fechaNacimiento,
        genero: data.genero,
      }),
    });

    if (!personaResponse.ok) {
      const errorText = await personaResponse.text();
      throw new Error(`Error al crear la persona: ${errorText}`);
    }

    const personaResult = await personaResponse.json();
    const idPersona = personaResult.id || personaResult.idPersona;

    // Step 2: Register user with CLIENTE role
    const registerResponse = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idPersona: idPersona,
        usuario: data.usuario,
        correo: data.correo,
        contrasena: data.contrasena,
      }),
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      throw new Error(`Error al registrar usuario: ${errorText}`);
    }

    return await registerResponse.json();
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// Singleton instance
export const authService = new AuthService();
