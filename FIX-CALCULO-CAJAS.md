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

### Cambio 1: Crear Múltiples Registros

Se modificó la función `calcularCajasAutomaticamente()` en [EditCotizacion.jsx](src/components/cotizaciones/EditCotizacion.jsx#L138) para:

1. **Crear múltiples registros** cuando una referencia necesita más de una caja
2. Cada registro representa la cantidad específica que va en cada caja
3. Cada registro tiene su propio `numero_caja` único

### Cambio 2: Actualización Automática de Unidades de Carga

Ahora el botón **"Calcular Cajas Automáticamente"** también:
- Cuenta automáticamente las cajas únicas
- Actualiza el campo **"Unidades de Carga"** sin necesidad de hacer clic en "Auto" por separado

## 🧪 Cómo Probar (PASO A PASO)

### ✅ Prueba del Caso Reportado: 100,000 Unidades

1. **Abrir el navegador** en `http://localhost:5173`
2. **Login** con credenciales de Supabase
3. Ir a **Cotizaciones** → Click en **"Editar"** en cualquier cotización
4. En la sección de **Referencias**:
   - Agregar o seleccionar una referencia que tenga `cantidad_minima_caja` configurado (ej: 200)
   - En el campo **Cantidad**, ingresar: `100000`
5. Click en botón verde **"Calcular Cajas Automáticamente"**

**Resultado Esperado:**
- ✅ La tabla de referencias se expande mostrando **500 filas** (una por cada caja)
- ✅ Cada fila muestra:
  - Cantidad: 200
  - # Caja: números del 1 al 500
- ✅ El campo **"Unidades de Carga"** se actualiza automáticamente a: **500**

**Antes del fix:**
- ❌ Solo 1 fila visible
- ❌ Unidades de carga: 1

### ✅ Prueba 2: Cantidad con Resto (550 unidades)

1. Agregar referencia con cantidad: `550` (capacidad: 200/caja)
2. Click en **"Calcular Cajas Automáticamente"**

**Resultado Esperado:**
- Caja #1: 200 unidades
- Caja #2: 200 unidades  
- Caja #3: 150 unidades
- **Unidades de carga: 3** ✅

### ✅ Prueba 3: Múltiples Productos de Misma Familia

1. Agregar 2 referencias de la **misma familia** (ej: ambos "caliper"):
   - Producto A: 300 unidades
   - Producto B: 300 unidades
   - Capacidad: 200 unidades/caja
2. Click en **"Calcular Cajas Automáticamente"**

**Resultado Esperado:**
- Caja #1: Producto A, 200 unidades
- Caja #2: Producto A, 100 + Producto B, 100 unidades (comparten caja)
- Caja #3: Producto B, 200 unidades
- **Total: 3 cajas** ✅

### ⚠️ Verificar en Documentos Generados

Después de calcular cajas:
1. Click en **"Guardar"**
2. Volver a la lista de cotizaciones
3. Click en **"PDF"** o **"Excel"**

**Verificar que:**
- ✅ Se muestran 500 filas para el producto de 100,000 unidades
- ✅ Cada fila tiene su número de caja correcto
- ✅ Las cantidades son correctas (200 por caja)

## 📊 Impacto Visual en la Interfaz

**IMPORTANTE:** Ahora verás **más filas** en la tabla de referencias después de calcular cajas.

**Antes:**
```
Producto A | 100,000 | # Caja: 500
```

**Ahora:**
```
Producto A | 200 | # Caja: 1
Producto A | 200 | # Caja: 2
Producto A | 200 | # Caja: 3
...
Producto A | 200 | # Caja: 500
```

Esto es **normal y correcto** - cada fila representa el contenido de una caja específica.

## 🔄 Comandos Git

Los cambios están en la rama: `fix/calculo-cajas`

```bash
# Ver los cambios
git log --oneline

# Integrar a master
git checkout master
git merge fix/calculo-cajas
git push origin master
```

## 📝 Resumen de Commits

1. ✅ Corrección principal del algoritmo de cajas
2. ✅ Actualización automática de unidades de carga
3. ✅ Documentación y pruebas

---

**Fecha de implementación:** 26 de enero de 2026  
**Branch:** `fix/calculo-cajas`  
**Archivos modificados:** `EditCotizacion.jsx`
