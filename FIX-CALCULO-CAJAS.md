# 🔧 Corrección: Cálculo de Cajas para Cantidades Grandes

## 📋 Problema Identificado

Cuando una cotización tenía una referencia con cantidad grande que requería múltiples cajas:

**Ejemplo:**
- Cantidad: 100,000 unidades
- Capacidad: 200 unidades/caja
- Cajas necesarias: 500

**Resultado Incorrecto:** El sistema mostraba solo **1 unidad de carga** en lugar de 500.

### Causa Raíz

El algoritmo anterior sobrescribía el campo `numero_caja` en cada iteración del bucle `while`. Al final, una referencia solo tenía el último número de caja asignado (ej: 500), y el cálculo de unidades de carga solo contaba 1 caja única.

## ✅ Solución Implementada

Se modificó la función `calcularCajasAutomaticamente()` en [EditCotizacion.jsx](src/components/cotizaciones/EditCotizacion.jsx#L138) para:

1. **Crear múltiples registros** cuando una referencia necesita más de una caja
2. Cada registro representa la cantidad específica que va en cada caja
3. Cada registro tiene su propio `numero_caja` único

### Ejemplo de Resultado Correcto

**Entrada:**
- Referencia: "CALIPER BOXER"
- Cantidad total: 100,000 unidades
- Capacidad: 200 unidades/caja

**Salida:**
```
[
  { referencia_id: 1, cantidad: 200, numero_caja: 1 },
  { referencia_id: 1, cantidad: 200, numero_caja: 2 },
  { referencia_id: 1, cantidad: 200, numero_caja: 3 },
  ...
  { referencia_id: 1, cantidad: 200, numero_caja: 500 }
]
```

**Unidades de carga calculadas:** 500 cajas ✅

## 🧪 Cómo Probar

### Prueba 1: Cantidad Grande (El caso reportado)
1. Ir a **Cotizaciones** → **Editar una cotización**
2. Agregar una referencia con:
   - Cantidad: 100,000
   - (La referencia debe tener `cantidad_minima_caja` configurado, ej: 200)
3. Click en **"Calcular Cajas Automáticamente"**
4. Verificar que se crean 500 registros en la tabla
5. Click en **"Auto"** junto a "Unidades de Carga"
6. Verificar que muestra **500** unidades de carga

### Prueba 2: Cantidad Parcial
1. Agregar referencia con cantidad: 550 unidades (capacidad: 200)
2. Calcular cajas
3. Verificar 3 registros:
   - Caja 1: 200 unidades
   - Caja 2: 200 unidades
   - Caja 3: 150 unidades

### Prueba 3: Múltiples Referencias de la Misma Familia
1. Agregar 2 referencias de la misma familia:
   - Ref A: 300 unidades
   - Ref B: 300 unidades
   - Capacidad: 200 unidades/caja
2. Calcular cajas
3. Verificar que se agrupan correctamente:
   - Caja 1: Ref A, 200 unidades
   - Caja 2: Ref A, 100 unidades + Ref B, 100 unidades
   - Caja 3: Ref B, 200 unidades

## 📊 Impacto en Documentos

Los documentos generados (PDF, Excel, Word) ahora mostrarán correctamente:
- Múltiples filas para la misma referencia cuando ocupa varias cajas
- Cada fila con su número de caja correspondiente
- Total de unidades de carga correcto

## 🔄 Cambios en la Interfaz

No hay cambios visuales en la interfaz. El comportamiento es el mismo desde el punto de vista del usuario, excepto que:
- Se verán más filas en la tabla de referencias cuando se calculan cajas
- Cada fila representa la porción que va en cada caja específica

## ⚠️ Consideraciones

- **Referencias sin familia o con capacidad 0:** Siguen asignándose a una caja individual sin dividirse
- **Orden de cajas:** Las referencias se ordenan por número de caja cuando se usa "Ordenar por # Caja"
- **Edición manual:** Los usuarios aún pueden editar manualmente los números de caja y cantidades si lo desean

## 🚀 Branch

Los cambios están en la rama: `fix/calculo-cajas`

Para integrar:
```bash
git checkout master
git merge fix/calculo-cajas
```
