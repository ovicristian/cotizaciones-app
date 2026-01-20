# Feature: Código de Cliente

## Descripción
Se ha agregado un campo "Código de Cliente" a nivel de cada producto/referencia dentro de una cotización. Este campo permite que cada cliente pueda identificar los productos con su propio sistema de códigos.

## Cambios Realizados

### 1. Base de Datos
- **Archivo**: `add-codigo-cliente-column.sql`
- **Cambio**: Se agregó la columna `codigo_cliente` (tipo TEXT) a la tabla `cotizacion_referencias`
- **Acción requerida**: Ejecutar este script SQL en Supabase para aplicar la migración

### 2. Frontend - Creación de Cotizaciones
- **Archivo**: `src/components/cotizaciones/CreateCotizacion.jsx`
- **Cambios**:
  - Agregado campo `codigo_cliente` al estado de cada referencia
  - Nuevo input de texto en el formulario para ingresar el código del cliente
  - El campo se guarda automáticamente en la base de datos al crear la cotización

### 3. Frontend - Edición de Cotizaciones
- **Archivo**: `src/components/cotizaciones/EditCotizacion.jsx`
- **Cambios**:
  - Agregado campo `codigo_cliente` al cargar referencias existentes
  - Nuevo input de texto en el formulario para modificar el código del cliente
  - El campo se actualiza correctamente en la base de datos

### 4. Generadores de Documentos

#### PDF
- **Archivo**: `src/utils/pdfGenerator.js`
- **Cambios**: 
  - Se agregó columna "CÓDIGO CLIENTE" en la tabla de productos
  - Ajuste de anchos de columnas para acomodar el nuevo campo

#### Excel
- **Archivo**: `src/utils/excelGenerator.js`
- **Cambios**:
  - Se agregó columna "CÓDIGO CLIENTE" en la tabla de productos
  - Ajuste de anchos de columnas (A-G en lugar de A-F)
  - Actualizados los totales para usar las columnas correctas

#### Word
- **Archivo**: `src/utils/wordGenerator.js`
- **Cambios**:
  - Se agregó columna "CÓDIGO CLIENTE" en la tabla de productos
  - La tabla ahora tiene 7 columnas en lugar de 6

## Uso

1. Al crear o editar una cotización, verás un nuevo campo "Código Cliente" junto a cada referencia
2. Este campo es **opcional** - puedes dejarlo vacío si el cliente no tiene un código específico para ese producto
3. El código ingresado aparecerá en:
   - La interfaz de usuario al editar la cotización
   - El PDF de la proforma
   - El Excel de la proforma
   - El documento Word de la proforma

## Instrucciones de Deployment

1. **Base de Datos**: Ejecutar el script `add-codigo-cliente-column.sql` en Supabase
2. **Frontend**: Hacer deploy de los cambios (automático si está configurado con Netlify)
3. **Verificación**: Probar creando una nueva cotización y verificar que el campo aparece correctamente

## Branch
Los cambios están en la branch: `feature/codigo-cliente`

Para fusionar con master:
```bash
git checkout master
git merge feature/codigo-cliente
git push origin master
```
