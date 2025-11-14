# 📋 Sistema de Navegación Modular por Roles

## 🎯 Visión General

Se implementó un sistema de navegación modular que separa las opciones del menú según el rol del usuario (ADMIN, DUEÑO, CLIENTE, CONTROLADOR). Esta arquitectura mejora la mantenibilidad y escalabilidad del código.

---

## 📁 Estructura de Archivos

```
src/modules/core/navigation/
├── AdminNavItems.tsx      # Navegación exclusiva para ADMIN
├── OwnerNavItems.tsx      # Navegación exclusiva para DUEÑO
├── ClientNavItems.tsx     # Navegación común para usuarios autenticados
├── AdminTabBar.tsx        # Barra de tabs horizontal para ADMIN
└── index.ts               # Exportaciones centralizadas
```

---

## 🔑 Componentes Principales

### 1. **AdminNavItems** (`AdminNavItems.tsx`)
Opciones exclusivas para usuarios con rol `ADMIN`:

```tsx
- Panel de Administrador (sección header)
- Dashboard
- Gestión de Usuarios
- Gestión de Sedes
- Verificaciones
- Reportes
- Analytics
- Configuración
```

**Características:**
- Fondo morado (`purple-50`) para identificación visual
- Iconos de `lucide-react`
- Callback `onItemClick` para cerrar menú móvil

---

### 2. **OwnerNavItems** (`OwnerNavItems.tsx`)
Opciones exclusivas para usuarios con rol `DUENIO`:

```tsx
- Panel de Dueño (sección header)
- Mis Espacios
- Gestión de Sedes
- Reservas
- Analytics
- Reseñas
```

**Características:**
- Fondo verde (`green-50`) para identificación visual
- Orientado a gestión de espacios deportivos propios

---

### 3. **ClientNavItems** (`ClientNavItems.tsx`)
Opciones comunes para todos los usuarios autenticados:

```tsx
- Mi perfil
- Mis reservas
- Mis favoritos
- Ofrece tu espacio (solo si NO es dueño)
```

**Características:**
- Navegación base para todos los roles
- Lógica condicional: "Ofrece tu espacio" no se muestra a dueños

---

### 4. **AdminTabBar** (`AdminTabBar.tsx`)
Barra de navegación horizontal con tabs para administradores:

```tsx
- Dashboard
- Usuarios
- Sedes
- Verificaciones
- Reportes
- Analytics
```

**Características:**
- Se renderiza debajo del header principal
- Solo visible cuando `user.roles.includes('ADMIN')`
- Tab activo con borde morado y fondo resaltado
- Responsive: oculta texto en mobile, solo íconos
- Auto-scroll horizontal en pantallas pequeñas

---

## 🔄 Integración en Header

El componente `Header.tsx` fue refactorizado para usar estos módulos:

### **Antes (Código Espagueti):**
```tsx
{user?.roles && (user.roles.includes('DUENIO') || user.roles.includes('ADMIN')) && (
  <Link to={ROUTES.owner.adminSpaces}>Panel de Administración</Link>
)}

{user?.roles && user.roles.includes('ADMIN') && (
  <Link to={ROUTES.testRoles}>Prueba de Roles (Admin)</Link>
)}

{!isDuenio() && (
  <Link to={ROUTES.owner.hostSpace}>Ofrece tu espacio</Link>
)}
```

### **Después (Arquitectura Modular):**
```tsx
{/* Navegación de Cliente (común para todos) */}
<ClientNavItems 
  onItemClick={() => setIsMenuOpen(false)}
  isDuenio={isDuenio()}
/>

{/* Navegación de Dueño (solo para DUENIO) */}
{user?.roles && user.roles.includes('DUENIO') && (
  <OwnerNavItems onItemClick={() => setIsMenuOpen(false)} />
)}

{/* Navegación de Admin (solo para ADMIN) */}
{user?.roles && user.roles.includes('ADMIN') && (
  <AdminNavItems onItemClick={() => setIsMenuOpen(false)} />
)}

{/* Admin Tab Bar - Fuera del dropdown, en header */}
{user?.roles && user.roles.includes('ADMIN') && <AdminTabBar />}
```

---

## 🎨 Sistema de Colores por Rol

| Rol | Color de Fondo | Color de Texto | Uso |
|-----|---------------|----------------|-----|
| **ADMIN** | `purple-50` | `purple-700` | Navegación y tabs |
| **DUEÑO** | `green-50` | `green-700` | Panel de gestión |
| **CLIENTE** | `gray-50` | `gray-700` | Navegación base |

---

## 🛣️ Rutas Utilizadas

### Admin (`ROUTES.admin.*`)
```typescript
/admin/dashboard
/admin/usuarios
/admin/sedes
/admin/verificaciones
/admin/reportes
/admin/analytics
/admin/configuracion
```

### Owner (`ROUTES.owner.*`)
```typescript
/owner/dashboard
/owner/spaces
/admin-spaces
/host-space
```

### Cliente
```typescript
/profile
/bookings
/favoritos
```

---

## 🚀 Ventajas de esta Arquitectura

### 1. **Separación de Responsabilidades**
- Cada componente gestiona la navegación de un rol específico
- Fácil de extender con nuevos roles (ej: `CONTROLADOR`)

### 2. **Mantenibilidad**
- Cambios en navegación de un rol no afectan otros
- Código más legible y organizado

### 3. **Escalabilidad**
- Agregar nuevas pestañas solo requiere editar el componente correspondiente
- No es necesario modificar `Header.tsx`

### 4. **Consistencia Visual**
- Esquema de colores unificado por rol
- Estructura de menú predecible

### 5. **Testing**
- Componentes pequeños y testeables unitariamente
- Fácil crear pruebas por rol

---

## 📦 Props de los Componentes

### AdminNavItems / OwnerNavItems
```typescript
interface NavItemsProps {
  onItemClick: () => void; // Callback para cerrar menú en mobile
}
```

### ClientNavItems
```typescript
interface ClientNavItemsProps {
  onItemClick: () => void;   // Callback para cerrar menú
  isDuenio: boolean;         // Para ocultar "Ofrece tu espacio"
}
```

---

## 🔧 Cómo Agregar Nuevas Opciones

### Para ADMIN:
1. Abrir `src/modules/core/navigation/AdminNavItems.tsx`
2. Agregar nuevo `<Link>` con ícono y ruta
3. Si es tab principal, actualizar también `AdminTabBar.tsx`

**Ejemplo:**
```tsx
<Link
  to={ROUTES.admin.configuracion}
  className="flex items-center gap-2 px-4 py-2.5 text-sm..."
  onClick={onItemClick}
>
  <Settings className="h-4 w-4" />
  Nueva Opción
</Link>
```

### Para DUEÑO:
Similar a ADMIN, editar `OwnerNavItems.tsx`

### Para CLIENTE:
Editar `ClientNavItems.tsx` (considerar si aplica a todos los roles)

---

## 🎯 Próximos Pasos Sugeridos

1. **Crear `ControllerNavItems.tsx`**
   - Para usuarios con rol `CONTROLADOR`
   - Opciones: Escanear QR, Ver registros, etc.

2. **Implementar permisos granulares**
   - Usar array de permisos en lugar de solo roles
   - Ejemplo: `hasPermission('users.edit')`

3. **Agregar badges de notificaciones**
   - Mostrar contador en "Verificaciones" si hay pendientes
   - Notificaciones en "Reportes"

4. **Modo oscuro**
   - Adaptar colores de navegación a dark mode
   - Usar variables CSS personalizadas

5. **Analytics de navegación**
   - Tracking de clicks en opciones del menú
   - Identificar funciones más usadas por rol

---

## 🐛 Consideraciones y Notas

- **Orden de renderizado**: `ClientNavItems` → `OwnerNavItems` → `AdminNavItems`
  - Esto asegura que opciones comunes aparezcan primero
  
- **Mobile first**: Todos los componentes usan `onItemClick` para cerrar menú en mobile

- **AdminTabBar** se renderiza **fuera del dropdown**, directamente en el header
  - Solo visible en rutas `/admin/*` cuando el usuario es admin

- **Iconos consistentes**: Se usa `lucide-react` en todos los componentes

---

## 📚 Referencias

- **Rutas**: `src/config/routes.ts`
- **Auth Context**: `src/modules/auth/hooks/useAuth.ts`
- **Header Original**: `src/components/Header.tsx`
- **Admin Panel Layout**: `src/modules/admin-panel/layout/AdminLayout.tsx`

---

## ✅ Checklist de Implementación

- [x] Crear `AdminNavItems.tsx`
- [x] Crear `OwnerNavItems.tsx`
- [x] Crear `ClientNavItems.tsx`
- [x] Crear `AdminTabBar.tsx`
- [x] Refactorizar `Header.tsx`
- [x] Exportar componentes en `index.ts`
- [x] Verificar path aliases en `tsconfig.app.json`
- [x] Documentar arquitectura
- [ ] Testing unitario de componentes
- [ ] Testing de integración con roles
- [ ] Agregar navegación para rol CONTROLADOR

---

**Autor**: Sistema de Navegación Modular v1.0  
**Fecha**: Implementación basada en arquitectura de roles de ROGÜ
