# 🗺️ Implementación de Mapas con Leaflet + MapTiler

## 📦 Componentes Creados

### 1. `MapPicker` - Selector de Ubicación Interactivo
Permite al usuario hacer clic en el mapa para seleccionar coordenadas.

**Uso en formulario de crear cancha:**

```tsx
import MapPicker from '@/components/MapPicker';

const [latitude, setLatitude] = useState<number | null>(null);
const [longitude, setLongitude] = useState<number | null>(null);

<MapPicker
  initialLat={-17.7833}  // Coordenadas iniciales
  initialLng={-63.1821}
  onLocationSelect={(lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  }}
  height="400px"
  zoom={13}
  readonly={false}  // Permite hacer clic para cambiar
/>
```

### 2. `MapView` - Vista de Solo Lectura
Muestra una ubicación fija en el mapa (para mostrar en detalle de cancha).

**Uso en página de detalle:**

```tsx
import MapView from '@/components/MapView';

<MapView
  lat={cancha.latitud}
  lng={cancha.longitud}
  title={cancha.nombre}
  height="300px"
  zoom={15}
/>
```

## 🔑 Configuración de MapTiler

### Paso 1: Obtener API Key

1. Ve a https://www.maptiler.com/
2. Crea una cuenta gratuita
3. Ve a "Account" → "Keys"
4. Copia tu API key

### Paso 2: Configurar en el proyecto

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_MAPTILER_KEY=tu_api_key_aqui
```

## 📍 Ejemplo Completo: Crear Cancha

```tsx
import React, { useState } from 'react';
import MapPicker from '@/components/MapPicker';

const CreateFieldPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    latitud: null as number | null,
    longitud: null as number | null,
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.latitud || !formData.longitud) {
      alert('Por favor selecciona una ubicación en el mapa');
      return;
    }

    // Enviar al backend
    const response = await fetch('/api/canchas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre de la cancha"
        value={formData.nombre}
        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
      />

      <div className="mb-6">
        <label className="block text-sm font-bold mb-2">
          📍 Ubicación en el Mapa
        </label>
        <MapPicker
          initialLat={-17.7833}
          initialLng={-63.1821}
          onLocationSelect={handleLocationSelect}
          height="400px"
        />
        {formData.latitud && formData.longitud && (
          <p className="text-sm text-gray-600 mt-2">
            Coordenadas: {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
          </p>
        )}
      </div>

      <button type="submit">Crear Cancha</button>
    </form>
  );
};
```

## 📍 Ejemplo: Mostrar en Detalle de Cancha

```tsx
import MapView from '@/components/MapView';

const FieldDetailPage = () => {
  const cancha = {
    nombre: "Cancha de Fútbol Premium",
    latitud: -17.7833,
    longitud: -63.1821
  };

  return (
    <div>
      <h1>{cancha.nombre}</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">📍 Ubicación</h2>
        <MapView
          lat={cancha.latitud}
          lng={cancha.longitud}
          title={cancha.nombre}
          height="400px"
        />
      </div>
    </div>
  );
};
```

## 🎨 Props de los Componentes

### MapPicker Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `initialLat` | number | -17.783327 | Latitud inicial |
| `initialLng` | number | -63.182129 | Longitud inicial |
| `onLocationSelect` | (lat, lng) => void | **required** | Callback cuando se selecciona ubicación |
| `height` | string | '400px' | Altura del mapa |
| `zoom` | number | 13 | Nivel de zoom inicial |
| `readonly` | boolean | false | Si es true, no permite seleccionar |

### MapView Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `lat` | number | **required** | Latitud a mostrar |
| `lng` | number | **required** | Longitud a mostrar |
| `title` | string | 'Ubicación' | Título del marcador |
| `height` | string | '300px' | Altura del mapa |
| `zoom` | number | 15 | Nivel de zoom |

## 🌍 Coordenadas Por Defecto (Bolivia)

```typescript
// Ya incluidas en src/config/map.config.ts
LA_PAZ: { lat: -16.5000, lng: -68.1500 }
SANTA_CRUZ: { lat: -17.7833, lng: -63.1821 }
COCHABAMBA: { lat: -17.3935, lng: -66.1570 }
```

## ✨ Características

- ✅ Click para seleccionar ubicación
- ✅ Marcador visual en la posición
- ✅ Muestra coordenadas en tiempo real
- ✅ Link directo a Google Maps
- ✅ Responsive y móvil-friendly
- ✅ Estilos personalizables con Tailwind
- ✅ TypeScript con tipos completos

## 🎯 Próximos Pasos

1. Obtener API key de MapTiler
2. Agregar MapPicker en formulario de crear cancha
3. Agregar MapView en página de detalle de cancha
4. Actualizar tipos del backend para incluir latitud/longitud

¡Listo para usar! 🚀
