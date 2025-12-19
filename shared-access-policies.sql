-- ============================================
-- POLÍTICAS DE ACCESO COMPARTIDO
-- Permite que todos los usuarios accedan a los mismos datos
-- ============================================

-- IMPORTANTE: Ejecutar este script en el SQL Editor de Supabase
-- Esto elimina las políticas actuales y crea nuevas que permiten acceso compartido

-- ============================================
-- ELIMINAR POLÍTICAS ANTIGUAS
-- ============================================

-- Políticas de clientes
DROP POLICY IF EXISTS "Usuarios ven sus clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios crean sus clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios actualizan sus clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios eliminan sus clientes" ON clientes;

-- Políticas de referencias
DROP POLICY IF EXISTS "Usuarios ven sus referencias" ON referencias;
DROP POLICY IF EXISTS "Usuarios crean sus referencias" ON referencias;
DROP POLICY IF EXISTS "Usuarios actualizan sus referencias" ON referencias;
DROP POLICY IF EXISTS "Usuarios eliminan sus referencias" ON referencias;

-- Políticas de cotizaciones
DROP POLICY IF EXISTS "Usuarios ven sus cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Usuarios crean sus cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Usuarios actualizan sus cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Usuarios eliminan sus cotizaciones" ON cotizaciones;

-- Políticas de cotizacion_referencias
DROP POLICY IF EXISTS "Usuarios ven cotizacion_referencias de sus cotizaciones" ON cotizacion_referencias;
DROP POLICY IF EXISTS "Usuarios crean cotizacion_referencias" ON cotizacion_referencias;
DROP POLICY IF EXISTS "Usuarios actualizan cotizacion_referencias" ON cotizacion_referencias;
DROP POLICY IF EXISTS "Usuarios eliminan cotizacion_referencias" ON cotizacion_referencias;

-- Políticas de empresa_config
DROP POLICY IF EXISTS "Usuarios ven su config de empresa" ON empresa_config;
DROP POLICY IF EXISTS "Usuarios crean su config de empresa" ON empresa_config;
DROP POLICY IF EXISTS "Usuarios actualizan su config de empresa" ON empresa_config;
DROP POLICY IF EXISTS "Usuarios eliminan su config de empresa" ON empresa_config;

-- ============================================
-- CREAR NUEVAS POLÍTICAS DE ACCESO COMPARTIDO
-- Todos los usuarios autenticados pueden ver y modificar todos los datos
-- ============================================

-- Políticas para CLIENTES (Acceso compartido)
CREATE POLICY "Todos los usuarios ven todos los clientes"
ON clientes FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios crean clientes"
ON clientes FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios actualizan clientes"
ON clientes FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios eliminan clientes"
ON clientes FOR DELETE
USING (auth.role() = 'authenticated');

-- Políticas para REFERENCIAS (Acceso compartido)
CREATE POLICY "Todos los usuarios ven todas las referencias"
ON referencias FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios crean referencias"
ON referencias FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios actualizan referencias"
ON referencias FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios eliminan referencias"
ON referencias FOR DELETE
USING (auth.role() = 'authenticated');

-- Políticas para COTIZACIONES (Acceso compartido)
CREATE POLICY "Todos los usuarios ven todas las cotizaciones"
ON cotizaciones FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios crean cotizaciones"
ON cotizaciones FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios actualizan cotizaciones"
ON cotizaciones FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios eliminan cotizaciones"
ON cotizaciones FOR DELETE
USING (auth.role() = 'authenticated');

-- Políticas para COTIZACION_REFERENCIAS (Acceso compartido)
CREATE POLICY "Todos los usuarios ven todas las cotizacion_referencias"
ON cotizacion_referencias FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios crean cotizacion_referencias"
ON cotizacion_referencias FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios actualizan cotizacion_referencias"
ON cotizacion_referencias FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios eliminan cotizacion_referencias"
ON cotizacion_referencias FOR DELETE
USING (auth.role() = 'authenticated');

-- Políticas para EMPRESA_CONFIG (Acceso compartido)
CREATE POLICY "Todos los usuarios ven la config de empresa"
ON empresa_config FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios crean config de empresa"
ON empresa_config FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios actualizan config de empresa"
ON empresa_config FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Todos los usuarios eliminan config de empresa"
ON empresa_config FOR DELETE
USING (auth.role() = 'authenticated');

-- ============================================
-- IMPORTANTE: user_id ahora es solo informativo
-- ============================================
-- Los campos user_id en las tablas ahora solo sirven para registrar
-- quién creó/modificó cada registro, pero no restringen el acceso.
-- Todos los usuarios autenticados pueden ver y modificar todos los datos.
