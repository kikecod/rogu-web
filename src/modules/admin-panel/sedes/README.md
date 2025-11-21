# Módulo de Gestión de Sedes - Panel de Administración

## 📁 Estructura del Módulo

```
sedes/
├── components/           # Componentes reutilizables
│   ├── SedeCard.tsx     # Tarjeta de sede para el listado
│   ├── SedesFiltros.tsx # Componente de filtros
│   ├── Paginacion.tsx   # Componente de paginación
│   └── index.ts         # Exportaciones
├── hooks/               # Hooks personalizados
│   ├── useSedes.ts      # Hook para gestión de listado
│   ├── useSedeDetalle.ts # Hook para detalle de sede
│   └── index.ts         # Exportaciones
├── pages/               # Páginas del módulo
│   ├── SedesListPage.tsx    # Listado de sedes
│   ├── SedeDetallePage.tsx  # Detalle de sede
│   ├── SedeFormPage.tsx     # Formulario crear/editar
│   └── index.ts             # Exportaciones
├── services/            # Servicios de API
│   └── sedes.service.ts     # Servicio de sedes
├── types/               # Tipos TypeScript
│   └── index.ts         # Definiciones de tipos
└── index.ts             # Exportación principal
```

## 🚀 Características Implementadas

### ✅ CRUD Completo
- ✅ **Listar Sedes**: Visualización en grid con tarjetas informativas
- ✅ **Ver Detalle**: Página completa con información detallada
- ✅ **Crear Sede**: Formulario completo de creación
- ✅ **Editar Sede**: Formulario de edición con datos pre-cargados
- ✅ **Eliminar Sede**: Función implementada (falta modal de confirmación)

### 🔍 Filtros y Búsqueda
- Búsqueda por nombre
- Filtro por ciudad
- Filtro por estado (provincia)
- Filtro por estado de verificación (verificada/no verificada)
- Filtro por estado activo (activa/inactiva)
- Botón para limpiar todos los filtros

### 📄 Paginación
- Paginación completa con controles
- Información de resultados mostrados
- Navegación entre páginas
- Límite configurable de resultados por página

### 📊 Visualización de Datos
- **Tarjeta de Sede**: Muestra información resumida con estadísticas
- **Página de Detalle**: Información completa con:
  - Datos básicos
  - Estadísticas (reservas, ingresos, ocupación)
  - Lista de canchas asociadas
  - Información del dueño
  - Calificación y reseñas
  - Fechas de creación y actualización

## 🛠️ Endpoints Utilizados

### Listado de Sedes
```
GET /sede?buscar=...&ciudad=...&verificada=...&activa=...&page=1&limit=12
```

### Obtener Sede por ID
```
GET /sede/:id
```

### Crear Sede
```
POST /sede
Body: {
  nombre: string,
  descripcion?: string,
  direccion: string,
  ciudad: string,
  distrito?: string,
  estado?: string,
  latitud?: number,
  longitud?: number,
  idDuenio: number
}
```

### Editar Sede
```
PUT /sede/:id
Body: {
  nombre?: string,
  descripcion?: string,
  direccion?: string,
  ciudad?: string,
  distrito?: string,
  estado?: string,
  latitud?: number,
  longitud?: number,
  activa?: boolean,
  verificada?: boolean
}
```

### Eliminar Sede
```
DELETE /sede/:id
Body: {
  motivo: string,
  confirmacion: true
}
```

### Acciones Administrativas
```
PUT /sede/:id/verificar       # Verificar sede
PUT /sede/:id/rechazar        # Rechazar verificación
PUT /sede/:id/activar         # Activar sede
PUT /sede/:id/desactivar      # Desactivar sede
PUT /sede/:id/reactivar       # Reactivar sede
GET /sede/:id/estadisticas    # Obtener estadísticas
GET /sede/:id/canchas         # Obtener canchas
GET /sede/:id/historial       # Obtener historial
```

## 📝 Tipos TypeScript

### Interfaces Principales

```typescript
interface Sede {
  idSede: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  distrito?: string;
  estado?: string;
  latitud?: number;
  longitud?: number;
  verificada: boolean;
  activa: boolean;
  idDuenio: number;
  duenio?: DuenioInfo;
  totalCanchas?: number;
  promedioCalificacion?: number;
  totalResenas?: number;
  totalReservas?: number;
  creadoEn: string | Date;
  actualizadoEn?: string | Date;
}

interface SedeDetalle extends Sede {
  canchas?: Cancha[];
  horarios?: HorarioSede[];
  fotos?: FotoSede[];
  estadisticas: EstadisticasSede;
  historial?: HistorialSede[];
}
```

## 🎨 Componentes Reutilizables

### SedeCard
Tarjeta para mostrar información resumida de una sede.

**Props:**
```typescript
{
  sede: Sede;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

### SedesFiltros
Componente de filtros con búsqueda y filtros múltiples.

**Props:**
```typescript
{
  filtros: FiltrosSedes;
  onFiltrosChange: (filtros: FiltrosSedes) => void;
  onLimpiarFiltros: () => void;
}
```

### Paginacion
Componente de paginación completo.

**Props:**
```typescript
{
  paginaActual: number;
  totalPaginas: number;
  onCambioPagina: (pagina: number) => void;
  total?: number;
  mostrandoDesde?: number;
  mostrandoHasta?: number;
}
```

## 🪝 Hooks Personalizados

### useSedes
Hook para manejar el listado de sedes con filtros y paginación.

**Uso:**
```typescript
const {
  sedes,           // Array de sedes
  loading,         // Estado de carga
  error,           // Error si existe
  total,           // Total de sedes
  pagina,          // Página actual
  totalPaginas,    // Total de páginas
  filtros,         // Filtros activos
  actualizarFiltros,  // Actualizar filtros
  limpiarFiltros,     // Limpiar filtros
  cambiarPagina,      // Cambiar página
  recargar,           // Recargar datos
} = useSedes();
```

### useSedeDetalle
Hook para obtener el detalle de una sede.

**Uso:**
```typescript
const {
  sede,      // Detalle de la sede
  loading,   // Estado de carga
  error,     // Error si existe
  recargar,  // Recargar datos
} = useSedeDetalle(idSede);
```

## 🔄 Flujo de Trabajo

### Crear Nueva Sede
1. Usuario hace clic en "Nueva Sede"
2. Navega a `/admin/sedes/nueva`
3. Completa el formulario
4. Sistema valida campos requeridos
5. Envía POST a `/sede`
6. Redirige a la página de detalle de la sede creada

### Editar Sede
1. Usuario hace clic en "Editar" desde el listado o detalle
2. Navega a `/admin/sedes/:id/editar`
3. Sistema carga datos actuales de la sede
4. Usuario modifica campos
5. Envía PUT a `/sede/:id`
6. Redirige a la página de detalle actualizada

### Ver Detalle
1. Usuario hace clic en una tarjeta de sede
2. Navega a `/admin/sedes/:id`
3. Sistema carga información completa
4. Muestra datos, estadísticas, canchas, etc.

### Eliminar Sede
1. Usuario hace clic en "Eliminar"
2. **TODO**: Mostrar modal de confirmación
3. Usuario confirma y proporciona motivo
4. Envía DELETE a `/sede/:id`
5. Redirige al listado de sedes

## 🎯 Próximos Pasos (TODO)

### Funcionalidades Pendientes
- [ ] Modal de confirmación para eliminar sede
- [ ] Selector de dueño en formulario de creación
- [ ] Gestión de fotos de la sede
- [ ] Gestión de horarios de la sede
- [ ] Historial de cambios detallado
- [ ] Acciones masivas (activar/desactivar múltiples)
- [ ] Exportar listado a CSV/Excel
- [ ] Integración con mapa para ubicación

### Mejoras de UX
- [ ] Toast notifications para acciones exitosas
- [ ] Loading skeletons en lugar de spinner
- [ ] Animaciones de transición
- [ ] Modo de vista tabla/grid
- [ ] Ordenamiento por columnas
- [ ] Guardar preferencias de filtros

### Optimizaciones
- [ ] Cache de consultas frecuentes
- [ ] Lazy loading de imágenes
- [ ] Virtualización del listado
- [ ] Optimización de consultas a API

## 🚦 Rutas del Módulo

```typescript
/admin/sedes                    # Listado de sedes
/admin/sedes/nueva              # Crear nueva sede
/admin/sedes/:id                # Detalle de sede
/admin/sedes/:id/editar         # Editar sede
```

## 💡 Notas Importantes

1. **Autenticación**: Todas las rutas requieren autenticación de admin
2. **Permisos**: Verificar permisos del usuario antes de acciones críticas
3. **Validación**: Los formularios validan datos antes de enviar al backend
4. **Estados**: Las sedes pueden estar activas/inactivas y verificadas/no verificadas
5. **Soft Delete**: La eliminación es lógica, no física

## 📚 Documentación Relacionada

- Ver `GUIA_IMPLEMENTACION_PANEL_ADMIN.md` para arquitectura general
- Ver `types/index.ts` para definiciones completas de tipos
- Ver `services/sedes.service.ts` para documentación de API
