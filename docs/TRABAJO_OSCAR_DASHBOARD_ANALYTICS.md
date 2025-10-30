# 📊 TRABAJO PERSONA 4: DASHBOARD Y PANEL DE ANÁLISIS PARA DUEÑOS

**Responsable:** Persona 4  
**Duración estimada:** 2-3 semanas  
**Prioridad:** 🔴 ALTA  

> **NOTA IMPORTANTE:** Este documento forma parte de un sistema de 4 personas:
> - **Persona 1:** Sistema de Pagos Real
> - **Persona 2:** Sistema de Reseñas y Calificaciones
> - **Persona 3:** Perfil y Configuración de Usuario (con gestión de foto de perfil)
> - **Persona 4:** Dashboard y Panel de Análisis para Dueños (este documento)

---

## 📋 RESUMEN

Crear un **dashboard completo para dueños de espacios deportivos** que les permita:
- **Visualizar estadísticas y métricas** de sus canchas (reservas, ingresos, ocupación)
- **Analizar tendencias** (gráficos, reportes, comparativas)
- **Gestionar reservas** desde un panel centralizado
- **Exportar reportes** en PDF/Excel
- **Monitorear reseñas y calificaciones**
- **Ver proyecciones de ingresos**

Este panel debe ser **intuitivo, visual y completo**, proporcionando toda la información necesaria para la toma de decisiones del negocio.

---

## 🎯 OBJETIVOS PRINCIPALES

### 1. **Dashboard Principal (Overview)**
   - Tarjetas de KPIs (Ingresos del mes, reservas totales, ocupación, rating promedio)
   - Gráficos de tendencias (ingresos por mes, reservas por día)
   - Reservas recientes
   - Canchas más reservadas

### 2. **Análisis de Reservas**
   - Calendario con vista de ocupación
   - Estadísticas por cancha
   - Horarios más solicitados
   - Tasa de cancelación
   - Reservas pendientes/confirmadas/canceladas

### 3. **Análisis de Ingresos**
   - Ingresos totales (mensual, semanal, anual)
   - Gráfico de tendencia de ingresos
   - Ingresos por cancha
   - Comparativa mes a mes
   - Proyecciones

### 4. **Gestión de Canchas**
   - Lista de todas las canchas del dueño
   - Estadísticas por cancha
   - Editar disponibilidad
   - Ver reseñas por cancha

### 5. **Reportes y Exportación**
   - Generar reporte PDF
   - Exportar a Excel
   - Filtros por fecha, cancha, tipo
   - Reporte detallado de transacciones

### 6. **Notificaciones y Alertas**
   - Nueva reserva
   - Cancelación
   - Nueva reseña
   - Bajo rendimiento de cancha

---

## 📐 ARQUITECTURA DEL SISTEMA

### Flujo General

```
┌────────────────────────────────────────────────────────┐
│              FRONTEND (React + Charts)                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  DASHBOARD PRINCIPAL                                   │
│  ┌──────────────────────────────────────────────┐     │
│  │  [KPI Cards]  [KPI Cards]  [KPI Cards]      │     │
│  ├──────────────────────────────────────────────┤     │
│  │  [Gráfico de Ingresos - Área Chart]          │     │
│  ├──────────────────────────────────────────────┤     │
│  │  [Tabla de Últimas Reservas]                 │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  NAVEGACIÓN LATERAL:                                   │
│  - 📊 Dashboard                                        │
│  - 📅 Reservas                                         │
│  - 💰 Ingresos                                         │
│  - 🏟️ Mis Canchas                                      │
│  - ⭐ Reseñas                                          │
│  - 📈 Reportes                                         │
│  - ⚙️ Configuración                                    │
│                                                        │
└────────────────────────────────────────────────────────┘
                         ↓ ↑
              HTTP GET /api/analytics/*
                         ↓ ↑
┌────────────────────────────────────────────────────────┐
│           BACKEND (Node.js + Analytics Service)         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ANALYTICS SERVICE                                     │
│  - Calcular KPIs                                       │
│  - Agregar datos por fecha                             │
│  - Generar gráficos (datos)                            │
│  - Calcular tendencias                                 │
│  - Proyecciones                                        │
│                                                        │
│  REPORT SERVICE                                        │
│  - Generar PDF (con puppeteer)                         │
│  - Generar Excel (con xlsx)                            │
│  - Plantillas de reportes                              │
│                                                        │
└────────────────────────────────────────────────────────┘
                         ↓ ↑
┌────────────────────────────────────────────────────────┐
│                 BASE DE DATOS (MySQL)                   │
├────────────────────────────────────────────────────────┤
│  QUERIES AGREGADAS:                                    │
│  - SUM(monto) GROUP BY mes, cancha                     │
│  - COUNT(reservas) GROUP BY estado, fecha              │
│  - AVG(calificacion) GROUP BY cancha                   │
│  - JOIN con múltiples tablas                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ BACKEND - ESTRUCTURA Y ENDPOINTS

### 1. BASE DE DATOS - Vistas y Queries Optimizadas

No se necesitan nuevas tablas, pero sí queries complejas y optimizadas.

#### Vista agregada de estadísticas por cancha (opcional)
```sql
CREATE VIEW VistaEstadisticasCancha AS
SELECT 
  c.idCancha,
  c.nombre AS canchaName,
  c.idUsuario AS idDueno,
  COUNT(DISTINCT r.idReserva) AS totalReservas,
  COUNT(DISTINCT CASE WHEN r.estado = 'Confirmada' THEN r.idReserva END) AS reservasConfirmadas,
  COUNT(DISTINCT CASE WHEN r.estado = 'Cancelada' THEN r.idReserva END) AS reservasCanceladas,
  COALESCE(SUM(CASE WHEN t.estado = 'APROBADA' THEN t.monto ELSE 0 END), 0) AS ingresoTotal,
  COALESCE(AVG(res.calificacion), 0) AS ratingPromedio,
  COUNT(DISTINCT res.idResena) AS totalResenas
FROM Cancha c
LEFT JOIN Reserva r ON c.idCancha = r.idCancha
LEFT JOIN Transaccion t ON r.idReserva = t.idReserva
LEFT JOIN Resena res ON c.idCancha = res.idCancha
GROUP BY c.idCancha, c.nombre, c.idUsuario;
```

---

### 2. ENDPOINTS DE ANALYTICS

#### 2.1 Dashboard Principal - KPIs
```
GET /api/analytics/dashboard
Authorization: Bearer <token>
Query Params:
  - fechaInicio (opcional): YYYY-MM-DD
  - fechaFin (opcional): YYYY-MM-DD

Response:
{
  "data": {
    "periodo": {
      "inicio": "2024-10-01",
      "fin": "2024-10-31"
    },
    "kpis": {
      "ingresoTotal": 15420.50,
      "ingresoCambio": "+12.5%",          // vs mes anterior
      "totalReservas": 87,
      "reservasCambio": "+8.2%",
      "tasaOcupacion": 68.3,              // % de slots ocupados
      "ocupacionCambio": "+5.1%",
      "ratingPromedio": 4.6,
      "ratingCambio": "+0.2",
      "totalCanchas": 5,
      "canchasActivas": 5
    },
    "ingresosPorMes": [
      { "mes": "2024-08", "ingresos": 12300, "reservas": 65 },
      { "mes": "2024-09", "ingresos": 13750, "reservas": 74 },
      { "mes": "2024-10", "ingresos": 15420, "reservas": 87 }
    ],
    "reservasPorDia": [
      { "fecha": "2024-10-01", "confirmadas": 8, "canceladas": 1 },
      { "fecha": "2024-10-02", "confirmadas": 12, "canceladas": 0 },
      // ... últimos 30 días
    ],
    "canchasMasReservadas": [
      {
        "idCancha": 3,
        "nombre": "Cancha Fútbol A",
        "reservas": 32,
        "ingresos": 6400,
        "rating": 4.8
      },
      {
        "idCancha": 1,
        "nombre": "Cancha Básquet Central",
        "reservas": 28,
        "ingresos": 4760,
        "rating": 4.5
      }
      // Top 5
    ],
    "ultimasReservas": [
      {
        "idReserva": 145,
        "cliente": "Juan Pérez",
        "cancha": "Cancha Fútbol A",
        "fecha": "2024-10-30",
        "hora": "18:00",
        "estado": "Confirmada",
        "monto": 200
      }
      // Últimas 10
    ]
  }
}
```

**Lógica de cálculo:**
- **Ingresos:** SUM de transacciones APROBADAS en el periodo
- **Cambio %:** Comparar con periodo anterior (mismo rango de días)
- **Tasa de ocupación:** (Reservas confirmadas / Slots totales disponibles) * 100
- **Rating promedio:** AVG de calificaciones de todas las canchas del dueño

---

#### 2.2 Análisis Detallado de Reservas
```
GET /api/analytics/reservas
Authorization: Bearer <token>
Query Params:
  - fechaInicio: YYYY-MM-DD
  - fechaFin: YYYY-MM-DD
  - idCancha (opcional): filtrar por cancha específica

Response:
{
  "data": {
    "resumen": {
      "totalReservas": 87,
      "confirmadas": 74,
      "canceladas": 10,
      "pendientes": 3,
      "tasaCancelacion": 11.5,           // %
      "ingresoPorReserva": 177.24        // promedio
    },
    "porEstado": [
      { "estado": "Confirmada", "cantidad": 74, "porcentaje": 85.1 },
      { "estado": "Cancelada", "cantidad": 10, "porcentaje": 11.5 },
      { "estado": "Pendiente", "cantidad": 3, "porcentaje": 3.4 }
    ],
    "porCancha": [
      {
        "idCancha": 3,
        "nombre": "Cancha Fútbol A",
        "reservas": 32,
        "confirmadas": 30,
        "canceladas": 2,
        "tasaOcupacion": 72.3
      }
      // Todas las canchas del dueño
    ],
    "horariosMasReservados": [
      { "hora": "18:00-19:00", "reservas": 24, "porcentaje": 27.6 },
      { "hora": "19:00-20:00", "reservas": 22, "porcentaje": 25.3 },
      { "hora": "20:00-21:00", "reservas": 18, "porcentaje": 20.7 }
      // Top 10 horarios
    ],
    "diasMasReservados": [
      { "dia": "Sábado", "reservas": 28, "porcentaje": 32.2 },
      { "dia": "Domingo", "reservas": 24, "porcentaje": 27.6 },
      { "dia": "Viernes", "reservas": 16, "porcentaje": 18.4 }
      // Todos los días
    ]
  }
}
```

---

#### 2.3 Análisis de Ingresos
```
GET /api/analytics/ingresos
Authorization: Bearer <token>
Query Params:
  - periodo: 'mes' | 'trimestre' | 'año' | 'personalizado'
  - fechaInicio (si personalizado)
  - fechaFin (si personalizado)

Response:
{
  "data": {
    "resumen": {
      "ingresoTotal": 15420.50,
      "ingresoPromedioDiario": 497.44,
      "ingresoProyectado": 17500,        // proyección fin de mes
      "crecimiento": "+12.5%"             // vs periodo anterior
    },
    "ingresosPorMes": [
      {
        "mes": "2024-10",
        "ingresos": 15420.50,
        "reservas": 87,
        "ingresoPorReserva": 177.24
      },
      {
        "mes": "2024-09",
        "ingresos": 13750,
        "reservas": 74,
        "ingresoPorReserva": 185.81
      }
      // Últimos 12 meses
    ],
    "ingresosPorCancha": [
      {
        "idCancha": 3,
        "nombre": "Cancha Fútbol A",
        "ingresos": 6400,
        "porcentaje": 41.5,
        "reservas": 32,
        "precioPromedio": 200
      }
      // Todas las canchas
    ],
    "ingresosPorDia": [
      { "fecha": "2024-10-29", "ingresos": 800, "reservas": 4 },
      { "fecha": "2024-10-30", "ingresos": 1200, "reservas": 6 }
      // Últimos 30 días
    ],
    "comparativaMensual": {
      "mesActual": 15420.50,
      "mesAnterior": 13750,
      "diferencia": 1670.50,
      "porcentajeCambio": 12.15
    }
  }
}
```

---

#### 2.4 Estadísticas por Cancha Individual
```
GET /api/analytics/cancha/:idCancha
Authorization: Bearer <token>
Query Params:
  - fechaInicio
  - fechaFin

Response:
{
  "data": {
    "cancha": {
      "idCancha": 3,
      "nombre": "Cancha Fútbol A",
      "deporte": "Fútbol",
      "precioBase": 200,
      "activa": true
    },
    "estadisticas": {
      "totalReservas": 32,
      "confirmadas": 30,
      "canceladas": 2,
      "tasaCancelacion": 6.25,
      "ingresoTotal": 6400,
      "ingresoPromedio": 200,
      "tasaOcupacion": 72.3,
      "horasReservadas": 96,
      "horasDisponibles": 133
    },
    "calificaciones": {
      "ratingPromedio": 4.8,
      "totalResenas": 18,
      "distribucion": {
        "5": 12,
        "4": 5,
        "3": 1,
        "2": 0,
        "1": 0
      }
    },
    "tendencia": [
      { "fecha": "2024-10-01", "reservas": 3, "ingresos": 600 },
      { "fecha": "2024-10-02", "reservas": 4, "ingresos": 800 }
      // Diario del periodo
    ],
    "horariosPopulares": [
      { "hora": "18:00-19:00", "reservas": 8 },
      { "hora": "19:00-20:00", "reservas": 7 }
    ]
  }
}
```

---

#### 2.5 Calendario de Ocupación
```
GET /api/analytics/calendario
Authorization: Bearer <token>
Query Params:
  - mes: 'YYYY-MM'
  - idCancha (opcional)

Response:
{
  "data": {
    "mes": "2024-10",
    "canchas": [
      {
        "idCancha": 3,
        "nombre": "Cancha Fútbol A",
        "dias": [
          {
            "fecha": "2024-10-01",
            "diaSemana": "Martes",
            "slots": [
              {
                "hora": "08:00-09:00",
                "estado": "LIBRE",
                "idReserva": null
              },
              {
                "hora": "09:00-10:00",
                "estado": "RESERVADO",
                "idReserva": 123,
                "cliente": "Juan Pérez",
                "monto": 200
              },
              {
                "hora": "10:00-11:00",
                "estado": "LIBRE",
                "idReserva": null
              }
              // Todos los horarios del día
            ],
            "reservas": 4,
            "tasaOcupacion": 26.7
          }
          // Todos los días del mes
        ]
      }
      // Todas las canchas (o filtrada)
    ]
  }
}
```

---

#### 2.6 Generar Reporte PDF
```
POST /api/analytics/reportes/pdf
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "tipo": "completo" | "ingresos" | "reservas" | "canchas",
  "fechaInicio": "2024-10-01",
  "fechaFin": "2024-10-31",
  "idCancha": null,                    // opcional
  "incluirGraficos": true
}

Response:
Content-Type: application/pdf
Headers:
  Content-Disposition: attachment; filename="reporte-2024-10.pdf"

Body: [PDF Binary]
```

**Contenido del PDF:**
- Logo y nombre del negocio
- Periodo del reporte
- Resumen ejecutivo (KPIs)
- Gráfico de ingresos
- Tabla de reservas por cancha
- Detalles de transacciones
- Footer con fecha de generación

---

#### 2.7 Exportar a Excel
```
POST /api/analytics/reportes/excel
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "tipo": "transacciones" | "reservas" | "completo",
  "fechaInicio": "2024-10-01",
  "fechaFin": "2024-10-31"
}

Response:
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Headers:
  Content-Disposition: attachment; filename="datos-2024-10.xlsx"

Body: [Excel Binary]
```

**Hojas del Excel:**
1. **Resumen:** KPIs y totales
2. **Reservas:** Detalle de todas las reservas
3. **Ingresos:** Transacciones y pagos
4. **Canchas:** Estadísticas por cancha

---

#### 2.8 Reseñas Recibidas
```
GET /api/analytics/resenas
Authorization: Bearer <token>
Query Params:
  - idCancha (opcional)
  - pagina: number
  - limite: number

Response:
{
  "data": {
    "resumen": {
      "totalResenas": 45,
      "ratingPromedio": 4.6,
      "distribucion": {
        "5": 28,
        "4": 12,
        "3": 3,
        "2": 1,
        "1": 1
      },
      "pendientesRespuesta": 5
    },
    "resenas": [
      {
        "idResena": 12,
        "cancha": "Cancha Fútbol A",
        "cliente": "Juan Pérez",
        "calificacion": 5,
        "comentario": "Excelente cancha!",
        "fecha": "2024-10-28",
        "respondida": false,
        "respuesta": null
      }
      // Lista paginada
    ],
    "paginacion": {
      "pagina": 1,
      "limite": 20,
      "total": 45,
      "totalPaginas": 3
    }
  }
}
```

---

### 3. SERVICIOS BACKEND

**AnalyticsService.ts** - Debe contener:

1. **getDashboardKPIs(idDueno, fechaInicio, fechaFin)**
   - Calcular todos los KPIs
   - Comparar con periodo anterior
   - Retornar datos agregados

2. **getReservasAnalytics(idDueno, fechaInicio, fechaFin, idCancha?)**
   - Estadísticas de reservas
   - Agregaciones por estado, cancha, horario

3. **getIngresosAnalytics(idDueno, periodo, fechaInicio?, fechaFin?)**
   - Calcular ingresos por diferentes periodos
   - Proyecciones
   - Comparativas

4. **getCanchaEstadisticas(idCancha, idDueno, fechaInicio, fechaFin)**
   - Estadísticas detalladas de una cancha
   - Verificar que la cancha pertenezca al dueño

5. **getCalendarioOcupacion(idDueno, mes, idCancha?)**
   - Generar calendario con slots
   - Marcar ocupados/libres

6. **calculateTasaOcupacion(idCancha, fechaInicio, fechaFin)**
   - Calcular % de ocupación

7. **getHorariosPopulares(idDueno, fechaInicio, fechaFin)**
   - Agregar reservas por hora

8. **compareWithPreviousPeriod(currentData, previousData)**
   - Calcular cambios porcentuales

---

**ReportService.ts** - Debe contener:

1. **generatePDFReport(idDueno, options)**
   - Obtener datos del AnalyticsService
   - Generar HTML con plantilla
   - Convertir a PDF con Puppeteer
   - Incluir gráficos (Chart.js a imagen)

2. **generateExcelReport(idDueno, options)**
   - Obtener datos
   - Crear workbook con xlsx
   - Múltiples hojas
   - Formato y estilos

---

### 4. DEPENDENCIAS NECESARIAS

```bash
# Backend
npm install puppeteer                # Para PDF
npm install xlsx                     # Para Excel
npm install date-fns                 # Manejo de fechas
```

---

## 🎨 FRONTEND - ESTRUCTURA Y COMPONENTES

### 1. MÓDULO DE ANALYTICS

**Estructura de carpetas:**
```
src/modules/analytics/
  pages/
    DashboardPage.tsx              # Dashboard principal
    ReservasAnalyticsPage.tsx      # Análisis de reservas
    IngresosAnalyticsPage.tsx      # Análisis de ingresos
    CanchasAnalyticsPage.tsx       # Vista por cancha
    ReseñasPage.tsx                # Gestión de reseñas
    ReportesPage.tsx               # Generar reportes
  components/
    KPICard.tsx                    # Tarjeta de KPI
    RevenueChart.tsx               # Gráfico de ingresos (área)
    BookingsChart.tsx              # Gráfico de reservas (barras)
    DonutChart.tsx                 # Gráfico circular
    CalendarHeatmap.tsx            # Calendario de ocupación
    RecentBookingsTable.tsx        # Tabla de reservas recientes
    TopCanchasTable.tsx            # Tabla de top canchas
    StatCard.tsx                   # Tarjeta de estadística
    DateRangePicker.tsx            # Selector de rango de fechas
    ExportButton.tsx               # Botón exportar (PDF/Excel)
  services/
    analyticsService.ts            # Llamadas a API
  types/
    analytics.types.ts             # Tipos TypeScript
  lib/
    chartConfig.ts                 # Configuración de gráficos
```

---

### 2. LIBRERÍAS DE GRÁFICOS

**Rechart (Recomendado para React):**
```bash
npm install recharts
```

**Alternativa Chart.js:**
```bash
npm install chart.js react-chartjs-2
```

---

### 3. DASHBOARD PRINCIPAL (Layout)

```
┌───────────────────────────────────────────────────────────────────┐
│  ROGU - Dashboard de Dueño                                  [👤]  │
├─────────┬─────────────────────────────────────────────────────────┤
│         │                                                         │
│  MENÚ   │  DASHBOARD GENERAL                                      │
│         │                                                         │
│ 📊 Inicio│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ 📅 Reserv│  │ Ingresos    │ │ Reservas    │ │ Ocupación   │     │
│ 💰 Ingres│  │  Bs 15,420  │ │     87      │ │   68.3%     │     │
│ 🏟️ Cancha│  │  +12.5% ↗   │ │   +8.2% ↗   │ │   +5.1% ↗   │     │
│ ⭐ Reseña│  └─────────────┘ └─────────────┘ └─────────────┘     │
│ 📈 Report│                                                         │
│ ⚙️ Config│  ┌────────────────────────────────────────────────┐   │
│         │  │  Ingresos Últimos 6 Meses                       │   │
│         │  │  [Gráfico de área]                              │   │
│         │  │                                                  │   │
│         │  └────────────────────────────────────────────────┘   │
│         │                                                         │
│         │  ┌─────────────────────┐ ┌──────────────────────┐     │
│         │  │ Últimas Reservas    │ │ Canchas Más Populares│     │
│         │  │ [Tabla con 10]      │ │ [Lista con stats]    │     │
│         │  └─────────────────────┘ └──────────────────────┘     │
│         │                                                         │
└─────────┴─────────────────────────────────────────────────────────┘
```

---

### 4. COMPONENTES CLAVE

#### KPICard Component
```typescript
Props:
- title: string                    // "Ingresos del Mes"
- value: string | number           // "Bs 15,420"
- change: string                   // "+12.5%"
- trend: 'up' | 'down' | 'neutral' // Para color y flecha
- icon: ReactNode                  // Icono (lucide-react)
- loading: boolean

UI:
┌──────────────────────┐
│ 💰 Ingresos del Mes  │
│                      │
│   Bs 15,420.50       │  <- Grande, bold
│   +12.5% ↗           │  <- Verde si up, rojo si down
└──────────────────────┘
```

#### RevenueChart Component
```typescript
Props:
- data: Array<{ mes: string, ingresos: number }>
- loading: boolean

Tipo: Gráfico de área (Area Chart)
Librería: Recharts <AreaChart>
Color: Gradiente verde
```

#### CalendarHeatmap Component
```typescript
Props:
- data: Array<{ fecha: string, ocupacion: number }>
- onDayClick: (fecha: string) => void

UI: Calendario estilo GitHub contributions
- Cada día es un cuadrado
- Color según % ocupación:
  - 0-25%: gris claro
  - 26-50%: verde claro
  - 51-75%: verde medio
  - 76-100%: verde oscuro
```

---

### 5. PÁGINAS PRINCIPALES

#### DashboardPage
- Muestra overview general
- KPIs en cards
- Gráfico de ingresos (últimos 6 meses)
- Tabla de últimas reservas (10)
- Lista de canchas más populares

#### ReservasAnalyticsPage
- Filtros: Rango de fechas, cancha
- Stats: Total, confirmadas, canceladas, pendientes
- Gráfico: Reservas por día (barras)
- Gráfico: Distribución por estado (donut)
- Tabla: Horarios más reservados
- Tabla: Días más reservados

#### IngresosAnalyticsPage
- Filtros: Periodo (mes/trimestre/año/personalizado)
- KPIs: Total, promedio diario, proyección
- Gráfico: Tendencia de ingresos (línea)
- Gráfico: Ingresos por cancha (barras horizontales)
- Tabla: Comparativa mensual

#### CanchasAnalyticsPage
- Lista de todas las canchas con mini-stats
- Click en una cancha → vista detallada:
  - Stats completas
  - Gráfico de tendencia
  - Lista de reseñas
  - Calendario de ocupación

#### ReseñasPage
- Filtro por cancha
- Resumen: Rating promedio, distribución de estrellas
- Lista de reseñas con opción de responder
- Resaltar las que no tienen respuesta

#### ReportesPage
- Selector de tipo de reporte
- Rango de fechas
- Opciones adicionales
- Botones:
  - [📄 Generar PDF]
  - [📊 Exportar Excel]
- Preview de reporte antes de generar

---

### 6. SERVICIOS FRONTEND

**analyticsService.ts:**

```typescript
getDashboard(fechaInicio?, fechaFin?): Promise<DashboardData>
getReservasAnalytics(fechaInicio, fechaFin, idCancha?): Promise<ReservasAnalytics>
getIngresosAnalytics(periodo, fechaInicio?, fechaFin?): Promise<IngresosAnalytics>
getCanchaStats(idCancha, fechaInicio, fechaFin): Promise<CanchaStats>
getCalendario(mes, idCancha?): Promise<CalendarioData>
getResenas(idCancha?, pagina, limite): Promise<ResenasData>
downloadPDFReport(options): Promise<Blob>
downloadExcelReport(options): Promise<Blob>
```

---

### 7. FLUJOS DE USUARIO

#### Flujo: Ver Dashboard
```
1. Dueño hace login
2. Sistema detecta rol DUENO
3. Redirige a /dashboard
4. Frontend llama GET /api/analytics/dashboard
5. Backend calcula KPIs y datos
6. Frontend renderiza:
   - KPI Cards con animación
   - Gráfico de ingresos
   - Tablas de datos
7. Datos se actualizan cada 5 minutos (auto-refresh)
```

#### Flujo: Generar Reporte PDF
```
1. Dueño va a página "Reportes"
2. Selecciona:
   - Tipo: "Completo"
   - Rango: "01/10/2024 - 31/10/2024"
   - Opciones: ☑️ Incluir gráficos
3. Click en "Generar PDF"
4. Loading state: "Generando reporte..."
5. Frontend llama POST /api/analytics/reportes/pdf
6. Backend:
   - Obtiene todos los datos
   - Genera HTML con plantilla
   - Convierte a PDF con Puppeteer
   - Retorna archivo
7. Frontend recibe Blob
8. Trigger download automático: "reporte-octubre-2024.pdf"
9. Mensaje: "Reporte generado exitosamente"
```

#### Flujo: Analizar Cancha Específica
```
1. Dueño va a "Mis Canchas"
2. Lista muestra todas sus canchas con mini-stats
3. Click en "Ver Detalles" de "Cancha Fútbol A"
4. Redirige a /analytics/cancha/3
5. Frontend llama GET /api/analytics/cancha/3
6. Muestra:
   - Header con foto y nombre de cancha
   - KPIs específicos
   - Gráfico de tendencia de reservas
   - Calendario de ocupación del mes
   - Últimas reseñas
   - Horarios más populares
7. Botón "Editar Cancha" → redirige a gestión
```

#### Flujo: Responder Reseña
```
1. Dueño ve notificación: "Nueva reseña sin responder"
2. Click en notificación → va a página de reseñas
3. Sección "Pendientes de Respuesta" resaltada
4. Click en "Responder" de una reseña
5. Modal se abre:
   ┌─────────────────────────────────────┐
   │ Responder a reseña                  │
   ├─────────────────────────────────────┤
   │ Reseña original:                    │
   │ ⭐⭐⭐⭐⭐ "Excelente cancha!"      │
   │ - Juan Pérez, 28 Oct 2024          │
   │                                     │
   │ Tu respuesta:                       │
   │ [Textarea]                          │
   │                                     │
   │ [Cancelar]  [Publicar Respuesta]   │
   └─────────────────────────────────────┘
6. Escribe respuesta
7. Click "Publicar"
8. Frontend llama POST /api/resenas/:id/responder
9. Backend guarda respuesta
10. Modal cierra
11. Reseña ahora muestra respuesta del dueño
```

---

## 🎨 DISEÑO Y UX

### Paleta de Colores para Gráficos
- **Ingresos:** Verde (#10B981)
- **Reservas:** Azul (#3B82F6)
- **Cancelaciones:** Rojo (#EF4444)
- **Ocupación:** Naranja (#F59E0B)
- **Rating:** Amarillo (#FBBF24)

### Gráficos Recomendados
- **Ingresos:** Gráfico de área con gradiente
- **Reservas por día:** Gráfico de barras verticales
- **Distribución por estado:** Gráfico de donut
- **Ingresos por cancha:** Barras horizontales
- **Tendencia:** Gráfico de línea
- **Ocupación:** Heatmap/Calendario

### Animaciones
- Números que cuentan (CountUp.js)
- Fade in para cards
- Loading skeletons mientras carga
- Smooth scroll entre secciones

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Crear vista SQL para estadísticas agregadas
- [ ] Implementar AnalyticsService completo
- [ ] Crear ReportService (PDF y Excel)
- [ ] Instalar Puppeteer y xlsx
- [ ] Crear endpoints de analytics
- [ ] Optimizar queries con índices
- [ ] Implementar cache para datos frecuentes (Redis opcional)
- [ ] Probar cálculo de KPIs
- [ ] Probar generación de PDF
- [ ] Probar exportación Excel
- [ ] Validar permisos (solo dueño ve sus datos)

### Frontend
- [ ] Crear módulo analytics completo
- [ ] Instalar recharts o chart.js
- [ ] Implementar KPICard component
- [ ] Implementar gráficos (Revenue, Bookings, Donut)
- [ ] Crear DashboardPage
- [ ] Crear ReservasAnalyticsPage
- [ ] Crear IngresosAnalyticsPage
- [ ] Crear CanchasAnalyticsPage
- [ ] Crear ReseñasPage
- [ ] Crear ReportesPage
- [ ] Implementar DateRangePicker
- [ ] Implementar exportación (PDF/Excel)
- [ ] Agregar loading states
- [ ] Responsive design (mobile-friendly)
- [ ] Probar con datos reales
- [ ] Optimizar performance de gráficos

### Testing
- [ ] Test cálculo de KPIs con diferentes datos
- [ ] Test comparación de periodos
- [ ] Test generación de PDF completo
- [ ] Test exportación Excel con múltiples hojas
- [ ] Test permisos (usuario no dueño no puede acceder)
- [ ] Test con rangos de fechas extremos
- [ ] Test con canchas sin datos
- [ ] Test responsive en móvil
- [ ] Test gráficos con muchos datos
- [ ] Test auto-refresh de dashboard

---

## 📚 RECURSOS Y REFERENCIAS

### Librerías Recomendadas

**Backend:**
- `puppeteer` - Generación de PDF
- `xlsx` - Exportación a Excel
- `date-fns` - Manejo de fechas

**Frontend:**
- `recharts` - Gráficos en React
- `react-datepicker` - Selector de fechas
- `react-countup` - Animación de números

### Documentación
- Recharts: https://recharts.org/
- Puppeteer: https://pptr.dev/
- XLSX: https://docs.sheetjs.com/

### Diseño de Referencia
- Vercel Analytics
- Google Analytics Dashboard
- Stripe Dashboard

---

**Fecha inicio:** ___________  
**Fecha fin:** ___________  
**Responsable:** ___________
