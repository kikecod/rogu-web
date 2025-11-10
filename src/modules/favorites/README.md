# Módulo de Favoritos

Este módulo gestiona la UI y lógica de favoritos para canchas.

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
2. Usa el botón en cualquier card de cancha:
```tsx
<FavoriteButton idCancha={cancha.idCancha} />
```
3. Al iniciar sesión, sincroniza locales (si implementas hook de auth) usando:
```ts
import { syncLocalFavorites } from '@/modules/favorites/lib/localFavorites';
await syncLocalFavorites((id) => favoritesService.add(id));
```

## Endpoints asumidos
- POST `/favoritos` { idCancha }
- GET `/favoritos`
- DELETE `/favoritos/:idCancha`
- GET `/favoritos/verificar/:idCancha`
- PUT `/favoritos/:idCancha` (metadata)

Ajusta `VITE_API_URL` en tu `.env` para apuntar al backend.

## Pendiente / Futuro
- Filtros reales
- Estadísticas
- Recomendaciones
- Colecciones de favoritos
