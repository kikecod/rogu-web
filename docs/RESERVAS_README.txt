Documentación rápida: Integración de Reservas (Frontend -> Backend)

Propósito
--------
Este documento describe cómo está implementada actualmente la funcionalidad de "Reservas" en el frontend (ROGU web), qué partes ya están implementadas, qué falta en el backend para producción y recomendaciones para escalar y endurecer la integración antes de desplegar a producción.

Archivos clave (frontend)
Documentación rápida: Integración de Reservas (Frontend -> Backend)

Propósito
--------
Este documento describe cómo está implementada actualmente la funcionalidad de "Reservas" en el frontend (ROGU web), qué partes ya están implementadas, qué falta en el backend para producción y recomendaciones para escalar y endurecer la integración antes de desplegar a producción.

Archivos clave (frontend)
-------------------------
- `src/features/reservas/services/reserva.service.ts`
   - `getReservasPorCliente(token?)` -> GET `/api/reservas/cliente`
   - `getReservasPorCancha(canchaId, token?)` -> GET `/api/reservas/cancha/:id`

- `src/app/cliente/pages/MyBookingsPage.tsx`
   - Intenta cargar reservas del cliente usando `getReservasPorCliente`.
   - Mapea la respuesta raw al modelo de UI.
   - Antes existían mocks; se eliminaron para evitar mostrar datos de ejemplo en cualquier entorno.

- `src/features/reservas/components/ReservaManagement.tsx`
   - Carga reservas por cancha usando fetch directo a `/api/reservas/cancha/:id` (se recomienda refactorizar para usar el servicio centralizado).

Qué está implementado ahora
---------------------------
1. Servicio HTTP mínimo en frontend (`reserva.service.ts`) con dos métodos para obtener reservas.
2. `MyBookingsPage` intenta cargar reservas reales si hay `token` en `localStorage`. Si el backend no devuelve reservas, la lista queda vacía.
3. `ReservaManagement.tsx` aún usa fetch directo para cargar reservas de una cancha y luego intenta cargar datos del usuario para cada reserva. Funciona, pero está duplicando lógica de fetch/headers.

Qué falta en el backend (o qué debes confirmar)
-----------------------------------------------
- Endpoints:
   - GET `/api/reservas/cliente` -> debe devolver lista de reservas del cliente autenticado (usar token Bearer en Authorization).
   - GET `/api/reservas/cancha/:id` -> debe devolver reservas de una cancha específica.
   - GET `/api/usuarios/persona/:id` -> devuelve los datos del usuario/persona asociados a la reserva (si se desea mostrar contacto).
- Contratos de datos: confirmar que los campos devueltos coincidan con lo que el frontend espera (`id_reserva`, `id_cliente`, `id_cancha`, `inicia_en`, `termina_en`, `monto_total`, `cantidad_personas`, `cancha.nombre`, `cancha.direccion`, etc.).
- Manejo de autorizaciones: endpoints deberían validar el token y devolver 401 cuando corresponda.

Recomendaciones antes de producción
-----------------------------------
1. Centralizar la lógica HTTP
    - Refactorizar `ReservaManagement.tsx` para usar `reserva.service.getReservasPorCancha` y eliminar fetch directo.
    - Crear un `http-client.ts` o usar `lib/api/http-client.ts` si existe, para inyectar headers, tiempo de espera y manejo uniforme de errores.

2. Manejo de errores y experiencia de usuario
    - Mostrar mensajes claros cuando no hay token (p.ej. "Inicia sesión para ver tus reservas").
    - Manejar 401 redirigiendo al login o provocando refresh del token.
    - Mostrar un estado explícito de carga y errores recuperables.

3. Validaciones y transformaciones
    - Normalizar nombres de propiedades (backend snake_case, frontend camelCase) en un solo lugar (servicios) para evitar errores repetidos.
    - Validar formatos (fechas ISO) antes de renderizar.

4. Rendimiento y escalabilidad
    - Paginación en endpoints que devuelven reservas (GET `/api/reservas/cliente` should support `?page=&limit=`).
    - Cache en frontend (stale-while-revalidate) para reducir llamadas repetidas.
    - Evitar N+1 requests: si `/api/reservas` retorna ya la info de `usuario.persona` y `cancha`, elimina las llamadas adicionales por reserva. Si no es posible, crear endpoints que devuelvan las relaciones requeridas en una sola llamada.

5. Seguridad
    - No almacenar datos sensibles en localStorage si puedes usar httpOnly cookies para tokens.
    - Validar y sanitizar cualquier dato que venga del backend antes de renderizar.

6. Tests
    - Añadir tests unitarios para los servicios (mock fetch) y pruebas de integración para asegurar el flujo de reservas.

Pasos prácticos inmediatos (lista corta)
---------------------------------------
1. Refactorizar `ReservaManagement.tsx` para usar `reserva.service.getReservasPorCancha`.
2. Implementar `http-client` centralizado (si no existe) para headers y manejo de token.
3. Confirmar con backend los esquemas JSON y añadir paginación.
4. Agregar manejo de 401 y redirección a login.

Contacto / notas finales
------------------------
Si quieres, puedo aplicar automáticamente la refactorización de `ReservaManagement.tsx` y crear `lib/api/http-client.ts` con helpers mínimos. Dime si lo implemento ahora y lo hago en este branch.

Autenticación (register / login / token)
---------------------------------------
Esta sección documenta los endpoints y el flujo de autenticación que el frontend utiliza actualmente, dónde está implementado y recomendaciones para producción.

Endpoints esperados (backend)
- POST /api/auth/register
   - Body esperado (JSON):
      - id_persona: number  (FK a personas; en el frontend se normaliza a snake_case)
      - usuario: string
      - correo: string
      - contrasena: string
   - Respuesta esperada: 201 con objeto usuario o { id: <id_usuario>, usuario: {...} }
   - Errores comunes: 400 (validaciones), 409 (usuario/correo duplicado)

- POST /api/auth/login
   - Body esperado (JSON):
      - correo: string
      - contrasena: string
   - Respuesta esperada: 200 { token: "<jwt>", usuario: { id_usuario, id_persona, correo, ... } }
   - En el frontend actualmente se almacena `token` en `localStorage` (ver `src/features/auth/context/AuthContext.tsx`)

- POST /api/auth/refresh (opcional pero recomendado)
   - Body o cookie con refresh token
   - Respuesta: nuevo access token (y opcionalmente nuevo refresh token)

- POST /api/auth/logout (opcional)
   - Invalida refresh token y/o borra sesión

Front-end: dónde está implementado
- `src/features/auth/components/AuthModal.tsx`
   - Maneja UI de login y registro.
   - Flujo de registro (signup):
      1. Crea persona en `/api/personas` enviando `fecha_nacimiento` y demás datos.
      2. Toma el id devuelto (normalizea `id`, `idPersona` o `id_persona`) y llama a `POST /api/auth/register` enviando `id_persona` (number), `usuario`, `correo`, `contrasena`.
   - Cambios recientes: el payload ahora usa `fecha_nacimiento` (snake_case) y `id_persona` numeric para `register`.

- `src/features/auth/context/AuthContext.tsx`
   - Provee `login(usuario, token)` y manejo de estado auth en la app.
   - Actualmente guarda token en `localStorage` y expone `logout`.

- `src/features/auth/components/ProtectedRoute.tsx` (si existe)
   - Controla rutas que requieren autenticación. Asegúrate de que use el token del AuthContext y redirija al login si 401.

Contratos y ejemplos (requests/responses)
- Registro (POST /api/auth/register)
   Request:
   {
      "id_persona": 123,
      "usuario": "juan.perez",
      "correo": "juan@example.com",
      "contrasena": "MiPassSegura123"
   }

   Response (200/201):
   {
      "id_usuario": 456,
      "usuario": {
         "id_usuario": 456,
         "id_persona": 123,
         "usuario": "juan.perez",
         "correo": "juan@example.com"
      }
   }

- Login (POST /api/auth/login)
   Request:
   { "correo": "juan@example.com", "contrasena": "MiPassSegura123" }

   Response (200):
   { "token": "eyJhbGci...", "usuario": { "id_usuario": 456, "id_persona": 123, "correo": "..." } }

Almacenamiento del token y recomendaciones de seguridad
-----------------------------------------------------
Actualmente el frontend guarda el `token` en `localStorage`. Esto funciona pero tiene riesgos (XSS). Recomendaciones:
- Preferir httpOnly, Secure cookies para el access/refresh token. Evita exponer tokens a JS.
- Implementar refresh tokens con endpoint `/api/auth/refresh` y almacenar el refresh token en httpOnly cookie.
- Si usas `localStorage`, al menos manejar correctamente expiración y refresh, y sanitizar/escapar todo el HTML/inputs para mitigar XSS.

Manejo de 401/refresh
---------------------
- Centralizar la lógica de requests en un `http-client` (p. ej. `lib/api/http-client.ts`) que:
   - Inyecte `Authorization: Bearer <token>` cuando exista.
   - Intercepte 401 para intentar refresh y reintentar la petición.
   - Si el refresh falla, ejecutar `logout` y redirigir al login.

Validaciones y políticas
------------------------
- En el frontend validar longitudes mínimas de contraseña, formato de correo y fecha (ISO yyyy-mm-dd) antes de enviar.
- En el backend validar y devolver errores claros (p. ej. 400 con JSON { message: [ ... ] }).

Auditoría y seguridad
---------------------
- Limitar intentos de login (rate limiting) y bloqueo temporal por demasiados intentos.
- Registrar eventos de seguridad (login fallido, cambio de contraseña, refresh inválido).
- Usar HTTPS siempre en producción.

Migración y pasos previos a producción
-------------------------------------
1. Confirmar contratos con backend (nombres de campos y formatos) y acordar si se usarán snake_case o camelCase en la API.
2. Implementar `/api/auth/refresh` y política de tokens.
3. Implementar `http-client` centralizado y refactorizar todos los fetch directos para usarlo.
4. Reemplazar `localStorage` por httpOnly cookies si es posible.
5. Añadir tests de integración para el flujo register->login->reservas.

Checklist técnico para autenticación (rápido)
- [ ] Endpoints de auth implementados (login, register, refresh, logout)
- [ ] Contratos validados y documentados
- [ ] http-client centralizado
- [ ] Manejo 401/refresh implementado
- [ ] Tokens seguros (httpOnly cookies) en producción
- [ ] Rate limiting y logs de seguridad
- [ ] Tests automáticos para flujos críticos
