# 🗺️ MAPA DE CONEXIONES - PANEL ADMIN

## 📐 ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR                                │
│  http://localhost:5173/admin/dashboard                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  App.tsx                                                  │  │
│  │  Route: /admin/dashboard → DashboardPage                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DashboardPage.tsx                                        │  │
│  │  - useEffect → carga datos                               │  │
│  │  - Renderiza componentes                                 │  │
│  └─────────────┬────────────────────────────────────────────┘  │
│                │                                                │
│                ▼                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  dashboardService.getMetricas()                           │  │
│  │  (dashboard/hooks/useDashboard.ts)                       │  │
│  └─────────────┬────────────────────────────────────────────┘  │
│                │                                                │
│                ▼                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  adminApiClient.get('/dashboard/metricas')               │  │
│  │  (lib/adminApiClient.ts)                                 │  │
│  │  - Agrega token JWT al header                            │  │
│  │  - URL: http://localhost:3000/api/admin/dashboard/...    │  │
│  └─────────────┬────────────────────────────────────────────┘  │
└────────────────┼────────────────────────────────────────────────┘
                 │
                 │ HTTP Request
                 │ Authorization: Bearer <JWT_TOKEN>
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (NestJS)                                    │
│  http://localhost:3000/api/admin/dashboard/metricas            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  @Auth([TipoRol.ADMIN]) Guard                            │  │
│  │  - Verifica JWT token                                    │  │
│  │  - Verifica que usuario tiene rol ADMIN                  │  │
│  └─────────────┬────────────────────────────────────────────┘  │
│                │ ✅ Autorizado                                  │
│                ▼                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AdminController.getDashboardMetricas()                  │  │
│  │  (admin/admin.controller.ts)                             │  │
│  └─────────────┬────────────────────────────────────────────┘  │
│                │                                                │
│                ▼                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AdminService.getDashboardMetricas()                     │  │
│  │  (admin/admin.service.ts)                                │  │
│  │  - Ejecuta queries a BD                                  │  │
│  │  - Procesa datos                                         │  │
│  │  - Retorna JSON                                          │  │
│  └─────────────┬────────────────────────────────────────────┘  │
└────────────────┼────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SELECT COUNT(*) FROM usuarios;                          │  │
│  │  SELECT COUNT(*) FROM sede WHERE verificada = true;      │  │
│  │  SELECT COUNT(*) FROM reserva WHERE ...;                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Retorna resultados                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                 │
                 │ Response JSON
                 │
                 ▼
    Frontend recibe datos y los renderiza en UI
```

---

## 🔄 FLUJO DE DATOS - EJEMPLO ESPECÍFICO

### **Cargar Métricas del Dashboard**

```
1. Usuario navega a /admin/dashboard
   ↓
2. DashboardPage.tsx se monta
   ↓
3. useEffect ejecuta loadDashboardData()
   ↓
4. dashboardService.getMetricas() hace llamada HTTP
   ↓
5. adminApiClient agrega token JWT:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ↓
6. Petición HTTP GET a:
   http://localhost:3000/api/admin/dashboard/metricas
   ↓
7. NestJS recibe petición
   ↓
8. @Auth([TipoRol.ADMIN]) verifica:
   - Token válido? ✓
   - Usuario existe? ✓
   - Tiene rol ADMIN? ✓
   ↓
9. AdminController.getDashboardMetricas() ejecuta
   ↓
10. AdminService.getDashboardMetricas() ejecuta queries:
    - this.usuarioRepository.count()
    - this.sedeRepository.count({ where: { verificada: true }})
    - this.reservaRepository.count(...)
   ↓
11. PostgreSQL procesa queries y retorna resultados
   ↓
12. AdminService construye objeto de respuesta:
    {
      usuarios: { total: 100, nuevosHoy: 5, ... },
      sedes: { total: 50, verificadas: 40, ... },
      ...
    }
   ↓
13. Retorna JSON al frontend
   ↓
14. DashboardPage actualiza estado:
    setMetricas(data)
   ↓
15. React re-renderiza componente con datos
   ↓
16. Usuario ve las métricas en pantalla
```

---

## 📁 MAPEO DE ARCHIVOS POR FUNCIONALIDAD

### **1. Dashboard - Métricas**

```
Frontend:
rogu-web/src/modules/admin-panel/
├── dashboard/pages/DashboardPage.tsx         [Renderiza UI]
│   └── usa dashboardService
├── dashboard/hooks/useDashboard.ts           [API calls]
│   └── usa adminApiClient
└── lib/adminApiClient.ts                     [HTTP client]
    └── axios → localhost:3000/api/admin
                    ↓
Backend:
espacios_deportivos/src/admin/
├── admin.controller.ts                       [Endpoints]
│   └── @Get('dashboard/metricas')
│       └── llama adminService
└── admin.service.ts                          [Lógica]
    └── getDashboardMetricas()
        └── queries a TypeORM repositories
                    ↓
Base de Datos:
PostgreSQL
├── tabla: usuarios
├── tabla: sede
├── tabla: reserva
└── tabla: denuncia
```

### **2. Gestión de Usuarios**

```
Frontend:
rogu-web/src/modules/admin-panel/
├── usuarios/pages/UsuariosListPage.tsx       [Lista]
├── usuarios/pages/UsuarioDetallePage.tsx     [Detalle]
├── usuarios/components/                       [Componentes UI]
└── usuarios/services/usuarios.service.ts      [API]
    └── getAll(), getById(), cambiarRol(), etc.
                    ↓
Backend:
espacios_deportivos/src/admin/
├── admin.controller.ts
│   ├── @Get('usuarios')
│   ├── @Get('usuarios/:id')
│   ├── @Put('usuarios/:id/cambiar-rol')
│   └── @Put('usuarios/:id/suspender')
└── admin.service.ts
    ├── getUsuarios()
    ├── getUsuarioDetalle()
    ├── cambiarRolUsuario()
    └── suspenderUsuario()
                    ↓
Base de Datos:
├── usuarios
├── personas (JOIN)
├── usuarios_roles (JOIN)
└── roles (JOIN)
```

### **3. Gestión de Sedes**

```
Frontend:
rogu-web/src/modules/admin-panel/
├── sedes/pages/SedesListPage.tsx
├── sedes/pages/SedeDetallePage.tsx
└── sedes/services/sedes.service.ts
    └── getAll(), getById(), editar(), etc.
                    ↓
Backend:
espacios_deportivos/src/admin/
├── admin.controller.ts
│   ├── @Get('sedes')
│   ├── @Get('sedes/:id')
│   └── @Put('sedes/:id/editar')
└── admin.service.ts
    ├── getSedes()
    ├── getSedeDetalle()
    └── editarSede()
                    ↓
Base de Datos:
├── sede
└── (relaciones con duenio, canchas, etc.)
```

---

## 🔐 FLUJO DE AUTENTICACIÓN

```
1. Usuario hace login
   POST /api/auth/login
   { correo, contrasena }
   ↓
2. Backend verifica credenciales
   ↓
3. Backend retorna JWT token:
   {
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     user: { idUsuario, correo, roles: [...] }
   }
   ↓
4. Frontend guarda token:
   localStorage.setItem('authToken', token)
   ↓
5. Cada petición admin incluye token:
   headers: {
     Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ↓
6. Backend valida token en cada request:
   @Auth([TipoRol.ADMIN])
   - Decodifica JWT
   - Verifica firma
   - Verifica que usuario tiene rol ADMIN
   - Si todo OK → permite acceso
   - Si falla → 401/403
```

---

## 🔌 PUERTOS Y URLs

```
┌─────────────────────────────────────────┐
│  Frontend Development Server            │
│  http://localhost:5173                  │
│                                         │
│  Rutas:                                 │
│  - /                (HomePage)          │
│  - /admin/dashboard (AdminPanel)        │
│  - /admin/usuarios                      │
│  - /admin/sedes                         │
└─────────────────────────────────────────┘
                 │
                 │ API Calls
                 ▼
┌─────────────────────────────────────────┐
│  Backend API Server                     │
│  http://localhost:3000                  │
│                                         │
│  Endpoints:                             │
│  - /api/auth/login                      │
│  - /api/admin/dashboard/*               │
│  - /api/admin/usuarios/*                │
│  - /api/admin/sedes/*                   │
└─────────────────────────────────────────┘
                 │
                 │ Database Queries
                 ▼
┌─────────────────────────────────────────┐
│  PostgreSQL Database                    │
│  localhost:5432                         │
│  Database: espacios_deportivos          │
│                                         │
│  Tablas principales:                    │
│  - usuarios                             │
│  - personas                             │
│  - roles                                │
│  - usuarios_roles                       │
│  - sede                                 │
│  - reserva                              │
│  - denuncia                             │
└─────────────────────────────────────────┘
```

---

## 🧩 DEPENDENCIAS ENTRE MÓDULOS

```
AdminModule (espacios_deportivos/src/admin/)
│
├── Importa TypeOrmModule con:
│   ├── Usuario
│   ├── Sede
│   ├── Reserva
│   ├── Denuncia
│   ├── Rol
│   ├── UsuarioRol
│   └── Persona
│
├── Importa Services:
│   ├── UsuariosService
│   └── PersonasService
│
└── Usa Decoradores:
    ├── @Auth([TipoRol.ADMIN])  (auth module)
    └── @ActiveUser()           (auth module)
```

---

## 🎨 FLUJO DE UI - Dashboard

```
Usuario carga /admin/dashboard
        ↓
┌──────────────────────────────────────┐
│  AdminLayout                         │
│  ┌────────────────────────────────┐ │
│  │ AdminSidebar                   │ │
│  │ - Dashboard (active)           │ │
│  │ - Usuarios                     │ │
│  │ - Sedes                        │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ AdminNavbar                    │ │
│  │ [Search] [Notifications] [User]│ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ DashboardPage                  │ │
│  │ ┌──────────┬──────────┬─────┐ │ │
│  │ │ Usuarios │ Sedes    │ ... │ │ │
│  │ │ 8,542    │ 234      │     │ │ │
│  │ └──────────┴──────────┴─────┘ │ │
│  │                                │ │
│  │ ┌──────────────────────────┐  │ │
│  │ │ Alertas Importantes      │  │ │
│  │ │ 🔴 15 Verificaciones... │  │ │
│  │ └──────────────────────────┘  │ │
│  │                                │ │
│  │ ┌──────────┬──────────┐       │ │
│  │ │ Gráficos │ Activity │       │ │
│  │ └──────────┴──────────┘       │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 📦 IMPORTS Y EXPORTS

### **Frontend - Rutas de Importación**

```typescript
// Desde cualquier archivo en admin-panel:

// Tipos
import type { Usuario, DashboardMetricas } from '@/admin-panel/types';

// Cliente API
import { adminApiClient } from '@/admin-panel/lib/adminApiClient';

// Servicios
import { dashboardService } from '@/admin-panel/dashboard/hooks/useDashboard';
import { usuariosService } from '@/admin-panel/usuarios/services/usuarios.service';
import { sedesService } from '@/admin-panel/sedes/services/sedes.service';

// Layout
import AdminLayout from '@/admin-panel/layout/AdminLayout';

// Componentes
import DashboardPage from '@/admin-panel/dashboard/pages/DashboardPage';
```

### **Backend - Imports**

```typescript
// En admin.controller.ts
import { AdminService } from './admin.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { CambiarRolDto, SuspenderUsuarioDto } from './dto';

// En admin.service.ts
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';
import { Sede } from 'src/sede/entities/sede.entity';
// etc.
```

---

## 🔍 DEBUGGING - Puntos de Verificación

### **1. Verificar Frontend conecta con Backend**
```javascript
// En Browser Console (F12):
fetch('http://localhost:3000/api/admin/dashboard/metricas', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(r => r.json())
.then(console.log)
```

### **2. Verificar Token JWT**
```javascript
// En Browser Console:
const token = localStorage.getItem('authToken');
console.log(token);

// Decodificar token (ir a jwt.io y pegar):
// Debe mostrar payload con idUsuario, roles, etc.
```

### **3. Verificar Roles en BD**
```sql
-- En PostgreSQL:
SELECT 
  u."idUsuario",
  u.usuario,
  u.correo,
  r.rol,
  ur.activo
FROM usuarios u
JOIN usuarios_roles ur ON u."idUsuario" = ur."idUsuario"
JOIN roles r ON ur."idRol" = r."idRol"
WHERE u.correo = 'tu-email@example.com';
```

### **4. Logs del Backend**
```bash
# En terminal donde corre NestJS:
# Debe mostrar:
[Nest] LOG [AdminController] GET /admin/dashboard/metricas
[Nest] LOG [AdminService] Ejecutando getDashboardMetricas
```

---

## ✅ CHECKLIST DE CONEXIONES

- [ ] Frontend corre en http://localhost:5173
- [ ] Backend corre en http://localhost:3000
- [ ] PostgreSQL activo en localhost:5432
- [ ] Token JWT en localStorage
- [ ] Usuario tiene rol ADMIN en BD
- [ ] CORS configurado en backend (permite localhost:5173)
- [ ] Path aliases funcionan (@/admin-panel/*)
- [ ] AdminModule registrado en app.module.ts
- [ ] Ruta /admin/dashboard funciona
- [ ] Peticiones HTTP aparecen en Network tab
- [ ] Respuestas llegan correctamente
- [ ] UI renderiza datos

---

**🎯 Si todo está ✅ arriba, las conexiones están completas!**

Ver `GUIA_IMPLEMENTACION_PANEL_ADMIN.md` para continuar el desarrollo.
