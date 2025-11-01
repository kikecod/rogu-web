# Plan de Implementación – Perfil y Configuración de Usuario

> _Persona 3 – Perfil y Configuración_  
> Última actualización: 2025-11-01

> Resumen de implementación actual (frontend: rogu-web, backend: espacios_deportivos)
> - Backend: módulo Profile operativo con endpoints protegidos y lógica completa de agregación/actualización. Integración con Usuarios/Personas/Roles/Preferencias/EmailVerificación/Logs de avatar.
> - Frontend: módulo user-profile con servicios, hook de carga, vistas por variantes y formularios de información personal, seguridad, preferencias y zona de peligro. Añadidos flags y timeouts de depuración.
> - Sección “Qué se aplicó y qué falta” se detalla en cada capítulo.

### Auditoría rápida del repo (2025-11-01)
- Verificado en backend (`espacios_deportivos`): `ProfileModule` completo (controlador/servicio/DTOs) + entidades auxiliares (`usuario_preferencias`, `usuario_email_verificacion`, `usuario_avatar_logs`). `UsuariosController` expone `PUT /usuarios/:id` y `PUT /usuarios/:id/cambiar-contrasena` y se usan desde el frontend.
- Verificado en frontend (`rogu-web`): módulo `user-profile` con `profileService.ts`, `useUserProfile`, componentes (`AvatarUploader`, `ProfilePersonalInfoForm`, `ProfilePreferencesForm`, `ProfileAccountSettings`, `ProfileDangerZone`, layouts y variantes por rol). Flags `.env` soportadas.
- Hallazgos clave:
   - URL pública de avatar inconsistente: el backend retorna rutas como `/avatars/archivo.webp`, pero el servidor estático sirve bajo `/uploads/*`. Esto puede causar 404 al renderizar imágenes. Soluciones sugeridas más abajo.
   - Upload de avatar ya valida tipo MIME genérico (`image/*`) y limita tamaño a 3 MB (no 2 MB). Si el objetivo es 2 MB y lista blanca estricta (jpeg/png/webp), hay que ajustar `MulterModule`.
   - Navegación tras desactivar/eliminar cuenta: ya implementada en `ProfileDangerZone` (hace `logout()` y redirige a `/`). Actualizar estado a [APLICADO].
   - Migraciones aún no consolidadas (se usa `synchronize: true`).

## 1. Alcance General
- Implementar un módulo completo de perfil respetando las variantes por rol (CLIENTE, DUEÑO, CONTROLADOR, ADMIN).
- Incluir gestión de avatar, información personal, seguridad, preferencias y acciones de cuenta (exportar/desactivar/eliminar).
- Unificar experiencia entre frontend (React) y backend (NestJS + TypeORM), garantizando sincronización con `AuthProvider`.

## 2. Cambios de Datos (TypeORM)
1. **Entidad Persona**
   - [APLICADO] Nuevas columnas presentes: `bio`, `direccion`, `ciudad`, `pais`, `deportesFavoritos` (simple-json), `ocupacion` (ver `src/personas/entities/personas.entity.ts`).
   - [APLICADO] Longitudes y nullables ajustados (varchar/text/enum).  
   - [NOTA] `genero` y `documentoTipo` son `enum`; `telefono` y `fechaNacimiento` son obligatorios en la entidad.
2. **Entidad Usuario**
   - [APLICADO] `avatarPath` y `estado` (enum `EstadoUsuario`: ACTIVO, DESACTIVADO, ELIMINADO).  
   - [APLICADO] Fecha de cambio de contraseña se maneja como `ultimoCambioContrasenaEn` en servicio de creación/actualización.
3. **Nuevas tablas**
   - [APLICADO] `usuario_avatar_logs` (historial de cambios de avatar).  
   - [APLICADO] `usuario_preferencias` (flags de privacidad/notificaciones/idioma/zonaHoraria/modoOscuro).  
   - [APLICADO] `usuario_email_verificacion` (token, nuevo correo, expiración, utilizado/confirmado).
4. **Extensiones por rol**
   - [APLICADO] Cliente: `apodo`, `nivel`, `observaciones`.  
   - [APLICADO] Dueño/Controlador: entidades y relaciones disponibles; controlador incluye `codigoEmpleado`, `turno`, `activo`.
5. **Migraciones**
   - [PARCIAL] El esquema está en entidades y se opera con repositorios.  
   - [PENDIENTE] Consolidar migraciones versionadas y documentación del seeding inicial de preferencias.

## 3. Backend – Nuevo `ProfileModule`
1. **Estructura**
   - [APLICADO] `profile.controller.ts`, `profile.service.ts` y DTOs específicos en `src/profile/dto/*`.  
   - [APLICADO] Importación e inyección de `UsuariosService`, `PersonasService`, `ClientesService`, `ControladorService` y repositorios necesarios; `Multer` vía `@nestjs/platform-express` (diskStorage en `uploads/avatars`, límite 3 MB y filtro `image/*`).
2. **Endpoints**
   - [APLICADO] `GET /profile` → Agrega `usuario`, `persona`, `cliente/duenio/controlador` según roles y `preferencias`.  
   - [APLICADO] `PUT /profile/personal` → Actualiza `Persona` y, condicionalmente por rol, `Cliente` y `Controlador`.  
   - [APLICADO] `POST /profile/avatar` → Upload con `sharp` (resize 512x512 a webp), elimina avatar anterior, guarda log.  
   - [APLICADO] `DELETE /profile/avatar` → Elimina avatar y registra log.  
   - [APLICADO] `PUT /profile/preferences` → Crea/actualiza preferencias (con defaults si no existen).  
   - [APLICADO] `PUT /profile/password` → Valida contraseña actual y actualiza hash.  
   - [APLICADO] `POST /profile/email/request` y `POST /profile/email/verify` → Flujo completo con TTL configurable y marcado de uso.  
   - [APLICADO] `POST /profile/export` → Devuelve archivo JSON base64 con snapshot del perfil.  
   - [APLICADO] `POST /profile/deactivate` & `POST /profile/delete` → Manejo de estado, validaciones de reservas, limpieza/anonimización y logs.
   - [EXTRA] Endpoints en `UsuariosController`: `PUT /usuarios/:id` (actualizar correo/usuario) y `PUT /usuarios/:id/cambiar-contrasena` consumidos por el frontend para ajustes rápidos.
3. **Seguridad**
   - [APLICADO] Decorador `@Auth([...roles])` en cada endpoint de perfil.  
   - [APLICADO] Verificación de identidad y permisos en servicio (e.g. updatePersonalInfo valida rol antes de mutar cliente/controlador).  
   - [PENDIENTE] Implementar rate limit por endpoint sensible si se requiere (no crítico en dev).
4. **Servicios auxiliares**
   - [APLICADO] Flujo de verificación de email almacenado en BD y expuesto por API; envío de correo real puede integrarse posteriormente.  
   - [APLICADO] Storage local en `uploads/avatars` + `sharp`.  
   - [PENDIENTE] Abstracción a S3 u otro provider si se requiere en producción.
5. **Validaciones/Errores**
   - [APLICADO] DTOs de cambio de contraseña, email request/verify, preferencias, info personal; uso de `BadRequest/Conflict/NotFound/Unauthorized`.  
   - [APLICADO] Respuestas con mensajes consistentes; logs mínimos de errores.

6. **Conexión y archivos estáticos (Backend)**
- [APLICADO] Prefijo global de API: `/api/` (ver `main.ts`).
- [APLICADO] Archivos estáticos con `ServeStaticModule` sirviendo `uploads` en `/uploads`.
- [ATENCIÓN] Rutas de avatar: el servicio guarda archivos en `uploads/avatars` pero devuelve paths como `/avatars/...`. Dado que el servidor expone `/uploads/*`, el path público correcto debería ser `/uploads/avatars/...` o, alternativamente, cambiar `serveRoot` a `/` o normalizar en frontend.

## 4. Frontend – Módulo `user-profile`
1. **Servicios (`profileService.ts`)**
   - [APLICADO] `fetchProfile`, `updateProfileSections` (actualiza `persona`/`cliente`/`controlador`), `updatePreferences`, `uploadAvatar`, `removeAvatar`, `changePassword`, `updateUsername`, `requestEmailChange`, `verifyEmailChange`, `exportData`, `deactivateAccount`, `deleteAccount`.  
   - [APLICADO] Enlaces directos a `UsuariosController`: `updateUserBasic` y `changePasswordSimple`.  
   - [APLICADO] Manejo de errores con status y URL; flags `.env`: `VITE_DEBUG_PROFILE`, `VITE_PROFILE_TIMEOUT_MS`, `VITE_PROFILE_HARD_TIMEOUT_MS`.  
   - [APLICADO] Lectura de token desde `localStorage` y headers `Authorization`.
2. **Hooks**
   - [APLICADO] `useUserProfile` con control de carrera (auth hydration), timeouts configurables, manejo de 401/otros, y `refresh`.  
   - [PENDIENTE] `useProfileActions` (acciones de cuenta desacopladas en un hook dedicado).
3. **Componentes**
   - [APLICADO] `AvatarUploader`, `ProfilePersonalInfoForm`, `ProfilePreferencesForm`, `ProfileAccountSettings` (usuario/contraseña), `ProfileDangerZone`, `ProfileBaseLayout`.  
   - [APLICADO] Variantes por rol: `Profile.Generic/Admin/Cliente/ClienteDuenio/ClienteControlador/ClienteDuenioControlador`.  
   - [APLICADO] Actualización en caliente vía `onRefresh` tras guardar/actualizar avatar.
4. **Flujo UI**
   - [APLICADO] Layout por tarjetas con banners de éxito/error, botones de reintento y estados de guardado.  
   - [APLICADO] Panel de diagnóstico opcional durante carga (sin spinner) y mensajes claros de error.
5. **Sincronización con Auth**
   - [APLICADO] `AuthProvider.login/updateUser/logout` se usan para sincronizar email/usuario/avatar y expirar sesión 401.  
   - [APLICADO] Tras 401 en perfil, se fuerza `logout()` y se muestra mensaje.  
   - [APLICADO] Navegación automática a pantalla pública tras desactivar/eliminar (se hace `logout()` y redirección a `/` en `ProfileDangerZone`).

## 5. Seguridad y Cumplimiento
- Hash de contraseñas con bcrypt 10+ rounds.
- Tokens de verificación con expiración configurable (ej. 30 minutos).
 - Límite de tamaño de avatar: objetivo <= 2 MB (hoy el límite efectivo de `Multer` está en 3 MB) y lista blanca de tipos MIME (jpeg/png/webp).
- Eliminar archivos huérfanos al actualizar/eliminar avatar.
- Logs mínimos (sin datos sensibles) para auditoría.

[APLICADO]
- Bcrypt en backend; TTL de verificación configurable; procesamiento de avatar con `sharp` (resize 512x512 webp) y eliminación de avatar previo con log; CORS habilitado.
- `Multer` configurado con `diskStorage`, límite de 3 MB y filtro básico `image/*`.

[PENDIENTE]
- Ajustar límite de upload a 2 MB y aplicar lista blanca `image/jpeg`, `image/png`, `image/webp` (hoy es `image/*` y 3 MB).  
- Corregir path público de avatar: retornar `/uploads/avatars/...` desde backend o normalizar en frontend (`getImageUrl`) para anteponer `/uploads` cuando el path empiece con `/avatars/`.  
- Rate limit para endpoints sensibles.

## 6. Plan de Trabajo (Iteraciones)
1. **Iteración 1 – Infraestructura**
   - [COMPLETADO] ProfileModule base + `GET /profile` + hook/servicio frontend.
2. **Iteración 2 – Información Personal & Avatar**
   - [COMPLETADO] Endpoints `PUT /profile/personal`, `POST/DELETE /profile/avatar` y formularios/UX.
3. **Iteración 3 – Seguridad (password/email)**
   - [COMPLETADO] Cambio de contraseña, request/verify de email, mensajes y validaciones básicas.
4. **Iteración 4 – Preferencias**
   - [COMPLETADO] Preferencias con defaults y formulario.
5. **Iteración 5 – Gestión de Cuenta**
   - [COMPLETADO] Export (JSON base64), desactivar, eliminar con validaciones de reservas y limpieza de avatar.
6. **Iteración 6 – QA & Documentación**
   - [EN PROCESO] QA manual ampliado, actualización de documentación; pendiente profundizar en tests automatizados.

## 7. Riesgos y Mitigaciones
- **Colisión de datos personalizados** → usar transacciones y validar antes de guardar.
- **Archivos huérfanos** → servicio centralizado de storage + hooks de eliminación.
- **Inconsistencias de roles** → reutilizar guardias y validar campos permitidos por rol.
- **Sobrecarga en frontend** → lazy loading de secciones y manejo de estados locales.
- **Flujos de email** → plan B si no hay SMTP disponible (mostrar código en pantalla).

## 8. Pendientes para Cierre
- Definir formato final de exportación (JSON estructurado vs ZIP).
- Confirmar política de eliminación (soft delete vs hard delete + anonimización).
- Alinear mensajes/UX con equipo UX si existe.
- Revisar impacto en otras áreas (ej. header, dashboards) por avatar/estado.

[Adicionales]
- Validaciones de tamaño/MIME en subida de avatar.  
- Hook `useProfileActions`.  
- Migraciones versionadas y seeding documentado.

> **Próximo paso inmediato:**
> 1) Corregir la URL pública del avatar para evitar 404 (backend: devolver `/uploads/avatars/...` o frontend: normalizar path en `getImageUrl`).
> 2) Endurecer upload: límite 2 MB y MIME estricto (jpeg/png/webp).
> 3) Consolidar migraciones (desactivar `synchronize` en entornos no-dev) y documentar seeding de preferencias.
> 4) (Opcional) Añadir `useProfileActions` para desacoplar acciones de cuenta y tests mínimos de integración del módulo.


## 9. Estado actual
- Iteraciones 1 a 5 completadas en backend y frontend (módulo Profile en NestJS y formularios React).  
- Builds locales ejecutados en `espacios_deportivos` y `rogu-web` sin errores de compilación.  
- Pendiente: pruebas manuales adicionales de flujo de correo y ajustes UX; consolidar migraciones/versionado y hardening de subida de avatar. Validar y corregir URL pública de avatar.
