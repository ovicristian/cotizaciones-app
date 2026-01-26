# Prueba de Cálculo de Cajas

## Problema Identificado
El algoritmo anterior sobrescribía `ref.numero_caja` en cada iteración, causando que solo se contara 1 caja en lugar de múltiples.

## Solución Implementada
Ahora creamos **múltiples registros** cuando una referencia necesita más de una caja.

## Casos de Prueba

### Caso 1: Referencia Grande (El reportado)
**Entrada:**
- Producto: Cualquier referencia de familia "X"
- Cantidad solicitada: 100,000 unidades
- Capacidad por caja: 200 unidades/caja

**Salida Esperada:**
- Total de registros: 500 registros
- Caja #1: 200 unidades
- Caja #2: 200 unidades
- ...
- Caja #500: 200 unidades
- **Unidades de carga calculadas: 500 cajas**

### Caso 2: Cantidad Exacta
**Entrada:**
- Cantidad: 600 unidades
- Capacidad: 200 unidades/caja

**Salida Esperada:**
- 3 registros (cajas 1, 2, 3)
- Cada uno con 200 unidades
- **Unidades de carga: 3 cajas**

### Caso 3: Cantidad con Resto
**Entrada:**
- Cantidad: 550 unidades
- Capacidad: 200 unidades/caja

**Salida Esperada:**
- Caja #1: 200 unidades
- Caja #2: 200 unidades
- Caja #3: 150 unidades (parcial)
- **Unidades de carga: 3 cajas**

### Caso 4: Múltiples Familias
**Entrada:**
- Producto A (familia "caliper"): 1,000 unidades, 200/caja
- Producto B (familia "defensa"): 800 unidades, 100/caja
- Producto C (familia "caliper"): 300 unidades, 200/caja

**Salida Esperada:**
- Producto A:
  - Cajas 1-5 (5 cajas × 200 unidades)
- Producto B:
  - Cajas 6-13 (8 cajas × 100 unidades)
- Producto C:
  - Caja 14: 200 unidades (aprovecha espacio de familia "caliper" existente)
  - Caja 15: 100 unidades (parcial)
- **Total: 15 cajas**

### Caso 5: Sin Familia o Capacidad 0
**Entrada:**
- Producto sin familia: 1,000 unidades

**Salida Esperada:**
- 1 registro con numero_caja asignado
- Cantidad: 1,000 unidades (sin dividir)

## Verificación del Cálculo de Unidades de Carga

La función `calcularUnidadesCarga()` usa:
```javascript
const cajasUnicas = new Set(
  selectedRefs
    .filter(ref => ref.numero_caja && ref.numero_caja !== '')
    .map(ref => parseInt(ref.numero_caja))
)
const totalCajas = cajasUnicas.size
```

Con la nueva implementación:
- Si tenemos 500 registros con numero_caja del 1 al 500
- El Set contendrá: {1, 2, 3, ..., 500}
- **totalCajas = 500** ✅
