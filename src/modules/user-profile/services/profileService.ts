import { getApiUrl } from '@/core/config/api';
import type { UserProfileData } from '../types/profile.types';
import { getMockProfileData } from '../lib/mockProfile';

interface UpdateUserBasicRequest {
  id_usuario: number;
  correo: string;
  usuario: string;
}

interface ChangePasswordRequest {
  id_usuario: number;
  nuevaContrasena: string;
}

// Flag para usar datos mock (cambiar a false cuando el backend esté listo)
const USE_MOCK_DATA = false;

class ProfileService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtiene el perfil completo del usuario autenticado
   */
  async fetchProfile(): Promise<UserProfileData> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Modo mock para desarrollo
    if (USE_MOCK_DATA) {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No hay datos de usuario');
      }
      
      const user = JSON.parse(userStr);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return getMockProfileData(
        user.idUsuario || user.id_usuario || 1,
        user.correo || 'usuario@example.com',
        user.usuario || 'usuario',
        user.roles || ['CLIENTE']
      );
    }

    // REAL API MODE
    const url = getApiUrl('/auth/profile');
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw { status: res.status, message: `Error ${res.status}` };
    }

    const data = await res.json();
    console.log('📥 Datos recibidos del backend:', JSON.stringify(data, null, 2));
    return data;
  }

  /**
   * Actualiza los datos básicos del usuario (correo y usuario)
   */
  async updateUserBasic(request: UpdateUserBasicRequest): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Modo mock para desarrollo
    if (USE_MOCK_DATA) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.correo = request.correo;
        user.usuario = request.usuario;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      console.log('✅ Datos actualizados (modo mock):', request);
      return;
    }

    // Modo real con backend
    const response = await fetch(getApiUrl(`/usuarios/${request.id_usuario}`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo: request.correo,
        usuario: request.usuario,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar los datos');
    }
  }

  /**
   * Cambia la contraseña del usuario
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Modo mock para desarrollo
    if (USE_MOCK_DATA) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Contraseña actualizada (modo mock)');
      return;
    }

    // Modo real con backend
    const response = await fetch(getApiUrl(`/usuarios/${request.id_usuario}/cambiar-contrasena`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nuevaContrasena: request.nuevaContrasena,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cambiar la contraseña');
    }
  }
}

const profileService = new ProfileService();
export default profileService;
