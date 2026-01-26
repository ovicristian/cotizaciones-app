-- Agregar columna numero_cajas a la tabla cotizacion_referencias
-- Esta columna almacena cuántas cajas ocupa cada referencia

ALTER TABLE cotizacion_referencias 
ADD COLUMN IF NOT EXISTS numero_cajas INTEGER DEFAULT 1;

COMMENT ON COLUMN cotizacion_referencias.numero_cajas IS 'Número de cajas que ocupa esta referencia (calculado automáticamente)';

-- Actualizar registros existentes: calcular numero_cajas basado en cantidad y cantidad_minima_caja
UPDATE cotizacion_referencias cr
SET numero_cajas = CEILING(cr.cantidad::NUMERIC / NULLIF(r.cantidad_minima_caja, 0)::NUMERIC)
FROM referencias r
WHERE cr.referencia_id = r.id 
  AND r.cantidad_minima_caja > 0
  AND cr.numero_cajas IS NULL;

-- Para referencias sin cantidad_minima_caja o con valor 0, establecer 1 caja
UPDATE cotizacion_referencias cr
SET numero_cajas = 1
WHERE numero_cajas IS NULL;
