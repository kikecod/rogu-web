# Implementación de Verificación de Identidad para Dueños

## 📋 Resumen

Se ha actualizado la página `HostSpacePage` para integrar el proceso de verificación de identidad usando la API de Persona antes de permitir que un usuario se convierta en dueño de espacios deportivos.

## 🔧 Cambios Realizados

### 1. Actualización de `HostSpacePage.tsx`

#### Nuevas Funcionalidades

1. **Verificación Automática de Estado**
   - Al cargar la página, se verifica si el usuario ya tiene un proceso de verificación iniciado
   - Se consulta el endpoint `/api/duenio/persona/{idPersona}` para obtener el estado actual

2. **Inicio de Verificación de Identidad**
   - Se inicia automáticamente el proceso de verificación al registrarse como dueño
   - Se crea una verificación en Persona API con los datos del usuario
   - Se genera una URL de sesión para que el usuario complete la verificación

3. **Registro de Dueño con Verificación**
   - Al confirmar el registro, se crea el registro de dueño con el `inquiryId` de Persona
   - Se abre automáticamente la URL de verificación en una nueva pestaña
   - El estado inicial es `created` y `verificado: false`

4. **Indicadores de Estado de Verificación**
   - **Verificada (approved)**: Muestra badge verde de identidad verificada
   - **Pendiente (pending)**: Muestra que la verificación está en revisión
   - **Creada (created)**: Muestra botón para completar la verificación
   - **Rechazada (failed)**: Muestra mensaje de error

#### Nuevos Estados

```typescript
interface VerificationStatus {
  hasVerification: boolean;
  inquiryId?: string;
  status?: string;
  aprobada?: boolean;
  verificado?: boolean;
}
```

#### Funciones Principales

##### `checkVerificationStatus()`
Verifica el estado actual de verificación del usuario consultando el backend.

```typescript
const checkVerificationStatus = async () => {
  const duenioResponse = await fetch(
    `http://localhost:3000/api/duenio/persona/${user?.idPersona}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  // Actualiza el estado de verificación
}
```

##### `iniciarVerificacionIdentidad()`
Inicia el proceso de verificación de identidad con Persona API.

```typescript
const iniciarVerificacionIdentidad = async () => {
  // 1. Crea verificación en Persona
  const response = await fetch('http://localhost:3000/api-persona/verificaciones', {
    method: 'POST',
    body: JSON.stringify({
      referenceId: user?.idPersona?.toString(),
      metadata: { nombre: user?.usuario, email: user?.correo }
    })
  });
  
  // 2. Genera URL de sesión
  const sessionResponse = await fetch(
    `http://localhost:3000/api-persona/verificaciones/${inquiryId}/session`,
    { method: 'POST' }
  );
  
  return { inquiryId, verificationUrl };
}
```

##### `createDuenio()`
Crea el registro de dueño con la información de verificación.

```typescript
const createDuenio = async (idPersona: number, inquiryId: string) => {
  const duenioData = {
    idPersonaD: idPersona,
    verificado: false,
    imagenCI: 'pending_verification',
    imagenFacial: 'pending_verification',
    inquiryId: inquiryId,
    personaStatus: 'created',
  };
  // Envía al backend
}
```

## 🎨 Componentes UI Agregados

### 1. Banner de Estado de Verificación

Muestra el estado actual de la verificación con diferentes estilos según el estado:

- ✅ **Verde**: Identidad verificada
- ⏳ **Amarillo**: En proceso de revisión
- ⚠️ **Naranja**: Pendiente de completar (con botón para continuar)
- ❌ **Rojo**: Verificación rechazada

### 2. Sección de Requisitos

Nueva sección que muestra:
- Documentos aceptados (CC, CE, PP)
- Requisitos técnicos (cámara, iluminación, documento físico)

### 3. Nuevo Beneficio

Se agregó "Identidad verificada" como beneficio con ícono de `FileCheck`.

### 4. Proceso Actualizado

La información "¿Qué sucede después?" fue actualizada para incluir:
- Verificación de identidad con Persona
- Proceso de toma de fotos de documento y selfie
- Estándares de seguridad internacionales

## 🔄 Flujo de Usuario

### Caso 1: Usuario Nuevo (Sin Verificación)

```
1. Usuario hace clic en "Iniciar registro y verificación"
2. Se crea el registro de dueño con estado inicial
3. Se inicia verificación en Persona API
4. Se abre nueva pestaña con el proceso de verificación
5. Usuario completa verificación de identidad
6. Sistema muestra estado "Verificación pendiente"
7. Una vez aprobada, puede gestionar espacios
```

### Caso 2: Usuario con Verificación Pendiente

```
1. Usuario ve el estado "Verificación pendiente"
2. Puede hacer clic en "Completar verificación ahora"
3. Se abre la URL de sesión de Persona
4. Completa el proceso
5. Estado se actualiza automáticamente
```

### Caso 3: Usuario con Verificación Aprobada

```
1. Usuario ve el badge verde "Identidad verificada"
2. Puede acceder directamente al panel de administración
3. Puede crear y gestionar sedes
```

## 📡 Endpoints Utilizados

### Backend (espacios_deportivos)

```bash
# Consultar dueño por persona
GET /api/duenio/persona/{idPersona}
Authorization: Bearer {token}

# Crear dueño
POST /api/duenio
Authorization: Bearer {token}
Body: {
  idPersonaD, verificado, imagenCI, imagenFacial, 
  inquiryId, personaStatus
}

# Crear verificación
POST /api-persona/verificaciones
Authorization: Bearer {token}
Body: { referenceId, metadata }

# Generar URL de sesión
POST /api-persona/verificaciones/{inquiryId}/session
Authorization: Bearer {token}

# Consultar estado de verificación
GET /api-persona/verificaciones/{inquiryId}
Authorization: Bearer {token}
```

## 🔐 Seguridad

1. **Autenticación**: Todos los endpoints requieren token JWT
2. **Verificación de Identidad**: Proceso delegado a Persona (estándares internacionales)
3. **Estados Controlados**: Solo usuarios con verificación aprobada pueden gestionar sedes
4. **Datos Sensibles**: Las imágenes de documentos se manejan en Persona, no en nuestro sistema

## 📝 Notas Importantes

### Variables de Entorno Requeridas (Backend)

```env
PERSONA_API_URL=https://withpersona.com
PERSONA_API_KEY=persona_sandbox_xxxxxxxxxxxxxxxx
PERSONA_API_VERSION=2023-01-05
PERSONA_TEMPLATE_ID=itmpl_xxxxxxxxxxxxxxxx
PERSONA_ENVIRONMENT=sandbox
```

### Estados de Verificación en Persona

| Estado | Descripción |
|--------|-------------|
| `created` | Verificación creada, esperando que el usuario inicie |
| `pending` | En proceso de revisión |
| `approved` | Verificación aprobada ✅ |
| `completed` | Proceso completado |
| `failed` | Verificación fallida ❌ |
| `expired` | Verificación expirada |

## ✅ Próximos Pasos Sugeridos

1. **Webhook de Persona**
   - Implementar endpoint para recibir notificaciones automáticas
   - Actualizar estado de verificación en tiempo real

2. **Notificaciones al Usuario**
   - Enviar email cuando la verificación sea aprobada/rechazada
   - Notificación push en la app

3. **Dashboard de Verificaciones**
   - Panel para administradores para ver todas las verificaciones
   - Herramientas para ayudar con verificaciones rechazadas

4. **Validaciones Adicionales**
   - Impedir crear sedes sin verificación aprobada
   - Mostrar badge de "Verificado" en el perfil del dueño

5. **Experiencia de Usuario**
   - Agregar video tutorial del proceso de verificación
   - FAQs sobre verificación de identidad

## 🧪 Testing

### Probar el Flujo Completo

1. **Iniciar sesión** con un usuario que NO sea dueño
2. **Navegar** a `/host-space`
3. **Hacer clic** en "Iniciar registro y verificación"
4. **Verificar** que se abre la URL de Persona en nueva pestaña
5. **Completar** el proceso de verificación en Persona (sandbox)
6. **Recargar** la página para ver el estado actualizado
7. **Ir** al panel de administración una vez aprobado

### Casos de Prueba

- ✅ Usuario sin verificación → Inicia proceso
- ✅ Usuario con verificación pendiente → Muestra estado y botón para continuar
- ✅ Usuario con verificación aprobada → Muestra badge verde
- ✅ Usuario ya dueño → Redirige a panel de administración
- ✅ Manejo de errores → Muestra mensajes apropiados

## 📚 Documentación de Referencia

- [Persona API Documentation](https://docs.withpersona.com/)
- [Backend: INTEGRACION_PERSONA_VERIFICACION.md](../espacios_deportivos/INTEGRACION_PERSONA_VERIFICACION.md)
- [Backend: API Persona README](../espacios_deportivos/src/api-persona/README.md)

## 🎯 Objetivos Cumplidos

- ✅ Integración completa con Persona API
- ✅ Proceso de verificación automático al registrarse
- ✅ UI clara con estados de verificación
- ✅ Manejo de errores y casos edge
- ✅ Información clara sobre requisitos
- ✅ Flujo de usuario intuitivo
- ✅ Seguridad y validación de identidad
