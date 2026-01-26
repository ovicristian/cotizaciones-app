# Feature: Precio FOB con Costo de Logística

## Descripción

Esta funcionalidad permite agregar un **costo de logística** a nivel de cotización que se distribuye proporcionalmente entre todas las unidades de productos, calculando así el **precio FOB** (Free on Board) individual de cada referencia.

## Fecha de Implementación
- **Fecha**: 26 de enero de 2026
- **Rama**: `feature/precio-fob`

## Cambios Realizados

### 1. Base de Datos

**Archivo**: `add-costo-logistica-column.sql`

Se agregó una nueva columna a la tabla `cotizaciones`:

```sql
ALTER TABLE cotizaciones 
ADD COLUMN costo_logistica_usd DECIMAL DEFAULT 0;
```

- **Columna**: `costo_logistica_usd`
- **Tipo**: `DECIMAL`
- **Valor por defecto**: `0`
- **Descripción**: Costo total de logística en USD que se distribuirá entre todas las unidades para calcular el precio FOB

### 2. Formularios de Cotización

**Archivos modificados**:
- `src/components/cotizaciones/CreateCotizacion.jsx`
- `src/components/cotizaciones/EditCotizacion.jsx`

**Cambios**:
- Se agregó el campo `costo_logistica_usd` al estado del formulario
- Se añadió un input en la interfaz para capturar el costo de logística en USD
- El campo se muestra después del campo de "Vigencia"
- Incluye un texto de ayuda: "Costo que se distribuirá entre todas las unidades (precio FOB)"

### 3. Generador de PDF

**Archivo**: `src/utils/pdfGenerator.js`

**Cambios**:

1. **Sección de Información de Logística** (antes de la tabla de productos):
   - Muestra el costo total de logística en USD
   - Muestra el total de unidades
   - Muestra el costo de logística por unidad

2. **Cálculo del Precio FOB**:
   ```javascript
   const costoLogisticaUSD = parseFloat(cotizacion.costo_logistica_usd) || 0
   const totalUnidades = sortedRefs.reduce((sum, ref) => sum + ref.cantidad, 0)
   const costoLogisticaPorUnidad = totalUnidades > 0 ? costoLogisticaUSD / totalUnidades : 0
   
   // Para cada referencia:
   const precioBaseUSD = precioCOP / cotizacion.tasa_cambio
   const precioFOB = precioBaseUSD + costoLogisticaPorUnidad
   ```

3. **Actualización del Encabezado**:
   - La columna "PRECIO UNITARIO" ahora se llama "PRECIO FOB UNITARIO"

### 4. Generador de Excel

**Archivo**: `src/utils/excelGenerator.js`

**Cambios**:

1. **Sección de Información de Logística** (antes de la tabla de productos):
   - Título en celda combinada con formato destacado
   - Tres filas mostrando:
     - Costo Total de Logística / Total Logistics Cost
     - Unidades Totales / Total Units
     - Costo por Unidad / Cost per Unit (con 4 decimales)

2. **Cálculo del Precio FOB**:
   - Mismo algoritmo que en el PDF
   - El precio mostrado incluye el costo de logística distribuido

3. **Actualización del Encabezado**:
   - La columna "PRECIO USD" ahora se llama "PRECIO FOB USD"

### 5. Generador de Word

**Archivo**: `src/utils/wordGenerator.js`

**Cambios**:

1. **Sección de Información de Logística** (antes de la tabla de productos):
   - Se utiliza una función inmediatamente invocada (IIFE) para generar párrafos solo si hay costo de logística
   - Muestra la misma información que en PDF y Excel

2. **Cálculo del Precio FOB**:
   - Mismo algoritmo que en PDF y Excel
   - El cálculo se realiza dentro del map de las referencias

3. **Actualización del Encabezado**:
   - La columna "PRECIO USD" ahora se llama "PRECIO FOB USD"

## Funcionamiento

### Flujo de Cálculo

1. El usuario ingresa un **costo de logística total** en USD al crear/editar una cotización
2. El sistema calcula el **total de unidades** sumando las cantidades de todas las referencias
3. Se calcula el **costo de logística por unidad**: `costo_total / total_unidades`
4. Para cada referencia, se calcula el **precio FOB**:
   - Precio base en USD = Precio COP / Tasa de cambio
   - Precio FOB = Precio base + Costo logística por unidad
5. El precio FOB se muestra en todos los documentos exportados (PDF, Excel, Word)

### Ejemplo

**Datos de entrada**:
- Costo de logística: $500 USD
- Producto A: 100 unidades, precio base $10 USD
- Producto B: 400 unidades, precio base $5 USD
- Total unidades: 500

**Cálculo**:
- Costo por unidad: $500 / 500 = $1 USD
- Precio FOB Producto A: $10 + $1 = $11 USD
- Precio FOB Producto B: $5 + $1 = $6 USD

**Resultado en documentos**:
- Sección de información de logística mostrando el desglose
- Cada producto muestra su precio FOB en la columna "PRECIO FOB UNITARIO"
- El total calculado incluye el costo de logística distribuido

## Beneficios

1. **Transparencia**: El cliente ve claramente el costo de logística y cómo se distribuye
2. **Precio FOB preciso**: Cada unidad absorbe su parte proporcional del costo de logística
3. **Flexibilidad**: Si el costo de logística es $0, funciona como antes
4. **Documentación completa**: Todos los formatos de exportación incluyen esta información

## Migración

Para aplicar estos cambios en una base de datos existente:

```bash
# Ejecutar la migración SQL en Supabase
psql -h [host] -U [user] -d [database] -f add-costo-logistica-column.sql
```

O ejecutar manualmente en el SQL Editor de Supabase:

```sql
ALTER TABLE cotizaciones 
ADD COLUMN costo_logistica_usd DECIMAL DEFAULT 0;
```

## Notas Técnicas

- El campo `costo_logistica_usd` tiene valor por defecto `0`, por lo que las cotizaciones existentes seguirán funcionando normalmente
- Si el costo de logística es `0`, la sección de información de logística no se muestra en los documentos
- El costo por unidad se calcula con 4 decimales para mayor precisión
- El precio FOB final se muestra con 2 decimales en los documentos

## Testing

Para probar esta funcionalidad:

1. Crear una nueva cotización con costo de logística = $0 (debe funcionar como antes)
2. Crear una cotización con costo de logística > $0:
   - Verificar que se muestra la sección de información de logística
   - Verificar que los precios FOB son correctos
   - Generar PDF, Excel y Word y verificar que todos muestren la información correctamente
3. Editar una cotización existente y agregar/modificar el costo de logística
4. Verificar que el cálculo es correcto con diferentes cantidades de productos

## Compatibilidad

✅ Compatible con cotizaciones existentes (costo_logistica_usd = 0 por defecto)
✅ Compatible con todos los formatos de exportación (PDF, Excel, Word)
✅ No afecta otras funcionalidades existentes
