# 🧑‍💻 Guía de Uso: Sistema de Navegación Modular

## 📚 Para Desarrolladores

Esta guía muestra cómo usar y extender el sistema de navegación modular implementado.

---

## 1️⃣ Agregar Nueva Opción de Navegación

### Para ADMIN

**Escenario**: Quieres agregar "Gestión de Promociones" al menú admin.

**Paso 1**: Agregar la ruta en `src/config/routes.ts`
```typescript
export const ROUTES = {
  admin: {
    dashboard: '/admin/dashboard',
    usuarios: '/admin/usuarios',
    // ... otras rutas
    promociones: '/admin/promociones', // 👈 Nueva ruta
  },
}
```

**Paso 2**: Editar `src/modules/core/navigation/AdminNavItems.tsx`
```tsx
import { Tag } from 'lucide-react'; // Importar ícono

export const AdminNavItems = ({ onItemClick }: AdminNavItemsProps) => {
  return (
    <>
      {/* ... opciones existentes ... */}
      
      <Link
        to={ROUTES.admin.promociones}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        onClick={onItemClick}
      >
        <Tag className="h-4 w-4" />
        Promociones
      </Link>
    </>
  );
};
```

**Paso 3** (Opcional): Si quieres que aparezca en AdminTabBar
```tsx
// En AdminTabBar.tsx
const adminTabs: AdminTab[] = [
  // ... tabs existentes
  {
    label: 'Promociones',
    route: ROUTES.admin.promociones,
    icon: Tag,
  },
];
```

---

### Para DUEÑO

**Escenario**: Agregar "Gestión de Horarios".

**Editar**: `src/modules/core/navigation/OwnerNavItems.tsx`
```tsx
import { Clock } from 'lucide-react';

<Link
  to={ROUTES.owner.horarios}
  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
  onClick={onItemClick}
>
  <Clock className="h-4 w-4" />
  Horarios
</Link>
```

---

### Para CLIENTE

**Escenario**: Agregar "Historial de Pagos".

**Editar**: `src/modules/core/navigation/ClientNavItems.tsx`
```tsx
import { CreditCard } from 'lucide-react';

<Link
  to={ROUTES.pagos}
  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
  onClick={onItemClick}
>
  <CreditCard className="h-4 w-4" />
  Mis Pagos
</Link>
```

---

## 2️⃣ Crear Nuevo Rol de Navegación

**Escenario**: Implementar navegación para rol `CONTROLADOR`.

**Paso 1**: Crear componente `ControllerNavItems.tsx`
```tsx
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { QrCode, ClipboardCheck, History } from 'lucide-react';

interface ControllerNavItemsProps {
  onItemClick: () => void;
}

export const ControllerNavItems = ({ onItemClick }: ControllerNavItemsProps) => {
  return (
    <>
      <div className="px-4 py-2 border-t border-b border-gray-200 bg-blue-50">
        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
          Panel de Controlador
        </p>
      </div>
      
      <Link
        to={ROUTES.controller.scan}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        onClick={onItemClick}
      >
        <QrCode className="h-4 w-4" />
        Escanear QR
      </Link>

      <Link
        to={ROUTES.controller.verificaciones}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        onClick={onItemClick}
      >
        <ClipboardCheck className="h-4 w-4" />
        Verificaciones
      </Link>

      <Link
        to={ROUTES.controller.historial}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        onClick={onItemClick}
      >
        <History className="h-4 w-4" />
        Historial
      </Link>
    </>
  );
};
```

**Paso 2**: Exportar en `index.ts`
```tsx
export { ControllerNavItems } from './ControllerNavItems';
```

**Paso 3**: Usar en `Header.tsx`
```tsx
import { ControllerNavItems } from '@/core/navigation/ControllerNavItems';

{/* Navegación de Controlador */}
{user?.roles && user.roles.includes('CONTROLADOR') && (
  <ControllerNavItems onItemClick={() => setIsMenuOpen(false)} />
)}
```

---

## 3️⃣ Agregar Badge de Notificaciones

**Escenario**: Mostrar contador de verificaciones pendientes en AdminNavItems.

**Paso 1**: Pasar prop con el contador
```tsx
// En Header.tsx
import { useVerificacionesPendientes } from '@/admin-panel/verificaciones/hooks';

const { count: pendientesCount } = useVerificacionesPendientes();

<AdminNavItems 
  onItemClick={() => setIsMenuOpen(false)}
  pendientesCount={pendientesCount} 
/>
```

**Paso 2**: Actualizar interfaz de AdminNavItems
```tsx
interface AdminNavItemsProps {
  onItemClick: () => void;
  pendientesCount?: number;
}

export const AdminNavItems = ({ onItemClick, pendientesCount = 0 }: AdminNavItemsProps) => {
  return (
    <>
      <Link
        to={ROUTES.admin.verificaciones}
        className="flex items-center justify-between px-4 py-2.5..."
        onClick={onItemClick}
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Verificaciones
        </div>
        {pendientesCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {pendientesCount}
          </span>
        )}
      </Link>
    </>
  );
};
```

---

## 4️⃣ Navegación Condicional Avanzada

**Escenario**: Mostrar "Configuración Avanzada" solo si el admin tiene permiso especial.

```tsx
interface AdminNavItemsProps {
  onItemClick: () => void;
  permissions?: string[];
}

export const AdminNavItems = ({ onItemClick, permissions = [] }: AdminNavItemsProps) => {
  const hasAdvancedConfig = permissions.includes('admin.config.advanced');
  
  return (
    <>
      {/* ... otras opciones ... */}
      
      {hasAdvancedConfig && (
        <Link
          to={ROUTES.admin.configuracionAvanzada}
          className="flex items-center gap-2 px-4 py-2.5..."
          onClick={onItemClick}
        >
          <Settings className="h-4 w-4" />
          Configuración Avanzada
        </Link>
      )}
    </>
  );
};
```

---

## 5️⃣ Personalizar AdminTabBar

### Cambiar Tabs Visibles

**Editar**: `src/modules/core/navigation/AdminTabBar.tsx`
```tsx
const adminTabs: AdminTab[] = [
  {
    label: 'Dashboard',
    route: ROUTES.admin.dashboard,
    icon: LayoutDashboard,
  },
  // Comentar para ocultar
  // {
  //   label: 'Reportes',
  //   route: ROUTES.admin.reportes,
  //   icon: FileText,
  // },
];
```

### Agregar Subtabs (Dropdown)

```tsx
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export const AdminTabBar = () => {
  const [showGestionDropdown, setShowGestionDropdown] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowGestionDropdown(!showGestionDropdown)}
        className="flex items-center gap-1 px-4 py-3..."
      >
        <Settings className="h-4 w-4" />
        Gestión
        <ChevronDown className="h-3 w-3" />
      </button>
      
      {showGestionDropdown && (
        <div className="absolute top-full left-0 bg-white shadow-lg...">
          <Link to={ROUTES.admin.usuarios}>Usuarios</Link>
          <Link to={ROUTES.admin.sedes}>Sedes</Link>
        </div>
      )}
    </div>
  );
};
```

---

## 6️⃣ Testing

### Test de ClientNavItems

```tsx
// ClientNavItems.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClientNavItems } from '../ClientNavItems';

describe('ClientNavItems', () => {
  it('renders all client navigation items', () => {
    const onItemClick = jest.fn();
    
    render(
      <BrowserRouter>
        <ClientNavItems onItemClick={onItemClick} isDuenio={false} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Mi perfil')).toBeInTheDocument();
    expect(screen.getByText('Mis reservas')).toBeInTheDocument();
    expect(screen.getByText('Mis favoritos')).toBeInTheDocument();
    expect(screen.getByText('Ofrece tu espacio')).toBeInTheDocument();
  });
  
  it('hides "Ofrece tu espacio" for dueños', () => {
    const onItemClick = jest.fn();
    
    render(
      <BrowserRouter>
        <ClientNavItems onItemClick={onItemClick} isDuenio={true} />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Ofrece tu espacio')).not.toBeInTheDocument();
  });
  
  it('calls onItemClick when link is clicked', () => {
    const onItemClick = jest.fn();
    
    render(
      <BrowserRouter>
        <ClientNavItems onItemClick={onItemClick} isDuenio={false} />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Mi perfil'));
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 7️⃣ Integración con useAuth

### Uso en componentes personalizados

```tsx
import { useAuth } from '@/auth/hooks/useAuth';
import { AdminNavItems, OwnerNavItems, ClientNavItems } from '@/core/navigation';

export const CustomSidebar = () => {
  const { user, isLoggedIn, isDuenio } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!isLoggedIn) return null;
  
  return (
    <aside className="w-64 bg-white shadow-lg">
      <ClientNavItems 
        onItemClick={() => setIsOpen(false)}
        isDuenio={isDuenio()}
      />
      
      {user?.roles?.includes('ADMIN') && (
        <AdminNavItems onItemClick={() => setIsOpen(false)} />
      )}
    </aside>
  );
};
```

---

## 8️⃣ Modo Oscuro

### Adaptar componentes para dark mode

```tsx
// AdminNavItems.tsx
export const AdminNavItems = ({ onItemClick }: AdminNavItemsProps) => {
  return (
    <>
      <div className="px-4 py-2 border-t border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900">
        <p className="text-xs font-semibold text-purple-800 dark:text-purple-200 uppercase tracking-wide">
          Panel de Administrador
        </p>
      </div>
      
      <Link
        to={ROUTES.admin.dashboard}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        onClick={onItemClick}
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>
    </>
  );
};
```

---

## 9️⃣ Shortcuts de Teclado

### Agregar atajos a AdminTabBar

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminTabBar = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch(e.key) {
          case '1':
            navigate(ROUTES.admin.dashboard);
            break;
          case '2':
            navigate(ROUTES.admin.usuarios);
            break;
          case '3':
            navigate(ROUTES.admin.sedes);
            break;
          // ... más atajos
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
  
  // ... resto del componente
};
```

---

## 🔟 Internacionalización (i18n)

### Preparar navegación para múltiples idiomas

```tsx
// i18n/es.json
{
  "nav": {
    "admin": {
      "dashboard": "Dashboard",
      "users": "Gestión de Usuarios",
      "venues": "Gestión de Sedes"
    }
  }
}

// AdminNavItems.tsx
import { useTranslation } from 'react-i18next';

export const AdminNavItems = ({ onItemClick }: AdminNavItemsProps) => {
  const { t } = useTranslation();
  
  return (
    <>
      <Link to={ROUTES.admin.dashboard} onClick={onItemClick}>
        <LayoutDashboard className="h-4 w-4" />
        {t('nav.admin.dashboard')}
      </Link>
    </>
  );
};
```

---

## 🎯 Ejemplos Completos

### Ejemplo 1: Sidebar Completo con Navegación Modular

```tsx
// components/Sidebar.tsx
import { useState } from 'react';
import { useAuth } from '@/auth/hooks/useAuth';
import { AdminNavItems, OwnerNavItems, ClientNavItems } from '@/core/navigation';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, isLoggedIn, isDuenio } = useAuth();
  
  if (!isLoggedIn) return null;
  
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">Navegación</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="overflow-y-auto h-[calc(100%-60px)]">
          <ClientNavItems 
            onItemClick={onClose}
            isDuenio={isDuenio()}
          />
          
          {user?.roles?.includes('DUENIO') && (
            <OwnerNavItems onItemClick={onClose} />
          )}
          
          {user?.roles?.includes('ADMIN') && (
            <AdminNavItems onItemClick={onClose} />
          )}
        </nav>
      </aside>
    </>
  );
};
```

### Ejemplo 2: Breadcrumbs Dinámicos

```tsx
// components/Breadcrumbs.tsx
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/config/routes';

const breadcrumbLabels: Record<string, string> = {
  '/admin': 'Admin',
  '/admin/dashboard': 'Dashboard',
  '/admin/usuarios': 'Usuarios',
  '/admin/sedes': 'Sedes',
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link to="/" className="text-gray-500 hover:text-gray-700">
        Inicio
      </Link>
      
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const label = breadcrumbLabels[path] || segment;
        const isLast = index === pathSegments.length - 1;
        
        return (
          <div key={path} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{label}</span>
            ) : (
              <Link to={path} className="text-gray-500 hover:text-gray-700">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
```

---

## 📝 Notas Finales

### Mejores Prácticas

1. **Siempre usar `onItemClick`** para cerrar menús en mobile
2. **Mantener consistencia de colores** según el rol
3. **Usar íconos de lucide-react** para uniformidad
4. **No hardcodear rutas**, usar `ROUTES` de `routes.ts`
5. **Testear en mobile** antes de deployar

### Recursos Adicionales

- [Lucide Icons](https://lucide.dev/)
- [React Router Docs](https://reactrouter.com/)
- [TailwindCSS Docs](https://tailwindcss.com/)

---

**Happy Coding!** 🚀
