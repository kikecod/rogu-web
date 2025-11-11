# 👨‍💼 PANEL DE ADMINISTRADOR

**Fecha:** 10 de noviembre de 2025  
**Prioridad:** 🔴 CRÍTICA  

---

## 📋 OBJETIVO

Crear un panel de administración completo que permita gestionar la plataforma, verificar usuarios y sedes, moderar contenido, revisar reportes y tener visibilidad total del sistema.

**Problema actual:** No existe forma de administrar la plataforma, verificar contenido o gestionar usuarios.

---

## 🎯 ALCANCE DEL PANEL

### Roles del Sistema

```
CLIENTE
└─ Busca y reserva canchas
└─ No tiene acceso al panel

GERENTE_PENDIENTE (duenio)
└─ Solicitó ser dueño, esperando verificación
└─ No puede crear sedes

GERENTE_VERIFICADO (duenio)
└─ Dueño verificado
└─ Puede crear/gestionar sedes y canchas
└─ Acceso a analytics de sus sedes

ADMIN
└─ Acceso completo al panel de administración
└─ Puede verificar, moderar, gestionar usuarios
└─ No puede gestionar otros admins

SUPER_ADMIN
└─ Todo lo de ADMIN +
└─ Puede crear/eliminar otros admins
└─ Acceso a configuración del sistema
└─ Puede editar roles de cualquier usuario
```

---

## 🏠 MÓDULO 1: DASHBOARD PRINCIPAL

### Vista General

```
┌─────────────────────────────────────────────────────────────┐
│                    PANEL DE ADMINISTRACIÓN                   │
│                         Dashboard                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 MÉTRICAS PRINCIPALES (Cards en fila)                     │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Usuarios │  Sedes   │ Canchas  │ Reservas │ Reportes │  │
│  │  8,542   │   234    │  1,087   │ 12,432   │    45    │  │
│  │  +12%    │   +5%    │  +8%     │  +23%    │   🔴     │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                                                              │
│  🔔 ALERTAS IMPORTANTES                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 15 Verificaciones de dueños pendientes           │   │
│  │ 🟡 8 Reportes sin asignar                           │   │
│  │ 🟠 3 Sedes esperando más de 5 días                  │   │
│  │ ⚪ 12 Reseñas reportadas por revisar                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  📈 GRÁFICOS                                                 │
│  ┌──────────────────────┬──────────────────────────────┐   │
│  │ Usuarios Nuevos      │ Reservas por Día             │   │
│  │ (Últimos 30 días)    │ (Última semana)              │   │
│  │                      │                              │   │
│  │  [Gráfico de línea] │  [Gráfico de barras]         │   │
│  └──────────────────────┴──────────────────────────────┘   │
│                                                              │
│  🕐 ACTIVIDAD RECIENTE                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Nueva sede verificada: "Deportivo La Cantera"     │   │
│  │ • Reporte cerrado: Usuario suspendido               │   │
│  │ • Dueño verificado: Juan Pérez                      │   │
│  │ • 15 nuevas reservas hoy                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  🎯 ACCIONES RÁPIDAS                                         │
│  [Ver Verificaciones] [Revisar Reportes] [Gestionar Users] │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Endpoints del Dashboard

```
GET /api/admin/dashboard/metricas
Response: {
  usuarios: { total, nuevosHoy, nuevosEsteMes, crecimiento },
  sedes: { total, verificadas, pendientes, rechazadas },
  canchas: { total, activas, inactivas },
  reservas: { totalHoy, totalMes, ingresoTotal },
  reportes: { pendientes, enRevision, resueltos }
}

GET /api/admin/dashboard/alertas
Response: {
  verificacionesPendientes: number,
  reportesSinAsignar: number,
  sedesAntiguas: number,
  resenasReportadas: number
}

GET /api/admin/dashboard/graficos/usuarios
Query: ?periodo=30d
Response: { fechas[], valores[] }

GET /api/admin/dashboard/graficos/reservas
Query: ?periodo=7d
Response: { fechas[], valores[] }

GET /api/admin/dashboard/actividad-reciente
Query: ?limit=10
Response: { actividades[] }
```

---

## ✅ MÓDULO 2: GESTIÓN DE VERIFICACIONES

### 2.1 Vista de Verificaciones

```
┌─────────────────────────────────────────────────────────────┐
│                      VERIFICACIONES                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Tabs: [Dueños (15)] [Sedes (8)] [Canchas (12)]            │
│                                                              │
│  Filtros: [Estado ▼] [Fecha ▼] [Buscar...]                 │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🟡 Juan Pérez - Solicitud de Dueño                │     │
│  │ Hace 2 días                                        │     │
│  │ [Ver Documentos] [Aprobar] [Rechazar]             │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🟡 Deportivo Central - Verificación de Sede       │     │
│  │ Hace 5 días ⚠️                                     │     │
│  │ [Ver Detalles] [Aprobar] [Rechazar] [Visita]     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Paginación: < 1 2 3 ... 10 >                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Vista de Detalle - Verificación de Dueño

```
┌─────────────────────────────────────────────────────────────┐
│                   VERIFICACIÓN DE DUEÑO                      │
│                        Juan Pérez                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 INFORMACIÓN PERSONAL                                     │
│  Nombre completo: Juan Antonio Pérez García                 │
│  Fecha nacimiento: 15/03/1985 (39 años)                    │
│  Teléfono: +52 33 1234 5678                                │
│  Email: juan.perez@email.com                                │
│  RFC: PEGJ850315ABC                                         │
│  Dirección: Av. Principal 123, Guadalajara, Jalisco        │
│                                                              │
│  📄 DOCUMENTOS                                               │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ INE Frontal  │ INE Reverso  │ Selfie c/INE │            │
│  │ [Ver imagen] │ [Ver imagen] │ [Ver imagen] │            │
│  └──────────────┴──────────────┴──────────────┘            │
│  ┌────────────────────────┬──────────────────┐             │
│  │ Comprobante Domicilio  │ NIT (opcional)   │             │
│  │ [Ver PDF]              │ [Ver PDF]        │             │
│  └────────────────────────┴──────────────────┘             │
│                                                              │
│  🔍 HERRAMIENTAS DE VERIFICACIÓN                             │
│  [Comparar CI vs Selfie] [Validar NIT en SAT]             │
│  [Buscar en Google] [Ver Historial de Usuario]             │
│                                                              │
│  📊 INFORMACIÓN ADICIONAL                                    │
│  Usuario desde: 15/10/2025                                  │
│  Reservas realizadas: 0                                     │
│  Reportes recibidos: 0                                      │
│  Intentos de verificación: 1                                │
│                                                              │
│  📝 NOTAS DEL ADMIN                                          │
│  [Área de texto para notas internas]                        │
│                                                              │
│  🎯 ACCIONES                                                 │
│  ┌──────────────┬────────────────┬───────────────────┐     │
│  │ ✅ Aprobar   │ ❌ Rechazar    │ 📧 Solicitar Info │     │
│  └──────────────┴────────────────┴───────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Endpoints de Verificaciones

(Ya definidos en documento SISTEMA_VERIFICACION.md)

---

## 👥 MÓDULO 3: GESTIÓN DE USUARIOS

### 3.1 Lista de Usuarios

```
┌─────────────────────────────────────────────────────────────┐
│                      GESTIÓN DE USUARIOS                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filtros:                                                    │
│  [Rol ▼] [Estado ▼] [Fecha registro ▼] [Buscar...]        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 👤 Juan Pérez                                      │     │
│  │ juan@email.com │ GERENTE_VERIFICADO │ Activo      │     │
│  │ Registrado: 15/10/2025 │ 3 sedes │ 156 reservas   │     │
│  │ [Ver Perfil] [Cambiar Rol] [Suspender] [...]      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 👤 María García                                    │     │
│  │ maria@email.com │ CLIENTE │ Activo                │     │
│  │ Registrado: 20/10/2025 │ 12 reservas              │     │
│  │ [Ver Perfil] [Cambiar Rol] [Suspender] [...]      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Mostrando 1-20 de 8,542 usuarios                           │
│  Paginación: < 1 2 3 ... 427 >                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Detalle de Usuario

```
┌─────────────────────────────────────────────────────────────┐
│                      PERFIL DE USUARIO                       │
│                         Juan Pérez                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Foto] Juan Antonio Pérez García                           │
│         @juanperez                                           │
│         juan@email.com                                       │
│         +52 33 1234 5678                                     │
│                                                              │
│  🏷️ ROL ACTUAL                                               │
│  ┌──────────────────────────────────────┐                   │
│  │ GERENTE_VERIFICADO                   │                   │
│  │ [Cambiar Rol ▼]                      │                   │
│  │   • Cliente                          │                   │
│  │   • Gerente Pendiente                │                   │
│  │   • Admin (solo Super Admin)         │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  📊 ESTADÍSTICAS                                             │
│  Registrado: 15/10/2025 (25 días)                          │
│  Última actividad: Hoy a las 10:30 AM                      │
│  Total reservas: 156                                        │
│  Reservas canceladas: 3 (1.9%)                             │
│  Sedes creadas: 3 (todas verificadas)                      │
│  Canchas activas: 12                                        │
│  Reseñas recibidas: 87 (★ 4.8)                            │
│  Reportes recibidos: 0                                      │
│                                                              │
│  🏟️ SEDES ADMINISTRADAS                                      │
│  • Deportivo Central (8 canchas)                           │
│  • Arena 5x5 (3 canchas)                                   │
│  • Courts Express (1 cancha)                               │
│                                                              │
│  🔒 ESTADO DE CUENTA                                         │
│  Estado: ✅ Activo                                          │
│  Email verificado: ✅ Sí                                    │
│  Dueño verificado: ✅ Sí (desde 20/10/2025)                │
│                                                              │
│  📝 HISTORIAL DE ACCIONES                                    │
│  • 09/11 - Creó cancha "Cancha 1" en Deportivo Central    │
│  • 08/11 - Recibió reseña 5★ en Arena 5x5                 │
│  • 05/11 - Editó precios de cancha                         │
│  [Ver historial completo]                                   │
│                                                              │
│  ⚠️ ACCIONES ADMINISTRATIVAS                                 │
│  ┌─────────────┬──────────────┬──────────────────┐         │
│  │ 🔄 Cambiar  │ ⏸️ Suspender │ 🚫 Banear        │         │
│  │    Rol      │   Temporal   │   Permanente     │         │
│  └─────────────┴──────────────┴──────────────────┘         │
│  ┌─────────────┬──────────────┬──────────────────┐         │
│  │ 📧 Enviar   │ 🔍 Ver       │ 🗑️ Eliminar      │         │
│  │    Email    │   Reportes   │    Cuenta        │         │
│  └─────────────┴──────────────┴──────────────────┘         │
│                                                              │
│  📝 NOTAS INTERNAS                                           │
│  [Área para que admins dejen notas sobre este usuario]     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Endpoints de Gestión de Usuarios

```
GET /api/admin/usuarios
Query: ?rol=&estado=&buscar=&page=1&limit=20
Response: { usuarios[], total, paginas }

GET /api/admin/usuarios/:id
Response: {
  usuario: { info completa },
  estadisticas: { reservas, canchas, sedes, etc },
  historial: { acciones recientes },
  reportes: { reportes recibidos },
  notasAdmin: { notas internas }
}

PUT /api/admin/usuarios/:id/cambiar-rol
Body: { nuevoRol, motivo }
Response: { mensaje, usuarioActualizado }

PUT /api/admin/usuarios/:id/suspender
Body: { diasSuspension, motivo }
Response: { mensaje, fechaReactivacion }

PUT /api/admin/usuarios/:id/banear
Body: { motivo, permanente }
Response: { mensaje }

PUT /api/admin/usuarios/:id/reactivar
Body: { motivo }
Response: { mensaje }

DELETE /api/admin/usuarios/:id
Body: { motivo, confirmacion }
Response: { mensaje }

POST /api/admin/usuarios/:id/enviar-email
Body: { asunto, mensaje, tipo }
Response: { mensaje }

GET /api/admin/usuarios/:id/historial
Query: ?page=1&limit=50
Response: { acciones[] }

POST /api/admin/usuarios/:id/nota
Body: { contenido, tipo }
Response: { notaCreada }

GET /api/admin/usuarios/estadisticas
Response: {
  totalUsuarios,
  porRol: { clientes, gerentes, admins },
  nuevosHoy,
  nuevosMes,
  activos,
  suspendidos,
  baneados
}
```

---

## 🚩 MÓDULO 4: GESTIÓN DE REPORTES/DENUNCIAS (OPCIONAL, depende de ti DENZEL si te da el tiempo)

### 4.1 Lista de Reportes

```
┌─────────────────────────────────────────────────────────────┐
│                    REPORTES Y DENUNCIAS                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filtros:                                                    │
│  [Tipo ▼] [Estado ▼] [Prioridad ▼] [Asignado a ▼]         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🔴 ALTA │ Usuario inapropiado                      │     │
│  │ ID: #1234 │ Reportado por: María García           │     │
│  │ Contra: Juan Pérez │ Hace 2 horas                 │     │
│  │ Estado: Pendiente │ Sin asignar                    │     │
│  │ [Ver Detalles] [Asignar] [Resolver]               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🟡 MEDIA │ Sede con información falsa              │     │
│  │ ID: #1233 │ Reportado por: Carlos López            │     │
│  │ Contra: Deportivo Central │ Hace 1 día             │     │
│  │ Estado: En revisión │ Asignado a: Admin2          │     │
│  │ [Ver Detalles] [Resolver]                          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Mostrando reportes pendientes: 45                          │
│  Paginación: < 1 2 3 >                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Detalle de Reporte

```
┌─────────────────────────────────────────────────────────────┐
│                     DETALLE DE REPORTE                       │
│                          #1234                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🚩 INFORMACIÓN DEL REPORTE                                  │
│  Tipo: Usuario inapropiado                                  │
│  Prioridad: 🔴 ALTA                                         │
│  Estado: Pendiente                                          │
│  Creado: 09/11/2025 08:30 AM                               │
│  Asignado a: Sin asignar [Asignarme]                       │
│                                                              │
│  👤 REPORTANTE                                               │
│  María García (@mariagarcia)                                │
│  maria@email.com                                            │
│  Cliente desde: 20/10/2025                                  │
│  Reportes previos: 0                                        │
│  [Ver perfil]                                               │
│                                                              │
│  🎯 REPORTADO                                                │
│  Juan Pérez (@juanperez)                                    │
│  juan@email.com                                             │
│  GERENTE_VERIFICADO                                         │
│  Reportes recibidos: 3 (2 resueltos, 1 pendiente)          │
│  [Ver perfil]                                               │
│                                                              │
│  📝 DESCRIPCIÓN                                              │
│  "Este usuario me envió mensajes inapropiados después      │
│  de realizar una reserva en su cancha. Adjunto capturas    │
│  de pantalla como evidencia."                               │
│                                                              │
│  📎 EVIDENCIA                                                │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ Captura 1    │ Captura 2    │ Captura 3    │            │
│  │ [Ver imagen] │ [Ver imagen] │ [Ver imagen] │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                              │
│  🔍 INVESTIGACIÓN                                            │
│  [Ver conversaciones entre usuarios]                        │
│  [Ver historial de interacciones]                          │
│  [Revisar otras denuncias del reportado]                   │
│                                                              │
│  📝 NOTAS INTERNAS                                           │
│  [Área para notas del admin durante la investigación]      │
│                                                              │
│  💬 TIMELINE DE ACCIONES                                     │
│  • 09/11 08:30 - Reporte creado                            │
│  • 09/11 09:15 - Asignado a Admin1                         │
│  • 09/11 10:00 - Estado: En revisión                       │
│                                                              │
│  🎯 ACCIONES                                                 │
│  ┌──────────────────┬──────────────────┬─────────────┐     │
│  │ ⚠️ Advertir      │ ⏸️ Suspender     │ 🚫 Banear   │     │
│  │    Usuario       │   Usuario        │   Usuario   │     │
│  └──────────────────┴──────────────────┴─────────────┘     │
│  ┌──────────────────┬──────────────────┬─────────────┐     │
│  │ ✅ Resolver      │ ❌ Rechazar      │ 🔀 Derivar  │     │
│  │    (Fundado)     │   (Infundado)    │   Reporte   │     │
│  └──────────────────┴──────────────────┴─────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tabla de BD: `Denuncia` Esto en realidad es denuncia y se puede hacer despues de una reserva completaEn

```
Campos necesarios:
- tipoEntidadReportada (enum: USUARIO, SEDE, CANCHA, RESENA)
- idEntidadReportada (int)
- tipoReporte (enum: FRAUDE, CONTENIDO_INAPROPIADO, SPAM, INFORMACION_FALSA, OTRO)
- prioridad (enum: BAJA, MEDIA, ALTA, CRITICA)
- descripcion (text)
- evidenciaUrls (json array de URLs)

- estado (enum: PENDIENTE, EN_REVISION, RESUELTO, RECHAZADO, CERRADO)
- asignadoA (FK a Usuario Admin, nullable)
- fechaCreacion (timestamp)
- fechaAsignacion (timestamp, nullable)
- fechaResolucion (timestamp, nullable)

- accionTomada (enum: NINGUNA, ADVERTENCIA, SUSPENSION, BANEO, ELIMINACION_CONTENIDO)
- motivoResolucion (text, nullable)
- notasInternas (text)

- ipReportante (varchar 45)
```

### Endpoints de Reportes

```
GET /api/admin/reportes
Query: ?tipo=&estado=&prioridad=&asignadoA=&page=1
Response: { reportes[], total, estadisticas }

GET /api/admin/reportes/:id
Response: {
  reporte: { info completa },
  reportante: { datos del usuario },
  reportado: { datos de la entidad },
  historial: { acciones realizadas },
  reportesSimilares: { otros reportes relacionados }
}

POST /api/admin/reportes/:id/asignar
Body: { idAdmin }
Response: { mensaje, reporteActualizado }

PUT /api/admin/reportes/:id/cambiar-estado
Body: { nuevoEstado, notas }
Response: { mensaje }

PUT /api/admin/reportes/:id/cambiar-prioridad
Body: { nuevaPrioridad, motivo }
Response: { mensaje }

POST /api/admin/reportes/:id/tomar-accion
Body: {
  accion: 'ADVERTENCIA' | 'SUSPENSION' | 'BANEO',
  duracion?: number, // para suspensión
  motivo: string,
  notificarUsuario: boolean
}
Response: { mensaje, accionRegistrada }

PUT /api/admin/reportes/:id/resolver
Body: { 
  resolucion: 'FUNDADO' | 'INFUNDADO',
  motivoResolucion: string,
  accionTomada: string
}
Response: { mensaje }

PUT /api/admin/reportes/:id/rechazar
Body: { motivo }
Response: { mensaje }

POST /api/admin/reportes/:id/nota
Body: { contenido }
Response: { notaCreada }

GET /api/admin/reportes/estadisticas
Response: {
  total,
  pendientes,
  enRevision,
  resueltos,
  porTipo: {},
  porPrioridad: {},
  tiempoPromedioResolucion
}
```

---

## 🏟️ MÓDULO 5: GESTIÓN DE SEDES Y CANCHAS

### 5.1 Lista de Todas las Sedes

```
┌─────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE SEDES                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filtros:                                                    │
│  [Estado ▼] [Ciudad ▼] [Dueño ▼] [Verificada ▼] [Buscar...]│
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🏟️ Deportivo Central                               │     │
│  │ ✅ Verificada │ Guadalajara, Jalisco               │     │
│  │ Dueño: Juan Pérez │ 8 canchas │ ★ 4.8 (234)       │     │
│  │ 1,234 reservas totales │ Creada: 20/10/2025        │     │
│  │ [Ver Detalles] [Editar] [Desactivar]               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🏟️ Arena 5x5                                       │     │
│  │ 🟡 Pendiente verificación │ Zapopan, Jalisco       │     │
│  │ Dueño: María López │ 3 canchas │ Sin reseñas       │     │
│  │ 0 reservas │ Creada: 08/11/2025                    │     │
│  │ [Ver Detalles] [Verificar] [Editar]               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Endpoints de Gestión de Sedes

```
GET /api/admin/sedes
Query: ?estado=&ciudad=&verificada=&buscar=&page=1
Response: { sedes[], total }

GET /api/admin/sedes/:id
Response: { 
  sede: { info completa },
  dueno: { datos del dueño },
  canchas: { lista de canchas },
  estadisticas: { reservas, ingresos, etc },
  historial: { cambios realizados }
}

PUT /api/admin/sedes/:id/editar
Body: { campos a editar }
Response: { mensaje, sedeActualizada }

PUT /api/admin/sedes/:id/desactivar
Body: { motivo, temporal }
Response: { mensaje }

PUT /api/admin/sedes/:id/reactivar
Response: { mensaje }

DELETE /api/admin/sedes/:id
Body: { motivo, confirmacion }
Response: { mensaje }

GET /api/admin/sedes/estadisticas
Response: {
  total,
  verificadas,
  pendientes,
  activas,
  inactivas,
  porCiudad: {},
  promedioReservasPorSede
}
```

### 5.2 Gestión de Canchas

```
GET /api/admin/canchas
Query: ?deporte=&sede=&estado=&page=1
Response: { canchas[], total }

GET /api/admin/canchas/:id
Response: { cancha completa con estadísticas }

PUT /api/admin/canchas/:id/editar
Body: { campos a editar }
Response: { mensaje, canchaActualizada }

PUT /api/admin/canchas/:id/desactivar
Body: { motivo }
Response: { mensaje }

DELETE /api/admin/canchas/:id
Body: { motivo, confirmacion }
Response: { mensaje }
```

---

## 🎨 MÓDULO 6: MODERACIÓN DE CONTENIDO

### 6.1 Gestión de Reseñas

```
┌─────────────────────────────────────────────────────────────┐
│                  MODERACIÓN DE RESEÑAS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Tabs: [Reportadas (12)] [Todas] [Pendientes]              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ ⚠️ Reseña reportada                                │     │
│  │ ★★★★★ 1/5 │ Por: Carlos López                     │     │
│  │ En: Deportivo Central - Cancha 1                   │     │
│  │ "Esta cancha es horrible, todo está roto..."       │     │
│  │ Reportada por: Juan Pérez (dueño)                  │     │
│  │ Motivo: Lenguaje ofensivo                          │     │
│  │ [Ver completa] [Eliminar] [Mantener] [Editar]     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Endpoints de Moderación

```
GET /api/admin/resenas/reportadas
Query: ?page=1&limit=20
Response: { resenas[], total }

DELETE /api/admin/resenas/:id
Body: { motivo, notificarUsuario }
Response: { mensaje }

PUT /api/admin/resenas/:id/editar
Body: { comentarioEditado, motivoEdicion }
Response: { mensaje, resenaActualizada }

PUT /api/admin/resenas/:id/aprobar
Response: { mensaje }

GET /api/admin/fotos/reportadas
Response: { fotos reportadas de sedes/canchas }

DELETE /api/admin/fotos/:id
Body: { motivo }
Response: { mensaje }
```

---

## 📊 MÓDULO 7: ANALYTICS Y REPORTES DEL SISTEMA

### Vista de Analytics

```
┌─────────────────────────────────────────────────────────────┐
│                  ANALYTICS DEL SISTEMA                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Período: [Últimos 30 días ▼]                               │
│                                                              │
│  📈 CRECIMIENTO                                              │
│  ┌──────────────────────┬──────────────────────┐            │
│  │ Usuarios             │ Sedes                │            │
│  │ [Gráfico de línea]   │ [Gráfico de línea]   │            │
│  │ +23% vs mes anterior │ +15% vs mes anterior │            │
│  └──────────────────────┴──────────────────────┘            │
│                                                              │
│  💰 INGRESOS                                                 │
│  ┌──────────────────────────────────────────────┐           │
│  │ Ingresos totales: $1,234,567 MXN             │           │
│  │ [Gráfico de barras por día]                  │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  🗺️ DISTRIBUCIÓN GEOGRÁFICA                                 │
│  ┌──────────────────────────────────────────────┐           │
│  │ [Mapa de calor con sedes por ciudad]         │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  🏆 TOP RANKINGS                                             │
│  • Sedes más populares                                      │
│  • Deportes más reservados                                  │
│  • Ciudades con más actividad                              │
│  • Horarios pico                                            │
│                                                              │
│  [Exportar Reporte PDF] [Exportar Excel]                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Endpoints de Analytics

```
GET /api/admin/analytics/crecimiento
Query: ?periodo=30d&tipo=usuarios
Response: { fechas[], valores[], porcentajeCambio }

GET /api/admin/analytics/ingresos
Query: ?periodo=30d
Response: { 
  total,
  porDia: [],
  porSede: [],
  porDeporte: []
}

GET /api/admin/analytics/distribucion-geografica
Response: { 
  ciudades: [{ nombre, sedes, usuarios, reservas }]
}

GET /api/admin/analytics/rankings
Query: ?tipo=sedes&limite=10
Response: { ranking[] }

GET /api/admin/analytics/horarios-pico
Query: ?periodo=30d
Response: { horasPico[], diasPico[] }

POST /api/admin/analytics/exportar
Body: { tipo: 'PDF' | 'EXCEL', periodo, incluir: [] }
Response: { url del archivo generado }
```

---

## ⚙️ MÓDULO 8: CONFIGURACIÓN DEL SISTEMA

### Panel de Configuración

```
┌─────────────────────────────────────────────────────────────┐
│                CONFIGURACIÓN DEL SISTEMA                     │
│                    (Solo Super Admin)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🏷️ CATEGORÍAS Y DEPORTES                                    │
│  • Fútbol [Editar] [Eliminar]                              │
│  • Basquetbol [Editar] [Eliminar]                          │
│  • Tenis [Editar] [Eliminar]                               │
│  [+ Agregar nuevo deporte]                                  │
│                                                              │
│  🎨 TIPOS DE SUPERFICIE                                      │
│  • Césped sintético [Editar]                               │
│  • Cemento [Editar]                                         │
│  • Duela [Editar]                                           │
│  [+ Agregar nuevo tipo]                                     │
│                                                              │
│  💰 COMISIONES Y TARIFAS                                     │
│  Comisión por reserva: [5%]                                 │
│  Mínimo por transacción: [$10 MXN]                         │
│  [Guardar cambios]                                          │
│                                                              │
│  📜 POLÍTICAS                                                │
│  [Editar Términos y Condiciones]                           │
│  [Editar Política de Privacidad]                           │
│  [Editar Política de Cancelación]                          │
│                                                              │
│  👥 GESTIÓN DE ADMINISTRADORES                               │
│  Lista de admins actuales:                                  │
│  • Admin1 (SUPER_ADMIN) - tú                               │
│  • Admin2 (ADMIN)                                           │
│  [+ Crear nuevo administrador]                              │
│                                                              │
│  🔧 MANTENIMIENTO                                            │
│  [Limpiar caché]                                            │
│  [Ver logs del sistema]                                     │
│  [Backup de base de datos]                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Endpoints de Configuración

```
GET /api/admin/configuracion/deportes
Response: { deportes[] }

POST /api/admin/configuracion/deportes
Body: { nombre, icono }
Response: { deporteCreado }

PUT /api/admin/configuracion/deportes/:id
Body: { nombre, icono }
Response: { deporteActualizado }

DELETE /api/admin/configuracion/deportes/:id
Response: { mensaje }

GET /api/admin/configuracion/comisiones
Response: { porcentaje, minimo }

PUT /api/admin/configuracion/comisiones
Body: { porcentaje, minimo }
Response: { mensaje }

GET /api/admin/configuracion/administradores
Response: { admins[] }

POST /api/admin/configuracion/administradores
Body: { email, nombre, rol }
Response: { adminCreado }

DELETE /api/admin/configuracion/administradores/:id
Body: { confirmacion }
Response: { mensaje }
```

---

## 🔐 SISTEMA DE PERMISOS

### Matriz de Permisos

```
Acción                          | ADMIN | SUPER_ADMIN
─────────────────────────────────┼───────┼─────────────
Ver dashboard                    |   ✅   |     ✅
Gestionar verificaciones         |   ✅   |     ✅
Gestionar usuarios               |   ✅   |     ✅
Cambiar roles a Admin            |   ❌   |     ✅
Gestionar reportes               |   ✅   |     ✅
Moderar contenido                |   ✅   |     ✅
Gestionar sedes/canchas          |   ✅   |     ✅
Ver analytics                    |   ✅   |     ✅
Configuración del sistema        |   ❌   |     ✅
Crear/eliminar admins            |   ❌   |     ✅
Ver logs del sistema             |   ⚠️   |     ✅
Backup de BD                     |   ❌   |     ✅
```

### Middleware de Verificación

```
Cada endpoint del panel admin debe:
1. Verificar que el usuario está autenticado
2. Verificar que tiene rol ADMIN o SUPER_ADMIN
3. Para acciones sensibles, verificar SUPER_ADMIN
4. Registrar la acción en logs de auditoría
```

---

## 📝 LOGS Y AUDITORÍA

### Tabla: `AdminLogs`

```
Campos:
- idLog (PK)
- idAdmin (FK a Usuario)
- accion (enum: APROBAR_VERIFICACION, RECHAZAR, SUSPENDER_USUARIO, etc)
- entidadTipo (enum: USUARIO, SEDE, CANCHA, REPORTE)
- idEntidad (int)
- detalles (json con info de la acción)
- ipAddress (varchar 45)
- userAgent (text)
- fechaHora (timestamp)
```

### Endpoint de Logs

```
GET /api/admin/logs
Query: ?admin=&accion=&desde=&hasta=&page=1
Response: { logs[], total }

GET /api/admin/logs/mi-actividad
Response: { logs de mis acciones }

GET /api/admin/logs/estadisticas
Response: {
  accionesPorAdmin: {},
  accionesPorTipo: {},
  accionesPorDia: []
}
```

---

## 🎨 COMPONENTES FRONTEND NECESARIOS

### Páginas Principales

- `/admin` - Dashboard principal
- `/admin/verificaciones` - Gestión de verificaciones
- `/admin/usuarios` - Gestión de usuarios
- `/admin/reportes` - Gestión de reportes
- `/admin/sedes` - Gestión de sedes
- `/admin/canchas` - Gestión de canchas
- `/admin/moderacion` - Moderación de contenido
- `/admin/analytics` - Analytics del sistema
- `/admin/configuracion` - Configuración (Super Admin)
- `/admin/logs` - Logs de auditoría

### Componentes Reutilizables

- `AdminLayout` - Layout con sidebar
- `AdminSidebar` - Menú lateral
- `StatsCard` - Card de métricas
- `AlertsPanel` - Panel de alertas
- `DataTable` - Tabla con filtros y paginación
- `UserCard` - Card de usuario
- `ReportCard` - Card de reporte
- `VenueCard` - Card de sede
- `DocumentViewer` - Visor de documentos
- `ActionModal` - Modal para acciones
- `ConfirmationDialog` - Diálogo de confirmación
- `FilterBar` - Barra de filtros
- `SearchBar` - Barra de búsqueda
- `Pagination` - Paginación
- `Chart` - Componente de gráficos
- `ActivityTimeline` - Timeline de actividades

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1 - Backend
- Crear endpoints del dashboard
- Endpoints de gestión de usuarios
- Endpoints de reportes
- Sistema de logs

### Semana 2 - Frontend Base
- Layout del admin panel
- Dashboard principal
- Gestión de usuarios
- Gestión de verificaciones

### Semana 3 - Funcionalidades Avanzadas
- Gestión de reportes
- Moderación de contenido
- Analytics
- Configuración del sistema

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Endpoints del dashboard
- [ ] Endpoints de gestión de usuarios
- [ ] Endpoints de gestión de reportes
- [ ] Endpoints de moderación
- [ ] Endpoints de analytics
- [ ] Endpoints de configuración
- [ ] Sistema de logs y auditoría
- [ ] Middleware de permisos
- [ ] Testing de endpoints

### Frontend
- [ ] Layout del admin panel
- [ ] Dashboard principal
- [ ] Gestión de verificaciones (integrar con SISTEMA_VERIFICACION)
- [ ] Gestión de usuarios
- [ ] Gestión de reportes
- [ ] Gestión de sedes y canchas
- [ ] Moderación de reseñas
- [ ] Analytics y reportes
- [ ] Configuración del sistema
- [ ] Logs de auditoría

### Integraciones
- [ ] Protección de rutas
- [ ] Sistema de permisos
- [ ] Notificaciones a admins
- [ ] Exportación de reportes
- [ ] Testing end-to-end

---

**FIN DEL DOCUMENTO**
