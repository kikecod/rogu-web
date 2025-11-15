# Estructura del Panel de Administración

## 📁 Arquitectura General

```
admin-panel/
├── dashboard/              # Dashboard principal
│   ├── components/
│   ├── hooks/
│   └── services/
│
├── sedes/                  # ✅ IMPLEMENTADO - Gestión de Sedes
│   ├── components/
│   │   ├── SedeCard.tsx
│   │   ├── SedesFiltros.tsx
│   │   └── Paginacion.tsx
│   ├── hooks/
│   │   ├── useSedes.ts
│   │   └── useSedeDetalle.ts
│   ├── pages/
│   │   ├── SedesListPage.tsx      # Listado con filtros
│   │   ├── SedeDetallePage.tsx    # Detalle completo
│   │   └── SedeFormPage.tsx       # Crear/Editar
│   ├── services/
│   │   └── sedes.service.ts       # API client
│   ├── types/
│   │   └── index.ts               # Interfaces TypeScript
│   ├── README.md                   # Documentación completa
│   └── index.ts
│
├── canchas/                # 🔲 ESTRUCTURA CREADA - Gestión de Canchas
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── types/
│
├── usuarios/               # Gestión de Usuarios (existente)
│   └── ...
│
├── reservas/               # 🔲 ESTRUCTURA CREADA - Gestión de Reservas
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── types/
│
├── pagos/                  # 🔲 ESTRUCTURA CREADA - Gestión de Pagos
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── types/
│
├── verificaciones/         # Control de Acceso QR (existente)
│   └── ...
│
├── layout/                 # Layout del panel
├── routing/                # Rutas del panel
├── lib/                    # Utilidades compartidas
└── types/                  # Tipos globales
```

## ✅ Módulo de Sedes - COMPLETADO

### Características Implementadas
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Listado con grid de tarjetas
- ✅ Filtros avanzados (búsqueda, ciudad, estado, verificación)
- ✅ Paginación completa
- ✅ Vista de detalle con estadísticas
- ✅ Formularios de creación y edición
- ✅ Integración con API del backend
- ✅ Hooks personalizados para lógica reutilizable
- ✅ Componentes reutilizables y modulares
- ✅ Tipos TypeScript completos
- ✅ Documentación completa

### Rutas
```
/admin/sedes                # Listado
/admin/sedes/nueva          # Crear
/admin/sedes/:id            # Detalle
/admin/sedes/:id/editar     # Editar
```

### Endpoints Utilizados
```
GET    /sede              # Listar con filtros
GET    /sede/:id          # Obtener detalle
POST   /sede              # Crear nueva
PUT    /sede/:id          # Editar
DELETE /sede/:id          # Eliminar
PUT    /sede/:id/verificar    # Verificar
PUT    /sede/:id/activar      # Activar
PUT    /sede/:id/desactivar   # Desactivar
```

## 🔲 Módulos Pendientes

### Canchas
**Prioridad**: Alta  
**Estructura**: ✅ Creada  
**Implementación**: Pendiente

**Funcionalidades a implementar**:
- [ ] Listado de canchas con filtros
- [ ] Detalle de cancha
- [ ] Crear/editar cancha
- [ ] Asociar a sede
- [ ] Gestión de disciplinas
- [ ] Gestión de precios/horarios
- [ ] Activar/desactivar cancha

**Endpoints necesarios**:
```
GET    /cancha
GET    /cancha/:id
POST   /cancha
PUT    /cancha/:id
DELETE /cancha/:id
GET    /sede/:id/canchas
```

### Reservas
**Prioridad**: Alta  
**Estructura**: ✅ Creada  
**Implementación**: Pendiente

**Funcionalidades a implementar**:
- [ ] Listado de reservas
- [ ] Filtros por estado, fecha, sede, cancha
- [ ] Detalle de reserva
- [ ] Cambiar estado de reserva
- [ ] Cancelar reserva
- [ ] Estadísticas de reservas
- [ ] Calendario de reservas

**Endpoints necesarios**:
```
GET    /reservas
GET    /reservas/:id
PUT    /reservas/:id/estado
DELETE /reservas/:id
GET    /reservas/calendario
GET    /reservas/estadisticas
```

### Pagos
**Prioridad**: Media  
**Estructura**: ✅ Creada  
**Implementación**: Pendiente

**Funcionalidades a implementar**:
- [ ] Listado de transacciones
- [ ] Filtros por estado, método, fecha
- [ ] Detalle de transacción
- [ ] Gestión de reembolsos
- [ ] Reportes financieros
- [ ] Gráficos de ingresos
- [ ] Exportar reportes

**Endpoints necesarios**:
```
GET    /transacciones
GET    /transacciones/:id
POST   /transacciones/:id/reembolso
GET    /transacciones/reportes
GET    /transacciones/estadisticas
```

## 🎯 Patrón de Implementación

Cada módulo debe seguir la misma estructura de **Sedes**:

### 1. Types (`types/index.ts`)
```typescript
// Definir interfaces, tipos y enums
export interface Entidad { ... }
export interface EntidadDetalle extends Entidad { ... }
export interface FiltrosEntidad { ... }
export type EstadoEntidad = '...' | '...';
```

### 2. Service (`services/entidad.service.ts`)
```typescript
export const entidadService = {
  getAll: (filtros) => { ... },
  getById: (id) => { ... },
  crear: (data) => { ... },
  editar: (id, data) => { ... },
  eliminar: (id) => { ... },
};
```

### 3. Hooks (`hooks/`)
```typescript
// useEntidades.ts
export const useEntidades = () => {
  // Lógica de listado, filtros, paginación
};

// useEntidadDetalle.ts
export const useEntidadDetalle = (id) => {
  // Lógica de detalle
};
```

### 4. Components (`components/`)
```typescript
// EntidadCard.tsx - Tarjeta para listado
// EntidadFiltros.tsx - Componente de filtros
// Otros componentes reutilizables específicos
```

### 5. Pages (`pages/`)
```typescript
// EntidadesListPage.tsx - Página de listado
// EntidadDetallePage.tsx - Página de detalle
// EntidadFormPage.tsx - Formulario crear/editar
```

## 📝 Checklist de Implementación

Para cada nuevo módulo:

- [ ] Crear estructura de carpetas
- [ ] Definir tipos TypeScript
- [ ] Implementar servicio de API
- [ ] Crear hooks personalizados
- [ ] Desarrollar componentes reutilizables
- [ ] Implementar página de listado
- [ ] Implementar página de detalle
- [ ] Implementar formulario de creación
- [ ] Implementar formulario de edición
- [ ] Agregar validaciones
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Confirmaciones de acciones críticas
- [ ] Documentar en README.md
- [ ] Integrar rutas en el panel

## 🔗 Conexiones Entre Módulos

```
Sedes → Canchas        # Una sede tiene muchas canchas
Canchas → Reservas     # Una cancha tiene muchas reservas
Reservas → Pagos       # Una reserva tiene un pago
Usuarios → Sedes       # Un dueño administra sedes
Usuarios → Reservas    # Un cliente hace reservas
```

## 🚀 Próximos Pasos

1. **Implementar módulo de Canchas** (siguiente prioridad)
2. Implementar módulo de Reservas
3. Implementar módulo de Pagos
4. Mejorar integración entre módulos
5. Agregar dashboard con métricas en tiempo real
6. Implementar sistema de notificaciones
7. Agregar exportación de datos
8. Implementar búsqueda global

## 📊 Convenciones de Código

### Nombres de archivos
- Componentes: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Servicios: `camelCase.service.ts`
- Tipos: `index.ts` (dentro de carpeta types)

### Estructura de componentes
```typescript
// 1. Imports
import { ... } from 'react';
import { ... } from 'lucide-react';
import { ... } from '../hooks';

// 2. Types/Interfaces
interface Props { ... }

// 3. Component
const Component = (props: Props) => {
  // Estados
  // Hooks
  // Funciones
  // Render
};

// 4. Export
export default Component;
```

### Manejo de errores
```typescript
try {
  await service.action();
} catch (err: any) {
  console.error('Error:', err);
  setError(err.message || 'Error genérico');
}
```

## 📚 Recursos

- **Componentes UI**: Lucide React (iconos)
- **Routing**: React Router v6
- **HTTP Client**: Axios (via adminApiClient)
- **Validación**: Validación manual en formularios
- **Estado**: React Hooks (useState, useEffect, custom hooks)

---

**Última actualización**: Noviembre 2025  
**Estado**: Módulo de Sedes completado - Base para otros módulos establecida
