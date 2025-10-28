# 📋 CRUD de Mis Reservas - JSON Endpoints

## 🎯 Resumen

La página "Mis Reservas" (`MyBookingsPage.tsx`) necesita **4 operaciones CRUD**:
1. **READ** - Obtener todas las reservas del usuario
2. **UPDATE** - Modificar una reserva existente (editar horario/participantes)
3. **DELETE/CANCEL** - Cancelar una reserva
4. **(Opcional) CREATE** - Ya está implementado en CheckoutPage

---

## 📊 Estructura de Datos Frontend

```typescript
interface Booking {
  id: string;                    // ID de la reserva
  fieldId: string;               // ID de la cancha
  fieldName: string;             // Nombre de la cancha
  fieldImage: string;            // URL de la imagen principal
  sedeName: string;              // Nombre de la sede
  address: string;               // Dirección completa
  date: string;                  // Fecha formateada "15 de octubre de 2025"
  timeSlot: string;              // "18:00 - 20:00"
  participants: number;          // Cantidad de personas
  price: number;                 // Precio base
  totalPaid: number;             // Total pagado (con extras)
  status: 'active' | 'completed' | 'cancelled';
  bookingCode: string;           // Código QR "ROGU-12345678"
  rating?: number;               // Calificación de la cancha
  reviews?: number;              // Número de reseñas
  paymentMethod: 'card' | 'qr';  // Método de pago usado
}
```

---

## 🔍 1. GET - Obtener Reservas del Usuario

### **Endpoint**
```
GET /api/reservas/usuario/:idUsuario
```
o
```
GET /api/reservas/cliente/:idPersona
```

### **Headers**
```json
{
  "Authorization": "Bearer {token}"
}
```

### **Parámetros**
- `idUsuario` o `idPersona`: ID del usuario autenticado

### **Query Parameters (Opcionales)**
```
?estado=activa          // Filtrar por estado
?fecha=2025-10-16       // Filtrar por fecha
?limit=10               // Límite de resultados
&offset=0               // Paginación
```

### **Response Esperado (200 OK)**

```json
{
  "reservas": [
    {
      "idReserva": 123,
      "idCliente": 2,
      "idCancha": 5,
      "iniciaEn": "2025-10-16T18:00:00.000Z",
      "terminaEn": "2025-10-16T20:00:00.000Z",
      "cantidadPersonas": 12,
      "requiereAprobacion": false,
      "montoBase": "150.00",
      "montoExtra": "15.00",
      "montoTotal": "165.00",
      "estado": "Confirmada",
      "metodoPago": "Tarjeta",
      "codigoQR": "ROGU-12345678",
      "creadoEn": "2025-10-15T10:30:00.000Z",
      "actualizadoEn": "2025-10-15T10:30:00.000Z",
      
      // Datos de la cancha (JOIN)
      "cancha": {
        "idCancha": 5,
        "nombre": "Cancha de Fútbol Premium Elite",
        "superficie": "Césped sintético",
        "cubierta": false,
        "precio": "150.00",
        "fotos": [
          {
            "idFoto": 1,
            "urlFoto": "/uploads/canchas/futbol-1.jpg"
          }
        ],
        "sede": {
          "idSede": 1,
          "nombre": "Centro Deportivo Elite",
          "direccion": "Av. Revolución 1234",
          "ciudad": "Ciudad de México",
          "telefono": "+52 55 1234 5678",
          "email": "info@deportivoelite.com"
        }
      }
    },
    {
      "idReserva": 124,
      "idCliente": 2,
      "idCancha": 3,
      "iniciaEn": "2025-10-20T16:00:00.000Z",
      "terminaEn": "2025-10-20T18:00:00.000Z",
      "cantidadPersonas": 10,
      "montoBase": "120.00",
      "montoExtra": "12.00",
      "montoTotal": "132.00",
      "estado": "Confirmada",
      "metodoPago": "QR",
      "codigoQR": "ROGU-87654321",
      "creadoEn": "2025-10-15T11:00:00.000Z",
      "cancha": { /* ... */ }
    },
    {
      "idReserva": 122,
      "idCliente": 2,
      "idCancha": 7,
      "iniciaEn": "2025-10-05T10:00:00.000Z",
      "terminaEn": "2025-10-05T12:00:00.000Z",
      "cantidadPersonas": 4,
      "montoBase": "100.00",
      "montoExtra": "10.00",
      "montoTotal": "110.00",
      "estado": "Completada",
      "metodoPago": "Tarjeta",
      "codigoQR": "ROGU-11223344",
      "creadoEn": "2025-10-04T15:00:00.000Z",
      "cancha": { /* ... */ }
    },
    {
      "idReserva": 121,
      "idCliente": 2,
      "idCancha": 5,
      "iniciaEn": "2025-10-02T14:00:00.000Z",
      "terminaEn": "2025-10-02T16:00:00.000Z",
      "cantidadPersonas": 14,
      "montoBase": "150.00",
      "montoExtra": "15.00",
      "montoTotal": "165.00",
      "estado": "Cancelada",
      "metodoPago": "Tarjeta",
      "codigoQR": "ROGU-99887766",
      "creadoEn": "2025-10-01T09:00:00.000Z",
      "cancha": { /* ... */ }
    }
  ],
  "total": 4,
  "activas": 2,
  "completadas": 1,
  "canceladas": 1
}
```

### **Posibles Estados**
- `"Confirmada"` → `status: 'active'` (frontend)
- `"Completada"` → `status: 'completed'` (frontend)
- `"Cancelada"` → `status: 'cancelled'` (frontend)
- `"Pendiente"` → `status: 'active'` (frontend, con badge diferente)

---

## ✏️ 2. PUT/PATCH - Modificar Reserva

### **Endpoint**
```
PUT /api/reservas/:idReserva
```
o
```
PATCH /api/reservas/:idReserva
```

### **Headers**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

### **Request Body**

```json
{
  "iniciaEn": "2025-10-16T19:00:00",
  "terminaEn": "2025-10-16T21:00:00",
  "cantidadPersonas": 15
}
```

**Campos que se pueden modificar:**
- `iniciaEn` - Nueva hora de inicio
- `terminaEn` - Nueva hora de fin
- `cantidadPersonas` - Nuevo número de participantes
- (Opcional) `montoTotal` - Si cambia el horario/duración

### **Response Esperado (200 OK)**

```json
{
  "message": "Reserva actualizada exitosamente",
  "reserva": {
    "idReserva": 123,
    "idCliente": 2,
    "idCancha": 5,
    "iniciaEn": "2025-10-16T19:00:00.000Z",
    "terminaEn": "2025-10-16T21:00:00.000Z",
    "cantidadPersonas": 15,
    "montoBase": "150.00",
    "montoExtra": "15.00",
    "montoTotal": "165.00",
    "estado": "Confirmada",
    "actualizadoEn": "2025-10-16T14:30:00.000Z"
  }
}
```

### **Errores Posibles**

```json
// 409 Conflict - Horario ya reservado
{
  "error": "El nuevo horario ya está reservado por otro usuario"
}

// 403 Forbidden - No es dueño de la reserva
{
  "error": "No tienes permiso para modificar esta reserva"
}

// 400 Bad Request - Fecha pasada
{
  "error": "No se puede modificar una reserva pasada"
}

// 400 Bad Request - Muy cerca de la fecha
{
  "error": "Las modificaciones deben hacerse con al menos 24 horas de anticipación"
}
```

---

## ❌ 3. DELETE/CANCEL - Cancelar Reserva

### **Endpoint**
```
DELETE /api/reservas/:idReserva
```
o (preferido)
```
PATCH /api/reservas/:idReserva/cancelar
```

### **Headers**
```json
{
  "Authorization": "Bearer {token}"
}
```

### **Request Body (Opcional)**

```json
{
  "motivo": "Cambio de planes",
  "comentario": "No podré asistir ese día"
}
```

### **Response Esperado (200 OK)**

```json
{
  "message": "Reserva cancelada exitosamente",
  "reserva": {
    "idReserva": 123,
    "idCliente": 2,
    "idCancha": 5,
    "estado": "Cancelada",
    "canceladoEn": "2025-10-16T14:35:00.000Z",
    "motivoCancelacion": "Cambio de planes"
  },
  "reembolso": {
    "aplicable": true,
    "porcentaje": 100,
    "monto": "165.00",
    "mensaje": "Se reembolsará el 100% porque cancelaste con más de 24 horas de anticipación"
  }
}
```

### **Errores Posibles**

```json
// 403 Forbidden
{
  "error": "No tienes permiso para cancelar esta reserva"
}

// 400 Bad Request - Ya completada
{
  "error": "No se puede cancelar una reserva ya completada"
}

// 400 Bad Request - Ya cancelada
{
  "error": "Esta reserva ya está cancelada"
}

// 400 Bad Request - Muy tarde
{
  "error": "No se puede cancelar una reserva con menos de 2 horas de anticipación",
  "reembolso": {
    "aplicable": false,
    "mensaje": "No hay reembolso disponible"
  }
}
```

---

## 📄 4. GET - Detalle de una Reserva

### **Endpoint**
```
GET /api/reservas/:idReserva
```

### **Headers**
```json
{
  "Authorization": "Bearer {token}"
}
```

### **Response Esperado (200 OK)**

```json
{
  "reserva": {
    "idReserva": 123,
    "idCliente": 2,
    "idCancha": 5,
    "iniciaEn": "2025-10-16T18:00:00.000Z",
    "terminaEn": "2025-10-16T20:00:00.000Z",
    "cantidadPersonas": 12,
    "requiereAprobacion": false,
    "montoBase": "150.00",
    "montoExtra": "15.00",
    "montoTotal": "165.00",
    "estado": "Confirmada",
    "metodoPago": "Tarjeta",
    "codigoQR": "ROGU-12345678",
    "creadoEn": "2025-10-15T10:30:00.000Z",
    "actualizadoEn": "2025-10-15T10:30:00.000Z",
    
    // Información completa del cliente
    "cliente": {
      "idCliente": 2,
      "idPersonaC": 2,
      "persona": {
        "nombres": "Juan",
        "paterno": "Pérez",
        "materno": "García",
        "telefono": "+52 55 9876 5432",
        "email": "juan@ejemplo.com"
      }
    },
    
    // Información completa de la cancha
    "cancha": {
      "idCancha": 5,
      "nombre": "Cancha de Fútbol Premium Elite",
      "superficie": "Césped sintético",
      "cubierta": false,
      "aforoMax": 22,
      "dimensiones": "90m x 60m",
      "precio": "150.00",
      "iluminacion": "LED profesional",
      "fotos": [
        {
          "idFoto": 1,
          "urlFoto": "/uploads/canchas/futbol-1.jpg"
        },
        {
          "idFoto": 2,
          "urlFoto": "/uploads/canchas/futbol-2.jpg"
        }
      ],
      "sede": {
        "idSede": 1,
        "nombre": "Centro Deportivo Elite",
        "direccion": "Av. Revolución 1234",
        "ciudad": "Ciudad de México",
        "telefono": "+52 55 1234 5678",
        "email": "info@deportivoelite.com",
        "horarioApertura": "08:00:00",
        "horarioCierre": "22:00:00"
      }
    },
    
    // Historial de cambios (opcional)
    "historial": [
      {
        "accion": "Creada",
        "fecha": "2025-10-15T10:30:00.000Z",
        "usuario": "Juan Pérez"
      }
    ]
  }
}
```

---

## 🔄 Mapeo de Datos (Backend → Frontend)

### **Conversión de Estado**
```typescript
const mapEstadoToStatus = (estado: string): 'active' | 'completed' | 'cancelled' => {
  switch (estado) {
    case 'Confirmada':
    case 'Pendiente':
      return 'active';
    case 'Completada':
      return 'completed';
    case 'Cancelada':
      return 'cancelled';
    default:
      return 'active';
  }
};
```

### **Conversión de Fecha**
```typescript
const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  // "15 de octubre de 2025"
};
```

### **Conversión de Horario**
```typescript
const formatTimeSlot = (iniciaEn: string, terminaEn: string): string => {
  const start = new Date(iniciaEn).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const end = new Date(terminaEn).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return `${start} - ${end}`;
  // "18:00 - 20:00"
};
```

### **Conversión de Método de Pago**
```typescript
const mapMetodoPago = (metodoPago: string): 'card' | 'qr' => {
  if (metodoPago === 'QR' || metodoPago === 'qr') return 'qr';
  return 'card';
};
```

### **Generación de Código QR**
```typescript
const generateBookingCode = (idReserva: number): string => {
  return `ROGU-${String(idReserva).padStart(8, '0')}`;
  // idReserva: 123 → "ROGU-00000123"
};
```

---

## 📋 Ejemplo Completo de Conversión

### **Datos del Backend:**
```json
{
  "idReserva": 123,
  "idCliente": 2,
  "idCancha": 5,
  "iniciaEn": "2025-10-16T18:00:00.000Z",
  "terminaEn": "2025-10-16T20:00:00.000Z",
  "cantidadPersonas": 12,
  "montoBase": "150.00",
  "montoExtra": "15.00",
  "montoTotal": "165.00",
  "estado": "Confirmada",
  "metodoPago": "Tarjeta",
  "cancha": {
    "nombre": "Cancha de Fútbol Premium Elite",
    "fotos": [{ "urlFoto": "/uploads/canchas/futbol-1.jpg" }],
    "sede": {
      "nombre": "Centro Deportivo Elite",
      "direccion": "Av. Revolución 1234",
      "ciudad": "Ciudad de México"
    }
  }
}
```

### **Datos para el Frontend:**
```typescript
const booking: Booking = {
  id: '123',
  fieldId: '5',
  fieldName: 'Cancha de Fútbol Premium Elite',
  fieldImage: 'http://localhost:3000/uploads/canchas/futbol-1.jpg',
  sedeName: 'Centro Deportivo Elite',
  address: 'Av. Revolución 1234, Ciudad de México',
  date: '16 de octubre de 2025',
  timeSlot: '18:00 - 20:00',
  participants: 12,
  price: 150,
  totalPaid: 165,
  status: 'active',
  bookingCode: 'ROGU-00000123',
  paymentMethod: 'card'
};
```

---

## 🎯 Resumen de Endpoints Necesarios

| Operación | Método | Endpoint | Descripción |
|-----------|--------|----------|-------------|
| **Listar** | GET | `/api/reservas/usuario/:idUsuario` | Obtener todas las reservas del usuario |
| **Detalle** | GET | `/api/reservas/:idReserva` | Obtener detalles de una reserva específica |
| **Crear** | POST | `/api/reservas` | Crear nueva reserva (ya implementado) |
| **Modificar** | PUT/PATCH | `/api/reservas/:idReserva` | Editar horario o participantes |
| **Cancelar** | PATCH | `/api/reservas/:idReserva/cancelar` | Cancelar una reserva |

---

## ✅ Checklist de Implementación

- [ ] Endpoint GET para listar reservas del usuario
- [ ] Endpoint GET para detalle de una reserva
- [ ] Endpoint PUT/PATCH para modificar reserva
- [ ] Endpoint PATCH para cancelar reserva
- [ ] JOIN con tabla Cancha para obtener nombre e imágenes
- [ ] JOIN con tabla Sede para obtener información de ubicación
- [ ] Generación automática de código QR (`ROGU-XXXXXXXX`)
- [ ] Validación de permisos (usuario solo ve sus propias reservas)
- [ ] Validación de horarios al modificar
- [ ] Política de cancelación y reembolsos
- [ ] Filtros por estado (activa, completada, cancelada)
- [ ] Ordenamiento por fecha (más recientes primero)

---

**Última actualización:** 16 de octubre de 2025  
**Estado:** 📋 ESPECIFICACIÓN COMPLETA  
**Página:** `src/pages/MyBookingsPage.tsx`
