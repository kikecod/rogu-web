/**
 * Cliente HTTP base para todas las llamadas a la API
 * Maneja autenticación, interceptores y configuración centralizada
 */

import { API_CONFIG } from '../config/api';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status: number;
  statusText: string;
  data?: any;
}

export class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  // refresh deshabilitado

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || API_CONFIG.baseURL;
    this.timeout = config.timeout || API_CONFIG.timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Obtiene los headers con autenticación
   */
  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const token = localStorage.getItem('token');
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Maneja errores de respuesta HTTP
   */
  private handleError(response: Response, data?: any): ApiError {
    const error: ApiError = {
      message: data?.message || `HTTP Error ${response.status}`,
      status: response.status,
      statusText: response.statusText,
      data,
    };

    // Manejo específico de errores comunes
    switch (response.status) {
      case 401:
        error.message = 'No autorizado. Por favor, inicia sesión nuevamente.';
        break;
      case 403:
        error.message = 'No tienes permisos para realizar esta acción.';
        break;
      case 404:
        error.message = 'Recurso no encontrado.';
        break;
      case 500:
        error.message = 'Error interno del servidor. Intenta nuevamente más tarde.';
        break;
    }

    return error;
  }

  /**
   * Determina si se deben incluir credenciales (cookies) en la petición
   * Útil para endpoints de auth con refresh tokens en httpOnly cookies
   */
  private shouldIncludeCredentials(_url: string): boolean {
    // Refresh deshabilitado: no necesitamos enviar cookies httpOnly
    return false;
  }

  /**
   * Intenta refrescar el token de acceso usando /auth/refresh
   * Retorna el nuevo token o null si falla
   */
  // refresh deshabilitado

  /**
   * Realiza una petición HTTP genérica
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    const config: RequestInit = {
      ...options,
      headers: this.getHeaders(options.headers as Record<string, string>),
      credentials: this.shouldIncludeCredentials(url) ? 'include' : options.credentials,
    };

    // Si estamos enviando FormData, no debemos establecer Content-Type manualmente
    try {
      if (config.body && typeof FormData !== 'undefined' && config.body instanceof FormData) {
        const headers = (config.headers as Record<string, string>) || {};
        if ('Content-Type' in headers) {
          delete headers['Content-Type'];
          config.headers = headers;
        }
      }
    } catch {
      // ignore
    }

    // Debug no invasivo: ayuda a rastrear problemas de autenticación en dev
    try {
      const authHeader = (config.headers as Record<string, string>)?.['Authorization'];
      if (!this.shouldIncludeCredentials(url) && !authHeader) {
        // eslint-disable-next-line no-console
        console.debug(`[http] No Authorization header for ${url}. Is user logged in?`);
      }
    } catch {
      // ignore
    }

    // Timeout de la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      let response = await fetch(fullUrl, { ...config, signal: controller.signal });

      clearTimeout(timeoutId);

      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Refresh deshabilitado: si 401, limpiar sesión local (token inválido/expirado) y propagar error
      if (response.status === 401) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch {
          // ignore
        }
      }

      if (!response.ok) {
        throw this.handleError(response, data);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado. Verifica tu conexión e intenta nuevamente.');
      }
      
      throw error;
    }
  }

  /**
   * Métodos HTTP
   */
  async get<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET', headers });
  }

  async post<T>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE', headers });
  }

  /**
   * Upload de archivos
   */
  async uploadFile<T>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers = this.getHeaders();
    // Remover Content-Type para que el navegador lo establezca automáticamente con boundary
    delete headers['Content-Type'];

    return this.request<T>(url, {
      method: 'POST',
      headers,
      body: formData,
    });
  }
}

// Instancia singleton del cliente HTTP
export const httpClient = new HttpClient();