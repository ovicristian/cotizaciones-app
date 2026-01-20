-- ============================================
-- MIGRACIÓN: Agregar campo codigo_cliente
-- ============================================
-- Este campo permite que cada producto en una cotización
-- tenga un código personalizado según como el cliente lo conoce

ALTER TABLE cotizacion_referencias 
ADD COLUMN codigo_cliente TEXT;

-- Comentario en la columna para documentación
COMMENT ON COLUMN cotizacion_referencias.codigo_cliente IS 
'Código con el cual el cliente identifica este producto';
