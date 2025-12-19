# Importación de Productos desde Excel

## Funcionalidad Nueva

Se ha agregado la capacidad de importar productos en masa desde archivos Excel al crear o editar cotizaciones.

## Características

### 1. Descargar Plantilla
- Botón **"Descargar Plantilla"** genera un archivo Excel de ejemplo
- El archivo incluye las columnas necesarias: `CODIGO` y `CANTIDAD`
- Incluye 3 filas de ejemplo para guiar al usuario

### 2. Importar Productos
- Botón **"Seleccionar Archivo"** permite subir un archivo Excel (.xlsx, .xls)
- El sistema busca automáticamente las referencias en la base de datos usando el código
- Acepta columnas con nombres: `CODIGO`, `CÓDIGO`, `CODE`, `REFERENCIA` para el código
- Acepta columnas con nombres: `CANTIDAD`, `QUANTITY`, `QTY`, `CANT` para las cantidades

### 3. Validaciones
- ✅ Verifica que las columnas requeridas existan
- ✅ Busca las referencias por código o nombre
- ✅ Valida que las cantidades sean números positivos
- ✅ Muestra mensajes claros de éxito y error
- ✅ Lista las referencias que no se encontraron

### 4. Resultados
El componente muestra:
- Número de productos importados exitosamente
- Referencias no encontradas (primeras 5, + contador si hay más)
- Errores de validación en cantidades

## Ubicación

La funcionalidad está disponible en:
- **Crear Cotización**: En la sección de Referencias
- **Editar Cotización**: En la sección de Referencias

## Formato del Archivo Excel

```
| CODIGO  | CANTIDAD |
|---------|----------|
| AA-050A | 10       |
| AA-050B | 5        |
| AA-070  | 20       |
```

**IMPORTANTE**: El campo CODIGO debe coincidir exactamente con el nombre de la referencia en la base de datos (ej: AA-050A, AA-050B, etc.)

## Notas Técnicas

- Usa **ExcelJS** para leer/escribir archivos Excel
- Compatible con archivos .xlsx y .xls
- Los productos importados se agregan a la lista existente (no reemplazan)
- Se pueblan automáticamente con los precios de la base de datos
- El campo `numero_caja` se deja vacío para cálculo posterior

## Componente

`ImportProductosExcel.jsx` - Componente reutilizable que se integra en:
- `CreateCotizacion.jsx`
- `EditCotizacion.jsx`
