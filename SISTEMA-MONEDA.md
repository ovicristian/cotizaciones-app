# 💱 Sistema de Conversión de Moneda - Cotizaciones

## 📋 Cómo Funciona

### **Flujo de Precios:**

1. **Referencias (Productos)** 
   - Se almacenan con `precio_cop` (pesos colombianos)
   - Ejemplo: ACUTRAX = $9,500 COP

2. **Cotizaciones**
   - Cada cotización tiene un campo `tasa_cambio` editable
   - Ejemplo: Tasa = 4,000 (significa $4,000 COP = 1 USD)

3. **Cálculo Final**
   ```
   Precio USD = Precio COP ÷ Tasa de Cambio
   
   Ejemplo:
   - Producto: $9,500 COP
   - Tasa: 4,000
   - Precio USD = 9,500 ÷ 4,000 = $2.375 USD
   ```

---

## 🗃️ Estructura de Base de Datos

### Tabla `referencias`
```sql
CREATE TABLE referencias (
  nombre TEXT,
  descripcion TEXT,
  familia TEXT,
  precio_cop DECIMAL,        -- ⭐ Precio en pesos colombianos
  peso_unitario DECIMAL,
  cantidad_minima_caja INT,
  alto DECIMAL,              -- Dimensiones para empaque
  ancho DECIMAL,
  largo DECIMAL
);
```

### Tabla `cotizaciones`
```sql
CREATE TABLE cotizaciones (
  cliente_id UUID,
  tasa_cambio DECIMAL NOT NULL,  -- ⭐ Tasa COP/USD (ej: 4000)
  vigencia DATE                   -- Fecha hasta cuando es válida
);
```

### Tabla `cotizacion_referencias`
```sql
CREATE TABLE cotizacion_referencias (
  cotizacion_id UUID,
  referencia_id UUID,
  cantidad INT,
  precio_modificado_cop DECIMAL  -- ⭐ Para descuentos (en COP)
);
```

---

## 💡 Casos de Uso

### **Caso 1: Precio Normal**
```javascript
// Referencia en BD: precio_cop = 9500
// Cotización: tasa_cambio = 4000

const precioUSD = 9500 / 4000  // = 2.375 USD
```

### **Caso 2: Precio con Descuento**
```javascript
// Referencia: precio_cop = 9500
// Descuento del 10% aplicado
// precio_modificado_cop = 8550 (9500 - 950)
// Cotización: tasa_cambio = 4000

const precioUSD = 8550 / 4000  // = 2.1375 USD
```

### **Caso 3: Cambiar Tasa de Cambio**
```javascript
// Usuario puede modificar la tasa en cada cotización
// Referencia: precio_cop = 9500

// Tasa 1: 4000
const precio1 = 9500 / 4000  // = 2.375 USD

// Tasa 2: 4200 (si el dólar sube)
const precio2 = 9500 / 4200  // = 2.262 USD
```

---

## 🎯 Implementación en la App

### **En el formulario de Cotización:**

```jsx
<div>
  <label>Tasa de Cambio (COP/USD)</label>
  <input 
    type="number" 
    value={tasaCambio}
    onChange={(e) => setTasaCambio(e.target.value)}
    placeholder="4000"
  />
  <small>Ej: 4000 = $4,000 COP por cada $1 USD</small>
</div>
```

### **Al mostrar productos en cotización:**

```jsx
{referencias.map(ref => {
  const precioCOP = ref.precio_modificado_cop || ref.precio_cop
  const precioUSD = precioCOP / cotizacion.tasa_cambio
  
  return (
    <tr>
      <td>{ref.nombre}</td>
      <td>${precioCOP.toLocaleString('es-CO')} COP</td>
      <td>${precioUSD.toFixed(2)} USD</td>
    </tr>
  )
})}
```

### **En el PDF (Proforma):**

```
ACUTRAX KTM DUKE 200
Precio: $9,500 COP
Tasa: $4,000 COP/USD
───────────────────
Total: $2.38 USD
```

---

## 📊 Ejemplo Completo de Cotización

**Cliente:** Acme Corp (USA)  
**Fecha:** 12/12/2025  
**Tasa de Cambio:** $4,000 COP/USD  
**Vigencia:** 31/12/2025

| Producto | Cant. | Precio COP | Descuento | Precio Final COP | Precio USD |
|----------|-------|------------|-----------|------------------|------------|
| ACUTRAX AA-050A | 10 | $9,500 | 0% | $9,500 | $2.375 |
| LUJO ALB-01 | 150 | $3,300 | 10% | $2,970 | $0.743 |

**Subtotal:** $31.43 USD  
**IVA (si aplica):** $5.97 USD  
**Total:** $37.40 USD

---

## 🔄 Ventajas de este Sistema

✅ **Flexibilidad:** Cada cotización puede tener diferente tasa  
✅ **Descuentos:** Se aplican en COP antes de convertir  
✅ **Histórico:** Las cotizaciones antiguas mantienen su tasa original  
✅ **Actualización:** Referencias se actualizan en COP sin afectar cotizaciones viejas  
✅ **Simplicidad:** El CSV se importa directo con precios en COP

---

## 📝 Notas Importantes

- La tasa de cambio es **editable por cotización**
- Los precios originales en referencias **NUNCA cambian** (siempre COP)
- Los descuentos se aplican **antes** de la conversión a USD
- En el PDF, mostrar tanto COP como USD para claridad
