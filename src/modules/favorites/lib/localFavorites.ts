// Helpers para manejar favoritos locales (usuario no autenticado)
const KEY = 'rogu_local_favorites_v1';

export function getLocalFavorites(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLocalFavorites(ids: number[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function toggleLocalFavorite(idCancha: number): boolean {
  const list = getLocalFavorites();
  const exists = list.includes(idCancha);
  const next = exists ? list.filter(id => id !== idCancha) : [...list, idCancha];
  setLocalFavorites(next);
  return !exists;
}

export async function syncLocalFavorites(addFn: (idCancha: number) => Promise<any>) {
  const list = getLocalFavorites();
  if (!list.length) return;
  for (const id of list) {
    try { await addFn(id); } catch (e) { console.warn('Falló sync favorito', id, e); }
  }
  localStorage.removeItem(KEY);
}
