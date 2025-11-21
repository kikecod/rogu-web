# 📦 **Guía de Estructura y Organización para un Módulo Admin (Frontend)**
### _(Recomendaciones completas para un panel administrativo profesional)_

## 🏗️ 1. Objetivo
Este documento describe una arquitectura clara, modular, escalable y profesional para un **módulo administrativo ("Admin")** en un frontend moderno (React / Next.js / Vite).
Incluye:

- Árbol de carpetas recomendado  
- Organización por “dominios” dentro del admin  
- Manejo de servicios API  
- Layout del administrador  
- Routing modular  
- Ejemplo de componentes y hooks  

---

## 📁 2. Estructura de carpetas recomendada
Si tu proyecto solo trabajará en el módulo **Admin** por ahora, esta es la estructura ideal:

```
src/
 ├─ components/        # UI global reutilizable
 ├─ config/
 ├─ types/             # Tipos globales opcionales
 └─ modules/
     └─ admin/
         ├─ layout/
         │   ├─ AdminLayout.tsx
         │   ├─ Sidebar.tsx
         │   ├─ Navbar.tsx
         │   └─ index.ts
         │
         ├─ routing/
         │   └─ admin.routes.tsx
         │
         ├─ dashboard/
         │   ├─ pages/
         │   ├─ components/
         │   └─ hooks/
         │
         ├─ canchas/
         │   ├─ pages/
         │   ├─ components/
         │   ├─ hooks/
         │   ├─ services/
         │   │   └─ canchas.service.ts
         │   └─ types/
         │
         ├─ reservas/
         ├─ pagos/
         ├─ personas/
         ├─ disciplinas/
         │
         └─ lib/        # Helpers específicos del admin
```

---

## 🎯 3. Por qué esta estructura es ideal

### ✔ Modular por dominio
Cada módulo vive en su propia carpeta:

```
admin/canchas/*
admin/reservas/*
admin/pagos/*
```

Esto hace el proyecto **fácil de entender**, **escalable** y **limpio**.

### ✔ Escalable sin volverse un desastre
Cuando agregues más features:

- Reportes  
- Seguridad y roles  
- Inventario  
- Logística  
- Dashboard avanzado  

Solo creas nuevos módulos sin romper nada.

---

## 📦 4. Layout del Admin (muy importante)

El layout debe contener:

- Sidebar  
- Navbar  
- Contenedor de contenido  

### Ejemplo de archivos:

```
admin/layout/
  AdminLayout.tsx
  Sidebar.tsx
  Navbar.tsx
```

### Ejemplo rápido:

```tsx
export const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="content">
        <Navbar />
        <main>{children}</main>
      </div>
    </div>
  );
};
```

---

## 🔀 5. Routing modular para el Admin

```
admin/routing/admin.routes.tsx
```

Ejemplo:

```tsx
import { DashboardPage } from "../dashboard/pages/DashboardPage";
import { CanchasPage } from "../canchas/pages/CanchasPage";

export const adminRoutes = [
  { path: "/admin/dashboard", element: <DashboardPage /> },
  { path: "/admin/canchas", element: <CanchasPage /> },
];
```

Luego lo importas en el router general.

---

## 🌐 6. Servicios API por módulo

Recomendación: **1 servicio por dominio**, ej.:

```
admin/canchas/services/canchas.service.ts
```

Ejemplo:

```ts
import { api } from "@/config/api";

export const canchasService = {
  getAll: () => api.get("/canchas"),
  create: (data) => api.post("/canchas", data),
  update: (id, data) => api.put(`/canchas/${id}`, data),
  delete: (id) => api.delete(`/canchas/${id}`)
};
```

---

## 🧩 7. Hooks por módulo

```
admin/canchas/hooks/useCanchas.ts
```

Ejemplo:

```ts
export const useCanchas = () => {
  const [canchas, setCanchas] = useState([]);

  const load = async () => {
    const { data } = await canchasService.getAll();
    setCanchas(data);
  };

  return { canchas, load };
};
```

---

## 🎨 8. Componentes por módulo

```
admin/canchas/components/CanchaCard.tsx
```

La idea es separar:

- listados  
- tablas  
- cards  
- formularios  

---

## 📊 9. Dashboard del Admin

El dashboard puede incluir:

- Tarjetas de KPIs  
- Ingresos diarios  
- Reservas del día  
- Ocupación  
- Nuevos usuarios  

Puedes organizarlo así:

```
admin/dashboard/
  pages/DashboardPage.tsx
  components/KpiCard.tsx
  hooks/useDashboard.ts
```

---

## 🔧 10. Librerías recomendadas para Admin

- UI: TailwindCSS, Material UI o ShadcnUI  
- Fetch/API: Axios  
- Forms: React Hook Form  
- Icons: Lucide  
- Routing: React Router v6 o el router de Next.js  

---

## 🏆 11. Conclusiones

- Tu estructura actual es *buena*, pero este enfoque modular por dominio es **más profesional**.  
- Escala sin romper la organización.  
- Facilita mantener servicios, páginas, hooks y componentes por módulo.  
- El admin se vuelve un sistema real, no un caos de carpetas.
