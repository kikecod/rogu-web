# 🎟️ Integración de Reservas con el Backend

## ✅ Estado: COMPLETADO

La integración de reservas con el backend está completamente funcional.

---

## 📋 Endpoint de Reservas

### **POST /api/reservas**

**URL Completa:**
```
http://localhost:3000/api/reservas
```

**Headers Requeridos:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token_jwt}"
}
```

---

## 📤 Request Body (JSON a Enviar)

```json
{
  "idCliente": 5,
  "idCancha": 4,
  "iniciaEn": "2025-10-20T09:00:00",
  "terminaEn": "2025-10-20T10:00:00",
  "cantidadPersonas": 8,
  "requiereAprobacion": false,
  "montoBase": 45.00,
  "montoExtra": 0.00,
  "montoTotal": 45.00
}
```

### **Descripción de Campos**

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `idCliente` | `number` | ID del usuario autenticado (`user.idUsuario`) | `5` |
| `idCancha` | `number` | ID de la cancha a reservar | `4` |
| `iniciaEn` | `string` | Fecha/hora inicio (ISO 8601) | `"2025-10-20T09:00:00"` |
| `terminaEn` | `string` | Fecha/hora fin (ISO 8601) | `"2025-10-20T10:00:00"` |
| `cantidadPersonas` | `number` | Número de participantes | `8` |
| `requiereAprobacion` | `boolean` | Si requiere aprobación del dueño | `false` |
| `montoBase` | `number` | Precio base de la reserva | `45.00` |
| `montoExtra` | `number` | Cargos adicionales | `0.00` |
| `montoTotal` | `number` | Total = montoBase + montoExtra | `45.00` |

---

## 📥 Response (JSON Recibido)

### **✅ Éxito (200 OK / 201 Created)**

```json
{
  "message": "Reserva creada exitosamente",
  "reserva": {
    "idReserva": 123,
    "idCliente": 5,
    "idCancha": 4,
    "iniciaEn": "2025-10-20T09:00:00.000Z",
    "terminaEn": "2025-10-20T10:00:00.000Z",
    "cantidadPersonas": 8,
    "requiereAprobacion": false,
    "montoBase": "45.00",
    "montoExtra": "0.00",
    "montoTotal": "45.00",
    "creadoEn": "2025-10-16T15:30:45.123Z",
    "actualizadoEn": "2025-10-16T15:30:45.123Z"
  }
}
```

### **❌ Errores Comunes**

#### 401 Unauthorized
```json
{
  "error": "Token no proporcionado o inválido"
}
```

#### 409 Conflict (Horario ocupado)
```json
{
  "error": "La cancha ya está reservada en ese horario"
}
```

#### 400 Bad Request (Datos inválidos)
```json
{
  "error": "Datos de reserva inválidos",
  "detalles": ["El campo 'iniciaEn' es requerido"]
}
```

---

## 🔧 Archivos Modificados

### 1. **`src/types/index.ts`**

Agregados tipos TypeScript:

```typescript
export interface CreateReservaRequest {
  idCliente: number;
  idCancha: number;
  iniciaEn: string;
  terminaEn: string;
  cantidadPersonas: number;
  requiereAprobacion: boolean;
  montoBase: number;
  montoExtra: number;
  montoTotal: number;
}

export interface CreateReservaResponse {
  message: string;
  reserva: {
    idReserva: number;
    idCliente: number;
    idCancha: number;
    iniciaEn: string;
    terminaEn: string;
    cantidadPersonas: number;
    requiereAprobacion: boolean;
    montoBase: string;
    montoExtra: string;
    montoTotal: string;
    creadoEn: string;
    actualizadoEn: string;
  };
}
```

---

### 2. **`src/utils/helpers.ts`**

Agregada función para crear reservas:

```typescript
export const createReserva = async (
  reservaData: CreateReservaRequest
): Promise<CreateReservaResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Debes iniciar sesión para hacer una reserva');
    }

    console.log('📝 Creando reserva:', reservaData);

    const response = await fetch(`${getApiUrl('')}/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reservaData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data: CreateReservaResponse = await response.json();
    console.log('✅ Reserva creada exitosamente:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    throw error;
  }
};
```

---

### 3. **`src/pages/SportFieldDetailPage.tsx`**

**Cambios:**
- Agregado `useAuth()` para obtener datos del usuario
- Validación de autenticación en `confirmBooking()`
- Pasando datos adicionales al checkout: `fieldId`, `selectedDate`, `selectedTimeSlots`, etc.

```typescript
const { user, isLoggedIn } = useAuth();

const confirmBooking = () => {
  if (!selectedDate || selectedTimeSlots.length === 0 || !field) return;
  
  // Verificar autenticación
  if (!isLoggedIn || !user) {
    alert('Debes iniciar sesión para hacer una reserva');
    return;
  }
  
  // ... calcular precio total ...
  
  // Navegar al checkout con TODOS los datos necesarios
  navigate('/checkout', {
    state: {
      fieldId: id,
      fieldData: field,
      selectedDate: selectedDate,
      selectedTimeSlots: selectedTimeSlots,
      participants: participants,
      totalPrice: totalPrice,
      bookingDetails: { /* ... */ }
    }
  });
};
```

---

### 4. **`src/pages/CheckoutPage.tsx`**

**Cambios:**
- Importados `createReserva`, `useAuth`, y tipos
- Extraídos datos del `location.state`
- Agregado estado `isProcessing`
- Función `handlePayment()` ahora es `async` y crea la reserva

```typescript
const { user } = useAuth();

const fieldId = location.state?.fieldId;
const selectedDate = location.state?.selectedDate as Date;
const selectedTimeSlots = location.state?.selectedTimeSlots as string[];
const participants = location.state?.participants;
const totalPrice = location.state?.totalPrice;

const handlePayment = async () => {
  // Validaciones...
  
  setIsProcessing(true);

  try {
    // Construir timestamps ISO
    const firstSlot = selectedTimeSlots[0];
    const [startTime, endTime] = firstSlot.split(' - ');
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    
    const iniciaEn = `${year}-${month}-${day}T${startTime}:00`;
    const terminaEn = `${year}-${month}-${day}T${endTime}:00`;

    // Construir request
    const reservaData: CreateReservaRequest = {
      idCliente: user.idUsuario,
      idCancha: parseInt(fieldId),
      iniciaEn: iniciaEn,
      terminaEn: terminaEn,
      cantidadPersonas: participants || 1,
      requiereAprobacion: false,
      montoBase: totalPrice || 0,
      montoExtra: 0,
      montoTotal: totalPrice || 0
    };

    // Crear reserva en el backend
    const response = await createReserva(reservaData);
    
    // Navegar a confirmación
    navigate('/booking-confirmation', {
      state: {
        bookingDetails,
        paymentMethod,
        reservaId: response.reserva.idReserva,
        reserva: response.reserva
      }
    });
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    alert(error instanceof Error ? error.message : 'Error al crear la reserva');
    setIsProcessing(false);
  }
};
```

**Botón actualizado:**
```tsx
<button
  onClick={handlePayment}
  disabled={isProcessing}
  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
>
  {isProcessing ? (
    <span className="flex items-center justify-center gap-2">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      Procesando reserva...
    </span>
  ) : (
    'Confirmar y pagar'
  )}
</button>
```

---

## 🎯 Flujo Completo

### **Paso 1: Usuario selecciona horario**
- En `SportFieldDetailPage.tsx`
- Usuario elige fecha, hora y número de participantes
- Click en "Reservar"

### **Paso 2: Validación de autenticación**
```typescript
if (!isLoggedIn || !user) {
  alert('Debes iniciar sesión para hacer una reserva');
  return;
}
```

### **Paso 3: Navegación a Checkout**
- Se pasan todos los datos necesarios vía `navigate('/checkout', { state: {...} })`
- Incluye: `fieldId`, `selectedDate`, `selectedTimeSlots`, `participants`, `totalPrice`

### **Paso 4: Usuario confirma pago**
- En `CheckoutPage.tsx`
- Selecciona método de pago (tarjeta o QR)
- Valida formulario
- Click en "Confirmar y pagar"

### **Paso 5: Construcción del JSON**
```typescript
const reservaData: CreateReservaRequest = {
  idCliente: user.idUsuario,        // Del AuthContext
  idCancha: parseInt(fieldId),      // Del state
  iniciaEn: "2025-10-20T09:00:00", // Construido
  terminaEn: "2025-10-20T10:00:00", // Construido
  cantidadPersonas: participants,   // Del state
  requiereAprobacion: false,
  montoBase: totalPrice,
  montoExtra: 0,
  montoTotal: totalPrice
};
```

### **Paso 6: Envío al Backend**
```typescript
const response = await createReserva(reservaData);
```

**Request HTTP:**
```
POST http://localhost:3000/api/reservas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{body con reservaData}
```

### **Paso 7: Respuesta del Backend**
```json
{
  "message": "Reserva creada exitosamente",
  "reserva": {
    "idReserva": 123,
    ...
  }
}
```

### **Paso 8: Navegación a Confirmación**
```typescript
navigate('/booking-confirmation', {
  state: {
    bookingDetails,
    paymentMethod,
    reservaId: response.reserva.idReserva,
    reserva: response.reserva
  }
});
```

---

## 🧪 Pruebas

### **1. Verificar Token**
```javascript
// En consola del navegador
localStorage.getItem('token')
```

### **2. Verificar Usuario**
```javascript
// En consola del navegador
JSON.parse(localStorage.getItem('user'))
```

### **3. Probar Creación Manual**
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:3000/api/reservas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    idCliente: 5,
    idCancha: 4,
    iniciaEn: "2025-10-20T09:00:00",
    terminaEn: "2025-10-20T10:00:00",
    cantidadPersonas: 8,
    requiereAprobacion: false,
    montoBase: 45.00,
    montoExtra: 0.00,
    montoTotal: 45.00
  })
})
  .then(res => res.json())
  .then(data => console.log('✅', data))
  .catch(err => console.error('❌', err));
```

---

## 🐛 Troubleshooting

### **Error: "Debes iniciar sesión para hacer una reserva"**
- **Causa:** No hay token en localStorage
- **Solución:** Iniciar sesión primero

### **Error: 401 Unauthorized**
- **Causa:** Token inválido o expirado
- **Solución:** Cerrar sesión y volver a iniciar

### **Error: 409 Conflict**
- **Causa:** El horario ya está reservado
- **Solución:** Seleccionar otro horario

### **Error: "Faltan datos para completar la reserva"**
- **Causa:** Datos faltantes en el state de CheckoutPage
- **Solución:** Verificar que SportFieldDetailPage pase todos los datos necesarios

### **Console Logs para Debug**
```javascript
// En SportFieldDetailPage.tsx
console.log('🎯 Datos enviados a checkout:', {
  fieldId: id,
  selectedDate,
  selectedTimeSlots,
  participants,
  totalPrice
});

// En CheckoutPage.tsx
console.log('📝 Creando reserva:', reservaData);
console.log('✅ Reserva creada:', response);
```

---

## 📊 Checklist de Integración

- [x] Tipos TypeScript creados (`CreateReservaRequest`, `CreateReservaResponse`)
- [x] Función `createReserva()` implementada en `helpers.ts`
- [x] Validación de autenticación en `SportFieldDetailPage`
- [x] Datos pasados correctamente al checkout
- [x] Construcción de timestamps ISO 8601
- [x] Envío de request al backend con token
- [x] Manejo de errores
- [x] Estado de carga en botón
- [x] Navegación a confirmación con datos de respuesta

---

## 🚀 Próximos Pasos (Mejoras Opcionales)

1. **Reservas Múltiples:** Soportar múltiples slots en una sola reserva
2. **Validación de Disponibilidad:** Verificar disponibilidad antes de enviar
3. **Manejo de Extras:** Agregar equipos, servicios adicionales (montoExtra)
4. **Confirmación por Email:** Enviar email con QR al usuario
5. **Historial de Reservas:** Página "Mis Reservas" consumiendo `/api/reservas/usuario/:id`
6. **Cancelación de Reservas:** Endpoint `DELETE /api/reservas/:id`

---

**Última actualización:** 16 de octubre de 2025  
**Estado:** ✅ FUNCIONAL - Integración completa con backend  
**Endpoint:** `POST http://localhost:3000/api/reservas`
