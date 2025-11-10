import { getApiUrl } from '@/core/config/api';

export interface DisciplinaItem {
  idDisciplina: number;
  nombre: string;
  categoria: string;
  descripcion: string;
}

class DisciplinasService {
  async list(): Promise<DisciplinaItem[]> {
    const url = getApiUrl('/disciplina');
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('Error cargando disciplinas');
    const data = await res.json();
    if (Array.isArray(data)) return data as DisciplinaItem[];
    if (Array.isArray(data?.data)) return data.data as DisciplinaItem[];
    return [];
  }
}

export const disciplinasService = new DisciplinasService();
