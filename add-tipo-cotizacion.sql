-- ============================================
-- Agregar campo tipo a la tabla cotizaciones
-- ============================================
-- Este campo permite diferenciar entre cotizaciones
-- internacionales y nacionales

ALTER TABLE cotizaciones
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'internacional' CHECK (tipo IN ('internacional', 'nacional'));

-- Actualizar registros existentes como internacionales
UPDATE cotizaciones 
SET tipo = 'internacional' 
WHERE tipo IS NULL;

-- Hacer que tasa_cambio sea opcional (solo requerida para internacionales)
ALTER TABLE cotizaciones
ALTER COLUMN tasa_cambio DROP NOT NULL;

-- Agregar campos específicos para cotizaciones nacionales
ALTER TABLE cotizaciones
ADD COLUMN IF NOT EXISTS ciudad_origen TEXT,
ADD COLUMN IF NOT EXISTS ciudad_destino TEXT,
ADD COLUMN IF NOT EXISTS costo_logistica_cop DECIMAL DEFAULT 0;

-- Crear índice para búsquedas por tipo
CREATE INDEX IF NOT EXISTS idx_cotizaciones_tipo 
ON cotizaciones(tipo);

-- Agregar comentarios
COMMENT ON COLUMN cotizaciones.tipo IS 'Tipo de cotización: internacional o nacional';
COMMENT ON COLUMN cotizaciones.ciudad_origen IS 'Ciudad de origen (solo para cotizaciones nacionales)';
COMMENT ON COLUMN cotizaciones.ciudad_destino IS 'Ciudad de destino (solo para cotizaciones nacionales)';
COMMENT ON COLUMN cotizaciones.costo_logistica_cop IS 'Costo de logística en COP para cotizaciones nacionales';
COMMENT ON COLUMN cotizaciones.costo_logistica_usd IS 'Costo de logística en USD para cotizaciones internacionales';
