# ✅ SISTEMA DE VERIFICACIÓN DE DUEÑOS, SEDES Y CANCHAS

**Fecha:** 10 de noviembre de 2025  
**Prioridad:** 🔴 CRÍTICA  

---

## 📋 OBJETIVO

Implementar un sistema completo de verificación en 3 niveles para garantizar que:
1. Los dueños/gerentes son personas reales
2. Las sedes/espacios deportivos existen físicamente
3. Las canchas dentro de las sedes son reales y están bien documentadas

**Problema a resolver:** Actualmente cualquiera puede crear una sede sin verificación, lo que permite contenido fraudulento.

---

## 🎯 ALCANCE DEL SISTEMA

### Estados Globales de Verificación

Cada entidad (Dueño, Sede, Cancha) tendrá estados:
- `UNVERIFIED` - Sin documentos enviados
- `PENDING` - Documentos enviados, esperando revisión
- `UNDER_REVIEW` - Admin está revisando
- `VERIFIED` - Aprobado y verificado
- `REJECTED` - Rechazado con motivo
- `SUSPENDED` - Suspendido temporalmente

---

## 🔐 NIVEL 1: VERIFICACIÓN DE DUEÑO/GERENTE

### Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUARIO SOLICITA SER DUEÑO                               │
├─────────────────────────────────────────────────────────────┤
│ Usuario → Perfil → "Quiero ser dueño de sede"              │
│ Redirige a: /verify/owner                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FORMULARIO DE VERIFICACIÓN                               │
├─────────────────────────────────────────────────────────────┤
│ Datos personales:                                           │
│  - Nombre completo (debe coincidir con CI)                │
│  - Fecha de nacimiento                                      │
│  - Dirección completa                                       │
│  - Teléfono de contacto                                     │                        │
│                                                             │
│ Documentos requeridos:                                      │
│  ✓ Cédula (frontal) - JPG/PNG, max 5MB                │
│  ✓ Cédula (reverso) - JPG/PNG, max 5MB                │
│  ✓ Selfie sosteniendo INE - JPG/PNG, max 5MB              │
│  ✓ Comprobante de domicilio (< 3 meses) - PDF/JPG, max 5MB(opcional)│
│   depende de ti Os
|                                                             │
│                                                             │
│ Validaciones frontend:                                      │
│  - Formato de archivo correcto                             │
│  - Tamaño de archivo                                       │
│  - Preview de imágenes antes de subir                      │
│  - Todos los campos obligatorios llenos                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ENVÍO Y ALMACENAMIENTO                                   │
├─────────────────────────────────────────────────────────────┤
│ Backend recibe:                                             │
│  - FormData con documentos                                  │
│  - Validación de tipos MIME                                │
│  - Validación de tamaños                                   │
│  - Escaneo antivirus (opcional)                           │
│                                                             │
│ Almacenamiento:                                            │
│  - Guardar archivos en: /uploads/verificaciones/duenos/   │
│  - Nomenclatura: {idUsuario}_{tipo}_{timestamp}.ext       │
│  - Crear registro en tabla: Dueno                           │
│  - Estado inicial: PENDING                                  │
│                                                             │
│ Notificaciones:                                            │
│  → Usuario: "Solicitud enviada exitosamente"              │
│  → Admins: "Nueva solicitud de verificación pendiente"    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. REVISIÓN POR ADMINISTRADOR                               │
├─────────────────────────────────────────────────────────────┤
│ Admin accede a: /admin/verificaciones/duenos               │
│                                                             │
│ Panel muestra:                                              │
│  - Lista de solicitudes pendientes                         │
│  - Filtros: Por estado, fecha, nombre                      │
│  - Contador de pendientes                                  │
│                                                             │
│ Al seleccionar una solicitud:                               │
│  - Ver todos los documentos en visor                       │
│  - Zoom en documentos                                      │
│  - Comparar foto de CI con selfie                        │
│  - Ver datos del solicitante                              │
│  - Historial de intentos previos (si los hay)            │
│                                                             │
│ Opciones de decisión:                                       │
│  [APROBAR] → Usuario obtiene rol GERENTE_VERIFICADO       │
│  [RECHAZAR] → Solicitar motivo obligatorio                │
│  [SOLICITAR MÁS INFO] → Pedir documentos adicionales      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. RESULTADO Y NOTIFICACIÓN                                 │
├─────────────────────────────────────────────────────────────┤
│ SI APROBADO:                                                │
│  - Cambiar estado a: VERIFIED                              │
│  - Actualizar Usuario.rol → GERENTE_VERIFICADO            │
│  - Enviar email: "¡Felicidades! Eres dueño verificado"   │
│  - Enviar notificación in-app                             │
│  - Habilitar sección: "Crear mi primera sede"            │
│  - Dar acceso a: /venues/create                           │
│                                                             │
│ SI RECHAZADO:                                               │
│  - Cambiar estado a: REJECTED                              │
│  - Guardar motivo del rechazo                             │
│  - Enviar email explicando el motivo                      │
│  - Permitir reenvío (máximo 3 intentos)                  │
│  - Enviar notificación in-app                             │
└─────────────────────────────────────────────────────────────┘
```

### Tabla de Base de Datos: `Dueno`

```
Campos necesarios:

- documentoCIFrontal (varchar 500) - ruta del archivo
- documentoCIReverso (varchar 500)
- documentoSelfie (varchar 500)
- documentoComprobanteDomicilio (varchar 500)

- estado (enum: PENDING, UNDER_REVIEW, VERIFIED, REJECTED)
- motivoRechazo (text, nullable)
- verificadoPor (FK a Usuario Admin, nullable)
- fechaSolicitud (timestamp)
- fechaRevision (timestamp, nullable)
- intentos (int, default 1)

- notas (text, nullable) - notas del admin
- ipSolicitud (varchar 45) - para auditoría
```

---

## 🏢 NIVEL 2: VERIFICACIÓN DE SEDE/ESPACIO DEPORTIVO

### Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DUEÑO VERIFICADO CREA SEDE                               │
├─────────────────────────────────────────────────────────────┤
│ Requisito: Usuario con rol GERENTE_VERIFICADO              │
│ Accede a: /venues/create                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FORMULARIO DE CREACIÓN DE SEDE                           │
├─────────────────────────────────────────────────────────────┤
│ Información básica:                                         │
│  - Nombre del espacio deportivo                            │
│  - Descripción detallada                                   │
│  - Dirección completa                                      │
│  - Ciudad, Estado, CP                                      │
│  - Ubicación en mapa (lat, lng) - GPS                     │
│  - Teléfono del lugar                                      │
│  - Email de contacto                                       │
│  - Horario de apertura/cierre                             │
│  - Servicios generales (estacionamiento, cafetería, etc.) │
│                                                             │
│ Documentación legal:                                        │
│  ✓ NIT del negocio - Requerido                        │
│  ✓ Licencia de funcionamiento - PDF, max 5MB              │
│  ✓ Comprobante de propiedad O contrato de arrendamiento   │
│  □ Permisos municipales (opcional)                        │
│                                                             │
│ Documentación visual:                                       │
│  ✓ Foto de la fachada - JPG/PNG, max 5MB                 │
│  ✓ Foto del interior/recepción - JPG/PNG, max 5MB        │
│  ✓ Foto de baños/vestidores - JPG/PNG, max 5MB           │
│  ✓ Foto de estacionamiento - JPG/PNG, max 5MB            │
│  ✓ Foto adicional (área general) - JPG/PNG, max 5MB      │
│  □ Video del recorrido (opcional) - MP4, max 50MB        │
│                                                             │
│ Verificación GPS:                                          │
│  - Tomar ubicación actual (si está en el lugar)           │
│  - Validar que coincida con dirección                     │
│  - Mostrar en mapa para confirmar                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ENVÍO Y CREACIÓN                                         │
├─────────────────────────────────────────────────────────────┤
│ Backend:                                                    │
│  - Crear registro en tabla: Sede                           │
│  - Estado inicial: PENDING                                 │
│  - Guardar archivos en: /uploads/sedes/{idSede}/          │
│  - Crear registro en: VerificacionSede                     │
│  - Asociar idDueno con la sede                            │
│                                                             │
│ Notificaciones:                                            │
│  → Dueño: "Sede creada, esperando verificación"           │
│  → Admins: "Nueva sede pendiente de verificación"         │
│                                                             │
│ Estado del dueño:                                           │
│  - Puede ver su sede en "Mis Sedes"                       │
│  - No puede agregar canchas aún                           │
│  - No es visible para clientes                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. REVISIÓN POR ADMINISTRADOR                               │
├─────────────────────────────────────────────────────────────┤
│ Admin accede a: /admin/verificaciones/sedes                │
│                                                             │
│ Panel muestra:                                              │
│  - Lista de sedes pendientes                               │
│  - Filtros: Estado, ciudad, fecha                         │
│  - Mapa con ubicaciones                                    │
│                                                             │
│ Al seleccionar una sede:                                    │
│  - Ver galería de fotos                                    │
│  - Ver documentos legales                                  │
│  - Ver ubicación en Google Maps                           │
│  - Verificar en Google Street View                        │
│  - Ver datos del dueño                                     │
│  - Comparar dirección registrada vs GPS                   │
│                                                             │
│ Herramientas de verificación:                               │
│  - Cross-check con Google Maps                            │
│  - Búsqueda de reseñas en otras plataformas              │
│  - Verificación de NIT en registros públicos              │
│  - Llamada telefónica al lugar (opcional)                 │
│                                                             │
│ Opciones de decisión:                                       │
│  [APROBAR] → Sede visible para clientes                   │
│  [RECHAZAR] → Motivo obligatorio                          │
│  [MARCAR PARA VISITA] → Programar visita física          │
│  [SOLICITAR MÁS INFO] → Pedir documentos adicionales      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. RESULTADO Y NOTIFICACIÓN                                 │
├─────────────────────────────────────────────────────────────┤
│ SI APROBADO:                                                │
│  - Cambiar Sede.estado → VERIFIED                          │
│  - Sede visible en búsquedas de clientes                  │
│  - Habilitar: "Agregar canchas"                           │
│  - Enviar email al dueño                                   │
│  - Enviar notificación in-app                             │
│  - Badge de "Verificado" visible en la sede              │
│                                                             │
│ SI RECHAZADO:                                               │
│  - Sede.estado → REJECTED                                  │
│  - Guardar motivo                                          │
│  - Enviar email con explicación                           │
│  - Permitir corrección y reenvío                          │
│  - No visible para clientes                               │
└─────────────────────────────────────────────────────────────┘
```

### Tabla de Base de Datos: `VerificacionSede` (depende de TI oscar, si hacerlo en `sede` o en `nueva tabla`)

```
Campos necesarios:
- idVerificacionSede (PK)
- idSede (FK a Sede)
- idDueno (FK a Usuario)

- nitRFC (varchar 20)
- licenciaFuncionamiento (varchar 500) - ruta
- comprobantePropiedad (varchar 500) - ruta
- permisosAdicionales (text, nullable)

- fotoFachada (varchar 500)
- fotoInterior (varchar 500)
- fotoBanosVestidores (varchar 500)
- fotoEstacionamiento (varchar 500)
- fotoAdicional (varchar 500)
- videoRecorrido (varchar 500, nullable)

- latitud (decimal 10,8)
- longitud (decimal 11,8)
- ubicacionVerificada (boolean, default false)

- estado (enum: PENDING, UNDER_REVIEW, VERIFIED, REJECTED)
- motivoRechazo (text, nullable)
- verificadoPor (FK a Usuario Admin, nullable)
- fechaSolicitud (timestamp)
- fechaRevision (timestamp, nullable)
- requiereVisita (boolean, default false)
- fechaVisita (date, nullable)

- notasAdmin (text, nullable)
- calificacionVerificacion (int 1-5, nullable)
```

---

## ⚽ NIVEL 3: VERIFICACIÓN DE CANCHAS

### Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DUEÑO AGREGA CANCHA A SEDE VERIFICADA                    │
├─────────────────────────────────────────────────────────────┤
│ Requisito: Sede con estado VERIFIED                         │
│ Accede a: /venues/{idSede}/fields/create                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FORMULARIO DE CREACIÓN DE CANCHA                         │
├─────────────────────────────────────────────────────────────┤
│ Información básica:                                         │
│  - Nombre de la cancha (ej: "Cancha 1", "Cancha A")       │
│  - Deporte (fútbol, basquet, tenis, etc.)                 │
│  - Tipo de superficie (césped sintético, cemento, etc.)   │
│  - Dimensiones (largo x ancho en metros)                  │
│  - Capacidad de jugadores                                  │
│  - Techada (Sí/No)                                        │
│                                                             │
│ Servicios específicos:                                      │
│  □ Iluminación nocturna                                    │
│  □ Gradas/espectadores                                     │
│  □ Marcador electrónico                                    │
│  □ Vestidores exclusivos                                   │
│  □ Duchas                                                  │
│  □ Área de calentamiento                                   │
│                                                             │
│ Precios:                                                    │
│  - Precio por hora diurno                                  │
│  - Precio por hora nocturno                                │
│  - Descuentos por reserva múltiple (opcional)             │
│                                                             │
│ Documentación visual (OBLIGATORIO):                         │
│  ✓ Vista completa cancha (ángulo 1) - JPG/PNG, max 5MB   │
│  ✓ Vista lateral izquierda (ángulo 2) - JPG/PNG, max 5MB │
│  ✓ Vista lateral derecha (ángulo 3) - JPG/PNG, max 5MB   │
│  ✓ Vista de arquería/canasta (ángulo 4) - JPG/PNG, max 5MB│
│  □ Video de 15 segundos (opcional) - MP4, max 20MB       │
│  □ Foto iluminación nocturna - JPG/PNG, max 5MB          │
│                                                             │
│ Validaciones:                                              │
│  - Todas las 4 fotos obligatorias                         │
│  - Dimensiones coherentes con el deporte                  │
│  - Precio mayor a 0                                        │
│  - Superficie válida para el deporte                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ENVÍO Y CREACIÓN                                         │
├─────────────────────────────────────────────────────────────┤
│ Backend:                                                    │
│  - Crear registro en tabla: Cancha                         │
│  - Estado inicial: PENDING                                 │
│  - Guardar fotos en: /uploads/canchas/{idCancha}/         │
│  - Crear registro en: VerificacionCancha                   │
│  - Asociar con idSede                                      │
│                                                             │
│ Notificaciones:                                            │
│  → Dueño: "Cancha creada, esperando verificación"         │
│  → Admins: "Nueva cancha pendiente de verificación"       │
│                                                             │
│ Estado:                                                     │
│  - Cancha no visible para clientes                        │
│  - No disponible para reservas                            │
│  - Dueño puede verla en "Mis Canchas"                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. REVISIÓN POR ADMINISTRADOR                               │
├─────────────────────────────────────────────────────────────┤
│ Admin accede a: /admin/verificaciones/canchas              │
│                                                             │
│ Panel muestra:                                              │
│  - Lista de canchas pendientes                             │
│  - Agrupadas por sede                                      │
│  - Filtros: Deporte, estado, fecha                        │
│                                                             │
│ Al seleccionar una cancha:                                  │
│  - Galería de fotos (4 ángulos + extras)                  │
│  - Video (si hay)                                          │
│  - Especificaciones técnicas                              │
│  - Comparar con otras canchas de la sede                  │
│  - Ver precios del mercado para referencia                │
│                                                             │
│ Validaciones del admin:                                     │
│  ✓ Fotos son de la misma cancha                           │
│  ✓ Superficie coincide con lo declarado                   │
│  ✓ Dimensiones son realistas                              │
│  ✓ Precios son razonables                                 │
│  ✓ No hay señales de fraude                               │
│                                                             │
│ Opciones de decisión:                                       │
│  [APROBAR] → Cancha disponible para reservas              │
│  [RECHAZAR] → Motivo obligatorio                          │
│  [SOLICITAR MÁS FOTOS] → Pedir ángulos adicionales        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. RESULTADO Y NOTIFICACIÓN                                 │
├─────────────────────────────────────────────────────────────┤
│ SI APROBADO:                                                │
│  - Cancha.estado → VERIFIED                                │
│  - Cancha visible en búsquedas                            │
│  - Disponible para reservas                               │
│  - Enviar email al dueño                                   │
│  - Enviar notificación in-app                             │
│  - Badge "Verificado" en la cancha                        │
│                                                             │
│ SI RECHAZADO:                                               │
│  - Cancha.estado → REJECTED                                │
│  - Guardar motivo específico                              │
│  - Enviar email explicando                                │
│  - Permitir corrección                                     │
│  - Opción de eliminar y recrear                           │
└─────────────────────────────────────────────────────────────┘
```

### Tabla de Base de Datos: `VerificacionCancha` (depende de TI oscar, si hacerlo en `cancha` o en `nueva tabla`)

```
Campos necesarios:
- idVerificacionCancha (PK)
- idCancha (FK a Cancha)
- idSede (FK a Sede)

- fotoAngulo1 (varchar 500)
- fotoAngulo2 (varchar 500)
- fotoAngulo3 (varchar 500)
- fotoAngulo4 (varchar 500)
- videoCancha (varchar 500, nullable)
- fotoIluminacion (varchar 500, nullable)

- dimensionesVerificadas (boolean)
- superficieVerificada (boolean)
- preciosVerificados (boolean)

- estado (enum: PENDING, UNDER_REVIEW, VERIFIED, REJECTED)
- motivoRechazo (text, nullable)
- verificadoPor (FK a Usuario Admin, nullable)
- fechaSolicitud (timestamp)
- fechaRevision (timestamp, nullable)

- notasAdmin (text, nullable)
- calificacionCalidad (int 1-5, nullable)
```

---

## 📡 ENDPOINTS DEL BACKEND

### Verificación de Dueños

```
POST   /api/verificacion/duenos
Body: FormData con documentos + datos personales
Response: { idVerificacion, estado, mensaje }

GET    /api/verificacion/duenos/mi-estado
Response: { estado, fechaSolicitud, motivoRechazo? }

GET    /api/admin/verificacion/duenos
Query: ?estado=PENDING&page=1&limit=20
Response: { solicitudes[], total, paginas }

GET    /api/admin/verificacion/duenos/:id
Response: { solicitud completa con URLs de documentos }

PUT    /api/admin/verificacion/duenos/:id/aprobar
Body: { notasAdmin? }
Response: { mensaje, usuarioActualizado }

PUT    /api/admin/verificacion/duenos/:id/rechazar
Body: { motivoRechazo, notasAdmin? }
Response: { mensaje }

PUT    /api/admin/verificacion/duenos/:id/solicitar-info
Body: { mensajeAlUsuario, documentosRequeridos[] }
Response: { mensaje }
```

### Verificación de Sedes

```
POST   /api/verificacion/sedes
Body: FormData con documentos + información de sede
Response: { idSede, idVerificacion, estado }

GET    /api/verificacion/sedes/mis-sedes
Response: { sedes[] con estado de verificación }

GET    /api/admin/verificacion/sedes
Query: ?estado=PENDING&ciudad=&page=1&limit=20
Response: { sedes[], total, paginas }

GET    /api/admin/verificacion/sedes/:id
Response: { sede completa con documentos y fotos }

PUT    /api/admin/verificacion/sedes/:id/aprobar
Body: { notasAdmin?, calificacion? }
Response: { mensaje, sedeActualizada }

PUT    /api/admin/verificacion/sedes/:id/rechazar
Body: { motivoRechazo, notasAdmin }
Response: { mensaje }

PUT    /api/admin/verificacion/sedes/:id/marcar-visita
Body: { fechaVisita, notasVisita }
Response: { mensaje }
```

### Verificación de Canchas

```
POST   /api/verificacion/canchas
Body: FormData con fotos + datos de cancha
Response: { idCancha, idVerificacion, estado }

GET    /api/verificacion/canchas/por-sede/:idSede
Response: { canchas[] con estado de verificación }

GET    /api/admin/verificacion/canchas
Query: ?estado=PENDING&deporte=&page=1
Response: { canchas[], total }

GET    /api/admin/verificacion/canchas/:id
Response: { cancha completa con fotos }

PUT    /api/admin/verificacion/canchas/:id/aprobar
Body: { notasAdmin?, calificacion? }
Response: { mensaje, canchaActualizada }

PUT    /api/admin/verificacion/canchas/:id/rechazar
Body: { motivoRechazo, notasAdmin }
Response: { mensaje }

PUT    /api/admin/verificacion/canchas/:id/solicitar-fotos
Body: { angulosSolicitados[], mensaje }
Response: { mensaje }
```

### Endpoints de Utilidad

```
GET    /api/admin/verificacion/estadisticas
Response: {
  duenos: { pending, verified, rejected },
  sedes: { pending, verified, rejected },
  canchas: { pending, verified, rejected },
  tiempoPromedioRevision
}

GET    /api/admin/verificacion/actividad-reciente
Response: { actividades[] últimas verificaciones }

POST   /api/verificacion/upload-documento
Body: FormData con archivo
Response: { url, nombreArchivo }
(Para subir documentos adicionales)
```

---

## 🎨 COMPONENTES FRONTEND NECESARIOS

### Para Usuarios/Dueños

**Páginas:**
- `/verify/owner` - Solicitud de verificación de dueño
- `/venues/create` - Crear sede (solo para verificados)
- `/venues/:id/fields/create` - Crear cancha
- `/my-verifications` - Ver estado de verificaciones

**Componentes:**
- `OwnerVerificationForm` - Formulario de verificación
- `DocumentUploader` - Upload con preview y validación
- `VerificationStatus` - Badge de estado
- `VerificationTimeline` - Línea de tiempo del proceso
- `RejectionReason` - Mostrar motivo de rechazo
- `VenueVerificationForm` - Formulario de sede
- `FieldVerificationForm` - Formulario de cancha
- `PhotoGalleryUploader` - Subir múltiples fotos

### Para Administradores

**Páginas:**
- `/admin/verificaciones` - Dashboard general
- `/admin/verificaciones/duenos` - Lista de dueños
- `/admin/verificaciones/sedes` - Lista de sedes
- `/admin/verificaciones/canchas` - Lista de canchas
- `/admin/verificacion/:tipo/:id` - Detalle individual

**Componentes:**
- `VerificationDashboard` - Dashboard con contadores
- `VerificationList` - Lista con filtros
- `VerificationCard` - Card de solicitud
- `DocumentViewer` - Visor de documentos con zoom
- `PhotoComparison` - Comparar fotos lado a lado
- `VerificationActions` - Botones de aprobar/rechazar
- `RejectionModal` - Modal para rechazar con motivo
- `GoogleMapsVerifier` - Verificar ubicación en mapa
- `VerificationHistory` - Historial de verificaciones

---

## 🔔 NOTIFICACIONES DEL SISTEMA

### Para Usuarios

- ✅ Solicitud de verificación enviada
- ⏳ Tu solicitud está siendo revisada
- 🎉 ¡Has sido verificado como dueño!
- ❌ Tu solicitud fue rechazada
- 📝 Se necesita información adicional
- 🏢 Tu sede ha sido verificada
- ⚽ Tu cancha ha sido aprobada

### Para Administradores

- 🔔 Nueva solicitud de verificación de dueño
- 🏟️ Nueva sede pendiente de verificación
- ⚽ Nueva cancha pendiente de verificación
- ⏰ Recordatorio: 10 verificaciones pendientes
- 📊 Reporte semanal de verificaciones

---

## 📊 MÉTRICAS Y REPORTES

### KPIs a Trackear

- Tiempo promedio de verificación por tipo
- Tasa de aprobación vs rechazo
- Motivos de rechazo más comunes
- Solicitudes pendientes por administrador
- Pico de solicitudes por hora/día
- Reincidencia de rechazos
- Satisfacción de dueños con el proceso

### Dashboard de Administrador

- Gráfico de solicitudes por día
- Embudo de conversión (solicitado → verificado)
- Mapa de calor de sedes verificadas
- Top administradores más eficientes
- Alertas de solicitudes antiguas (>3 días)

---

## 🔒 SEGURIDAD Y VALIDACIONES

### Backend

- ✅ Validar tipos MIME de archivos
- ✅ Escanear archivos con antivirus
- ✅ Limitar tamaño de archivos
- ✅ Validar extensiones permitidas
- ✅ Sanitizar nombres de archivos
- ✅ Encriptar información sensible
- ✅ Rate limiting en uploads
- ✅ Logs de auditoría para cada acción
- ✅ Verificar permisos en cada endpoint

### Frontend

- ✅ Validar formato antes de subir
- ✅ Mostrar preview de archivos
- ✅ Indicar progreso de upload
- ✅ Validar campos obligatorios
- ✅ Proteger rutas por rol
- ✅ Mostrar errores claros

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1 - Backend
- Crear tablas de BD
- Implementar endpoints de verificación
- Sistema de upload de archivos
- Lógica de aprobación/rechazo

### Semana 2 - Frontend Usuario
- Formularios de verificación
- Upload de documentos
- Vista de estado
- Manejo de errores

### Semana 3 - Frontend Admin
- Panel de verificaciones
- Visor de documentos
- Acciones de aprobar/rechazar
- Integraciones y testing

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Crear tablas: VerificacionDueno, VerificacionSede, VerificacionCancha
- [ ] Implementar endpoints de verificación
- [ ] Sistema de upload con validaciones
- [ ] Lógica de cambio de roles
- [ ] Sistema de notificaciones
- [ ] Logs de auditoría
- [ ] Testing de endpoints

### Frontend - Usuario
- [ ] Formulario de verificación de dueño
- [ ] Formulario de creación de sede
- [ ] Formulario de creación de cancha
- [ ] Componente de upload de documentos
- [ ] Vista de estado de verificación
- [ ] Manejo de rechazos

### Frontend - Admin
- [ ] Dashboard de verificaciones
- [ ] Lista de dueños pendientes
- [ ] Lista de sedes pendientes
- [ ] Lista de canchas pendientes
- [ ] Visor de documentos
- [ ] Modal de aprobación
- [ ] Modal de rechazo
- [ ] Estadísticas y métricas

### Integraciones
- [ ] Notificaciones in-app
- [ ] Emails de confirmación/rechazo
- [ ] Protección de rutas
- [ ] Permisos por rol
- [ ] Testing end-to-end

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### Verificación de Dueño
- ✅ Usuario puede solicitar verificación
- ✅ Admin puede revisar documentos
- ✅ Admin puede aprobar/rechazar
- ✅ Usuario recibe notificación del resultado
- ✅ Rol se actualiza correctamente

### Verificación de Sede
- ✅ Solo dueños verificados pueden crear sedes
- ✅ Sede no es visible hasta ser verificada
- ✅ Admin puede verificar ubicación en mapa
- ✅ Documentos legales son validados

### Verificación de Cancha
- ✅ Solo se pueden agregar canchas a sedes verificadas
- ✅ 4 fotos obligatorias
- ✅ Cancha no disponible hasta verificación
- ✅ Precios y especificaciones validados

---

**FIN DEL DOCUMENTO**
