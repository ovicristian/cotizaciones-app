-- ============================================
-- MIGRACIÓN: Agregar campos a cotizaciones
-- Fecha: Diciembre 2024
-- ============================================

-- Agregar nuevas columnas a la tabla cotizaciones
ALTER TABLE cotizaciones 
ADD COLUMN IF NOT EXISTS numero_cotizacion TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS contacto_nombre TEXT,
ADD COLUMN IF NOT EXISTS modo_transporte TEXT,
ADD COLUMN IF NOT EXISTS incoterm TEXT,
ADD COLUMN IF NOT EXISTS peso_total NUMERIC,
ADD COLUMN IF NOT EXISTS unidades_carga INTEGER,
ADD COLUMN IF NOT EXISTS dimension_l NUMERIC,
ADD COLUMN IF NOT EXISTS dimension_w NUMERIC,
ADD COLUMN IF NOT EXISTS dimension_h NUMERIC;

-- Agregar dirección a la tabla clientes
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- Agregar nuevas columnas a la tabla empresa_config
ALTER TABLE empresa_config
ADD COLUMN IF NOT EXISTS banco_nombre TEXT,
ADD COLUMN IF NOT EXISTS banco_cuenta TEXT,
ADD COLUMN IF NOT EXISTS banco_swift TEXT,
ADD COLUMN IF NOT EXISTS banco_aba TEXT;
