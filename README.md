# 🏟️ ROGU - Sistema de Reservas de Canchas Deportivas
# DenzelTask2

<div align="center">

![ROGU Logo](https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=ROGU)

**Plataforma moderna de reservas de espacios deportivos con sistema de pagos integrado**

[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Características](#-características-principales) • [Instalación](#-instalación) • [Arquitectura](#-arquitectura) • [Documentación](#-documentación)

</div>

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación](#-instalación)
- [Arquitectura](#-arquitectura)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Documentación](#-documentación)

---

## 🎯 Acerca del Proyecto

**ROGU** es una plataforma web integral para la gestión y reserva de espacios deportivos que conecta a usuarios con propietarios de canchas deportivas. El sistema ofrece una experiencia fluida desde la búsqueda hasta el pago, incluyendo gestión de reseñas, analytics avanzados y perfiles de usuario multirrol.

### 🎓 Contexto Académico

Este proyecto es desarrollado como parte del **Taller de Ingeniería de Software** del 6to semestre, implementando las mejores prácticas de desarrollo moderno y arquitectura de software empresarial.

---

## ✨ Características Principales

### 👤 Para Usuarios

- 🔍 **Búsqueda Avanzada**: Filtra canchas por ubicación, deporte, precio y disponibilidad
- 🗺️ **Mapa Interactivo**: Visualización geográfica con Leaflet y OpenStreetMap
- 📅 **Reservas en Tiempo Real**: Sistema de calendario con validación de horarios
- 💳 **Pagos Integrados**: MercadoPago (tarjetas y QR), PSE y transferencias
- ⭐ **Sistema de Reseñas**: Calificaciones y comentarios verificados
- 📱 **Diseño Responsive**: Optimizado para móviles, tablets y desktop

### 🏢 Para Propietarios

- 🏟️ **Gestión de Sedes**: CRUD completo de locaciones deportivas
- ⚽ **Administración de Canchas**: Configuración de precios, horarios y capacidad
- 📈 **Dashboard Analytics**: KPIs en tiempo real, gráficos de tendencias, reportes descargables
- 💰 **Control de Ingresos**: Seguimiento de transacciones y reembolsos

---

## 🛠 Stack Tecnológico

- **React 19.1** + **TypeScript 5.8** + **Vite 7.1**
- **TailwindCSS 3.4** - Estilos modernos
- **React Router 7.9** - Enrutamiento SPA
- **Leaflet** - Mapas interactivos
- **React Big Calendar** - Gestión de horarios
- **Recharts 3.3** - Visualizaciones de datos
- **MercadoPago SDK** - Integración de pagos

---

## 📦 Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- npm >= 9.0.0

### Pasos

1. **Clonar repositorio**
```bash
git clone https://github.com/kikecod/rogu-frontend.git
cd rogu-frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```env
VITE_API_URL=http://localhost:8080/api
VITE_MP_PUBLIC_KEY=tu_public_key
```

4. **Iniciar desarrollo**
```bash
npm run dev
```

La aplicación estará en `http://localhost:5173`

---

## 🏛 Arquitectura

### Screaming Architecture

Este proyecto implementa **Screaming Architecture**, donde la estructura refleja el dominio del negocio:

```
src/modules/
├── auth/          # Autenticación y roles
├── bookings/      # Sistema de reservas
├── fields/        # Gestión de canchas
├── venues/        # Gestión de sedes
├── search/        # Búsqueda y filtrado
├── user-profile/  # Perfiles de usuario
├── reviews/       # Sistema de reseñas
├── analytics/     # Dashboard para propietarios
└── core/          # Utilidades compartidas
```

**Ventajas:**
- ✅ Claridad inmediata del propósito del sistema
- ✅ Módulos independientes y mantenibles
- ✅ Fácil onboarding para nuevos desarrolladores
- ✅ Escalabilidad sin afectar módulos existentes

---

## 🧩 Módulos del Sistema

### 1. 🔐 Auth Module
- JWT token-based authentication
- Roles: Usuario, Propietario, Admin
- Context API para estado global

### 2. 📅 Bookings Module
- Calendario interactivo
- Validación de horarios consecutivos
- Historial de reservas

### 3. ⚽ Fields & Venues
- CRUD de canchas y sedes
- Mapas con geolocalización
- Precios y amenidades

### 4. 🔍 Search Module
- Filtros avanzados
- Mapa de resultados
- Ordenamiento múltiple

### 5. ⭐ Reviews Module
- Calificación 1-5 estrellas
- Comentarios verificados
- Moderación para propietarios

### 6. 📊 Analytics Module
- KPIs en tiempo real
- Gráficos (Line, Donut, Bar)
- Reportes exportables

### 7. 💳 Payments _(Backend)_
- MercadoPago: Tarjetas y QR
- PSE y transferencias
- Reembolsos automáticos

---

## 📜 Scripts

```bash
npm run dev      # Desarrollo (puerto 5173)
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linting con ESLint
```

---

## 📚 Documentación

### Documentos Principales
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura detallada
- **[INDICE_MAESTRO.md](./docs/INDICE_MAESTRO.md)** - Índice completo
- **[FLUJOS_INTEGRACION.md](./docs/FLUJOS_INTEGRACION.md)** - Flujos de usuario

### Por Módulo
- **[Analytics](./docs/IMPLEMENTACION_ANALYTICS.md)** - Dashboard y reportes
- **[Pagos](./docs/TRABAJO_KIKE_SISTEMA_PAGOS.md)** - Sistema de pagos
- **[Reseñas](./docs/TRABAJO_SAMY_SISTEMA_RESENAS.md)** - Sistema de reseñas
- **[Perfil](./docs/TRABAJO_DENZEL_PERFIL_CONFIGURACION.md)** - Gestión de perfil

---

## 👥 Equipo de Desarrollo

| Nombre | Rol | Módulo |
|--------|-----|--------|
| **Kike** | Tech Lead | Pagos + Backend |
| **Oscar** | Frontend Dev | Analytics |
| **Samy** | Frontend Dev | Reseñas |
| **Denzel** | Frontend Dev | Perfil |

**Metodología:** Scrum adaptado (sprints semanales)

---

## 🌟 Roadmap

### ✅ v1.0 (Completado)
- [x] Autenticación con roles
- [x] Sistema de reservas
- [x] Integración de pagos
- [x] Dashboard analytics
- [x] Sistema de reseñas

### 🚧 v1.1 (En desarrollo)
- [ ] Notificaciones push
- [ ] Chat en tiempo real
- [ ] Sistema de favoritos

---

## 📞 Contacto

- **GitHub:** [@kikecod](https://github.com/kikecod)
- **Email:** fernizenrique352@gmail.com

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

Hecho con ❤️ por el Equipo ROGU

</div>
