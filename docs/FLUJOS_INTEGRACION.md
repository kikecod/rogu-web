# 🔄 FLUJOS PRINCIPALES - INTEGRACIÓN ENTRE MÓDULOS

## 🎯 VISIÓN GENERAL

Este documento muestra cómo los 4 módulos se integran para crear flujos completos de usuario.

---

## 📍 FLUJO 1: RESERVA COMPLETA (Usuario Cliente)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUARIO busca canchas                                    │
│    → HomePage con Filters                                   │
│    → Lista de canchas disponibles                           │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. USUARIO selecciona cancha                                │
│    → FieldDetailPage                                        │
│    → Ve fotos, descripción, precio                          │
│    → Ve RESEÑAS (Persona 2) ⭐⭐⭐⭐⭐                      │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. USUARIO selecciona fecha y horario                       │
│    → CustomCalendar                                         │
│    → Horarios disponibles (evita conflictos)                │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. USUARIO confirma y va a pagar                            │
│    → CheckoutPage                                           │
│    → Resumen de reserva                                     │
│    → Monto total                                            │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. PAGO (Persona 1) 💳                                      │
│    → Selecciona método: Tarjeta o QR                        │
│    ├─ Tarjeta:                                              │
│    │  → PaymentForm con validación                          │
│    │  → Tokenización en frontend                            │
│    │  → POST /api/pagos/tarjeta                             │
│    │  → MercadoPago procesa                                 │
│    │  → Webhook confirma ✅                                 │
│    │                                                         │
│    └─ QR:                                                   │
│       → POST /api/pagos/qr                                  │
│       → Genera QR de MercadoPago                            │
│       → Usuario escanea con app                             │
│       → Usuario paga                                        │
│       → Webhook confirma ✅                                 │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. CONFIRMACIÓN                                             │
│    → BookingConfirmationPage                                │
│    → Estado: "Confirmada" ✅                                │
│    → Email de confirmación enviado                          │
│    → Transacción guardada en BD                             │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. USUARIO USA LA CANCHA                                    │
│    → Día de la reserva                                      │
│    → Usuario llega y juega                                  │
│    → Reserva completada                                     │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. USUARIO DEJA RESEÑA (Persona 2) ⭐                       │
│    → Va a MyBookingsPage                                    │
│    → Ve reserva completada con botón "Dejar Reseña"        │
│    → Click → CreateReviewModal                              │
│    → Selecciona estrellas (1-5)                             │
│    → Escribe comentario                                     │
│    → POST /api/resenas                                      │
│    → Backend valida: ¿tiene reserva completada? ✅         │
│    → Reseña guardada                                        │
│    → Rating de cancha actualizado                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 FLUJO 2: GESTIÓN DE PERFIL (Cualquier Usuario)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUARIO hace login                                       │
│    → AuthModal                                              │
│    → Token JWT guardado                                     │
│    → Redirige según rol                                     │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. USUARIO ve su foto actual en Header                     │
│    → Si no tiene foto: placeholder/avatar genérico         │
│    → Si tiene foto: URL de servidor (rota ❌ ACTUALMENTE) │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. USUARIO quiere cambiar foto (Persona 3) 📸              │
│    → Click en avatar del Header                             │
│    → Redirige a /profile                                    │
│    → ProfilePage se abre en tab "Información Personal"     │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SUBIR FOTO DE PERFIL                                     │
│    → AvatarUpload component                                 │
│    ├─ Click en "Cambiar Foto"                               │
│    ├─ File input abre                                       │
│    ├─ Usuario selecciona imagen                             │
│    ├─ Validación:                                           │
│    │  ✅ Es imagen (jpg/png/webp)                           │
│    │  ✅ Tamaño < 5MB                                       │
│    ├─ Preview se muestra                                    │
│    ├─ Crop tool (opcional, con react-easy-crop)            │
│    ├─ Usuario ajusta crop                                   │
│    ├─ Click "Guardar"                                       │
│    ├─ FormData se crea                                      │
│    ├─ POST /api/profile/avatar                              │
│    │                                                         │
│    └─ BACKEND (Persona 3):                                  │
│       ├─ Multer recibe archivo                              │
│       ├─ Validaciones servidor                              │
│       ├─ Sharp redimensiona a 400x400px                     │
│       ├─ Convierte a WebP (compresión)                      │
│       ├─ Guarda en /uploads/avatars/user-123-timestamp.webp │
│       ├─ Elimina foto anterior (si existe)                  │
│       ├─ Actualiza URL en tabla Usuario                     │
│       └─ Retorna nueva URL                                  │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. FOTO ACTUALIZADA EN TODA LA APP ✅                       │
│    → Header muestra nueva foto                              │
│    → ProfilePage muestra nueva foto                         │
│    → MyBookingsPage muestra nueva foto                      │
│    → Reseñas del usuario muestran nueva foto                │
│    → AuthContext actualizado                                │
└─────────────────────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. CAMBIAR CONTRASEÑA                                       │
│    → Tab "Seguridad"                                        │
│    → SecurityForm                                           │
│    ├─ Input: Contraseña Actual                              │
│    ├─ Input: Nueva Contraseña                               │
│    ├─ Input: Confirmar Nueva Contraseña                     │
│    ├─ Validaciones frontend:                                │
│    │  ✅ Mínimo 8 caracteres                                │
│    │  ✅ 1 mayúscula, 1 minúscula, 1 número                │
│    │  ✅ Nueva !== Actual                                   │
│    │  ✅ Confirmación === Nueva                             │
│    ├─ Click "Actualizar Contraseña"                         │
│    └─ PUT /api/profile/password                             │
│                                                             │
│    BACKEND:                                                 │
│    ├─ Verificar contraseña actual con bcrypt.compare()     │
│    ├─ Hash nueva contraseña con bcrypt.hash()              │
│    ├─ Actualizar en BD                                      │
│    └─ Retornar éxito                                        │
│                                                             │
│    → Mensaje: "Contraseña actualizada correctamente" ✅     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 FLUJO 3: DUEÑO GESTIONA NEGOCIO (Usuario Dueño)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DUEÑO hace login                                         │
│    → Sistema detecta rol = "DUENO"                          │
│    → Redirige a /dashboard (Persona 4)                      │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. DASHBOARD PRINCIPAL 📊                                   │
│    → GET /api/analytics/dashboard                           │
│    → Backend calcula:                                       │
│      ├─ Ingresos del mes (SUM transacciones APROBADAS)     │
│      ├─ Total reservas (COUNT)                              │
│      ├─ Tasa ocupación (reservas/slots disponibles * 100)  │
│      ├─ Rating promedio (AVG calificaciones)                │
│      ├─ Comparación vs mes anterior (+12.5% ↗)             │
│      └─ Datos para gráficos                                 │
│                                                             │
│    → Frontend renderiza:                                    │
│      ├─ KPICard: Ingresos Bs 15,420 (+12.5% ↗)            │
│      ├─ KPICard: 87 Reservas (+8.2% ↗)                     │
│      ├─ KPICard: 68.3% Ocupación (+5.1% ↗)                │
│      ├─ KPICard: 4.6⭐ Rating (+0.2 ↗)                     │
│      ├─ RevenueChart: Gráfico área últimos 6 meses         │
│      ├─ RecentBookingsTable: Últimas 10 reservas           │
│      └─ TopCanchasTable: Canchas más reservadas            │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DUEÑO ve ANÁLISIS DE INGRESOS 💰                        │
│    → Sidebar: Click en "Ingresos"                           │
│    → IngresosAnalyticsPage                                  │
│    → GET /api/analytics/ingresos?periodo=mes                │
│                                                             │
│    Backend:                                                 │
│    SELECT                                                   │
│      DATE_FORMAT(t.creadoEn, '%Y-%m') as mes,              │
│      SUM(t.monto) as ingresos,                             │
│      COUNT(t.idTransaccion) as transacciones               │
│    FROM Transaccion t                                       │
│    INNER JOIN Reserva r ON t.idReserva = r.idReserva       │
│    INNER JOIN Cancha c ON r.idCancha = c.idCancha          │
│    WHERE c.idUsuario = :idDueno                             │
│      AND t.estado = 'APROBADA'                              │
│    GROUP BY mes                                             │
│    ORDER BY mes DESC                                        │
│    LIMIT 12;                                                │
│                                                             │
│    Frontend muestra:                                        │
│    ├─ Gráfico de línea (tendencia mensual)                 │
│    ├─ Gráfico de barras (ingresos por cancha)             │
│    ├─ Tabla comparativa mes a mes                          │
│    └─ Proyección fin de mes                                │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. DUEÑO ve CALENDARIO DE OCUPACIÓN 📅                     │
│    → Sidebar: Click en "Calendario"                         │
│    → GET /api/analytics/calendario?mes=2024-10              │
│                                                             │
│    Backend retorna:                                         │
│    ├─ Por cada día del mes:                                │
│    │  ├─ Por cada cancha:                                  │
│    │  │  ├─ Por cada horario:                              │
│    │  │  │  ├─ Estado: LIBRE / RESERVADO                   │
│    │  │  │  ├─ idReserva (si reservado)                   │
│    │  │  │  └─ Cliente (si reservado)                     │
│    │  │  └─ Tasa ocupación del día                        │
│    │  └─ ...                                                │
│    └─ ...                                                   │
│                                                             │
│    Frontend:                                                │
│    ├─ CalendarHeatmap component                            │
│    ├─ Cada día es un cuadrado coloreado                   │
│    ├─ Color según ocupación:                               │
│    │  • Gris: 0-25%                                        │
│    │  • Verde claro: 26-50%                                │
│    │  • Verde medio: 51-75%                                │
│    │  • Verde oscuro: 76-100%                              │
│    ├─ Hover: tooltip con detalles                          │
│    └─ Click: modal con todas las reservas del día         │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. DUEÑO ve RESEÑAS RECIBIDAS ⭐                           │
│    → Sidebar: Click en "Reseñas"                            │
│    → ReseñasPage                                            │
│    → GET /api/analytics/resenas                             │
│                                                             │
│    Muestra:                                                 │
│    ├─ Resumen:                                              │
│    │  • Rating promedio: 4.6⭐                             │
│    │  • Total reseñas: 45                                  │
│    │  • Distribución: 5★(28) 4★(12) 3★(3) 2★(1) 1★(1)   │
│    │  • Pendientes respuesta: 5 🔴                         │
│    │                                                        │
│    ├─ Lista de reseñas:                                    │
│    │  ┌────────────────────────────────────┐              │
│    │  │ ⭐⭐⭐⭐⭐                          │              │
│    │  │ "Excelente cancha, muy limpia!"    │              │
│    │  │ - Juan Pérez • Cancha Fútbol A     │              │
│    │  │ • 28 Oct 2024                      │              │
│    │  │                                    │              │
│    │  │ [Responder] ← Si no tiene respuesta│              │
│    │  └────────────────────────────────────┘              │
│    │                                                        │
│    └─ Click "Responder":                                   │
│       → Modal se abre                                       │
│       → Textarea para escribir respuesta                   │
│       → POST /api/resenas/:id/responder (Persona 2)        │
│       → Respuesta guardada                                 │
│       → Se muestra bajo la reseña original                 │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. DUEÑO GENERA REPORTE 📄                                 │
│    → Sidebar: Click en "Reportes"                           │
│    → ReportesPage                                           │
│                                                             │
│    Formulario:                                              │
│    ├─ Tipo de reporte: [Completo ▼]                       │
│    ├─ Rango fechas: [01/10/2024] - [31/10/2024]          │
│    ├─ Cancha: [Todas ▼]                                   │
│    ├─ ☑️ Incluir gráficos                                 │
│    └─ Formato: ( ) PDF  (•) Excel                         │
│                                                             │
│    Click "Generar PDF":                                    │
│    ├─ Loading: "Generando reporte..."                     │
│    ├─ POST /api/analytics/reportes/pdf                    │
│    │                                                        │
│    Backend (Persona 4):                                    │
│    ├─ Obtiene todos los datos del periodo                 │
│    ├─ Genera HTML con plantilla:                          │
│    │  • Header con logo                                   │
│    │  • Resumen ejecutivo (KPIs)                          │
│    │  • Tabla de ingresos por cancha                      │
│    │  • Gráfico de tendencia (como imagen)               │
│    │  • Detalle de transacciones                          │
│    │  • Footer con fecha generación                       │
│    ├─ Puppeteer convierte HTML → PDF                      │
│    └─ Retorna archivo PDF                                  │
│                                                             │
│    Frontend:                                                │
│    ├─ Recibe Blob                                          │
│    ├─ Crea URL temporal                                    │
│    ├─ Trigger download: "reporte-octubre-2024.pdf"        │
│    └─ Mensaje: "Reporte generado ✅"                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 FLUJO 4: CANCELACIÓN Y REEMBOLSO

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUARIO quiere cancelar reserva                          │
│    → Va a MyBookingsPage                                    │
│    → Ve lista de reservas futuras                           │
│    → Click en "Cancelar" de una reserva                     │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. MODAL DE CONFIRMACIÓN                                    │
│    → CancelBookingModal                                     │
│    → Muestra detalles de reserva                            │
│    → Políticas de cancelación:                              │
│      • Cancelación 24h antes: Reembolso 100%               │
│      • Cancelación 12h antes: Reembolso 50%                │
│      • Menos de 12h: Sin reembolso                         │
│    → Usuario confirma cancelación                           │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND PROCESA CANCELACIÓN                              │
│    → PUT /api/reservas/:id/cancelar                         │
│                                                             │
│    Backend:                                                 │
│    ├─ Verificar que reserva pertenece al usuario           │
│    ├─ Verificar que estado = "Confirmada"                  │
│    ├─ Calcular tiempo hasta reserva                        │
│    ├─ Determinar % de reembolso                            │
│    ├─ Actualizar estado → "Cancelada"                      │
│    └─ Si aplica reembolso:                                 │
│       └─ Llamar ReembolsoService (Persona 1)               │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. REEMBOLSO AUTOMÁTICO (Persona 1) 💰                     │
│    → ReembolsoService.createReembolso()                     │
│                                                             │
│    Backend:                                                 │
│    ├─ Buscar Transaccion de la reserva                     │
│    ├─ Verificar que estado = "APROBADA"                    │
│    ├─ Calcular monto reembolso (50% o 100%)                │
│    ├─ Crear registro en tabla Reembolso                    │
│    ├─ Llamar API MercadoPago:                              │
│    │  POST /v1/payments/{payment_id}/refunds               │
│    │  Body: { amount: 100.00 }                             │
│    ├─ MercadoPago procesa reembolso                        │
│    ├─ Actualizar estado Reembolso → "PROCESADO"            │
│    └─ Usuario recibe dinero en 5-10 días                   │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. NOTIFICACIONES                                           │
│    → Email al usuario: "Reserva cancelada"                  │
│    → Email al dueño: "Nueva cancelación"                    │
│    → Dashboard del dueño actualizado                        │
│    → KPI "Tasa de cancelación" recalculado                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 DEPENDENCIAS ENTRE MÓDULOS

```
┌──────────────────────────────────────────────────────────────┐
│                    MATRIZ DE DEPENDENCIAS                     │
└──────────────────────────────────────────────────────────────┘

PERSONA 1 (Pagos)
├─ Depende de: NADA → puede empezar inmediatamente
└─ Es requerido por:
   ├─ Persona 4 (necesita datos de Transaccion)
   └─ Sistema de Reservas (ya existente)

PERSONA 2 (Reseñas)
├─ Depende de: Sistema de Reservas (ya existe)
└─ Es requerido por:
   └─ Persona 4 (muestra reseñas en dashboard)

PERSONA 3 (Perfil)
├─ Depende de: NADA → puede empezar inmediatamente
└─ Es requerido por:
   └─ Header component (muestra foto de perfil)

PERSONA 4 (Dashboard)
├─ Depende de:
│  ├─ Persona 1 (tabla Transaccion para ingresos)
│  ├─ Persona 2 (tabla Resena para mostrar reseñas)
│  └─ Sistema de Reservas (ya existe)
└─ Es requerido por: NADIE (módulo final)

```

### Estrategia de Desarrollo:

**Semana 1:**
- Personas 1, 2, 3 trabajan en paralelo
- Persona 4 crea estructura con datos mock

**Semana 2:**
- Personas 1, 2, 3 continúan
- Persona 4 empieza integración real

**Semana 3:**
- Integración final de todos los módulos
- Testing end-to-end

---

## 🎯 PUNTOS DE INTEGRACIÓN CLAVE

### 1. Header Component (Foto de Perfil)
```typescript
// Persona 3 debe actualizar AuthContext
// cuando se cambia la foto

// src/auth/states/AuthProvider.tsx
const updateUserAvatar = (fotoPerfil: string) => {
  setUser((prev) => ({ ...prev, fotoPerfil }));
};

// src/modules/user-profile/components/AvatarUpload.tsx
const handleUploadSuccess = (newAvatarUrl: string) => {
  updateUserAvatar(newAvatarUrl);
  // Ahora Header muestra nueva foto automáticamente
};
```

### 2. FieldDetailPage (Mostrar Reseñas)
```typescript
// Persona 2 crea componente ReviewList
// Se integra en página existente

// src/modules/fields/pages/FieldDetailPage.tsx
<ReviewList canchaId={idCancha} />
```

### 3. CheckoutPage (Integrar Pagos)
```typescript
// Persona 1 crea PaymentForm
// Se integra en página existente

// src/modules/bookings/pages/CheckoutPage.tsx
<PaymentForm 
  reservaId={reserva.idReserva}
  monto={reserva.monto}
  onSuccess={handlePaymentSuccess}
/>
```

### 4. Dashboard (Consumir Datos)
```typescript
// Persona 4 consume APIs de otras personas

// Ingresos (Persona 1)
const ingresos = await fetch('/api/analytics/ingresos');

// Reseñas (Persona 2)
const resenas = await fetch('/api/analytics/resenas');

// Reservas (ya existe)
const reservas = await fetch('/api/analytics/reservas');
```

---

## ✅ CHECKLIST DE INTEGRACIÓN

### Al finalizar Persona 1:
- [ ] Tabla Transaccion poblada con pagos reales
- [ ] Endpoint /api/transacciones funcional
- [ ] Persona 4 puede consultar ingresos

### Al finalizar Persona 2:
- [ ] ReviewList component integrado en FieldDetailPage
- [ ] Endpoint /api/resenas funcional
- [ ] Persona 4 puede mostrar reseñas en dashboard

### Al finalizar Persona 3:
- [ ] AvatarUpload funcional
- [ ] Header muestra foto actualizada
- [ ] AuthContext se actualiza automáticamente

### Al finalizar Persona 4:
- [ ] Dashboard completo funcionando
- [ ] Reportes PDF/Excel generándose
- [ ] Todos los gráficos renderizando

---

**Este documento sirve como guía de integración para que las 4 personas coordinen correctamente sus entregas. 🚀**
