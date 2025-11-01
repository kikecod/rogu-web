# Módulo: user-profile

Este módulo implementa la experiencia completa de Perfil de Usuario en rogu-web: carga y normalización de datos del backend, estado (hook), servicios REST, componentes UI por rol y utilidades para editar información personal, preferencias, avatar y operaciones sensibles (zona de peligro).

## 🌳 Estructura de carpetas y archivos

```
src/modules/user-profile/
├─ components/
│  ├─ AvatarUploader.tsx                 # Subida/recorte de avatar con react-easy-crop
│  ├─ Profile.Admin.tsx                  # Vista para usuarios con rol ADMIN
│  ├─ Profile.Cliente.tsx                # Vista para CLIENTE
│  ├─ Profile.ClienteControlador.tsx     # Vista para CLIENTE + CONTROLADOR
│  ├─ Profile.ClienteDuenio.tsx          # Vista para CLIENTE + DUENIO
│  ├─ Profile.ClienteDuenioControlador.tsx# Vista para CLIENTE + DUENIO + CONTROLADOR
│  ├─ Profile.Generic.tsx                # Vista genérica (fallback)
│  ├─ ProfileAccountSettings.tsx         # Ajustes de cuenta: correo/usuario/contraseña
│  ├─ ProfileAdminSection.tsx            # Panel informativo para ADMIN
│  ├─ ProfileBaseLayout.tsx              # Encabezado y layout común del perfil
│  ├─ ProfileClienteSection.tsx          # Sección informativa de CLIENTE
│  ├─ ProfileControladorSection.tsx      # Sección informativa de CONTROLADOR
│  ├─ ProfileDangerZone.tsx              # Exportar datos, desactivar y eliminar cuenta
│  ├─ ProfileDuenioSection.tsx           # Sección informativa de DUENIO
│  ├─ ProfilePersonalInfoForm.tsx        # Formulario de datos personales/cliente
│  ├─ ProfilePreferencesForm.tsx         # Formulario de preferencias/privacidad
│  └─ profileVariants.ts                 # Mapa RoleVariant -> componente de vista
├─ hooks/
│  └─ useUserProfile.ts                  # Hook que carga/gestiona el estado del perfil
├─ lib/
│  ├─ imageTools.ts                      # Utilidades de recorte/canvas para avatar
│  └─ mockProfile.ts                     # Generador de datos mock (desarrollo)
├─ pages/
│  └─ ProfilePage.tsx                    # Página: decide la variante según roles
├─ services/
│  └─ profileService.ts                  # Cliente REST + normalización de respuestas
└─ types/
   └─ profile.types.ts                   # Tipado fuerte del dominio de perfil
```

## 🔗 Flujo de datos (de punta a punta)

1) La página `pages/ProfilePage.tsx` usa el hook `hooks/useUserProfile.ts` para cargar los datos.
2) El hook llama a `services/profileService.ts` → `fetchProfile()` y maneja timeouts, estados y errores.
3) El servicio consulta el backend (Bearer token), intenta varias rutas de compatibilidad (`/profile`, `/auth/profile`, `/perfil`, …) y normaliza la respuesta a `UserProfileData` (tolerante a naming camelCase/snake_case).
4) Con los datos ya normalizados, `ProfilePage` resuelve la variante según los roles (`resolveRoleVariant`) y renderiza el componente correspondiente mapeado en `components/profileVariants.ts`.
5) Las vistas de variante se construyen sobre `ProfileBaseLayout` y componen secciones:
   - `AvatarUploader` (subida/crop),
   - `ProfilePersonalInfoForm` (datos personales/cliente),
   - `ProfilePreferencesForm` (preferencias),
   - secciones por rol (`ProfileClienteSection`, `ProfileDuenioSection`, `ProfileControladorSection`, `ProfileAdminSection`),
   - `ProfileAccountSettings` (correo/usuario/contraseña),
   - `ProfileDangerZone` (exportar, desactivar, eliminar).

## 🧠 Tipos principales (`types/profile.types.ts`)

- `AppRole`: 'CLIENTE' | 'DUENIO' | 'CONTROLADOR' | 'ADMIN'
- `PersonaProfile`: datos civiles y de contacto (documento, teléfono, bio, ubicación, etc.)
- `UsuarioProfile`: credenciales/identidad de usuario (correo, usuario, roles, avatar, estado)
- `ClienteProfile`, `DuenioProfile`, `ControladorProfile`: extensiones por rol
- `UsuarioPreferencias`: privacidad, notificaciones, idioma/zonahoraria, tema, firma
- `UserProfileData`: agregado con `persona`, `usuario`, y sub-perfiles por rol + `preferencias`

Estos tipos se usan en servicio, hook y componentes para asegurar coherencia end-to-end.

## 🧰 Servicio REST (`services/profileService.ts`)

Características clave:
- Obtiene el token de `localStorage` y lo exige para llamadas protegidas.
- Intenta múltiples endpoints para `fetchProfile()` con “cache busting” y logs opcionales.
- Normaliza los payloads del backend (acepta camelCase/snake_case; coalesce de campos; conversión de tipos, fechas, booleanos).
- Expone operaciones de actualización y cuenta.

Operaciones principales (contrato breve):
- `fetchProfile(): Promise<UserProfileData>`
  - GET a `/profile` (con fallback a varias rutas). Lanza error enriquecido con `attempts` ante fallo.
- `updateProfileSections({ persona?, cliente?, controlador? }): Promise<UserProfileData>`
  - PUT `/profile/personal`. Actualiza datos personales y (si aplica) de cliente/controlador.
- `updatePreferences(preferences): Promise<UsuarioPreferencias>`
  - PUT `/profile/preferences`.
- `uploadAvatar(file): Promise<{ avatar: string }>` / `removeAvatar(): Promise<void>`
  - POST/DELETE `/profile/avatar`.
- `changePassword({ contrasenaActual, nuevaContrasena })` y `updateUsername({ idUsuario, usuario })`
  - Endpoints clásicos de perfil.
- Integración directa con `UsuariosController`:
  - `updateUserBasic({ idUsuario, correo?, usuario? })`: PUT `/usuarios/:id`.
  - `changePasswordSimple({ idUsuario, nuevaContrasena })`: PUT `/usuarios/:id/cambiar-contrasena`.
- Otras:
  - `requestEmailChange`, `verifyEmailChange`, `exportData`, `deactivateAccount`, `deleteAccount`.

Bandera de mocks y debugging:
- `USE_MOCK_DATA` (hardcoded en false).
- `VITE_DEBUG_PROFILE === 'true'`: logs de depuración y trazas.

## 🎣 Hook de estado (`hooks/useUserProfile.ts`)

Responsabilidades:
- Coordina carga del perfil respetando el estado de autenticación (`useAuth()`).
- Maneja SOFT_TIMEOUT (`VITE_PROFILE_TIMEOUT_MS`, por defecto 3000 ms) y HARD_TIMEOUT (`VITE_PROFILE_HARD_TIMEOUT_MS`, 5000 ms) para UX robusta.
- Expone `{ data, loading, error, debugInfo, refresh }`.
- Sincroniza avatar/email/usuario con `AuthContext` cuando llegan datos nuevos.
- En 401, cierra sesión para evitar estados inconsistentes.

Variables de entorno usadas en el hook:
- `VITE_PROFILE_TIMEOUT_MS`
- `VITE_PROFILE_HARD_TIMEOUT_MS`
- `VITE_AUTH_HYDRATE_TIMEOUT_MS`
- `VITE_DEBUG_PROFILE`

## 🧩 Componentes principales

- `ProfileBaseLayout`:
  - Encabezado con avatar/nombre/roles; tarjetas “Datos personales” y “Credenciales y seguridad”.
  - Resuelve imagen final del avatar con `getImageUrl` si llega un path.
- `AvatarUploader`:
  - Usa `react-easy-crop` para recorte circular; `lib/imageTools.ts` para canvas/WEBP.
  - Sube a `/profile/avatar` y hace cache-busting local para ver el nuevo avatar al instante.
- `ProfilePersonalInfoForm`:
  - Edición de `PersonaProfile` (+ `ClienteProfile` cuando aplica). Envía a `updateProfileSections`.
- `ProfilePreferencesForm`:
  - Togs de privacidad/notificaciones, idioma, timezone, modo oscuro, firma. Envía a `updatePreferences`.
- `ProfileAccountSettings`:
  - Cambios básicos de cuenta: correo/usuario (PUT `/usuarios/:id`) y contraseña (PUT `/usuarios/:id/cambiar-contrasena`).
- `ProfileDangerZone`:
  - Exporta datos, desactiva cuenta temporalmente o la elimina (con confirmaciones).
- Secciones por rol:
  - `ProfileClienteSection`, `ProfileDuenioSection`, `ProfileControladorSection` (solo se muestran si el rol está presente).
- Variantes por rol:
  - `profileVariants.ts` mapea `RoleVariant` a componente.
  - `Profile.*.tsx` componen Layout + secciones. La página las elige según roles.

## 🧪 Utilidades (`lib/…`)

- `imageTools.ts`: lectura de archivos a DataURL, recorte vía canvas, exportación WEBP.
- `mockProfile.ts`: datos ficticios coherentes con los tipos para desarrollo (usados si se habilitara `USE_MOCK_DATA`).

## 📄 Página (`pages/ProfilePage.tsx`)

- Gestiona estados de `loading`/`error` con UI amigable y `debugInfo` opcional.
- Calcula `effectiveRoles` y resuelve la variante con `resolveRoleVariant`.
- Renderiza la variante (ADMIN, CLIENTE, combinadas o genérica) pasando `{ data, onRefresh }`.

## 🔒 Integraciones externas y dependencias

- `@/auth/hooks/useAuth`: estado de autenticación (isLoggedIn, logout, user, updateUser).
- `@/core/config/api`: `getApiUrl` y `getImageUrl` para construir rutas y CDN.
- `lucide-react`: iconografía.
- `react-easy-crop`: recorte de imagen para avatar (requiere el CSS importado por `AvatarUploader`).

## ⏱️ Errores y tiempos de espera

- Si Auth aún hidrata, el hook espera antes de pedir el perfil (evita llamadas inútiles).
- SOFT_TIMEOUT: muestra un error amable si la carga demora demasiado, pero puedes reintentar.
- HARD_TIMEOUT: salvaguarda adicional si quedara `loading` sin solicitudes en vuelo.
- En 401 del servicio, se fuerza `logout()` y se informa al usuario.

## ✅ Contratos rápidos (resumen)

- Entrada a módulo: renderiza `pages/ProfilePage.tsx`.
- Salida (UI): una de las vistas `Profile.*.tsx` según roles → componen secciones.
- Servicio:
  - Entradas: token (implícito, desde localStorage), payloads tipados.
  - Salidas: `UserProfileData` normalizado o errores con detalle (`status`, `attempts`).
- Estados/errores: `useUserProfile` administra `loading`, `error`, `debugInfo`, `refresh`.

## 📝 Notas y mejoras sugeridas

- Duplicaciones de `ProfileDangerZone`:
  - En `Profile.ClienteDuenio.tsx`, `Profile.ClienteControlador.tsx` y `Profile.ClienteDuenioControlador.tsx` aparece dos veces la línea `<ProfileDangerZone />`. Se recomienda dejar una sola instancia.
- Consolidación de variantes:
  - Las vistas por combinación de roles comparten mucha composición. Podría extraerse una función/fábrica para reducir duplicación.
- Bandera de mocks:
  - `USE_MOCK_DATA` está en `false`. Para pruebas locales sin backend, podría exponerse vía variable de entorno.

## 🔍 Cómo orientarte rápidamente

- Punto de entrada visual: `pages/ProfilePage.tsx`.
- Estados y ciclos: `hooks/useUserProfile.ts`.
- Backend y normalización: `services/profileService.ts`.
- Tipos del dominio: `types/profile.types.ts`.
- UI base y secciones: `components/*`.

---

Si quieres, puedo corregir ahora mismo las duplicaciones de `ProfileDangerZone` y dejar el módulo más limpio.