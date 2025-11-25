# Módulo de Favoritos

Este módulo gestiona la UI y lógica de favoritos para sedes deportivas.

## Estructura
```
modules/favorites/
  components/
  hooks/
  lib/
  pages/
  services/
  types/
```

## Integración rápida
1. Añade una ruta en tu router:
```tsx
<Route path="/favoritos" element={<FavoritesPage />} />
```
2. Usa el botón en cualquier card de sede:
```tsx
<FavoriteButton idSede={sede.idSede} />
```
3. Al iniciar sesión, sincroniza locales (si implementas hook de auth) usando:
```ts
import { syncLocalFavorites } from '@/modules/favorites/lib/localFavorites';
await syncLocalFavorites((id) => favoritesService.add(id));
```

## Endpoints
- POST `/favoritos` { idSede }
- GET `/favoritos` (con parámetro opcional `orden=rating|reciente`)
- DELETE `/favoritos/:idSede`
- GET `/favoritos/verificar/:idSede`
- PUT `/favoritos/:idSede` (metadata - etiquetas, notas, notificaciones)

Ajusta `VITE_API_BASE_URL` en tu `.env` para apuntar al backend.

## Características
- ✅ Agregar/eliminar sedes favoritas
- ✅ Ver lista de favoritos con información de la sede
- ✅ Ordenar por fecha (reciente) o rating
- ✅ Almacenamiento local para usuarios no autenticados
- ✅ Sincronización automática al iniciar sesión
- ✅ Integración con resultados de búsqueda

## Futuro / Pendiente
- Filtros avanzados
- Estadísticas de favoritos
- Recomendaciones basadas en favoritos
- Colecciones de favoritos
- Notificaciones de disponibilidad
