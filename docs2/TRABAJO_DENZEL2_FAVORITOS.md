# ❤️ TRABAJO ENRIQUE: SISTEMA DE FAVORITOS

**Responsable:** Enrique  
**Duración estimada:** 1 semana  
**Prioridad:** 🟢 MEDIA (Nice to have)  

> **NOTA IMPORTANTE:** Este documento forma parte del sistema ROGU:
> - **Kike:** Sistema de Pagos Real
> - **Samy:** Sistema de Reseñas y Calificaciones
> - **Denzel:** Perfil y Configuración de Usuario
> - **Oscar:** Dashboard/Panel de Análisis para Dueños
> - **Denzel:** Sistema de Favoritos (este documento)

---

## 📋 RESUMEN

Implementar un **sistema de favoritos** que permita a los usuarios guardar sus canchas preferidas para acceso rápido y recibir notificaciones cuando estén disponibles o haya ofertas.

**Estado actual:**
- NO existe funcionalidad de favoritos
- NO hay tabla en BD
- NO hay UI para marcar favoritos
- NO hay página de favoritos

**Sistema objetivo:**
- Marcar/desmarcar canchas como favoritas
- Lista de canchas favoritas
- Notificaciones de disponibilidad
- Notificaciones de promociones
- Sincronización en todos los dispositivos
- Estadísticas de favoritos
- Recomendaciones basadas en favoritos

---

## 🎯 OBJETIVOS PRINCIPALES

### 1. **Marcar Favoritos**
   - Botón de corazón en card de cancha
   - Toggle ON/OFF con animación
   - Feedback visual inmediato
   - Funciona sin login (guarda en localStorage)
   - Sincroniza al hacer login

### 2. **Lista de Favoritos**
   - Página dedicada "Mis Favoritos"
   - Grid de canchas favoritas
   - Ordenar por fecha agregada, rating, precio
   - Filtros (deporte, ubicación, precio)
   - Acceso rápido para reservar

### 3. **Notificaciones (Opcional no)**
   - Alerta cuando favorito tiene promoción
   - Alerta cuando favorito tiene disponibilidad especial
   - Recordatorio periódico de favoritos no visitados

### 5. **Estadísticas**
   - Contador de favoritos en perfil
   - Canchas más favoriteadas (para dueños)
   - Tendencias de favoritos

### 6. **Compartir Favoritos**
   - Exportar lista de favoritos
   - Compartir favorito individual
   - Colecciones de favoritos (opcional)

---

## 📐 ARQUITECTURA DEL SISTEMA

### Flujo General

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  CARD DE CANCHA                                               │
│  ┌─────────────────────────────────────────────────┐         │
│  │  [Foto de cancha]                               │         │
│  │                                                 │         │
│  │  Cancha Fútbol A                     ❤️         │  ← Botón
│  │  ⭐⭐⭐⭐⭐ 4.8 (24)                             │         │
│  │  📍 2.3 km - Zona Sur                          │         │
│  │  💰 Bs 80/hora                                 │         │
│  │  [Ver detalles]                                │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  CLICK EN ❤️                                                 │
│  ↓                                                            │
│  ┌─────────────────────────────────────────────────┐         │
│  │  ✓ Agregado a favoritos                        │         │
│  │  ❤️ → 🧡 (animación de relleno)                │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  PÁGINA DE FAVORITOS                                          │
│  ┌─────────────────────────────────────────────────┐         │
│  │  Mis Favoritos ❤️ (5)                          │         │
│  │                                                 │         │
│  │  [Ordenar: Más recientes ▼]  [Filtrar]        │         │
│  │                                                 │         │
│  │  ┌───────────────────────────────┐             │         │
│  │  │ [Foto] Cancha Fútbol A    ❤️  │             │         │
│  │  │ ⭐ 4.8  Bs 80/h  2.3km        │             │         │
│  │  │ [Reservar] [Remover]          │             │         │
│  │  └───────────────────────────────┘             │         │
│  │  ┌───────────────────────────────┐             │         │
│  │  │ [Foto] Complejo Elite     ❤️  │             │         │
│  │  │ ⭐ 4.2  Bs 120/h  3.7km       │             │         │
│  │  │ [Reservar] [Remover]          │             │         │
│  │  └───────────────────────────────┘             │         │
│  │                                                 │         │
│  │  [Compartir lista] [Exportar]                  │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  ESTADO VACÍO                                                 │
│  ┌─────────────────────────────────────────────────┐         │
│  │  💔 No tienes favoritos aún                    │         │
│  │                                                 │         │
│  │  Guarda tus canchas favoritas para             │         │
│  │  acceder rápidamente a ellas.                  │         │
│  │                                                 │         │
│  │  [Explorar canchas]                            │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓ ↑
            POST /api/favoritos (agregar)
            DELETE /api/favoritos/:id (remover)
            GET /api/favoritos (obtener lista)
                           ↓ ↑
┌──────────────────────────────────────────────────────────────┐
│            BACKEND (Node.js + Express)                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  FAVORITO SERVICE:                                            │
│  1. Recibir petición (agregar/remover)                       │
│  2. Verificar autenticación                                   │
│  3. Validar que cancha existe                                 │
│  4. Verificar si ya es favorito                               │
│  5. Insertar/Eliminar en BD                                   │
│  6. Retornar confirmación                                     │
│                                                               │
│  OBTENER FAVORITOS:                                           │
│  1. Consultar tabla Favorito por idUsuario                    │
│  2. JOIN con Cancha para obtener detalles                     │
│  3. JOIN con Sede para ubicación                              │
│  4. JOIN con CalificaCancha para rating                       │
│  5. Aplicar ordenamiento y filtros                            │
│  6. Retornar lista con metadata                               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌──────────────────────────────────────────────────────────────┐
│                  BASE DE DATOS (MySQL)                        │
├──────────────────────────────────────────────────────────────┤
│  Tabla: Favorito                                              │
│  - idFavorito (PK)                                            │
│  - idUsuario (FK)                                             │
│  - idCancha (FK)                                              │
│  - creadoEn (timestamp)                                       │
│  - notificacionesActivas (boolean)                            │
│  - etiquetas (JSON) - opcional                                │
│                                                               │
│  Índices:                                                     │
│  - UNIQUE(idUsuario, idCancha) - prevenir duplicados          │
│  - idx_usuario (buscar por usuario)                           │
│  - idx_cancha (estadísticas por cancha)                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ BACKEND - ESTRUCTURA Y ENDPOINTS

### 1. BASE DE DATOS - Tabla Nueva

#### Tabla Favorito

**Objetivo:** Almacenar las canchas favoritas de cada usuario.

**Campos principales:**
- `idFavorito`: ID único
- `idUsuario`: FK al usuario
- `idCancha`: FK a la cancha
- `creadoEn`: Timestamp de cuando se agregó
- `notificacionesActivas`: Boolean (recibir notificaciones de esta cancha)
- `etiquetas`: JSON array (opcional: categorizar favoritos)
- `notas`: Text (opcional: notas personales sobre la cancha)

**SQL:**
```sql
CREATE TABLE Favorito (
  idFavorito INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  idCancha INT NOT NULL,
  creadoEn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notificacionesActivas BOOLEAN DEFAULT TRUE,
  etiquetas JSON DEFAULT NULL,
  notas TEXT DEFAULT NULL,
  FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  FOREIGN KEY (idCancha) REFERENCES Cancha(idCancha) ON DELETE CASCADE,
  UNIQUE KEY uk_usuario_cancha (idUsuario, idCancha),
  INDEX idx_usuario (idUsuario),
  INDEX idx_cancha (idCancha),
  INDEX idx_creado (creadoEn DESC)
);
```

---

### 2. SERVICIO DE FAVORITOS

#### FavoritoService - Agregar Favorito

**Objetivo:** Agregar una cancha a favoritos del usuario.

**Flujo:**

1. **Recibir parámetros:**
   ```typescript
   interface AddFavoritoParams {
     idUsuario: number;
     idCancha: number;
     notificacionesActivas?: boolean;
     etiquetas?: string[];
   }
   ```

2. **Validar cancha existe:**
   ```sql
   SELECT idCancha FROM Cancha 
   WHERE idCancha = ? AND estado = 'Disponible'
   ```

3. **Verificar si ya es favorito:**
   ```sql
   SELECT idFavorito FROM Favorito 
   WHERE idUsuario = ? AND idCancha = ?
   ```
   - Si ya existe, retornar mensaje "Ya es favorito"

4. **Insertar en BD:**
   ```sql
   INSERT INTO Favorito (idUsuario, idCancha, notificacionesActivas, etiquetas)
   VALUES (?, ?, ?, ?)
   ```

5. **Crear notificación (opcional):**
   ```typescript
   await NotificationService.create({
     idUsuario,
     tipo: 'FAVORITO_AGREGADO',
     titulo: 'Agregado a favoritos ❤️',
     mensaje: `${nombreCancha} fue agregada a tus favoritos`
   });
   ```

6. **Retornar confirmación:**
   ```json
   {
     "success": true,
     "data": {
       "idFavorito": 15,
       "mensaje": "Cancha agregada a favoritos"
     }
   }
   ```

---

#### FavoritoService - Remover Favorito

**Objetivo:** Eliminar una cancha de favoritos.

**Flujo:**

1. **Validar que el favorito pertenece al usuario:**
   ```sql
   SELECT idFavorito FROM Favorito 
   WHERE idFavorito = ? AND idUsuario = ?
   ```

2. **Eliminar:**
   ```sql
   DELETE FROM Favorito 
   WHERE idFavorito = ? AND idUsuario = ?
   ```

3. **Retornar confirmación**

---

#### FavoritoService - Obtener Favoritos

**Objetivo:** Listar todas las canchas favoritas del usuario.

**Flujo:**

1. **Construir query con JOINs:**
   ```sql
   SELECT 
     f.idFavorito,
     f.creadoEn,
     f.notificacionesActivas,
     f.etiquetas,
     f.notas,
     c.*,
     s.nombre as sedeName,
     s.direccion,
     s.latitud,
     s.longitud,
     AVG(cal.calificacion) as rating,
     COUNT(cal.idCalifica) as numReviews,
     COUNT(DISTINCT r.idReserva) as totalReservas
   FROM Favorito f
   INNER JOIN Cancha c ON f.idCancha = c.idCancha
   INNER JOIN Sede s ON c.id_Sede = s.idSede
   LEFT JOIN CalificaCancha cal ON c.idCancha = cal.idCancha
   LEFT JOIN Reserva r ON c.idCancha = r.idCancha 
                        AND r.idCliente = (
                          SELECT idCliente FROM Cliente 
                          WHERE idPersona = (
                            SELECT idPersona FROM Usuario WHERE idUsuario = ?
                          )
                        )
   WHERE f.idUsuario = ?
   GROUP BY f.idFavorito
   ORDER BY f.creadoEn DESC
   ```

2. **Aplicar filtros si vienen:**
   - Por deporte
   - Por rango de precio
   - Por ubicación

3. **Aplicar ordenamiento:**
   - Por fecha agregada (default)
   - Por rating
   - Por precio
   - Por distancia

4. **Retornar lista:**
   ```json
   {
     "success": true,
     "data": {
       "favoritos": [
         {
           "idFavorito": 15,
           "cancha": {
             "idCancha": 4,
             "nombre": "Cancha Fútbol A",
             "precio": 80,
             "rating": 4.8,
             "numReviews": 24,
             ...
           },
           "sede": {...},
           "creadoEn": "2024-11-01T10:30:00Z",
           "misReservas": 3
         }
       ],
       "total": 5
     }
   }
   ```

---

#### FavoritoService - Verificar si es Favorito

**Objetivo:** Verificar si una cancha es favorita del usuario.

**Flujo:**

1. **Query simple:**
   ```sql
   SELECT COUNT(*) as es_favorito 
   FROM Favorito 
   WHERE idUsuario = ? AND idCancha = ?
   ```

2. **Retornar boolean:**
   ```json
   {
     "success": true,
     "data": {
       "esFavorito": true,
       "idFavorito": 15
     }
   }
   ```

---

### 3. ENDPOINTS PRINCIPALES

#### 3.1 Agregar a Favoritos

```
POST /api/favoritos
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "idCancha": 4,
  "notificacionesActivas": true,
  "etiquetas": ["futbol", "zona-sur"]
}

Response:
{
  "success": true,
  "data": {
    "idFavorito": 15,
    "mensaje": "Cancha agregada a favoritos"
  }
}

Errores posibles:
- 400: Cancha no existe
- 409: Ya es favorito
- 401: No autenticado
```

---

#### 3.2 Remover de Favoritos

```
DELETE /api/favoritos/:id
Authorization: Bearer <token>

Params:
  - id: idFavorito (o idCancha con query param ?porCancha=true)

Response:
{
  "success": true,
  "message": "Favorito eliminado exitosamente"
}

Alternativa (por idCancha):
DELETE /api/favoritos/cancha/:idCancha
```

---

#### 3.3 Obtener Mis Favoritos

```
GET /api/favoritos
Authorization: Bearer <token>
Query Params:
  - orden: 'reciente' | 'rating' | 'precio' | 'distancia' (default: 'reciente')
  - deporte: number (filtrar por idDisciplina)
  - precioMax: number
  - lat, lng: coordenadas para calcular distancia

Response:
{
  "success": true,
  "data": {
    "favoritos": [
      {
        "idFavorito": 15,
        "cancha": {
          "idCancha": 4,
          "nombre": "Cancha Fútbol A",
          "superficie": "Césped sintético",
          "precio": 80,
          "cubierta": true,
          "iluminacion": "LED",
          "aforoMax": 22,
          "rating": 4.8,
          "numReviews": 24,
          "fotos": [...]
        },
        "sede": {
          "idSede": 1,
          "nombre": "Complejo Elite",
          "direccion": "Av. Principal 123",
          "ciudad": "La Paz",
          "latitud": -16.5000,
          "longitud": -68.1500
        },
        "creadoEn": "2024-11-01T10:30:00Z",
        "notificacionesActivas": true,
        "etiquetas": ["futbol", "zona-sur"],
        "misReservas": 3,
        "distancia": 2.3
      }
    ],
    "total": 5
  }
}
```

---

#### 3.4 Verificar si es Favorito

```
GET /api/favoritos/verificar/:idCancha
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "esFavorito": true,
    "idFavorito": 15
  }
}
```

---

#### 3.5 Actualizar Configuración de Favorito

```
PUT /api/favoritos/:id
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "notificacionesActivas": false,
  "etiquetas": ["futbol", "techado"],
  "notas": "Mi cancha preferida para partidos nocturnos"
}

Response:
{
  "success": true,
  "message": "Favorito actualizado"
}
```

---

#### 3.6 Obtener Estadísticas de Favoritos

```
GET /api/favoritos/estadisticas
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalFavoritos": 5,
    "deporteMasFavorito": "Fútbol",
    "precioPromedio": 95.5,
    "canchaFavorita": {
      "idCancha": 4,
      "nombre": "Cancha Fútbol A",
      "reservas": 3
    },
    "distribucionPorDeporte": {
      "Fútbol": 3,
      "Básquetbol": 1,
      "Vóley": 1
    }
  }
}
```

---

#### 3.7 Recomendaciones basadas en Favoritos

```
GET /api/favoritos/recomendaciones
Authorization: Bearer <token>
Query Params:
  - limite: number (default: 5)

Response:
{
  "success": true,
  "data": {
    "recomendaciones": [
      {
        "idCancha": 8,
        "nombre": "Cancha Fútbol B",
        "razon": "Similar a Cancha Fútbol A (mismo deporte y zona)",
        "rating": 4.5,
        "precio": 75,
        "distancia": 1.8
      }
    ]
  }
}
```

---

### 4. ESTADÍSTICAS PARA DUEÑOS (Opcional)

#### Endpoint: Canchas Más Favoriteadas

```
GET /api/analytics/favoritos
Authorization: Bearer <token>
Query Params:
  - periodo: 'semana' | 'mes' | 'año' | 'total'

Response (solo para dueños):
{
  "success": true,
  "data": {
    "misCanchas": [
      {
        "idCancha": 4,
        "nombre": "Cancha Fútbol A",
        "totalFavoritos": 45,
        "favoritosNuevos": 5,
        "ranking": 1
      }
    ],
    "tendencia": {
      "crecimiento": "+12%",
      "periodo": "último mes"
    }
  }
}
```

---

## 🎨 FRONTEND - ESTRUCTURA Y COMPONENTES

### 1. MÓDULO DE FAVORITOS

**Estructura de carpetas:**
```
src/modules/favorites/
  pages/
    FavoritesPage.tsx             # Página principal de favoritos
  components/
    FavoriteButton.tsx            # Botón de corazón (toggle)
    FavoritesList.tsx             # Lista de favoritos
    FavoriteCard.tsx              # Card de favorito
    FavoriteFilters.tsx           # Filtros de favoritos
    EmptyFavorites.tsx            # Estado vacío
    FavoriteStats.tsx             # Estadísticas (opcional)
  services/
    favoritesService.ts           # API calls
  hooks/
    useFavorites.ts               # Hook principal
    useFavoriteToggle.ts          # Hook para toggle
  types/
    favorite.types.ts             # Tipos TypeScript
  lib/
    favoriteHelpers.ts            # Helpers
```

---

### 2. COMPONENTE FAVORITEBUTTON

**Ubicación:** En FieldCard y FieldDetailPage

**Funcionalidades:**

1. **Estados visuales:**
   - No favorito: Corazón outline gris
   - Favorito: Corazón relleno rojo
   - Loading: Spinner
   - Hover: Escala y cambio de color

2. **Interacción:**
   - Click toggle (agregar/remover)
   - Animación de "like" (scale + color)
   - Feedback inmediato
   - Toast notification

3. **Sin login:**
   - Guardar en localStorage
   - Mostrar modal "Inicia sesión para guardar favoritos"
   - Sincronizar al hacer login

**Código ejemplo:**
```typescript
interface FavoriteButtonProps {
  canchaId: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  canchaId,
  size = 'md',
  className = ''
}) => {
  const { isFavorite, toggle, loading } = useFavoriteToggle(canchaId);
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await toggle();
    
    if (result.success) {
      toast.success(
        isFavorite 
          ? 'Agregado a favoritos ❤️' 
          : 'Removido de favoritos'
      );
    }
  };
  
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        relative p-2 rounded-full
        hover:bg-red-50 hover:scale-110
        transition-all duration-200
        ${className}
      `}
      aria-label={isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}
    >
      {loading ? (
        <Loader2 className={`${sizeClasses[size]} animate-spin text-gray-400`} />
      ) : (
        <Heart
          className={`
            ${sizeClasses[size]}
            transition-all duration-200
            ${isFavorite 
              ? 'fill-red-500 text-red-500 animate-heartbeat' 
              : 'text-gray-400 hover:text-red-500'
            }
          `}
        />
      )}
    </button>
  );
};

export default FavoriteButton;
```

**Animación CSS:**
```css
@keyframes heartbeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(1.1); }
  75% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.animate-heartbeat {
  animation: heartbeat 0.5s ease-in-out;
}
```

---

### 3. COMPONENTE FAVORITESPAGE

**Funcionalidades:**

1. **Header:**
   - Título "Mis Favoritos ❤️"
   - Contador de total
   - Botón "Compartir lista"
   - Botón "Exportar"

2. **Filtros y ordenamiento:**
   - Dropdown de ordenamiento
   - Filtros por deporte, precio
   - Barra de búsqueda

3. **Grid de favoritos:**
   - Cards responsivas (1-2-3 columnas)
   - FavoriteCard para cada uno
   - Loading skeletons
   - Empty state si no hay favoritos

4. **Acciones rápidas:**
   - Botón "Reservar ahora"
   - Botón "Remover de favoritos"
   - Botón "Ver detalles"

**Código ejemplo:**
```typescript
const FavoritesPage: React.FC = () => {
  const { 
    favorites, 
    loading, 
    removeFavorite,
    sortBy,
    setSortBy
  } = useFavorites();
  
  if (loading) {
    return <LoadingSkeleton />;
  }
  
  if (favorites.length === 0) {
    return <EmptyFavorites />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Mis Favoritos <Heart className="h-8 w-8 fill-red-500 text-red-500" />
            </h1>
            <p className="text-gray-600 mt-1">
              {favorites.length} {favorites.length === 1 ? 'cancha' : 'canchas'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="h-5 w-5 inline mr-2" />
              Compartir
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-5 w-5 inline mr-2" />
              Exportar
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="reciente">Más recientes</option>
            <option value="rating">Mejor calificados</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
          
          <FavoriteFilters />
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <FavoriteCard
              key={fav.idFavorito}
              favorite={fav}
              onRemove={() => removeFavorite(fav.idFavorito)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

### 4. COMPONENTE FAVORITECARD

**Funcionalidades:**

1. **Visual:**
   - Foto de la cancha
   - Nombre y sede
   - Rating con estrellas
   - Precio destacado
   - Badge de "Favorito desde..."
   - Botón de corazón (remover)

2. **Acciones:**
   - Click → ir a detalle
   - Botón "Reservar ahora"
   - Botón "Remover" con confirmación

3. **Info adicional:**
   - Contador de "Mis reservas: X"
   - Badges de amenidades
   - Distancia (si hay geolocalización)

---

### 5. COMPONENTE EMPTYFAVORITES

**Estado vacío con ilustración:**

```typescript
const EmptyFavorites: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No tienes favoritos aún
          </h2>
          <p className="text-gray-600">
            Guarda tus canchas favoritas para acceder rápidamente a ellas
            y recibir notificaciones de ofertas especiales.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Explorar canchas
          </button>
          
          <div className="text-sm text-gray-500">
            <p className="mb-2">💡 Consejo:</p>
            <p>
              Toca el icono de corazón ❤️ en cualquier cancha
              para agregarla a tus favoritos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### 6. HOOKS PERSONALIZADOS

#### useFavorites Hook

```typescript
interface UseFavoritesReturn {
  favorites: FavoriteWithDetails[];
  loading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  removeFavorite: (id: number) => Promise<void>;
  sortBy: string;
  setSortBy: (sort: string) => void;
  stats: FavoriteStats | null;
}

const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<FavoriteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('reciente');
  const [stats, setStats] = useState<FavoriteStats | null>(null);
  
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await favoritesService.getFavorites({ orden: sortBy });
      setFavorites(response.favoritos);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);
  
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);
  
  const removeFavorite = async (id: number) => {
    try {
      await favoritesService.removeFavorite(id);
      setFavorites(prev => prev.filter(f => f.idFavorito !== id));
      toast.success('Removido de favoritos');
    } catch (err) {
      toast.error('Error al remover favorito');
    }
  };
  
  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    removeFavorite,
    sortBy,
    setSortBy,
    stats
  };
};
```

---

#### useFavoriteToggle Hook

```typescript
interface UseFavoriteToggleReturn {
  isFavorite: boolean;
  loading: boolean;
  toggle: () => Promise<{ success: boolean }>;
  idFavorito: number | null;
}

const useFavoriteToggle = (canchaId: number): UseFavoriteToggleReturn => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idFavorito, setIdFavorito] = useState<number | null>(null);
  const { user } = useAuth();
  
  // Verificar si es favorito al montar
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) {
        // Verificar en localStorage
        const localFavorites = getLocalFavorites();
        setIsFavorite(localFavorites.includes(canchaId));
        return;
      }
      
      try {
        const response = await favoritesService.checkIsFavorite(canchaId);
        setIsFavorite(response.esFavorito);
        setIdFavorito(response.idFavorito);
      } catch (err) {
        console.error('Error al verificar favorito:', err);
      }
    };
    
    checkFavorite();
  }, [canchaId, user]);
  
  const toggle = async (): Promise<{ success: boolean }> => {
    if (!user) {
      // Si no está logueado, guardar en localStorage
      const localFavorites = getLocalFavorites();
      if (isFavorite) {
        setLocalFavorites(localFavorites.filter(id => id !== canchaId));
      } else {
        setLocalFavorites([...localFavorites, canchaId]);
      }
      setIsFavorite(!isFavorite);
      return { success: true };
    }
    
    setLoading(true);
    
    try {
      if (isFavorite) {
        // Remover
        await favoritesService.removeFavorite(idFavorito!);
        setIsFavorite(false);
        setIdFavorito(null);
      } else {
        // Agregar
        const response = await favoritesService.addFavorite(canchaId);
        setIsFavorite(true);
        setIdFavorito(response.idFavorito);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error al toggle favorito:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    isFavorite,
    loading,
    toggle,
    idFavorito
  };
};
```

---

### 7. SERVICIO FRONTEND

**favoritesService.ts:**

```typescript
import { getApiUrl } from '@/core/config/api';

interface AddFavoriteData {
  idCancha: number;
  notificacionesActivas?: boolean;
  etiquetas?: string[];
}

interface FavoriteFilters {
  orden?: 'reciente' | 'rating' | 'precio-asc' | 'precio-desc';
  deporte?: number;
  precioMax?: number;
}

class FavoritesService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  
  async addFavorite(idCancha: number): Promise<{ idFavorito: number }> {
    const response = await fetch(getApiUrl('/favoritos'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ idCancha })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Error al agregar favorito');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  async removeFavorite(idFavorito: number): Promise<void> {
    const response = await fetch(getApiUrl(`/favoritos/${idFavorito}`), {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al remover favorito');
    }
  }
  
  async getFavorites(filters?: FavoriteFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.orden) params.append('orden', filters.orden);
    if (filters?.deporte) params.append('deporte', filters.deporte.toString());
    if (filters?.precioMax) params.append('precioMax', filters.precioMax.toString());
    
    const response = await fetch(
      getApiUrl(`/favoritos?${params.toString()}`),
      {
        headers: this.getAuthHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Error al cargar favoritos');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  async checkIsFavorite(idCancha: number): Promise<{ esFavorito: boolean; idFavorito: number | null }> {
    const response = await fetch(
      getApiUrl(`/favoritos/verificar/${idCancha}`),
      {
        headers: this.getAuthHeaders()
      }
    );
    
    if (!response.ok) {
      return { esFavorito: false, idFavorito: null };
    }
    
    const data = await response.json();
    return data.data;
  }
  
  async getStats(): Promise<any> {
    const response = await fetch(getApiUrl('/favoritos/estadisticas'), {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar estadísticas');
    }
    
    const data = await response.json();
    return data.data;
  }
}

export default new FavoritesService();
```

---

### 8. SINCRONIZACIÓN CON LOCALSTORAGE

**Helpers para favoritos sin login:**

```typescript
// lib/localFavorites.ts

const LOCAL_FAVORITES_KEY = 'rogu_local_favorites';

export const getLocalFavorites = (): number[] => {
  const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const setLocalFavorites = (favorites: number[]): void => {
  localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favorites));
};

export const addLocalFavorite = (canchaId: number): void => {
  const favorites = getLocalFavorites();
  if (!favorites.includes(canchaId)) {
    setLocalFavorites([...favorites, canchaId]);
  }
};

export const removeLocalFavorite = (canchaId: number): void => {
  const favorites = getLocalFavorites();
  setLocalFavorites(favorites.filter(id => id !== canchaId));
};

export const syncLocalFavoritesWithServer = async (): Promise<void> => {
  const localFavorites = getLocalFavorites();
  
  if (localFavorites.length === 0) return;
  
  try {
    // Agregar todos los favoritos locales al servidor
    for (const canchaId of localFavorites) {
      await favoritesService.addFavorite(canchaId);
    }
    
    // Limpiar localStorage
    localStorage.removeItem(LOCAL_FAVORITES_KEY);
    
    console.log('✅ Favoritos sincronizados');
  } catch (error) {
    console.error('❌ Error al sincronizar favoritos:', error);
  }
};
```

**Llamar en AuthContext después de login:**
```typescript
// En login success:
await syncLocalFavoritesWithServer();
```

---

## 🧪 TESTING

### Backend Testing

**Tests unitarios:**
1. FavoritoService
   - Agregar favorito
   - Remover favorito
   - Verificar duplicados
   - Obtener lista

2. Endpoints
   - POST /api/favoritos
   - DELETE /api/favoritos/:id
   - GET /api/favoritos
   - GET /api/favoritos/verificar/:idCancha

**Tests de edge cases:**
- Agregar favorito que ya existe
- Remover favorito que no existe
- Agregar favorito de cancha inexistente
- Verificar permisos de usuario

---

### Frontend Testing

**Tests de componentes:**
1. FavoriteButton
   - Toggle on/off
   - Loading state
   - Animaciones

2. FavoritesPage
   - Renderizar lista
   - Empty state
   - Ordenamiento

3. useFavoriteToggle
   - Estado inicial
   - Toggle funciona
   - Sincronización con servidor

**Tests E2E:**
- Agregar a favoritos desde card
- Ver página de favoritos
- Remover de favoritos
- Reservar desde favoritos
- Sincronizar al hacer login

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Días 1-3: Backend

- Día 1: Crear tabla Favorito y migrations
- Día 2: FavoritoService completo
- Día 3: Endpoints y testing

### Días 4-7: Frontend

- Día 4: FavoriteButton componente
- Día 5: FavoritesPage y componentes
- Día 6: Hooks (useFavorites, useFavoriteToggle)
- Día 7: LocalStorage sync y testing

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos
- [ ] Crear tabla Favorito
- [ ] Crear índices
- [ ] Scripts SQL

### Backend
- [ ] FavoritoService.agregar()
- [ ] FavoritoService.remover()
- [ ] FavoritoService.obtenerPorUsuario()
- [ ] FavoritoService.verificar()
- [ ] POST /api/favoritos
- [ ] DELETE /api/favoritos/:id
- [ ] GET /api/favoritos
- [ ] GET /api/favoritos/verificar/:idCancha

### Frontend - Componentes
- [ ] FavoriteButton
- [ ] FavoritesPage
- [ ] FavoriteCard
- [ ] EmptyFavorites
- [ ] FavoriteFilters

### Frontend - Hooks
- [ ] useFavorites
- [ ] useFavoriteToggle

### Frontend - Servicios
- [ ] favoritesService.ts
- [ ] localFavorites helpers
- [ ] Sincronización al login

### Testing
- [ ] Tests backend
- [ ] Tests frontend
- [ ] Tests E2E

---

## 📝 NOTAS FINALES

**No requiere dependencias adicionales** - usa las existentes del proyecto.

**Integración con otros módulos:**
- ✅ Notificaciones: alertas de promociones en favoritos
- ✅ Búsqueda: filtrar solo favoritos
- ✅ Analytics: métricas de favoritos para dueños
- ✅ Reseñas: "Has reservado esta cancha X veces"

**Features opcionales (futuras):**
- [ ] Colecciones de favoritos ("Canchas de fútbol", "Cerca de casa")
- [ ] Compartir lista de favoritos con amigos
- [ ] Comparar favoritos lado a lado
- [ ] Historial de favoritos (canchas que ya no son favoritas)

---

**Última actualización:** 5 de noviembre de 2025  
**Responsable:** Enrique Fernández  
**Estado:** Documentación completa - Listo para implementar
