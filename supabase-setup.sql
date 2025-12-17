-- ============================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Cotizaciones Internacionales
-- ============================================

-- Tabla de clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  pais TEXT,
  ciudad TEXT,
  direccion TEXT,
  email TEXT,
  nit TEXT,
  telefono TEXT,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de referencias (productos)
-- IMPORTANTE: precio está en COP (pesos colombianos)
CREATE TABLE referencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  familia TEXT,
  peso_unitario DECIMAL,
  precio_cop DECIMAL, -- Precio en pesos colombianos
  cantidad_minima_caja INT,
  alto DECIMAL, -- Dimensiones para empaque
  ancho DECIMAL,
  largo DECIMAL,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de cotizaciones
-- tasa_cambio: cuántos COP equivalen a 1 USD (ej: 4000 = $4000 COP por cada 1 USD)
CREATE TABLE cotizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_cotizacion TEXT UNIQUE, -- Número de cotización (ej: COT-2024-001)
  cliente_id UUID REFERENCES clientes,
  contacto_nombre TEXT, -- Nombre de la persona de contacto del cliente
  tasa_cambio DECIMAL NOT NULL, -- Tasa de cambio COP/USD
  vigencia DATE,
  modo_transporte TEXT, -- Modo de transporte (Marítimo, Aéreo, Terrestre, Multimodal)
  incoterm TEXT, -- Término de comercio internacional (FOB, CIF, EXW, etc.)
  peso_total NUMERIC, -- Peso total en kilogramos
  unidades_carga INTEGER, -- Número de unidades de carga (pallets, cajas, etc.)
  dimension_l NUMERIC, -- Largo en metros
  dimension_w NUMERIC, -- Ancho en metros
  dimension_h NUMERIC, -- Alto en metros
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);
-- Tabla de relación cotizaciones-referencias
-- precio_modificado_cop: permite aplicar descuentos/ajustes en COP
-- Si es NULL, se usa el precio_cop de la referencia
CREATE TABLE cotizacion_referencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cotizacion_id UUID REFERENCES cotizaciones ON DELETE CASCADE,
  referencia_id UUID REFERENCES referencias,
  cantidad INT,
  precio_modificado_cop DECIMAL, -- Precio ajustado en COP (para descuentos)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de configuración de la empresa
CREATE TABLE empresa_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  nit TEXT,
  vendedor TEXT,
  direccion TEXT,
  ciudad TEXT,
  pais TEXT DEFAULT 'Colombia',
  telefono TEXT,
  email TEXT,
  banco_nombre TEXT,
  banco_cuenta TEXT,
  banco_swift TEXT,
  banco_aba TEXT,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_referencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa_config ENABLE ROW LEVEL SECURITY;

-- Políticas para CLIENTES
CREATE POLICY "Usuarios ven sus clientes"
ON clientes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus clientes"
ON clientes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus clientes"
ON clientes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus clientes"
ON clientes FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para REFERENCIAS
CREATE POLICY "Usuarios ven sus referencias"
ON referencias FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus referencias"
ON referencias FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus referencias"
ON referencias FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus referencias"
ON referencias FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para COTIZACIONES
CREATE POLICY "Usuarios ven sus cotizaciones"
ON cotizaciones FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus cotizaciones"
ON cotizaciones FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus cotizaciones"
ON cotizaciones FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus cotizaciones"
ON cotizaciones FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para COTIZACION_REFERENCIAS
-- Estas necesitan acceso más amplio para permitir joins con cotizaciones
CREATE POLICY "Usuarios ven cotizacion_referencias de sus cotizaciones"
ON cotizacion_referencias FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cotizaciones
    WHERE cotizaciones.id = cotizacion_referencias.cotizacion_id
    AND cotizaciones.user_id = auth.uid()
  )
);

CREATE POLICY "Usuarios crean cotizacion_referencias"
ON cotizacion_referencias FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cotizaciones
    WHERE cotizaciones.id = cotizacion_referencias.cotizacion_id
    AND cotizaciones.user_id = auth.uid()
  )
);

CREATE POLICY "Usuarios actualizan cotizacion_referencias"
ON cotizacion_referencias FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM cotizaciones
    WHERE cotizaciones.id = cotizacion_referencias.cotizacion_id
    AND cotizaciones.user_id = auth.uid()
  )
);

CREATE POLICY "Usuarios eliminan cotizacion_referencias"
ON cotizacion_referencias FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM cotizaciones
    WHERE cotizaciones.id = cotizacion_referencias.cotizacion_id
    AND cotizaciones.user_id = auth.uid()
  )
);

-- Políticas para EMPRESA_CONFIG
CREATE POLICY "Usuarios ven su config de empresa"
ON empresa_config FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean su config de empresa"
ON empresa_config FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan su config de empresa"
ON empresa_config FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan su config de empresa"
ON empresa_config FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ============================================

CREATE INDEX idx_clientes_user_id ON clientes(user_id);
CREATE INDEX idx_referencias_user_id ON referencias(user_id);
CREATE INDEX idx_cotizaciones_user_id ON cotizaciones(user_id);
CREATE INDEX idx_cotizaciones_cliente_id ON cotizaciones(cliente_id);
CREATE INDEX idx_cotizacion_referencias_cotizacion_id ON cotizacion_referencias(cotizacion_id);
CREATE INDEX idx_cotizacion_referencias_referencia_id ON cotizacion_referencias(referencia_id);
CREATE INDEX idx_empresa_config_user_id ON empresa_config(user_id);
