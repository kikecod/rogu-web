# 🔄 Sistema Dinámico de Navegación - Canchas

## ✅ Configuración Completa

El sistema está configurado para funcionar **dinámicamente con cualquier ID de cancha**, no solo con un ID específico.

---

## 🎯 Flujo de Navegación Completo

### 1. **Página de Inicio** → `HomePage.tsx`

```typescript
// Usuario ve lista de canchas
const handleFieldClick = (field: SportField) => {
  navigate(`/field/${field.id}`);  // 👈 ID dinámico de la cancha
};
```

**Ejemplo de navegación**:
- Cancha ID 1 → navega a `/field/1`
- Cancha ID 4 → navega a `/field/4`
- Cancha ID 100 → navega a `/field/100`

---

### 2. **Configuración de Rutas** → `App.tsx`

```typescript
<Route path="/field/:id" element={<SportFieldDetailPage />} />
```

El parámetro `:id` es **dinámico** - captura cualquier valor en la URL.

---

### 3. **Página de Detalles** → `SportFieldDetailPage.tsx`

```typescript
const { id } = useParams<{ id: string }>();  // 👈 Obtiene el ID de la URL

useEffect(() => {
  const loadField = async () => {
    if (!id) return;
    
    const fieldData = await fetchCanchaById(id);  // 👈 Usa el ID dinámico
    setField(fieldData);
  };
  
  loadField();
}, [id]);  // 👈 Se recarga si cambia el ID
```

---

### 4. **Función de Fetch** → `helpers.ts`

```typescript
export const fetchCanchaById = async (id: string): Promise<SportField> => {
  // 1. GET /api/cancha/:id  👈 ID dinámico
  const canchaResponse = await fetch(getApiUrl(`/cancha/${id}`));
  
  // 2. GET /api/reservas/cancha/:id  👈 ID dinámico
  const reservasResponse = await fetch(getApiUrl(`/reservas/cancha/${id}`));
  
  // 3. GET /api/califica-cancha/cancha/:id  👈 ID dinámico
  const resenasResponse = await fetch(getApiUrl(`/califica-cancha/cancha/${id}`));
  
  // Convierte y retorna los datos
  return convertApiCanchaDetalleToSportField(canchaData, reservasData, resenasData);
};
```

---

## 📊 Ejemplos de Uso Real

### Ejemplo 1: Usuario navega desde HomePage

```
1. Usuario ve cancha "Wally 1" (ID: 1)
2. Hace clic en la card
3. handleFieldClick(field) → navigate('/field/1')
4. SportFieldDetailPage obtiene id = "1" de la URL
5. fetchCanchaById("1") llama a:
   - GET /api/cancha/1
   - GET /api/reservas/cancha/1
   - GET /api/califica-cancha/cancha/1
6. Muestra los datos de la cancha ID 1
```

### Ejemplo 2: Usuario navega directamente por URL

```
1. Usuario escribe en navegador: http://localhost:5173/field/25
2. SportFieldDetailPage obtiene id = "25" de la URL
3. fetchCanchaById("25") llama a:
   - GET /api/cancha/25
   - GET /api/reservas/cancha/25
   - GET /api/califica-cancha/cancha/25
4. Muestra los datos de la cancha ID 25
```

### Ejemplo 3: Usuario cambia de cancha

```
1. Usuario está en /field/5
2. Navega a otra cancha desde un link relacionado
3. URL cambia a /field/10
4. useEffect detecta cambio de ID (dependencia: [id])
5. Se recarga automáticamente con datos de cancha ID 10
```

---

## 🔍 Verificación en Logs de Consola

Al navegar a cualquier cancha, verás:

```javascript
🔍 Cargando cancha con ID: 1     // ← ID dinámico
✅ Cancha obtenida: { id_cancha: 1, nombre: "Wally 1", ... }
✅ Reservas obtenidas: [...]
✅ Reseñas obtenidas: [...]
```

Si navegas a otra cancha:

```javascript
🔍 Cargando cancha con ID: 4     // ← ID cambió dinámicamente
✅ Cancha obtenida: { id_cancha: 4, nombre: "Cancha Central", ... }
✅ Reservas obtenidas: [...]
✅ Reseñas obtenidas: [...]
```

---

## 🧪 Cómo Probarlo

### Opción 1: Navegación desde HomePage
```
1. Ve a http://localhost:5173
2. Haz clic en CUALQUIER cancha
3. Se abrirá /field/{ID_DE_ESA_CANCHA}
4. Verás los datos específicos de esa cancha
```

### Opción 2: URL Directa
```
Prueba estas URLs directamente:
- http://localhost:5173/field/1
- http://localhost:5173/field/2
- http://localhost:5173/field/3
- http://localhost:5173/field/4
- http://localhost:5173/field/999  (probará con ID que no existe)
```

### Opción 3: Cambio de Cancha
```
1. Ve a /field/1
2. Abre otra pestaña con /field/2
3. Cada una mostrará datos diferentes
```

---

## ⚙️ Configuración de IDs en el Sistema

### HomePage - Conversión de API a ID
```typescript
// En helpers.ts - convertApiCanchaToSportField
return {
  id: apiCancha.id_cancha.toString(),  // 👈 Convierte número a string
  sedeId: apiCancha.id_Sede.toString(),
  // ... resto de campos
};
```

**Ejemplo**:
```json
API Backend: { "id_cancha": 4 }
   ↓
Frontend: { "id": "4" }
   ↓
URL: /field/4
   ↓
useParams: { id: "4" }
   ↓
fetchCanchaById("4")
```

---

## 🎯 Puntos Clave

### ✅ Ventajas del Sistema Dinámico

1. **Escalable**: Funciona con cualquier cantidad de canchas
2. **Flexible**: No necesitas crear rutas para cada cancha
3. **SEO-Friendly**: URLs únicas para cada cancha
4. **Navegable**: Usuarios pueden compartir links directos
5. **Reactivo**: Se actualiza automáticamente al cambiar el ID

### ✅ Qué hace el sistema automáticamente

- 🔄 Detecta el ID de la URL
- 🔄 Carga datos específicos de esa cancha
- 🔄 Maneja errores si el ID no existe
- 🔄 Se recarga si el ID cambia
- 🔄 Limpia estados al cambiar de cancha

---

## 🛡️ Manejo de Errores

### ID Inválido o No Existente
```typescript
// Si el backend devuelve error 404:
try {
  const fieldData = await fetchCanchaById(id);
} catch (err) {
  setError('Cancha no encontrada');
  // Muestra pantalla de error con botón para volver
}
```

**UI de Error**:
```
😞
Cancha no encontrada
No se pudo cargar la información de esta cancha

[Volver al inicio]
```

---

## 📝 Resumen

| Componente | Función | ID Usado |
|------------|---------|----------|
| `HomePage` | Lista canchas y navega | `field.id` (dinámico) |
| `App.tsx` | Define ruta con parámetro | `:id` (comodín) |
| `SportFieldDetailPage` | Obtiene ID de URL | `useParams()` |
| `fetchCanchaById` | Llama APIs con ID | Parámetro dinámico |
| Backend APIs | Responden según ID | ID en la URL |

---

## 🎉 Conclusión

El sistema ya está **100% dinámico** y funciona para:
- ✅ Cualquier ID de cancha existente
- ✅ Navegación desde la lista de canchas
- ✅ URLs directas
- ✅ Cambio entre canchas
- ✅ Manejo de IDs inexistentes

**No necesitas hacer nada más** - el sistema ya maneja automáticamente todos los IDs de canchas que vengan del backend.
