# 🗺️ Diagramas de Arquitectura: Navegación Modular

## 1️⃣ Flujo de Renderizado de Navegación

```mermaid
graph TD
    A[Header.tsx] --> B{Usuario autenticado?}
    B -->|No| C[Mostrar Login/Signup]
    B -->|Sí| D[Renderizar user info]
    
    D --> E[ClientNavItems]
    E --> F[Mi perfil]
    E --> G[Mis reservas]
    E --> H[Mis favoritos]
    E --> I{Es dueño?}
    I -->|No| J[Ofrece tu espacio]
    
    D --> K{Roles incluyen DUENIO?}
    K -->|Sí| L[OwnerNavItems]
    L --> M[Mis Espacios]
    L --> N[Gestión Sedes]
    L --> O[Reservas]
    L --> P[Analytics]
    
    D --> Q{Roles incluyen ADMIN?}
    Q -->|Sí| R[AdminNavItems]
    R --> S[Dashboard]
    R --> T[Usuarios]
    R --> U[Sedes]
    R --> V[Verificaciones]
    
    Q -->|Sí| W[AdminTabBar]
    W --> X[Tabs Horizontales]
```

---

## 2️⃣ Jerarquía de Componentes

```mermaid
graph LR
    A[Header] --> B[Logo]
    A --> C[SearchBar]
    A --> D[UserMenu Dropdown]
    A --> E[AdminTabBar]
    
    D --> F[UserInfo]
    D --> G[ClientNavItems]
    D --> H[OwnerNavItems]
    D --> I[AdminNavItems]
    D --> J[LogoutButton]
    
    E --> K[Dashboard Tab]
    E --> L[Usuarios Tab]
    E --> M[Sedes Tab]
    E --> N[Verificaciones Tab]
    
    style A fill:#e1f5ff
    style D fill:#fff4e6
    style E fill:#f3e8ff
    style G fill:#f0f0f0
    style H fill:#d4edda
    style I fill:#e8d4f8
```

---

## 3️⃣ Modelo de Datos: Navegación por Rol

```mermaid
classDiagram
    class NavItem {
        +string label
        +string route
        +Icon icon
        +onClick() void
    }
    
    class ClientNavItems {
        +NavItem[] items
        +boolean isDuenio
        +onItemClick() void
        +render()
    }
    
    class OwnerNavItems {
        +NavItem[] items
        +onItemClick() void
        +render()
    }
    
    class AdminNavItems {
        +NavItem[] items
        +onItemClick() void
        +render()
    }
    
    class AdminTabBar {
        +AdminTab[] tabs
        +string currentPath
        +render()
    }
    
    NavItem <|-- ClientNavItems
    NavItem <|-- OwnerNavItems
    NavItem <|-- AdminNavItems
    AdminTabBar --> NavItem
```

---

## 4️⃣ Estado de Renderizado por Rol

```mermaid
stateDiagram-v2
    [*] --> Authenticated
    Authenticated --> Cliente
    Authenticated --> Duenio
    Authenticated --> Admin
    
    Cliente --> ClientNav: Siempre
    Cliente --> OfrecerEspacio: Si NO es dueño
    
    Duenio --> ClientNav: Siempre
    Duenio --> OwnerNav: Adicional
    
    Admin --> ClientNav: Siempre
    Admin --> AdminNav: Adicional
    Admin --> AdminTabBar: Adicional
    
    state ClientNav {
        [*] --> Perfil
        [*] --> Reservas
        [*] --> Favoritos
    }
    
    state OwnerNav {
        [*] --> MisEspacios
        [*] --> GestionSedes
        [*] --> Analytics
    }
    
    state AdminNav {
        [*] --> Dashboard
        [*] --> Usuarios
        [*] --> Sedes
        [*] --> Verificaciones
    }
```

---

## 5️⃣ Flujo de Navegación Admin

```mermaid
journey
    title Experiencia de Usuario ADMIN
    section Login
      Ingresar credenciales: 5: Admin
      Autenticarse: 5: Sistema
    section Header
      Ver AdminTabBar: 5: Admin
      Hacer click en "Usuarios": 5: Admin
    section Gestión
      Ver lista de usuarios: 5: Admin
      Filtrar por rol: 4: Admin
      Editar usuario: 5: Admin
    section Navegación
      Click en tab "Sedes": 5: Admin
      Ver sedes pendientes: 4: Admin
      Verificar sede: 5: Admin
```

---

## 6️⃣ Arquitectura de Carpetas

```mermaid
graph TD
    A[src/] --> B[components/]
    A --> C[modules/]
    
    B --> D[Header.tsx]
    
    C --> E[core/]
    C --> F[admin-panel/]
    C --> G[auth/]
    
    E --> H[navigation/]
    H --> I[AdminNavItems.tsx]
    H --> J[OwnerNavItems.tsx]
    H --> K[ClientNavItems.tsx]
    H --> L[AdminTabBar.tsx]
    H --> M[index.ts]
    
    F --> N[dashboard/]
    F --> O[usuarios/]
    F --> P[sedes/]
    
    style H fill:#f3e8ff
    style I fill:#e8d4f8
    style J fill:#d4edda
    style K fill:#f0f0f0
    style L fill:#e8d4f8
```

---

## 7️⃣ Relación Componente-Ruta

```mermaid
graph LR
    A[AdminNavItems] --> B[/admin/dashboard]
    A --> C[/admin/usuarios]
    A --> D[/admin/sedes]
    A --> E[/admin/verificaciones]
    
    F[OwnerNavItems] --> G[/owner/spaces]
    F --> H[/admin-spaces]
    F --> I[/owner/analytics]
    
    J[ClientNavItems] --> K[/profile]
    J --> L[/bookings]
    J --> M[/favoritos]
    J --> N[/host-space]
    
    O[AdminTabBar] --> B
    O --> C
    O --> D
    O --> E
    O --> P[/admin/reportes]
    O --> Q[/admin/analytics]
    
    style A fill:#e8d4f8
    style F fill:#d4edda
    style J fill:#f0f0f0
    style O fill:#f3e8ff
```

---

## 8️⃣ Decisiones de Renderizado Condicional

```mermaid
flowchart TD
    Start([Usuario autenticado]) --> CheckClient{Renderizar ClientNav}
    CheckClient -->|Siempre| ClientNav[✅ ClientNavItems]
    
    CheckClient --> CheckOwner{user.roles.includes DUENIO?}
    CheckOwner -->|Sí| OwnerNav[✅ OwnerNavItems]
    CheckOwner -->|No| SkipOwner[❌ Omitir OwnerNav]
    
    CheckOwner --> CheckAdmin{user.roles.includes ADMIN?}
    CheckAdmin -->|Sí| AdminNav[✅ AdminNavItems]
    CheckAdmin -->|No| SkipAdmin[❌ Omitir AdminNav]
    
    AdminNav --> RenderTabBar[✅ AdminTabBar]
    SkipAdmin --> End([Fin])
    RenderTabBar --> End
    
    style ClientNav fill:#f0f0f0
    style OwnerNav fill:#d4edda
    style AdminNav fill:#e8d4f8
    style RenderTabBar fill:#f3e8ff
```

---

## 9️⃣ Secuencia de Click en Navegación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant H as Header
    participant D as Dropdown
    participant A as AdminNavItems
    participant R as Router
    participant P as Page
    
    U->>H: Click en UserMenu
    H->>D: Toggle dropdown
    D-->>U: Mostrar menú
    
    U->>D: Click en "Gestión de Usuarios"
    D->>A: onItemClick()
    A->>D: Cerrar dropdown
    A->>R: navigate('/admin/usuarios')
    R->>P: Cargar UsuariosListPage
    P-->>U: Mostrar página
```

---

## 🔟 Matriz de Visibilidad de Navegación

| Componente | CLIENTE | DUEÑO | ADMIN | Notas |
|------------|---------|-------|-------|-------|
| **ClientNavItems** | ✅ | ✅ | ✅ | Siempre visible |
| Mi perfil | ✅ | ✅ | ✅ | - |
| Mis reservas | ✅ | ✅ | ✅ | - |
| Mis favoritos | ✅ | ✅ | ✅ | - |
| Ofrece tu espacio | ✅ | ❌ | ✅ | Si NO es dueño |
| **OwnerNavItems** | ❌ | ✅ | ❌ | Solo dueños |
| Mis Espacios | ❌ | ✅ | ❌ | - |
| Gestión Sedes | ❌ | ✅ | ❌ | - |
| Analytics | ❌ | ✅ | ❌ | - |
| **AdminNavItems** | ❌ | ❌ | ✅ | Solo admins |
| Dashboard | ❌ | ❌ | ✅ | - |
| Usuarios | ❌ | ❌ | ✅ | - |
| Verificaciones | ❌ | ❌ | ✅ | - |
| **AdminTabBar** | ❌ | ❌ | ✅ | Fuera dropdown |

---

## 📊 Estadísticas de Implementación

```mermaid
pie title "Distribución de Opciones de Navegación"
    "ClientNav (común)" : 4
    "OwnerNav (dueño)" : 5
    "AdminNav (admin)" : 7
    "AdminTabBar (admin)" : 6
```

---

## 🎨 Esquema de Colores

```mermaid
graph LR
    A[Cliente] -->|gray-50| B[Navegación Base]
    C[Dueño] -->|green-50| D[Panel Gestión]
    E[Admin] -->|purple-50| F[Panel Admin]
    E -->|purple-600| G[Tabs Activos]
    
    style B fill:#f0f0f0,stroke:#6b7280
    style D fill:#d4edda,stroke:#22c55e
    style F fill:#e8d4f8,stroke:#a855f7
    style G fill:#c084fc,stroke:#7e22ce
```

---

## 🔄 Ciclo de Vida del Componente

```mermaid
stateDiagram-v2
    [*] --> Mount: Header monta
    Mount --> CheckAuth: Verificar usuario
    CheckAuth --> Authenticated: isLoggedIn = true
    CheckAuth --> Unauthenticated: isLoggedIn = false
    
    Authenticated --> RenderClient: Renderizar ClientNav
    RenderClient --> CheckRoles: Evaluar roles
    
    CheckRoles --> RenderOwner: Si DUENIO
    CheckRoles --> RenderAdmin: Si ADMIN
    CheckRoles --> Complete: Fin renderizado
    
    RenderOwner --> CheckRoles2: Continuar
    CheckRoles2 --> RenderAdmin: Si también ADMIN
    CheckRoles2 --> Complete
    
    RenderAdmin --> RenderTabBar: Renderizar AdminTabBar
    RenderTabBar --> Complete
    
    Complete --> [*]
    Unauthenticated --> [*]
```

---

**Nota**: Estos diagramas se pueden visualizar correctamente en editores compatibles con Mermaid como VS Code (con extensión) o en GitHub/GitLab.
