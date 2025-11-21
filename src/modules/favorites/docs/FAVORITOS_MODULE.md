# Módulo de Favoritos (Frontend + Backend)

## Objetivo
Gestionar la lista de canchas marcadas como favoritas por un cliente, permitiendo:
- Añadir/Quitar favoritos (toggle rápido).
- Listar favoritos con filtros (orden, precio, disciplinas múltiple selección).
- Fallback offline/local cuando el usuario no está autenticado (localStorage).
- Acción rápida de "Reservar" desde la tarjeta de favorito.
- Metadatos futuros: etiquetas, notas, notificaciones.

## Arquitectura General
```
rogu-web/src/modules/favorites/
  components/
    FavoriteButton.tsx       # Botón corazón reutilizable para toggle
    FavoriteCard.tsx         # Tarjeta visual de favorito con botones (remover, reservar)
    FavoriteFilters.tsx      # Controles de filtro (superficie, precios) -> pendiente multi-select superficie
    EmptyFavorites.tsx       # Vista placeholder cuando no hay favoritos
  hooks/
    useFavoriteToggle.ts     # Hook para toggle individual (maneja fallback local)
    useFavorites.ts          # Hook para obtener listado con filtros/orden y fallback offline
  lib/
    localFavorites.ts        # Utilidades para manejar favoritos en localStorage
  pages/
    FavoritesPage.tsx        # Página principal /favoritos con layout, filtros y grid de tarjetas
  services/
    favoritesService.ts      # Cliente fetch hacia /api/favoritos
  types/
    favorite.types.ts        # Tipos TS para cancha y favorito
  README.md (existente)      # Resumen de uso rápido
```
Backend relevante (espacios_deportivos/src/favorito/*):
- `favorito.entity.ts`: PK compuesta (idCliente + idCancha) + metadatos.
- `favorito.service.ts`: Lógica (add, remove, check, findFilteredByCliente, updateMeta).
- `favorito.controller.ts`: Endpoints REST protegidos por roles y auth.
- `query-favoritos.dto.ts`: Validación para filtros (orden, precioMin, precioMax, superficie).

## Flujo de Datos
1. Usuario autenticado abre `/favoritos`.
2. `FavoritesPage` invoca `useFavorites(filters)`.
3. Hook llama `favoritesService.list({ orden, precioMin, precioMax, disciplinas })`.
4. Backend aplica QueryBuilder con filtros por precio y disciplinas (join Parte) y retorna favoritos (incluye cancha + fotos si el entity la carga eager).
5. Cada favorito se renderiza con `FavoriteCard` y dentro tiene `FavoriteButton` que usa `useFavoriteToggle`.
6. Si el usuario no está autenticado: la ruta `/favoritos` está protegida y redirige a `/`. El toggle de favoritos en otras vistas sigue teniendo fallback local (localStorage).
7. Si ocurre 401 en acciones aisladas (p.ej., toggle en ficha): `useFavoriteToggle` cae a `localFavorites`. Al autenticarse posteriormente se puede sincronizar local → servidor (pendiente de invocación manual). 

## Componentes Detalle
### FavoriteButton.tsx
- Props: `idCancha`, `size`, `className`.
- Usa `useFavoriteToggle`.
- SVG corazón relleno / vacío según estado.
- Mejora visual sugerida: animación de escala y transición de color; accesibilidad (aria-pressed) y focus styles.

### FavoriteCard.tsx
- Muestra foto principal de la cancha usando `getImageUrl(urlFoto)`.
- Botones: Remover y Reservar (navega a `/field/:id`).
- Estilos: Tailwind básico.
- Mejoras sugeridas:
  - Skeleton de carga para imagen.
  - Badges (superficie, cubierta, rating).
  - Área interactiva completa para abrir detalle.
  - Ajustar sombra para modo oscuro.

### FavoriteFilters.tsx
- Estado interno controlado y dispara `onChange(filters)`.
- Campos: disciplinas (multi-select dinámico desde backend), precioMin, precioMax.
- Búsqueda local por nombre de disciplina y contador de seleccionadas.
- Mejoras sugeridas:
  - Convertir a formulario controlado con debounce.
  - Añadir reset rápido.
  - Multi-select con chips.

### FavoritesPage.tsx
- Administra `filters` y los pasa a `useFavorites`.
- Render condicional de loading, vacío o grid.
- La página está protegida con `ProtectedRoute` para requerir sesión iniciada.
- Mejoras: paginación infinita si backend lo soporta; layout responsive con Masonry; sección de estadísticas.

### useFavoriteToggle.ts
- Determina estado inicial consultando API (`check`) o localStorage.
- `toggle()` decide add/remove y fallback si 401.
- Mejoras: mostrar toast de confirmación, colas para múltiples clics rápidos.

### useFavorites.ts
- Maneja listado, orden, filtros y fallback local (sin datos enriquecidos de cancha offline).
- Orden soportado: reciente, rating, precio asc/desc (orden se pasa vía query param al backend).
- Mejoras: Suspense + React Query; memo granular; carga incremental; enriquecimiento offline mediante fetch individual de cada cancha.

### localFavorites.ts
- Persiste array de `idCancha` en localStorage.
- Métodos: `getLocalFavorites`, `toggleLocalFavorite`, `syncLocalFavorites`.
- Mejora: cifrado básico (no sensible, opcional), registro de timestamps por id.

- Implementa llamadas fetch: add, remove, list, check, updateMeta.
- Normaliza respuestas variadas.
- Maneja 401 devolviendo error para fallback.
- Soporta `disciplinas[]` serializado como múltiples params `?disciplinas=1&disciplinas=4`.
- Mejoras: centralizar manejo de errores HTTP; abort controllers para cancelación; usar generics para respuesta tipada.

### favorite.types.ts
- Tipos TS para cancha y favorito.
- Nota: En fotos se usa `{ url: string }` pero backend retorna `urlFoto`; se puede ajustar a:
  ```ts
  fotos?: { urlFoto: string; descripcion?: string }[];
  ```
  y adaptar componentes para evitar cast `as any`.

## Endpoints (Backend)
- POST `/api/favoritos` { idCancha }
- DELETE `/api/favoritos/:idCancha`
- GET `/api/favoritos?orden=precio-asc&precioMin=10&precioMax=50&disciplinas=1&disciplinas=4`
- GET `/api/favoritos/verificar/:idCancha`
- PUT `/api/favoritos/:idCancha` { etiquetas, notas, notificacionesActivas }

Roles permitidos: CLIENTE, DUENIO, ADMIN, CONTROLADOR (ADMIN acceso global).

## Fallback Offline
- Ruta `/favoritos` protegida: el usuario no autenticado es redirigido y no ve la página.
- Toggle en otras vistas (cards/detalle): sin token → manejo local (ids) con `localFavorites`.
- Al autenticarse: se debería ejecutar `syncLocalFavorites` y luego recargar lista.
- Pendiente: enriquecimiento info cancha offline (fetch individual por id). 

## Filtro por Disciplinas (Actual)
### Requerimiento
Seleccionar varias disciplinas (ej: Fútbol, Pádel, Básquetbol) y filtrar los favoritos cuyas canchas tengan cualquiera de esas disciplinas (OR).

### Implementación
1. Backend: `QueryFavoritosDto` con `disciplinas?: number[]`. En servicio:
  - join `f.cancha` como `c` y `c.parte` como `p`.
  - `p.idDisciplina IN (:...discIds)` y `distinct(true)`.
2. Frontend: servicio envía `?disciplinas=1&disciplinas=4`, filtros con chips cargados desde `/api/disciplina`.
3. Hook `useFavorites`: pasa `disciplinas` a `favoritesService.list`.

Opcional AND: usar `GROUP BY` + `HAVING COUNT(DISTINCT p.idDisciplina) = :n` para exigir todas las seleccionadas.

## Estilos y UX (actual y mejoras)
Aplicado ahora:
- Página con hero y fondo en degradado; panel de filtros con glassmorphism.
- Tarjetas con borde degradado, overlay en imagen, badges (superficie/aforo), y botones mejorados.
- Botón de favorito con gradiente, animación de pulso y focus ring accesible (usa `aria-pressed`).
- Skeletons más ricos para carga y estado vacío con CTA estilizada.

Pendientes/futuras mejoras:
- Animaciones de entrada de tarjetas (framer-motion) y transición shared para navegar a detalle.
- Modo oscuro detallado (tokens de color y sombras específicas).
- Blur placeholders en imágenes y soporte de `srcset`/`sizes`.

## Checklist Futuro
- [ ] Multi-select superficies.
- [ ] Sincronización automática local → server al login.
- [ ] Notas y etiquetas editables (UI modal).
- [ ] Paginación / infinite scroll.
- [ ] Tests unit (hooks/services) + e2e (agregar/quitar favorito).
- [ ] Tratamiento de errores centralizado.
- [ ] Adaptar tipos de fotos a `urlFoto`.
- [ ] Reserva directa (modal de horario) desde la tarjeta.

## Ejemplo de Uso Rápido
```tsx
import FavoritesPage from '@/modules/favorites/pages/FavoritesPage';
import ProtectedRoute from '@/core/routing/ProtectedRoute';

<Route
  path="/favoritos"
  element={
    <ProtectedRoute redirectTo="/">
      <FavoritesPage />
    </ProtectedRoute>
  }
/>
```
Botón en tarjeta existente:
```tsx
<FavoriteButton idCancha={cancha.idCancha} size="sm" />
```

## Consideraciones de Seguridad
- Validar en backend que el cliente sólo manipula sus propios favoritos (ya implementado vía guard/roles).
- Evitar filtrado costoso sin índices: añadir índice en `cancha.superficie` si el volumen crece.

## Performance
- Carga inicial puede traer todas las canchas favoritas con fotos eager → considerar paginación y reducir campos (proyección select).
- Aplicar cache con SWR/React Query para reuso entre páginas.

---
Este documento debe actualizarse conforme se agreguen: multi-select superficie, sincronización, edición de metadatos y tests.
