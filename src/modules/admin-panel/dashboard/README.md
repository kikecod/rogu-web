# 📊 Dashboard del Panel de Administración

## Descripción General

Este dashboard es la pantalla principal del panel de administración del sistema deportivo. Proporciona una vista centralizada para gestionar todas las entidades del sistema y monitorear métricas clave en tiempo real.

---

## 🎯 Características Principales

### 1. **Cards de Gestión de Entidades**
Grid de cards que permiten navegar rápidamente a las diferentes secciones de administración:

- **Gestión de Canchas** - Administrar canchas deportivas (53 activas)
- **Gestión de Espacios** - Administrar espacios/sedes deportivas (10 disponibles)
- **Gestión de Disciplinas** - Administrar disciplinas deportivas (8 deportes)
- **Gestión de Personas** - Administrar clientes y usuarios (82 registrados)
- **Gestión de Reservas** - Administrar reservas del sistema (20 reservas)
- **Gestión de Pagos** - Administrar pagos y transacciones
- **Control de Acceso** - Gestionar acceso QR y asistencias (10 QRs)

### 2. **Cards de Métricas del Sistema**
Grid de métricas en tiempo real que muestran el estado actual del sistema:

- **Reservas Hoy** - Total de reservas del día actual (156)
- **Ingresos Diarios** - Ingresos generados hoy ($3,200)
- **Ocupación** - Porcentaje de ocupación de canchas (92%)
- **Nuevos Usuarios** - Usuarios registrados hoy (45)
- **Reservas Pendientes** - Reservas por confirmar (23)
- **Pagos Fallidos** - Pagos fallidos en últimas 24h (7)
- **Canchas Ocupadas** - Canchas ocupadas en este momento (48)
- **Próximas Reservas** - Reservas en la siguiente hora (12)

---

## 📁 Estructura de Archivos

```
admin-panel/dashboard/
├── components/
│   ├── EntityCard.tsx          # Card de gestión de entidad
│   ├── MetricCard.tsx          # Card de métrica numérica
│   └── index.ts                # Exports de componentes
├── pages/
│   ├── NewDashboardPage.tsx    # Página principal del dashboard
│   └── DashboardPage.tsx       # Dashboard anterior (legacy)
├── services/
│   └── dashboardData.service.ts # Servicio para obtener datos del backend
└── hooks/
    └── useDashboard.ts         # Hook para dashboard legacy
```

---

## 🔧 Componentes Principales

### `NewDashboardPage.tsx`
Componente principal que renderiza el dashboard completo.

**Props:** Ninguno

**Estado:**
- `entityCards`: Array de datos para cards de entidades
- `metricsCards`: Array de datos para cards de métricas
- `loading`: Estado de carga

**Funcionalidades:**
- Carga datos dinámicos desde el backend
- Maneja estados de carga y error
- Layout responsive con AdminLayout

---

### `EntityCard.tsx`
Componente reutilizable para cards de gestión de entidades.

**Props:**
```typescript
interface EntityCardProps {
  data: EntityCardData;
}

interface EntityCardData {
  id: string;              // Identificador único
  title: string;           // Título del card (ej: "Gestión de Canchas")
  description: string;     // Descripción breve
  badge: {
    text: string;          // Texto del badge (ej: "activas")
    value?: number;        // Valor numérico opcional
  };
  route: string;           // Ruta a la que navega
  icon: string;            // Emoji o ícono
  iconColor: string;       // Clase de color de fondo del ícono
}
```

**Características:**
- Diseño consistente con shadow y hover effects
- Badge con contador dinámico
- Botón "Gestionar →" con animación
- Navegación usando React Router

---

### `MetricCard.tsx`
Componente reutilizable para cards de métricas numéricas.

**Props:**
```typescript
interface MetricCardProps {
  data: MetricCardData;
}

interface MetricCardData {
  id: string;              // Identificador único
  label: string;           // Etiqueta de la métrica
  value: number | string;  // Valor a mostrar
  helperText?: string;     // Texto auxiliar
  period?: string;         // Periodo (ej: "hoy", "este mes")
  trend?: {                // Tendencia opcional
    value: number;         // Porcentaje de cambio
    direction: 'up' | 'down';
  };
  format?: 'number' | 'currency' | 'percentage';
}
```

**Características:**
- Formateo automático de valores (números, moneda, porcentaje)
- Indicadores de tendencia con iconos y colores
- Texto auxiliar y periodos
- Diseño compacto y legible

---

## 🔌 Servicios y Datos

### `dashboardData.service.ts`

Servicio que maneja la obtención de datos desde el backend.

**Métodos principales:**

#### `getEntityCardsData()`
Obtiene datos para los cards de gestión de entidades desde múltiples endpoints.

```typescript
const entityCards = await dashboardDataService.getEntityCardsData();
```

**Endpoints consultados:**
- `GET /admin/canchas/estadisticas`
- `GET /admin/sedes/estadisticas`
- `GET /admin/usuarios/estadisticas`
- `GET /admin/reservas/estadisticas`

**Retorna:** Array de `EntityCardData`

---

#### `getMetricsCardsData()`
Obtiene datos para los cards de métricas desde el endpoint de dashboard.

```typescript
const metricsCards = await dashboardDataService.getMetricsCardsData();
```

**Endpoints consultados:**
- `GET /admin/dashboard/metricas`

**Retorna:** Array de `MetricCardData`

---

#### `getAllDashboardData()`
Obtiene todos los datos del dashboard en paralelo.

```typescript
const { entityCards, metricsCards } = await dashboardDataService.getAllDashboardData();
```

**Retorna:** Objeto con `entityCards` y `metricsCards`

---

## 🎨 Diseño y Estilos

### Sistema de Colores para Entity Cards

```css
bg-green-100   /* Canchas */
bg-blue-100    /* Espacios */
bg-purple-100  /* Disciplinas */
bg-yellow-100  /* Personas */
bg-pink-100    /* Reservas */
bg-emerald-100 /* Pagos */
bg-indigo-100  /* Control de Acceso */
```

### Layout Responsive

```css
/* Entity Cards Grid */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
gap-6

/* Metrics Cards Grid */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
gap-4
```

---

## 📊 Integración con Backend

### Formato de Respuesta Esperado

#### `/admin/dashboard/metricas`
```json
{
  "reservasHoy": 156,
  "ingresosDiarios": 3200,
  "ocupacion": 92,
  "nuevosUsuarios": 45,
  "reservasPendientes": 23,
  "pagosFallidos": 7,
  "canchasOcupadas": 48,
  "proximasReservas": 12
}
```

#### `/admin/canchas/estadisticas`
```json
{
  "total": 53,
  "activas": 53,
  "inactivas": 0
}
```

#### `/admin/sedes/estadisticas`
```json
{
  "total": 10,
  "disponibles": 10,
  "verificadas": 8
}
```

#### `/admin/usuarios/estadisticas`
```json
{
  "total": 82,
  "activos": 75,
  "nuevosHoy": 5
}
```

#### `/admin/reservas/estadisticas`
```json
{
  "pendientes": 20,
  "confirmadas": 136,
  "totalHoy": 156
}
```

---

## 🚀 Uso e Implementación

### Importar el Dashboard

```tsx
import NewDashboardPage from '@/admin-panel/dashboard/pages/NewDashboardPage';
```

### Configurar en Rutas

```tsx
import { ROUTES } from '@/config/routes';

<Route path={ROUTES.admin.dashboard} element={<NewDashboardPage />} />
```

### Personalizar Cards de Entidades

Editar `lib/dashboardConfig.ts` (para datos estáticos) o modificar el servicio `dashboardData.service.ts` (para datos dinámicos):

```typescript
// Agregar nuevo card de entidad
{
  id: 'nueva-entidad',
  title: 'Gestión de Nueva Entidad',
  description: 'Descripción de la entidad',
  badge: {
    text: 'items',
    value: 100,
  },
  route: '/admin/nueva-entidad',
  icon: '🎯',
  iconColor: 'bg-orange-100',
}
```

### Personalizar Cards de Métricas

```typescript
// Agregar nueva métrica
{
  id: 'nueva-metrica',
  label: 'Nueva Métrica',
  value: 500,
  period: 'esta semana',
  format: 'number',
  helperText: 'Descripción',
  trend: {
    value: 10,
    direction: 'up',
  },
}
```

---

## 🔄 Actualización de Datos

Los datos del dashboard se cargan automáticamente al montar el componente. Para forzar una recarga:

```typescript
const loadDashboardData = async () => {
  const data = await dashboardDataService.getAllDashboardData();
  setEntityCards(data.entityCards);
  setMetricsCards(data.metricsCards);
};

// Llamar cuando sea necesario
loadDashboardData();
```

---

## ⚙️ Configuración

### Variables de Entorno
No requiere variables de entorno específicas.

### Path Aliases
Asegurarse de que `tsconfig.app.json` tenga configurado:

```json
{
  "compilerOptions": {
    "paths": {
      "@/admin-panel/*": ["./src/modules/admin-panel/*"],
      "@/config/*": ["./src/config/*"]
    }
  }
}
```

---

## 🐛 Manejo de Errores

El servicio maneja errores de red automáticamente:

1. **Error en endpoint específico:** Retorna datos por defecto
2. **Error en múltiples endpoints:** Retorna arrays vacíos
3. **Error de autenticación:** Debe manejarse en el interceptor de axios

```typescript
try {
  const data = await dashboardDataService.getAllDashboardData();
} catch (error) {
  console.error('Error al cargar dashboard:', error);
  // Mostrar mensaje de error al usuario
}
```

---

## 📱 Responsividad

### Breakpoints

| Breakpoint | Grid Entities | Grid Metrics |
|------------|---------------|--------------|
| Mobile     | 1 columna     | 1 columna    |
| Tablet     | 2 columnas    | 2 columnas   |
| Desktop    | 3 columnas    | 4 columnas   |
| XL         | 4 columnas    | 4 columnas   |

---

## ✅ Testing

### Verificar Funcionalidad

1. Navegar a `/admin/dashboard`
2. Verificar que se muestran los 7 entity cards
3. Verificar que se muestran los 8 metric cards
4. Hacer clic en "Gestionar →" de cada card
5. Verificar que las rutas funcionan correctamente

### Verificar Integración con Backend

1. Abrir DevTools → Network
2. Recargar dashboard
3. Verificar llamadas a:
   - `/admin/dashboard/metricas`
   - `/admin/canchas/estadisticas`
   - `/admin/sedes/estadisticas`
   - `/admin/usuarios/estadisticas`
   - `/admin/reservas/estadisticas`

---

## 🔮 Próximas Mejoras

- [ ] Agregar refresh automático cada N segundos
- [ ] Agregar gráficos de tendencias
- [ ] Agregar filtros de periodo (hoy, semana, mes)
- [ ] Agregar animaciones de carga skeleton
- [ ] Agregar acciones rápidas en entity cards
- [ ] Agregar tooltips con más información
- [ ] Agregar modo oscuro
- [ ] Agregar export de métricas a PDF/Excel

---

## 📚 Referencias

- [Arquitectura del proyecto](../../ARCHITECTURE.md)
- [Guía de implementación](../../docs3/GUIA_IMPLEMENTACION_PANEL_ADMIN.md)
- [Sistema de rutas](../../src/config/routes.ts)
- [Componentes admin](../layout/README.md)

---

**Última actualización:** 13 de noviembre de 2025
