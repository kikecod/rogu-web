# ⚡ RESUMEN RÁPIDO - PANEL ADMIN

## 🗂️ ARCHIVOS CLAVE CREADOS

### **Frontend (rogu-web)**
```
src/modules/admin-panel/
├── types/index.ts                           ← Todos los tipos TypeScript
├── lib/adminApiClient.ts                    ← Cliente HTTP configurado
├── layout/
│   ├── AdminLayout.tsx                      ← Layout principal
│   ├── AdminSidebar.tsx                     ← Menú lateral
│   └── AdminNavbar.tsx                      ← Barra superior
├── dashboard/
│   ├── pages/DashboardPage.tsx              ← Dashboard completo
│   └── hooks/useDashboard.ts                ← API Dashboard
├── usuarios/services/usuarios.service.ts    ← API Usuarios
└── sedes/services/sedes.service.ts          ← API Sedes
```

### **Backend (espacios_deportivos)**
```
src/admin/
├── admin.module.ts         ← Módulo registrado en app.module.ts
├── admin.controller.ts     ← Endpoints HTTP
├── admin.service.ts        ← Lógica de negocio
└── dto/
    ├── cambiar-rol.dto.ts
    ├── suspender-usuario.dto.ts
    ├── banear-usuario.dto.ts
    ├── enviar-email.dto.ts
    └── nota-admin.dto.ts
```

---

## 🔗 CONEXIONES IMPORTANTES

### **1. Frontend → Backend**

**Cliente API Base:**
```typescript
// rogu-web/src/modules/admin-panel/lib/adminApiClient.ts
const API_BASE_URL = 'http://localhost:3000/api/admin'
```

**Ejemplo de llamada:**
```typescript
// En cualquier servicio:
import { adminApiClient } from '@/admin-panel/lib/adminApiClient';

const data = await adminApiClient.get('/dashboard/metricas');
```

### **2. Autenticación**

**Frontend envia token JWT:**
```typescript
// adminApiClient.ts línea 20-28
this.client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Backend valida con decorador:**
```typescript
// admin.controller.ts
@Controller('admin')
@Auth([TipoRol.ADMIN])  // ← Solo usuarios con rol ADMIN
export class AdminController {
  // ...
}
```

### **3. Base de Datos**

**Entidades principales usadas:**
```typescript
// admin.service.ts usa:
- Usuario          (usuarios)
- Sede             (sedes)
- Reserva          (reserva)
- Denuncia         (denuncia)
- Rol              (roles)
- UsuarioRol       (usuarios_roles)
```

### **4. Rutas Frontend**

**Configuración en App.tsx:**
```tsx
import DashboardPage from '@/admin-panel/dashboard/pages/DashboardPage';

<Route path="/admin/dashboard" element={<DashboardPage />} />
```

**Path alias en tsconfig.app.json:**
```json
"@/admin-panel/*": ["src/modules/admin-panel/*"]
```

---

## 🚀 COMANDOS RÁPIDOS

### **Iniciar Proyecto**
```bash
# Backend
cd espacios_deportivos
npm run start:dev

# Frontend
cd rogu-web
npm run dev
```

### **Instalar Dependencias Necesarias**
```bash
cd rogu-web
npm install recharts @tanstack/react-table react-hook-form lucide-react
```

### **Crear Usuario Admin (PostgreSQL)**
```sql
-- 1. Buscar o crear persona
INSERT INTO personas (nombre, "apellidoPaterno", "apellidoMaterno")
VALUES ('Admin', 'Sistema', 'Principal')
RETURNING "idPersona";

-- 2. Crear usuario (cambiar idPersona por el retornado)
INSERT INTO usuarios ("idPersona", usuario, correo, "hashContrasena", estado, "correoVerificado")
VALUES (
  1, -- cambiar por idPersona real
  'admin',
  'admin@espaciosdeportivos.com',
  '$2b$10$...',  -- usar bcrypt para hashear password
  'ACTIVO',
  true
)
RETURNING "idUsuario";

-- 3. Asignar rol ADMIN
-- Primero buscar idRol de ADMIN
SELECT "idRol" FROM roles WHERE rol = 'ADMIN';

-- Crear relación usuario-rol
INSERT INTO usuarios_roles ("idUsuario", "idRol", activo)
VALUES (1, 1, true);  -- cambiar por IDs reales
```

### **Verificar Estructura de BD**
```sql
-- Ver usuarios con roles
SELECT 
  u."idUsuario",
  u.usuario,
  u.correo,
  u.estado,
  r.rol
FROM usuarios u
JOIN usuarios_roles ur ON u."idUsuario" = ur."idUsuario"
JOIN roles r ON ur."idRol" = r."idRol"
WHERE ur.activo = true;

-- Ver sedes
SELECT "idSede", nombre, ciudad, verificada FROM sede LIMIT 10;

-- Ver reservas recientes
SELECT * FROM reserva ORDER BY "fechaCreacion" DESC LIMIT 5;
```

---

## 📍 ENDPOINTS PRINCIPALES

### **URL Base:** `http://localhost:3000/api/admin`

### **Dashboard**
```
GET /dashboard/metricas
GET /dashboard/alertas
GET /dashboard/graficos/usuarios?periodo=30d
GET /dashboard/graficos/reservas?periodo=7d
GET /dashboard/actividad-reciente?limit=10
```

### **Usuarios**
```
GET /usuarios?rol=&estado=&buscar=&page=1&limit=20
GET /usuarios/:id
PUT /usuarios/:id/cambiar-rol
PUT /usuarios/:id/suspender
PUT /usuarios/:id/banear
PUT /usuarios/:id/reactivar
DELETE /usuarios/:id
```

### **Sedes**
```
GET /sedes?estado=&ciudad=&verificada=&page=1
GET /sedes/:id
PUT /sedes/:id/editar
PUT /sedes/:id/desactivar
```

---

## 🧪 TESTING RÁPIDO

### **1. Test Backend con cURL**
```bash
# Login para obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@example.com","contrasena":"password123"}'

# Copiar el token del response

# Test endpoint admin
curl http://localhost:3000/api/admin/dashboard/metricas \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### **2. Test Frontend**
```bash
# Abrir navegador en:
http://localhost:5173/admin/dashboard

# Verificar en DevTools Console:
localStorage.getItem('authToken')  # debe tener un token

# Abrir Network tab y ver peticiones a:
http://localhost:3000/api/admin/*
```

---

## 🔐 SEGURIDAD

### **Protección de Rutas Backend**
```typescript
@Controller('admin')
@Auth([TipoRol.ADMIN])  // ← Solo ADMIN
export class AdminController {}
```

### **Protección de Rutas Frontend** (POR IMPLEMENTAR)
```tsx
// Crear: rogu-web/src/modules/core/routing/AdminRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';

export const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  // Verificar si el usuario tiene rol ADMIN
  const isAdmin = user?.roles?.some(r => r.rol.rol === 'ADMIN');
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};
```

Luego en App.tsx:
```tsx
import AdminRoute from '@/core/routing/AdminRoute';

<Route 
  path="/admin/*" 
  element={
    <AdminRoute>
      <DashboardPage />
    </AdminRoute>
  } 
/>
```

---

## 📊 DATOS DE PRUEBA

### **Métricas del Dashboard**
El servicio retorna:
```json
{
  "usuarios": {
    "total": 8542,
    "nuevosHoy": 12,
    "nuevosEsteMes": 156,
    "crecimiento": 2
  },
  "sedes": {
    "total": 234,
    "verificadas": 200,
    "pendientes": 34
  },
  "reservas": {
    "totalHoy": 45,
    "totalMes": 1234
  }
}
```

---

## 🎨 COMPONENTES REUTILIZABLES A CREAR

```tsx
// rogu-web/src/components/admin/
├── DataTable.tsx           - Tabla con paginación
├── SearchBar.tsx           - Búsqueda global
├── FilterBar.tsx           - Filtros
├── StatusBadge.tsx         - Badge de estado (activo/inactivo)
├── ActionButton.tsx        - Botón de acción
├── ConfirmDialog.tsx       - Modal de confirmación
└── LoadingSpinner.tsx      - Indicador de carga
```

**Ejemplo StatusBadge:**
```tsx
export const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVO: 'bg-green-100 text-green-800',
    BLOQUEADO: 'bg-red-100 text-red-800',
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[status]}`}>
      {status}
    </span>
  );
};
```

---

## ⚠️ TAREAS PENDIENTES CRÍTICAS

### **Backend**
1. [ ] Completar `getActividadReciente()` en admin.service.ts
2. [ ] Implementar tabla `admin_logs` para auditoría
3. [ ] Completar métodos de sedes (desactivar, reactivar, eliminar)
4. [ ] Crear módulo de verificaciones
5. [ ] Implementar envío de emails

### **Frontend**
1. [ ] Crear componentes de gráficos (Recharts)
2. [ ] Implementar paginación en tablas
3. [ ] Crear páginas de Usuarios (lista y detalle)
4. [ ] Crear páginas de Sedes (lista y detalle)
5. [ ] Implementar modales de acciones
6. [ ] Agregar AdminRoute guard
7. [ ] Crear componentes reutilizables

---

## 🐛 ERRORES COMUNES

### **Error: Module not found '@/admin-panel/...'**
✅ **Ya solucionado** - Path alias configurado en tsconfig.app.json

### **Error: Cannot find module './admin.service'**
✅ **Ya solucionado** - admin.service.ts creado

### **Error 401 Unauthorized**
- Verificar que tienes token JWT
- Login nuevamente si expiró
- Verificar header: `Authorization: Bearer <token>`

### **Error 403 Forbidden**
- Verificar que tu usuario tiene rol ADMIN en la BD
- Query de verificación:
```sql
SELECT r.rol FROM usuarios_roles ur
JOIN roles r ON ur."idRol" = r."idRol"
WHERE ur."idUsuario" = TU_ID;
```

---

## 📞 INTEGRACIÓN CON OTROS MÓDULOS

### **Sistema de Verificación (Oscar)**
```typescript
// Compartir servicios:
import { verificacionesService } from '@/verificaciones/services';

// Endpoints a crear:
GET /api/verificaciones/duenios
PUT /api/verificaciones/duenios/:id/aprobar
```

### **Sistema de Reseñas (Samy)**
```typescript
// Moderación de reseñas en admin:
GET /api/admin/resenas/reportadas
DELETE /api/admin/resenas/:id
```

---

## ✅ CHECKLIST RÁPIDO DE INICIO

- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] PostgreSQL activo
- [ ] Usuario ADMIN creado en BD
- [ ] Token JWT obtenido
- [ ] Ruta `/admin/dashboard` accesible
- [ ] Métricas cargando correctamente

---

**¡Todo listo para empezar a desarrollar! 🚀**

Ver `GUIA_IMPLEMENTACION_PANEL_ADMIN.md` para detalles completos.
