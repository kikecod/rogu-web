# 🚀 GUÍA COMPLETA DE IMPLEMENTACIÓN - PANEL DE ADMINISTRACIÓN

**Fecha de creación:** 13 de noviembre de 2025  
**Desarrollador:** Denzel  
**Estado:** ✅ Estructura Base Completada

---

## 📦 RESUMEN EJECUTIVO

Se ha creado la estructura base completa del Panel de Administración tanto en **Frontend (React)** como en **Backend (NestJS)**. Esta guía te ayudará a completar la implementación paso a paso.

### ✅ Lo que YA ESTÁ HECHO:

#### **Frontend (rogu-web/src/modules/admin-panel/)**
- ✅ Estructura de carpetas modular
- ✅ Tipos TypeScript completos (`types/index.ts`)
- ✅ Cliente API configurado (`lib/adminApiClient.ts`)
- ✅ Layout completo con Sidebar y Navbar
- ✅ Dashboard principal con métricas
- ✅ Servicios de API para Dashboard, Usuarios y Sedes
- ✅ Rutas configuradas en `App.tsx`
- ✅ Path aliases en `tsconfig.app.json`

#### **Backend (espacios_deportivos/src/admin/)**
- ✅ Módulo Admin completo (`admin.module.ts`)
- ✅ Controlador con endpoints (`admin.controller.ts`)
- ✅ Servicio con lógica de negocio (`admin.service.ts`)
- ✅ DTOs para validación de datos
- ✅ Integración en `app.module.ts`
- ✅ Protección con decorador `@Auth([TipoRol.ADMIN])`

---

## 🗂️ ESTRUCTURA CREADA

```
rogu-web/src/modules/admin-panel/
├── layout/
│   ├── AdminLayout.tsx          ✅ Layout principal
│   ├── AdminSidebar.tsx         ✅ Menu lateral con navegación
│   └── AdminNavbar.tsx          ✅ Barra superior
├── routing/
│   └── admin.routes.tsx         ⚠️ PENDIENTE
├── dashboard/
│   ├── pages/
│   │   └── DashboardPage.tsx    ✅ Página principal
│   ├── components/              ⚠️ PENDIENTE (métricas cards, gráficos)
│   └── hooks/
│       └── useDashboard.ts      ✅ Servicio API
├── usuarios/
│   ├── pages/                   ⚠️ PENDIENTE
│   ├── components/              ⚠️ PENDIENTE
│   ├── hooks/                   ⚠️ PENDIENTE
│   └── services/
│       └── usuarios.service.ts  ✅ API completa
├── verificaciones/
│   ├── pages/                   ⚠️ PENDIENTE
│   ├── components/              ⚠️ PENDIENTE
│   └── services/                ⚠️ PENDIENTE
├── sedes/
│   ├── pages/                   ⚠️ PENDIENTE
│   ├── components/              ⚠️ PENDIENTE
│   └── services/
│       └── sedes.service.ts     ✅ API completa
├── lib/
│   └── adminApiClient.ts        ✅ Cliente HTTP configurado
└── types/
    └── index.ts                 ✅ Tipos completos

espacios_deportivos/src/admin/
├── admin.module.ts              ✅ Módulo registrado
├── admin.controller.ts          ✅ Endpoints completos
├── admin.service.ts             ✅ Lógica de negocio
└── dto/
    ├── cambiar-rol.dto.ts       ✅
    ├── suspender-usuario.dto.ts ✅
    ├── banear-usuario.dto.ts    ✅
    ├── enviar-email.dto.ts      ✅
    ├── nota-admin.dto.ts        ✅
    └── index.ts                 ✅
```

---

## 🎯 PLAN DE DESARROLLO PASO A PASO

### **FASE 1: Completar Dashboard (1-2 días)**

#### 1.1 Componentes de Métricas
Crear en `dashboard/components/`:

```tsx
// MetricCard.tsx - Card individual de métrica
// AlertsPanel.tsx - Panel de alertas
// ActivityTimeline.tsx - Timeline de actividad
// QuickActions.tsx - Botones de acciones rápidas
```

#### 1.2 Gráficos
Instalar librería de gráficos:
```bash
npm install recharts
# o
npm install chart.js react-chartjs-2
```

Crear componentes:
```tsx
// UserGrowthChart.tsx - Gráfico de crecimiento de usuarios
// BookingsChart.tsx - Gráfico de reservas
```

#### 1.3 Hook personalizado
```tsx
// dashboard/hooks/useDashboard.ts
export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState(null);
  // ... lógica de carga
  return { metricas, loading, refresh };
};
```

---

### **FASE 2: Gestión de Usuarios (2-3 días)**

#### 2.1 Lista de Usuarios
Crear: `usuarios/pages/UsuariosListPage.tsx`

**Funcionalidades:**
- Tabla con paginación
- Filtros (rol, estado, búsqueda)
- Acciones por usuario (ver, editar, suspender)

```tsx
// Componentes necesarios:
usuarios/components/
├── UsersTable.tsx          - Tabla principal
├── UserRow.tsx             - Fila individual
├── UserFilters.tsx         - Barra de filtros
└── UserActionsMenu.tsx     - Menú de acciones
```

#### 2.2 Detalle de Usuario
Crear: `usuarios/pages/UsuarioDetallePage.tsx`

**Secciones:**
- Información personal
- Roles y permisos
- Estadísticas
- Sedes administradas (si es dueño)
- Historial de acciones
- Notas internas
- Acciones administrativas

```tsx
// Componentes necesarios:
usuarios/components/
├── UserInfoCard.tsx           - Info básica
├── UserStatsCard.tsx          - Estadísticas
├── UserRoleManager.tsx        - Gestión de roles
├── UserAdminActions.tsx       - Botones de acciones
├── UserHistoryTimeline.tsx    - Historial
└── UserNotesPanel.tsx         - Notas internas
```

#### 2.3 Modales de Acciones
```tsx
usuarios/components/
├── CambiarRolModal.tsx
├── SuspenderUsuarioModal.tsx
├── BanearUsuarioModal.tsx
└── EnviarEmailModal.tsx
```

#### 2.4 Hook de Usuarios
```tsx
// usuarios/hooks/useUsuarios.ts
export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filters, setFilters] = useState({});
  
  const loadUsuarios = async () => { /*...*/ };
  const cambiarRol = async (id, nuevoRol) => { /*...*/ };
  const suspender = async (id, dias) => { /*...*/ };
  
  return { usuarios, loadUsuarios, cambiarRol, suspender };
};
```

---

### **FASE 3: Gestión de Sedes (2 días)**

#### 3.1 Lista de Sedes
Crear: `sedes/pages/SedesListPage.tsx`

Similar a usuarios, con filtros:
- Estado (activa/inactiva)
- Ciudad
- Verificación
- Dueño

#### 3.2 Detalle de Sede
Crear: `sedes/pages/SedeDetallePage.tsx`

**Secciones:**
- Información de la sede
- Dueño
- Canchas asociadas
- Estadísticas (reservas, ingresos)
- Reseñas
- Historial de cambios

---

### **FASE 4: Sistema de Verificaciones (2-3 días)**

Ver documento: `SISTEMA_VERIFICACION_OSCAR.md`

#### 4.1 Páginas
```
verificaciones/pages/
├── VerificacionesListPage.tsx   - Lista con tabs (dueños, sedes)
├── VerificarDuenioPage.tsx      - Detalle de verificación de dueño
└── VerificarSedePage.tsx        - Detalle de verificación de sede
```

#### 4.2 Componentes
```
verificaciones/components/
├── VerificacionCard.tsx         - Card de solicitud
├── DocumentViewer.tsx           - Visor de documentos
├── VerificationActions.tsx      - Aprobar/Rechazar/Solicitar info
└── VerificationNotes.tsx        - Notas del admin
```

#### 4.3 Backend - Crear módulo de verificaciones
```bash
cd espacios_deportivos
nest g module verificaciones
nest g controller verificaciones
nest g service verificaciones
```

Endpoints necesarios:
```typescript
GET /api/verificaciones/duenios
GET /api/verificaciones/duenios/:id
PUT /api/verificaciones/duenios/:id/aprobar
PUT /api/verificaciones/duenios/:id/rechazar
POST /api/verificaciones/duenios/:id/solicitar-info

GET /api/verificaciones/sedes
GET /api/verificaciones/sedes/:id
PUT /api/verificaciones/sedes/:id/aprobar
PUT /api/verificaciones/sedes/:id/rechazar
```

---

### **FASE 5: Gestión de Reportes (OPCIONAL - 2 días)**

Si tienes tiempo, implementar módulo de reportes/denuncias.

#### 5.1 Backend - Mejorar entidad Denuncia
```typescript
// espacios_deportivos/src/denuncia/entities/denuncia.entity.ts
// Agregar campos según PANEL_ADMINISTRADOR_DENZEL.md líneas 477-493
```

#### 5.2 Frontend
```
admin-panel/reportes/
├── pages/
│   ├── ReportesListPage.tsx
│   └── ReporteDetallePage.tsx
├── components/
│   ├── ReporteCard.tsx
│   ├── ReporteFilters.tsx
│   ├── ReporteActions.tsx
│   └── EvidenciaViewer.tsx
└── services/
    └── reportes.service.ts
```

---

### **FASE 6: Analytics y Reportes (OPCIONAL - 1-2 días)**

```
admin-panel/analytics/
├── pages/
│   └── AnalyticsPage.tsx
└── components/
    ├── GrowthCharts.tsx
    ├── RevenueChart.tsx
    ├── GeographicDistribution.tsx
    └── TopRankings.tsx
```

---

## 🔧 TAREAS TÉCNICAS IMPORTANTES

### 1. **Instalar Dependencias Necesarias**

```bash
cd rogu-web

# Para gráficos
npm install recharts

# Para tablas con paginación
npm install @tanstack/react-table

# Para formularios
npm install react-hook-form @hookform/resolvers zod

# Para iconos (si no están)
npm install lucide-react

# Para modales/dialogs
npm install @radix-ui/react-dialog
```

### 2. **Crear Componentes Reutilizables Globales**

En `rogu-web/src/components/`:

```tsx
// DataTable.tsx - Tabla genérica con paginación
// Modal.tsx - Modal reutilizable
// ConfirmDialog.tsx - Diálogo de confirmación
// Badge.tsx - Badges de estado
// Pagination.tsx - Componente de paginación
// SearchBar.tsx - Barra de búsqueda
// FilterBar.tsx - Barra de filtros
// LoadingSpinner.tsx - Spinner de carga
```

### 3. **Backend - Completar Lógica Faltante**

En `espacios_deportivos/src/admin/admin.service.ts`:

**Completar métodos marcados con TODO:**

```typescript
// Línea 135: getActividadReciente
// Línea 361: getHistorialUsuario
// Línea 367: agregarNotaUsuario
// Línea 440-455: Métodos de sedes (desactivar, reactivar, eliminar)
```

**Agregar tabla de logs de auditoría:**

```bash
nest g module admin-logs
nest g entity admin-logs
```

```typescript
// admin-logs/entities/admin-log.entity.ts
@Entity('admin_logs')
export class AdminLog {
  @PrimaryGeneratedColumn()
  idLog: number;

  @Column()
  idAdmin: number;

  @Column({ type: 'enum', enum: ['APROBAR', 'RECHAZAR', 'SUSPENDER', ...] })
  accion: string;

  @Column()
  entidadTipo: string;

  @Column()
  idEntidad: number;

  @Column({ type: 'jsonb', nullable: true })
  detalles: any;

  @Column()
  ipAddress: string;

  @CreateDateColumn()
  fechaHora: Date;
}
```

### 4. **Crear Guard de Protección para Rutas Admin**

```tsx
// rogu-web/src/modules/core/routing/AdminRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';

export const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/" />;
  }
  
  return children;
};
```

Usar en App.tsx:
```tsx
<Route 
  path="/admin/*" 
  element={<AdminRoute><DashboardPage /></AdminRoute>} 
/>
```

---

## 📊 ENDPOINTS DEL BACKEND - REFERENCIA RÁPIDA

### **Dashboard**
```
✅ GET /api/admin/dashboard/metricas
✅ GET /api/admin/dashboard/alertas
✅ GET /api/admin/dashboard/graficos/usuarios?periodo=30d
✅ GET /api/admin/dashboard/graficos/reservas?periodo=7d
⚠️ GET /api/admin/dashboard/actividad-reciente?limit=10
```

### **Usuarios**
```
✅ GET /api/admin/usuarios?rol=&estado=&buscar=&page=1&limit=20
✅ GET /api/admin/usuarios/estadisticas
✅ GET /api/admin/usuarios/:id
✅ PUT /api/admin/usuarios/:id/cambiar-rol
✅ PUT /api/admin/usuarios/:id/suspender
✅ PUT /api/admin/usuarios/:id/banear
✅ PUT /api/admin/usuarios/:id/reactivar
✅ DELETE /api/admin/usuarios/:id
✅ POST /api/admin/usuarios/:id/enviar-email
⚠️ GET /api/admin/usuarios/:id/historial
⚠️ POST /api/admin/usuarios/:id/nota
```

### **Sedes**
```
✅ GET /api/admin/sedes?estado=&ciudad=&verificada=&page=1
✅ GET /api/admin/sedes/estadisticas
✅ GET /api/admin/sedes/:id
✅ PUT /api/admin/sedes/:id/editar
⚠️ PUT /api/admin/sedes/:id/desactivar
⚠️ PUT /api/admin/sedes/:id/reactivar
⚠️ DELETE /api/admin/sedes/:id
```

### **Verificaciones** (⚠️ POR CREAR)
```
⚠️ GET /api/verificaciones/duenios
⚠️ GET /api/verificaciones/duenios/:id
⚠️ PUT /api/verificaciones/duenios/:id/aprobar
⚠️ PUT /api/verificaciones/duenios/:id/rechazar
⚠️ GET /api/verificaciones/sedes
⚠️ PUT /api/verificaciones/sedes/:id/aprobar
```

---

## 🎨 DISEÑO Y UX - Recomendaciones

### **Colores del Panel Admin**
```css
/* Sidebar */
bg-gray-900 (fondo)
bg-blue-600 (item activo)
bg-gray-800 (hover)

/* Estados */
bg-red-500 (error, alerta alta)
bg-yellow-500 (warning, alerta media)
bg-green-500 (success, verificado)
bg-blue-500 (info, activo)
bg-gray-500 (inactivo, neutral)

/* Cards */
bg-white (fondo cards)
shadow-sm / shadow-md (sombras)
```

### **Iconos con Lucide React**
Ya instalados. Usa:
- `Users` - Usuarios
- `Building2` - Sedes
- `CheckCircle` - Verificado
- `XCircle` - Rechazado
- `Clock` - Pendiente
- `AlertTriangle` - Alerta
- `TrendingUp` - Crecimiento
- etc.

---

## 🧪 TESTING - Checklist

### **Backend**
```bash
# Probar endpoints con Postman/Insomnia
POST /api/auth/login
{
  "correo": "admin@example.com",
  "contrasena": "password123"
}

# Copiar token JWT

# Probar endpoints admin con header:
Authorization: Bearer <token>

GET /api/admin/dashboard/metricas
GET /api/admin/usuarios
```

### **Frontend**
```bash
# Iniciar dev server
cd rogu-web
npm run dev

# Navegar a:
http://localhost:5173/admin/dashboard

# Verificar:
- [ ] Sidebar se muestra correctamente
- [ ] Métricas cargan sin errores
- [ ] Navegación funciona
- [ ] Estilos se aplican correctamente
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### **Semana 1:**
1. ✅ Estructura base (COMPLETADO)
2. Completar Dashboard con gráficos
3. Crear componentes reutilizables
4. Lista de Usuarios básica

### **Semana 2:**
5. Detalle de Usuario completo
6. Modales de acciones (cambiar rol, suspender, etc.)
7. Lista de Sedes
8. Detalle de Sede

### **Semana 3:**
9. Sistema de Verificaciones
10. Testing completo
11. Ajustes de UX
12. (Opcional) Reportes/Denuncias

---

## 📞 PUNTOS DE INTEGRACIÓN CON OTROS MÓDULOS

### **Con Sistema de Verificación (Oscar)**
- Usa los mismos endpoints de verificaciones
- Comparte componentes de DocumentViewer

### **Con Sistema de Reseñas (Samy)**
- Admin puede moderar reseñas
- Ver reseñas reportadas en Dashboard

### **Con Sistema de Pagos (Kike)**
- Dashboard muestra métricas de ingresos
- Analytics de transacciones

### **Con Sistema de Notificaciones (Oscar2)**
- Admin recibe notificaciones de nuevas verificaciones
- Alertas de reportes urgentes

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### **Error: Cannot find module '@/admin-panel/...'**
**Solución:** Ya configurado en `tsconfig.app.json`. Si persiste:
```bash
# Reiniciar TypeScript server en VSCode
Ctrl+Shift+P > TypeScript: Restart TS Server
```

### **Error 403: Forbidden en endpoints admin**
**Solución:** Verificar que el usuario tiene rol ADMIN:
```sql
-- En PostgreSQL
SELECT u.*, r.rol 
FROM usuarios u
JOIN usuarios_roles ur ON u."idUsuario" = ur."idUsuario"
JOIN roles r ON ur."idRol" = r."idRol"
WHERE u.correo = 'tu-email@example.com';
```

### **Gráficos no se renderizan**
**Solución:** Verificar que `recharts` está instalado y importado correctamente.

---

## 📚 RECURSOS ÚTILES

### **Documentación**
- [NestJS Docs](https://docs.nestjs.com/)
- [React Router](https://reactrouter.com/)
- [Recharts](https://recharts.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

### **Ejemplos de Código**
Ver archivos ya creados:
- `DashboardPage.tsx` - Ejemplo de página completa
- `adminApiClient.ts` - Ejemplo de cliente HTTP
- `admin.service.ts` - Ejemplo de servicio NestJS

---

## ✅ CHECKLIST FINAL

### **Backend**
- [x] Módulo Admin creado
- [x] DTOs de validación
- [x] Endpoints de Dashboard
- [x] Endpoints de Usuarios
- [x] Endpoints de Sedes
- [ ] Completar métodos TODO
- [ ] Crear tabla admin_logs
- [ ] Testing de endpoints

### **Frontend**
- [x] Estructura de carpetas
- [x] Layout (Sidebar + Navbar)
- [x] Tipos TypeScript
- [x] Cliente API
- [x] Dashboard básico
- [x] Servicios de API
- [ ] Componentes de Dashboard
- [ ] Páginas de Usuarios
- [ ] Páginas de Sedes
- [ ] Páginas de Verificaciones
- [ ] Guards de protección
- [ ] Testing E2E

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Instalar dependencias:**
   ```bash
   cd rogu-web
   npm install recharts @tanstack/react-table react-hook-form
   ```

2. **Crear un usuario admin en la BD:**
   ```sql
   -- Asegúrate de tener un usuario con rol ADMIN para testing
   ```

3. **Empezar con el Dashboard:**
   - Completar componentes de métricas
   - Agregar gráficos con Recharts

4. **Seguir con Lista de Usuarios:**
   - Crear tabla con paginación
   - Implementar filtros

---

## 💡 CONSEJOS FINALES

1. **Trabaja módulo por módulo** - Completa Dashboard antes de pasar a Usuarios
2. **Testea constantemente** - Prueba cada endpoint antes de avanzar
3. **Reutiliza componentes** - No dupliques código
4. **Sigue la estructura** - Mantén la organización de carpetas
5. **Documenta conforme avanzas** - Agrega comentarios en código complejo
6. **Commits frecuentes** - Haz commit después de cada feature completado

---

**¡Éxito con el desarrollo! 🚀**

Si tienes dudas sobre alguna parte específica, consulta:
- `PANEL_ADMINISTRADOR_DENZEL.md` - Especificaciones completas
- `FRONTEND_OVERVIEW.md` - Guía de arquitectura frontend
- Los archivos ya creados como ejemplo

---

**Última actualización:** 13 de noviembre de 2025
