# Arquitectura de Servicios - Frontend

## Resumen

Se ha reestructurado el frontend para implementar una arquitectura de servicios que separa correctamente las responsabilidades y mejora la mantenibilidad del código.

## Estructura de Carpetas

```
src/
├── services/           # Servicios HTTP y lógica de negocio
│   ├── http-client.ts  # Cliente HTTP base con interceptores
│   ├── cancha.service.ts # Servicio específico para canchas
│   ├── sede.service.ts # Servicio específico para sedes
│   ├── reserva.service.ts # Servicio específico para reservas
│   ├── error-handler.ts # Manejo centralizado de errores
│   └── index.ts        # Punto de entrada para servicios
├── types/              # Definiciones de tipos TypeScript
│   ├── cancha.types.ts # Tipos específicos para canchas
│   ├── sede.types.ts   # Tipos específicos para sedes
│   ├── reserva.types.ts # Tipos específicos para reservas
│   └── index.ts        # Exportación de todos los tipos
├── config/             # Configuración centralizada
│   └── api.ts          # Configuración de endpoints y URLs
└── components/         # Componentes React (sin lógica HTTP directa)
```

## Principios Implementados

### 1. Separación de Responsabilidades
- **Componentes React**: Solo se encargan de la UI y el estado local
- **Servicios**: Manejan todas las llamadas HTTP y lógica de negocio
- **Tipos**: Definen interfaces y contratos de datos
- **Configuración**: Centraliza URLs, endpoints y configuraciones

### 2. Cliente HTTP Centralizado
- Manejo automático de autenticación (tokens JWT)
- Interceptores para errores comunes (401, 403, 500, etc.)
- Timeout configurable
- Manejo de errores consistente
- Soporte para upload de archivos

### 3. Servicios Especializados
- **CanchaService**: CRUD de canchas, gestión de disciplinas y fotos
- **SedeService**: CRUD de sedes
- **ReservaService**: CRUD de reservas y disponibilidad
- Métodos tipados con TypeScript
- Manejo de errores integrado

### 4. Manejo de Errores Robusto
- ErrorHandler centralizado
- Mensajes de error legibles para el usuario
- Manejo específico de errores de autenticación
- Hook useErrorHandler para componentes React

## Ventajas de la Nueva Arquitectura

### 🔧 Mantenibilidad
- Código más organizado y fácil de mantener
- Cambios en endpoints centralizados
- Reutilización de lógica entre componentes

### 🚀 Escalabilidad
- Fácil agregar nuevos servicios
- Patrones consistentes para nuevas funcionalidades
- Separación clara de responsabilidades

### 🛡️ Robustez
- Manejo consistente de errores
- Validación de tipos con TypeScript
- Interceptores para casos comunes

### 🧪 Testabilidad
- Servicios fáciles de testear en aislamiento
- Mocking simplificado para pruebas
- Separación de lógica de UI

## Uso en Componentes

### Antes (Acoplado)
```typescript
// Llamada HTTP directa en el componente
const response = await fetch('http://localhost:3000/api/cancha', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
```

### Después (Desacoplado)
```typescript
// Usando servicios
import { canchaService, useErrorHandler } from '../services';

const { handleError } = useErrorHandler();

try {
  const canchas = await canchaService.getAll();
  setCanchas(canchas);
} catch (error) {
  handleError(error, 'Error al cargar canchas');
}
```

## Configuración de Entorno

Las configuraciones se pueden ajustar mediante variables de entorno:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SERVER_URL=http://localhost:3000
```

## Extensibilidad

Para agregar un nuevo servicio:

1. Crear el archivo de tipos en `types/`
2. Crear el servicio en `services/`
3. Exportar en `services/index.ts`
4. Actualizar configuración si es necesario

Ejemplo para un nuevo servicio de usuarios:

```typescript
// types/usuario.types.ts
export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
}

// services/usuario.service.ts
export class UsuarioService {
  private readonly endpoint = '/usuarios';
  
  async getAll(): Promise<Usuario[]> {
    const response = await httpClient.get<Usuario[]>(this.endpoint);
    return response.data;
  }
}

export const usuarioService = new UsuarioService();
```

## Migración Gradual

La arquitectura mantiene compatibilidad con tipos legacy para permitir una migración gradual. Los componentes existentes pueden seguir funcionando mientras se van actualizando progresivamente.

## Recomendaciones

1. **Siempre usar servicios** para llamadas HTTP
2. **Manejar errores** con el ErrorHandler
3. **Tipar correctamente** las interfaces
4. **Centralizar configuraciones** en api.ts
5. **Mantener componentes limpios** sin lógica HTTP directa