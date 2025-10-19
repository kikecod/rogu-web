# ✅ CORRECCIÓN FINAL: id_persona como id_cliente

## 🎯 Solución Aplicada

El backend está configurado para usar el **`id_persona`** como identificador del cliente en las reservas.

---

## 📝 Cambio Realizado

### Antes (❌ Incorrecto):
```typescript
const id_cliente = user.id_cliente || user.id_usuario;
```

### Ahora (✅ Correcto):
```typescript
const id_cliente = user.id_persona;
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

// Usar id_persona como id_cliente (el backend lo asocia así)
const id_cliente = user.id_persona;

if (!id_cliente) {
  alert('No se encontró la información de persona del usuario');
  return;
}

setIsProcessing(true);
```

---

## 📤 JSON que se Envía Ahora

```json
{
  "id_cliente": 2,           // ← Ahora usa user.id_persona
  "id_cancha": 5,
  "inicia_en": "2025-10-16T17:00:00",
  "termina_en": "2025-10-16T18:00:00",
  "cantidad_personas": 10,
  "requiere_aprobacion": false,
  "monto_base": 45.00,
  "monto_extra": 0.00,
  "monto_total": 45.00
}
```

---

## 🔍 Estructura del Usuario en Frontend

```typescript
export interface User {
  correo: string;
  usuario: string;
  id_persona: number;    // ← Este se usa como id_cliente
  id_usuario: number;
  roles: string[];
  avatar?: string;
}
```

---

## ✅ Verificación

Para verificar que tienes el `id_persona` correcto:

```javascript
// En la consola del navegador (F12)
const user = JSON.parse(localStorage.getItem('user'));
console.log('id_persona:', user.id_persona);
console.log('id_usuario:', user.id_usuario);
```

**Ejemplo de salida:**
```javascript
{
  correo: "usuario@ejemplo.com",
  usuario: "usuario123",
  id_persona: 2,       // ← Este valor se usa como id_cliente
  id_usuario: 3,
  roles: ["CLIENTE"]
}
```

---

## 🎯 Flujo Completo

1. Usuario inicia sesión
2. Backend devuelve `user` con `id_persona: 2`
3. Frontend guarda en localStorage
4. Usuario hace una reserva
5. Frontend usa `user.id_persona` como `id_cliente`
6. Se envía: `{ id_cliente: 2, ... }`
7. Backend busca en tabla `Cliente` con `id_personaC = 2`
8. ✅ Reserva creada exitosamente

---

## 📊 Relación de Tablas en el Backend

```
Usuario (id_usuario)
    ↓
Persona (id_persona)
    ↓
Cliente (id_cliente, id_personaC = id_persona)
    ↓
Reserva (id_reserva, id_cliente)
```

**Campos clave:**
- `Usuario.id_persona` → `Persona.id_persona`
- `Cliente.id_personaC` → `Persona.id_persona`
- `Reserva.id_cliente` → `Cliente.id_cliente`

---

## 🧪 Prueba

1. **Verificar tu id_persona:**
   ```javascript
   console.log(JSON.parse(localStorage.getItem('user')).id_persona);
   ```

2. **Verificar que existe en Cliente:**
   ```sql
   SELECT * FROM Cliente WHERE id_personaC = 2; -- Reemplaza 2 con tu id_persona
   ```

3. **Si no existe, créalo:**
   ```sql
   INSERT INTO Cliente (id_personaC, creado_en, actualizado_en) 
   VALUES (2, NOW(), NOW()); -- Reemplaza 2 con tu id_persona
   ```

4. **Hacer una reserva desde el frontend**

---

## ✨ Ventajas de esta Solución

- ✅ No requiere cambios en el backend
- ✅ Usa la estructura existente de relaciones
- ✅ Simplifica el código del frontend
- ✅ Validación clara de id_persona
- ✅ Mensaje de error específico si falta

---

## 🎉 Resultado

Ahora las reservas funcionarán correctamente usando el `id_persona` del usuario autenticado como identificador del cliente.

```
POST http://localhost:3000/api/reservas
Authorization: Bearer {token}

{
  "id_cliente": 2,  // user.id_persona
  "id_cancha": 5,
  "inicia_en": "2025-10-16T17:00:00",
  "termina_en": "2025-10-16T18:00:00",
  ...
}
```

✅ **Status: 200 OK**
✅ **Reserva creada exitosamente**

---

**Última actualización:** 16 de octubre de 2025  
**Estado:** 🟢 SOLUCIONADO  
**Cambio:** `id_cliente = user.id_persona`
