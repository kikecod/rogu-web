# 🔔 TRABAJO ENRIQUE: SISTEMA DE NOTIFICACIONES

**Responsable:** Enrique  
**Duración estimada:** 2 semanas  
**Prioridad:** 🟡 ALTA  

> **NOTA IMPORTANTE:** Este documento forma parte del sistema ROGU:
> - **Kike:** Sistema de Pagos Real
> - **Samy:** Sistema de Reseñas y Calificaciones
> - **Denzel:** Perfil y Configuración de Usuario
> - **Oscar:** Dashboard/Panel de Análisis para Dueños
> - **oscar:** Sistema de Notificaciones (este documento)

---

## 📋 RESUMEN

Implementar un **sistema completo de notificaciones** que mantenga a los usuarios informados sobre eventos importantes en la plataforma (reservas, pagos, reseñas, recordatorios).

**Estado actual:**
- Solo existe preferencia de notificaciones en perfil
- NO hay tabla de notificaciones en BD
- NO hay envío de emails
- NO hay notificaciones en tiempo real
- NO hay centro de notificaciones en UI
- NO hay notificaciones push

**Sistema objetivo:**
- Notificaciones en tiempo real (in-app)
- Notificaciones por email
- Centro de notificaciones con historial
- Notificaciones push (opcional)
- Preferencias granulares por tipo
- Marcar como leído/no leído
- Badges con contador
- Sonidos y visuales (opcionales)

---

## 🎯 OBJETIVOS PRINCIPALES

### 1. **Centro de Notificaciones (In-App)**
   - Dropdown/panel accesible desde header
   - Lista de notificaciones recientes
   - Badge con contador de no leídas
   - Marcar como leída individual o todas
   - Eliminar notificaciones
   - Ver historial completo

### 2. **Notificaciones por Email**
   - Plantillas HTML profesionales
   - Envío asíncrono (queue)
   - Tracking de apertura (opcional)
   - Unsubscribe link
   - Rate limiting
   - Retry logic para fallos

### 3. **Tipos de Notificaciones**
   - **Reservas:** Confirmación, recordatorio 24h antes, cancelación
   - **Pagos:** Pago exitoso, pago fallido, reembolso procesado
   - **Reseñas:** Nueva reseña recibida (para dueños), respuesta del dueño
   - **Sistema:** Cambios en términos, mantenimiento programado
   - **Promociones:** Ofertas especiales, descuentos (opcional)

### 4. **Preferencias Granulares**
   - Activar/desactivar por tipo de notificación
   - Elegir canal (in-app, email, ambos)
   - Horario de no molestar
   - Frecuencia (inmediato, diario, semanal)

### 5. **Notificaciones en Tiempo Real**
   - WebSockets o Server-Sent Events
   - Actualización automática del contador
   - Toast/alert visual al recibir nueva
   - Sonido opcional

### 6. **Performance y Escalabilidad**
   - Queue system (Bull/Redis)
   - Batch processing para emails masivos
   - Archivado automático de notificaciones antiguas
   - Índices optimizados en BD

---

## 📐 ARQUITECTURA DEL SISTEMA

### Flujo General de Notificación

```
┌──────────────────────────────────────────────────────────────┐
│                    EVENTO DISPARADOR                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Ejemplos de eventos:                                         │
│  - Usuario crea una reserva                                   │
│  - Pago es confirmado                                         │
│  - Dueño recibe una nueva reseña                             │
│  - Reserva próxima (24h antes)                               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              NOTIFICATIONSERVICE (Backend)                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Evento recibido                                           │
│  2. Determinar tipo de notificación                          │
│  3. Identificar destinatarios                                 │
│  4. Verificar preferencias de usuario                         │
│  5. Crear registro en BD                                      │
│  6. Encolar en queue para envío                              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
┌───────────────────────┐  ┌───────────────────────┐
│   IN-APP              │  │   EMAIL               │
│   NOTIFICATION        │  │   NOTIFICATION        │
├───────────────────────┤  ├───────────────────────┤
│                       │  │                       │
│ 1. Guardar en BD      │  │ 1. Queue job          │
│ 2. Emitir WebSocket   │  │ 2. Generar HTML       │
│ 3. Incrementar badge  │  │ 3. Enviar SMTP        │
│ 4. Mostrar toast      │  │ 4. Registrar envío    │
│                       │  │ 5. Retry si falla     │
└───────────────────────┘  └───────────────────────┘
         ↓                           ↓
┌───────────────────────────────────────────────────┐
│              FRONTEND (React)                      │
├───────────────────────────────────────────────────┤
│                                                    │
│  HEADER - NOTIFICATION BELL                        │
│  ┌─────────────────────────────────────────┐      │
│  │  🔔 (3)  ← Badge con contador           │      │
│  └─────────────────────────────────────────┘      │
│                ↓ (click)                           │
│  ┌─────────────────────────────────────────┐      │
│  │  Notificaciones                 [⚙️]    │      │
│  ├─────────────────────────────────────────┤      │
│  │  🎉 ¡Reserva confirmada!                │      │
│  │  Cancha Fútbol A - 30/10 18:00         │      │
│  │  Hace 5 minutos             [●]         │      │
│  ├─────────────────────────────────────────┤      │
│  │  💰 Pago procesado exitosamente        │      │
│  │  Bs 200.00 - Tarjeta ****4242          │      │
│  │  Hace 10 minutos            [✓]         │      │
│  ├─────────────────────────────────────────┤      │
│  │  ⭐ Nueva reseña en Cancha A           │      │
│  │  "Excelente instalación" - 5★          │      │
│  │  Hace 1 hora                [✓]         │      │
│  ├─────────────────────────────────────────┤      │
│  │  [Ver todas]  [Marcar todas leídas]    │      │
│  └─────────────────────────────────────────┘      │
│                                                    │
│  TOAST NOTIFICATION (esquina)                      │
│  ┌─────────────────────────────────────────┐      │
│  │  🔔 Nueva notificación                  │      │
│  │  ¡Tu reserva ha sido confirmada!        │      │
│  │                                [X]       │      │
│  └─────────────────────────────────────────┘      │
│                                                    │
└───────────────────────────────────────────────────┘

CORREO ELECTRÓNICO:
┌─────────────────────────────────────────────────────┐
│  De: ROGU <noreply@rogu.bo>                        │
│  Para: usuario@ejemplo.com                          │
│  Asunto: ¡Tu reserva está confirmada! 🎉           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Logo ROGU]                                        │
│                                                     │
│  Hola Juan,                                         │
│                                                     │
│  ¡Buenas noticias! Tu reserva ha sido confirmada.  │
│                                                     │
│  ┌──────────────────────────────────────┐          │
│  │  📅 Fecha: 30 de octubre, 2024       │          │
│  │  ⏰ Hora: 18:00 - 20:00              │          │
│  │  🏟️ Cancha: Cancha Fútbol A          │          │
│  │  📍 Ubicación: Complejo Elite        │          │
│  │  💰 Total: Bs 200.00                 │          │
│  └──────────────────────────────────────┘          │
│                                                     │
│  [Ver mi reserva]  [Agregar al calendario]         │
│                                                     │
│  Recuerda llegar 10 minutos antes.                 │
│                                                     │
│  ¡Disfruta tu juego!                               │
│  El equipo de ROGU                                  │
│                                                     │
│  ──────────────────────────────────────            │
│  No quieres estos emails? [Desuscribirse]          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ BACKEND - ESTRUCTURA Y ENDPOINTS

### 1. BASE DE DATOS - Nuevas Tablas

#### Tabla Notificacion

**Objetivo:** Almacenar todas las notificaciones del sistema.

**Campos principales:**
- `idNotificacion`: ID único
- `idUsuario`: FK al usuario destinatario
- `tipo`: Enum ('RESERVA_CONFIRMADA', 'PAGO_EXITOSO', 'NUEVA_RESENA', etc.)
- `titulo`: Título corto
- `mensaje`: Contenido de la notificación
- `datos`: JSON con datos adicionales (idReserva, idPago, etc.)
- `leida`: Boolean (default: false)
- `archivada`: Boolean (default: false)
- `urlAccion`: Link opcional para "Ver más"
- `icono`: Nombre del icono a mostrar
- `prioridad`: Enum ('ALTA', 'MEDIA', 'BAJA')
- `creadoEn`: Timestamp
- `leidoEn`: Timestamp (nullable)

**SQL:**
```sql
CREATE TABLE Notificacion (
  idNotificacion INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  tipo ENUM(
    'RESERVA_CONFIRMADA',
    'RESERVA_CANCELADA',
    'RESERVA_RECORDATORIO',
    'PAGO_EXITOSO',
    'PAGO_FALLIDO',
    'REEMBOLSO_PROCESADO',
    'NUEVA_RESENA',
    'RESPUESTA_RESENA',
    'PROMOCION',
    'SISTEMA'
  ) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  datos JSON,
  leida BOOLEAN DEFAULT FALSE,
  archivada BOOLEAN DEFAULT FALSE,
  urlAccion VARCHAR(500),
  icono VARCHAR(50),
  prioridad ENUM('ALTA', 'MEDIA', 'BAJA') DEFAULT 'MEDIA',
  creadoEn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  leidoEn TIMESTAMP NULL,
  FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  INDEX idx_usuario_leida (idUsuario, leida),
  INDEX idx_usuario_creado (idUsuario, creadoEn DESC)
);
```

---

#### Tabla NotificacionEmail

**Objetivo:** Log de emails enviados.

**Campos principales:**
- `idEmail`: ID único
- `idNotificacion`: FK a Notificacion (opcional)
- `destinatario`: Email del usuario
- `asunto`: Asunto del email
- `contenidoHtml`: HTML del email
- `estado`: Enum ('PENDIENTE', 'ENVIADO', 'FALLIDO', 'REBOTADO')
- `intentos`: Número de intentos de envío
- `errorMensaje`: Mensaje de error si falla
- `enviadoEn`: Timestamp de envío exitoso
- `creadoEn`: Timestamp

**SQL:**
```sql
CREATE TABLE NotificacionEmail (
  idEmail INT PRIMARY KEY AUTO_INCREMENT,
  idNotificacion INT,
  destinatario VARCHAR(255) NOT NULL,
  asunto VARCHAR(300) NOT NULL,
  contenidoHtml TEXT NOT NULL,
  estado ENUM('PENDIENTE', 'ENVIADO', 'FALLIDO', 'REBOTADO') DEFAULT 'PENDIENTE',
  intentos INT DEFAULT 0,
  errorMensaje TEXT,
  enviadoEn TIMESTAMP NULL,
  creadoEn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idNotificacion) REFERENCES Notificacion(idNotificacion) ON DELETE SET NULL,
  INDEX idx_estado (estado),
  INDEX idx_creado (creadoEn DESC)
);
```

---

#### Modificar Tabla PreferenciaUsuario

**Agregar campos de notificaciones:**
```sql
ALTER TABLE PreferenciaUsuario
ADD COLUMN notificarReservas BOOLEAN DEFAULT TRUE,
ADD COLUMN notificarPagos BOOLEAN DEFAULT TRUE,
ADD COLUMN notificarResenas BOOLEAN DEFAULT TRUE,
ADD COLUMN notificarPromociones BOOLEAN DEFAULT FALSE,
ADD COLUMN notificarSistema BOOLEAN DEFAULT TRUE,
ADD COLUMN canalNotificaciones ENUM('AMBOS', 'EMAIL', 'APP') DEFAULT 'AMBOS',
ADD COLUMN horaNoMolestarInicio TIME DEFAULT NULL,
ADD COLUMN horaNoMolestarFin TIME DEFAULT NULL;
```

---

### 2. SERVICIO DE NOTIFICACIONES

#### NotificationService - Crear Notificación

**Objetivo:** Crear y enviar notificaciones.

**Flujo del servicio:**

1. **Recibir parámetros:**
   ```typescript
   interface CreateNotificationParams {
     idUsuario: number;
     tipo: NotificationType;
     titulo: string;
     mensaje: string;
     datos?: any;
     urlAccion?: string;
     prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
     enviarEmail?: boolean;
   }
   ```

2. **Verificar preferencias del usuario:**
   - Consultar PreferenciaUsuario
   - Verificar si el usuario tiene este tipo activado
   - Verificar horario de "no molestar"
   - Si está desactivado, no continuar

3. **Crear registro en BD:**
   ```sql
   INSERT INTO Notificacion (
     idUsuario, tipo, titulo, mensaje, datos, 
     urlAccion, prioridad, icono
   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
   ```

4. **Emitir evento WebSocket:**
   ```typescript
   io.to(`user_${idUsuario}`).emit('nueva_notificacion', {
     idNotificacion,
     titulo,
     mensaje,
     tipo,
     creadoEn
   });
   ```

5. **Encolar email si aplica:**
   ```typescript
   if (enviarEmail && preferencias.canalNotificaciones !== 'APP') {
     await emailQueue.add('enviar-email', {
       idUsuario,
       idNotificacion,
       tipo,
       titulo,
       mensaje,
       datos
     });
   }
   ```

6. **Retornar notificación creada**

---

#### NotificationService - Enviar Email

**Objetivo:** Generar y enviar email HTML.

**Flujo:**

1. **Obtener datos del usuario:**
   - Nombre, email
   - Preferencias de idioma

2. **Seleccionar plantilla HTML:**
   - Templates por tipo de notificación
   - Variables dinámicas (nombre, fecha, monto, etc.)

3. **Renderizar plantilla:**
   ```typescript
   const html = renderTemplate('reserva-confirmada', {
     nombreUsuario: user.nombres,
     nombreCancha: 'Cancha Fútbol A',
     fecha: '30/10/2024',
     hora: '18:00 - 20:00',
     monto: 'Bs 200.00',
     urlReserva: 'https://rogu.bo/reservas/123'
   });
   ```

4. **Enviar con Nodemailer:**
   ```typescript
   await transporter.sendMail({
     from: 'ROGU <noreply@rogu.bo>',
     to: user.correo,
     subject: titulo,
     html: html,
     headers: {
       'X-Notification-ID': idNotificacion
     }
   });
   ```

5. **Registrar en NotificacionEmail:**
   ```sql
   INSERT INTO NotificacionEmail (
     idNotificacion, destinatario, asunto, 
     contenidoHtml, estado, enviadoEn
   ) VALUES (?, ?, ?, ?, 'ENVIADO', NOW());
   ```

6. **Manejo de errores:**
   - Si falla, registrar error
   - Incrementar contador de intentos
   - Reintentar hasta 3 veces
   - Si falla 3 veces, marcar como FALLIDO

---

### 3. TIPOS DE NOTIFICACIONES

#### 3.1 Reserva Confirmada

**Trigger:** Después de crear reserva exitosamente

**Datos:**
```typescript
{
  tipo: 'RESERVA_CONFIRMADA',
  titulo: '¡Reserva confirmada! 🎉',
  mensaje: 'Tu reserva para Cancha Fútbol A ha sido confirmada',
  datos: {
    idReserva: 123,
    nombreCancha: 'Cancha Fútbol A',
    fecha: '2024-10-30',
    horaInicio: '18:00',
    horaFin: '20:00',
    monto: 200.00
  },
  urlAccion: '/bookings/123',
  icono: 'calendar-check',
  prioridad: 'ALTA'
}
```

**Email:** Plantilla con detalles de reserva, botón "Ver reserva", agregar a calendario

---

#### 3.2 Recordatorio de Reserva

**Trigger:** Cron job 24 horas antes de la reserva

**Datos:**
```typescript
{
  tipo: 'RESERVA_RECORDATORIO',
  titulo: 'Recordatorio: Tienes una reserva mañana ⏰',
  mensaje: 'No olvides tu reserva en Cancha Fútbol A mañana a las 18:00',
  datos: {
    idReserva: 123,
    nombreCancha: 'Cancha Fútbol A',
    fecha: '2024-10-30',
    horaInicio: '18:00'
  },
  urlAccion: '/bookings/123',
  prioridad: 'ALTA'
}
```

---

#### 3.3 Pago Exitoso

**Trigger:** Después de confirmar pago (webhook)

**Datos:**
```typescript
{
  tipo: 'PAGO_EXITOSO',
  titulo: '¡Pago procesado! 💰',
  mensaje: 'Tu pago de Bs 200.00 ha sido procesado exitosamente',
  datos: {
    idTransaccion: 456,
    monto: 200.00,
    metodoPago: 'TARJETA',
    ultimos4: '4242'
  },
  urlAccion: '/bookings/123',
  prioridad: 'ALTA'
}
```

---

#### 3.4 Nueva Reseña (para Dueño)

**Trigger:** Cliente deja una reseña en cancha del dueño

**Datos:**
```typescript
{
  tipo: 'NUEVA_RESENA',
  titulo: 'Nueva reseña en Cancha Fútbol A ⭐',
  mensaje: 'Juan Pérez dejó una reseña de 5 estrellas',
  datos: {
    idResena: 789,
    idCancha: 4,
    nombreCancha: 'Cancha Fútbol A',
    calificacion: 5,
    nombreCliente: 'Juan Pérez'
  },
  urlAccion: '/admin/reviews/789',
  prioridad: 'MEDIA'
}
```

---

#### 3.5 Respuesta a Reseña

**Trigger:** Dueño responde a reseña del cliente

**Datos:**
```typescript
{
  tipo: 'RESPUESTA_RESENA',
  titulo: 'El dueño respondió tu reseña 💬',
  mensaje: 'Complejo Elite respondió tu reseña de Cancha Fútbol A',
  datos: {
    idResena: 789,
    nombreCancha: 'Cancha Fútbol A',
    respuesta: 'Gracias por tu comentario...'
  },
  urlAccion: '/fields/4#reviews',
  prioridad: 'BAJA'
}
```

---

#### 3.6 Cancelación de Reserva

**Trigger:** Usuario o admin cancela reserva

**Datos:**
```typescript
{
  tipo: 'RESERVA_CANCELADA',
  titulo: 'Reserva cancelada',
  mensaje: 'Tu reserva para Cancha Fútbol A ha sido cancelada',
  datos: {
    idReserva: 123,
    nombreCancha: 'Cancha Fútbol A',
    fecha: '2024-10-30',
    motivo: 'Cancelación por usuario'
  },
  prioridad: 'ALTA'
}
```

---

### 4. ENDPOINTS PRINCIPALES

#### 4.1 Obtener Notificaciones del Usuario

```
GET /api/notificaciones
Authorization: Bearer <token>
Query Params:
  - leida: boolean (filtrar por leídas/no leídas)
  - tipo: NotificationType (filtrar por tipo)
  - limite: number (default: 20)
  - pagina: number (default: 1)

Response:
{
  "success": true,
  "data": {
    "notificaciones": [
      {
        "idNotificacion": 1,
        "tipo": "RESERVA_CONFIRMADA",
        "titulo": "¡Reserva confirmada! 🎉",
        "mensaje": "Tu reserva para Cancha Fútbol A ha sido confirmada",
        "datos": {...},
        "leida": false,
        "urlAccion": "/bookings/123",
        "icono": "calendar-check",
        "creadoEn": "2024-11-01T10:30:00Z"
      }
    ],
    "total": 45,
    "noLeidas": 3,
    "pagina": 1,
    "totalPaginas": 3
  }
}
```

---

#### 4.2 Marcar Notificación como Leída

```
PUT /api/notificaciones/:id/leer
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

---

#### 4.3 Marcar Todas como Leídas

```
PUT /api/notificaciones/leer-todas
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas",
  "actualizadas": 5
}
```

---

#### 4.4 Eliminar Notificación

```
DELETE /api/notificaciones/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Notificación eliminada"
}
```

---

#### 4.5 Obtener Contador de No Leídas

```
GET /api/notificaciones/contador
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "noLeidas": 3,
    "total": 45
  }
}
```

---

#### 4.6 Actualizar Preferencias de Notificaciones

```
PUT /api/profile/preferencias-notificaciones
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "notificarReservas": true,
  "notificarPagos": true,
  "notificarResenas": false,
  "notificarPromociones": false,
  "canalNotificaciones": "AMBOS",
  "horaNoMolestarInicio": "22:00",
  "horaNoMolestarFin": "08:00"
}

Response:
{
  "success": true,
  "message": "Preferencias actualizadas"
}
```

---

### 5. WEBSOCKETS - Notificaciones en Tiempo Real

#### Configuración del Server

```typescript
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Middleware de autenticación
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, SECRET);
    socket.userId = decoded.idUsuario;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Conexión del cliente
io.on('connection', (socket) => {
  console.log(`Usuario ${socket.userId} conectado`);
  
  // Unirse a room personal
  socket.join(`user_${socket.userId}`);
  
  // Enviar contador inicial
  NotificationService.getUnreadCount(socket.userId)
    .then(count => {
      socket.emit('unread_count', { count });
    });
  
  socket.on('disconnect', () => {
    console.log(`Usuario ${socket.userId} desconectado`);
  });
});

// Emitir notificación a usuario específico
export const emitNotification = (userId: number, notification: any) => {
  io.to(`user_${userId}`).emit('nueva_notificacion', notification);
};
```

---

### 6. EMAIL - Configuración y Plantillas

#### Configuración de Nodemailer

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verificar configuración
transporter.verify((error, success) => {
  if (error) {
    console.error('Error en configuración SMTP:', error);
  } else {
    console.log('Servidor SMTP listo');
  }
});
```

---

#### Plantilla Base HTML

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{titulo}}</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 3px solid #2563eb;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
    }
    .content {
      padding: 30px 0;
    }
    .card {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #2563eb;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">ROGU</div>
  </div>
  
  <div class="content">
    <h2>{{titulo}}</h2>
    <p>Hola {{nombreUsuario}},</p>
    
    {{contenido}}
    
    <p>¡Gracias por usar ROGU!</p>
    <p>El equipo de ROGU</p>
  </div>
  
  <div class="footer">
    <p>© 2025 ROGU. Todos los derechos reservados.</p>
    <p>
      <a href="{{urlDesuscribir}}">Desuscribirse de estos emails</a>
    </p>
  </div>
</body>
</html>
```

---

#### Plantilla: Reserva Confirmada

```html
<p>¡Excelentes noticias! Tu reserva ha sido confirmada exitosamente.</p>

<div class="card">
  <p><strong>📅 Fecha:</strong> {{fecha}}</p>
  <p><strong>⏰ Horario:</strong> {{horaInicio}} - {{horaFin}}</p>
  <p><strong>🏟️ Cancha:</strong> {{nombreCancha}}</p>
  <p><strong>📍 Sede:</strong> {{nombreSede}}</p>
  <p><strong>💰 Total pagado:</strong> Bs {{monto}}</p>
</div>

<p style="text-align: center;">
  <a href="{{urlReserva}}" class="button">Ver mi reserva</a>
  <a href="{{urlCalendario}}" class="button" style="background: #10b981;">
    Agregar al calendario
  </a>
</p>

<p><strong>Recuerda:</strong></p>
<ul>
  <li>Llega 10 minutos antes del horario reservado</li>
  <li>Trae tu identificación</li>
  <li>Respeta las reglas de uso de la cancha</li>
</ul>
```

---

### 7. CRON JOBS - Tareas Programadas

#### Recordatorios de Reserva

```typescript
import cron from 'node-cron';

// Ejecutar cada hora
cron.schedule('0 * * * *', async () => {
  console.log('🔔 Verificando reservas para recordatorios...');
  
  // Buscar reservas que inicien en 24 horas (±1 hora para el cron)
  const reservasProximas = await db.query(`
    SELECT r.*, c.nombre as nombreCancha, u.correo, p.nombres
    FROM Reserva r
    JOIN Cancha c ON r.idCancha = c.idCancha
    JOIN Cliente cl ON r.idCliente = cl.idCliente
    JOIN Persona p ON cl.idPersona = p.idPersona
    JOIN Usuario u ON p.idPersona = u.idPersona
    WHERE r.estado = 'Confirmada'
    AND r.iniciaEn BETWEEN NOW() + INTERVAL 23 HOUR 
                        AND NOW() + INTERVAL 25 HOUR
    AND NOT EXISTS (
      SELECT 1 FROM Notificacion n 
      WHERE n.datos->>'$.idReserva' = r.idReserva 
      AND n.tipo = 'RESERVA_RECORDATORIO'
    )
  `);
  
  for (const reserva of reservasProximas) {
    await NotificationService.create({
      idUsuario: reserva.idUsuario,
      tipo: 'RESERVA_RECORDATORIO',
      titulo: 'Recordatorio: Tienes una reserva mañana ⏰',
      mensaje: `No olvides tu reserva en ${reserva.nombreCancha} mañana a las ${reserva.horaInicio}`,
      datos: {
        idReserva: reserva.idReserva,
        nombreCancha: reserva.nombreCancha,
        fecha: reserva.iniciaEn
      },
      urlAccion: `/bookings/${reserva.idReserva}`,
      prioridad: 'ALTA',
      enviarEmail: true
    });
  }
  
  console.log(`✅ ${reservasProximas.length} recordatorios enviados`);
});
```

---

#### Limpieza de Notificaciones Antiguas

```typescript
// Ejecutar diariamente a las 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('🗑️ Limpiando notificaciones antiguas...');
  
  // Archivar notificaciones leídas de más de 30 días
  const result = await db.query(`
    UPDATE Notificacion
    SET archivada = TRUE
    WHERE leida = TRUE
    AND creadoEn < DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND archivada = FALSE
  `);
  
  console.log(`✅ ${result.affectedRows} notificaciones archivadas`);
  
  // Eliminar notificaciones archivadas de más de 90 días
  const deleted = await db.query(`
    DELETE FROM Notificacion
    WHERE archivada = TRUE
    AND creadoEn < DATE_SUB(NOW(), INTERVAL 90 DAY)
  `);
  
  console.log(`✅ ${deleted.affectedRows} notificaciones eliminadas`);
});
```

---

## 🎨 FRONTEND - ESTRUCTURA Y COMPONENTES

### 1. MÓDULO DE NOTIFICACIONES

**Estructura de carpetas:**
```
src/modules/notifications/
  components/
    NotificationBell.tsx          # Icono con badge en header
    NotificationDropdown.tsx      # Panel dropdown con lista
    NotificationList.tsx          # Lista de notificaciones
    NotificationItem.tsx          # Item individual
    NotificationSettings.tsx      # Modal de preferencias
    NotificationToast.tsx         # Toast emergente
    EmptyNotifications.tsx        # Estado vacío
  pages/
    NotificationsPage.tsx         # Página completa de notificaciones
  services/
    notificationService.ts        # API calls
    websocketService.ts           # WebSocket connection
  hooks/
    useNotifications.ts           # Hook principal
    useWebSocket.ts               # Hook de WebSocket
  types/
    notification.types.ts         # Tipos TypeScript
  lib/
    notificationHelpers.ts        # Helpers (iconos, colores)
```

---

### 2. COMPONENTE NOTIFICATIONBELL

**Ubicación:** En el Header, al lado del avatar

**Funcionalidades:**

1. **Badge con contador:**
   - Mostrar número de no leídas (max 99+)
   - Animación al recibir nueva
   - Color distintivo (rojo)

2. **Click handler:**
   - Abrir/cerrar dropdown
   - Click fuera para cerrar
   - Escape key para cerrar

3. **Estado visual:**
   - Ícono de campana
   - Animación de "shake" con nueva notificación
   - Sonido opcional (configurab le)

**Código ejemplo:**
```typescript
interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  isOpen: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount,
  onClick,
  isOpen
}) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Notificaciones"
    >
      <Bell className={`h-6 w-6 ${isOpen ? 'text-blue-600' : 'text-gray-600'}`} />
      
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
```

---

### 3. COMPONENTE NOTIFICATIONDROPDOWN

**Funcionalidades:**

1. **Header del dropdown:**
   - Título "Notificaciones"
   - Botón de configuración
   - Botón "Marcar todas como leídas"

2. **Lista de notificaciones:**
   - Últimas 5-10 notificaciones
   - Scroll si hay más
   - Loading state
   - Empty state

3. **Footer:**
   - Link "Ver todas" → página completa
   - Stats (X no leídas de Y total)

4. **Funcionalidades:**
   - Click en item → marcar como leída + navegar
   - Click en "X" → eliminar notificación
   - Infinite scroll (opcional)

---

### 4. COMPONENTE NOTIFICATIONITEM

**Funcionalidades:**

1. **Visual:**
   - Icono según tipo
   - Título en negrita
   - Mensaje resumido
   - Timestamp relativo ("hace 5 min")
   - Dot de "no leída" (color azul)

2. **Interacciones:**
   - Click → marcar leída + navegar a urlAccion
   - Hover → mostrar opciones
   - Botón eliminar

3. **Estados:**
   - No leída: fondo azul claro
   - Leída: fondo blanco
   - Hover: sombra

**Código ejemplo:**
```typescript
interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClick: (url?: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDelete,
  onClick
}) => {
  const Icon = getIconByType(notification.tipo);
  const timeAgo = getRelativeTime(notification.creadoEn);
  
  const handleClick = () => {
    if (!notification.leida) {
      onRead(notification.idNotificacion);
    }
    if (notification.urlAccion) {
      onClick(notification.urlAccion);
    }
  };
  
  return (
    <div
      className={`p-4 cursor-pointer hover:shadow-md transition-all ${
        notification.leida ? 'bg-white' : 'bg-blue-50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${getColorByPriority(notification.prioridad)}`} />
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">
            {notification.titulo}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {notification.mensaje}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {timeAgo}
          </p>
        </div>
        
        {!notification.leida && (
          <div className="h-2 w-2 bg-blue-600 rounded-full" />
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.idNotificacion);
          }}
          className="text-gray-400 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
```

---

### 5. COMPONENTE NOTIFICATIONTOAST

**Funcionalidades:**

1. **Mostrar al recibir notificación:**
   - Aparece en esquina superior derecha
   - Auto-hide después de 5 segundos
   - Click para ver más / cerrar

2. **Visual:**
   - Icono animado
   - Título
   - Mensaje corto
   - Botón cerrar

3. **Stack de toasts:**
   - Máximo 3 visibles
   - Los nuevos empujan a los viejos

**Código ejemplo:**
```typescript
interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onView: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onView
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm animate-slide-in">
      <div className="flex items-start gap-3">
        <Bell className="h-5 w-5 text-blue-600 animate-ring" />
        
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{notification.titulo}</p>
          <p className="text-sm text-gray-600 line-clamp-2">{notification.mensaje}</p>
        </div>
        
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {notification.urlAccion && (
        <button
          onClick={onView}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver más →
        </button>
      )}
    </div>
  );
};
```

---

### 6. HOOK USENOTIFICATIONS

**Funcionalidades:**

```typescript
interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Conectar WebSocket
  useEffect(() => {
    const ws = websocketService.connect();
    
    ws.on('nueva_notificacion', (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Mostrar toast
      toast.show(notif);
      
      // Reproducir sonido
      if (shouldPlaySound()) {
        playNotificationSound();
      }
    });
    
    ws.on('unread_count', ({ count }: { count: number }) => {
      setUnreadCount(count);
    });
    
    return () => {
      ws.disconnect();
    };
  }, []);
  
  // Implementación de funciones...
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount
  };
};
```

---

### 7. SERVICIO WEBSOCKET

**websocketService.ts:**

```typescript
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  
  connect(): Socket {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token');
    }
    
    this.socket = io(process.env.VITE_WS_URL || 'http://localhost:3000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
    });
    
    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
    });
    
    return this.socket;
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
  
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

export default new WebSocketService();
```

---

## 🧪 TESTING

### Backend Testing

**Tests unitarios:**
1. NotificationService
   - Crear notificación
   - Verificar preferencias
   - Encolar email
   - Emitir WebSocket

2. EmailService
   - Renderizar plantillas
   - Enviar email
   - Manejo de errores
   - Retry logic

3. Cron jobs
   - Recordatorios
   - Limpieza

**Tests de integración:**
- Flujo completo: evento → notificación → email → BD
- WebSocket emit y receive
- Queue processing

---

### Frontend Testing

**Tests de componentes:**
1. NotificationBell
   - Mostrar contador
   - Animaciones
   - Click handler

2. NotificationItem
   - Marcar como leída
   - Eliminar
   - Navegación

3. NotificationToast
   - Auto-hide
   - Acciones

**Tests E2E:**
- Recibir notificación en tiempo real
- Marcar como leída
- Eliminar notificación
- Actualizar preferencias

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Semana 1 (Días 1-7)

**Backend:**
- Días 1-2: Crear tablas Notificacion y NotificacionEmail
- Días 3-4: NotificationService básico
- Días 5-6: Configurar WebSocket
- Día 7: Endpoints básicos

**Frontend:**
- Días 1-2: Estructura de módulo y tipos
- Días 3-4: NotificationBell y NotificationDropdown
- Días 5-7: useNotifications hook y WebSocket client

---

### Semana 2 (Días 8-14)

**Backend:**
- Días 8-10: EmailService con Nodemailer y plantillas
- Días 11-12: Queue system con Bull/Redis
- Días 13-14: Cron jobs y testing

**Frontend:**
- Días 8-10: NotificationToast y animaciones
- Días 11-12: NotificationSettings y preferencias
- Días 13-14: Testing e integración completa

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos
- [ ] Crear tabla Notificacion
- [ ] Crear tabla NotificacionEmail
- [ ] Modificar PreferenciaUsuario
- [ ] Crear índices
- [ ] Scripts SQL documentados

### Backend - Servicios
- [ ] NotificationService.create()
- [ ] NotificationService.getByUser()
- [ ] NotificationService.markAsRead()
- [ ] NotificationService.delete()
- [ ] EmailService.sendEmail()
- [ ] EmailService.renderTemplate()
- [ ] Queue setup con Bull

### Backend - WebSocket
- [ ] Configurar Socket.IO
- [ ] Autenticación con JWT
- [ ] Rooms por usuario
- [ ] Emit events

### Backend - Endpoints
- [ ] GET /api/notificaciones
- [ ] PUT /api/notificaciones/:id/leer
- [ ] PUT /api/notificaciones/leer-todas
- [ ] DELETE /api/notificaciones/:id
- [ ] GET /api/notificaciones/contador
- [ ] PUT /api/profile/preferencias-notificaciones

### Backend - Cron Jobs
- [ ] Recordatorios de reserva (24h antes)
- [ ] Limpieza de notificaciones antiguas

### Frontend - Componentes
- [ ] NotificationBell
- [ ] NotificationDropdown
- [ ] NotificationList
- [ ] NotificationItem
- [ ] NotificationToast
- [ ] NotificationSettings
- [ ] EmptyNotifications

### Frontend - Hooks
- [ ] useNotifications
- [ ] useWebSocket

### Frontend - Servicios
- [ ] notificationService.ts
- [ ] websocketService.ts

### Integración
- [ ] Conectar con sistema de reservas
- [ ] Conectar con sistema de pagos
- [ ] Conectar con sistema de reseñas
- [ ] Conectar con perfil de usuario

### Testing
- [ ] Tests unitarios backend
- [ ] Tests de endpoints
- [ ] Tests de WebSocket
- [ ] Tests de componentes frontend
- [ ] Tests E2E

### Documentación
- [ ] README del módulo
- [ ] Documentación de API
- [ ] Guía de plantillas de email

---

## 📝 NOTAS FINALES

**Dependencias adicionales:**

Backend:
```json
{
  "socket.io": "^4.7.0",
  "nodemailer": "^6.9.0",
  "bull": "^4.12.0",
  "ioredis": "^5.3.0",
  "handlebars": "^4.7.8",
  "node-cron": "^3.0.3"
}
```

Frontend:
```json
{
  "socket.io-client": "^4.7.0",
  "react-hot-toast": "^2.4.1"
}
```

**Variables de entorno:**
```
# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Redis
REDIS_URL=redis://localhost:6379

# WebSocket
WS_URL=http://localhost:3000

# Frontend
VITE_WS_URL=http://localhost:3000
```

**Configuración de Gmail para SMTP:**
1. Habilitar "App Passwords" en cuenta de Google
2. Usar el app password (no la contraseña normal)
3. O usar servicios como SendGrid, Mailgun, AWS SES

---

**Última actualización:** 5 de noviembre de 2025  
**Responsable:** Enrique Fernández  
**Estado:** Documentación completa - Listo para implementar
