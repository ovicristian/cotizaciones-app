-- ============================================
-- Agregar columna codigo_interno a la tabla clientes
-- ============================================
-- Esta columna permite almacenar un código interno
-- único para cada cliente (ej: CLI-001, CLI-002)

ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS codigo_interno TEXT;

-- Crear índice para búsquedas más rápidas por código interno
CREATE INDEX IF NOT EXISTS idx_clientes_codigo_interno 
ON clientes(codigo_interno);

-- Agregar comentario a la columna
COMMENT ON COLUMN clientes.codigo_interno IS 'Código interno asignado al cliente por la empresa';
