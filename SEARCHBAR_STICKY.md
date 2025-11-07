# 🔍 Buscador Sticky - ROGU

## ✅ Implementación Completa

### 📋 Resumen
Se ha creado un componente `SearchBar` minimalista y elegante que se fija en la parte superior de la página al hacer scroll, permitiendo búsquedas rápidas en cualquier momento.

---

## 🎨 Características Implementadas

### 1. **Componente SearchBar Independiente**
- **Ubicación**: `/src/modules/search/components/SearchBar.tsx`
- **Diseño**: Minimalista con inputs compactos y elegantes
- **Campos de búsqueda**:
  - 📍 **Ubicación**: Input de texto con autocomplete visual
  - 📅 **Fecha**: Calendar picker personalizado (30 días hacia adelante)
  - 🕐 **Hora**: Time picker con horarios de 08:00 a 22:00
  - ⚽ **Disciplina**: Selector de deportes (Fútbol, Básquetbol, Tenis, Vóleibol, Pádel, Hockey)

### 2. **Sticky Behavior (Buscador Fijo al Scroll)**
- ✨ Se activa automáticamente al hacer scroll hacia abajo
- 🎭 Animación suave de entrada (`slide-down`)
- 🌫️ Efecto backdrop blur para mejor legibilidad
- 📱 Responsive en todos los dispositivos
- 🔝 Se mantiene visible en la parte superior durante el scroll

### 3. **UI/UX Mejorada**
- **Calendar Picker Bonito**:
  - Grid de 7 columnas (días de la semana)
  - Animación de aparición (`fade-in`)
  - Resaltado del día seleccionado
  - Borde especial para el día actual
  - Hover effects suaves
  - Botón de cierre (X)

- **Time Picker Elegante**:
  - Grid de 3 columnas
  - Scroll vertical con custom scrollbar
  - Selección visual clara
  - Animación de entrada

- **Inputs Minimalistas**:
  - Border radius redondeado (rounded-xl)
  - Background gris suave (gray-50)
  - Focus ring azul elegante
  - Iconos sutiles en color gris
  - Transiciones suaves

### 4. **Funcionalidad de Búsqueda**
- Filtra por **ubicación** (nombre de cancha, ciudad, dirección)
- Filtra por **deporte** (usando valores de `SportType`)
- Preparado para filtros de **fecha** y **hora** (pendiente implementación en API)
- Actualiza resultados en tiempo real

---

## 📂 Archivos Modificados

### 1. `SearchBar.tsx` (Nuevo)
```typescript
interface SearchParams {
  location: string;
  date: string;
  time: string;
  sport: string;
}
```

**Características clave**:
- Hook `useEffect` para sticky scroll listener
- Hook `useEffect` para cerrar dropdowns al hacer clic fuera
- Estado local para manejar calendarios y time pickers
- Animaciones CSS inline para mejor performance
- Custom scrollbar styling

### 2. `HomePage.tsx` (Modificado)
**Cambios**:
- Importa `SearchBar` y `SearchParams`
- Implementa función `handleSearch` que filtra canchas
- Integra SearchBar después del hero section
- Restaura Stats Cards (500+ Canchas, 10K+ Usuarios, 4.8 Rating)
- Mantiene diseño del hero con gradientes y animaciones

### 3. Deportes Alineados con Backend
Actualizado `SPORTS` array para coincidir con `SportType`:
```typescript
'football' | 'basketball' | 'tennis' | 'volleyball' | 'paddle' | 'hockey'
```

---

## 🎯 Cómo Funciona el Sticky

### Lógica de Scroll
```typescript
useEffect(() => {
  const handleScroll = () => {
    if (searchBarRef.current) {
      const offset = searchBarRef.current.offsetTop;
      setIsSticky(window.scrollY > offset + 100);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### Clases Condicionales
```typescript
className={`
  ${isSticky ? 'fixed top-0 left-0 right-0 z-50 animate-slide-down shadow-xl bg-white/95 backdrop-blur-md' : 'relative'}
  transition-all duration-300
`}
```

### Placeholder para Evitar Saltos
Cuando el SearchBar se vuelve `fixed`, se crea un div placeholder para mantener el layout:
```typescript
{isSticky && <div className="h-20" />}
```

---

## 🎨 Animaciones CSS

### Slide Down (Entrada del Sticky)
```css
@keyframes slide-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Fade In (Dropdowns)
```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Custom Scrollbar
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
```

---

## 📱 Responsive Design

### Desktop (>768px)
- Todos los campos visibles en una fila horizontal
- Dropdowns con sombras grandes (shadow-2xl)
- Hover effects completos

### Mobile (<768px)
- Layout adaptado automáticamente por Tailwind
- Campos mantienen funcionalidad completa
- Botón de búsqueda con icono visible

---

## 🔄 Flujo de Uso

1. **Usuario en Hero**: Ve el buscador integrado en el hero section
2. **Scroll hacia abajo**: El buscador se fija en la parte superior
3. **Interacción**:
   - Click en fecha → Abre calendar picker
   - Click en hora → Abre time picker  
   - Selección de deporte → Dropdown nativo estilizado
4. **Búsqueda**: Click en botón o Enter
5. **Filtrado**: Resultados se actualizan en tiempo real

---

## 🚀 Mejoras Futuras Sugeridas

### Corto Plazo
- [ ] Implementar filtros de fecha/hora en backend
- [ ] Agregar autocomplete para ubicación (Google Places API)
- [ ] Persistir búsquedas en localStorage
- [ ] Agregar botón "Limpiar filtros"

### Mediano Plazo
- [ ] Búsqueda por voz
- [ ] Sugerencias de búsquedas populares
- [ ] Historial de búsquedas
- [ ] Búsqueda con geolocalización

### Largo Plazo
- [ ] Machine Learning para recomendaciones
- [ ] Búsqueda semántica con NLP
- [ ] Integración con mapa interactivo

---

## 🐛 Debugging

### Si el sticky no funciona:
1. Verificar que `searchBarRef` esté correctamente asignado
2. Revisar que el scroll listener esté activo
3. Comprobar z-index conflicts

### Si los dropdowns no cierran:
1. Verificar que `calendarRef` y `timePickerRef` estén en los elementos correctos
2. Revisar que el event listener de mousedown esté activo

---

## 📖 Uso del Componente

```tsx
import SearchBar, { type SearchParams } from '../components/SearchBar';

const handleSearch = (params: SearchParams) => {
  console.log('Buscando:', params);
  // Lógica de filtrado
};

<SearchBar onSearch={handleSearch} />
```

---

## ✨ Resumen de Mejoras Visuales

| Antes | Después |
|-------|---------|
| Buscador estático en hero | Buscador sticky que sigue al usuario |
| Inputs simples | Calendar y time pickers elegantes |
| Deportes en español | Deportes con emojis y valores correctos |
| Sin animaciones | Animaciones suaves y profesionales |
| Solo visible arriba | Siempre accesible al hacer scroll |

---

## 🎉 Resultado Final

Un buscador **minimalista**, **elegante** y **funcional** que mejora la experiencia de usuario permitiendo búsquedas rápidas desde cualquier parte de la página. El diseño es consistente con la personalidad de ROGU: moderno, deportivo y fácil de usar.

---

**Implementado por**: Asistente AI  
**Fecha**: 7 de noviembre de 2025  
**Rama**: enrique-v6
