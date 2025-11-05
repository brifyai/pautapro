-- DIAGNÓSTICO COMPLETO DE ESTRUCTURA DE BASE DE DATOS

-- 1. Verificar estructura de tabla 'plan'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'plan'
ORDER BY ordinal_position;

-- 2. Verificar estructura de tabla 'campania'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'campania'
ORDER BY ordinal_position;

-- 3. Verificar estructura de tabla 'campana_planes'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'campana_planes'
ORDER BY ordinal_position;

-- 4. Contar planes totales
SELECT COUNT(*) as total_planes FROM plan;

-- 5. Contar relaciones campana_planes
SELECT COUNT(*) as total_relaciones FROM campana_planes;

-- 6. Ver todos los planes con su información
SELECT 
  p.id,
  p.nombre_plan,
  p.id_campania,
  p.anio,
  p.mes,
  p.estado,
  p.estado2,
  p.created_at
FROM plan p
LIMIT 20;

-- 7. Ver todas las relaciones campana_planes
SELECT 
  cp.id_campania,
  cp.id_plan,
  p.nombre_plan,
  c.nombrecampania
FROM campana_planes cp
LEFT JOIN plan p ON cp.id_plan = p.id
LEFT JOIN campania c ON cp.id_campania = c.id_campania
LIMIT 20;

-- 8. Verificar si hay planes sin relación en campana_planes
SELECT 
  p.id,
  p.nombre_plan,
  p.id_campania,
  COUNT(cp.id_plan) as relaciones
FROM plan p
LEFT JOIN campana_planes cp ON p.id = cp.id_plan
GROUP BY p.id, p.nombre_plan, p.id_campania
HAVING COUNT(cp.id_plan) = 0;

-- 9. Ver estructura de foreign keys
SELECT 
  constraint_name,
  table_name,
  column_name,
  referenced_table_name,
  referenced_column_name
FROM information_schema.key_column_usage
WHERE table_name IN ('plan', 'campana_planes')
AND referenced_table_name IS NOT NULL;

-- 10. Verificar si la tabla plan tiene campo id_campania
SELECT 
  p.id,
  p.nombre_plan,
  p.id_campania,
  c.id_campania,
  c.nombrecampania
FROM plan p
LEFT JOIN campania c ON p.id_campania = c.id_campania
LIMIT 20;
