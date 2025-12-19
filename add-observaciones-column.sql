-- Agregar columna de observaciones a la tabla cotizaciones
ALTER TABLE cotizaciones 
ADD COLUMN observaciones TEXT;

-- Comentario descriptivo
COMMENT ON COLUMN cotizaciones.observaciones IS 'Información adicional sobre flete, seguro, puertos, forma de pago, etc.';
