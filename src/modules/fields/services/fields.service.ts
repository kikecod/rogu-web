import { apiClient } from '../../admin-panel/lib/apiClient';
import type { ApiCancha, CrearCanchaDto, EditarCanchaDto } from '../types/field.types';

export const fieldsService = {
    /**
     * Obtiene una cancha por ID
     */
    getById: async (id: number): Promise<ApiCancha> => {
        const response = await apiClient.get<ApiCancha>(`/cancha/${id}`);
        return response.data;
    },

    /**
     * Crea una nueva cancha
     */
    crear: async (data: CrearCanchaDto): Promise<ApiCancha> => {
        const response = await apiClient.post<ApiCancha>('/cancha', data);
        return response.data;
    },

    /**
     * Edita una cancha existente
     */
    editar: async (id: number, data: EditarCanchaDto): Promise<ApiCancha> => {
        const response = await apiClient.patch<ApiCancha>(`/cancha/${id}`, data);
        return response.data;
    },

    /**
     * Asigna disciplinas a una cancha
     */
    asignarDisciplinas: async (idCancha: number, disciplinaIds: number[]): Promise<void> => {
        for (const idDisciplina of disciplinaIds) {
            await apiClient.post('/parte', {
                idCancha,
                idDisciplina
            });
        }
    },

    /**
     * Sube fotos para una cancha
     */
    subirFotos: async (idCancha: number, files: FileList): Promise<void> => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/fotos/upload/cancha/${idCancha}`, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error uploading photo ${file.name}`);
            }
        }
    },

    /**
     * Elimina una cancha
     */
    eliminar: async (id: number): Promise<void> => {
        await apiClient.delete(`/cancha/${id}`);
    }
};
