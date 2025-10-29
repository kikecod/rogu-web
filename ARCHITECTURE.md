# ROGU Frontend - Screaming Architecture

## 🏗️ Visión General

Este proyecto implementa **Screaming Architecture** - una arquitectura que hace que el propósito del sistema sea evidente al primer vistazo. La estructura de carpetas refleja las características del negocio (features), no los frameworks o tecnologías utilizadas.

## 📁 Estructura de Módulos

```
src/modules/
├── core/           # Shared contracts, configuration, utilities
├── auth/           # Authentication and authorization
├── bookings/       # Reservations and booking management
├── fields/         # Sports fields (canchas) management
├── venues/         # Venues (sedes) management
├── user-profile/   # User profile with multi-role system
├── search/         # Search and filtering features
└── admin/          # Administrative functions
```

### Anatomía de un Módulo

Cada módulo sigue una estructura estándar:

```
<module-name>/
├── components/        # React components specific to this module
├── pages/            # Page-level components (routes)
├── hooks/            # Custom React hooks
├── services/         # Business logic and API calls
├── types/            # TypeScript type definitions
├── states/           # State management (Context API, providers)
├── lib/              # Helper functions and utilities
├── contracts/        # Interfaces and ports (core only)
├── routing/          # Route components (core only)
└── config/           # Configuration files (core only)
```

## 🔌 Módulo CORE

**Propósito**: Proveer contratos, configuraciones y utilidades compartidas por todos los módulos.

### Contratos y Ports

Los **ports** son interfaces que definen contratos sin implementación:

- `AuthPort`: Contrato de autenticación (login, logout, getUser, etc.)
- `StoragePort`: Contrato de almacenamiento (save, load, remove)
- `BookingRepo`: Contrato de repositorio de reservas

**Beneficio**: Permite cambiar implementaciones sin afectar el resto del código.

### Configuración

- `api.ts`: Base URL del backend, configuración de Axios

### Helpers y Formatters

- `helpers.ts`: Funciones de utilidad (formatDate, getSportFieldImages, etc.)
- `formatters.ts`: Funciones de formateo de datos

### Routing

- `ProtectedRoute.tsx`: Componente de protección de rutas con control de roles

## 🔐 Módulo AUTH

**Propósito**: Gestionar autenticación, autorización y roles de usuario.

### Componentes principales

- `AuthProvider.tsx`: Context provider con estado de autenticación
- `AuthModal.tsx`: Modal de login/registro
- `useAuth.ts`: Hook para acceder al contexto de autenticación

### Sistema de Roles

Definido en `roles.ts`:

```typescript
export type AppRole = 'CLIENTE' | 'DUENIO' | 'CONTROLADOR' | 'ADMIN';
```

**Multi-rol**: Un usuario puede tener múltiples roles simultáneamente.

### Types

- `auth.types.ts`: AuthState, LoginRequest, RegisterRequest, Usuario, Persona, etc.

## 📅 Módulo BOOKINGS

**Propósito**: Gestión de reservas (creación, edición, cancelación, visualización).

### Páginas

- `MyBookingsPage.tsx`: Vista de "Mis Reservas"
- `CheckoutPage.tsx`: Proceso de pago y confirmación
- `BookingConfirmationPage.tsx`: Confirmación de reserva exitosa

### Componentes

- `EditBookingModal.tsx`: Modal para editar reservas
- `CancelBookingModal.tsx`: Modal para cancelar reservas
- `CustomCalendar.tsx`: Calendario personalizado para selección de fechas

### Types

- `booking.types.ts`: ApiReservaUsuario, CreateReservaRequest, etc.

## 🏟️ Módulo FIELDS

**Propósito**: Gestión de canchas deportivas (visualización, creación, edición, gestión de disponibilidad).

### Páginas

- `FieldDetailPage.tsx`: Detalle de una cancha específica

### Componentes

- `FieldCard.tsx`: Card de cancha
- `FieldManagement.tsx`: Panel de gestión de canchas
- `PhotoManagement.tsx`: Gestión de fotos de canchas
- `ReservationManagement.tsx`: Gestión de horarios y reservas
- `FieldCarousel.tsx`: Carrusel de canchas
- `FieldCarouselCard.tsx`: Card para el carrusel

### Types

- `field.types.ts`: SportField, ApiCancha, ApiCanchaDetalle, TimeSlot, Review, CreateCanchaRequest, etc.

**Tipos importantes**:
- `SportField`: Modelo de cancha para el frontend
- `ApiCancha`: Respuesta de la API GET /canchas
- `ApiCanchaDetalle`: Respuesta de la API GET /canchas/:id
- `TimeSlot`: Slot de tiempo con disponibilidad
- `Review`: Reseña de cancha

## 🏢 Módulo VENUES

**Propósito**: Gestión de sedes (lugares físicos que contienen canchas).

### Páginas

- `VenueDetailPage.tsx`: Detalle de una sede

### Componentes

- `VenueManagement.tsx`: Panel de gestión de sedes

### Types

- `venue.types.ts`: ApiSede, Venue, CreateSedeRequest, UpdateSedeRequest

## 👤 Módulo USER-PROFILE

**Propósito**: Sistema de perfiles de usuario con variantes según roles.

### Páginas

- `ProfilePage.tsx`: Página principal de perfil

### Componentes

**Base Layout**:
- `ProfileBaseLayout.tsx`: Layout común para todos los perfiles

**Variantes de Perfil** (según roles):
- `Profile.Admin.tsx`
- `Profile.Cliente.tsx`
- `Profile.ClienteControlador.tsx`
- `Profile.ClienteDuenio.tsx`
- `Profile.ClienteDuenioControlador.tsx`
- `Profile.Generic.tsx`

**Secciones**:
- `ProfileAccountSettings.tsx`: Configuración de cuenta
- `ProfileAdminSection.tsx`: Sección administrativa
- `ProfileClienteSection.tsx`: Sección de cliente
- `ProfileControladorSection.tsx`: Sección de controlador
- `ProfileDuenioSection.tsx`: Sección de dueño

### Hooks

- `useUserProfile.ts`: Hook para obtener datos de perfil

### Configuración

- `profileVariants.ts`: Mapeo de roles a componentes de perfil

### Types

- `profile.types.ts`: UserProfileData, PersonaProfile, UsuarioProfile, ClienteProfile, DuenioProfile, ControladorProfile

## 🔍 Módulo SEARCH

**Propósito**: Búsqueda y filtrado de canchas.

### Páginas

- `HomePage.tsx`: Página principal con búsqueda

### Componentes

- `Filters.tsx`: Panel de filtros (deporte, ubicación, precio, horario)

## ⚙️ Módulo ADMIN

**Propósito**: Funcionalidades administrativas del sistema.

### Páginas

- `AdminSpacesPage.tsx`: Gestión de espacios (sedes y canchas)
- `HostSpacePage.tsx`: Página para hosts/dueños

### Componentes

- `StatsSection.tsx`: Sección de estadísticas

## 📦 Componentes Compartidos

Fuera de los módulos, en `src/components/`:

- `Header.tsx`: Header global de la aplicación
- `Footer.tsx`: Footer global
- `PopularSports.tsx`: Sección de deportes populares

**Regla**: Solo componentes que son verdaderamente globales y usados en múltiples módulos deben estar aquí.

## 🎯 Path Aliases

Configurados en `tsconfig.app.json` y `vite.config.ts`:

```typescript
'@/core': './src/modules/core'
'@/auth': './src/modules/auth'
'@/bookings': './src/modules/bookings'
'@/fields': './src/modules/fields'
'@/venues': './src/modules/venues'
'@/user-profile': './src/modules/user-profile'
'@/search': './src/modules/search'
'@/admin': './src/modules/admin'
'@/assets': './src/assets'
'@/components': './src/components'
```

**Beneficio**: Imports absolutos en lugar de relativos (../../../).

## 🔗 Reglas de Dependencia

### Principios

1. **Módulos no se importan entre sí** (excepto core)
2. **Todos los módulos pueden importar de core**
3. **Core no importa de ningún otro módulo**
4. **Componentes globales (src/components/) pueden ser usados por cualquier módulo**

### Ejemplos Correctos ✅

```typescript
// Desde cualquier módulo → core
import { fetchCanchas } from '@/core/lib/helpers';
import type { ApiResponse } from '@/core/contracts/types/common';

// Desde cualquier módulo → componente global
import Footer from '@/components/Footer';

// Dentro del mismo módulo
import { useAuth } from '../hooks/useAuth';
import type { AuthState } from '../types/auth.types';
```

### Ejemplos Incorrectos ❌

```typescript
// ❌ Módulo importando directamente de otro módulo
import { FieldCard } from '@/fields/components/FieldCard'; // desde bookings

// ❌ Core importando de un módulo
import { useAuth } from '@/auth/hooks/useAuth'; // desde core
```

### Soluciones

Si necesitas compartir código entre módulos:

1. **Mover a core**: Si es verdaderamente compartido
2. **Extraer a componentes globales**: Si es un componente UI reutilizable
3. **Duplicar**: Si es lógica específica de negocio (principio DRY no es absoluto)
4. **Usar props**: Pasar datos desde un componente padre

## 🔧 Tecnologías

- **Framework**: React 19.1.1
- **Lenguaje**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.12
- **Routing**: React Router DOM 7.9.3
- **Estilos**: Tailwind CSS 3.4.17
- **Fuente**: Plus Jakarta Sans
- **Backend API**: http://localhost:3000/api

## 📝 Convenciones de Código

### Naming

- **Componentes**: PascalCase (`FieldCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Services**: camelCase con sufijo `Service` (`authService.ts`)
- **Types**: PascalCase para interfaces/types, camelCase para archivos (`auth.types.ts`)
- **Constantes**: UPPER_SNAKE_CASE
- **Funciones**: camelCase

### Imports

Ordenar imports en este orden:

1. React y bibliotecas externas
2. Path aliases (@/core, @/auth, etc.)
3. Imports relativos del mismo módulo
4. Types (siempre con `type` keyword)

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';

import Footer from '@/components/Footer';
import { useAuth } from '@/auth/hooks/useAuth';
import { formatDate } from '@/core/lib/helpers';

import { FieldCard } from '../components/FieldCard';
import { useFields } from '../hooks/useFields';

import type { SportField } from '../types/field.types';
import type { ApiResponse } from '@/core/contracts/types/common';
```

### Types

- Usar `interface` para objetos que puedan extenderse
- Usar `type` para uniones, intersecciones, y tipos complejos
- Prefijar tipos de API con `Api` (ej: `ApiCancha`)
- Prefijar tipos de request con `Create` o `Update` (ej: `CreateCanchaRequest`)

## 🚀 Próximos Pasos

1. **Extraer servicios**: Mover lógica de `helpers.ts` a servicios especializados por módulo
2. **Implementar ports**: Crear implementaciones concretas de los ports definidos en core
3. **Tests unitarios**: Agregar tests para cada módulo
4. **Tests de integración**: Verificar interacciones entre módulos
5. **Documentar APIs**: Documentar contratos de servicios y APIs internas

## 📚 Referencias

- [Screaming Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [React Folder Structure](https://www.robinwieruch.de/react-folder-structure/)

---

**Última actualización**: Refactor completo a Screaming Architecture - Fase 2 completada
**Estado**: ✅ Build exitoso sin errores de TypeScript
**Autor**: ROGU Development Team
