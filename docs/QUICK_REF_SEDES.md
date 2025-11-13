# 🚀 Quick Reference - Búsqueda por Sedes

## Archivos Nuevos

```bash
src/modules/venues/
├── types/venue-search.types.ts       # Tipos completos
├── services/venueService.ts          # API service
├── components/SedeCard.tsx           # Card de sede
└── pages/HomePageVenues.tsx          # Nueva homepage

docs/IMPLEMENTACION_BUSQUEDA_SEDES.md # Documentación completa
```

## Archivos Modificados

```bash
src/modules/venues/pages/VenueDetailPage.tsx  # Actualizado con nuevos tipos
src/App.tsx                                    # Rutas nuevas
```

## Rutas

```typescript
/venues/:idSede                        // Detalle de sede
/venues/:idSede/fields/:idCancha       // Detalle de cancha en sede
/sede/:id                              // Legacy (compatible)
/field/:id                             // Legacy (compatible)
```

## Flujo

```
Home → Sede Detail → Field Detail → Checkout → Confirmation
```

## Uso Rápido

### Listar sedes
```typescript
import { venueService } from '@/modules/venues/services/venueService';

const sedes = await venueService.getAllVenues();
```

### Obtener detalle de sede
```typescript
const { sede } = await venueService.getVenueById(1);
```

### Obtener canchas de sede
```typescript
const { canchas } = await venueService.getVenueFields(1);
```

### Navegar a detalle
```typescript
navigate(`/venues/${idSede}`);
```

### Navegar a cancha
```typescript
navigate(`/venues/${idSede}/fields/${idCancha}`);
```

## Componentes

### SedeCard
```tsx
import SedeCard from '@/modules/venues/components/SedeCard';

<SedeCard sede={sedeData} />
```

### HomePageVenues
```tsx
// Importar en App.tsx
import HomePageVenues from '@/modules/venues/pages/HomePageVenues';

<Route path="/venues" element={<HomePageVenues />} />
```

## Tipos Importantes

```typescript
// Sede para listado
SedeCard {
  idSede, nombre, descripcion,
  city, addressLine,
  fotoPrincipal, fotos[],
  estadisticas: {
    totalCanchas,
    precioDesde, precioHasta,
    ratingFinal,
    totalResenasSede, totalResenasCanchas
  }
}

// Detalle completo
SedeDetalle extends SedeCard {
  politicas, NIT, LicenciaFuncionamiento,
  horarioApertura, horarioCierre,
  amenities[]
}

// Cancha de la sede
CanchaResumen {
  idCancha, nombre, superficie,
  precio, ratingPromedio, totalResenas,
  disciplinas[], fotos[]
}
```

## API Endpoints

| Método | Endpoint | Retorna |
|--------|----------|---------|
| GET | `/sedes` | Lista sedes |
| GET | `/sedes/:id` | { sede: SedeDetalle } |
| GET | `/sedes/:id/canchas` | { canchas: CanchaResumen[] } |
| GET | `/califica-sede/sede/:idSede` | { resenas: CalificacionSede[] } |

## Próximos pasos

1. ✅ Tipos creados
2. ✅ Service creado
3. ✅ SedeCard creado
4. ✅ HomePageVenues creado
5. ✅ VenueDetailPage actualizado
6. ✅ Rutas configuradas
7. ⏳ Integrar HomePageVenues como default
8. ⏳ Actualizar Header searchbar placeholder
9. ⏳ Actualizar FieldDetailPage para mostrar breadcrumb
10. ⏳ Componente de mapa real
11. ⏳ Galería de fotos
12. ⏳ Sistema de reviews completo

---
**Status**: ✅ Core implementation complete  
**Testing needed**: Yes  
**Ready for review**: Yes
