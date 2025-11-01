# � TRABAJO PERSONA 3: PERFIL Y CONFIGURACIÓN DE USUARIO

**Responsable:** Persona 3  
**Duración estimada:** 2 semanas  
**Prioridad:** � ALTA  

> **NOTA IMPORTANTE:** Este documento forma parte de un sistema de 4 personas:
> - **Persona 1:** Sistema de Pagos Real
> - **Persona 2:** Sistema de Reseñas y Calificaciones
> - **Persona 3:** Perfil y Configuración de Usuario (este documento)
> - **Persona 4:** Dashboard/Panel de Análisis para Dueños

---

## 📋 RESUMEN

Implementar un sistema completo de perfil y configuración de usuario que permita:
- **Subir y gestionar foto de perfil** (upload real con almacenamiento)
- **Actualizar información personal** (nombre, teléfono, dirección, etc.)
- **Cambiar contraseña** con validación de seguridad
- **Actualizar email** con verificación
- **Preferencias de privacidad**
- **Gestión de cuenta** (eliminar cuenta, descargar datos)

**Actualmente:** El sistema tiene componentes de perfil (`Profile.Admin.tsx`, etc.) pero la **foto de perfil NO funciona**. Debes implementar el sistema completo de carga y gestión de imágenes.

---

## 🎯 OBJETIVOS PRINCIPALES

### 1. **Sistema de Foto de Perfil (FUNCIONAL)**
   - Upload de imágenes al servidor
   - Almacenamiento en sistema de archivos o S3
   - Redimensionamiento automático
   - Preview antes de subir
   - Eliminar/cambiar foto

### 2. **Actualización de Información Personal**
   - Editar nombre, apellido, teléfono
   - Cambiar dirección
   - Actualizar biografía/descripción
   - Guardar deportes favoritos

### 3. **Gestión de Seguridad**
   - Cambio de contraseña (con validación de contraseña actual)
   - Actualización de email con verificación
   - Autenticación de dos factores (opcional)

### 4. **Preferencias y Configuración**
   - Preferencias de privacidad
   - Configuración de notificaciones
   - Idioma y zona horaria

### 5. **Gestión de Cuenta**
   - Descargar datos personales (GDPR)
   - Desactivar cuenta temporalmente
   - Eliminar cuenta permanentemente

---

## � ARQUITECTURA DEL SISTEMA

### Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. FOTO DE PERFIL                                          │
│     - Input file con preview                                │
│     - Crop/resize en cliente                                │
│     - Upload con FormData                                   │
│     - Mostrar imagen desde URL del servidor                 │
│                                                              │
│  2. INFORMACIÓN PERSONAL                                     │
│     - Formularios controlados                               │
│     - Validación en tiempo real                             │
│     - Feedback visual de cambios                            │
│                                                              │
│  3. SEGURIDAD                                                │
│     - Formulario de cambio de contraseña                    │
│     - Verificación de email                                 │
│     - Confirmaciones de seguridad                           │
│                                                              │
│  4. PREFERENCIAS                                             │
│     - Switches/toggles para configuración                   │
│     - Guardado automático                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
                    HTTP Requests / Responses
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. UPLOAD DE IMÁGENES                                      │
│     - Middleware multer para recibir archivos               │
│     - Validación de tipo y tamaño                           │
│     - Procesamiento con Sharp (redimensionar)               │
│     - Guardar en /uploads/avatars o S3/Cloudinary                   │
│     - Eliminar imagen anterior                              │
│                                                              │
│  2. GESTIÓN DE PERFIL                                        │
│     - Endpoints CRUD para Persona/Usuario                   │
│     - Validación de datos                                   │
│     - Actualización en BD                                   │
│                                                              │
│  3. SEGURIDAD                                                │
│     - Hash de contraseñas con bcrypt                        │
│     - Validación de contraseña actual                       │
│     - Envío de email de verificación                        │
│     - Tokens de verificación                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                  BASE DE DATOS (PostgreSql)                       │
├─────────────────────────────────────────────────────────────┤                │
│  Tabla Persona (idPersona, nombres, paterno, materno, documentoTipo, documentoNumero, telefono, telefonoVerificado, fechaNacimiento, genero, urlFoto, creadoEn, actualizadoEn, eliminadoEn)  
Tabla Usuario (idUsuario, idPersona, usuario, correo, correoVerificado, hashContrasena, estado, creadoEn, actualizadoEn, ultimoAccesoEn)
│         Tabla Cliente (idCliente, apodo, nivel, observaciones)
  Tabla Duenio (idPersonaD, verificado, verificadoEn, imagenCI, imagenFacial, creadoEn, actualizadoEn, eliminadoEn)
  
  Tabla Controlador (idPersonaOpe, idSede, codigoEmpleado, activo, turno)
  
  donde idPersona es igual a idusuario iscliente ispersonad idpersonaope 

  entonces si yo quiero los datos de un usuario en general q normalmente sera cliente por defecto

  el profile el perfil debe tener los datos de la tabla de usuario persona usuariorol cliente

  si es duenio debe tener usuario persona usuariolrol cliente + duenio

  si es controlador + controlador me entiendes??? verdad
                                                                      │
│           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ BACKEND - ESTRUCTURA Y ENDPOINTS

### 1. BASE DE DATOS - Modificaciones Necesarias

#### Tabla Usuario - Agregar campo de foto
```sql

Select * from persona; -- el atributo url forto

-- Ejemplo: 'https://miservidor.com/uploads/avatars/user-123.jpg'
-- O ruta relativa: '/uploads/avatars/user-123.jpg'
```

#### Tabla Persona - Estos campos ya lo tengo en mi entidad campos adicionales
```sql
ALTER TABLE Persona 
ADD COLUMN fechaNacimiento DATE NULL,
ADD COLUMN genero ENUM('MASCULINO', 'FEMENINO', 'OTRO', 'NO_ESPECIFICAR') NULL;
```

lo ves necesario??? entonces crear en la carpeta persona para q no se mezcle con otros depende de ti

#### Crear tabla de Verificación de Email
```sql
CREATE TABLE VerificacionEmail (
  idVerificacion INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  emailNuevo VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  usado BOOLEAN DEFAULT FALSE,
  expiraEn TIMESTAMP NOT NULL,
  creadoEn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expira (expiraEn)
);
```

---

### 2. SISTEMA DE UPLOAD DE IMÁGENES ahi esta la carpeta avatars

#### Configuración de Multer

**Objetivo:** Recibir archivos del cliente y guardarlos en el servidor

**Dependencias necesarias:**
```bash
npm install multer sharp
npm install @types/multer @types/sharp --save-dev
```

**Estructura de carpetas:**
```
backend/
  uploads/
    avatars/          # Fotos de perfil
    temp/             # Archivos temporales
```

**Configuración básica:**
- Crear middleware de multer para recibir archivos
- Validar tipo de archivo (solo imágenes: jpg, png, webp)
- Validar tamaño máximo (ejemplo: 5MB)
- Generar nombre único para cada archivo
- Procesar imagen con Sharp:
  - Redimensionar a 400x400px
  - Convertir a formato WebP (menor peso)
  - Comprimir con calidad 90%
- Guardar URL en base de datos
- Eliminar imagen anterior del usuario (si existe)

**Endpoint principal:**
```
POST /api/profile/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: 
  - file: imagen (FormData)

Response:
{
  "message": "Foto de perfil actualizada",
  "data": {
    "fotoPerfil": "https://servidor.com/uploads/avatars/user-123-1698765432.webp"
  }
}
```

---

### 3. ENDPOINTS DE PERFIL

#### 3.1 Obtener Perfil Actual
```
GET /api/profile
Authorization: Bearer <token>

Response:
{
  "data": { Revisa la tabla usuario rol q tambien es importante
    "usuario": { //obligatorio para el perfil
      "idUsuario": 1,
      "idPersona": 1,
      "usuario": "juanp",
      "correo": "user@example.com",
      "correoVerificado": false,
      "estado": "ACTIVO",
      "rol": "CLIENTE",
      "ultimoAccesoEn": "2025-10-29T14:30:00Z",
      "creadoEn": "2025-10-01T12:00:00Z",
      "actualizadoEn": "2025-10-20T08:00:00Z"
    },
    "persona": { //obligatorio para el perfil
      "idPersona": 1,
      "nombres": "Juan",
      "paterno": "Pérez",
      "materno": "García",
      "documentoTipo": "CC",
      "documentoNumero": "12345678",
      "telefono": "77123456",
      "telefonoVerificado": true,
      "fechaNacimiento": "1995-05-15",
      "genero": "MASCULINO",
      "urlFoto": "https://...",
      "creadoEn": "2025-10-01T12:00:00Z",
      "actualizadoEn": "2025-10-20T08:00:00Z",
      "eliminadoEn": null
    },
    "cliente": { //obligatorio para el perfil
      "idCliente": 1,
      "apodo": "Juancho",
      "nivel": 3,
      "observaciones": null
    },

    "duenio": { si es cliente y duenio
      "idPersonaD": 7,
      "verificado": true,
      "verificadoEn": "2025-10-10T12:00:00Z",
      "imagenCI": "https://.../ci.jpg",
      "imagenFacial": "https://.../face.jpg",
      "creadoEn": "2025-09-15T09:00:00Z",
      "actualizadoEn": "2025-10-25T18:00:00Z",
      "eliminadoEn": null,
      "sedes": [
        { "idSede": 10 },
        { "idSede": 11 }
      ]
    },
    "controlador": { si es cliente y controlador (oculta la tabla duenio si no tiene ese rol) || si cliente duenio(muestra la tabla duenio) controlador
      "idPersonaOpe": 21,
      "idSede": 10,
      "codigoEmpleado": "EMP-00021",
      "activo": true,
      "turno": "NOCHE"
    }
  }
}

```

#### 3.2 Actualizar Información Personal
```
PUT /api/profile/personal
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez López",
  "telefono": "77123456",
  "direccion": "Av. 6 de Agosto #123",
  "biografia": "Jugador de fútbol amateur",
  "fechaNacimiento": "1995-05-15",
  "genero": "MASCULINO"
}

Response:
{
  "message": "Información actualizada correctamente",
  "data": { ...persona actualizada... }
}
```

#### 3.3 Subir/Actualizar Foto de Perfil
```
POST /api/profile/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (FormData):
  - file: [imagen]

Response:
{
  "message": "Foto de perfil actualizada",
  "data": {
    "fotoPerfil": "/uploads/avatars/user-1-1698765432.webp"
  }
}
```

#### 3.4 Eliminar Foto de Perfil
```
DELETE /api/profile/avatar
Authorization: Bearer <token>

Response:
{
  "message": "Foto de perfil eliminada"
}
```

#### 3.5 Cambiar Contraseña
```
PUT /api/profile/password
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "passwordActual": "miPassword123",
  "passwordNueva": "nuevoPassword456",
  "confirmarPassword": "nuevoPassword456"
}

Validaciones:
- passwordActual debe coincidir con la BD
- passwordNueva debe tener mínimo 8 caracteres
- passwordNueva debe contener mayúscula, minúscula y número
- confirmarPassword debe ser igual a passwordNueva

Response:
{
  "message": "Contraseña actualizada correctamente"
}
```

#### 3.6 Solicitar Cambio de Email
```
POST /api/profile/email/request
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "emailNuevo": "nuevoemail@example.com",
  "password": "miPassword123"
}

Proceso:
1. Validar que password es correcta
2. Verificar que emailNuevo no esté en uso
3. Generar token único de verificación
4. Guardar en tabla VerificacionEmail
5. Enviar email con link de verificación
6. Link: https://frontend.com/verify-email?token=abc123

Response:
{
  "message": "Email de verificación enviado a nuevoemail@example.com"
}
```

#### 3.7 Verificar y Confirmar Cambio de Email
```
POST /api/profile/email/verify
Content-Type: application/json

Body:
{
  "token": "abc123"
}

Proceso:
1. Buscar token en tabla VerificacionEmail
2. Verificar que no esté usado y no haya expirado
3. Actualizar email en tabla Usuario
4. Marcar token como usado

Response:
{
  "message": "Email actualizado correctamente",
  "data": {
    "correo": "nuevoemail@example.com"
  }
}
```

#### 3.8 Actualizar Preferencias
```
PUT /api/profile/preferences
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "perfilPublico": true,
  "mostrarEmail": false,
  "mostrarTelefono": false,
  "recibirEmails": true,
  "recibirSMS": false,
  "idioma": "es",
  "tema": "OSCURO"
}

Response:
{
  "message": "Preferencias actualizadas",
  "data": { ...preferencias... }
}
```

#### 3.9 Descargar Datos Personales (GDPR)
```
GET /api/profile/export
Authorization: Bearer <token>

Response: Archivo JSON con todos los datos del usuario
{
  "usuario": { ... },
  "persona": { ... },
  "reservas": [ ... ],
  "resenas": [ ... ],
  "transacciones": [ ... ],
  "exportadoEn": "2024-10-30T12:00:00Z"
}
```

#### 3.10 Desactivar Cuenta
```
POST /api/profile/deactivate
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "password": "miPassword123",
  "motivo": "Opcional: razón de desactivación"
}

Proceso:
- Agregar campo 'activo' a tabla Usuario
- Marcar como inactivo (no eliminar)
- Usuario no puede hacer login
- Puede reactivar después

Response:
{
  "message": "Cuenta desactivada correctamente"
}
```

#### 3.11 Eliminar Cuenta Permanentemente
```
DELETE /api/profile
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "password": "miPassword123",
  "confirmacion": "ELIMINAR"
}

Proceso:
- Validar password
- Validar que no hay reservas futuras pendientes
- Eliminar (o anonimizar) todos los datos
- Eliminar foto de perfil del servidor

Response:
{
  "message": "Cuenta eliminada permanentemente"
}
```

---

### 4. SERVICIOS BACKEND (Lógica de Negocio)

**ProfileService.ts** - Debe contener:

1. **getProfile(idUsuario)**: Obtener perfil completo
2. **updatePersonalInfo(idUsuario, data)**: Actualizar info personal
3. **uploadAvatar(idUsuario, file)**: Procesar y guardar foto
4. **deleteAvatar(idUsuario)**: Eliminar foto del servidor y BD
5. **changePassword(idUsuario, oldPass, newPass)**: Cambiar contraseña
6. **requestEmailChange(idUsuario, newEmail, password)**: Iniciar cambio
7. **verifyEmailChange(token)**: Confirmar cambio
8. **updatePreferences(idUsuario, preferences)**: Guardar preferencias
9. **exportUserData(idUsuario)**: Generar JSON con datos
10. **deactivateAccount(idUsuario, password)**: Desactivar
11. **deleteAccount(idUsuario, password)**: Eliminar permanentemente

---

### 5. VALIDACIONES Y SEGURIDAD

**Validaciones importantes:**
- Email válido (formato correcto)
- Teléfono: solo números (mínimo 8 dígitos)
- Contraseña: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
- Foto de perfil: 
  - Tamaño máximo 5MB
  - Solo imágenes (jpg, png, webp)
  - Validar tipo MIME real (no solo extensión)
- Verificar que el usuario que hace la petición es el dueño del perfil

---

## 🎨 FRONTEND - ESTRUCTURA Y COMPONENTES

### 1. MÓDULO DE PERFIL

**Estructura de carpetas:**
```
src/modules/user-profile/
  pages/
    ProfilePage.tsx               # Página principal de perfil
  components/
    ProfileHeader.tsx             # Header con foto y nombre
    AvatarUpload.tsx              # Componente de upload de foto ⭐
    PersonalInfoForm.tsx          # Formulario de info personal
    SecurityForm.tsx              # Cambio de contraseña/email
    PreferencesForm.tsx           # Configuración y preferencias
    AccountDangerZone.tsx         # Desactivar/eliminar cuenta
  services/
    profileService.ts             # Llamadas a API
  types/
    profile.types.ts              # Tipos TypeScript
```

---

### 2. COMPONENTE DE FOTO DE PERFIL (AvatarUpload)

**Funcionalidades:**

1. **Mostrar foto actual** o placeholder si no hay
2. **Botón para subir nueva foto** (abre file input)
3. **Preview antes de confirmar** (mostrar imagen seleccionada)
4. **Crop/resize en cliente** (opcional, con librería como react-easy-crop)
5. **Upload al backend** con FormData
6. **Loading state** mientras sube
7. **Botón para eliminar foto**
8. **Mensajes de error** si falla

**Flujo del componente:**
```
┌─────────────────────────────────────────┐
│  Avatar Actual o Placeholder            │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │    [Imagen circular 150px]      │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [📷 Cambiar Foto]  [🗑️ Eliminar]      │
│                                         │
│  Soportado: JPG, PNG, WebP (máx 5MB)   │
└─────────────────────────────────────────┘

Al hacer click en "Cambiar Foto":
1. Abrir file input
2. Validar archivo seleccionado
3. Mostrar preview
4. Permitir crop (opcional)
5. [Cancelar] [Guardar]
6. Si Guardar → Upload con FormData
7. Actualizar imagen en UI
```

**Librería recomendada para crop:**
- `react-easy-crop` o `react-image-crop`

---

### 3. PÁGINA DE PERFIL (ProfilePage)

**Layout con tabs:**

```
┌────────────────────────────────────────────────────────┐
│  PERFIL DE USUARIO                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────┐   Juan Pérez                           │
│  │  Foto    │   @juanperez                           │
│  │ Perfil   │   Miembro desde 2024                   │
│  └──────────┘   📍 La Paz, Bolivia                    │
│                                                        │
├────────────────────────────────────────────────────────┤
│  [Información Personal] [Seguridad] [Preferencias]    │
│                         [Cuenta]                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  CONTENIDO DEL TAB SELECCIONADO                       │
│                                                        │
│  (Formularios, configuraciones, etc)                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Tabs:**

1. **Información Personal**
   - Nombre, Apellido
   - Teléfono, Dirección
   - Fecha de nacimiento, Género
   - Biografía (textarea)
   - [Guardar Cambios]

2. **Seguridad**
   - Cambiar Contraseña
     - Contraseña Actual
     - Nueva Contraseña
     - Confirmar Nueva Contraseña
     - [Actualizar Contraseña]
   
   - Cambiar Email
     - Email Actual: user@example.com
     - Nuevo Email
     - Contraseña para confirmar
     - [Solicitar Cambio]

3. **Preferencias**
   - Privacidad
     - ☑️ Perfil público
     - ☐ Mostrar email públicamente
     - ☐ Mostrar teléfono públicamente
   
   - Notificaciones
     - ☑️ Recibir emails
     - ☐ Recibir SMS
   
   - Apariencia
     - Idioma: [Español ▼]
     - Tema: ( ) Claro (•) Oscuro ( ) Auto
   
   - [Guardar Preferencias]

4. **Cuenta**
   - Exportar Datos
     - [📥 Descargar mis datos (JSON)]
   
   - Zona de Peligro
     - [⚠️ Desactivar Cuenta]
     - [🗑️ Eliminar Cuenta Permanentemente]

---

### 4. SERVICIOS FRONTEND

**profileService.ts** - Llamadas a la API:

```typescript
// Tipos de ejemplo
interface ProfileData {
  usuario: Usuario;
  persona: Persona;
  preferencias: PreferenciaUsuario;
}

// Funciones
getProfile(): Promise<ProfileData>
updatePersonalInfo(data: UpdatePersonaDTO): Promise<void>
uploadAvatar(file: File): Promise<{ fotoPerfil: string }>
deleteAvatar(): Promise<void>
changePassword(data: ChangePasswordDTO): Promise<void>
requestEmailChange(data: EmailChangeDTO): Promise<void>
verifyEmailChange(token: string): Promise<void>
updatePreferences(data: PreferenciasDTO): Promise<void>
exportData(): Promise<Blob>
deactivateAccount(password: string): Promise<void>
deleteAccount(password: string, confirmacion: string): Promise<void>
```

---

### 5. FLUJO DE USUARIO COMPLETO

#### Flujo: Cambiar Foto de Perfil

```
1. Usuario hace click en foto actual
2. Se abre modal/drawer con AvatarUpload
3. Click en "Cambiar Foto" → file input
4. Usuario selecciona imagen
5. Validación en cliente:
   - ¿Es imagen? ✅
   - ¿Tamaño < 5MB? ✅
6. Mostrar preview con crop
7. Usuario ajusta crop
8. Click en "Guardar"
9. Loading state activado
10. Upload con FormData a POST /api/profile/avatar
11. Backend procesa:
    - Guarda archivo
    - Redimensiona con Sharp
    - Elimina foto anterior
    - Actualiza URL en BD
12. Responde con nueva URL
13. Frontend actualiza imagen
14. Loading state desactivado
15. Mensaje de éxito
16. Cerrar modal
```

#### Flujo: Cambiar Email

```
1. Usuario va a tab "Seguridad"
2. Ingresa nuevo email
3. Ingresa contraseña actual
4. Click en "Solicitar Cambio"
5. Backend valida:
   - Contraseña correcta ✅
   - Email no en uso ✅
6. Genera token de verificación
7. Envía email al nuevo correo
8. Frontend muestra: "Email enviado, revisa tu bandeja"
9. Usuario abre email
10. Click en link de verificación
11. Redirige a /verify-email?token=abc123
12. Frontend llama a POST /api/profile/email/verify
13. Backend actualiza email
14. Frontend muestra: "Email actualizado" ✅
15. Actualiza sesión con nuevo email
```

#### Flujo: Eliminar Cuenta

```
1. Usuario va a tab "Cuenta"
2. Scroll a "Zona de Peligro"
3. Click en "Eliminar Cuenta Permanentemente"
4. Modal de confirmación:
   "⚠️ Esta acción NO se puede deshacer"
   "Se eliminarán:"
   - Tu perfil y datos personales
   - Todas tus reservas
   - Tus reseñas
   - Historial de pagos
   
   "Para confirmar:"
   - Ingresa tu contraseña: [____]
   - Escribe "ELIMINAR": [____]
   
   [Cancelar]  [ELIMINAR CUENTA]

5. Usuario completa campos
6. Click en ELIMINAR CUENTA
7. Validaciones backend
8. Verificar no hay reservas futuras
9. Eliminar datos o anonimizar
10. Eliminar foto del servidor
11. Logout automático
12. Redirigir a homepage
13. Mensaje: "Tu cuenta ha sido eliminada"
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Modificar BD (campos fotoPerfil, biografia, etc.)
- [ ] Crear tabla PreferenciaUsuario
- [ ] Crear tabla VerificacionEmail
- [ ] Instalar multer y sharp
- [ ] Configurar carpeta /uploads/avatars
- [ ] Crear middleware de upload
- [ ] Implementar ProfileService completo
- [ ] Crear ProfileController con todos los endpoints
- [ ] Configurar rutas en router
- [ ] Implementar validaciones de seguridad
- [ ] Probar upload de imágenes
- [ ] Probar cambio de contraseña
- [ ] Probar cambio de email con verificación
- [ ] Implementar exportación de datos

### Frontend
- [ ] Crear estructura de módulo user-profile
- [ ] Implementar profileService.ts
- [ ] Crear componente AvatarUpload
- [ ] Integrar librería de crop (react-easy-crop)
- [ ] Crear ProfilePage con tabs
- [ ] Implementar PersonalInfoForm
- [ ] Implementar SecurityForm
- [ ] Implementar PreferencesForm
- [ ] Implementar AccountDangerZone
- [ ] Crear página VerifyEmailPage
- [ ] Integrar con AuthContext (actualizar foto en header)
- [ ] Agregar validaciones en formularios
- [ ] Implementar loading states
- [ ] Mensajes de error/éxito
- [ ] Probar flujo completo de foto de perfil
- [ ] Probar cambio de contraseña
- [ ] Probar cambio de email

### Testing
- [ ] Test upload imágenes grandes (> 5MB)
- [ ] Test formatos no soportados
- [ ] Test cambio contraseña incorrecta
- [ ] Test email duplicado
- [ ] Test token de verificación expirado
- [ ] Test eliminación con reservas pendientes
- [ ] Test exportación de datos

---

## 📚 RECURSOS Y REFERENCIAS

### Librerías Recomendadas

**Backend:**
- `multer` - Upload de archivos
- `sharp` - Procesamiento de imágenes
- `bcrypt` - Hash de contraseñas

**Frontend:**
- `react-easy-crop` - Crop de imágenes
- `react-hook-form` - Manejo de formularios
- `zod` - Validación de esquemas

### Documentación
- Multer: https://github.com/expressjs/multer
- Sharp: https://sharp.pixelplumbing.com/
- React Easy Crop: https://ricardo-ch.github.io/react-easy-crop/

---

**Fecha inicio:** ___________  
**Fecha fin:** ___________  
**Responsable:** ___________

