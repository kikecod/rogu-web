# Integración de la API de Canchas con la Página de Inicio

## Resumen de Cambios

Se ha integrado exitosamente la API del backend con la página de inicio del frontend para mostrar las canchas disponibles obtenidas del endpoint `http://localhost:3000/api/cancha`.

## Archivos Modificados y Creados

### 1. **src/types/index.ts**
- ✅ Se agregaron nuevas interfaces para los datos de la API:
  - `ApiFoto`: Representa una foto de cancha del backend
  - `ApiCancha`: Representa la estructura completa de una cancha del backend
- ✅ Se extendió la interfaz `SportField` para incluir campos opcionales (`location`, `owner`)

### 2. **src/config/api.ts** (Nuevo archivo)
- ✅ Centraliza la configuración de la API
- ✅ Define la URL base del backend (configurable con variable de entorno)
- ✅ Proporciona helpers para construir URLs:
  - `getApiUrl()`: Construye URLs completas de endpoints
  - `getImageUrl()`: Construye URLs completas de imágenes

### 3. **src/utils/helpers.ts**
- ✅ Se agregaron funciones de mapeo:
  - `mapSuperficieToSport()`: Convierte el tipo de superficie a tipo de deporte
  - `mapSuperficieToAmenities()`: Extrae amenidades de los datos de la cancha
  - `convertApiCanchaToSportField()`: Convierte datos de API a formato interno
- ✅ Se agregó función principal:
  - `fetchCanchas()`: Obtiene todas las canchas desde la API y las filtra por disponibilidad

### 4. **src/pages/HomePage.tsx**
- ✅ Implementación de carga de datos con React hooks:
  - `useEffect`: Carga canchas al montar el componente
  - `useState`: Manejo de estados (canchas, loading, error)
- ✅ Estados de UI mejorados:
  - Indicador de carga (spinner)
  - Mensaje de error con estilo
  - Mensaje cuando no hay canchas disponibles
- ✅ Filtros funcionan con datos reales del backend

### 5. **src/components/SportFieldCard.tsx**
- ✅ Mejoras en el manejo de datos:
  - Validación de campos opcionales (location, reviews)
  - Manejo de errores de carga de imágenes
  - Función `getSportLabel()`: Traduce nombres de deportes al español
  - Fallback a placeholder si la imagen no carga

### 6. **.env.example** (Nuevo archivo)
- ✅ Documenta las variables de entorno necesarias
- ✅ Define `VITE_API_BASE_URL` para configurar la URL del backend

## Características Implementadas

### 🎯 Funcionalidades Principales

1. **Carga Automática de Datos**
   - Las canchas se cargan automáticamente al abrir la página
   - No requiere autenticación (acceso público)

2. **Mapeo Inteligente**
   - Superficie → Tipo de deporte (fútbol, básquetbol, tenis, etc.)
   - Extracción automática de amenidades basadas en los datos
   - Conversión de precios de string a número

3. **Manejo de Imágenes**
   - Muestra fotos reales del backend si están disponibles
   - Fallback a imágenes por defecto según el tipo de deporte
   - Manejo de errores de carga de imágenes

4. **Filtrado de Canchas**
   - Solo muestra canchas con estado "Disponible"
   - Excluye canchas eliminadas (eliminadoEn !== null)

5. **Estados de UI**
   - Loading: Spinner animado mientras carga
   - Error: Mensaje amigable si falla la carga
   - Empty: Mensaje cuando no hay canchas disponibles

### 🔄 Flujo de Datos

```
Backend API (localhost:3000/api/cancha)
    ↓
fetchCanchas() - Obtiene datos
    ↓
convertApiCanchaToSportField() - Transforma datos
    ↓
SportField[] - Formato interno
    ↓
HomePage - Renderiza con filtros
    ↓
SportFieldCard - Muestra cada cancha
```

## Configuración del Backend

La aplicación espera que el backend esté corriendo en:
```
http://localhost:3000/api
```

Para cambiar esta URL, crear un archivo `.env` en la raíz del proyecto:
```bash
VITE_API_BASE_URL=http://tu-servidor:puerto/api
```

## Estructura de Datos Esperada

El endpoint `/api/cancha` debe devolver un array de objetos con esta estructura:

```json
[
  {
    "id_cancha": 1,
    "id_Sede": 1,
    "nombre": "Nombre de la Cancha",
    "superficie": "Parquet",
    "cubierta": true,
    "aforoMax": 12,
    "dimensiones": "40 x 20",
    "reglasUso": "Reglas de uso",
    "iluminacion": "Halógena",
    "estado": "Disponible",
    "precio": "20.00",
    "creado_en": "2025-10-07T12:30:56.202Z",
    "actualizado_en": "2025-10-07T12:30:56.202Z",
    "eliminadoEn": null,
    "parte": [],
    "fotos": [
      {
        "idFoto": 5,
        "id_cancha": 1,
        "urlFoto": "/uploads/img_1759843074551.jpg"
      }
    ],
    "reservas": []
  }
]
```

## Mejoras Implementadas

### 🎨 UI/UX
- Spinner de carga animado
- Mensajes de error amigables
- Manejo graceful de datos faltantes
- Responsive en todos los tamaños de pantalla

### 🛡️ Robustez
- Validación de campos opcionales
- Fallbacks para imágenes
- Try-catch para manejo de errores
- Filtrado de canchas no disponibles

### 📝 Mantenibilidad
- Código modular y reutilizable
- Configuración centralizada
- Tipos TypeScript completos
- Comentarios descriptivos

## Cómo Probar

1. **Asegúrate de que el backend esté corriendo:**
   ```bash
   # El backend debe estar en http://localhost:3000
   ```

2. **Inicia el frontend:**
   ```bash
   npm run dev
   ```

3. **Abre el navegador:**
   ```
   http://localhost:5173
   ```

4. **Verifica:**
   - Las canchas se cargan automáticamente
   - Las imágenes se muestran correctamente
   - Los filtros funcionan
   - El precio y amenidades se muestran

## Próximos Pasos (Opcional)

- [ ] Implementar paginación para muchas canchas
- [ ] Agregar funcionalidad de búsqueda por texto
- [ ] Implementar filtro por ubicación con mapa
- [ ] Agregar caché de datos para mejorar performance
- [ ] Implementar refresh manual de datos

## Notas Técnicas

- **CORS**: El backend debe tener CORS habilitado para localhost:5173
- **Formato de Imágenes**: Las URLs de imágenes son relativas al backend
- **Estado por Defecto**: Rating 4.5 y 0 reviews (hasta que se implemente en backend)
- **Mapeo de Deportes**: Basado en palabras clave en el campo "superficie"
