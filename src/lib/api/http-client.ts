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
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

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
  private shouldIncludeCredentials(url: string): boolean {
    // Si el path apunta a endpoints de autenticación, incluir cookies
    // url puede ser relativo ("/auth/…") o absoluto
    return url.includes('/auth/');
  }

  /**
   * Intenta refrescar el token de acceso usando /auth/refresh
   * Retorna el nuevo token o null si falla
   */
  private async tryRefreshToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        // Hacemos la llamada directamente usando request para garantizar credentials
        const res = await this.request<{ token: string }>(`/auth/refresh`, {
          method: 'POST',
          // headers se completan en request(); credentials se incluyen por shouldIncludeCredentials
        });
        const newToken = res?.data?.token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          return newToken;
        }
        return null;
      } catch (err) {
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

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

      // Si el token expiró, intentamos un refresh una sola vez por petición
      if (response.status === 401 && !this.shouldIncludeCredentials(url) && !(options as any)._retried) {
        const newToken = await this.tryRefreshToken();
        if (newToken) {
          // Reintentar la petición original con el nuevo token
          const retryConfig: RequestInit = {
            ...config,
            headers: this.getHeaders(options.headers as Record<string, string>),
            credentials: this.shouldIncludeCredentials(url) ? 'include' : options.credentials,
          } as RequestInit & { _retried?: boolean };
          (retryConfig as any)._retried = true;

          // Rehacer fetch y parsear respuesta
          response = await fetch(fullUrl, { ...retryConfig, signal: controller.signal });

          const retryContentType = response.headers.get('content-type');
          if (retryContentType && retryContentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }
        } else {
          // Refresh falló (probablemente cookie no presente). Limpiar sesión local para evitar bucles.
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch {
            // ignore
          }
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