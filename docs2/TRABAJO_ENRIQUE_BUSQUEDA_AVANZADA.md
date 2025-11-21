# 🔍 TRABAJO ENRIQUE: SISTEMA DE BÚSQUEDA AVANZADA

**Responsable:** Enrique  
**Duración estimada:** 2 semanas  
**Prioridad:** 🟡 ALTA  

> **NOTA IMPORTANTE:** Este documento forma parte del sistema ROGU:
> - **Kike:** Sistema de Pagos Real
> - **Samy:** Sistema de Reseñas y Calificaciones
> - **Denzel:** Perfil y Configuración de Usuario
> - **Oscar:** Dashboard/Panel de Análisis para Dueños
> - **Enrique:** Sistema de Búsqueda Avanzada (este documento)

---

## 📋 RESUMEN

Implementar un **sistema de búsqueda avanzada** con múltiples filtros que permita a los usuarios encontrar canchas de manera rápida y precisa según sus necesidades específicas.

**Estado actual:**
- Existe búsqueda básica en HomePage
- Filtros limitados (solo por deporte)
- NO hay búsqueda por ubicación geográfica
- NO hay filtros por precio, disponibilidad horaria, amenidades
- NO hay orden de resultados personalizable
- NO hay búsqueda en tiempo real

**Sistema objetivo:**
- Búsqueda con múltiples criterios simultáneos
- Filtros avanzados (ubicación, precio, horario, amenidades, rating)
- Búsqueda geográfica con mapa interactivo
- Auto-complete en tiempo real
- Resultados ordenables (precio, distancia, rating, popularidad)
- Historial de búsquedas
- Búsquedas guardadas/favoritas

---

## 🎯 OBJETIVOS PRINCIPALES

### 1. **Búsqueda por Texto**
   - Búsqueda por nombre de cancha
   - Búsqueda por nombre de sede
   - Búsqueda por ubicación (ciudad, zona)
   - Auto-complete con sugerencias
   - Búsqueda tolerante a errores (typos)

### 2. **Filtros Avanzados**
   - **Por Deporte:** Fútbol, Básquet, Vóley, Tenis, etc.
   - **Por Ubicación:** Zona, ciudad, radio de distancia
   - **Por Precio:** Rango min-max
   - **Por Disponibilidad:** Fecha y horario específico
   - **Por Amenidades:** Techado, iluminación, estacionamiento, vestuarios, etc.
   - **Por Rating:** Mínimo de estrellas
   - **Por Capacidad:** Número de personas

### 3. **Búsqueda Geográfica**
   - Mapa interactivo con marcadores de canchas
   - Búsqueda "Cerca de mí" usando geolocalización
   - Filtro por radio de distancia (1km, 5km, 10km, 20km)
   - Cálculo de distancia desde ubicación del usuario
   - Direcciones y rutas con Google Maps/OpenStreetMap

### 4. **Ordenamiento de Resultados**
   - Por relevancia (default)
   - Por precio (menor a mayor / mayor a menor)
   - Por distancia (más cercano primero)
   - Por rating (mejor calificados primero)
   - Por popularidad (más reservados)
   - Por disponibilidad (más horarios libres)

### 5. **Búsquedas Guardadas**
   - Guardar combinaciones de filtros
   - Nombrar búsquedas ("Canchas de fútbol cerca de casa")
   - Activar notificaciones para búsquedas guardadas
   - Historial de búsquedas recientes

### 6. **Optimización de Performance**
   - Paginación de resultados (20 por página)
   - Caché de búsquedas frecuentes
   - Índices en BD para búsquedas rápidas
   - Lazy loading de resultados

---

## 📐 ARQUITECTURA DEL SISTEMA

### Flujo General de Búsqueda

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  HOMEPAGE - BARRA DE BÚSQUEDA                                 │
│  ┌─────────────────────────────────────────────────┐         │
│  │ 🔍 Buscar canchas...                            │         │
│  │                                                 │         │
│  │ Auto-complete:                                  │         │
│  │ ▼ Cancha Fútbol A - Zona Sur                   │         │
│  │   Complejo Elite - Av. Principal                │         │
│  │   Cancha Vóley Norte - Zona Norte              │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  PANEL DE FILTROS (Sidebar)                                   │
│  ┌─────────────────────────────────────────────────┐         │
│  │ 📍 Ubicación                                     │         │
│  │ [ ] Cerca de mí (2.3 km)                        │         │
│  │ Radio: [●────────] 5 km                         │         │
│  │                                                 │         │
│  │ ⚽ Deporte                                       │         │
│  │ [x] Fútbol                                      │         │
│  │ [ ] Básquetbol                                  │         │
│  │ [ ] Vóley                                       │         │
│  │ [ ] Tenis                                       │         │
│  │                                                 │         │
│  │ 💰 Precio por hora                              │         │
│  │ Min: Bs [50]  Max: Bs [150]                    │         │
│  │ [●──────●─────] 50 - 150                       │         │
│  │                                                 │         │
│  │ 📅 Disponibilidad                               │         │
│  │ Fecha: [30/10/2024]                            │         │
│  │ Hora: [18:00 - 20:00]                          │         │
│  │                                                 │         │
│  │ ⭐ Rating mínimo                                │         │
│  │ [x] 4+ estrellas                               │         │
│  │ [ ] 3+ estrellas                               │         │
│  │                                                 │         │
│  │ 🏟️ Amenidades                                   │         │
│  │ [x] Techado                                     │         │
│  │ [x] Iluminación                                 │         │
│  │ [ ] Estacionamiento                             │         │
│  │ [ ] Vestuarios                                  │         │
│  │ [ ] Cafetería                                   │         │
│  │                                                 │         │
│  │ [Limpiar filtros]  [Aplicar]                   │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  RESULTADOS                                                   │
│  ┌─────────────────────────────────────────────────┐         │
│  │ 🗂️ Ordenar por: [Relevancia ▼]                 │         │
│  │                                                 │         │
│  │ 📊 15 canchas encontradas                       │         │
│  │                                                 │         │
│  │ ┌─────────────────────────────────────┐        │         │
│  │ │ [Foto]  Cancha Fútbol A             │        │         │
│  │ │         ⭐⭐⭐⭐⭐ 4.8 (24)          │        │         │
│  │ │         📍 2.3 km - Zona Sur        │        │         │
│  │ │         💰 Bs 80/hora               │        │         │
│  │ │         ✓ Techado  ✓ Iluminación   │        │         │
│  │ │         [Ver detalles]              │        │         │
│  │ └─────────────────────────────────────┘        │         │
│  │ ┌─────────────────────────────────────┐        │         │
│  │ │ [Foto]  Complejo Elite              │        │         │
│  │ │         ⭐⭐⭐⭐☆ 4.2 (15)          │        │         │
│  │ │         📍 3.7 km - Centro          │        │         │
│  │ │         💰 Bs 120/hora              │        │         │
│  │ └─────────────────────────────────────┘        │         │
│  │                                                 │         │
│  │ [< Anterior] Página 1 de 1 [Siguiente >]      │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  VISTA DE MAPA (Tab alternativo)                              │
│  ┌─────────────────────────────────────────────────┐         │
│  │ 🗺️                                              │         │
│  │     📍 📍                                       │         │
│  │  📍        📍📍                                 │         │
│  │       📍                                        │         │
│  │    📍    📍                                     │         │
│  │                                                 │         │
│  │ [Ver lista]                                     │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓ ↑
              GET /api/canchas/buscar?q=...&filters=...
                           ↓ ↑
┌──────────────────────────────────────────────────────────────┐
│            BACKEND (Node.js + Express)                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  BÚSQUEDA:                                                    │
│  1. Recibir query de búsqueda + filtros                      │
│  2. Validar parámetros                                        │
│  3. Construir query SQL con múltiples WHERE                   │
│  4. Aplicar filtros:                                          │
│     - Texto: LIKE en nombre, sede, ubicación                 │
│     - Deporte: JOIN con tabla Disciplina                     │
│     - Precio: BETWEEN min y max                              │
│     - Ubicación: Calcular distancia con lat/lng             │
│     - Disponibilidad: NOT EXISTS en reservas                 │
│     - Rating: AVG de calificaciones                          │
│     - Amenidades: cubierta=true, iluminacion!=null           │
│  5. Aplicar ordenamiento (ORDER BY)                          │
│  6. Paginar resultados (LIMIT, OFFSET)                       │
│  7. Calcular distancias si hay geolocalización               │
│  8. Retornar JSON con resultados + metadata                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌──────────────────────────────────────────────────────────────┐
│                  BASE DE DATOS (MySQL)                        │
├──────────────────────────────────────────────────────────────┤
│  Tablas consultadas:                                          │
│  - Cancha (filtros principales)                              │
│  - Sede (ubicación, coordenadas)                             │
│  - ParteCancha → Disciplina (deportes)                       │
│  - CalificaCancha (rating promedio)                          │
│  - Reserva (disponibilidad)                                  │
│  - BusquedaGuardada (historial usuario)                      │
│                                                               │
│  Índices optimizados:                                         │
│  - nombre, superficie, estado                                │
│  - precio, aforoMax                                          │
│  - Sede (latitud, longitud)                                  │
│  - FULLTEXT en nombre y descripción                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ BACKEND - ESTRUCTURA Y ENDPOINTS

### 1. BASE DE DATOS - Tabla Nueva

#### Crear tabla BusquedaGuardada

**Objetivo:** Almacenar búsquedas guardadas por usuarios.

**Campos principales:**
- `idBusqueda`: ID único
- `idUsuario`: FK al usuario que guardó
- `nombre`: Nombre de la búsqueda ("Canchas cerca de casa")
- `filtrosJson`: JSON con todos los filtros aplicados
- `notificacionesActivas`: Boolean (enviar alertas)
- `creadoEn`: Timestamp
- `ultimoUso`: Timestamp

**SQL de ejemplo:**
```sql
CREATE TABLE BusquedaGuardada (
  idBusqueda INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  filtrosJson TEXT,
  notificacionesActivas BOOLEAN DEFAULT FALSE,
  creadoEn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimoUso TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);
```

---

### 2. SERVICIO DE BÚSQUEDA

#### SearchService - Buscar Canchas

**Objetivo:** Ejecutar búsqueda con múltiples filtros.

**Flujo del servicio:**

1. **Recibir parámetros:**
   - `q`: Texto de búsqueda (opcional)
   - `deporte`: Array de deportes
   - `precioMin`, `precioMax`: Rango de precios
   - `lat`, `lng`, `radio`: Ubicación y radio en km
   - `fecha`, `horaInicio`, `horaFin`: Disponibilidad
   - `ratingMin`: Rating mínimo
   - `amenidades`: Array (cubierta, iluminacion, etc.)
   - `orden`: Campo de ordenamiento
   - `pagina`, `limite`: Paginación

2. **Construir query base:**
   ```sql
   SELECT DISTINCT c.*, s.nombre as sedeName, s.direccion, s.latitud, s.longitud,
          AVG(cal.calificacion) as rating,
          COUNT(cal.idCalifica) as numReviews
   FROM Cancha c
   INNER JOIN Sede s ON c.id_Sede = s.idSede
   LEFT JOIN CalificaCancha cal ON c.idCancha = cal.idCancha
   WHERE c.estado = 'Disponible'
   ```

3. **Aplicar filtros dinámicamente:**
   - Texto: `AND (c.nombre LIKE '%query%' OR s.nombre LIKE '%query%')`
   - Deporte: `JOIN ParteCancha pc ON c.idCancha = pc.idCancha WHERE pc.idDisciplina IN (...)`
   - Precio: `AND c.precio BETWEEN ? AND ?`
   - Ubicación: Calcular distancia con fórmula Haversine:
     ```sql
     HAVING (6371 * acos(cos(radians(?)) * cos(radians(latitud)) * 
            cos(radians(longitud) - radians(?)) + 
            sin(radians(?)) * sin(radians(latitud)))) <= ?
     ```
   - Disponibilidad: 
     ```sql
     AND NOT EXISTS (
       SELECT 1 FROM Reserva r 
       WHERE r.idCancha = c.idCancha 
       AND r.iniciaEn < ? AND r.terminaEn > ?
       AND r.estado IN ('Confirmada', 'Pendiente')
     )
     ```
   - Rating: `HAVING AVG(cal.calificacion) >= ?`
   - Amenidades: `AND c.cubierta = true AND c.iluminacion IS NOT NULL`

4. **Aplicar ordenamiento:**
   - Por relevancia: Score combinado (rating + popularidad)
   - Por precio: `ORDER BY c.precio ASC/DESC`
   - Por distancia: `ORDER BY distancia ASC`
   - Por rating: `ORDER BY rating DESC`

5. **Paginar:**
   ```sql
   LIMIT ? OFFSET ?
   ```

6. **Retornar resultados:**
   ```json
   {
     "resultados": [...],
     "total": 156,
     "pagina": 1,
     "totalPaginas": 8,
     "filtrosAplicados": {...}
   }
   ```

---

### 3. ENDPOINTS PRINCIPALES

#### 3.1 Buscar Canchas

```
GET /api/canchas/buscar
Query Params:
  - q: texto de búsqueda (opcional)
  - deporte: array de IDs de disciplinas
  - precioMin, precioMax: números
  - lat, lng, radio: ubicación geográfica
  - fecha, horaInicio, horaFin: disponibilidad
  - ratingMin: número 1-5
  - cubierta, iluminacion: booleans
  - orden: 'precio' | 'distancia' | 'rating' | 'popularidad'
  - direccion: 'asc' | 'desc'
  - pagina: número de página (default: 1)
  - limite: resultados por página (default: 20)

Response:
{
  "success": true,
  "data": {
    "resultados": [
      {
        "idCancha": 4,
        "nombre": "Cancha Fútbol A",
        "superficie": "Césped sintético",
        "precio": 80,
        "cubierta": true,
        "iluminacion": "LED",
        "aforoMax": 22,
        "rating": 4.8,
        "numReviews": 24,
        "distancia": 2.3,
        "sede": {
          "idSede": 1,
          "nombre": "Complejo Deportivo Elite",
          "direccion": "Av. Principal 123",
          "ciudad": "La Paz",
          "latitud": -16.5000,
          "longitud": -68.1500
        },
        "fotos": [
          { "urlFoto": "uploads/canchas/foto1.jpg" }
        ],
        "disponible": true
      }
    ],
    "total": 15,
    "pagina": 1,
    "totalPaginas": 1,
    "filtrosAplicados": {
      "deporte": ["Fútbol"],
      "precioMax": 150,
      "cubierta": true
    }
  }
}
```

---

#### 3.2 Auto-complete de Búsqueda

```
GET /api/canchas/autocomplete
Query Params:
  - q: texto de búsqueda (mínimo 2 caracteres)
  - limite: número de sugerencias (default: 5)

Response:
{
  "success": true,
  "data": {
    "sugerencias": [
      {
        "tipo": "cancha",
        "id": 4,
        "nombre": "Cancha Fútbol A",
        "sede": "Complejo Elite",
        "ubicacion": "Zona Sur"
      },
      {
        "tipo": "sede",
        "id": 1,
        "nombre": "Complejo Elite",
        "ubicacion": "Av. Principal 123"
      },
      {
        "tipo": "ubicacion",
        "nombre": "Zona Sur",
        "resultados": 8
      }
    ]
  }
}
```

---

#### 3.3 Guardar Búsqueda

```
POST /api/busquedas/guardar
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "nombre": "Canchas de fútbol cerca de casa",
  "filtros": {
    "deporte": ["Fútbol"],
    "lat": -16.5000,
    "lng": -68.1500,
    "radio": 5,
    "precioMax": 100,
    "cubierta": true
  },
  "notificaciones": true
}

Response:
{
  "success": true,
  "data": {
    "idBusqueda": 15,
    "nombre": "Canchas de fútbol cerca de casa",
    "mensaje": "Búsqueda guardada exitosamente"
  }
}
```

---

#### 3.4 Obtener Búsquedas Guardadas

```
GET /api/busquedas/guardadas
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "busquedas": [
      {
        "idBusqueda": 15,
        "nombre": "Canchas de fútbol cerca de casa",
        "filtros": {...},
        "notificacionesActivas": true,
        "ultimoUso": "2024-11-01T10:30:00Z",
        "resultadosAproximados": 12
      },
      {
        "idBusqueda": 16,
        "nombre": "Canchas baratas para básquet",
        "filtros": {...},
        "notificacionesActivas": false,
        "ultimoUso": "2024-10-28T15:20:00Z",
        "resultadosAproximados": 5
      }
    ]
  }
}
```

---

#### 3.5 Eliminar Búsqueda Guardada

```
DELETE /api/busquedas/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Búsqueda eliminada exitosamente"
}
```

---

#### 3.6 Historial de Búsquedas

```
GET /api/busquedas/historial
Authorization: Bearer <token>
Query Params:
  - limite: número de búsquedas (default: 10)

Response:
{
  "success": true,
  "data": {
    "historial": [
      {
        "query": "fútbol zona sur",
        "filtros": {...},
        "fecha": "2024-11-01T10:30:00Z",
        "resultados": 12
      },
      {
        "query": "básquet techado",
        "filtros": {...},
        "fecha": "2024-10-31T18:45:00Z",
        "resultados": 5
      }
    ]
  }
}
```

---

### 4. VALIDACIONES Y SEGURIDAD

**Validaciones en el backend:**
- Parámetros de precio: `precioMin >= 0` y `precioMax <= 10000`
- Radio de búsqueda: `radio <= 100` km
- Rating: `ratingMin between 1 and 5`
- Paginación: `limite <= 50`
- Query de texto: máximo 200 caracteres
- Coordenadas válidas: latitud [-90, 90], longitud [-180, 180]

**Sanitización:**
- Escapar caracteres especiales en texto de búsqueda
- Validar formato de fechas
- Prevenir SQL injection con prepared statements

**Rate limiting:**
- Máximo 60 búsquedas por minuto por usuario
- Máximo 100 búsquedas por minuto por IP

---

## 🎨 FRONTEND - ESTRUCTURA Y COMPONENTES

### 1. MÓDULO DE BÚSQUEDA

**Estructura de carpetas:**
```
src/modules/search/
  pages/
    SearchPage.tsx                # Página principal de búsqueda
    SearchResultsPage.tsx         # Página de resultados
  components/
    SearchBar.tsx                 # Barra de búsqueda con autocomplete
    SearchFilters.tsx             # Panel de filtros lateral
    FilterPrice.tsx               # Filtro de rango de precio
    FilterLocation.tsx            # Filtro de ubicación con mapa
    FilterAvailability.tsx        # Filtro de fecha y hora
    FilterAmenities.tsx           # Filtro de amenidades
    FilterRating.tsx              # Filtro de rating
    SearchResults.tsx             # Grid de resultados
    ResultCard.tsx                # Card individual de cancha
    SearchMap.tsx                 # Vista de mapa con marcadores
    SavedSearches.tsx             # Lista de búsquedas guardadas
    SearchHistory.tsx             # Historial de búsquedas
    SortDropdown.tsx              # Dropdown de ordenamiento
    Pagination.tsx                # Controles de paginación
  services/
    searchService.ts              # Llamadas a API
  hooks/
    useSearch.ts                  # Hook de búsqueda
    useFilters.ts                 # Hook de filtros
    useGeolocation.ts             # Hook de geolocalización
  types/
    search.types.ts               # Tipos TypeScript
  lib/
    distance.ts                   # Cálculo de distancias
    filters.ts                    # Lógica de filtros
```

---

### 2. COMPONENTE SEARCHBAR

**Funcionalidades:**

1. **Input de búsqueda:**
   - Debounce de 300ms
   - Mínimo 2 caracteres para buscar
   - Icono de búsqueda y botón "X" para limpiar

2. **Auto-complete:**
   - Dropdown con sugerencias
   - Categorías: Canchas, Sedes, Ubicaciones
   - Navegación con teclado (↑↓ Enter)
   - Highlight de texto coincidente

3. **Búsquedas recientes:**
   - Mostrar últimas 5 búsquedas
   - Click para repetir búsqueda
   - Botón para limpiar historial

**Props:**
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  showRecent?: boolean;
}
```

---

### 3. COMPONENTE SEARCHFILTERS

**Funcionalidades:**

1. **Secciones expandibles:**
   - Cada filtro es un acordeón
   - Guardar estado de expansión
   - Mostrar número de filtros activos

2. **Aplicar/Limpiar:**
   - Botón "Aplicar" ejecuta búsqueda
   - Botón "Limpiar filtros" resetea todo
   - Badge con número de filtros activos

3. **Filtros individuales:**
   - Deporte: Checkboxes con iconos
   - Precio: Range slider con inputs
   - Ubicación: Input + mapa + "Cerca de mí"
   - Disponibilidad: Date picker + time range
   - Rating: Star selector
   - Amenidades: Checkboxes

**Estado de filtros:**
```typescript
interface SearchFilters {
  query?: string;
  deportes?: number[];
  precioMin?: number;
  precioMax?: number;
  lat?: number;
  lng?: number;
  radio?: number;
  fecha?: Date;
  horaInicio?: string;
  horaFin?: string;
  ratingMin?: number;
  cubierta?: boolean;
  iluminacion?: boolean;
  estacionamiento?: boolean;
  vestuarios?: boolean;
  orden?: 'precio' | 'distancia' | 'rating' | 'popularidad';
  direccion?: 'asc' | 'desc';
}
```

---

### 4. COMPONENTE SEARCHRESULTS

**Funcionalidades:**

1. **Vista de lista (default):**
   - Grid responsive (1-2-3 columnas)
   - Card con foto, nombre, rating, precio, distancia
   - Botón "Ver detalles"
   - Hover effects

2. **Vista de mapa:**
   - Toggle para cambiar vista
   - Marcadores en mapa
   - Popup con info al click
   - Sincronizar con scroll de lista

3. **Ordenamiento:**
   - Dropdown en header
   - Opciones: Relevancia, Precio, Distancia, Rating
   - Indicador de orden activo

4. **Paginación:**
   - Mostrar "X de Y resultados"
   - Botones < Anterior | Siguiente >
   - Números de página
   - Scroll to top al cambiar página

5. **Empty state:**
   - Mensaje cuando no hay resultados
   - Sugerencias para ajustar filtros
   - Botón "Limpiar filtros"

---

### 5. COMPONENTE SAVEDSEARCHES

**Funcionalidades:**

1. **Lista de búsquedas:**
   - Nombre de búsqueda
   - Resumen de filtros
   - Fecha de último uso
   - Número aproximado de resultados

2. **Acciones:**
   - Botón "Ejecutar búsqueda"
   - Toggle de notificaciones
   - Botón "Eliminar"
   - Botón "Editar nombre"

3. **Guardar nueva:**
   - Botón "Guardar búsqueda actual"
   - Modal para nombrarla
   - Opción de activar notificaciones

---

### 6. HOOKS PERSONALIZADOS

#### useSearch Hook

```typescript
interface UseSearchReturn {
  results: SportField[];
  loading: boolean;
  error: string | null;
  total: number;
  pagina: number;
  totalPaginas: number;
  search: (filters: SearchFilters) => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

const useSearch = (): UseSearchReturn => {
  // Implementación
};
```

#### useFilters Hook

```typescript
interface UseFiltersReturn {
  filters: SearchFilters;
  setFilter: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  applyFilters: () => void;
}

const useFilters = (): UseFiltersReturn => {
  // Implementación
};
```

#### useGeolocation Hook

```typescript
interface UseGeolocationReturn {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => Promise<void>;
}

const useGeolocation = (): UseGeolocationReturn => {
  // Implementación
};
```

---

### 7. SERVICIO FRONTEND

**searchService.ts:**

Funciones principales:

```typescript
interface SearchParams {
  q?: string;
  deporte?: number[];
  precioMin?: number;
  precioMax?: number;
  lat?: number;
  lng?: number;
  radio?: number;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  ratingMin?: number;
  cubierta?: boolean;
  iluminacion?: boolean;
  orden?: string;
  direccion?: string;
  pagina?: number;
  limite?: number;
}

interface SearchResponse {
  resultados: SportField[];
  total: number;
  pagina: number;
  totalPaginas: number;
  filtrosAplicados: any;
}

interface AutocompleteResponse {
  sugerencias: Array<{
    tipo: 'cancha' | 'sede' | 'ubicacion';
    id?: number;
    nombre: string;
    sede?: string;
    ubicacion?: string;
    resultados?: number;
  }>;
}

interface SavedSearch {
  idBusqueda: number;
  nombre: string;
  filtros: SearchFilters;
  notificacionesActivas: boolean;
  ultimoUso: string;
  resultadosAproximados: number;
}

// Funciones
async searchCanchas(params: SearchParams): Promise<SearchResponse>
async autocomplete(query: string): Promise<AutocompleteResponse>
async guardarBusqueda(nombre: string, filtros: SearchFilters, notif: boolean): Promise<SavedSearch>
async obtenerBusquedasGuardadas(): Promise<SavedSearch[]>
async eliminarBusqueda(id: number): Promise<void>
async obtenerHistorial(limite?: number): Promise<any[]>
```

---

## 🧪 TESTING

### Backend Testing

**Tests unitarios:**
1. SearchService
   - Búsqueda por texto
   - Filtros individuales
   - Combinación de filtros
   - Cálculo de distancia
   - Ordenamiento
   - Paginación

2. Endpoints
   - GET /api/canchas/buscar
   - GET /api/canchas/autocomplete
   - POST /api/busquedas/guardar
   - GET /api/busquedas/guardadas
   - DELETE /api/busquedas/:id

**Tests de integración:**
- Búsqueda con múltiples filtros simultáneos
- Performance con 1000+ canchas
- Búsqueda geográfica precisa
- Disponibilidad en tiempo real

---

### Frontend Testing

**Tests de componentes:**
1. SearchBar
   - Input y onChange
   - Autocomplete
   - Búsquedas recientes
   - Debounce

2. SearchFilters
   - Aplicar filtros
   - Limpiar filtros
   - Expandir/colapsar secciones

3. SearchResults
   - Renderizar resultados
   - Cambiar orden
   - Paginación
   - Empty state

**Tests E2E:**
- Búsqueda simple
- Búsqueda con filtros
- Guardar búsqueda
- Ejecutar búsqueda guardada
- Búsqueda por ubicación

---

## 📊 OPTIMIZACIÓN DE PERFORMANCE

### Backend

1. **Índices de BD:**
   ```sql
   CREATE INDEX idx_cancha_nombre ON Cancha(nombre);
   CREATE INDEX idx_cancha_precio ON Cancha(precio);
   CREATE INDEX idx_sede_coordenadas ON Sede(latitud, longitud);
   CREATE FULLTEXT INDEX idx_fulltext ON Cancha(nombre, reglasUso);
   ```

2. **Caché:**
   - Redis para búsquedas frecuentes (TTL: 5 minutos)
   - Caché de autocomplete (TTL: 1 hora)
   - Caché de conteos (TTL: 10 minutos)

3. **Query optimization:**
   - EXPLAIN para analizar queries
   - Evitar N+1 queries con JOINs
   - Limitar campos SELECT

### Frontend

1. **Debouncing:**
   - Búsqueda: 300ms
   - Autocomplete: 200ms

2. **Lazy loading:**
   - Imágenes con loading="lazy"
   - Infinite scroll opcional

3. **Memoization:**
   - useMemo para cálculos pesados
   - useCallback para funciones

4. **Code splitting:**
   - Lazy load de SearchMap
   - Lazy load de filtros avanzados

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Semana 1 (Días 1-7)

**Backend:**
- Días 1-2: Crear tabla BusquedaGuardada y migrations
- Días 3-5: Implementar SearchService con filtros básicos
- Días 6-7: Endpoints de búsqueda y autocomplete

**Frontend:**
- Días 1-2: Estructura de módulo y tipos
- Días 3-4: SearchBar con autocomplete
- Días 5-7: SearchFilters básicos (deporte, precio)

---

### Semana 2 (Días 8-14)

**Backend:**
- Días 8-10: Búsqueda geográfica con Haversine
- Días 11-12: Endpoints de búsquedas guardadas
- Días 13-14: Testing y optimización

**Frontend:**
- Días 8-10: SearchResults y ResultCard
- Días 11-12: Filtros avanzados (ubicación, disponibilidad)
- Días 13-14: SavedSearches y integración completa

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos
- [ ] Crear tabla BusquedaGuardada
- [ ] Crear índices para performance
- [ ] Scripts SQL documentados

### Backend - Servicios
- [ ] SearchService.buscarCanchas()
- [ ] SearchService.autocomplete()
- [ ] SearchService.calcularDistancia()
- [ ] SearchService.guardarBusqueda()
- [ ] SearchService.obtenerBusquedasGuardadas()

### Backend - Endpoints
- [ ] GET /api/canchas/buscar
- [ ] GET /api/canchas/autocomplete
- [ ] POST /api/busquedas/guardar
- [ ] GET /api/busquedas/guardadas
- [ ] DELETE /api/busquedas/:id
- [ ] GET /api/busquedas/historial

### Frontend - Componentes
- [ ] SearchBar con autocomplete
- [ ] SearchFilters completo
- [ ] FilterPrice con range slider
- [ ] FilterLocation con mapa
- [ ] FilterAvailability
- [ ] FilterAmenities
- [ ] SearchResults
- [ ] ResultCard
- [ ] SearchMap
- [ ] SavedSearches
- [ ] SortDropdown
- [ ] Pagination

### Frontend - Hooks
- [ ] useSearch
- [ ] useFilters
- [ ] useGeolocation

### Frontend - Servicios
- [ ] searchService.ts completo
- [ ] Manejo de errores
- [ ] Loading states

### Testing
- [ ] Tests unitarios backend
- [ ] Tests de endpoints
- [ ] Tests de componentes
- [ ] Tests E2E

### Optimización
- [ ] Índices de BD
- [ ] Caché con Redis
- [ ] Debouncing en frontend
- [ ] Lazy loading

### Documentación
- [ ] README del módulo
- [ ] Comentarios en código
- [ ] Documentación de API

---

## 📝 NOTAS FINALES

**Dependencias adicionales:**

Backend:
```json
{
  "redis": "^4.6.0",
  "geolib": "^3.3.4"
}
```

Frontend:
```json
{
  "react-slider": "^2.0.6",
  "react-datepicker": "^4.21.0",
  "debounce": "^2.0.0"
}
```

**Variables de entorno:**
```
REDIS_URL=redis://localhost:6379
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

---

**Última actualización:** 5 de noviembre de 2025  
**Responsable:** Enrique Fernández  
**Estado:** Documentación completa - Listo para implementar
