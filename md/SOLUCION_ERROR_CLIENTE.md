# 🔧 Solución: Error "Cliente no encontrado"

## 🐛 Problema

```
POST http://localhost:3000/api/reservas 404 (Not Found)
Error: Cliente no encontrado
```

---

## 🔍 Causas

1. ✅ **URL incorrecta** - SOLUCIONADO
   - Antes: `${getApiUrl('')}/reservas` → `http://localhost:3000/api/reservas` ❌
   - Ahora: `${getApiUrl('/reservas')}` → `http://localhost:3000/api/reservas` ✅

2. ⚠️ **Cliente no existe en la base de datos**
   - El backend espera un registro en la tabla `Cliente`
   - Enviamos `id_cliente: 3` pero no existe en la BD

---

## ✅ Soluciones

### Solución 1: Crear registro de Cliente automáticamente

**En el Backend** - Cuando un usuario se registra con rol CLIENTE, debe crearse automáticamente un registro en la tabla `Cliente`:

```javascript
// En auth.controller.js o similar

// Después de crear el usuario con rol CLIENTE
if (usuario.roles.includes('CLIENTE')) {
  await Cliente.create({
    id_usuarioC: usuario.id_usuario,
    // otros campos si son necesarios
  });
}
```

### Solución 2: Endpoint para obtener id_cliente

**Backend:** Crear un endpoint que devuelva el `id_cliente` basado en el `id_usuario`:

```javascript
// GET /api/clientes/usuario/:id_usuario
router.get('/clientes/usuario/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  
  const cliente = await Cliente.findOne({
    where: { id_usuarioC: id_usuario }
  });
  
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  res.json({ id_cliente: cliente.id_cliente });
});
```

**Frontend:** Llamar a este endpoint cuando el usuario hace login:

```typescript
// En AuthContext.tsx después del login exitoso
if (user.roles.includes('CLIENTE')) {
  const clienteResponse = await fetch(
    `http://localhost:3000/api/clientes/usuario/${user.id_usuario}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  if (clienteResponse.ok) {
    const clienteData = await clienteResponse.json();
    user.id_cliente = clienteData.id_cliente;
  }
}
```

### Solución 3: Modificar el endpoint de login

**Backend:** El endpoint `/api/auth/login` debe devolver el `id_cliente` si existe:

```javascript
// En auth.controller.js

const loginResult = {
  usuario: {
    id_usuario: usuario.id_usuario,
    correo: usuario.correo,
    usuario: usuario.usuario,
    id_persona: usuario.id_persona,
    roles: usuario.roles,
    id_cliente: null,  // ← AGREGAR ESTO
    idDuenio: null    // ← AGREGAR ESTO
  },
  token: token
};

// Si tiene rol CLIENTE, buscar el id_cliente
if (usuario.roles.includes('CLIENTE')) {
  const cliente = await Cliente.findOne({
    where: { id_usuarioC: usuario.id_usuario }
  });
  
  if (cliente) {
    loginResult.usuario.id_cliente = cliente.id_cliente;
  }
}

// Si tiene rol DUENIO, buscar el idDuenio
if (usuario.roles.includes('DUENIO')) {
  const duenio = await Duenio.findOne({
    where: { id_usuarioD: usuario.id_usuario }
  });
  
  if (duenio) {
    loginResult.usuario.idDuenio = duenio.idDuenio;
  }
}

res.json(loginResult);
```

### Solución 4: (TEMPORAL) Crear Cliente manualmente en la BD

**SQL:**
```sql
-- Verificar tu id_usuario actual
SELECT * FROM Usuario WHERE correo = 'tu_correo@ejemplo.com';
-- Supongamos que tu id_usuario es 3

-- Crear un registro de Cliente
INSERT INTO Cliente (id_usuarioC, creado_en, actualizado_en) 
VALUES (3, NOW(), NOW());

-- Verificar que se creó
SELECT * FROM Cliente WHERE id_usuarioC = 3;
-- Esto te dará el id_cliente (por ejemplo: 1)
```

**Luego actualizar manualmente el localStorage:**
```javascript
// En la consola del navegador (F12)
const user = JSON.parse(localStorage.getItem('user'));
user.id_cliente = 1; // El id_cliente que obtuviste de la BD
localStorage.setItem('user', JSON.stringify(user));

// Recargar la página
location.reload();
```

---

## 🎯 Solución Recomendada

**La MEJOR solución es la #3**: Modificar el endpoint de login para que devuelva automáticamente `id_cliente` e `idDuenio`.

### Paso a Paso:

#### 1. **Backend: Modificar `/api/auth/login`**

```javascript
// routes/auth.routes.js o controllers/auth.controller.js

router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    
    // ... validaciones y verificación de contraseña ...
    
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Preparar respuesta
    const usuarioResponse = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      usuario: usuario.usuario,
      id_persona: usuario.id_persona,
      roles: usuario.roles.map(r => r.nombre),
      id_cliente: null,
      idDuenio: null
    };

    // Buscar id_cliente si tiene rol CLIENTE
    if (usuarioResponse.roles.includes('CLIENTE')) {
      const cliente = await Cliente.findOne({
        where: { id_usuarioC: usuario.id_usuario }
      });
      
      if (cliente) {
        usuarioResponse.id_cliente = cliente.id_cliente;
      } else {
        // OPCIONAL: Crear cliente automáticamente
        const nuevoCliente = await Cliente.create({
          id_usuarioC: usuario.id_usuario
        });
        usuarioResponse.id_cliente = nuevoCliente.id_cliente;
      }
    }

    // Buscar idDuenio si tiene rol DUENIO
    if (usuarioResponse.roles.includes('DUENIO')) {
      const duenio = await Duenio.findOne({
        where: { id_personaD: usuario.id_persona }
      });
      
      if (duenio) {
        usuarioResponse.idDuenio = duenio.idDuenio;
      }
    }

    res.json({
      message: 'Login exitoso',
      usuario: usuarioResponse,
      token: token
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});
```

#### 2. **Frontend: Ya está preparado** ✅

El frontend ya está listo para recibir `id_cliente`:

```typescript
// src/contexts/AuthContext.tsx
export interface User {
  correo: string;
  usuario: string;
  id_persona: number;
  id_usuario: number;
  id_cliente?: number;  // ← YA AGREGADO
  idDuenio?: number;   // ← YA AGREGADO
  roles: string[];
  avatar?: string;
}
```

```typescript
// src/pages/CheckoutPage.tsx
const id_cliente = user.id_cliente || user.id_usuario; // ← YA IMPLEMENTADO
```

#### 3. **Probar:**

```bash
# 1. Hacer logout
# 2. Hacer login de nuevo
# 3. Verificar en consola:
JSON.parse(localStorage.getItem('user'))

# Deberías ver:
# {
#   id_usuario: 3,
#   id_cliente: 1,  ← NUEVO
#   correo: "...",
#   roles: ["CLIENTE"],
#   ...
# }
```

---

## 📋 Checklist de Verificación

- [ ] Tabla `Cliente` existe en la BD
- [ ] Registro de `Cliente` existe para el usuario actual
- [ ] Endpoint `/api/auth/login` devuelve `id_cliente`
- [ ] Frontend recibe y guarda `id_cliente` en `user`
- [ ] La URL de reservas es correcta: `http://localhost:3000/api/reservas`
- [ ] El token JWT es válido y se envía en los headers

---

## 🧪 Query de Verificación SQL

```sql
-- Ver todos los usuarios y sus clientes
SELECT 
  u.id_usuario,
  u.correo,
  u.usuario,
  c.id_cliente,
  c.id_usuarioC,
  r.nombre as rol
FROM Usuario u
LEFT JOIN Cliente c ON c.id_usuarioC = u.id_usuario
LEFT JOIN UsuarioRol ur ON ur.id_usuario = u.id_usuario
LEFT JOIN Rol r ON r.idRol = ur.idRol
WHERE r.nombre = 'CLIENTE';

-- Si no tienes Cliente, créalo:
INSERT INTO Cliente (id_usuarioC, creado_en, actualizado_en)
SELECT id_usuario, NOW(), NOW()
FROM Usuario u
INNER JOIN UsuarioRol ur ON ur.id_usuario = u.id_usuario
INNER JOIN Rol r ON r.idRol = ur.idRol
WHERE r.nombre = 'CLIENTE'
AND NOT EXISTS (
  SELECT 1 FROM Cliente c WHERE c.id_usuarioC = u.id_usuario
);
```

---

## 🎉 Resultado Esperado

Una vez aplicada la solución, el flujo será:

1. Usuario hace login → Backend devuelve `id_cliente: 1`
2. Frontend guarda `user.id_cliente = 1`
3. Usuario hace reserva → Se envía `id_cliente: 1`
4. Backend encuentra el cliente → Reserva creada ✅

---

**Última actualización:** 16 de octubre de 2025  
**Estado:** ⚠️ Requiere cambios en el backend
