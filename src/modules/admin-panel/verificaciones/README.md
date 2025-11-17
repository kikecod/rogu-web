# Módulo de Verificaciones - Panel Admin

## 📋 Descripción

Módulo del panel de administración para gestionar la verificación de licencias de funcionamiento de sedes pendientes. Permite a los administradores revisar las licencias y aprobar o rechazar sedes.

## 🎯 Funcionalidades

- ✅ Lista de sedes pendientes de verificación (`verificada: false`)
- 👁️ Visualización de licencias de funcionamiento
- ✔️ Aprobación de sedes con un click
- 📊 Dashboard con estadísticas de verificaciones
- 🔄 Recarga manual de datos
- 📱 Diseño responsive

## 📁 Estructura

```
verificaciones/
├── components/
│   └── SedeVerificacionCard.tsx    # Card individual de sede pendiente
├── hooks/
│   └── useVerificaciones.ts        # Hook para gestión de estado
├── pages/
│   └── VerificacionesPage.tsx      # Página principal
├── services/
│   └── verificaciones.service.ts   # Servicio API
├── index.ts                        # Exports públicos
└── README.md
```

## 🔌 API Endpoints

### GET /api/sede?verificada=false
Obtiene todas las sedes pendientes de verificación.

**Response:**
```json
{
  "sedes": [
    {
      "idSede": 1,
      "nombre": "Sede Ejemplo",
      "direccion": "Av. Principal 123",
      "ciudad": "La Paz",
      "licenciaFuncionamiento": "uploads/licencias/...",
      "nombreDuenio": "Juan Pérez",
      "emailDuenio": "juan@example.com",
      "telefonoDuenio": "70123456",
      "fechaCreacion": "2024-01-15T10:00:00Z",
      "verificada": false
    }
  ],
  "total": 1
}
```

### PATCH /api/sede/{id}/verificar
Marca una sede como verificada.

**Response:**
```json
{
  "mensaje": "Sede verificada exitosamente"
}
```

### GET /uploads/{licenciaPath}
Obtiene la imagen de la licencia de funcionamiento.

## 💻 Uso

### En App.tsx

```tsx
import { VerificacionesPage } from '@/admin-panel/verificaciones';

// Ruta protegida solo para ADMIN
<Route
  path={ROUTES.admin.verificaciones}
  element={
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <AdminLayout>
        <VerificacionesPage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
```

### Hook useVerificaciones

```tsx
import { useVerificaciones } from '@/admin-panel/verificaciones';

const MyComponent = () => {
  const { 
    sedes,           // Sedes pendientes
    loading,         // Estado de carga
    error,           // Mensaje de error
    verificando,     // ID de sede en proceso
    verificarSede,   // Función para verificar
    recargar         // Función para recargar datos
  } = useVerificaciones();

  const handleVerificar = async (idSede: number) => {
    await verificarSede(idSede);
  };

  return (
    <div>
      {sedes.map(sede => (
        <button onClick={() => handleVerificar(sede.idSede)}>
          Verificar {sede.nombre}
        </button>
      ))}
    </div>
  );
};
```

### Servicio de Verificaciones

```tsx
import { verificacionesService } from '@/admin-panel/verificaciones';

// Obtener sedes pendientes
const data = await verificacionesService.getPendientes();

// Verificar sede
await verificacionesService.verificarSede(idSede);

// Obtener URL de licencia
const url = verificacionesService.getLicenciaUrl(licenciaPath);
```

## 🎨 Componentes

### SedeVerificacionCard

Card que muestra información de una sede pendiente con:
- Nombre y ubicación de la sede
- Datos del dueño (nombre, email, teléfono)
- Fecha de registro
- Botón para ver licencia (modal)
- Botón para verificar

**Props:**
```tsx
interface SedeVerificacionCardProps {
  sede: SedeVerificacion;           // Datos de la sede
  onVerificar: (id: number) => Promise<void>;  // Callback al verificar
  verificando: boolean;             // Estado de verificación en progreso
}
```

### VerificacionesPage

Página principal con:
- Header con título y botón de recarga
- Dashboard de estadísticas (3 cards)
- Grid de sedes pendientes
- Estado vacío cuando no hay pendientes
- Manejo de errores

## 🔐 Seguridad

- Ruta protegida solo para rol **ADMIN**
- Validación de permisos en backend
- Confirmación antes de verificar

## 🎯 Flujo de Trabajo

1. **Admin accede** a `/admin/verificaciones`
2. **Sistema carga** sedes con `verificada: false`
3. **Admin revisa** información y licencia de cada sede
4. **Admin hace click** en "Ver Licencia" para revisar documento
5. **Admin hace click** en "Verificar" si aprueba
6. **Sistema confirma** acción con modal
7. **Backend actualiza** `verificada: true`
8. **Frontend recarga** lista automáticamente
9. **Sede desaparece** de pendientes

## 📊 Estados

### Loading
```tsx
<div className="animate-spin">Cargando...</div>
```

### Error
```tsx
<div className="bg-red-50">
  Error: {error}
  <button onClick={recargar}>Reintentar</button>
</div>
```

### Vacío
```tsx
<div className="text-center">
  ¡Todo al día! No hay sedes pendientes.
</div>
```

### Con Datos
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {sedes.map(sede => <SedeVerificacionCard ... />)}
</div>
```

## 🚀 Mejoras Futuras

- [ ] Filtros por ciudad, fecha
- [ ] Búsqueda por nombre de sede o dueño
- [ ] Paginación para grandes volúmenes
- [ ] Historial de verificaciones
- [ ] Opción de rechazar con motivo
- [ ] Notificaciones al dueño
- [ ] Exportar reporte de verificaciones
- [ ] Vista previa de documentos PDF

## 📝 Notas

- Las sedes verificadas automáticamente se ocultan del público hasta aprobación
- El campo `verificada` es requerido en el modelo Sede
- La licencia debe estar en formato imagen (JPG, PNG)
- El path de licencia se almacena con prefijo `uploads/`
