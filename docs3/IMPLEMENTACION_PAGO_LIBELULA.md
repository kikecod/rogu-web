# Sistema de Pago con Libélula - Implementación Completa

## 📋 Resumen

Se ha implementado la integración completa del sistema de pagos con la pasarela Libélula, incluyendo:

1. ✅ Servicios de API para comunicación con el backend
2. ✅ Configuración de WebSocket para escucha de pagos en tiempo real
3. ✅ Modales interactivos para selección de método de pago y visualización de QR
4. ✅ Página de espera con feedback en tiempo real
5. ✅ Integración completa en el flujo de checkout

---

## 🏗️ Arquitectura

### Archivos Creados

```
src/modules/bookings/
├── types/
│   └── libelula.types.ts           # Tipos TypeScript para Libélula
├── services/
│   ├── libelulaService.ts          # Servicio de API para crear deuda
│   └── socketService.ts            # Servicio de WebSocket
├── hooks/
│   └── usePagoLibelula.ts          # Hook personalizado para manejo de pagos
├── components/
│   ├── ModalSeleccionPago.tsx      # Modal para elegir método de pago
│   └── ModalQRPago.tsx             # Modal para mostrar QR de pago
└── pages/
    ├── EsperandoPagoPage.tsx       # Página de espera del pago
    └── CheckoutPage.tsx            # Modificado para usar Libélula
```

### Rutas Agregadas

```typescript
ROUTES.esperandoPago = '/esperando-pago'
```

---

## 🔄 Flujo de Pago Completo

### 1. Usuario en CheckoutPage

```
Usuario llena formulario → Click en "Confirmar y pagar"
```

### 2. Selección de Método de Pago

```tsx
// Se abre ModalSeleccionPago
<ModalSeleccionPago
  isOpen={true}
  onSelectMetodo={(metodo) => {
    // 'qr' o 'tarjeta'
  }}
/>
```

**Opciones:**
- **QR Simple**: Para pagar con billetera digital
- **Tarjeta**: Redirige a pasarela web de Libélula

### 3. Creación de Deuda en Libélula

```typescript
// Hook usePagoLibelula
await iniciarPago(
  idReserva,       // ID de la reserva
  monto,           // Monto total
  descripcion,     // Descripción del pago
  metodoPago       // 'qr' o 'tarjeta'
);
```

**Request al Backend:**
```http
POST /api/libelula/crear-deuda
Content-Type: application/json

{
  "idReserva": 33,
  "email_cliente": "cliente@example.com",
  "identificador_deuda": "ROGU-MI8E4GKL-IVIUGPZT",
  "descripcion": "Reserva de Cancha de Fútbol...",
  "moneda": "BOB",
  "emite_factura": false,
  "lineas_detalle_deuda": [
    {
      "concepto": "Reserva...",
      "cantidad": 1,
      "costo_unitario": 100.00
    }
  ]
}
```

**Response del Backend:**
```json
{
  "pasarelaUrl": "https://pagos.libelula.bo/?id=...",
  "transaccionId": "7680faaa-87a3-4c5a-9a67-f6711fa2bc73",
  "qrSimpleUrl": "https://pagos.libelula.bo/QrImages/...",
  "mensaje": "Deuda registrada con éxito..."
}
```

### 4. Procesamiento según Método

#### Opción A: QR Simple

```
1. Se muestra ModalQRPago con el QR
2. Usuario escanea el QR con su app
3. Usuario confirma y cierra el modal
4. Redirige a /esperando-pago?transaccionId=...
```

#### Opción B: Tarjeta

```
1. Redirige a /esperando-pago?transaccionId=...
2. Abre pasarelaUrl en nueva pestaña
3. Usuario completa pago en la pasarela
```

### 5. Página de Espera (EsperandoPagoPage)

```tsx
// Conecta al WebSocket
const socket = getSocket();

// Se suscribe a la transacción
socket.emit('suscribirse-a-transaccion', { 
  transaccionId 
});

// Escucha el evento de pago completado
socket.on('pago-completado', (data) => {
  // { reservaId, mensaje }
  navigate(`/booking-confirmation/${data.reservaId}`);
});
```

**Estados:**
- 🔄 **Esperando**: Muestra loader animado
- ✅ **Completado**: Muestra check y redirige
- ❌ **Error/Timeout**: Muestra opciones de ayuda

### 6. Confirmación Final

```
Redirige a /booking-confirmation/:reservaId
→ Muestra QR de acceso a la cancha
→ Detalles de la reserva confirmada
```

---

## 🔌 Integración con WebSocket

### Conexión

```typescript
// socketService.ts
const socket = io('ws://localhost:3000', {
  transports: ['websocket', 'polling'],
  reconnection: true
});
```

### Eventos

#### Cliente → Servidor
```typescript
socket.emit('suscribirse-a-transaccion', { 
  transaccionId: 'uuid-v4' 
});
```

#### Servidor → Cliente
```typescript
socket.on('pago-completado', (data) => {
  console.log(data);
  // {
  //   reservaId: 33,
  //   mensaje: "Pago completado exitosamente"
  // }
});
```

---

## 🎨 Componentes UI

### ModalSeleccionPago

**Props:**
```typescript
interface ModalSeleccionPagoProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMetodo: (metodo: 'qr' | 'tarjeta') => void;
  loading?: boolean;
}
```

**Características:**
- ✨ Animación de entrada suave
- 🎨 Diseño moderno con gradientes
- 🔒 Badge de seguridad con Libélula
- ♿ Manejo de estado de carga

### ModalQRPago

**Props:**
```typescript
interface ModalQRPagoProps {
  isOpen: boolean;
  onClose: () => void;
  qrUrl: string;
  transaccionId: string;
}
```

**Características:**
- 📱 Muestra QR de pago
- ⬇️ Botón de descarga del QR
- 📋 Instrucciones paso a paso
- ⚡ Loader mientras carga la imagen
- 🎨 Bordes decorativos en el QR

### EsperandoPagoPage

**Características:**
- ⏳ Loader animado durante espera
- 🎉 Animación de éxito al completar
- ⚠️ Manejo de errores y timeouts
- 🔔 Conexión WebSocket automática
- 🧹 Cleanup al desmontar

---

## 🛠️ Hook Personalizado: usePagoLibelula

### Uso

```typescript
const {
  loading,
  transaccionId,
  qrUrl,
  pasarelaUrl,
  iniciarPago,
  navegarAEsperaPago,
  reset
} = usePagoLibelula({
  onError: (error) => {
    console.error(error);
    alert(error.message);
  }
});
```

### Métodos

#### `iniciarPago()`

```typescript
await iniciarPago(
  idReserva: number,
  monto: number,
  descripcion: string,
  metodoPago: 'qr' | 'tarjeta'
): Promise<void>
```

**Comportamiento:**
- Valida que el usuario tenga email
- Genera identificador único de deuda
- Llama al servicio `crearDeudaLibelula`
- Guarda transaccionId, qrUrl, pasarelaUrl
- Si es QR: solo guarda datos
- Si es tarjeta: navega y abre pasarela

#### `navegarAEsperaPago()`

Navega a la página de espera con el transaccionId actual.

#### `reset()`

Limpia todos los estados del hook.

---

## 📦 Dependencias Instaladas

```json
{
  "socket.io-client": "^4.x.x"
}
```

Instalación:
```bash
npm install socket.io-client
```

---

## 🔐 Variables de Entorno

Asegúrate de configurar:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=ws://localhost:3000
```

---

## 🧪 Testing del Flujo

### 1. Crear Reserva de Prueba

```bash
# Inicia el servidor de desarrollo
npm run dev
```

### 2. Navegar al Checkout

```
http://localhost:5173/checkout
```

### 3. Completar el Flujo

1. Click en "Confirmar y pagar"
2. Seleccionar método (QR o Tarjeta)
3. Para QR:
   - Escanear el QR mostrado
   - Completar pago en la app
   - Cerrar modal
4. Para Tarjeta:
   - Completar pago en la pasarela abierta
5. Verificar redirección automática a confirmación

### 4. Verificar WebSocket

Abre la consola del navegador y busca:

```
✅ [Socket] Conectado al servidor: <socket-id>
🔔 [Socket] Suscribiéndose a transacción: <transaction-id>
👂 [Socket] Escuchando evento "pago-completado"
✅ [EsperandoPago] Pago completado: { reservaId, mensaje }
```

---

## 🐛 Troubleshooting

### Error: "No se encontró el email del usuario"

**Causa:** Usuario no está autenticado o no tiene email.

**Solución:**
```typescript
// Verificar que el usuario tenga el campo 'correo'
console.log(user?.correo);
```

### Error: "Socket no se conecta"

**Causa:** URL de socket incorrecta o servidor no está corriendo.

**Solución:**
1. Verificar que el backend esté corriendo
2. Verificar VITE_SOCKET_URL en .env
3. Revisar que el servidor WebSocket esté habilitado

### Pago no se confirma automáticamente

**Causa:** WebSocket no está emitiendo el evento.

**Solución:**
1. Verificar que el backend emita `pago-completado`
2. Revisar que el transaccionId sea correcto
3. Verificar logs en consola del navegador

---

## 📝 Notas Importantes

1. **Timeout de 5 minutos**: La página de espera tiene un timeout de 5 minutos para evitar esperas infinitas.

2. **Cleanup automático**: Los listeners de WebSocket se limpian automáticamente al desmontar componentes.

3. **Manejo de errores**: Todos los servicios tienen manejo robusto de errores con mensajes descriptivos.

4. **Identificador único**: Cada deuda tiene un identificador único generado con timestamp + random.

5. **Redirección segura**: Después del pago, se usa `navigate` con `replace: true` para evitar problemas con el botón atrás.

---

## 🚀 Próximos Pasos Sugeridos

1. **Agregar tests unitarios** para los servicios y hooks
2. **Implementar retry logic** para fallos de red
3. **Agregar analytics** para trackear conversión de pagos
4. **Implementar notificaciones push** cuando se complete el pago
5. **Agregar soporte para múltiples monedas**
6. **Implementar sistema de reembolsos**

---

## 📚 Referencias

- [Documentación de Libélula](https://docs.libelula.bo)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [React Hooks](https://react.dev/reference/react)

---

**Fecha de Implementación:** 21 de noviembre de 2025  
**Versión:** 1.0.0  
**Autor:** Sistema de IA
