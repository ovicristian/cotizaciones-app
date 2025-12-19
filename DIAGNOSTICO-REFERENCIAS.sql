-- ============================================
-- DIAGNÓSTICO Y CORRECCIÓN DE REFERENCIAS
-- ============================================

-- 1. VERIFICAR REFERENCIAS SIN USER_ID
-- Ejecuta esta consulta para ver si hay referencias sin user_id
SELECT 
  id, 
  nombre, 
  user_id,
  created_at
FROM referencias
WHERE user_id IS NULL;

-- 2. CONTAR REFERENCIAS POR USER_ID
-- Esto te ayudará a ver si las referencias están asignadas a diferentes usuarios
SELECT 
  user_id,
  COUNT(*) as total_referencias
FROM referencias
GROUP BY user_id;

-- 3. VER TU USER_ID ACTUAL
-- Ejecuta esto mientras estás autenticado en la aplicación para obtener tu user_id
SELECT auth.uid() as mi_user_id;

-- 4. ASIGNAR REFERENCIAS A TU USUARIO (SI ES NECESARIO)
-- IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con el user_id obtenido en el paso 3
-- Esta consulta asignará TODAS las referencias sin user_id a tu usuario

UPDATE referencias
SET user_id = 'TU_USER_ID_AQUI'
WHERE user_id IS NULL;

-- 5. OPCIÓN ALTERNATIVA: Si necesitas asignar TODAS las referencias a un usuario específico
-- CUIDADO: Esto asignará TODAS las referencias (incluso las de otros usuarios) al usuario especificado
-- Solo usa esto si eres el único usuario del sistema

-- UPDATE referencias
-- SET user_id = 'TU_USER_ID_AQUI';

-- 6. VERIFICAR QUE LAS POLÍTICAS RLS ESTÁN ACTIVAS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'referencias';

-- 7. VER LAS POLÍTICAS ACTIVAS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'referencias';

-- ============================================
-- SOLUCIÓN TEMPORAL (NO RECOMENDADA PARA PRODUCCIÓN)
-- ============================================

-- Si necesitas deshabilitar temporalmente RLS en referencias
-- (NO RECOMENDADO si tienes múltiples usuarios)
-- ALTER TABLE referencias DISABLE ROW LEVEL SECURITY;

-- Para volver a habilitar:
-- ALTER TABLE referencias ENABLE ROW LEVEL SECURITY;
