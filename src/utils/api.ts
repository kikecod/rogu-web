// src/utils/api.ts
const API_BASE = "http://localhost:8080/api";

export const api = {
  getReservas: () => fetch(`${API_BASE}/reservas`).then((r) => r.json()),
  getReservaUsuarios: (id: number) =>
    fetch(`${API_BASE}/reservas/${id}/usuarios`).then((r) => r.json()),
  getUsuarioActual: () => fetch(`${API_BASE}/usuarios/me`).then((r) => r.json()),
};

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.statusText}`);
  }
  return response.json();
}
