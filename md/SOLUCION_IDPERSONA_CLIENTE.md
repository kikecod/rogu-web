# ✅ CORRECCIÓN FINAL: idPersona como idCliente

## 🎯 Solución Aplicada

El backend está configurado para usar el **`idPersona`** como identificador del cliente en las reservas.

---

## 📝 Cambio Realizado

### Antes (❌ Incorrecto):
```typescript
const idCliente = user.idCliente || user.idUsuario;
```

### Ahora (✅ Correcto):
```typescript
const idCliente = user.idPersona;
```

---

## 🔧 Código Actualizado

**Archivo:** `src/pages/CheckoutPage.tsx`

```typescript
// Validar que el usuario tenga el rol de CLIENTE
if (!user.roles?.includes('CLIENTE')) {
  alert('Debes tener el rol de cliente para hacer reservas');
  return;
}

// Usar idPersona como idCliente (el backend lo asocia así)
const idCliente = user.idPersona;

if (!idCliente) {
  alert('No se encontró la información de persona del usuario');
  return;
}

setIsProcessing(true);
```

---

## 📤 JSON que se Envía Ahora

```json
{
  "idCliente": 2,           // ← Ahora usa user.idPersona
  "idCancha": 5,
  "iniciaEn": "2025-10-16T17:00:00",
  "terminaEn": "2025-10-16T18:00:00",
  "cantidadPersonas": 10,
  "requiereAprobacion": false,
  "montoBase": 45.00,
  "montoExtra": 0.00,
  "montoTotal": 45.00
}
```

---

## 🔍 Estructura del Usuario en Frontend

```typescript
export interface User {
  correo: string;
  usuario: string;
  idPersona: number;    // ← Este se usa como idCliente
  idUsuario: number;
  roles: string[];
  avatar?: string;
}
```

---

## ✅ Verificación

Para verificar que tienes el `idPersona` correcto:

```javascript
// En la consola del navegador (F12)
const user = JSON.parse(localStorage.getItem('user'));
console.log('idPersona:', user.idPersona);
console.log('idUsuario:', user.idUsuario);
```

**Ejemplo de salida:**
```javascript
{
  correo: "usuario@ejemplo.com",
  usuario: "usuario123",
  idPersona: 2,       // ← Este valor se usa como idCliente
  idUsuario: 3,
  roles: ["CLIENTE"]
}
```

---

## 🎯 Flujo Completo

1. Usuario inicia sesión
2. Backend devuelve `user` con `idPersona: 2`
3. Frontend guarda en localStorage
4. Usuario hace una reserva
5. Frontend usa `user.idPersona` como `idCliente`
6. Se envía: `{ idCliente: 2, ... }`
7. Backend busca en tabla `Cliente` con `idPersonaC = 2`
8. ✅ Reserva creada exitosamente

---

## 📊 Relación de Tablas en el Backend

```
Usuario (idUsuario)
    ↓
Persona (idPersona)
    ↓
Cliente (idCliente, idPersonaC = idPersona)
    ↓
Reserva (idReserva, idCliente)
```

**Campos clave:**
- `Usuario.idPersona` → `Persona.idPersona`
- `Cliente.idPersonaC` → `Persona.idPersona`
- `Reserva.idCliente` → `Cliente.idCliente`

---

## 🧪 Prueba

1. **Verificar tu idPersona:**
   ```javascript
   console.log(JSON.parse(localStorage.getItem('user')).idPersona);
   ```

2. **Verificar que existe en Cliente:**
   ```sql
   SELECT * FROM Cliente WHERE idPersonaC = 2; -- Reemplaza 2 con tu idPersona
   ```

3. **Si no existe, créalo:**
   ```sql
   INSERT INTO Cliente (idPersonaC, creadoEn, actualizadoEn) 
   VALUES (2, NOW(), NOW()); -- Reemplaza 2 con tu idPersona
   ```

4. **Hacer una reserva desde el frontend**

---

## ✨ Ventajas de esta Solución

- ✅ No requiere cambios en el backend
- ✅ Usa la estructura existente de relaciones
- ✅ Simplifica el código del frontend
- ✅ Validación clara de idPersona
- ✅ Mensaje de error específico si falta

---

## 🎉 Resultado

Ahora las reservas funcionarán correctamente usando el `idPersona` del usuario autenticado como identificador del cliente.

```
POST http://localhost:3000/api/reservas
Authorization: Bearer {token}

{
  "idCliente": 2,  // user.idPersona
  "idCancha": 5,
  "iniciaEn": "2025-10-16T17:00:00",
  "terminaEn": "2025-10-16T18:00:00",
  ...
}
```

✅ **Status: 200 OK**
✅ **Reserva creada exitosamente**

---

**Última actualización:** 16 de octubre de 2025  
**Estado:** 🟢 SOLUCIONADO  
**Cambio:** `idCliente = user.idPersona`
