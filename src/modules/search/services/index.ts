// Exportar el servicio principal
export { default as searchApiService } from './searchApi.service';
export type { SearchApiService } from './searchApi.service';

// Re-exportación para facilitar las importaciones
export { searchApiService as default } from './searchApi.service';