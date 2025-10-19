# 🎯 Resumen Ejecutivo: Integración de Reservas

## ✅ COMPLETADO

La integración de reservas con el backend está **100% funcional**.

---

## 📡 Endpoint

```
POST http://localhost:3000/api/reservas
```

---

## 📤 JSON a Enviar

```json
{
  "id_cliente": 5,
  "id_cancha": 4,
  "inicia_en": "2025-10-20T09:00:00",
  "termina_en": "2025-10-20T10:00:00",
  "cantidad_personas": 8,
  "requiere_aprobacion": false,
  "monto_base": 45.00,
  "monto_extra": 0.00,
  "monto_total": 45.00
}
```

---

## 📥 JSON que Recibirás

```json
{
  "message": "Reserva creada exitosamente",
  "reserva": {
    "id_reserva": 123,
    "id_cliente": 5,
    "id_cancha": 4,
    "inicia_en": "2025-10-20T09:00:00.000Z",
    "termina_en": "2025-10-20T10:00:00.000Z",
    "cantidad_personas": 8,
    "requiere_aprobacion": false,
    "monto_base": "45.00",
    "monto_extra": "0.00",
    "monto_total": "45.00",
    "creado_en": "2025-10-16T15:30:45.123Z",
    "actualizado_en": "2025-10-16T15:30:45.123Z"
  }
}
```

---

## 🔄 Flujo Visual

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SportFieldDetailPage.tsx                                     │
│    Usuario selecciona: fecha, hora, participantes               │
│    → Click "Reservar"                                           │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
                ┌───────────────┐
                │ ¿Autenticado? │
                └───────┬───────┘
                        ↓
                ┌───────────────┐
                │   user.       │
                │  id_usuario?   │
                └───────┬───────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. navigate('/checkout', { state: {...} })                      │
│    Datos pasados:                                               │
│    - fieldId: "4"                                               │
│    - selectedDate: Date object                                  │
│    - selectedTimeSlots: ["09:00 - 10:00"]                       │
│    - participants: 8                                            │
│    - totalPrice: 45.00                                          │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CheckoutPage.tsx                                             │
│    Usuario elige método de pago (tarjeta/QR)                   │
│    → Click "Confirmar y pagar"                                  │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. handlePayment() [ASYNC]                                      │
│    Construir JSON:                                              │
│    {                                                            │
│      id_cliente: user.id_usuario,                                 │
│      id_cancha: parseInt(fieldId),                               │
│      inicia_en: "2025-10-20T09:00:00",                           │
│      termina_en: "2025-10-20T10:00:00",                          │
│      cantidad_personas: participants,                            │
│      requiere_aprobacion: false,                                 │
│      monto_base: totalPrice,                                     │
│      monto_extra: 0,                                             │
│      monto_total: totalPrice                                     │
│    }                                                            │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. createReserva(reservaData)                                   │
│    POST http://localhost:3000/api/reservas                      │
│    Headers:                                                     │
│    - Authorization: Bearer {token}                              │
│    - Content-Type: application/json                            │
│    Body: JSON con reservaData                                   │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
                ┌───────────────┐
                │   Backend     │
                │   Procesa     │
                └───────┬───────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Response del Backend                                         │
│    {                                                            │
│      message: "Reserva creada exitosamente",                    │
│      reserva: {                                                 │
│        id_reserva: 123,                                          │
│        ...                                                      │
│      }                                                          │
│    }                                                            │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. navigate('/booking-confirmation')                            │
│    state: {                                                     │
│      reservaId: 123,                                            │
│      reserva: response.reserva,                                 │
│      bookingDetails: {...}                                      │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Datos Clave

| Dato | Origen | Ejemplo |
|------|--------|---------|
| `id_cliente` | `user.id_usuario` (AuthContext) | `5` |
| `id_cancha` | `id` param de URL | `4` |
| `inicia_en` | Construido: `YYYY-MM-DDTHH:mm:ss` | `"2025-10-20T09:00:00"` |
| `termina_en` | Construido: `YYYY-MM-DDTHH:mm:ss` | `"2025-10-20T10:00:00"` |
| `cantidad_personas` | Estado `participants` | `8` |
| `monto_total` | Suma de precios de slots | `45.00` |
| `token` | `localStorage.getItem('token')` | `eyJhbG...` |

---

## 📁 Archivos Modificados

1. ✅ `src/types/index.ts` - Tipos `CreateReservaRequest` y `CreateReservaResponse`
2. ✅ `src/utils/helpers.ts` - Función `createReserva()`
3. ✅ `src/pages/SportFieldDetailPage.tsx` - Validación auth + pasar datos
4. ✅ `src/pages/CheckoutPage.tsx` - Implementación completa

---

## 🧪 Cómo Probar

### 1. Iniciar Sesión
```
1. Click en "Iniciar sesión"
2. Usar credenciales válidas
3. Verificar que aparezca el email en el header
```

### 2. Seleccionar Cancha
```
1. Navegar a http://localhost:5173/field/4
2. Seleccionar fecha futura
3. Seleccionar horario disponible
4. Ajustar número de participantes
5. Click "Reservar"
```

### 3. Confirmar Pago
```
1. Seleccionar método de pago (tarjeta o QR)
2. Si es tarjeta, llenar datos
3. Click "Confirmar y pagar"
4. Esperar respuesta del backend
```

### 4. Verificar en Consola
```javascript
// Abrir DevTools (F12) → Console
// Deberías ver:
📝 Creando reserva: {id_cliente: 5, id_cancha: 4, ...}
✅ Reserva creada exitosamente: {message: "...", reserva: {...}}
```

---

## ⚠️ Posibles Errores

| Error | Causa | Solución |
|-------|-------|----------|
| "Debes iniciar sesión" | No hay token | Iniciar sesión |
| 401 Unauthorized | Token inválido | Cerrar sesión y re-login |
| 409 Conflict | Horario ocupado | Elegir otro horario |
| "Faltan datos" | State incompleto | Verificar flujo completo |

---

## 📊 Checklist

- [x] ✅ Backend preparado con endpoint `/api/reservas`
- [x] ✅ Frontend conectado al endpoint
- [x] ✅ Tipos TypeScript definidos
- [x] ✅ Función `createReserva()` implementada
- [x] ✅ Validación de autenticación
- [x] ✅ Construcción correcta de timestamps ISO
- [x] ✅ Envío de token en headers
- [x] ✅ Manejo de errores
- [x] ✅ Estado de carga en UI
- [x] ✅ Navegación a confirmación

---

## 🎉 Resultado Final

Cuando el usuario completa el flujo:

1. ✅ Se crea una reserva en la base de datos
2. ✅ Se obtiene un `id_reserva` único
3. ✅ Se navega a la página de confirmación
4. ✅ Se muestra el QR de acceso
5. ✅ El usuario puede ver su reserva en "Mis Reservas"

---

**Estado:** 🟢 FUNCIONAL  
**Última actualización:** 16 de octubre de 2025  
**Documentación completa:** `INTEGRACION_RESERVAS.md`
