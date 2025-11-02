# 📚 ÍNDICE MAESTRO - DOCUMENTACIÓN DEL PROYECTO

> **Creado:** 30 de octubre de 2025  
> **Proyecto:** ROGU - Sistema de Reservas de Canchas Deportivas  
> **Objetivo:** Dividir el trabajo restante entre 4 personas

---

## 🗂️ DOCUMENTOS PRINCIPALES

### 1. 📋 DIVISION_TRABAJO_4_PERSONAS.md (13 KB)
**Propósito:** Documento maestro con visión general de la división de trabajo

**Contenido:**
- Resumen general del proyecto
- División de responsabilidades por persona
- Objetivos y tecnologías de cada módulo
- Matriz de dependencias
- Cronograma sugerido (3 semanas)
- Reuniones y coordinación
- Entregables finales
- Criterios de aceptación

**Cuándo leerlo:** PRIMERO - Para entender la visión general

---

### 2. ⚡ RESUMEN_RAPIDO_TRABAJO.md (11 KB)
**Propósito:** Vista rápida y visual de todo el trabajo

**Contenido:**
- Comparativa visual ANTES vs AHORA
- Estructura arquitectónica
- Tabla comparativa de trabajo
- Lista de endpoints por persona
- Componentes principales por módulo
- Funcionalidad más importante de cada persona
- Quick start para comenzar

**Cuándo leerlo:** SEGUNDO - Para tener un overview rápido

---

### 3. 🔄 FLUJOS_INTEGRACION.md (33 KB)
**Propósito:** Explicar cómo se integran los 4 módulos

**Contenido:**
- Flujo completo de reserva (Usuario → Pago → Reseña)
- Flujo de gestión de perfil (Upload de foto)
- Flujo de dueño (Dashboard → Analytics → Reportes)
- Flujo de cancelación y reembolso

---

### 4. 📊 IMPLEMENTACION_ANALYTICS.md ⭐ NUEVO
**Propósito:** Documentación técnica completa del módulo de Analytics y Reportes

**Contenido:**
- Resumen de implementación
- Características completadas
- Servicios de API implementados
- Componentes reutilizables creados
- Páginas principales
- Tipos TypeScript
- Gráficos sin librerías externas
- Endpoints conectados
- Ejemplos de código
- Checklist de implementación

**Cuándo leerlo:** Para desarrolladores que necesiten entender o extender el módulo de analytics

---

### 5. 📖 GUIA_USUARIO_ANALYTICS.md ⭐ NUEVO
**Propósito:** Guía de usuario final para el módulo de Analytics

**Contenido:**
- ¿Qué es Analytics?
- Acceso rápido
- Dashboard principal explicado
- Métricas y KPIs detallados
- Cómo usar cada gráfico
- Análisis por cancha
- Gestión de reseñas
- Descarga de reportes
- Consejos y mejores prácticas
- Preguntas frecuentes

**Cuándo leerlo:** Para usuarios dueños que usarán la funcionalidad de analytics
- Matriz de dependencias entre módulos
- Puntos de integración clave
- Checklist de integración

**Cuándo leerlo:** TERCERO - Antes de empezar a integrar módulos

---

## 👥 DOCUMENTOS POR PERSONA

### 4. 💳 TRABAJO_PERSONA_1_SISTEMA_PAGOS.md (29 KB)
**Responsable:** Persona 1  
**Módulo:** Sistema de Pagos Real  
**Duración:** 2-3 semanas  
**Prioridad:** 🔴 CRÍTICA  

**Contenido del documento:**

#### Backend:
- Configuración de MercadoPago SDK
- Variables de entorno (access token, public key)
- Tablas de BD:
  - `Transaccion` (idTransaccion, idReserva, monto, estado, metodoPago)
  - `Reembolso` (idReembolso, idTransaccion, monto, estado)
- Servicios:
  - `MercadoPagoService` (procesarPagoTarjeta, generarQR, procesarWebhook)
  - `TransaccionService` (crear, obtener, actualizar estado)
  - `ReembolsoService` (crear, procesar)
- Controladores:
  - `PagoController` (POST /api/pagos/tarjeta, POST /api/pagos/qr)
  - `WebhookController` (POST /api/pagos/webhook)
  - `TransaccionController` (GET /api/transacciones)

#### Frontend:
- Types: PaymentMethod, Transaction, Refund
- Services: paymentService.ts
- Components:
  - `PaymentForm.tsx` (formulario de tarjeta con validación)
  - `QRPayment.tsx` (visualización de QR)
  - `PaymentMethodSelector.tsx`
  - `TransactionHistory.tsx`
- Integración en `CheckoutPage.tsx`

#### Testing:
- Pagos con tarjetas de prueba
- Generación de QR
- Webhooks con ngrok
- Reembolsos

**Endpoints principales:**
```
POST   /api/pagos/tarjeta
POST   /api/pagos/qr
POST   /api/pagos/webhook
POST   /api/reembolsos
GET    /api/transacciones
GET    /api/transacciones/:id
```

---

### 5. ⭐ TRABAJO_PERSONA_2_SISTEMA_RESENAS.md (39 KB)
**Responsable:** Persona 2  
**Módulo:** Sistema de Reseñas y Calificaciones  
**Duración:** 1-2 semanas  
**Prioridad:** 🔴 CRÍTICA  

**Contenido del documento:**

#### Backend:
- Modificaciones a tabla `Resena`:
  - Agregar campos: editadoEn, reportada, motivoReporte, estado
  - Índices para performance
- Nuevas tablas:
  - `RespuestaResena` (respuestas del dueño)
  - `ReporteResena` (reportes de usuarios)
- Servicios:
  - `ResenaService`:
    - `canUserReview()` ⭐ CRÍTICO (validar reserva completada)
    - CRUD completo (crear, editar, eliminar)
    - Calcular rating promedio
    - Sistema de respuestas
    - Sistema de reportes
- Controladores:
  - `ResenaController` (todos los endpoints)

#### Frontend:
- Types: Review, ReviewResponse, ReviewReport
- Services: reviewService.ts
- Components:
  - `CreateReviewModal.tsx` (modal para crear reseña)
  - `EditReviewModal.tsx` (editar reseña propia)
  - `ReviewList.tsx` (lista con paginación)
  - `ReviewCard.tsx` (card individual)
  - `StarRating.tsx` (componente de estrellas)
  - `OwnerResponse.tsx` (respuesta del dueño)
- Integración en:
  - `FieldDetailPage.tsx` (mostrar reseñas)
  - `MyBookingsPage.tsx` (botón "Dejar Reseña")

#### Testing:
- Validación "solo con reserva completada"
- Edición solo de reseñas propias
- Respuestas del dueño
- Cálculo de rating promedio
- Sistema de reportes

**Endpoints principales:**
```
POST   /api/resenas
GET    /api/resenas/:id
PUT    /api/resenas/:id
DELETE /api/resenas/:id
POST   /api/resenas/:id/responder
POST   /api/resenas/:id/reportar
GET    /api/canchas/:id/resenas
```

---

### 6. 👤 TRABAJO_PERSONA_3_PERFIL_CONFIGURACION.md (60 KB)
**Responsable:** Persona 3  
**Módulo:** Perfil y Configuración de Usuario  
**Duración:** 2 semanas  
**Prioridad:** 🔴 ALTA  

**Contenido del documento:**

#### ⭐ FUNCIONALIDAD MÁS IMPORTANTE: Upload de Foto de Perfil

**PROBLEMA ACTUAL:** El sistema tiene componentes de perfil pero la foto NO funciona.

**SOLUCIÓN COMPLETA:**

#### Backend:
- Modificar tabla `Usuario`:
  - Agregar campo `fotoPerfil VARCHAR(500)`
- Modificar tabla `Persona`:
  - Agregar campos: biografia, fechaNacimiento, genero
- Nuevas tablas:
  - `PreferenciaUsuario` (privacidad, notificaciones, tema)
  - `VerificacionEmail` (tokens de verificación)
- Dependencias:
  - `multer` (recibir archivos)
  - `sharp` (redimensionar imágenes)
- Configuración:
  - Carpeta `/uploads/avatars/`
  - Middleware multer
- Servicios:
  - `ProfileService`:
    - `uploadAvatar()` ⭐ CRÍTICO
    - `deleteAvatar()`
    - `updatePersonalInfo()`
    - `changePassword()`
    - `requestEmailChange()`
    - `verifyEmailChange()`
    - `updatePreferences()`
    - `exportUserData()`
    - `deleteAccount()`

#### Frontend:
- Components:
  - `AvatarUpload.tsx` ⭐ CRÍTICO
    - File input
    - Preview
    - Crop con `react-easy-crop`
    - Upload con FormData
    - Loading state
  - `ProfilePage.tsx` (página principal con tabs)
  - `PersonalInfoForm.tsx`
  - `SecurityForm.tsx` (cambiar password/email)
  - `PreferencesForm.tsx`
  - `AccountDangerZone.tsx`
- Integración:
  - Actualizar `AuthContext` con nueva foto
  - Header muestra foto actualizada
  - Toda la app usa la nueva foto

#### Testing:
- Upload de imágenes grandes (> 5MB)
- Formatos no soportados
- Cambio de contraseña
- Cambio de email con verificación
- Exportación de datos
- Eliminación de cuenta

**Endpoints principales:**
```
GET    /api/profile
PUT    /api/profile/personal
POST   /api/profile/avatar          ⭐ MÁS IMPORTANTE
DELETE /api/profile/avatar
PUT    /api/profile/password
POST   /api/profile/email/request
POST   /api/profile/email/verify
PUT    /api/profile/preferences
GET    /api/profile/export
DELETE /api/profile
```

---

### 7. 📊 TRABAJO_PERSONA_4_DASHBOARD_ANALYTICS.md (31 KB)
**Responsable:** Persona 4  
**Módulo:** Dashboard y Panel de Análisis para Dueños  
**Duración:** 2-3 semanas  
**Prioridad:** 🔴 ALTA  

**Contenido del documento:**

#### Backend:
- Vista SQL agregada (opcional):
  - `VistaEstadisticasCancha` (estadísticas pre-calculadas)
- Servicios:
  - `AnalyticsService`:
    - `getDashboardKPIs()` (ingresos, reservas, ocupación, rating)
    - `getReservasAnalytics()`
    - `getIngresosAnalytics()`
    - `getCanchaEstadisticas()`
    - `getCalendarioOcupacion()`
    - `calculateTasaOcupacion()`
  - `ReportService`:
    - `generatePDFReport()` (con Puppeteer)
    - `generateExcelReport()` (con xlsx)
- Dependencias:
  - `puppeteer` (PDF)
  - `xlsx` (Excel)
  - `date-fns` (fechas)

#### Frontend:
- Librerías:
  - `recharts` (gráficos)
  - `react-datepicker`
- Pages:
  - `DashboardPage.tsx` (overview principal)
  - `ReservasAnalyticsPage.tsx`
  - `IngresosAnalyticsPage.tsx`
  - `CanchasAnalyticsPage.tsx`
  - `ReseñasPage.tsx`
  - `ReportesPage.tsx`
- Components:
  - `KPICard.tsx` (tarjetas de métricas)
  - `RevenueChart.tsx` (gráfico de área)
  - `BookingsChart.tsx` (gráfico de barras)
  - `DonutChart.tsx` (gráfico circular)
  - `CalendarHeatmap.tsx` (calendario de ocupación)
  - `RecentBookingsTable.tsx`
  - `TopCanchasTable.tsx`

#### Testing:
- Cálculo de KPIs correcto
- Gráficos renderizando
- Generación de PDF completo
- Exportación Excel
- Permisos (solo dueño ve sus datos)
- Performance (< 2 segundos)

**Endpoints principales:**
```
GET    /api/analytics/dashboard
GET    /api/analytics/reservas
GET    /api/analytics/ingresos
GET    /api/analytics/cancha/:id
GET    /api/analytics/calendario
GET    /api/analytics/resenas
POST   /api/analytics/reportes/pdf
POST   /api/analytics/reportes/excel
```

---

## 🎯 CÓMO USAR ESTA DOCUMENTACIÓN

### Para el Coordinador/Líder:
1. Leer `DIVISION_TRABAJO_4_PERSONAS.md` completo
2. Leer `RESUMEN_RAPIDO_TRABAJO.md`
3. Asignar personas a módulos
4. Coordinar reuniones semanales
5. Resolver conflictos de integración

### Para cada Desarrollador:
1. Leer `DIVISION_TRABAJO_4_PERSONAS.md` (visión general)
2. Leer `RESUMEN_RAPIDO_TRABAJO.md` (overview rápido)
3. **Leer TU documento asignado COMPLETO** (29-60 KB)
4. Leer `FLUJOS_INTEGRACION.md` (entender integración)
5. Crear branch: `feature/[tu-modulo]`
6. Seguir instrucciones paso a paso de tu documento
7. Hacer commits frecuentes
8. Pull request a `dev` cuando termines

### Para Testing Conjunto:
1. Todos leen `FLUJOS_INTEGRACION.md`
2. Probar flujo completo: Reserva → Pago → Reseña → Dashboard
3. Verificar checklist de integración

---

## 📊 ESTADÍSTICAS DE DOCUMENTACIÓN

```
Total de documentos: 7
Tamaño total: ~226 KB
Líneas totales: ~8,000 líneas
Endpoints documentados: 32
Componentes documentados: 30
Servicios documentados: 12
Tablas de BD: 8

Tiempo estimado de lectura:
- Documento maestro: 30 minutos
- Resumen rápido: 15 minutos
- Flujos integración: 45 minutos
- Documento individual: 1-2 horas
```

---

## ✅ CHECKLIST DE INICIO

Antes de empezar a programar:

- [ ] He leído DIVISION_TRABAJO_4_PERSONAS.md
- [ ] He leído RESUMEN_RAPIDO_TRABAJO.md
- [ ] He leído mi documento asignado COMPLETO
- [ ] He leído FLUJOS_INTEGRACION.md
- [ ] Entiendo qué tengo que hacer
- [ ] Entiendo cómo se integra mi módulo con otros
- [ ] He creado mi branch
- [ ] Tengo acceso al repositorio
- [ ] Tengo configurado el entorno de desarrollo
- [ ] Conozco a mis compañeros de equipo
- [ ] Sé cómo comunicarme si tengo dudas

---

## 🆘 ¿NECESITAS AYUDA?

### Si tienes dudas sobre:

**Arquitectura general:**
→ Lee `ARCHITECTURE.md` del proyecto

**Tu módulo específico:**
→ Revisa TU documento asignado (sección específica)

**Integración con otros módulos:**
→ Lee `FLUJOS_INTEGRACION.md`

**Endpoints de otros:**
→ Lee `RESUMEN_RAPIDO_TRABAJO.md` (sección de endpoints)

**Cronograma:**
→ Lee `DIVISION_TRABAJO_4_PERSONAS.md` (sección de cronograma)

---

## 📝 ORDEN DE LECTURA RECOMENDADO

```
1. DIVISION_TRABAJO_4_PERSONAS.md        (30 min) ⭐
2. RESUMEN_RAPIDO_TRABAJO.md             (15 min) ⭐
3. TU_DOCUMENTO_ASIGNADO.md              (1-2 hrs) ⭐⭐⭐
4. FLUJOS_INTEGRACION.md                 (45 min) ⭐⭐
```

**TOTAL:** ~3-4 horas de lectura antes de programar

**Vale la pena:** Sí, evita confusiones y retrabajos

---

## 🚀 INICIO RÁPIDO (Si tienes prisa)

1. **5 minutos:** Lee solo tu sección en `RESUMEN_RAPIDO_TRABAJO.md`
2. **10 minutos:** Escanea los títulos de tu documento asignado
3. **30 minutos:** Lee la sección "Backend" de tu documento
4. **30 minutos:** Lee la sección "Frontend" de tu documento
5. **15 minutos:** Lee tu parte en `FLUJOS_INTEGRACION.md`

**TOTAL:** 1.5 horas mínimo

⚠️ **Advertencia:** Es mejor leer todo completo para evitar errores.

---

## 📅 FECHAS IMPORTANTES

**Kick-off:** ___________  
**Checkpoint 1 (Semana 1):** ___________  
**Checkpoint 2 (Semana 2):** ___________  
**Entrega Final:** ___________  
**Demo:** ___________  

---

**¡TODO LISTO PARA EMPEZAR! 🚀**

Este índice te guía por toda la documentación.  
Cada documento tiene un propósito específico.  
Lee en orden y tendrás claridad total.

**¡Éxito en el desarrollo! 💪**
