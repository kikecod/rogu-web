# 💳 TRABAJO PERSONA 1: SISTEMA DE PAGOS REAL

**Responsable:** Persona 1  
**Duración estimada:** 2-3 semanas  
**Prioridad:** 🔴 CRÍTICA  

> **NOTA IMPORTANTE:** Este documento forma parte de un sistema de 4 personas:
> - **Persona 1:** Sistema de Pagos Real (este documento)
> - **Persona 2:** Sistema de Reseñas y Calificaciones
> - **Persona 3:** Perfil y Configuración de Usuario (con gestión de foto de perfil)
> - **Persona 4:** Dashboard/Panel de Análisis para Dueños

---

## 📋 RESUMEN

Implementar un **sistema de pagos real y funcional** que reemplace el sistema de pagos simulado actual. El proyecto usa pagos "mock" actualmente, por lo que esta es una funcionalidad **CRÍTICA** para poder lanzar a producción.

**Sistema objetivo:**
- **Pasarela de pagos:** MercadoPago (recomendado para Bolivia/Latinoamérica) o Stripe (internacional)
- **Métodos de pago:** Tarjeta de crédito/débito y códigos QR
- **Confirmación automática:** Webhooks para confirmar pagos sin intervención manual
- **Reembolsos:** Sistema automatizado para cancelaciones
- **Seguridad:** Tokenización de tarjetas, encriptación de datos sensibles

---

## 🎯 OBJETIVOS PRINCIPALES

### 1. **Integración con Pasarela de Pagos**
   - Configurar cuenta de desarrollador en MercadoPago o Stripe
   - Integrar SDK en el backend
   - Configurar credenciales y webhooks

### 2. **Procesamiento de Pagos con Tarjeta**
   - Formulario de pago seguro
   - Tokenización de datos de tarjeta (sin guardar números completos)
   - Procesamiento en servidor con la API de la pasarela
   - Manejo de respuestas (aprobado/rechazado)

### 3. **Generación de Códigos QR**
   - Crear pagos QR para apps móviles (MercadoPago App, etc.)
   - Generar imagen del QR para mostrar al usuario
   - Monitorear estado del pago QR

### 4. **Sistema de Webhooks**
   - Recibir notificaciones automáticas de la pasarela
   - Validar autenticidad de webhooks
   - Actualizar estado de reservas automáticamente
   - Confirmar reservas al recibir pago aprobado

### 5. **Sistema de Reembolsos**
   - Procesar reembolsos automáticos para cancelaciones
   - Calcular montos según política de cancelación
   - Registrar todas las transacciones de reembolso

### 6. **Historial y Trazabilidad**
   - Registro completo de todas las transacciones
   - Estados y cambios de estado
   - Datos para reconciliación contable

---

## 📐 ARQUITECTURA DEL SISTEMA

### Flujo General de Pago

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  CHECKOUT PAGE                                                │
│  ┌─────────────────────────────────────────────────┐         │
│  │ Resumen de Reserva                              │         │
│  │ Cancha: Fútbol A                                │         │
│  │ Fecha: 30/10/2024  Hora: 18:00-19:00          │         │
│  │ Monto: Bs 200.00                                │         │
│  ├─────────────────────────────────────────────────┤         │
│  │ Método de Pago:                                 │         │
│  │ ( ) Tarjeta de Crédito/Débito                   │         │
│  │ ( ) QR (MercadoPago, Tigo Money)               │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  SI ELIGE TARJETA:                                            │
│  ┌─────────────────────────────────────────────────┐         │
│  │ Número de tarjeta: [____-____-____-____]        │         │
│  │ Nombre: [_________________________]             │         │
│  │ Vencimiento: [MM/YY]  CVV: [___]                │         │
│  │ [🔒 Pago Seguro con MercadoPago]               │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  SI ELIGE QR:                                                 │
│  ┌─────────────────────────────────────────────────┐         │
│  │  Escanea el código QR con tu app:              │         │
│  │  ┌───────────┐                                  │         │
│  │  │  QR CODE  │                                  │         │
│  │  │  IMAGEN   │                                  │         │
│  │  └───────────┘                                  │         │
│  │  Esperando pago...  🔄                          │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓ ↑
              POST /api/pagos/tarjeta o /qr
                           ↓ ↑
┌──────────────────────────────────────────────────────────────┐
│            BACKEND (Node.js + Express)                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  PAGO CON TARJETA:                                            │
│  1. Recibir datos tokenizados desde frontend                 │
│  2. Crear preferencia de pago en MercadoPago                 │
│  3. Ejecutar cargo a la tarjeta                              │
│  4. Recibir respuesta (approved/rejected)                    │
│  5. Guardar transacción en BD                                │
│  6. Si aprobado: actualizar reserva a "Confirmada"           │
│  7. Retornar resultado al frontend                           │
│                                                               │
│  PAGO CON QR:                                                 │
│  1. Crear orden de pago en MercadoPago                       │
│  2. Generar QR code                                          │
│  3. Retornar URL/imagen del QR                               │
│  4. Esperar webhook de confirmación                          │
│                                                               │
│  WEBHOOK (Confirmación automática):                          │
│  1. MercadoPago envía POST /api/pagos/webhook                │
│  2. Validar firma/autenticidad                               │
│  3. Buscar transacción por ID externo                        │
│  4. Actualizar estado → "APROBADO"                           │
│  5. Actualizar reserva → "Confirmada"                        │
│  6. Enviar email de confirmación al cliente                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌──────────────────────────────────────────────────────────────┐
│              MERCADOPAGO / STRIPE API                         │
├──────────────────────────────────────────────────────────────┤
│  - Procesar pagos                                             │
│  - Tokenizar tarjetas                                         │
│  - Generar QR                                                 │
│  - Enviar webhooks                                            │
│  - Procesar reembolsos                                        │
└──────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌──────────────────────────────────────────────────────────────┐
│                  BASE DE DATOS (MySQL)                        │
├──────────────────────────────────────────────────────────────┤
│  Tabla: Transaccion                                           │
│  Tabla: Reembolso                                             │
│  Tabla: Reserva (actualizar estado)                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ BACKEND - ESTRUCTURA Y ENDPOINTS

### 1. BASE DE DATOS - Tablas Necesarias

#### Crear tabla Transaccion

**Objetivo:** Registrar todas las transacciones de pago del sistema.

**Campos principales:**
- `idTransaccion`: ID único interno
- `idReserva`: FK a la reserva asociada
- `idCliente`: FK al cliente que paga
- `monto`: Monto total en Bolivianos o USD
- `moneda`: BOB o USD
- `metodoPago`: TARJETA, QR, EFECTIVO
- `estado`: PENDIENTE, APROBADO, RECHAZADO, REEMBOLSADO
- `idPagoExterno`: ID que retorna MercadoPago/Stripe
- `proveedorPago`: MercadoPago o Stripe
- `ultimos4Digitos`: Últimos 4 dígitos de tarjeta (para referencia)
- `tipoTarjeta`: VISA, MASTERCARD, AMEX, etc.
- `qrData`: Datos del QR generado
- `qrImageUrl`: URL de la imagen del QR
- `ipCliente`: IP desde donde se hizo el pago
- `creadoEn`: Timestamp de creación
- `aprobadoEn`: Timestamp de aprobación

**Índices necesarios:**
- Por `idReserva` (buscar transacción de una reserva)
- Por `idPagoExterno` (buscar por ID de MercadoPago)
- Por `estado` (filtrar transacciones)
- Por fecha (reportes)

---

#### Crear tabla Reembolso

**Objetivo:** Registrar todos los reembolsos procesados.

**Campos principales:**
- `idReembolso`: ID único
- `idTransaccion`: FK a la transacción original
- `monto`: Monto reembolsado (puede ser parcial)
- `motivo`: Razón del reembolso
- `estado`: PENDIENTE, PROCESADO, RECHAZADO
- `idReembolsoExterno`: ID de MercadoPago del reembolso
- `procesadoEn`: Fecha de procesamiento

---

### 2. CONFIGURACIÓN DE MERCADOPAGO

#### Obtener credenciales

**Pasos:**
1. Crear cuenta en https://www.mercadopago.com.bo
2. Ir a "Tu negocio" → "Configuración" → "Credenciales"
3. Obtener:
   - **Access Token** (para servidor)
   - **Public Key** (para frontend)
4. Configurar URL de Webhooks en el panel

**Variables de entorno necesarias:**
```
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx (producción: APP-xxxxx)
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx (producción: APP-xxxxx)
PAYMENT_WEBHOOK_SECRET=tu_secreto_aleatorio
FRONTEND_URL=http://localhost:5173 (o URL de producción)
```

---

#### Configuración del SDK

**Dependencia a instalar:**
- `mercadopago` (SDK oficial de Node.js)

**Inicialización:**
Crear archivo de configuración que inicialice el SDK con el access token al arrancar el servidor.

---

### 3. SERVICIO DE PAGOS CON TARJETA

#### MercadoPagoService - Procesar Pago con Tarjeta

**Objetivo:** Ejecutar un cargo a una tarjeta de crédito/débito.

**Flujo del servicio:**

1. **Recibir datos del pago:**
   - Token de tarjeta (generado en frontend por SDK de MercadoPago)
   - Monto
   - Email del pagador
   - Descripción

2. **Crear preferencia de pago:**
   Configurar objeto con:
   - transaction_amount: monto
   - token: token de tarjeta
   - description: "Reserva cancha..."
   - installments: cuotas (normalmente 1)
   - payment_method_id: visa, master, etc.
   - payer: email

3. **Ejecutar el pago:**
   Llamar a la API de MercadoPago para procesar el cargo.

4. **Manejar respuesta:**
   - **approved:** Pago exitoso → actualizar reserva
   - **rejected:** Pago rechazado → mostrar error
   - **pending:** Pago pendiente → esperar webhook
   - **in_process:** En revisión

5. **Guardar transacción:**
   Registrar en tabla `Transaccion` con:
   - ID de pago de MercadoPago
   - Estado
   - Últimos 4 dígitos
   - Tipo de tarjeta
   - Todos los datos relevantes

6. **Retornar resultado:**
   Responder al frontend con estado y mensaje.

---

### 4. SERVICIO DE PAGOS CON QR

#### MercadoPagoService - Generar Código QR

**Objetivo:** Crear un QR que el usuario puede escanear con app de MercadoPago.

**Flujo del servicio:**

1. **Crear orden de pago:**
   Configurar:
   - Monto y moneda
   - Descripción del pago
   - URL de callback (notificación)
   - Metadata (idReserva, idCliente)

2. **Generar QR:**
   MercadoPago retorna:
   - `qr_data`: String del QR
   - `qr_image`: URL de imagen del QR
   - `in_store_order_id`: ID de la orden
   - `ticket_url`: URL para ver ticket

3. **Guardar transacción pendiente:**
   Crear registro en `Transaccion` con:
   - estado: PENDIENTE
   - metodoPago: QR
   - qrData y qrImageUrl
   - idPagoExterno: in_store_order_id

4. **Retornar QR al frontend:**
   Enviar URL de imagen y datos necesarios.

5. **Polling o WebSocket (opcional):**
   Frontend puede hacer polling cada 5 segundos para verificar si ya se pagó.

---

### 5. SISTEMA DE WEBHOOKS

#### WebhookController - Recibir Notificaciones

**Objetivo:** Recibir notificaciones automáticas cuando un pago cambia de estado.

**Endpoint:**
```
POST /api/pagos/webhook
```

**Flujo:**

1. **Recibir POST de MercadoPago:**
   MercadoPago envía JSON con:
   - `type`: payment
   - `action`: payment.created, payment.updated
   - `data.id`: ID del pago

2. **Validar autenticidad:**
   - Verificar firma (x-signature header)
   - Verificar que viene de IP de MercadoPago
   - Opcional: validar secreto compartido

3. **Obtener detalles del pago:**
   Hacer GET a API de MercadoPago con el payment ID para obtener estado actualizado.

4. **Buscar transacción:**
   Buscar en BD por `idPagoExterno` = payment ID.

5. **Actualizar estado:**
   - Si estado = approved:
     - Actualizar Transaccion.estado → APROBADO
     - Actualizar Reserva.estado → Confirmada
     - Enviar email de confirmación al cliente
   - Si estado = rejected:
     - Actualizar Transaccion.estado → RECHAZADO
     - Notificar al cliente

6. **Responder 200 OK:**
   Siempre responder con código 200 para que MercadoPago no reintente.

---

**Configuración del Webhook en MercadoPago:**
- URL: `https://tu-dominio.com/api/pagos/webhook`
- Eventos: Pagos (crear, actualizar)
- En desarrollo usar ngrok o similar para exponer localhost

---

### 6. SERVICIO DE REEMBOLSOS

#### ReembolsoService - Procesar Reembolso

**Objetivo:** Devolver dinero al cliente cuando cancela una reserva.

**Flujo del servicio:**

1. **Recibir solicitud de reembolso:**
   Desde endpoint de cancelación de reserva.

2. **Buscar transacción original:**
   Por `idReserva`.

3. **Validar que está aprobada:**
   Solo se puede reembolsar pagos APROBADOS.

4. **Calcular monto de reembolso:**
   Según política de cancelación:
   - Más de 24h antes: 100% reembolso
   - Entre 12h-24h: 50% reembolso
   - Menos de 12h: 0% reembolso

5. **Llamar API de reembolso de MercadoPago:**
   POST a `/v1/payments/{payment_id}/refunds`
   Body: `{ amount: monto }`

6. **Crear registro en tabla Reembolso:**
   - idTransaccion
   - monto
   - motivo: "Cancelación de reserva"
   - estado: PROCESADO
   - idReembolsoExterno

7. **Actualizar Transaccion.estado → REEMBOLSADO**

8. **Notificar al cliente:**
   Email informando que recibirá el reembolso en 5-10 días hábiles.

---

### 7. ENDPOINTS PRINCIPALES

#### 7.1 Procesar Pago con Tarjeta
```
POST /api/pagos/tarjeta
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "idReserva": 123,
  "tokenTarjeta": "abc123xyz",      // Token de MercadoPago SDK
  "metodoPago": "visa",
  "cuotas": 1,
  "email": "cliente@example.com"
}

Response éxito:
{
  "success": true,
  "message": "Pago procesado exitosamente",
  "data": {
    "idTransaccion": 456,
    "estado": "APROBADO",
    "idPagoExterno": "1234567890",
    "ultimos4Digitos": "4242",
    "fechaAprobacion": "2024-10-30T10:30:00Z"
  }
}

Response error:
{
  "success": false,
  "message": "Tarjeta rechazada",
  "error": {
    "codigo": "cc_rejected_insufficient_amount",
    "descripcion": "Fondos insuficientes"
  }
}
```

---

#### 7.2 Generar QR de Pago
```
POST /api/pagos/qr
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "idReserva": 123,
  "monto": 200.00,
  "descripcion": "Reserva Cancha Fútbol A - 30/10/2024 18:00"
}

Response:
{
  "success": true,
  "data": {
    "idTransaccion": 457,
    "qrImageUrl": "https://mercadopago.com/qr/abc123.png",
    "qrData": "00020101021243650016COM.MERCADOLIBRE...",
    "ticketUrl": "https://mercadopago.com/ticket/abc123",
    "expiraEn": "2024-10-30T11:00:00Z"   // 30 minutos
  }
}
```

---

#### 7.3 Webhook de Confirmación
```
POST /api/pagos/webhook
Content-Type: application/json

Body (enviado por MercadoPago):
{
  "type": "payment",
  "action": "payment.updated",
  "data": {
    "id": "1234567890"
  }
}

Response:
200 OK

Lógica interna:
1. Obtener detalles del payment ID desde MercadoPago
2. Actualizar transacción en BD
3. Confirmar reserva si pago aprobado
```

---

#### 7.4 Obtener Historial de Transacciones
```
GET /api/transacciones
Authorization: Bearer <token>
Query Params:
  - page: número de página (default: 1)
  - limit: resultados por página (default: 20)
  - estado: filtrar por estado (opcional)

Response:
{
  "data": {
    "transacciones": [
      {
        "idTransaccion": 456,
        "idReserva": 123,
        "cancha": "Cancha Fútbol A",
        "monto": 200.00,
        "moneda": "BOB",
        "metodoPago": "TARJETA",
        "estado": "APROBADO",
        "ultimos4Digitos": "4242",
        "fecha": "2024-10-30T10:30:00Z"
      }
    ],
    "paginacion": {
      "total": 50,
      "pagina": 1,
      "totalPaginas": 3
    }
  }
}
```

---

#### 7.5 Obtener Detalle de Transacción
```
GET /api/transacciones/:id
Authorization: Bearer <token>

Response:
{
  "data": {
    "idTransaccion": 456,
    "idReserva": 123,
    "reserva": {
      "cancha": "Cancha Fútbol A",
      "fecha": "2024-10-30",
      "hora": "18:00-19:00"
    },
    "monto": 200.00,
    "moneda": "BOB",
    "metodoPago": "TARJETA",
    "estado": "APROBADO",
    "idPagoExterno": "1234567890",
    "proveedorPago": "MERCADOPAGO",
    "ultimos4Digitos": "4242",
    "tipoTarjeta": "VISA",
    "ipCliente": "192.168.1.1",
    "creadoEn": "2024-10-30T10:29:45Z",
    "aprobadoEn": "2024-10-30T10:30:12Z"
  }
}
```

---

#### 7.6 Solicitar Reembolso
```
POST /api/reembolsos
Authorization: Bearer <token> (solo dueño o admin)
Content-Type: application/json

Body:
{
  "idTransaccion": 456,
  "motivo": "Cancelación por parte del cliente",
  "montoReembolso": 200.00  // opcional, si es parcial
}

Response:
{
  "success": true,
  "message": "Reembolso procesado exitosamente",
  "data": {
    "idReembolso": 789,
    "monto": 200.00,
    "estado": "PROCESADO",
    "estimadoDias": "5-10 días hábiles"
  }
}
```

---

### 8. VALIDACIONES Y SEGURIDAD

**Validaciones críticas:**

1. **Nunca guardar números de tarjeta completos:**
   Solo últimos 4 dígitos para referencia.

2. **Tokenización obligatoria:**
   El frontend debe tokenizar la tarjeta con SDK de MercadoPago antes de enviar al backend.

3. **Validar monto:**
   - Monto > 0
   - Monto coincide con precio de reserva
   - No permitir modificar monto en frontend

4. **Validar estado de reserva:**
   - Solo procesar pago si reserva está en estado PENDIENTE
   - No permitir doble pago

5. **Validar webhook:**
   - Verificar firma x-signature
   - Validar que payment ID existe
   - Proteger contra replay attacks

6. **Timeout en QR:**
   - QR expira después de 30 minutos
   - Cancelar transacción pendiente si expira

7. **Logs de auditoría:**
   - Registrar todas las operaciones de pago
   - Guardar IP, user agent, timestamps

---

## 🎨 FRONTEND - ESTRUCTURA Y COMPONENTES

### 1. MÓDULO DE PAGOS

**Estructura de carpetas:**
```
src/modules/payments/
  pages/
    CheckoutPage.tsx              # Ya existe, mejorar
  components/
    PaymentMethodSelector.tsx     # Selector Tarjeta/QR
    PaymentForm.tsx               # Formulario de tarjeta
    CardInput.tsx                 # Input de tarjeta con validación
    QRPayment.tsx                 # Visualización de QR
    PaymentSuccess.tsx            # Mensaje de éxito
    PaymentError.tsx              # Mensaje de error
    TransactionHistory.tsx        # Historial de pagos
    TransactionCard.tsx           # Card de transacción
  services/
    paymentService.ts             # Llamadas a API
    mercadopagoSDK.ts             # Wrapper del SDK
  types/
    payment.types.ts              # Tipos TypeScript
  lib/
    cardValidation.ts             # Validación de tarjetas
```

---

### 2. INTEGRACIÓN DEL SDK DE MERCADOPAGO EN FRONTEND

**Objetivo:** Tokenizar la tarjeta en el navegador sin que los datos pasen por nuestro servidor.

**Pasos:**

1. **Instalar SDK:**
   Agregar script en `index.html`:
   ```html
   <script src="https://sdk.mercadopago.com/js/v2"></script>
   ```

2. **Inicializar SDK:**
   En componente de pago, crear instancia con Public Key.

3. **Crear formulario:**
   Inputs para:
   - Número de tarjeta
   - Nombre del titular
   - Fecha de vencimiento
   - CVV

4. **Tokenizar al submit:**
   - SDK captura los datos
   - Envía a servidores de MercadoPago
   - Retorna token seguro
   - Token se envía al backend

**Importante:** Los datos de la tarjeta nunca llegan a tu servidor, solo el token.

---

### 3. COMPONENTE PAYMENTFORM

**Funcionalidades:**

1. **Inputs con validación:**
   - Número de tarjeta: formato automático (1234 5678 9012 3456)
   - Validación de Luhn algorithm
   - Detectar tipo de tarjeta (Visa, Master, Amex)
   - Fecha vencimiento: formato MM/YY
   - CVV: 3 o 4 dígitos según tarjeta

2. **Validación en tiempo real:**
   - Mostrar ícono de tarjeta detectada
   - Errores claros (tarjeta inválida, vencida, etc.)
   - Deshabilitar submit hasta que todo sea válido

3. **Loading states:**
   - Mostrar spinner mientras procesa
   - Deshabilitar inputs durante procesamiento
   - Prevenir doble submit

4. **Manejo de errores:**
   - Tarjeta rechazada: mostrar razón específica
   - Timeout: reintentar
   - Error de red: mensaje claro

5. **Mensajes de éxito:**
   - Confirmación visual
   - Número de transacción
   - Botón para ver reserva confirmada

---

### 4. COMPONENTE QRPAYMENT

**Funcionalidades:**

1. **Mostrar QR grande:**
   - Imagen del QR centrada
   - Tamaño adecuado para escanear
   - Opcional: botón para descargar QR

2. **Instrucciones claras:**
   - "Escanea el QR con tu app de MercadoPago"
   - Lista de apps compatibles
   - Monto a pagar destacado

3. **Indicador de espera:**
   - "Esperando confirmación de pago..."
   - Animación de loading
   - Temporizador: QR expira en 30 minutos

4. **Polling de estado:**
   - Cada 5 segundos verificar si ya se pagó
   - GET /api/transacciones/:id/estado
   - Al confirmar: redirigir a confirmación

5. **Alternativas:**
   - Link para ver ticket en navegador
   - Botón "Cancelar pago"
   - Botón "Usar otro método"

---

### 5. COMPONENTE TRANSACTIONHISTORY

**Funcionalidades:**

1. **Lista de transacciones:**
   - Ordenadas por fecha (más reciente primero)
   - Paginación
   - Filtros por estado, fecha, método

2. **Card por transacción:**
   - Cancha reservada
   - Fecha y hora
   - Monto pagado
   - Método de pago
   - Estado (con badge coloreado)
   - Últimos 4 dígitos (si tarjeta)
   - Fecha de transacción

3. **Acciones:**
   - Ver detalle (modal con toda la info)
   - Descargar recibo (PDF)
   - Solicitar reembolso (si aplica)

4. **Estados visuales:**
   - APROBADO: Verde ✅
   - PENDIENTE: Amarillo ⏳
   - RECHAZADO: Rojo ❌
   - REEMBOLSADO: Azul ↩️

---

### 6. SERVICIO FRONTEND

**paymentService.ts:**

Funciones principales:

```typescript
// Tipos de ejemplo
interface PaymentRequest {
  idReserva: number;
  metodoPago: 'TARJETA' | 'QR';
  tokenTarjeta?: string;
  email: string;
}

interface PaymentResponse {
  success: boolean;
  idTransaccion: number;
  estado: string;
  mensaje: string;
}

// Funciones
processCardPayment(data: PaymentRequest): Promise<PaymentResponse>
generateQRPayment(idReserva: number, monto: number): Promise<QRData>
checkPaymentStatus(idTransaccion: number): Promise<PaymentStatus>
getTransactionHistory(filters): Promise<Transaction[]>
getTransactionDetail(id: number): Promise<Transaction>
requestRefund(idTransaccion: number): Promise<RefundResponse>
```

---

### 7. FLUJOS DE USUARIO COMPLETOS

#### Flujo: Pago con Tarjeta

```
1. Usuario está en CheckoutPage
2. Ve resumen de reserva y monto
3. Selecciona "Tarjeta de Crédito/Débito"
4. PaymentForm se muestra
5. Ingresa datos de tarjeta:
   - Número: 4242 4242 4242 4242 (ej. Visa de prueba)
   - Nombre: JUAN PEREZ
   - Vencimiento: 12/25
   - CVV: 123
6. Validación en tiempo real:
   - ✅ Tarjeta válida (Luhn)
   - ✅ No vencida
   - ✅ CVV correcto
7. Click en "Pagar Bs 200.00"
8. Loading state: "Procesando pago..."
9. Frontend:
   - Llama a SDK de MercadoPago
   - Tokeniza la tarjeta
   - Recibe token: "tok_abc123xyz"
10. POST /api/pagos/tarjeta
    Body: { idReserva, tokenTarjeta, email }
11. Backend:
    - Crea pago en MercadoPago
    - MercadoPago procesa cargo
    - Retorna: approved
12. Backend guarda transacción
13. Backend actualiza reserva → Confirmada
14. Response al frontend: { success: true, estado: "APROBADO" }
15. PaymentSuccess se muestra:
    "¡Pago exitoso! ✅"
    "Tu reserva está confirmada"
    "Número de transacción: #456"
    [Ver Mi Reserva]
16. Email enviado al cliente
17. Usuario redirigido a MyBookingsPage
```

---

#### Flujo: Pago con QR

```
1. Usuario en CheckoutPage
2. Selecciona "Código QR"
3. Click en "Generar QR"
4. Loading: "Generando código..."
5. POST /api/pagos/qr
6. Backend:
   - Crea orden en MercadoPago
   - Genera QR
   - Guarda transacción PENDIENTE
7. Response: { qrImageUrl, qrData, idTransaccion }
8. QRPayment component muestra:
   ┌─────────────────────────────┐
   │ Escanea para pagar Bs 200   │
   │                             │
   │   ┌───────────────┐         │
   │   │               │         │
   │   │   QR IMAGE    │         │
   │   │               │         │
   │   └───────────────┘         │
   │                             │
   │ Esperando pago... 🔄        │
   │ Expira en: 29:45            │
   └─────────────────────────────┘
9. Polling inicia: cada 5 seg GET /api/transacciones/:id/estado
10. Usuario abre app MercadoPago en su celular
11. Escanea el QR
12. App muestra: "Pagar Bs 200 a ROGU"
13. Usuario confirma pago en app
14. MercadoPago procesa pago
15. MercadoPago envía webhook a backend
16. Webhook:
    - Actualiza transacción → APROBADO
    - Actualiza reserva → Confirmada
17. Siguiente polling detecta estado APROBADO
18. QRPayment muestra:
    "¡Pago confirmado! ✅"
19. Redirige a confirmación
```

---

## 🧪 TESTING

### Backend

**Tests de Integración:**

1. **Pago con tarjeta de prueba:**
   - Tarjeta aprobada (4242 4242 4242 4242)
   - Tarjeta rechazada por fondos
   - Tarjeta rechazada por datos incorrectos
   - Tarjeta con CVV inválido

2. **Generación de QR:**
   - QR se crea correctamente
   - QR contiene monto correcto
   - Transacción se guarda como PENDIENTE

3. **Webhooks:**
   - Webhook válido actualiza transacción
   - Webhook inválido se rechaza
   - Webhook duplicado no afecta

4. **Reembolsos:**
   - Reembolso total
   - Reembolso parcial
   - Reembolso de pago no aprobado falla

**Herramientas:**
- Postman/Thunder Client para APIs
- Tarjetas de prueba de MercadoPago
- ngrok para exponer localhost y probar webhooks

---

### Frontend

**Tests de Usuario:**

1. **Formulario de tarjeta:**
   - Validación de número (Luhn)
   - Detección de tipo de tarjeta
   - Validación de fecha vencimiento
   - Validación de CVV

2. **Flujo completo:**
   - Llenar formulario → Submit → Ver éxito
   - Llenar formulario → Submit → Ver error
   - Generar QR → Ver QR → Polling → Confirmación

3. **Historial:**
   - Ver lista de transacciones
   - Filtrar por estado
   - Ver detalle de transacción

**Herramientas:**
- React Testing Library
- Testing manual con tarjetas de prueba

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Configuración Inicial
- [ ] Crear cuenta de MercadoPago
- [ ] Obtener credenciales de prueba
- [ ] Instalar SDK en backend
- [ ] Configurar variables de entorno
- [ ] Configurar webhook URL (con ngrok en desarrollo)

### Base de Datos
- [ ] Crear tabla Transaccion
- [ ] Crear tabla Reembolso
- [ ] Crear índices necesarios
- [ ] Scripts SQL documentados

### Backend - Servicios
- [ ] MercadoPagoService - procesarPagoTarjeta()
- [ ] MercadoPagoService - generarQR()
- [ ] TransaccionService - crear(), actualizar(), obtener()
- [ ] ReembolsoService - crear(), procesar()
- [ ] EmailService - enviar confirmaciones (si no existe)

### Backend - Controladores
- [ ] PagoController - POST /api/pagos/tarjeta
- [ ] PagoController - POST /api/pagos/qr
- [ ] WebhookController - POST /api/pagos/webhook
- [ ] TransaccionController - GET /api/transacciones
- [ ] TransaccionController - GET /api/transacciones/:id
- [ ] ReembolsoController - POST /api/reembolsos

### Backend - Validaciones
- [ ] Validar monto > 0
- [ ] Validar reserva existe y está PENDIENTE
- [ ] Validar no doble pago
- [ ] Validar autenticidad de webhooks
- [ ] Validar permisos (solo cliente puede pagar su reserva)

### Frontend - SDK
- [ ] Integrar SDK de MercadoPago en HTML
- [ ] Wrapper de SDK en React
- [ ] Función de tokenización

### Frontend - Componentes
- [ ] PaymentMethodSelector
- [ ] PaymentForm con validaciones
- [ ] CardInput con formato automático
- [ ] QRPayment con polling
- [ ] PaymentSuccess
- [ ] PaymentError
- [ ] TransactionHistory
- [ ] TransactionCard

### Frontend - Servicios
- [ ] paymentService.ts completo
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Retry logic

### Integración
- [ ] Actualizar CheckoutPage para usar nuevos componentes
- [ ] Integrar con sistema de reservas existente
- [ ] Emails de confirmación
- [ ] Actualizar MyBookingsPage para mostrar transacciones

### Testing
- [ ] Probar pago con tarjeta aprobada
- [ ] Probar pago con tarjeta rechazada
- [ ] Probar generación de QR
- [ ] Probar webhook en desarrollo (ngrok)
- [ ] Probar reembolso completo
- [ ] Probar reembolso parcial
- [ ] Probar historial de transacciones
- [ ] Testing en móvil (QR)

### Producción
- [ ] Cambiar a credenciales de producción
- [ ] Configurar webhook URL de producción
- [ ] SSL/HTTPS obligatorio
- [ ] Logs de auditoría
- [ ] Monitoring de pagos
- [ ] Alertas de pagos fallidos

---

## 📚 RECURSOS Y REFERENCIAS

### Documentación Oficial
- MercadoPago Developers: https://www.mercadopago.com.bo/developers
- SDK Node.js: https://github.com/mercadopago/sdk-nodejs
- SDK JS Frontend: https://www.mercadopago.com.bo/developers/es/docs/checkout-api/integration-configuration/card/integrate-javascript

### Tarjetas de Prueba
- Visa: 4242 4242 4242 4242
- Mastercard: 5031 4332 1540 6351
- Amex: 3782 822463 10005
- CVV: cualquier 3 dígitos
- Vencimiento: cualquier fecha futura

### Códigos de Respuesta
- approved: Pago aprobado
- rejected: Pago rechazado
- pending: Pendiente de confirmación
- in_process: En revisión

### Testing
- ngrok: https://ngrok.com/ (para exponer localhost)
- Postman: colecciones de API

---

**Fecha inicio:** ___________  
**Fecha fin:** ___________  
**Responsable:** ___________
