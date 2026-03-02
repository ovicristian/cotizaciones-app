-- Agregar columna para peso por pieza/unidad a la tabla referencias
-- Diferencia: peso_unitario = peso de la caja completa, peso_pieza = peso de una sola unidad

ALTER TABLE referencias 
ADD COLUMN IF NOT EXISTS peso_pieza DECIMAL;

-- Comentario explicativo
COMMENT ON COLUMN referencias.peso_unitario IS 'Peso total de la caja completa en kilogramos';
COMMENT ON COLUMN referencias.peso_pieza IS 'Peso de una sola pieza/unidad en kilogramos';
