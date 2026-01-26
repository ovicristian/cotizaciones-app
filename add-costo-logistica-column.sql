-- Agregar columna para costo de logística en USD a la tabla cotizaciones
-- Esta columna permitirá calcular el precio FOB por unidad distribuyendo este costo

ALTER TABLE cotizaciones 
ADD COLUMN costo_logistica_usd DECIMAL DEFAULT 0;

-- Comentario explicativo
COMMENT ON COLUMN cotizaciones.costo_logistica_usd IS 'Costo total de logística en USD que se distribuirá entre todas las unidades para calcular el precio FOB';
