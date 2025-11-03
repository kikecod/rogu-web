# 📊 Módulo de Analytics y Reportes

## Descripción

Este módulo proporciona funcionalidades completas de análisis y reportes para la administración de sedes y canchas deportivas. Incluye dashboards interactivos, gráficos, métricas clave (KPIs), y exportación de reportes.

## 🎯 Características Principales

### 1. **Dashboard Principal**
- **KPIs principales**: Ingresos, reservas, ocupación y rating
- **Gráficos de tendencia**: Ingresos mensuales, reservas por día
- **Distribución**: Reservas por estado, horarios populares
- **Comparativas**: Variación porcentual vs mes anterior

### 2. **Análisis por Cancha**
- Estadísticas detalladas de cada cancha
- Métricas de ocupación, ingresos y calificaciones
- Filtros por mes y periodo
- Exportación de reportes individuales

### 3. **Gestión de Reseñas**
- Rating promedio con distribución por estrellas
- Lista de últimas reseñas recibidas
- Visualización por cancha y sede
- Métricas de satisfacción del cliente

### 4. **Exportación de Reportes**
- Descargar reportes en formato CSV
- Reportes del dashboard completo
- Reportes de ingresos mensuales
- Reportes por cancha individual
- Reportes consolidados

## 📁 Estructura de Archivos

```
analytics/
├── index.ts                          # Exportaciones principales
├── components/
│   ├── KPICard.tsx                  # Tarjeta de KPI con tendencia
│   ├── SimpleBarChart.tsx           # Gráfico de barras
│   ├── SimpleLineChart.tsx          # Gráfico de línea/área
│   ├── DonutChart.tsx               # Gráfico de dona
│   └── AnalyticsFiltros.tsx         # Componente de filtros
├── pages/
│   ├── AnalyticsDashboardPage.tsx   # Dashboard principal
│   ├── CanchaAnalyticsPage.tsx      # Análisis por cancha
│   └── ResenasPage.tsx              # Vista de reseñas
├── services/
│   └── analyticsService.ts          # Servicios API
└── types/
    └── analytics.types.ts           # Tipos TypeScript
```

## 🚀 Uso

### Integración en la Aplicación

El módulo se integra en la página de administración de espacios (`AdminSpacesPage`):

```tsx
import { AnalyticsDashboardPage } from '@/analytics';

<AnalyticsDashboardPage 
  idPersonaD={user.idPersona}
  idSede={selectedSede?.idSede}
/>
```

### Dashboard Principal

```tsx
import { AnalyticsDashboardPage } from '@/analytics';

function MyComponent() {
  return (
    <AnalyticsDashboardPage 
      idPersonaD={userId}      // ID del dueño (opcional)
      idSede={sedeId}          // ID de la sede (opcional)
    />
  );
}
```

### Análisis de Cancha

```tsx
import { CanchaAnalyticsPage } from '@/analytics';

function MyCanchaComponent() {
  return (
    <CanchaAnalyticsPage 
      idCancha={canchaId}          // ID de la cancha (requerido)
      onBack={() => navigate(-1)}  // Función para volver
    />
  );
}
```

### Vista de Reseñas

```tsx
import { ResenasPage } from '@/analytics';

function MyResenasComponent() {
  return (
    <ResenasPage 
      idPersonaD={userId}     // Filtrar por dueño
      idSede={sedeId}        // Filtrar por sede
      idCancha={canchaId}    // Filtrar por cancha
    />
  );
}
```

## 🎨 Componentes Reutilizables

### KPICard

Tarjeta para mostrar métricas clave con tendencias:

```tsx
import { KPICard } from '@/analytics';
import { DollarSign } from 'lucide-react';

<KPICard
  title="Ingresos del Mes"
  value="Bs 15,420"
  change={12.5}                    // Variación en %
  trend="up"                       // 'up' | 'down' | 'neutral'
  icon={<DollarSign />}
  valueColor="text-green-600"
  loading={false}
/>
```

### SimpleBarChart

Gráfico de barras horizontal:

```tsx
import { SimpleBarChart } from '@/analytics';

const data = [
  { label: '18:00', value: 24, color: '#3B82F6' },
  { label: '19:00', value: 22, color: '#3B82F6' },
  { label: '20:00', value: 18, color: '#3B82F6' }
];

<SimpleBarChart
  data={data}
  title="Horarios Más Populares"
  height={300}
  showValues={true}
  loading={false}
/>
```

### SimpleLineChart

Gráfico de línea con área:

```tsx
import { SimpleLineChart } from '@/analytics';

const data = [
  { label: 'Ene', value: 12300 },
  { label: 'Feb', value: 13750 },
  { label: 'Mar', value: 15420 }
];

<SimpleLineChart
  data={data}
  title="Ingresos Mensuales"
  height={300}
  color="#10B981"
  showGrid={true}
  loading={false}
/>
```

### DonutChart

Gráfico de dona para distribuciones:

```tsx
import { DonutChart } from '@/analytics';

const data = [
  { label: 'Confirmada', value: 74, color: '#10B981' },
  { label: 'Pendiente', value: 3, color: '#F59E0B' },
  { label: 'Cancelada', value: 10, color: '#EF4444' }
];

<DonutChart
  data={data}
  title="Reservas por Estado"
  centerText="87"
  size={250}
  loading={false}
/>
```

## 🔌 API Backend

### Endpoints Utilizados

El módulo se conecta a estos endpoints del backend:

- **`GET /api/analytics/dashboard`** - Dashboard principal
- **`GET /api/analytics/cancha/:id`** - Estadísticas de cancha
- **`GET /api/analytics/ingresos`** - Ingresos mensuales
- **`GET /api/analytics/calendario`** - Calendario de disponibilidad
- **`GET /api/analytics/resenas`** - Resumen de reseñas
- **`GET /api/reportes/dashboard/csv`** - Exportar dashboard CSV
- **`GET /api/reportes/ingresos/csv`** - Exportar ingresos CSV
- **`GET /api/reportes/cancha/:id/csv`** - Exportar cancha CSV
- **`GET /api/reportes/consolidado/csv`** - Exportar consolidado CSV

### Parámetros de Filtro

Todos los endpoints aceptan los siguientes parámetros opcionales:

- `idPersonaD` - Filtrar por dueño
- `idSede` - Filtrar por sede
- `idCancha` - Filtrar por cancha específica
- `fechaInicio` - Fecha de inicio (YYYY-MM-DD)
- `fechaFin` - Fecha de fin (YYYY-MM-DD)
- `mes` - Mes específico (YYYY-MM)
- `limite` - Límite de registros (default: 12)

## 📊 Tipos de Datos

### DashboardData

```typescript
interface DashboardData {
  periodo: {
    mesActual: string;
    fechaConsulta: string;
  };
  metricas: {
    ingresosMes: { valor: number; variacion: number; tendencia: 'up' | 'down'; mesAnterior: number };
    totalReservas: { valor: number; variacion: number; tendencia: 'up' | 'down'; mesAnterior: number };
    tasaOcupacion: { valor: number; unidad: '%' };
    ratingPromedio: { valor: number; max: 5 };
  };
  graficos: {
    ingresosUltimos12Meses: IngresosMensuales[];
    reservasPorEstado: ReservasPorEstado[];
    reservasPorDia: ReservasPorDia[];
    horariosPopulares: HorarioPopular[];
  };
}
```

## 🎯 Flujo de Usuario

1. **Usuario accede a "Administración de Espacios"**
2. **Click en botón "Analytics"**
3. **Dashboard muestra métricas generales**
4. **Usuario puede:**
   - Ver gráficos interactivos
   - Filtrar por sede/cancha
   - Descargar reportes CSV
   - Ver detalles de canchas específicas
   - Revisar reseñas y calificaciones

## 🔧 Configuración

### Agregar al Vite Config

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@/analytics': '/src/modules/analytics',
    // ... otros alias
  }
}
```

### Variables de Entorno

```env
VITE_API_URL=http://localhost:3000/api
```

## 🚨 Manejo de Errores

Todos los servicios incluyen manejo de errores:

```typescript
try {
  const data = await getDashboard({ idPersonaD });
  setDashboardData(data);
} catch (err) {
  setError('Error al cargar los datos del dashboard');
  console.error('Error loading dashboard:', err);
}
```

## 📱 Responsive Design

- **Desktop**: Diseño en grid de 4 columnas para KPIs
- **Tablet**: Grid de 2 columnas
- **Mobile**: Stack vertical de 1 columna

## 🎨 Personalización de Colores

```typescript
// Paleta de colores por defecto
const colors = {
  ingresos: '#10B981',      // Verde
  reservas: '#3B82F6',      // Azul
  cancelaciones: '#EF4444', // Rojo
  ocupacion: '#F59E0B',     // Naranja
  rating: '#FBBF24'         // Amarillo
};
```

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren token Bearer
2. **Permisos**: Solo usuarios con rol DUENIO o ADMIN pueden acceder
3. **Cache**: Los datos se cargan al montar el componente y cuando cambian los filtros
4. **Exportación**: Los reportes CSV incluyen BOM UTF-8 para compatibilidad con Excel

## 🔄 Actualización de Datos

Los datos se actualizan automáticamente cuando:
- Cambia el ID del dueño
- Cambia la sede seleccionada
- Cambia la cancha seleccionada
- El componente se monta por primera vez

## 📞 Soporte

Para problemas o preguntas sobre este módulo, contacta al equipo de desarrollo.

---

**Última actualización**: 1 de noviembre de 2025
**Versión**: 1.0.0
**Autor**: Equipo ROGU
