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
   - Enviamos `idCliente: 3` pero no existe en la BD

---

## ✅ Soluciones

### Solución 1: Crear registro de Cliente automáticamente

**En el Backend** - Cuando un usuario se registra con rol CLIENTE, debe crearse automáticamente un registro en la tabla `Cliente`:

```javascript
// En auth.controller.js o similar

// Después de crear el usuario con rol CLIENTE
if (usuario.roles.includes('CLIENTE')) {
  await Cliente.create({
    idUsuarioC: usuario.idUsuario,
    // otros campos si son necesarios
  });
}
```

### Solución 2: Endpoint para obtener idCliente

**Backend:** Crear un endpoint que devuelva el `idCliente` basado en el `idUsuario`:

```javascript
// GET /api/clientes/usuario/:idUsuario
router.get('/clientes/usuario/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;
  
  const cliente = await Cliente.findOne({
    where: { idUsuarioC: idUsuario }
  });
  
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  res.json({ idCliente: cliente.idCliente });
});
```

**Frontend:** Llamar a este endpoint cuando el usuario hace login:

```typescript
// En AuthContext.tsx después del login exitoso
if (user.roles.includes('CLIENTE')) {
  const clienteResponse = await fetch(
    `http://localhost:3000/api/clientes/usuario/${user.idUsuario}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  if (clienteResponse.ok) {
    const clienteData = await clienteResponse.json();
    user.idCliente = clienteData.idCliente;
  }
}
```

### Solución 3: Modificar el endpoint de login

**Backend:** El endpoint `/api/auth/login` debe devolver el `idCliente` si existe:

```javascript
// En auth.controller.js

const loginResult = {
  usuario: {
    idUsuario: usuario.idUsuario,
    correo: usuario.correo,
    usuario: usuario.usuario,
    idPersona: usuario.idPersona,
    roles: usuario.roles,
    idCliente: null,  // ← AGREGAR ESTO
    idDuenio: null    // ← AGREGAR ESTO
  },
  token: token
};

// Si tiene rol CLIENTE, buscar el idCliente
if (usuario.roles.includes('CLIENTE')) {
  const cliente = await Cliente.findOne({
    where: { idUsuarioC: usuario.idUsuario }
  });
  
  if (cliente) {
    loginResult.usuario.idCliente = cliente.idCliente;
  }
}

// Si tiene rol DUENIO, buscar el idDuenio
if (usuario.roles.includes('DUENIO')) {
  const duenio = await Duenio.findOne({
    where: { idUsuarioD: usuario.idUsuario }
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
-- Verificar tu idUsuario actual
SELECT * FROM Usuario WHERE correo = 'tu_correo@ejemplo.com';
-- Supongamos que tu idUsuario es 3

-- Crear un registro de Cliente
INSERT INTO Cliente (idUsuarioC, creadoEn, actualizadoEn) 
VALUES (3, NOW(), NOW());

-- Verificar que se creó
SELECT * FROM Cliente WHERE idUsuarioC = 3;
-- Esto te dará el idCliente (por ejemplo: 1)
```

**Luego actualizar manualmente el localStorage:**
```javascript
// En la consola del navegador (F12)
const user = JSON.parse(localStorage.getItem('user'));
user.idCliente = 1; // El idCliente que obtuviste de la BD
localStorage.setItem('user', JSON.stringify(user));

// Recargar la página
location.reload();
```

---

## 🎯 Solución Recomendada

**La MEJOR solución es la #3**: Modificar el endpoint de login para que devuelva automáticamente `idCliente` e `idDuenio`.

### Paso a Paso:

#### 1. **Backend: Modificar `/api/auth/login`**

```javascript
// routes/auth.routes.js o controllers/auth.controller.js

router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    
    // ... validaciones y verificación de contraseña ...
    
    const token = jwt.sign(
      { idUsuario: usuario.idUsuario, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Preparar respuesta
    const usuarioResponse = {
      idUsuario: usuario.idUsuario,
      correo: usuario.correo,
      usuario: usuario.usuario,
      idPersona: usuario.idPersona,
      roles: usuario.roles.map(r => r.nombre),
      idCliente: null,
      idDuenio: null
    };

    // Buscar idCliente si tiene rol CLIENTE
    if (usuarioResponse.roles.includes('CLIENTE')) {
      const cliente = await Cliente.findOne({
        where: { idUsuarioC: usuario.idUsuario }
      });
      
      if (cliente) {
        usuarioResponse.idCliente = cliente.idCliente;
      } else {
        // OPCIONAL: Crear cliente automáticamente
        const nuevoCliente = await Cliente.create({
          idUsuarioC: usuario.idUsuario
        });
        usuarioResponse.idCliente = nuevoCliente.idCliente;
      }
    }

    // Buscar idDuenio si tiene rol DUENIO
    if (usuarioResponse.roles.includes('DUENIO')) {
      const duenio = await Duenio.findOne({
        where: { idPersonaD: usuario.idPersona }
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

El frontend ya está listo para recibir `idCliente`:

```typescript
// src/contexts/AuthContext.tsx
export interface User {
  correo: string;
  usuario: string;
  idPersona: number;
  idUsuario: number;
  idCliente?: number;  // ← YA AGREGADO
  idDuenio?: number;   // ← YA AGREGADO
  roles: string[];
  avatar?: string;
}
```

```typescript
// src/pages/CheckoutPage.tsx
const idCliente = user.idCliente || user.idUsuario; // ← YA IMPLEMENTADO
```

#### 3. **Probar:**

```bash
# 1. Hacer logout
# 2. Hacer login de nuevo
# 3. Verificar en consola:
JSON.parse(localStorage.getItem('user'))

# Deberías ver:
# {
#   idUsuario: 3,
#   idCliente: 1,  ← NUEVO
#   correo: "...",
#   roles: ["CLIENTE"],
#   ...
# }
```

---

## 📋 Checklist de Verificación

- [ ] Tabla `Cliente` existe en la BD
- [ ] Registro de `Cliente` existe para el usuario actual
- [ ] Endpoint `/api/auth/login` devuelve `idCliente`
- [ ] Frontend recibe y guarda `idCliente` en `user`
- [ ] La URL de reservas es correcta: `http://localhost:3000/api/reservas`
- [ ] El token JWT es válido y se envía en los headers

---

## 🧪 Query de Verificación SQL

```sql
-- Ver todos los usuarios y sus clientes
SELECT 
  u.idUsuario,
  u.correo,
  u.usuario,
  c.idCliente,
  c.idUsuarioC,
  r.nombre as rol
FROM Usuario u
LEFT JOIN Cliente c ON c.idUsuarioC = u.idUsuario
LEFT JOIN UsuarioRol ur ON ur.idUsuario = u.idUsuario
LEFT JOIN Rol r ON r.idRol = ur.idRol
WHERE r.nombre = 'CLIENTE';

-- Si no tienes Cliente, créalo:
INSERT INTO Cliente (idUsuarioC, creadoEn, actualizadoEn)
SELECT idUsuario, NOW(), NOW()
FROM Usuario u
INNER JOIN UsuarioRol ur ON ur.idUsuario = u.idUsuario
INNER JOIN Rol r ON r.idRol = ur.idRol
WHERE r.nombre = 'CLIENTE'
AND NOT EXISTS (
  SELECT 1 FROM Cliente c WHERE c.idUsuarioC = u.idUsuario
);
```

---

## 🎉 Resultado Esperado

Una vez aplicada la solución, el flujo será:

1. Usuario hace login → Backend devuelve `idCliente: 1`
2. Frontend guarda `user.idCliente = 1`
3. Usuario hace reserva → Se envía `idCliente: 1`
4. Backend encuentra el cliente → Reserva creada ✅

---

**Última actualización:** 16 de octubre de 2025  
**Estado:** ⚠️ Requiere cambios en el backend
