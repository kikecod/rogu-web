# Troubleshooting - Imágenes del Backend

## Problema: Las imágenes no cargan desde el backend

### ✅ Solución Implementada

El problema era que las URLs de las imágenes se estaban construyendo incorrectamente:

**Antes (❌ Incorrecto):**
```
http://localhost:3000/api/uploads/img_1759843074551.jpg
```

**Después (✅ Correcto):**
```
http://localhost:3000/uploads/img_1759843074551.jpg
```

### 🔧 Cambios Realizados

1. **src/config/api.ts**
   - Agregado `serverURL` separado de `baseURL`
   - `baseURL` para endpoints de API: `http://localhost:3000/api`
   - `serverURL` para archivos estáticos: `http://localhost:3000`
   - Función `getImageUrl()` ahora usa `serverURL` en lugar de `baseURL`

2. **src/utils/helpers.ts**
   - Agregado console.log para debug de URLs de imágenes
   - Ahora puedes ver en la consola del navegador las URLs que se están construyendo

3. **src/components/SportFieldCard.tsx**
   - Mejorado el manejo de errores con console.error
   - Placeholder mejorado cuando falla la carga de imagen

### 🔍 Cómo Verificar

1. **Abre la consola del navegador** (F12)
2. **Busca los logs:**
   ```
   🖼️ Foto URL: /uploads/img_xxx.jpg → http://localhost:3000/uploads/img_xxx.jpg
   ```
3. **Si ves errores de carga:**
   ```
   ❌ Error al cargar imagen: http://localhost:3000/uploads/img_xxx.jpg
   ```

### ✅ Checklist de Verificación

- [ ] El backend está corriendo en `http://localhost:3000`
- [ ] Las imágenes existen en la carpeta `uploads/` del backend
- [ ] El backend tiene configurado CORS correctamente
- [ ] El backend sirve archivos estáticos desde `/uploads`
- [ ] Las URLs en la consola son correctas (sin `/api` antes de `/uploads`)

### 🛠️ Configuración del Backend (Express.js ejemplo)

Tu backend debe tener algo así para servir archivos estáticos:

```javascript
// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true
}));
```

### 🌐 URLs de Producción

Si necesitas configurar URLs diferentes para producción:

**Crear archivo `.env` en la raíz:**
```env
VITE_API_BASE_URL=https://tu-backend.com/api
VITE_SERVER_URL=https://tu-backend.com
```

### 🐛 Problemas Comunes

#### 1. Error 404 en las imágenes
- **Causa**: El backend no está sirviendo archivos estáticos
- **Solución**: Verificar configuración de Express.js (ver arriba)

#### 2. Error CORS
- **Causa**: El backend no permite peticiones desde localhost:5173
- **Solución**: Configurar CORS en el backend

#### 3. Imágenes se ven como placeholder
- **Causa**: La URL está mal construida o el archivo no existe
- **Solución**: Revisar logs en consola con los emojis 🖼️ y ❌

#### 4. La API funciona pero las imágenes no
- **Causa**: Diferentes rutas para API y archivos estáticos
- **Solución**: Ya está resuelto con `serverURL` separado

### 🎯 Verificación Rápida

Ejecuta esto en la consola del navegador:
```javascript
fetch('http://localhost:3000/uploads/img_1759843074551.jpg')
  .then(res => console.log('Status:', res.status))
  .catch(err => console.error('Error:', err))
```

Si devuelve `Status: 200`, la imagen existe y el backend está configurado correctamente.

### 📝 Logs Útiles

En la consola del navegador deberías ver:
```
🖼️ Foto URL: /uploads/img_1759843074551.jpg → http://localhost:3000/uploads/img_1759843074551.jpg
```

Si ves errores:
```
❌ Error al cargar imagen: http://localhost:3000/uploads/img_1759843074551.jpg
```

Esto indica que:
1. La URL se está construyendo correctamente
2. Pero el archivo no existe o el backend no lo está sirviendo
