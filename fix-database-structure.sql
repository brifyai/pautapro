-- ============================================
-- Script para corregir la estructura de la base de datos
-- y hacer el sistema 100% funcional
-- ============================================

-- 1. Agregar campo id_medio a la tabla soportes
ALTER TABLE soportes 
ADD COLUMN IF NOT EXISTS id_medio INTEGER;

-- 2. Agregar campos faltantes a la tabla alternativa
ALTER TABLE alternativa
ADD COLUMN IF NOT EXISTS id_medios INTEGER,
ADD COLUMN IF NOT EXISTS id_plan INTEGER;

-- 3. Crear relaciones entre soportes y medios
-- Basado en el mapeo existente, asignar soportes a medios

-- Radio AM (id_medio = 1)
UPDATE soportes SET id_medio = 1 WHERE id_soporte IN (
    3, 16, 17, 18, 19, 20, 21, 22, 23, 51, 52, 53, 54
);

-- Revista (id_medio = 4)  
UPDATE soportes SET id_medio = 4 WHERE id_soporte IN (
    6, 36, 38, 40, 42
);

-- TV Abierta (id_medio = 9)
UPDATE soportes SET id_medio = 9 WHERE id_soporte IN (
    1, 2, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 24, 26, 28, 30, 44, 45, 46, 47, 48, 49, 50
);

-- Marketing Digital (id_medio = 14)
UPDATE soportes SET id_medio = 14 WHERE id_soporte IN (
    5, 25, 27, 29, 31, 32, 33, 34, 35, 37, 39, 41, 43
);

-- 4. Verificar que todos los soportes tengan un medio asignado
-- Los soportes restantes se asignan al primer medio disponible
UPDATE soportes SET id_medio = 1 WHERE id_medio IS NULL;

-- 5. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_soportes_id_medio ON soportes(id_medio);
CREATE INDEX IF NOT EXISTS idx_alternativa_id_medios ON alternativa(id_medios);
CREATE INDEX IF NOT EXISTS idx_contratos_idmedios ON contratos(idmedios);

-- 6. Actualizar campos de alternativa para que incluyan id_medios
-- Esto se hará cuando se creen las alternativas

-- 7. Verificar la estructura actualizada
SELECT 'soportes' as tabla_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'soportes' AND column_name IN ('id_soporte', 'id_medio')
UNION ALL
SELECT 'alternativa' as tabla_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'alternativa' AND column_name IN ('id', 'id_medios', 'id_plan')
ORDER BY tabla_name, column_name;

-- 8. Mostrar resumen de soportes por medio
SELECT 
    m.nombre_medio,
    COUNT(s.id_soporte) as cantidad_soportes
FROM medios m
LEFT JOIN soportes s ON m.id_medio = s.id_medio
GROUP BY m.id_medio, m.nombre_medio
ORDER BY cantidad_soportes DESC;

-- 9. Mostrar contratos por medio
SELECT 
    m.nombre_medio,
    COUNT(c.id) as cantidad_contratos
FROM medios m
LEFT JOIN contratos c ON m.id_medio = c.idmedios
GROUP BY m.id_medio, m.nombre_medio
ORDER BY cantidad_contratos DESC;