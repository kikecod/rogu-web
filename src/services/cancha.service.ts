/**
 * Servicio para manejar operaciones CRUD de Canchas
 */

import { httpClient } from './http-client';
import { API_CONFIG } from '../config/api';
import type {
  Cancha,
  CreateCanchaRequest,
  UpdateCanchaRequest,
  Parte,
  CreateParteRequest,
  DeleteParteRequest,
  Disciplina,
  Foto
} from '../types/cancha.types';

export class CanchaService {
  private readonly endpoint = API_CONFIG.endpoints.canchas;

  /**
   * Obtiene todas las canchas
   */
  async getAll(): Promise<Cancha[]> {
    const response = await httpClient.get<Cancha[]>(this.endpoint);
    return response.data;
  }

  /**
   * Obtiene una cancha por ID
   */
  async getById(id: number): Promise<Cancha> {
    const response = await httpClient.get<Cancha>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Obtiene canchas por sede
   */
  async getBySede(idSede: number): Promise<Cancha[]> {
    const allCanchas = await this.getAll();
    // Mapear id_Sede a idSede para mantener compatibilidad
    return allCanchas.filter(cancha => 
      (cancha as any).id_Sede === idSede || cancha.idSede === idSede
    ).map(cancha => ({
      ...cancha,
      idSede: (cancha as any).id_Sede || cancha.idSede
    }));
  }

  /**
   * Crea una nueva cancha
   */
  async create(data: CreateCanchaRequest): Promise<Cancha> {
    const response = await httpClient.post<Cancha>(this.endpoint, data);
    return response.data;
  }

  /**
   * Actualiza una cancha existente
   */
  async update(id: number, data: UpdateCanchaRequest): Promise<Cancha> {
    const response = await httpClient.patch<Cancha>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Elimina una cancha
   */
  async delete(id: number): Promise<void> {
    await httpClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Carga las partes (disciplinas) de una cancha
   */
  async loadPartes(idCancha: number): Promise<Parte[]> {
    try {
      const response = await httpClient.get<Parte[]>('/parte');
      return response.data.filter((parte: Parte) => parte.idCancha === idCancha);
    } catch (error) {
      console.error('Error loading partes:', error);
      return [];
    }
  }

  /**
   * Obtiene todas las disciplinas disponibles
   */
  async getDisciplinas(): Promise<Disciplina[]> {
    const response = await httpClient.get<Disciplina[]>('/disciplina');
    return response.data;
  }

  /**
   * Asigna una disciplina a una cancha
   */
  async addDisciplina(data: CreateParteRequest): Promise<Parte> {
    const response = await httpClient.post<Parte>('/parte', data);
    return response.data;
  }

  /**
   * Remueve una disciplina de una cancha
   */
  async removeDisciplina(data: DeleteParteRequest): Promise<void> {
    await httpClient.delete(`/parte/${data.idCancha}/${data.idDisciplina}`);
  }

  /**
   * Actualiza las disciplinas de una cancha
   */
  async updateDisciplinas(idCancha: number, disciplinasIds: number[]): Promise<void> {
    // Primero obtener las partes actuales
    const partesActuales = await this.loadPartes(idCancha);
    
    // Eliminar todas las partes existentes
    for (const parte of partesActuales) {
      try {
        await this.removeDisciplina({
          idCancha: idCancha,
          idDisciplina: parte.idDisciplina
        });
      } catch (error) {
        // Continuar si hay error eliminando
        console.warn(`Error eliminando disciplina ${parte.idDisciplina}:`, error);
      }
    }

    // Agregar las nuevas disciplinas
    for (const idDisciplina of disciplinasIds) {
      try {
        await this.addDisciplina({
          idCancha: idCancha,
          idDisciplina: idDisciplina
        });
      } catch (error) {
        // Continuar si hay error creando
        console.warn(`Error agregando disciplina ${idDisciplina}:`, error);
      }
    }
  }

  /**
   * Obtiene las fotos de una cancha
   */
  async getFotos(idCancha: number): Promise<Foto[]> {
    try {
      const response = await httpClient.get<Foto[]>('/fotos');
      return response.data.filter((foto: Foto) => foto.idCancha === idCancha);
    } catch (error) {
      console.error('Error loading fotos:', error);
      return [];
    }
  }

  /**
   * Sube una foto para una cancha
   */
  async uploadFoto(idCancha: number, file: File): Promise<Foto> {
    const response = await httpClient.uploadFile<Foto>(
      '/fotos',
      file,
      'imagen',
      { idCancha: idCancha.toString() }
    );
    return response.data;
  }

  /**
   * Elimina una foto
   */
  async deleteFoto(idFoto: number): Promise<void> {
    await httpClient.delete(`/fotos/${idFoto}`);
  }
}

// Instancia singleton del servicio
export const canchaService = new CanchaService();