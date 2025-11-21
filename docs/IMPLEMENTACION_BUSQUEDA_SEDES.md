# Implementación de Búsqueda por Sedes

## 📋 Resumen

Se implementó el cambio de flujo de búsqueda de **canchas individuales** a **sedes/espacios deportivos**, siguiendo el feedback del licenciado. Este cambio mejora la experiencia del usuario permitiendo:

1. Buscar y listar sedes completas
2. Ver detalles de la sede con todas sus instalaciones
3. Seleccionar una cancha específica de la sede
4. Proceder con la reserva

## 🎯 Objetivos Completados

✅ Sistema de tipos TypeScript completo para sedes  
✅ Servicio de API integrado con backend  
✅ Componente de tarjeta de sede (SedeCard)  
✅ Página de listado de sedes (HomePageVenues)  
✅ Página de detalle de sede (VenueDetailPage)  
✅ Rutas actualizadas en React Router  

## 📁 Estructura de Archivos Creados/Modificados

```
src/modules/venues/
├── types/
│   └── venue-search.types.ts          ← NUEVO: Tipos completos del sistema
├── services/
│   └── venueService.ts                ← NUEVO: Servicio de API
├── components/
│   └── SedeCard.tsx                   ← NUEVO: Card de sede
└── pages/
    ├── VenueDetailPage.tsx            ← ACTUALIZADO: Detalle de sede
    └── HomePageVenues.tsx             ← NUEVO: Listado de sedes

src/
└── App.tsx                            ← ACTUALIZADO: Rutas nuevas
```

## 🔧 Detalles Técnicos

### 1. Sistema de Tipos (`venue-search.types.ts`)

Define las interfaces TypeScript para todo el sistema:

#### Entidades Principales

- **`SedeEstadisticas`**: Métricas de la sede
  - Total canchas, deportes disponibles
  - Precios (desde-hasta)
  - Ratings (general, canchas, final ponderado)
  - Total de reseñas

- **`SedeCard`**: Para listado/búsqueda
  - Info básica de sede
  - Ubicación completa (country, city, district, etc.)
  - Foto principal y galería
  - Estadísticas resumidas
  - Info del dueño

- **`SedeDetalle`**: Detalle completo
  - Extiende SedeCard
  - Políticas, NIT, licencia
  - Horarios, amenities

- **`CanchaResumen`**: Canchas de la sede
  - Info de cancha individual
  - Disciplinas disponibles
  - Precio, rating, reseñas
  - Fotos, especificaciones técnicas

- **`CalificacionSede`**: Reseñas de sede
  - Puntajes detallados (atención, instalaciones, ubicación, etc.)
  - Comentarios
  - Info del cliente

#### Filtros

- **`VenueSearchFilters`**: Filtros para búsqueda de sedes
- **`SedeCanchasFilters`**: Filtros para canchas dentro de una sede

### 2. Servicio de API (`venueService.ts`)

Singleton que conecta con el backend:

```typescript
class VenueService {
  // Búsqueda de sedes con filtros
  async searchVenues(filters: VenueSearchFilters): Promise<SedeCard[]>
  
  // Obtener detalle de sede
  async getVenueById(idSede: number): Promise<SedeDetalleResponse>
  
  // Obtener canchas de una sede (con filtros)
  async getVenueFields(idSede: number, filters?: SedeCanchasFilters): Promise<SedeCanchasResponse>
  
  // Obtener reseñas de sede
  async getVenueReviews(idSede: number): Promise<SedeResenasResponse>
  
  // Verificar si puede calificar
  async canReviewVenue(idSede: number, idReserva: number): Promise<boolean>
  
  // Crear reseña
  async createVenueReview(data: CrearCalificacionSedeDTO): Promise<CalificacionSede>
  
  // Subir foto
  async createVenuePhoto(idSede: number, formData: FormData): Promise<FotoSede>
  
  // Fallback: obtener todas las sedes
  async getAllVenues(): Promise<SedeCard[]>
}
```

**Base URL**: `${getApiUrl()}/sedes`

### 3. Componente `SedeCard`

Card reutilizable para mostrar sedes en el listado:

**Props**: `{ sede: SedeCard }`

**Features**:
- Imagen con badge de verificación (si está verificada)
- Nombre y ubicación
- Tags de deportes (primeros 3 + contador)
- Rating con total de reseñas
- Rango de precios (Bs X - Bs Y)
- Click navega a `/venues/:idSede`

**Diseño**: Responsive, hover effect con scale, TailwindCSS

### 4. Página `HomePageVenues`

Nueva homepage para búsqueda por sedes:

**Estado**:
```typescript
const [sedes, setSedes] = useState<SedeCard[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [filters, setFilters] = useState<VenueSearchFilters>({});
```

**Funcionalidad**:
- Carga inicial con `venueService.getAllVenues()`
- Barra de búsqueda (ubicación, fecha, hora)
- Filtros (deportes, precio, rating)
- Grid de SedeCards
- Estados de loading y error

**Layout**: Header + SearchBar + Filters + Grid de sedes + Footer

### 5. Página `VenueDetailPage`

Detalle completo de una sede:

**Parámetros**: `idSede` desde URL `/venues/:idSede`

**Carga de datos** (paralela):
```typescript
const [venueResponse, fieldsResponse, reviewsResponse] = await Promise.all([
  venueService.getVenueById(idSede),
  venueService.getVenueFields(idSede),
  venueService.getVenueReviews(idSede)
]);
```

**Secciones**:

1. **Hero Image**
   - Foto principal de la sede
   - Badge "Sede Deportiva"
   - Badge "Verificado" (si aplica)

2. **Columna Principal** (izquierda)
   - Título y rating
   - Descripción
   - Información general (total canchas, precio desde)
   - **Grid de canchas disponibles** ← CLAVE
     - Click navega a `/venues/:idSede/fields/:idCancha`
     - Muestra foto, nombre, disciplinas, rating, precio
   - Mapa de ubicación
   - Reseñas (últimas 3)

3. **Sidebar** (derecha, sticky)
   - Info del propietario
   - Contacto (teléfono, email)
   - Estadísticas rápidas
   - Horarios

**Navegación**: 
- Back button → Home
- Click en cancha → FieldDetailPage

### 6. Rutas Actualizadas (`App.tsx`)

```tsx
{/* Venue routes - Búsqueda por sedes */}
<Route path="/venues/:idSede" element={<VenueDetailPage />} />
<Route path="/venues/:idSede/fields/:idCancha" element={<FieldDetailPage />} />

{/* Legacy routes - mantener compatibilidad */}
<Route path="/field/:id" element={<FieldDetailPage />} />
<Route path="/sede/:id" element={<VenueDetailPage />} />
```

## 🔄 Flujo de Usuario

```
1. HOME (HomePageVenues)
   ↓ Usuario busca y filtra sedes
   ↓ Click en SedeCard
   
2. VENUE DETAIL (VenueDetailPage)
   ↓ Ve información completa de la sede
   ↓ Explora las canchas disponibles
   ↓ Click en una cancha específica
   
3. FIELD DETAIL (FieldDetailPage)
   ↓ Ve horarios disponibles de esa cancha
   ↓ Selecciona fecha y hora
   ↓ Click "Reservar"
   
4. CHECKOUT (CheckoutPage)
   ↓ Confirma reserva y paga
   
5. CONFIRMATION (BookingConfirmationPage)
   ✓ Reserva completada
```

## 📊 Endpoints del Backend Utilizados

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| GET | `/sedes` | Lista todas las sedes (fallback) |
| GET | `/sedes/:id` | Detalle completo de una sede |
| GET | `/sedes/:id/canchas` | Canchas de una sede |
| GET | `/califica-sede/sede/:idSede` | Reseñas de la sede |
| POST | `/califica-sede` | Crear reseña de sede |
| POST | `/sedes/:id/fotos` | Subir foto de sede |

## 🎨 Diseño y UX

### Colores principales
- Azul primario: `blue-600` (branding)
- Verde: `green-600` (verificación)
- Amarillo: `yellow-400` (ratings)
- Gris: `gray-50` a `gray-900` (textos y fondos)

### Componentes visuales
- **Badges**: Verificado, Sede Deportiva
- **Cards**: Elevación con shadow-lg
- **Ratings**: Estrellas rellenas + número
- **Precios**: Formato "Bs X - Bs Y"
- **Deportes**: Tags en azul claro
- **Sticky Sidebar**: Info de contacto siempre visible

### Responsive
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)

## 🚀 Próximos Pasos

### Tareas pendientes:

1. **Integrar HomePageVenues como página principal**
   - Reemplazar actual HomePage
   - O agregar toggle entre vistas

2. **Actualizar FieldDetailPage**
   - Agregar parámetro `idSede` desde URL
   - Mostrar breadcrumb: Home > Sede > Cancha
   - Mostrar contexto de la sede

3. **Actualizar Header**
   - Cambiar placeholder de búsqueda
   - De: "Buscar canchas deportivas..."
   - A: "Buscar espacios deportivos..."

4. **Componente de Filtros**
   - Adaptar para filtros de sede
   - Ciudad, deportes, rango de precios

5. **Componente de Mapa**
   - Integrar MapView para mostrar ubicación
   - Reemplazar el placeholder actual

6. **Sistema de Fotos**
   - Carrusel de imágenes en VenueDetailPage
   - Galería expandible

7. **Reviews completas**
   - Componente dedicado para reviews
   - Paginación
   - Formulario para crear reseña

## 📝 Notas de Implementación

### Decisiones de diseño:

1. **Rating ponderado**: 
   ```
   ratingFinal = promedio(ratingGeneral de sede, ratingCanchas)
   ```

2. **Fallback para imágenes**:
   ```tsx
   src={venue.fotos?.[0]?.urlFoto || '/placeholder-venue.jpg'}
   ```

3. **Manejo de errores**:
   - Try-catch en carga de datos
   - Estados de loading y error
   - Mensajes amigables al usuario

4. **Tipos estrictos**:
   - Todo tipado con TypeScript
   - No se usa `any`
   - Interfaces para requests/responses

### Compatibilidad:

- Se mantienen rutas legacy (`/sede/:id`, `/field/:id`)
- Componentes anteriores siguen funcionando
- Transición gradual posible

## 🐛 Troubleshooting

### Si las sedes no cargan:
1. Verificar que el backend esté corriendo
2. Revisar URL del API en `getApiUrl()`
3. Verificar CORS
4. Revisar console para errores de red

### Si las imágenes no cargan:
1. Verificar URLs en response del backend
2. Agregar placeholders
3. Revisar permisos de CORS para imágenes

### Si los filtros no funcionan:
1. Verificar que `searchVenues` construya bien el query string
2. Revisar que el backend acepte los parámetros
3. Console.log los filtros aplicados

## ✅ Testing

### Tests recomendados:

- [ ] Cargar listado de sedes
- [ ] Aplicar filtros (deporte, precio, rating)
- [ ] Click en sede navega correctamente
- [ ] Detalle de sede muestra info completa
- [ ] Grid de canchas se renderiza
- [ ] Click en cancha navega con ambos IDs
- [ ] Sidebar es sticky en scroll
- [ ] Responsive en mobile, tablet, desktop
- [ ] Manejo de errores (red, 404, 500)
- [ ] Loading states funcionan

---

**Autor**: Kike (Enrique Fernández)  
**Fecha**: ${new Date().toLocaleDateString('es-ES')}  
**Branch**: enrique-v7  
**Ticket**: Cambio de flujo - Búsqueda por Sedes
