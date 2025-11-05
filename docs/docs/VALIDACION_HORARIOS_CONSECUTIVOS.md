# ⏰ Validación de Horarios Consecutivos en Reservas

## 🎯 Funcionalidad Implementada

El sistema ahora valida que los horarios seleccionados sean **consecutivos** y los une en un solo rango de tiempo.

---

## ✅ Casos Válidos (Permitidos)

### Caso 1: Un solo horario
```
Seleccionado: 10:00 - 11:00
Resultado: ✅ Reserva de 10:00 a 11:00
```

### Caso 2: Horarios consecutivos
```
Seleccionado: 
- 10:00 - 11:00
- 11:00 - 12:00
- 12:00 - 13:00

Resultado: ✅ Reserva de 10:00 a 13:00 (3 horas)
```

### Caso 3: Horarios consecutivos desordenados
```
Seleccionado (en cualquier orden):
- 12:00 - 13:00
- 10:00 - 11:00
- 11:00 - 12:00

Resultado: ✅ Se ordenan automáticamente y se crea reserva de 10:00 a 13:00
```

---

## ❌ Casos Inválidos (No Permitidos)

### Caso 1: Horarios con hueco
```
Seleccionado:
- 10:00 - 11:00
- 11:00 - 12:00
- 14:00 - 15:00  ← Hay un hueco de 12:00 a 14:00

Resultado: ❌ Error: "Los horarios seleccionados deben ser consecutivos"
Acción: El usuario debe hacer 2 reservas separadas:
  1. Reserva 1: 10:00 - 12:00
  2. Reserva 2: 14:00 - 15:00
```

### Caso 2: Dos bloques separados
```
Seleccionado:
- 10:00 - 13:00
- 14:00 - 18:00  ← No es consecutivo con 13:00

Resultado: ❌ Error: "Los horarios seleccionados deben ser consecutivos"
Acción: Hacer 2 reservas separadas
```

---

## 🔧 Cómo Funciona

### Algoritmo de Validación

```typescript
const validateAndMergeTimeSlots = (slots: string[]) => {
  // 1. Parsear todos los slots
  const parsedSlots = slots.map(slot => {
    const [start, end] = slot.split(' - ');
    return { start, end };
  });
  
  // 2. Ordenar por hora de inicio
  parsedSlots.sort((a, b) => a.start.localeCompare(b.start));
  
  // 3. Verificar consecutividad
  for (let i = 0; i < parsedSlots.length - 1; i++) {
    const currentEnd = parsedSlots[i].end;    // ej: "11:00"
    const nextStart = parsedSlots[i + 1].start; // ej: "11:00"
    
    if (currentEnd !== nextStart) {
      return null; // NO consecutivos
    }
  }
  
  // 4. Retornar rango completo
  return {
    startTime: parsedSlots[0].start,
    endTime: parsedSlots[parsedSlots.length - 1].end
  };
};
```

---

## 📊 Ejemplos Paso a Paso

### Ejemplo 1: Horarios Consecutivos ✅

**Input:**
```javascript
selectedTimeSlots = [
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00"
]
```

**Proceso:**
```
1. Parse:
   [{start: "10:00", end: "11:00"},
    {start: "11:00", end: "12:00"},
    {start: "12:00", end: "13:00"}]

2. Ordenar (ya están ordenados)

3. Validar:
   - Slot 1 end (11:00) === Slot 2 start (11:00) ✅
   - Slot 2 end (12:00) === Slot 3 start (12:00) ✅

4. Resultado:
   startTime: "10:00"
   endTime: "13:00"
```

**JSON Enviado:**
```json
{
  "idCliente": 2,
  "idCancha": 5,
  "iniciaEn": "2025-10-16T10:00:00",
  "terminaEn": "2025-10-16T13:00:00",
  "cantidadPersonas": 10,
  ...
}
```

---

### Ejemplo 2: Horarios con Hueco ❌

**Input:**
```javascript
selectedTimeSlots = [
  "10:00 - 11:00",
  "11:00 - 12:00",
  "14:00 - 15:00"  // ← Hueco entre 12:00 y 14:00
]
```

**Proceso:**
```
1. Parse y ordenar

2. Validar:
   - Slot 1 end (11:00) === Slot 2 start (11:00) ✅
   - Slot 2 end (12:00) !== Slot 3 start (14:00) ❌

3. Resultado: null
```

**Acción:**
```
Alert: "Los horarios seleccionados deben ser consecutivos. 
        Por favor, selecciona horarios continuos o haz reservas separadas."
```

---

### Ejemplo 3: Desordenados pero Consecutivos ✅

**Input:**
```javascript
selectedTimeSlots = [
  "12:00 - 13:00",
  "10:00 - 11:00",  // ← Desordenado
  "11:00 - 12:00"
]
```

**Proceso:**
```
1. Parse:
   [{start: "12:00", end: "13:00"},
    {start: "10:00", end: "11:00"},
    {start: "11:00", end: "12:00"}]

2. Ordenar:
   [{start: "10:00", end: "11:00"},
    {start: "11:00", end: "12:00"},
    {start: "12:00", end: "13:00"}]

3. Validar:
   - Slot 1 end (11:00) === Slot 2 start (11:00) ✅
   - Slot 2 end (12:00) === Slot 3 start (12:00) ✅

4. Resultado:
   startTime: "10:00"
   endTime: "13:00"
```

**JSON Enviado:**
```json
{
  "iniciaEn": "2025-10-16T10:00:00",
  "terminaEn": "2025-10-16T13:00:00",
  ...
}
```

---

## 💡 Experiencia de Usuario

### Flujo Exitoso
```
1. Usuario selecciona: 10:00-11:00, 11:00-12:00, 12:00-13:00
2. Click "Confirmar y pagar"
3. ✅ Sistema valida: consecutivos
4. ✅ Crea reserva única: 10:00-13:00
5. ✅ Navega a confirmación
```

### Flujo con Error
```
1. Usuario selecciona: 10:00-12:00, 14:00-15:00
2. Click "Confirmar y pagar"
3. ❌ Sistema valida: NO consecutivos
4. ❌ Muestra alert: "Los horarios deben ser consecutivos"
5. Usuario ajusta selección:
   Opción A: Solo 10:00-12:00 (reserva 1)
   Opción B: Solo 14:00-15:00 (nueva reserva después)
```

---

## 🎨 Mejoras de UX Recomendadas (Futuras)

### 1. Indicador Visual en la Selección
```tsx
// Mostrar un badge si los horarios NO son consecutivos
{!areTimeSlotsConsecutive(selectedTimeSlots) && (
  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
    ⚠️ Los horarios seleccionados no son consecutivos. 
    Deberás hacer reservas separadas.
  </div>
)}
```

### 2. Agrupar Visualmente
```tsx
// En SportFieldDetailPage, mostrar los slots agrupados
Seleccionados:
┌─────────────────────┐
│ 10:00 - 13:00 (3h) │ ✅ Bloque 1
└─────────────────────┘

┌─────────────────────┐
│ 14:00 - 15:00 (1h) │ ⚠️ Bloque 2 (requiere otra reserva)
└─────────────────────┘
```

### 3. Botón de Auto-ajuste
```tsx
<button onClick={selectOnlyConsecutiveSlots}>
  Mantener solo horarios consecutivos
</button>
```

---

## 🧪 Casos de Prueba

### Test 1: Un slot
```
Input: ["10:00 - 11:00"]
Expected: ✅ {startTime: "10:00", endTime: "11:00"}
```

### Test 2: Dos consecutivos
```
Input: ["10:00 - 11:00", "11:00 - 12:00"]
Expected: ✅ {startTime: "10:00", endTime: "12:00"}
```

### Test 3: Tres consecutivos
```
Input: ["10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00"]
Expected: ✅ {startTime: "10:00", endTime: "13:00"}
```

### Test 4: Con hueco
```
Input: ["10:00 - 11:00", "12:00 - 13:00"]
Expected: ❌ null
```

### Test 5: Dos bloques separados
```
Input: ["10:00 - 13:00", "14:00 - 15:00"]
Expected: ❌ null
```

### Test 6: Desordenados pero consecutivos
```
Input: ["12:00 - 13:00", "10:00 - 11:00", "11:00 - 12:00"]
Expected: ✅ {startTime: "10:00", endTime: "13:00"}
```

---

## 📝 Console Logs

Cuando una reserva es exitosa, verás:
```
📝 Enviando reserva: {idCliente: 2, idCancha: 5, ...}
⏰ Horario: 10:00 - 13:00
✅ Reserva creada exitosamente
```

---

## ✅ Beneficios

1. **Prevención de errores**: No se pueden crear reservas con huecos
2. **Simplicidad backend**: Una sola reserva con rango continuo
3. **Claridad UX**: Usuario sabe que debe hacer reservas separadas
4. **Flexibilidad**: Puede reservar 1 hora o 5 horas consecutivas
5. **Validación temprana**: Error se muestra antes de llamar al backend

---

**Última actualización:** 16 de octubre de 2025  
**Archivo:** `src/pages/CheckoutPage.tsx`  
**Estado:** ✅ IMPLEMENTADO
