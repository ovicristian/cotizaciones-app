-- Agregar columna para cantidad de cajas a la tabla cotizacion_referencias
-- Esta columna almacena cuántas cajas totales se necesitan para esa referencia

ALTER TABLE cotizacion_referencias 
ADD COLUMN cantidad_cajas INTEGER DEFAULT NULL;

-- Comentario explicativo
COMMENT ON COLUMN cotizacion_referencias.cantidad_cajas IS 'Cantidad total de cajas necesarias para esta referencia (calculada a partir de cantidad / cantidad_minima_caja)';
