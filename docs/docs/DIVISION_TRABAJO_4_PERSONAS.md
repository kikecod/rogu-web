# 📋 DIVISIÓN DE TRABAJO - PROYECTO ROGU

## 🎯 RESUMEN GENERAL

Este proyecto se divide en **4 áreas principales** para ser desarrolladas por 4 personas en paralelo. Cada área tiene su documento detallado con instrucciones específicas de backend y frontend.

**Duración estimada total:** 2-3 semanas  
**Fecha de inicio:** ___________  
**Fecha de entrega:** ___________

---

## 👥 DIVISIÓN DE RESPONSABILIDADES

### 🔴 PERSONA 1: Sistema de Pagos Real
**Prioridad:** CRÍTICA  
**Duración:** 2-3 semanas  
**Documento:** `TRABAJO_PERSONA_1_SISTEMA_PAGOS.md`

**Objetivos:**
- ✅ Integrar pasarela de pagos real (MercadoPago o Stripe)
- ✅ Procesar pagos con tarjeta de crédito/débito
- ✅ Generar códigos QR para pagos móviles
- ✅ Implementar webhooks para confirmación automática
- ✅ Sistema de reembolsos
- ✅ Historial de transacciones

**Tecnologías clave:**
- Backend: MercadoPago SDK / Stripe SDK
- Base de datos: Tablas `Transaccion`, `Reembolso`
- Frontend: Formulario de pago con tokenización, integración QR

**Endpoints principales:**
- `POST /api/pagos/tarjeta` - Procesar pago con tarjeta
- `POST /api/pagos/qr` - Generar código QR
- `POST /api/pagos/webhook` - Recibir confirmaciones
- `POST /api/reembolsos` - Procesar reembolso
- `GET /api/transacciones` - Historial

**Componentes frontend:**
- `PaymentForm.tsx` - Formulario de pago
- `QRPayment.tsx` - Visualización de QR
- `TransactionHistory.tsx` - Historial

---

### 🔴 PERSONA 2: Sistema de Reseñas y Calificaciones
**Prioridad:** CRÍTICA  
**Duración:** 1-2 semanas  
**Documento:** `TRABAJO_PERSONA_2_SISTEMA_RESENAS.md`

**Objetivos:**
- ✅ CRUD completo de reseñas (crear, editar, eliminar)
- ✅ Sistema de calificación 1-5 estrellas
- ✅ Validación: solo usuarios con reservas completadas pueden reseñar
- ✅ Respuesta del dueño a reseñas
- ✅ Cálculo automático de rating promedio
- ✅ Sistema de reporte de reseñas inapropiadas

**Tecnologías clave:**
- Backend: ResenaService con validaciones complejas
- Base de datos: Tablas `Resena`, `RespuestaResena`, `ReporteResena`
- Frontend: Modal de reseña, lista con paginación

**Endpoints principales:**
- `POST /api/resenas` - Crear reseña
- `PUT /api/resenas/:id` - Editar reseña
- `DELETE /api/resenas/:id` - Eliminar reseña
- `POST /api/resenas/:id/responder` - Respuesta del dueño
- `GET /api/canchas/:id/resenas` - Obtener reseñas de cancha
- `POST /api/resenas/:id/reportar` - Reportar reseña

**Componentes frontend:**
- `CreateReviewModal.tsx` - Modal para crear reseña
- `ReviewList.tsx` - Lista de reseñas con paginación
- `ReviewCard.tsx` - Card individual de reseña
- `StarRating.tsx` - Componente de estrellas

---

### 🔴 PERSONA 3: Perfil y Configuración de Usuario
**Prioridad:** ALTA  
**Duración:** 2 semanas  
**Documento:** `TRABAJO_PERSONA_3_PERFIL_CONFIGURACION.md`

**Objetivos:**
- ✅ **Sistema de foto de perfil FUNCIONAL** (actualmente NO funciona)
- ✅ Upload de imágenes con redimensionamiento
- ✅ Actualizar información personal (nombre, teléfono, etc.)
- ✅ Cambiar contraseña con validación de seguridad
- ✅ Cambiar email con verificación por correo
- ✅ Preferencias de usuario (privacidad, notificaciones, tema)
- ✅ Gestión de cuenta (exportar datos, eliminar cuenta)

**Tecnologías clave:**
- Backend: Multer (upload), Sharp (procesamiento imágenes), bcrypt
- Base de datos: Campos `fotoPerfil` en Usuario, tabla `PreferenciaUsuario`
- Frontend: AvatarUpload con crop, formularios de perfil

**Endpoints principales:**
- `GET /api/profile` - Obtener perfil completo
- `PUT /api/profile/personal` - Actualizar info personal
- `POST /api/profile/avatar` - Subir foto de perfil ⭐
- `DELETE /api/profile/avatar` - Eliminar foto
- `PUT /api/profile/password` - Cambiar contraseña
- `POST /api/profile/email/request` - Solicitar cambio de email
- `POST /api/profile/email/verify` - Verificar y confirmar cambio
- `PUT /api/profile/preferences` - Actualizar preferencias
- `GET /api/profile/export` - Exportar datos (GDPR)
- `DELETE /api/profile` - Eliminar cuenta

**Componentes frontend:**
- `AvatarUpload.tsx` - Upload y preview de foto ⭐
- `ProfilePage.tsx` - Página principal con tabs
- `PersonalInfoForm.tsx` - Formulario de info personal
- `SecurityForm.tsx` - Cambio de contraseña/email
- `PreferencesForm.tsx` - Configuración y preferencias
- `AccountDangerZone.tsx` - Desactivar/eliminar cuenta

---

### 🔴 PERSONA 4: Dashboard y Panel de Análisis para Dueños
**Prioridad:** ALTA  
**Duración:** 2-3 semanas  
**Documento:** `TRABAJO_PERSONA_4_DASHBOARD_ANALYTICS.md`

**Objetivos:**
- ✅ Dashboard principal con KPIs (ingresos, reservas, ocupación)
- ✅ Gráficos de tendencias e ingresos
- ✅ Análisis detallado de reservas por cancha
- ✅ Análisis de ingresos con proyecciones
- ✅ Calendario de ocupación visual
- ✅ Gestión de reseñas recibidas
- ✅ Exportar reportes en PDF y Excel

**Tecnologías clave:**
- Backend: AnalyticsService, ReportService, Puppeteer (PDF), xlsx (Excel)
- Base de datos: Queries agregadas complejas (SUM, AVG, GROUP BY)
- Frontend: Recharts/Chart.js, componentes de visualización

**Endpoints principales:**
- `GET /api/analytics/dashboard` - KPIs y overview
- `GET /api/analytics/reservas` - Análisis de reservas
- `GET /api/analytics/ingresos` - Análisis de ingresos
- `GET /api/analytics/cancha/:id` - Estadísticas por cancha
- `GET /api/analytics/calendario` - Calendario de ocupación
- `GET /api/analytics/resenas` - Reseñas recibidas
- `POST /api/analytics/reportes/pdf` - Generar reporte PDF
- `POST /api/analytics/reportes/excel` - Exportar a Excel

**Componentes frontend:**
- `DashboardPage.tsx` - Dashboard principal
- `KPICard.tsx` - Tarjeta de KPI
- `RevenueChart.tsx` - Gráfico de ingresos
- `BookingsChart.tsx` - Gráfico de reservas
- `CalendarHeatmap.tsx` - Calendario de ocupación
- `ReservasAnalyticsPage.tsx` - Análisis de reservas
- `IngresosAnalyticsPage.tsx` - Análisis de ingresos
- `ReportesPage.tsx` - Generación de reportes

---

## 📊 MATRIZ DE DEPENDENCIAS

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  PERSONA 1   │  PERSONA 2   │  PERSONA 3   │  PERSONA 4   │
│   (Pagos)    │  (Reseñas)   │   (Perfil)   │ (Dashboard)  │
├──────────────┼──────────────┼──────────────┼──────────────┤
│              │              │              │              │
│ Independiente│ Independiente│ Independiente│  Depende de  │
│              │              │              │   Persona 1  │
│              │              │              │   (datos de  │
│              │              │              │  ingresos)   │
│              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Nota:** Personas 1, 2 y 3 pueden trabajar en paralelo sin problemas. Persona 4 necesita que Persona 1 complete las transacciones para mostrar datos reales de ingresos, pero puede desarrollar la estructura mientras tanto con datos mock.

---

## 🗓️ CRONOGRAMA SUGERIDO

### Semana 1 (Días 1-7)

**Persona 1 (Pagos):**
- Días 1-3: Setup de MercadoPago, configuración, modelos de BD
- Días 4-5: Implementar pago con tarjeta
- Días 6-7: Implementar pago con QR

**Persona 2 (Reseñas):**
- Días 1-2: Modificar BD, crear servicio base
- Días 3-4: CRUD de reseñas con validaciones
- Días 5-7: Sistema de respuestas y reportes

**Persona 3 (Perfil):**
- Días 1-3: Upload de imágenes (backend: multer + sharp)
- Días 4-5: Componente AvatarUpload (frontend)
- Días 6-7: Formularios de info personal

**Persona 4 (Dashboard):**
- Días 1-3: Estructura de BD, AnalyticsService
- Días 4-5: Endpoint de dashboard principal
- Días 6-7: Componentes de UI (KPICard, gráficos básicos)

---

### Semana 2 (Días 8-14)

**Persona 1 (Pagos):**
- Días 8-9: Webhooks de confirmación
- Días 10-11: Sistema de reembolsos
- Días 12-14: Frontend completo + testing

**Persona 2 (Reseñas):**
- Días 8-10: Frontend completo (modales, lista)
- Días 11-12: Integración en FieldDetailPage
- Días 13-14: Testing y refinamiento

**Persona 3 (Perfil):**
- Días 8-10: Cambio de contraseña y email
- Días 11-12: Preferencias y configuración
- Días 13-14: Gestión de cuenta + testing

**Persona 4 (Dashboard):**
- Días 8-10: Páginas de análisis (reservas, ingresos)
- Días 11-12: Calendario de ocupación
- Días 13-14: Página de reseñas para dueño

---

### Semana 3 (Días 15-21) - Refinamiento

**Persona 1:** Testing completo, manejo de errores, documentación
**Persona 2:** Testing, edge cases, documentación
**Persona 3:** Testing completo, UX refinements, documentación
**Persona 4:** Generación de reportes (PDF/Excel), testing, documentación

---

## 🔗 PUNTOS DE INTEGRACIÓN

### Entre Persona 1 y Persona 4:
- Persona 4 necesita datos de `Transaccion` para mostrar ingresos
- Una vez Persona 1 complete la tabla de transacciones, Persona 4 puede consumir esos datos

### Entre Persona 2 y Persona 4:
- Persona 4 mostrará reseñas en el dashboard del dueño
- Persona 2 debe asegurar que el endpoint de reseñas esté accesible para dueños

### Entre Persona 3 y todos:
- La foto de perfil debe mostrarse en el Header (componente ya existe)
- Una vez completado el upload, actualizar el AuthContext con la nueva URL

---

## 📝 REUNIONES SUGERIDAS

### Reunión Diaria (Daily Standup) - 15 minutos
- ¿Qué hiciste ayer?
- ¿Qué harás hoy?
- ¿Tienes algún bloqueador?

### Reunión de Integración - Día 7 y Día 14
- Revisar puntos de integración
- Resolver conflictos de merge
- Coordinar testing conjunto

### Reunión Final - Día 21
- Demo de todas las funcionalidades
- Testing end-to-end
- Preparación para producción

---

## 🧪 ESTRATEGIA DE TESTING

### Testing Individual (Cada persona)
- Unit tests de servicios
- Tests de endpoints (Postman/Thunder Client)
- Tests de componentes (React Testing Library)
- Tests de integración frontend-backend

### Testing Conjunto (Todo el equipo)
- Flujo completo: Reserva → Pago → Reseña → Dashboard
- Testing en diferentes navegadores
- Testing responsive (móvil)
- Testing de carga (performance)

---

## 📦 ENTREGABLES FINALES

Cada persona debe entregar:
1. ✅ **Código completo** (backend + frontend)
2. ✅ **Tests** (unitarios + integración)
3. ✅ **Documentación** (README con instrucciones)
4. ✅ **Scripts SQL** (si hay cambios en BD)
5. ✅ **Demo video** (5 minutos mostrando funcionalidad)
6. ✅ **Postman collection** (endpoints documentados)

---

## 🚀 CRITERIOS DE ACEPTACIÓN

### Persona 1 (Pagos):
- [ ] Pago con tarjeta funciona correctamente
- [ ] QR se genera y es escaneable
- [ ] Webhooks confirman pagos automáticamente
- [ ] Reembolsos se procesan correctamente
- [ ] Historial de transacciones visible para usuario

### Persona 2 (Reseñas):
- [ ] Solo usuarios con reservas completadas pueden reseñar
- [ ] Reseñas se pueden editar/eliminar
- [ ] Dueño puede responder a reseñas
- [ ] Rating promedio se calcula correctamente
- [ ] Sistema de reportes funciona

### Persona 3 (Perfil):
- [ ] Foto de perfil se sube y se ve en toda la app
- [ ] Imágenes se redimensionan automáticamente
- [ ] Cambio de contraseña funciona con validación
- [ ] Cambio de email con verificación funciona
- [ ] Preferencias se guardan correctamente
- [ ] Exportar datos genera JSON completo
- [ ] Eliminar cuenta requiere confirmación

### Persona 4 (Dashboard):
- [ ] Dashboard muestra KPIs correctos
- [ ] Gráficos se renderizan correctamente
- [ ] Calendario de ocupación es interactivo
- [ ] Reportes PDF se generan correctamente
- [ ] Exportación a Excel funciona
- [ ] Solo dueño puede ver sus propios datos
- [ ] Performance: carga en menos de 2 segundos

---

## 🆘 CONTACTO Y SOPORTE

**Coordinador del Proyecto:** ___________  
**Canal de Comunicación:** [Slack/Discord/WhatsApp]  
**Repositorio:** https://github.com/...  
**Branch principal:** `dev`  
**Branch por persona:**
- `feature/pagos` (Persona 1)
- `feature/resenas` (Persona 2)
- `feature/perfil` (Persona 3)
- `feature/dashboard` (Persona 4)

---

## 📚 RECURSOS COMPARTIDOS

- **Documentación del proyecto:** `/ARCHITECTURE.md`
- **Guía de estilo:** Usar Prettier y ESLint configurados
- **Convención de commits:** `feat:`, `fix:`, `refactor:`, `docs:`
- **Base de datos compartida:** [Credenciales en .env.example]

---

**¡ÉXITO EN EL PROYECTO! 🚀**

**Fecha de creación:** 30 de octubre de 2025  
**Versión:** 1.0
