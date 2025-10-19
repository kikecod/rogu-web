# 🔄 Flujo Completo de Navegación Dinámica

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOMEPAGE                                 │
│  http://localhost:5173/                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ GET /api/cancha
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend devuelve lista de canchas:                             │
│  [                                                               │
│    { id_cancha: 1, nombre: "Wally 1", ... },                    │
│    { id_cancha: 2, nombre: "Cancha B", ... },                   │
│    { id_cancha: 4, nombre: "Cancha Central", ... },             │
│  ]                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ convertApiCanchaToSportField()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend convierte a formato interno:                           │
│  [                                                               │
│    { id: "1", name: "Wally 1", ... },                          │
│    { id: "2", name: "Cancha B", ... },                         │
│    { id: "4", name: "Cancha Central", ... },                   │
│  ]                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Muestra SportFieldCards
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   USUARIO HACE CLIC                              │
│                                                                  │
│   [Wally 1]    [Cancha B]    [Cancha Central]                  │
│      ↑              ↑               ↑                            │
│    id="1"        id="2"          id="4"                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ handleFieldClick(field)
                              │ navigate(`/field/${field.id}`)
                              ▼
        ┌───────────────┬────────────────┬───────────────┐
        │               │                │               │
        ▼               ▼                ▼               ▼
    /field/1        /field/2        /field/4    /field/{cualquier-id}
        │               │                │               │
        └───────────────┴────────────────┴───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SPORT FIELD DETAIL PAGE                             │
│  const { id } = useParams()  // 👈 Obtiene ID de la URL         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ useEffect(() => { fetchCanchaById(id) }, [id])
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              LLAMADAS PARALELAS AL BACKEND                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 1. GET /api/cancha/{id}                                │    │
│  │    → Información de la cancha + sede                   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 2. GET /api/reservas/cancha/{id}                       │    │
│  │    → Lista de reservas para calcular disponibilidad    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 3. GET /api/califica-cancha/cancha/{id}                │    │
│  │    → Reseñas y calificaciones                          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ convertApiCanchaDetalleToSportField()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATOS PROCESADOS Y COMBINADOS                       │
│                                                                  │
│  SportField {                                                    │
│    id: "4",                                                      │
│    name: "Cancha Central",                                       │
│    images: [...],        // de fotos[]                          │
│    price: 45,            // de precio                           │
│    rating: 4.8,          // calculado de reseñas               │
│    reviews: 12,          // cantidad de reseñas                │
│    availability: [...],  // generado de reservas               │
│    reviewsList: [...],   // formateado de reseñas              │
│    location: {...},      // de sede                             │
│    owner: {...},         // de sede                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ setField(fieldData)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RENDERIZA LA PÁGINA                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  📸 Galería de Imágenes                                │    │
│  │  [Foto 1] [Foto 2] [Foto 3]                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  📊 Información                                         │    │
│  │  Nombre: Cancha Central                                │    │
│  │  ⭐ 4.8 (12 reseñas)                                   │    │
│  │  📍 Av. Principal 123, Lima                            │    │
│  │  💰 $45 / hora                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ⏰ Horarios Disponibles                               │    │
│  │  [06:00-07:00] ✅   [07:00-08:00] ✅                   │    │
│  │  [08:00-09:00] ❌   [09:00-10:00] ✅                   │    │
│  │  ...                                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  💬 Reseñas                                            │    │
│  │  ⭐⭐⭐⭐⭐ Juan Pérez - "Excelente cancha..."          │    │
│  │  ⭐⭐⭐⭐ María García - "Muy buena..."                 │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Casos de Uso

### Caso 1: Navegación Normal
```
Usuario en HomePage
  → Click en "Wally 1" (id: 1)
  → navigate('/field/1')
  → SportFieldDetailPage renderiza
  → useParams obtiene id = "1"
  → fetchCanchaById("1")
  → Muestra datos de cancha ID 1
```

### Caso 2: URL Directa
```
Usuario escribe en navegador: localhost:5173/field/25
  → SportFieldDetailPage renderiza
  → useParams obtiene id = "25"
  → fetchCanchaById("25")
  → Muestra datos de cancha ID 25
```

### Caso 3: Navegación entre Canchas
```
Usuario en /field/1
  → Hace click en link a otra cancha
  → URL cambia a /field/5
  → useEffect detecta cambio (dependencia: [id])
  → fetchCanchaById("5")
  → Muestra datos de cancha ID 5
```

### Caso 4: ID No Existe
```
Usuario en /field/999
  → fetchCanchaById("999")
  → Backend responde 404
  → catch(error)
  → setError("Cancha no encontrada")
  → Muestra pantalla de error
```

---

## 🔑 Puntos Clave

✅ **El ID es 100% dinámico** - No está hardcodeado en ninguna parte
✅ **Funciona con cualquier ID** - 1, 2, 4, 100, 999, etc.
✅ **Se obtiene de la URL** - `useParams()` lo extrae automáticamente
✅ **Se recarga al cambiar** - `useEffect` tiene `[id]` como dependencia
✅ **Maneja errores** - Si el ID no existe, muestra mensaje amigable

---

## 🧪 Pruebas Recomendadas

1. **Desde HomePage**:
   - Haz clic en diferentes canchas
   - Verifica que cada una muestre sus datos correctos

2. **URLs Directas**:
   ```
   /field/1  → Debe mostrar cancha 1
   /field/2  → Debe mostrar cancha 2
   /field/4  → Debe mostrar cancha 4
   ```

3. **Navegación del Navegador**:
   - Usa botón "Atrás" del navegador
   - Verifica que vuelva a la cancha anterior

4. **IDs Inexistentes**:
   ```
   /field/999  → Debe mostrar error "Cancha no encontrada"
   ```

5. **Consola del Navegador**:
   ```
   Deberías ver:
   🔍 Cargando cancha con ID: {ID_DINÁMICO}
   ✅ Cancha obtenida: { id_cancha: {ID_DINÁMICO}, ... }
   ```
