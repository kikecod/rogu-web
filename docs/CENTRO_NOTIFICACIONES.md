# 🔔 CENTRO DE NOTIFICACIONES BÁSICO

**Fecha:** 10 de noviembre de 2025  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 1-2 semanas  

---

## 📋 OBJETIVO

Implementar un sistema básico de notificaciones que mantenga a los usuarios informados sobre eventos importantes (reservas, verificaciones, reportes, reseñas) sin necesidad de revisar constantemente la plataforma.

**Problema actual:** Los usuarios no saben cuando su verificación fue aprobada, cuando tienen una nueva reserva, o cuando recibieron una reseña.

---

## 🎯 ALCANCE DEL SISTEMA BÁSICO

### Fase 1 - MVP (Esta implementación)

**Incluye:**
- ✅ Notificaciones in-app (dentro de la plataforma)
- ✅ Centro de notificaciones con dropdown
- ✅ Badge con contador de no leídas
- ✅ Marcar como leída
- ✅ Eliminar notificaciones
- ✅ Notificaciones por email básicas

**NO incluye (futuro):**
- ❌ WebSockets (notificaciones en tiempo real)
- ❌ Push notifications
- ❌ Notificaciones por SMS
- ❌ Sonidos o efectos visuales avanzados
- ❌ Preferencias granulares por tipo

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                     EVENTO OCURRE                            │
│  (Usuario hace algo que genera notificación)                │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND - CREAR NOTIFICACIÓN                    │
│                                                              │
│  1. Detectar el evento (reserva creada, verificación, etc.) │
│  2. Identificar destinatarios                                │
│  3. Crear registro en tabla Notificaciones                  │
│  4. Si corresponde, enviar email                            │
│                                                              │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND - MOSTRAR NOTIFICACIÓN                 │
│                                                              │
│  1. Usuario recarga la página o hace polling periódico      │
│  2. Fetch de notificaciones no leídas                       │
│  3. Actualizar badge con contador                           │
│  4. Mostrar en dropdown cuando se hace clic                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ BASE DE DATOS

### Tabla: `Notificaciones`

```sql
CREATE TABLE Notificaciones (
  idNotificacion INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Destinatario
  idUsuarioDestinatario INT NOT NULL,
  
  -- Contenido
  tipo ENUM(
    'RESERVA_CONFIRMADA',
    'RESERVA_CANCELADA',
    'VERIFICACION_APROBADA',
    'VERIFICACION_RECHAZADA',
    'NUEVA_RESENA',
    'RESPUESTA_RESENA',
    'REPORTE_RESUELTO',
    'NUEVA_RESERVA_DUENO',
    'PAGO_EXITOSO',
    'PAGO_FALLIDO',
    'REEMBOLSO_PROCESADO',
    'SISTEMA_GENERAL'
  ) NOT NULL,
  
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  
  -- Metadata
  entidadRelacionada ENUM('RESERVA', 'SEDE', 'CANCHA', 'USUARIO', 'REPORTE', 'RESENA') NULL,
  idEntidadRelacionada INT NULL,
  urlAccion VARCHAR(500) NULL, -- URL a donde redirigir al hacer clic
  
  -- Estado
  leida BOOLEAN DEFAULT FALSE,
  fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fechaLeida TIMESTAMP NULL,
  
  -- Flags
  eliminada BOOLEAN DEFAULT FALSE,
  emailEnviado BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (idUsuarioDestinatario) REFERENCES Usuario(idUsuario),
  INDEX idx_usuario_leida (idUsuarioDestinatario, leida),
  INDEX idx_fecha_creacion (fechaCreacion)
);
```

### Ejemplos de Registros

```json
// Notificación de reserva confirmada
{
  "idUsuarioDestinatario": 123,
  "tipo": "RESERVA_CONFIRMADA",
  "titulo": "¡Reserva confirmada!",
  "mensaje": "Tu reserva en Deportivo Central - Cancha 1 para el 15/11/2025 a las 18:00 ha sido confirmada.",
  "entidadRelacionada": "RESERVA",
  "idEntidadRelacionada": 456,
  "urlAccion": "/bookings/456",
  "leida": false
}

// Notificación de verificación aprobada
{
  "idUsuarioDestinatario": 789,
  "tipo": "VERIFICACION_APROBADA",
  "titulo": "¡Felicidades! Eres dueño verificado",
  "mensaje": "Tu solicitud de verificación ha sido aprobada. Ya puedes crear tu primera sede.",
  "entidadRelacionada": null,
  "idEntidadRelacionada": null,
  "urlAccion": "/venues/create",
  "leida": false
}

// Notificación de nueva reseña para dueño
{
  "idUsuarioDestinatario": 321,
  "tipo": "NUEVA_RESENA",
  "titulo": "Nueva reseña en tu cancha",
  "mensaje": "Juan Pérez dejó una reseña de 5 estrellas en Cancha 1 de Deportivo Central.",
  "entidadRelacionada": "RESENA",
  "idEntidadRelacionada": 789,
  "urlAccion": "/venues/1/reviews",
  "leida": false
}
```

---

## 📡 ENDPOINTS DEL BACKEND

### Obtener Notificaciones del Usuario

```
GET /api/notificaciones
Headers: Authorization: Bearer {token}
Query: ?leida=false&page=1&limit=20

Response: {
  notificaciones: [
    {
      idNotificacion: 1,
      tipo: "RESERVA_CONFIRMADA",
      titulo: "¡Reserva confirmada!",
      mensaje: "Tu reserva en...",
      urlAccion: "/bookings/456",
      leida: false,
      fechaCreacion: "2025-11-09T10:30:00Z"
    },
    ...
  ],
  total: 45,
  noLeidas: 12,
  paginas: 3
}
```

### Obtener Contador de No Leídas

```
GET /api/notificaciones/contador
Headers: Authorization: Bearer {token}

Response: {
  noLeidas: 12
}
```

### Marcar Notificación como Leída

```
PUT /api/notificaciones/:id/marcar-leida
Headers: Authorization: Bearer {token}

Response: {
  mensaje: "Notificación marcada como leída"
}
```

### Marcar Todas como Leídas

```
PUT /api/notificaciones/marcar-todas-leidas
Headers: Authorization: Bearer {token}

Response: {
  mensaje: "12 notificaciones marcadas como leídas"
}
```

### Eliminar Notificación

```
DELETE /api/notificaciones/:id
Headers: Authorization: Bearer {token}

Response: {
  mensaje: "Notificación eliminada"
}
```

### Eliminar Todas las Leídas

```
DELETE /api/notificaciones/limpiar-leidas
Headers: Authorization: Bearer {token}

Response: {
  mensaje: "8 notificaciones eliminadas"
}
```

### Crear Notificación (Uso interno del backend)

```
POST /api/notificaciones/crear
Body: {
  idUsuarioDestinatario: 123,
  tipo: "RESERVA_CONFIRMADA",
  titulo: "¡Reserva confirmada!",
  mensaje: "Tu reserva en...",
  entidadRelacionada: "RESERVA",
  idEntidadRelacionada: 456,
  urlAccion: "/bookings/456",
  enviarEmail: true
}

Response: {
  notificacionCreada: { ... }
}
```

---

## 🎨 COMPONENTES FRONTEND

### 1. Header con Campana de Notificaciones

```
Ubicación: Header.tsx (ya existente)

Añadir:
┌────────────────────────────────────┐
│  [Logo] [Nav] ... [🔔12] [Avatar] │
└────────────────────────────────────┘
                       ↑
                    Badge con contador
```

**Comportamiento:**
- Badge rojo con número si hay no leídas
- Al hacer clic, abre dropdown
- Polling cada 30 segundos para actualizar contador

### 2. Dropdown de Notificaciones

```
┌─────────────────────────────────────────────┐
│  Notificaciones                       [⚙️]  │
│  ──────────────────────────────────────────  │
│                                              │
│  🟦 ¡Reserva confirmada!          [•]       │
│     Tu reserva en Deportivo Central...      │
│     Hace 5 minutos                    [❌]  │
│  ──────────────────────────────────────────  │
│                                              │
│  ⬜ Nueva reseña en tu cancha               │
│     Juan Pérez dejó una reseña...           │
│     Hace 2 horas                      [❌]  │
│  ──────────────────────────────────────────  │
│                                              │
│  ⬜ Verificación aprobada                    │
│     Tu solicitud ha sido aprobada...        │
│     Ayer                              [❌]  │
│  ──────────────────────────────────────────  │
│                                              │
│  [Marcar todas como leídas]                 │
│  [Ver todas las notificaciones]             │
│                                              │
└─────────────────────────────────────────────┘

Leyenda:
🟦 = No leída (fondo azul claro)
⬜ = Leída (fondo blanco)
[•] = Punto azul indicador de no leída
[❌] = Botón para eliminar
```

**Comportamiento:**
- Muestra últimas 5 notificaciones
- Fondo azul claro para no leídas
- Al hacer clic en una notificación:
  - Marca como leída
  - Redirige a la URL correspondiente
- Botón [❌] para eliminar individual
- Link "Ver todas" → página completa de notificaciones

### 3. Página Completa de Notificaciones

```
Ruta: /notificaciones

┌─────────────────────────────────────────────────────────────┐
│                     MIS NOTIFICACIONES                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filtros: [Todas] [No leídas (12)] [Leídas]                │
│  [Marcar todas como leídas] [Limpiar leídas]               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🟦 ¡Reserva confirmada!                            │     │
│  │ Tu reserva en Deportivo Central - Cancha 1 para   │     │
│  │ el 15/11/2025 a las 18:00 ha sido confirmada.     │     │
│  │ Hace 5 minutos                                     │     │
│  │ [Ver reserva] [Eliminar]                           │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ ⬜ Nueva reseña en tu cancha                       │     │
│  │ Juan Pérez dejó una reseña de 5 estrellas en      │     │
│  │ Cancha 1 de Deportivo Central.                     │     │
│  │ Hace 2 horas                                       │     │
│  │ [Ver reseña] [Eliminar]                            │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Paginación: < 1 2 3 >                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. Estado Vacío

```
┌─────────────────────────────────────────────┐
│           MIS NOTIFICACIONES                 │
├─────────────────────────────────────────────┤
│                                              │
│            🔔                                │
│                                              │
│     No tienes notificaciones                │
│                                              │
│  Aquí aparecerán las actualizaciones        │
│  importantes sobre tus reservas,            │
│  verificaciones y más.                      │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 🎯 TIPOS DE NOTIFICACIONES Y CUÁNDO SE GENERAN

### Para Clientes

#### 1. RESERVA_CONFIRMADA
**Cuándo:** Cuando se confirma el pago de una reserva
```
Título: "¡Reserva confirmada!"
Mensaje: "Tu reserva en {nombreSede} - {nombreCancha} para el {fecha} a las {hora} ha sido confirmada."
URL: "/bookings/{idReserva}"
Email: Sí
```

#### 2. RESERVA_CANCELADA
**Cuándo:** Cuando se cancela una reserva
```
Título: "Reserva cancelada"
Mensaje: "Tu reserva en {nombreSede} para el {fecha} ha sido cancelada."
URL: "/bookings"
Email: Sí
```

#### 3. PAGO_EXITOSO
**Cuándo:** Cuando se procesa exitosamente un pago
```
Título: "Pago exitoso"
Mensaje: "Tu pago de ${monto} ha sido procesado correctamente."
URL: "/bookings/{idReserva}"
Email: Sí
```

#### 4. PAGO_FALLIDO
**Cuándo:** Cuando falla un pago
```
Título: "Pago rechazado"
Mensaje: "Hubo un problema procesando tu pago. Por favor intenta nuevamente."
URL: "/bookings/{idReserva}/retry-payment"
Email: Sí
```

#### 5. REEMBOLSO_PROCESADO
**Cuándo:** Cuando se procesa un reembolso
```
Título: "Reembolso procesado"
Mensaje: "Tu reembolso de ${monto} ha sido procesado y llegará en 5-10 días hábiles."
URL: "/bookings/{idReserva}"
Email: Sí
```

#### 6. RESPUESTA_RESENA
**Cuándo:** Cuando el dueño responde a una reseña del usuario
```
Título: "El dueño respondió tu reseña"
Mensaje: "El dueño de {nombreSede} ha respondido a tu reseña."
URL: "/reviews/{idResena}"
Email: No
```

---

### Para Dueños/Gerentes

#### 7. VERIFICACION_APROBADA
**Cuándo:** Admin aprueba solicitud de dueño
```
Título: "¡Felicidades! Eres dueño verificado"
Mensaje: "Tu solicitud de verificación ha sido aprobada. Ya puedes crear tu primera sede."
URL: "/venues/create"
Email: Sí
```

#### 8. VERIFICACION_RECHAZADA
**Cuándo:** Admin rechaza solicitud de dueño
```
Título: "Solicitud de verificación rechazada"
Mensaje: "Tu solicitud ha sido rechazada. Motivo: {motivo}"
URL: "/verify/owner"
Email: Sí
```

#### 9. NUEVA_RESERVA_DUENO
**Cuándo:** Cliente hace reserva en cancha del dueño
```
Título: "Nueva reserva en tu cancha"
Mensaje: "{nombreCliente} reservó {nombreCancha} para el {fecha} a las {hora}."
URL: "/analytics/reservas/{idReserva}"
Email: Sí (si tiene preferencia activada)
```

#### 10. NUEVA_RESENA
**Cuándo:** Cliente deja reseña en cancha del dueño
```
Título: "Nueva reseña en tu cancha"
Mensaje: "{nombreCliente} dejó una reseña de {estrellas} estrellas en {nombreCancha}."
URL: "/venues/{idSede}/reviews"
Email: Sí
```

#### 11. SEDE_VERIFICADA
**Cuándo:** Admin verifica una sede
```
Título: "Sede verificada"
Mensaje: "Tu sede {nombreSede} ha sido verificada y ahora es visible para los clientes."
URL: "/venues/{idSede}"
Email: Sí
```

#### 12. SEDE_RECHAZADA
**Cuándo:** Admin rechaza una sede
```
Título: "Sede rechazada"
Mensaje: "Tu sede {nombreSede} ha sido rechazada. Motivo: {motivo}"
URL: "/venues/{idSede}/edit"
Email: Sí
```

---

### Para Todos

#### 13. REPORTE_RESUELTO
**Cuándo:** Admin resuelve un reporte
```
Título: "Reporte resuelto"
Mensaje: "Tu reporte #{idReporte} ha sido revisado y resuelto."
URL: "/reportes/{idReporte}"
Email: Sí
```

#### 14. SISTEMA_GENERAL
**Cuándo:** Anuncios del sistema
```
Título: "Mantenimiento programado"
Mensaje: "La plataforma estará en mantenimiento el {fecha} de {hora} a {hora}."
URL: null
Email: Sí
```

---

## 📧 SISTEMA DE EMAILS BÁSICO

### Plantilla Base HTML

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏟️ ROGU</h1>
    </div>
    <div class="content">
      <h2>{{TITULO}}</h2>
      <p>{{MENSAJE}}</p>
      {{#if URL_ACCION}}
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{URL_ACCION}}" class="button">{{TEXTO_BOTON}}</a>
      </p>
      {{/if}}
    </div>
    <div class="footer">
      <p>Este correo fue enviado automáticamente. Por favor no respondas.</p>
      <p>&copy; 2025 ROGU. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
```

### Servicio de Email

**Backend:**
- Usar Nodemailer o similar
- Queue system (Bull + Redis) para envío asíncrono
- Rate limiting (no más de 1 email por minuto al mismo usuario)
- Retry logic (3 intentos si falla)
- Logging de emails enviados

**Configuración:**
```javascript
// Ejemplo de envío
const emailConfig = {
  from: 'notificaciones@rogu.com',
  to: usuario.correo,
  subject: notificacion.titulo,
  html: renderTemplate(notificacion)
};

await emailQueue.add('send-notification-email', emailConfig);
```

---

## 🔄 FLUJOS COMPLETOS

### Flujo 1: Cliente hace una reserva

```
1. Usuario completa proceso de pago
2. Backend crea reserva en BD
3. Backend crea notificación:
   - Tipo: RESERVA_CONFIRMADA
   - Para: idCliente
   - Con URL a la reserva
4. Backend envía email al cliente
5. Frontend (en siguiente polling):
   - Actualiza contador de notificaciones
   - Badge muestra +1
6. Usuario abre dropdown
   - Ve la notificación resaltada
7. Usuario hace clic en la notificación
   - Se marca como leída
   - Se redirige a /bookings/{id}
```

### Flujo 2: Admin verifica a un dueño

```
1. Admin aprueba verificación en panel
2. Backend actualiza rol del usuario
3. Backend crea notificación:
   - Tipo: VERIFICACION_APROBADA
   - Para: idUsuario
   - Con URL a /venues/create
4. Backend envía email de felicitaciones
5. Usuario entra a la plataforma
   - Ve badge con notificación
6. Usuario abre dropdown
   - Ve notificación de verificación
7. Usuario hace clic
   - Se redirige a crear su primera sede
```

### Flujo 3: Cliente deja reseña

```
1. Cliente deja reseña en cancha
2. Backend crea reseña en BD
3. Backend identifica al dueño de la cancha
4. Backend crea notificación:
   - Tipo: NUEVA_RESENA
   - Para: idDueno
   - Con URL a la reseña
5. Backend envía email al dueño
6. Dueño entra a su dashboard
   - Ve notificación de nueva reseña
7. Dueño hace clic
   - Ve la reseña
   - Puede responder
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Backend - Servicio de Notificaciones

```javascript
// Pseudocódigo

class NotificationService {
  
  async crearNotificacion({
    idUsuarioDestinatario,
    tipo,
    titulo,
    mensaje,
    entidadRelacionada,
    idEntidadRelacionada,
    urlAccion,
    enviarEmail = false
  }) {
    // 1. Crear registro en BD
    const notificacion = await db.notificaciones.create({
      idUsuarioDestinatario,
      tipo,
      titulo,
      mensaje,
      entidadRelacionada,
      idEntidadRelacionada,
      urlAccion,
      leida: false,
      fechaCreacion: new Date()
    });
    
    // 2. Si se debe enviar email
    if (enviarEmail) {
      await emailQueue.add('send-notification-email', {
        idNotificacion: notificacion.idNotificacion,
        idUsuario: idUsuarioDestinatario
      });
    }
    
    return notificacion;
  }
  
  async obtenerNotificaciones(idUsuario, filtros) {
    return await db.notificaciones.findMany({
      where: {
        idUsuarioDestinatario: idUsuario,
        eliminada: false,
        ...filtros
      },
      orderBy: { fechaCreacion: 'DESC' }
    });
  }
  
  async contarNoLeidas(idUsuario) {
    return await db.notificaciones.count({
      where: {
        idUsuarioDestinatario: idUsuario,
        leida: false,
        eliminada: false
      }
    });
  }
  
  async marcarComoLeida(idNotificacion, idUsuario) {
    return await db.notificaciones.update({
      where: { 
        idNotificacion,
        idUsuarioDestinatario: idUsuario 
      },
      data: { 
        leida: true,
        fechaLeida: new Date()
      }
    });
  }
}
```

### Frontend - Hook de Notificaciones

```typescript
// hooks/useNotifications.ts

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Fetch notificaciones
  const fetchNotifications = async () => {
    const response = await api.get('/notificaciones');
    setNotifications(response.data.notificaciones);
    setUnreadCount(response.data.noLeidas);
  };
  
  // Fetch contador solamente
  const fetchUnreadCount = async () => {
    const response = await api.get('/notificaciones/contador');
    setUnreadCount(response.data.noLeidas);
  };
  
  // Marcar como leída
  const markAsRead = async (id) => {
    await api.put(`/notificaciones/${id}/marcar-leida`);
    await fetchUnreadCount();
  };
  
  // Marcar todas como leídas
  const markAllAsRead = async () => {
    await api.put('/notificaciones/marcar-todas-leidas');
    await fetchNotifications();
  };
  
  // Eliminar
  const deleteNotification = async (id) => {
    await api.delete(`/notificaciones/${id}`);
    await fetchNotifications();
  };
  
  // Polling cada 30 segundos
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
```

---

## 🎨 COMPONENTES REACT

### NotificationBell.tsx

```typescript
// Componente para el header

interface Props {
  unreadCount: number;
  onClick: () => void;
}

export const NotificationBell: React.FC<Props> = ({ unreadCount, onClick }) => {
  return (
    <button onClick={onClick} className="relative">
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
```

### NotificationDropdown.tsx

```typescript
// Componente del dropdown

interface Props {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationDropdown: React.FC<Props> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead
}) => {
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl">
      {/* Header */}
      <div className="p-4 border-b">
        <h3>Notificaciones</h3>
      </div>
      
      {/* Lista */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.slice(0, 5).map(notif => (
          <NotificationItem
            key={notif.idNotificacion}
            notification={notif}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t">
        <button onClick={onMarkAllAsRead}>
          Marcar todas como leídas
        </button>
        <Link to="/notificaciones">
          Ver todas
        </Link>
      </div>
    </div>
  );
};
```

### NotificationItem.tsx

```typescript
// Item individual de notificación

interface Props {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export const NotificationItem: React.FC<Props> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const handleClick = () => {
    if (!notification.leida) {
      onMarkAsRead(notification.idNotificacion);
    }
    if (notification.urlAccion) {
      window.location.href = notification.urlAccion;
    }
  };
  
  return (
    <div 
      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
        !notification.leida ? 'bg-blue-50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {!notification.leida && (
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2" />
          )}
          <h4 className="font-semibold">{notification.titulo}</h4>
          <p className="text-sm text-gray-600">{notification.mensaje}</p>
          <span className="text-xs text-gray-400">
            {formatTimeAgo(notification.fechaCreacion)}
          </span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.idNotificacion);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
```

---

## 📅 CRONOGRAMA DE IMPLEMENTACIÓN

### Semana 1 - Backend
- Día 1-2: Crear tabla de notificaciones
- Día 3-4: Implementar endpoints
- Día 5: Sistema de emails básico
- Día 6-7: Integrar creación de notificaciones en flujos existentes

### Semana 2 - Frontend
- Día 1-2: Hook useNotifications y componente campana
- Día 3-4: Dropdown de notificaciones
- Día 5-6: Página completa de notificaciones
- Día 7: Testing y ajustes

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Crear tabla Notificaciones
- [ ] Endpoint GET /notificaciones
- [ ] Endpoint GET /notificaciones/contador
- [ ] Endpoint PUT /notificaciones/:id/marcar-leida
- [ ] Endpoint PUT /notificaciones/marcar-todas-leidas
- [ ] Endpoint DELETE /notificaciones/:id
- [ ] Servicio de creación de notificaciones
- [ ] Integrar en flujo de reservas
- [ ] Integrar en flujo de verificaciones
- [ ] Integrar en flujo de reseñas
- [ ] Sistema básico de emails
- [ ] Testing de endpoints

### Frontend
- [ ] Hook useNotifications
- [ ] Componente NotificationBell
- [ ] Componente NotificationDropdown
- [ ] Componente NotificationItem
- [ ] Integrar campana en Header
- [ ] Página completa /notificaciones
- [ ] Polling automático
- [ ] Estados de carga
- [ ] Manejo de errores
- [ ] Responsive design
- [ ] Testing

### Integraciones
- [ ] Notificación al confirmar reserva
- [ ] Notificación al cancelar reserva
- [ ] Notificación de pago exitoso/fallido
- [ ] Notificación de verificación aprobada/rechazada
- [ ] Notificación de nueva reseña
- [ ] Notificación de nueva reserva (para dueños)

---

## 🚀 MEJORAS FUTURAS (Fuera del alcance actual)

### Fase 2 - Notificaciones en Tiempo Real
- WebSockets con Socket.io
- Notificaciones instantáneas sin polling
- Sonido al recibir notificación
- Animación visual

### Fase 3 - Preferencias Avanzadas
- Configurar qué notificaciones recibir
- Elegir canal (in-app, email, ambos)
- Horario de "no molestar"
- Frecuencia de emails

### Fase 4 - Push Notifications
- Service Worker
- Push API
- Notificaciones en navegador cerrado

---

**FIN DEL DOCUMENTO**
