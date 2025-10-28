# 🎯 Integración Completa de API de Canchas - Página de Detalles

## ✅ Resumen de la Implementación

Se ha conectado exitosamente la página de detalles de canchas (`SportFieldDetailPage`) con los 3 endpoints del backend.

---

## 📡 Endpoints Integrados

### 1. GET `/api/cancha/:id`
**Propósito**: Obtener información completa de la cancha y su sede

**Respuesta**:
```json
{
  "id_cancha": 4,
  "nombre": "Cancha Central",
  "superficie": "Césped sintético",
  "cubierta": true,
  "aforoMax": 22,
  "dimensiones": "100 x 60",
  "reglasUso": "No fumar...",
  "iluminacion": "LED",
  "estado": "Disponible",
  "precio": "45.00",
  "fotos": [...],
  "sede": {
    "id_sede": 1,
    "nombre": "Complejo Deportivo Central",
    "direccion": "Av. Principal 123",
    "ciudad": "Lima",
    "telefono": "+51 999 999 999",
    "email": "contacto@deportivo.com",
    "horarioApertura": "06:00",
    "horarioCierre": "23:00",
    "descripcion": "Moderno complejo..."
  }
}
```

### 2. GET `/api/reservas/cancha/:canchaId`
**Propósito**: Obtener reservas existentes para mostrar disponibilidad

**Respuesta**:
```json
[
  {
    "id_reserva": 1,
    "fecha": "2025-10-20",
    "horaInicio": "09:00",
    "horaFin": "10:00",
    "estado": "Confirmada"
  }
]
```

**Lógica de Disponibilidad**:
- ✅ **Disponible**: Sin reserva o estado "Cancelada"
- ❌ **No disponible**: Estado "Confirmada" o "Pendiente"

### 3. GET `/api/califica-cancha/cancha/:id_cancha`
**Propósito**: Obtener reseñas y calificaciones

**Respuesta**:
```json
[
  {
    "idResena": "5-4-1",
    "id_usuario": 5,
    "calificacion": 5,
    "comentario": "Excelente cancha...",
    "fecha": "2025-10-15T10:00:00.000Z",
    "usuario": {
      "nombre": "Juan Pérez",
      "avatar": "/uploads/avatar_juan.jpg"
    }
  }
]
```

---

## 🔧 Archivos Modificados

### 1. **src/types/index.ts**
Se agregaron las siguientes interfaces:

```typescript
// Interfaces para la API
export interface ApiSede { ... }
export interface ApiReserva { ... }
export interface ApiUsuario { ... }
export interface ApiResena { ... }
export interface ApiCanchaDetalle extends ApiCancha { ... }

// Tipos extendidos
export interface SportField {
  // ... campos existentes
  surface?: string;
  size?: string;
  indoor?: boolean;
  lighting?: string;
  rules?: string[];
  capacity?: number;
  openingHours?: { open: string; close: string };
  reviewsList?: Review[];
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}

export interface Review {
  id: string;
  user: { name: string; avatar: string };
  rating: number;
  date: string;
  comment: string;
}
```

### 2. **src/utils/helpers.ts**
Nuevas funciones agregadas:

#### `fetchCanchaById(id: string): Promise<SportField>`
- Obtiene datos de la cancha desde el endpoint
- Hace llamadas a los 3 endpoints en paralelo
- Maneja errores de cada endpoint independientemente

#### `convertApiCanchaDetalleToSportField(cancha, reservas, resenas): SportField`
- Convierte datos de la API al formato interno
- Mapea superficie a tipo de deporte
- Calcula rating promedio de reseñas
- Genera slots de disponibilidad

#### `generateAvailabilitySlots(horarioApertura, horarioCierre, reservas, precio): TimeSlot[]`
- Genera horarios por hora entre apertura y cierre
- Marca como no disponibles los horarios con reservas "Confirmada" o "Pendiente"
- Excluye reservas "Cancelada"

### 3. **src/pages/SportFieldDetailPage.tsx**
Cambios principales:

#### Estados agregados:
```typescript
const [field, setField] = useState<SportField | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

#### useEffect para cargar datos:
```typescript
useEffect(() => {
  const loadField = async () => {
    if (!id) return;
    try {
      const fieldData = await fetchCanchaById(id);
      setField(fieldData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadField();
}, [id]);
```

#### UI States:
- **Loading**: Spinner animado mientras carga
- **Error**: Mensaje amigable con botón para volver
- **Success**: Muestra toda la información de la cancha

---

## 🎨 Características Implementadas

### 📸 Galería de Imágenes
- Muestra fotos reales del backend
- Navegación entre imágenes
- Contador de imágenes
- Fallback a imágenes por defecto según deporte

### 📊 Información de la Cancha
- ✅ Nombre y descripción
- ✅ Rating calculado de reseñas reales
- ✅ Ubicación desde datos de la sede
- ✅ Precio por hora
- ✅ Amenidades generadas automáticamente:
  - Estado de cubierta (techado/al aire libre)
  - Tipo de iluminación
  - Superficie
  - Capacidad máxima
  - Dimensiones

### 📅 Sistema de Reservas
- **Horarios dinámicos**: Generados desde horario de apertura/cierre
- **División por hora**: Cada slot es de 1 hora
- **Disponibilidad real**: Basada en reservas existentes
- **Estados visuales**:
  - 🟢 Disponible (verde)
  - 🔴 Ocupado (gris tachado)
  - 🔵 Seleccionado (azul)
- **Multi-selección**: Permite reservar múltiples horarios

### ⭐ Sistema de Reseñas
- Muestra reseñas reales del backend
- Avatar y nombre del usuario
- Calificación con estrellas (1-5)
- Fecha de la reseña
- Comentario
- **Mensaje cuando no hay reseñas**:
  ```
  💬 No hay reseñas todavía
  Sé el primero en dejar una reseña
  ```

### 📍 Información de la Sede
- Nombre del complejo deportivo
- Dirección completa
- Ciudad
- Horario de operación
- Descripción

---

## 🔍 Lógica de Disponibilidad

### Generación de Slots
```typescript
Horario: 06:00 - 23:00
Slots generados:
- 06:00 - 07:00
- 07:00 - 08:00
- ...
- 22:00 - 23:00
```

### Verificación de Disponibilidad
```typescript
Para cada slot:
1. Buscar reservas que cubran ese horario
2. Si tiene reserva "Confirmada" o "Pendiente" → No disponible
3. Si tiene reserva "Cancelada" → Disponible
4. Sin reserva → Disponible
```

---

## 🎭 Estados de la UI

### 1. **Estado de Carga**
```jsx
<div className="min-h-screen flex items-center justify-center">
  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" />
  <p>Cargando cancha...</p>
</div>
```

### 2. **Estado de Error**
```jsx
<div className="text-center">
  <div className="text-6xl">😞</div>
  <h2>Cancha no encontrada</h2>
  <p>{error}</p>
  <button onClick={() => navigate('/')}>Volver al inicio</button>
</div>
```

### 3. **Estado de Éxito**
Muestra toda la información de la cancha con los datos del backend

---

## 📝 Mapeo de Datos

### Superficie → Deporte
```typescript
'Parquet' | 'Duela' → 'basketball' 🏀
'Césped' | 'Césped sintético' → 'football' ⚽
'Tierra batida' | 'Cemento' → 'tennis' 🎾
'Arena' → 'volleyball' 🏐
'Sintético' → 'paddle' 🏓
```

### Cálculo de Rating
```typescript
Si hay reseñas:
  rating = promedio de todas las calificaciones
  reviews = cantidad de reseñas
  
Si no hay reseñas:
  rating = 4.5 (default)
  reviews = 0
```

---

## 🧪 Cómo Probar

### 1. Asegúrate que el backend esté corriendo
```bash
# Backend debe estar en http://localhost:3000
```

### 2. Navega a una cancha
```
http://localhost:5173/field/4
```

### 3. Verifica en la consola del navegador
Deberías ver logs como:
```
🔍 Fetching cancha with ID: 4
✅ Cancha obtenida: {...}
✅ Reservas obtenidas: [...]
✅ Reseñas obtenidas: [...]
🖼️ Foto URL: /uploads/img_xxx.jpg → http://localhost:3000/uploads/img_xxx.jpg
```

---

## 🐛 Troubleshooting

### Problema: No carga la cancha
**Solución**: 
- Verificar que el ID de la cancha existe en el backend
- Revisar la consola del navegador para errores
- Verificar que el backend esté corriendo

### Problema: Horarios no se muestran
**Solución**:
- Verificar que `horarioApertura` y `horarioCierre` tengan formato "HH:mm"
- Si no hay horarios, se muestra: "✅ Todos los horarios disponibles"

### Problema: Imágenes no cargan
**Solución**:
- Verificar que las URLs de fotos sean correctas
- Asegurarse que el backend sirva archivos estáticos desde `/uploads`
- Las imágenes tienen fallback automático a imágenes por defecto

### Problema: Reseñas no aparecen
**Solución**:
- Si el endpoint `/califica-cancha/cancha/:id` falla, se muestra mensaje: "No hay reseñas todavía"
- Es normal si la cancha no tiene reseñas

---

## ✨ Mejoras Futuras (Opcional)

- [ ] Implementar filtro de horarios por fecha
- [ ] Agregar mapa de ubicación
- [ ] Sistema de favoritos persistente
- [ ] Compartir en redes sociales
- [ ] Galería de imágenes en modal
- [ ] Paginación de reseñas
- [ ] Formulario para dejar reseñas
- [ ] Mostrar reglas de uso en sección dedicada

---

## 📊 Resumen de Datos

| Dato | Fuente | Fallback |
|------|--------|----------|
| Nombre | `/api/cancha/:id` | - |
| Precio | `/api/cancha/:id` | 0 |
| Fotos | `/api/cancha/:id` → `fotos[]` | Imágenes por defecto |
| Rating | `/api/califica-cancha/cancha/:id` | 4.5 |
| Reviews | `/api/califica-cancha/cancha/:id` | [] |
| Disponibilidad | `/api/reservas/cancha/:id` | Todos disponibles |
| Ubicación | `/api/cancha/:id` → `sede` | "N/A" |
| Horario | `/api/cancha/:id` → `sede` | - |

---

## 🎉 ¡Todo Listo!

La página de detalles de canchas está completamente integrada con los 3 endpoints del backend y lista para usarse sin necesidad de iniciar sesión. Los datos se cargan automáticamente y se muestran de forma elegante con estados de loading, error y éxito.
